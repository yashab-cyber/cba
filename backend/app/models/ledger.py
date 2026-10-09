import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class LedgerAccount(Base):
    __tablename__ = "ledger_accounts"

    id = Column(String(64), primary_key=True) # e.g. acc_treasury or acc_wal_01
    account_number = Column(String(64), unique=True, index=True, nullable=False) # e.g. 1000_ASSET_CENTRAL_RESERVE
    wallet_id = Column(String(64), ForeignKey("wallets.id"), nullable=True, unique=True, index=True)
    account_type = Column(String(32), nullable=False) # ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    normal_balance = Column(String(8), nullable=False) # DEBIT, CREDIT
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    wallet = relationship("Wallet", back_populates="ledger_account")
    entries = relationship("LedgerEntry", back_populates="ledger_account")

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id = Column(String(64), primary_key=True) # e.g. ent_01j...
    transaction_id = Column(String(64), ForeignKey("transactions.id"), nullable=False, index=True)
    ledger_account_id = Column(String(64), ForeignKey("ledger_accounts.id"), nullable=False, index=True)
    entry_type = Column(String(8), nullable=False) # DEBIT, CREDIT
    amount = Column(Numeric(precision=20, scale=6), nullable=False) # Positive amount
    previous_entry_hash = Column(String(64), nullable=True)
    entry_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    transaction = relationship("Transaction", back_populates="ledger_entries")
    ledger_account = relationship("LedgerAccount", back_populates="entries")
