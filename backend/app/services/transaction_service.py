import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.wallet import Wallet
from app.models.agent import Agent
from app.models.transaction import Transaction
from app.models.ledger import LedgerEntry
from app.services.ledger_service import LedgerService, InsufficientFundsError, LedgerImbalanceError
from app.services.policy_engine import PolicyEngine, PolicyViolationError
from app.services.audit_service import AuditService
from app.config import settings

class TransactionService:
    @staticmethod
    def calculate_fee(amount: Decimal, transaction_type: str) -> Decimal:
        if transaction_type in ["MINT", "BURN", "TREASURY_ALLOCATION"]:
            return Decimal("0.000000")
        fee = amount * settings.DEFAULT_TRANSACTION_FEE_PERCENT
        if fee < settings.MINIMUM_TRANSACTION_FEE:
            fee = settings.MINIMUM_TRANSACTION_FEE
        return fee.quantize(Decimal("0.000001"))

    @classmethod
    def execute_payment(
        cls,
        db: Session,
        sender_wallet: Wallet,
        recipient_wallet: Wallet,
        amount: Decimal,
        idempotency_key: str,
        description: Optional[str] = None,
        service_code: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        actor_id: Optional[str] = None,
        bypass_policy: bool = False
    ) -> Tuple[Transaction, List[LedgerEntry], bool]:
        """
        Executes an atomic payment with double-entry journal entries and idempotency.
        Returns:
            (transaction, ledger_entries, is_idempotent_replay)
        """
        amount = Decimal(str(amount)).quantize(Decimal("0.000001"))
        if amount <= Decimal("0.000000"):
            raise ValueError("Payment amount must be greater than zero")

        # 1. Idempotency Check
        existing_tx = db.query(Transaction).filter(Transaction.idempotency_key == idempotency_key).first()
        if existing_tx:
            entries = db.query(LedgerEntry).filter(LedgerEntry.transaction_id == existing_tx.id).all()
            return existing_tx, entries, True

        # 2. Wallet Status Validation
        if sender_wallet.status != "ACTIVE":
            raise ValueError(f"Sender wallet {sender_wallet.id} is {sender_wallet.status}")
        if recipient_wallet.status != "ACTIVE":
            raise ValueError(f"Recipient wallet {recipient_wallet.id} is {recipient_wallet.status}")

        # 3. Fee calculation
        tx_type = "SERVICE_PAYMENT" if service_code else "TRANSFER"
        fee = cls.calculate_fee(amount, tx_type)

        # 4. Check policy limits if sender is an agent
        sender_agent = sender_wallet.agent
        recipient_agent = recipient_wallet.agent
        requires_human_approval = False

        if sender_agent and not bypass_policy:
            is_allowed, reason, requires_human_approval = PolicyEngine.evaluate_payment(
                db, sender_agent, recipient_agent, amount, fee
            )
            if not is_allowed:
                raise PolicyViolationError(reason)

            # 4.1 Evaluate Anomaly & Risk Engine
            from app.services.risk_service import RiskService
            risk_score, severity, anomaly_type, action_taken = RiskService.evaluate_payment_risk(
                db=db,
                sender_wallet=sender_wallet,
                recipient_wallet=recipient_wallet,
                amount=amount
            )
            if action_taken == "AGENT_AUTO_FROZEN":
                raise PolicyViolationError(f"High-Risk Transaction Blocked (Risk Score: {risk_score}/100, Anomaly: {anomaly_type}). Agent automatically frozen.")

        # 5. Create Transaction Record
        tx_id = f"tx_{uuid.uuid4().hex[:18]}"
        initial_status = "PENDING_APPROVAL" if requires_human_approval else "COMPLETED"

        tx = Transaction(
            id=tx_id,
            idempotency_key=idempotency_key,
            sender_wallet_id=sender_wallet.id,
            recipient_wallet_id=recipient_wallet.id,
            amount=amount,
            fee_amount=fee,
            currency="CBAC",
            status=initial_status,
            transaction_type=tx_type,
            description=description or f"Payment from {sender_wallet.id} to {recipient_wallet.id}",
            metadata_json=str(metadata or {}),
            created_at=datetime.now(timezone.utc),
            settled_at=datetime.now(timezone.utc) if not requires_human_approval else None
        )
        db.add(tx)
        db.flush()

        # If payment exceeds approval threshold, hold in pending state without posting journal entries yet
        if requires_human_approval:
            AuditService.log_event(
                db=db,
                actor_type="AGENT" if sender_agent else "SYSTEM",
                actor_id=sender_agent.id if sender_agent else "SYSTEM",
                action="PAYMENT_HELD_FOR_APPROVAL",
                resource_type="TRANSACTION",
                resource_id=tx_id,
                details={"amount": str(amount), "threshold_exceeded": True}
            )
            db.commit()
            return tx, [], False

        # 6. Post Double-Entry Journal Entries
        sender_acc = LedgerService.get_account_by_wallet_id(db, sender_wallet.id)
        recipient_acc = LedgerService.get_account_by_wallet_id(db, recipient_wallet.id)
        fee_acc = LedgerService.get_or_create_system_account(
            db=db,
            account_number=settings.ACCOUNT_FEE_POOL,
            account_type="REVENUE",
            normal_balance="CREDIT",
            description="Central Bank Fee Collection Pool"
        )

        # Debits and Credits
        journal_entries = [
            (sender_acc, "DEBIT", amount + fee),
            (recipient_acc, "CREDIT", amount)
        ]
        if fee > Decimal("0.000000"):
            journal_entries.append((fee_acc, "CREDIT", fee))

        created_entries = LedgerService.record_journal_entries(db, tx.id, journal_entries)

        # Log audit event
        AuditService.log_event(
            db=db,
            actor_type="AGENT" if sender_agent else "SYSTEM",
            actor_id=actor_id or (sender_agent.id if sender_agent else "SYSTEM"),
            action="EXECUTE_PAYMENT",
            resource_type="TRANSACTION",
            resource_id=tx.id,
            details={
                "amount": str(amount),
                "fee": str(fee),
                "sender_wallet": sender_wallet.id,
                "recipient_wallet": recipient_wallet.id
            }
        )

        db.commit()
        return tx, created_entries, False

    @classmethod
    def approve_transaction(cls, db: Session, transaction_id: str, operator_id: str) -> Transaction:
        """Approves a high-value transaction that was held for human approval."""
        tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not tx:
            raise ValueError(f"Transaction {transaction_id} not found")
        if tx.status != "PENDING_APPROVAL":
            raise ValueError(f"Transaction is in status {tx.status}, expected PENDING_APPROVAL")

        sender_wallet = db.query(Wallet).filter(Wallet.id == tx.sender_wallet_id).first()
        recipient_wallet = db.query(Wallet).filter(Wallet.id == tx.recipient_wallet_id).first()

        sender_acc = LedgerService.get_account_by_wallet_id(db, sender_wallet.id)
        recipient_acc = LedgerService.get_account_by_wallet_id(db, recipient_wallet.id)
        fee_acc = LedgerService.get_or_create_system_account(
            db=db,
            account_number=settings.ACCOUNT_FEE_POOL,
            account_type="REVENUE",
            normal_balance="CREDIT",
            description="Central Bank Fee Collection Pool"
        )

        journal_entries = [
            (sender_acc, "DEBIT", tx.amount + tx.fee_amount),
            (recipient_acc, "CREDIT", tx.amount)
        ]
        if tx.fee_amount > Decimal("0.000000"):
            journal_entries.append((fee_acc, "CREDIT", tx.fee_amount))

        LedgerService.record_journal_entries(db, tx.id, journal_entries)

        tx.status = "COMPLETED"
        tx.settled_at = datetime.now(timezone.utc)
        db.add(tx)

        AuditService.log_event(
            db=db,
            actor_type="USER",
            actor_id=operator_id,
            action="APPROVE_TRANSACTION",
            resource_type="TRANSACTION",
            resource_id=tx.id,
            details={"approved_amount": str(tx.amount)}
        )

        db.commit()
        return tx
