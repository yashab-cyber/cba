import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.wallet import Wallet
from app.models.agent import Agent
from app.models.transaction import Transaction
from app.models.ledger import LedgerAccount, LedgerEntry
from app.services.ledger_service import LedgerService
from app.services.audit_service import AuditService
from app.schemas.central_bank import MonetarySupplyResponse, ReconciliationReportResponse
from app.config import settings

class CentralBankService:
    @classmethod
    def get_or_create_system_wallets(cls, db: Session) -> Dict[str, Wallet]:
        wallets = {}
        for w_type, w_id in [
            ("TREASURY", "wal_central_treasury"),
            ("FEE_POOL", "wal_central_fee_pool"),
            ("BURN", "wal_central_burn_pool")
        ]:
            wallet = db.query(Wallet).filter(Wallet.id == w_id).first()
            if not wallet:
                wallet = Wallet(
                    id=w_id,
                    wallet_type=w_type,
                    currency="CBAC",
                    cached_balance=Decimal("0.000000"),
                    status="ACTIVE"
                )
                db.add(wallet)
                db.flush()
                # Create corresponding ledger account
                acc_num = {
                    "TREASURY": settings.ACCOUNT_TREASURY_CAPITAL,
                    "FEE_POOL": settings.ACCOUNT_FEE_POOL,
                    "BURN": settings.ACCOUNT_BURN_POOL
                }[w_type]
                acc_type = "EQUITY" if w_type in ["TREASURY", "BURN"] else "REVENUE"
                LedgerService.get_or_create_system_account(
                    db=db,
                    account_number=acc_num,
                    account_type=acc_type,
                    normal_balance="CREDIT",
                    description=f"System {w_type} Account",
                    wallet_id=wallet.id
                )
            wallets[w_type] = wallet
        
        # Also ensure Reserve Asset account exists
        LedgerService.get_or_create_system_account(
            db=db,
            account_number=settings.ACCOUNT_CENTRAL_RESERVE,
            account_type="ASSET",
            normal_balance="DEBIT",
            description="Central Reserve Proof of Asset Backing"
        )
        db.commit()
        return wallets

    @classmethod
    def mint_credits(cls, db: Session, amount: Decimal, reason: str, operator_id: str) -> Transaction:
        """
        Mints new CBAC into the Central Bank Treasury.
        Accounting:
            DEBIT  1000 - Central Reserve (Asset)
            CREDIT 3000 - Mint Treasury (Equity)
        """
        cls.get_or_create_system_wallets(db)
        amount = Decimal(str(amount)).quantize(Decimal("0.000001"))
        
        reserve_acc = db.query(LedgerAccount).filter(LedgerAccount.account_number == settings.ACCOUNT_CENTRAL_RESERVE).first()
        treasury_acc = db.query(LedgerAccount).filter(LedgerAccount.account_number == settings.ACCOUNT_TREASURY_CAPITAL).first()
        treasury_wallet = db.query(Wallet).filter(Wallet.id == "wal_central_treasury").first()

        tx_id = f"tx_mint_{uuid.uuid4().hex[:14]}"
        tx = Transaction(
            id=tx_id,
            idempotency_key=f"mint_{tx_id}",
            sender_wallet_id=treasury_wallet.id, # Nominal sender is Treasury creation
            recipient_wallet_id=treasury_wallet.id,
            amount=amount,
            fee_amount=Decimal("0.000000"),
            currency="CBAC",
            status="COMPLETED",
            transaction_type="MINT",
            description=f"Monetary Expansion: {reason}",
            metadata_json=f'{{"reason": "{reason}", "operator": "{operator_id}"}}',
            created_at=datetime.now(timezone.utc),
            settled_at=datetime.now(timezone.utc)
        )
        db.add(tx)
        db.flush()

        journal_entries = [
            (reserve_acc, "DEBIT", amount),
            (treasury_acc, "CREDIT", amount)
        ]
        LedgerService.record_journal_entries(db, tx.id, journal_entries)

        AuditService.log_event(
            db=db,
            actor_type="USER",
            actor_id=operator_id,
            action="MINT_CURRENCY",
            resource_type="CENTRAL_BANK",
            resource_id=tx.id,
            details={"amount": str(amount), "reason": reason}
        )

        db.commit()
        return tx

    @classmethod
    def allocate_from_treasury(cls, db: Session, recipient_agent_id: str, amount: Decimal, reason: str, operator_id: str) -> Transaction:
        """
        Allocates CBAC from Central Bank Treasury to an AI Agent's wallet.
        Accounting:
            DEBIT  3000 - Mint Treasury (Equity)
            CREDIT 2000_wal_agent - Agent Deposit (Liability)
        """
        cls.get_or_create_system_wallets(db)
        amount = Decimal(str(amount)).quantize(Decimal("0.000001"))

        recipient_agent = db.query(Agent).filter(Agent.id == recipient_agent_id).first()
        if not recipient_agent:
            raise ValueError(f"Agent {recipient_agent_id} not found")

        treasury_acc = db.query(LedgerAccount).filter(LedgerAccount.account_number == settings.ACCOUNT_TREASURY_CAPITAL).first()
        agent_acc = LedgerService.get_account_by_wallet_id(db, recipient_agent.wallet.id)

        tx_id = f"tx_alloc_{uuid.uuid4().hex[:14]}"
        tx = Transaction(
            id=tx_id,
            idempotency_key=f"alloc_{tx_id}",
            sender_wallet_id="wal_central_treasury",
            recipient_wallet_id=recipient_agent.wallet.id,
            amount=amount,
            fee_amount=Decimal("0.000000"),
            currency="CBAC",
            status="COMPLETED",
            transaction_type="MINT",
            description=f"Treasury Allocation: {reason}",
            metadata_json=f'{{"reason": "{reason}", "recipient_agent": "{recipient_agent_id}"}}',
            created_at=datetime.now(timezone.utc),
            settled_at=datetime.now(timezone.utc)
        )
        db.add(tx)
        db.flush()

        journal_entries = [
            (treasury_acc, "DEBIT", amount),
            (agent_acc, "CREDIT", amount)
        ]
        LedgerService.record_journal_entries(db, tx.id, journal_entries)

        AuditService.log_event(
            db=db,
            actor_type="USER",
            actor_id=operator_id,
            action="ALLOCATE_TREASURY_FUNDS",
            resource_type="AGENT",
            resource_id=recipient_agent_id,
            details={"amount": str(amount), "reason": reason}
        )

        db.commit()
        return tx

    @classmethod
    def burn_credits(cls, db: Session, source_agent_id: str, amount: Decimal, reason: str, operator_id: str) -> Transaction:
        """
        Retires CBAC from an agent wallet, removing it permanently from circulation.
        Accounting:
            DEBIT  2000_wal_agent - Agent Deposit (Liability)
            CREDIT 3100 - Burn Account (Equity Reduction)
        """
        cls.get_or_create_system_wallets(db)
        amount = Decimal(str(amount)).quantize(Decimal("0.000001"))

        agent = db.query(Agent).filter(Agent.id == source_agent_id).first()
        if not agent:
            raise ValueError(f"Agent {source_agent_id} not found")

        agent_acc = LedgerService.get_account_by_wallet_id(db, agent.wallet.id)
        burn_acc = db.query(LedgerAccount).filter(LedgerAccount.account_number == settings.ACCOUNT_BURN_POOL).first()

        tx_id = f"tx_burn_{uuid.uuid4().hex[:14]}"
        tx = Transaction(
            id=tx_id,
            idempotency_key=f"burn_{tx_id}",
            sender_wallet_id=agent.wallet.id,
            recipient_wallet_id="wal_central_burn_pool",
            amount=amount,
            fee_amount=Decimal("0.000000"),
            currency="CBAC",
            status="COMPLETED",
            transaction_type="BURN",
            description=f"Monetary Contraction / Burn: {reason}",
            metadata_json=f'{{"reason": "{reason}", "source_agent": "{source_agent_id}"}}',
            created_at=datetime.now(timezone.utc),
            settled_at=datetime.now(timezone.utc)
        )
        db.add(tx)
        db.flush()

        journal_entries = [
            (agent_acc, "DEBIT", amount),
            (burn_acc, "CREDIT", amount)
        ]
        LedgerService.record_journal_entries(db, tx.id, journal_entries)

        AuditService.log_event(
            db=db,
            actor_type="USER",
            actor_id=operator_id,
            action="BURN_CURRENCY",
            resource_type="CENTRAL_BANK",
            resource_id=tx.id,
            details={"amount": str(amount), "reason": reason, "source_agent": source_agent_id}
        )

        db.commit()
        return tx

    @classmethod
    def get_monetary_supply(cls, db: Session) -> MonetarySupplyResponse:
        cls.get_or_create_system_wallets(db)

        # Asset: Central Reserve
        reserve_acc = db.query(LedgerAccount).filter(LedgerAccount.account_number == settings.ACCOUNT_CENTRAL_RESERVE).first()
        total_reserve = LedgerService.compute_account_balance(db, reserve_acc.id) if reserve_acc else Decimal("0.000000")

        # Circulating in agent wallets
        circulating = db.query(func.coalesce(func.sum(Wallet.cached_balance), Decimal("0.000000")))\
            .filter(Wallet.wallet_type == "AGENT").scalar()
        circulating = Decimal(str(circulating))

        # Treasury balance
        treasury_wallet = db.query(Wallet).filter(Wallet.id == "wal_central_treasury").first()
        treasury_bal = Decimal(str(treasury_wallet.cached_balance)) if treasury_wallet else Decimal("0.000000")

        # Fee pool revenue
        fee_wallet = db.query(Wallet).filter(Wallet.id == "wal_central_fee_pool").first()
        fee_bal = Decimal(str(fee_wallet.cached_balance)) if fee_wallet else Decimal("0.000000")

        # Burn pool
        burn_wallet = db.query(Wallet).filter(Wallet.id == "wal_central_burn_pool").first()
        burn_bal = Decimal(str(burn_wallet.cached_balance)) if burn_wallet else Decimal("0.000000")

        active_agents = db.query(Agent).filter(Agent.status == "ACTIVE").count()
        total_txs = db.query(Transaction).count()

        total_assets = total_reserve
        total_liabilities_and_equity = circulating + treasury_bal + fee_bal + burn_bal
        is_balanced = (total_assets == total_liabilities_and_equity)

        return MonetarySupplyResponse(
            currency="CBAC",
            total_issued=total_reserve,
            circulating_in_agents=circulating,
            treasury_reserve=treasury_bal,
            fee_pool_revenue=fee_bal,
            burned_total=burn_bal,
            total_assets=total_assets,
            total_liabilities_and_equity=total_liabilities_and_equity,
            is_monetary_equation_balanced=is_balanced,
            active_agents_count=active_agents,
            total_transactions_count=total_txs
        )

    @classmethod
    def audit_reconciliation(cls, db: Session) -> ReconciliationReportResponse:
        """Audits every single ledger entry and compares cached balances against ledger calculations."""
        cls.get_or_create_system_wallets(db)

        total_debits = db.query(func.coalesce(func.sum(LedgerEntry.amount), Decimal("0.000000")))\
            .filter(LedgerEntry.entry_type == "DEBIT").scalar()
        total_credits = db.query(func.coalesce(func.sum(LedgerEntry.amount), Decimal("0.000000")))\
            .filter(LedgerEntry.entry_type == "CREDIT").scalar()

        total_debits = Decimal(str(total_debits))
        total_credits = Decimal(str(total_credits))
        imbalance = total_debits - total_credits

        # Verify all wallets
        wallets = db.query(Wallet).all()
        discrepancies = []
        for w in wallets:
            if not w.ledger_account:
                continue
            recomputed = LedgerService.compute_account_balance(db, w.ledger_account.id)
            cached = Decimal(str(w.cached_balance))
            if recomputed != cached:
                discrepancies.append(
                    f"Wallet {w.id} mismatch: cached={cached} vs ledger_computed={recomputed}"
                )

        entries_count = db.query(LedgerEntry).count()
        accounts_count = db.query(LedgerAccount).count()

        is_balanced = (imbalance == Decimal("0.000000") and len(discrepancies) == 0)

        return ReconciliationReportResponse(
            is_balanced=is_balanced,
            total_debits=total_debits,
            total_credits=total_credits,
            net_imbalance=imbalance,
            cached_vs_ledger_discrepancies_count=len(discrepancies),
            total_ledger_entries_verified=entries_count,
            accounts_audited=accounts_count,
            audit_timestamp=datetime.now(timezone.utc),
            discrepancy_details=discrepancies,
            status="VERIFIED_IN_BALANCE" if is_balanced else "AUDIT_FAILED_IMBALANCE_FOUND"
        )
