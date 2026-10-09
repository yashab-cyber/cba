from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(String(64), primary_key=True) # e.g. wal_agent_search_01 or wal_treasury
    agent_id = Column(String(64), ForeignKey("agents.id"), nullable=True, unique=True, index=True)
    wallet_type = Column(String(32), default="AGENT", nullable=False) # AGENT, TREASURY, FEE_POOL, BURN, ESCROW
    currency = Column(String(12), default="CBAC", nullable=False)
    cached_balance = Column(Numeric(precision=20, scale=6), default=Decimal("0.000000"), nullable=False)
    status = Column(String(32), default="ACTIVE", nullable=False) # ACTIVE, FROZEN
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    agent = relationship("Agent", back_populates="wallet")
    ledger_account = relationship("LedgerAccount", back_populates="wallet", uselist=False)
    outgoing_transactions = relationship("Transaction", foreign_keys="Transaction.sender_wallet_id", back_populates="sender_wallet")
    incoming_transactions = relationship("Transaction", foreign_keys="Transaction.recipient_wallet_id", back_populates="recipient_wallet")
