import uuid
import hashlib
from decimal import Decimal
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.models.ledger import LedgerAccount, LedgerEntry
from app.models.wallet import Wallet
from app.config import settings

class LedgerImbalanceError(Exception):
    """Raised when sum of debits does not equal sum of credits."""
    pass

class InsufficientFundsError(Exception):
    """Raised when an account does not have sufficient balance to settle a debit."""
    pass

class AccountNotFoundError(Exception):
    """Raised when a specified ledger account does not exist."""
    pass

class LedgerService:
    @staticmethod
    def get_or_create_system_account(
        db: Session,
        account_number: str,
        account_type: str,
        normal_balance: str,
        description: str,
        wallet_id: Optional[str] = None
    ) -> LedgerAccount:
        acc = db.query(LedgerAccount).filter(LedgerAccount.account_number == account_number).first()
        if not acc:
            acc = LedgerAccount(
                id=f"acc_{account_number.lower().replace('-', '_')}",
                account_number=account_number,
                wallet_id=wallet_id,
                account_type=account_type,
                normal_balance=normal_balance,
                description=description
            )
            db.add(acc)
            db.flush()
        return acc

    @staticmethod
    def get_account_by_wallet_id(db: Session, wallet_id: str) -> LedgerAccount:
        acc = db.query(LedgerAccount).filter(LedgerAccount.wallet_id == wallet_id).first()
        if not acc:
            wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
            if not wallet:
                raise AccountNotFoundError(f"Wallet {wallet_id} not found")
            # Create corresponding ledger account
            acc = LedgerAccount(
                id=f"acc_{wallet_id}",
                account_number=f"2000_{wallet_id}",
                wallet_id=wallet_id,
                account_type="LIABILITY" if wallet.wallet_type == "AGENT" else "EQUITY",
                normal_balance="CREDIT",
                description=f"Ledger account for wallet {wallet_id}"
            )
            db.add(acc)
            db.flush()
        return acc

    @staticmethod
    def compute_account_balance(db: Session, account_id: str) -> Decimal:
        """
        Recomputes exact account balance directly from immutable ledger entries.
        For ASSET: balance = sum(DEBITS) - sum(CREDITS)
        For LIABILITY, EQUITY, REVENUE: balance = sum(CREDITS) - sum(DEBITS)
        """
        account = db.query(LedgerAccount).filter(LedgerAccount.id == account_id).first()
        if not account:
            raise AccountNotFoundError(f"Account {account_id} not found")

        total_debits = db.query(func.coalesce(func.sum(LedgerEntry.amount), Decimal("0.000000")))\
            .filter(LedgerEntry.ledger_account_id == account_id, LedgerEntry.entry_type == "DEBIT").scalar()
        
        total_credits = db.query(func.coalesce(func.sum(LedgerEntry.amount), Decimal("0.000000")))\
            .filter(LedgerEntry.ledger_account_id == account_id, LedgerEntry.entry_type == "CREDIT").scalar()

        total_debits = Decimal(str(total_debits))
        total_credits = Decimal(str(total_credits))

        if account.account_type == "ASSET":
            return total_debits - total_credits
        else:
            # LIABILITY, EQUITY, REVENUE
            return total_credits - total_debits

    @classmethod
    def record_journal_entries(
        cls,
        db: Session,
        transaction_id: str,
        entries: List[Tuple[LedgerAccount, str, Decimal]]  # List of (account, 'DEBIT'|'CREDIT', amount)
    ) -> List[LedgerEntry]:
        """
        Atomically records double-entry journal entries for a transaction.
        Enforces zero-sum balance and updates cached balances.
        """
        total_debits = Decimal("0.000000")
        total_credits = Decimal("0.000000")
        
        # Verify inputs and calculate sums
        for account, entry_type, amount in entries:
            amt = Decimal(str(amount)).quantize(Decimal("0.000001"))
            if amt <= Decimal("0.000000"):
                raise ValueError(f"Entry amount must be positive, got {amt}")
            if entry_type == "DEBIT":
                total_debits += amt
            elif entry_type == "CREDIT":
                total_credits += amt
            else:
                raise ValueError(f"Invalid entry_type: {entry_type}")

        # The Double-Entry Invariant: Debits MUST equal Credits
        if total_debits != total_credits:
            raise LedgerImbalanceError(
                f"Ledger imbalance detected: total_debits={total_debits} != total_credits={total_credits}"
            )

        # Retrieve the latest ledger entry hash for cryptographic chaining
        latest_entry = db.query(LedgerEntry).order_by(LedgerEntry.created_at.desc(), LedgerEntry.id.desc()).first()
        prev_hash = latest_entry.entry_hash if latest_entry and latest_entry.entry_hash else "GENESIS_BLOCK_00000000000000000000000000000000"

        created_entries = []
        for account, entry_type, amount in entries:
            amt = Decimal(str(amount)).quantize(Decimal("0.000001"))
            entry_id = f"ent_{uuid.uuid4().hex[:18]}"
            
            # Compute entry hash
            raw_hash_content = f"{entry_id}:{transaction_id}:{account.id}:{entry_type}:{amt}:{prev_hash}"
            entry_hash = hashlib.sha256(raw_hash_content.encode("utf-8")).hexdigest()

            entry = LedgerEntry(
                id=entry_id,
                transaction_id=transaction_id,
                ledger_account_id=account.id,
                entry_type=entry_type,
                amount=amt,
                previous_entry_hash=prev_hash,
                entry_hash=entry_hash
            )
            db.add(entry)
            created_entries.append(entry)
            prev_hash = entry_hash

            # If this account is linked to a wallet, update the cached balance
            if account.wallet_id:
                wallet = db.query(Wallet).filter(Wallet.id == account.wallet_id).with_for_update().first() if db.bind.dialect.name != "sqlite" else db.query(Wallet).filter(Wallet.id == account.wallet_id).first()
                if wallet:
                    current_bal = Decimal(str(wallet.cached_balance))
                    if account.account_type in ["LIABILITY", "EQUITY", "REVENUE"]:
                        # Normal balance is credit
                        if entry_type == "CREDIT":
                            new_bal = current_bal + amt
                        else: # DEBIT reduces liability
                            new_bal = current_bal - amt
                    else: # ASSET
                        if entry_type == "DEBIT":
                            new_bal = current_bal + amt
                        else:
                            new_bal = current_bal - amt

                    # For agent liability wallets, prevent negative balance
                    if wallet.wallet_type == "AGENT" and new_bal < Decimal("0.000000"):
                        raise InsufficientFundsError(
                            f"Wallet {wallet.id} has insufficient funds. Current: {current_bal}, Required debit: {amt}"
                        )
                    wallet.cached_balance = new_bal
                    db.add(wallet)

        db.flush()
        return created_entries
