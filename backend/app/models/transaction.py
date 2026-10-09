from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True) # e.g. tx_01j7...
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    sender_wallet_id = Column(String(64), ForeignKey("wallets.id"), nullable=False, index=True)
    recipient_wallet_id = Column(String(64), ForeignKey("wallets.id"), nullable=False, index=True)
    amount = Column(Numeric(precision=20, scale=6), nullable=False)
    fee_amount = Column(Numeric(precision=20, scale=6), default=Decimal("0.000000"), nullable=False)
    currency = Column(String(12), default="CBAC", nullable=False)
    status = Column(String(32), default="PENDING", nullable=False) # PENDING, AUTHORIZED, COMPLETED, REJECTED, REVERSED
    transaction_type = Column(String(32), default="TRANSFER", nullable=False) # TRANSFER, MINT, BURN, FEE, REVERSAL, SERVICE_PAYMENT
    reference_tx_id = Column(String(64), ForeignKey("transactions.id"), nullable=True) # for reversals
    description = Column(Text, nullable=True)
    metadata_json = Column(Text, default="{}", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    settled_at = Column(DateTime(timezone=True), nullable=True)

    sender_wallet = relationship("Wallet", foreign_keys=[sender_wallet_id], back_populates="outgoing_transactions")
    recipient_wallet = relationship("Wallet", foreign_keys=[recipient_wallet_id], back_populates="incoming_transactions")
    ledger_entries = relationship("LedgerEntry", back_populates="transaction", cascade="all, delete-orphan")
    reversals = relationship("Transaction", remote_side=[id])
