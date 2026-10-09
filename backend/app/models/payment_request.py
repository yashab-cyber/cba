from datetime import datetime, timezone, timedelta
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class PaymentRequest(Base):
    __tablename__ = "payment_requests"

    id = Column(String(64), primary_key=True) # e.g. pr_01j7...
    requester_agent_id = Column(String(64), ForeignKey("agents.id"), nullable=False, index=True)
    payer_agent_id = Column(String(64), ForeignKey("agents.id"), nullable=False, index=True)
    amount = Column(Numeric(precision=20, scale=6), nullable=False)
    currency = Column(String(12), default="CBAC", nullable=False)
    service_code = Column(String(64), nullable=False) # e.g. LLM_INFERENCE, GPU_COMPUTE, DATA_RETRIEVAL
    service_description = Column(Text, nullable=True)
    status = Column(String(32), default="PENDING", nullable=False) # PENDING, APPROVED, REJECTED, EXPIRED, FULFILLED
    transaction_id = Column(String(64), ForeignKey("transactions.id"), nullable=True, unique=True)
    expires_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc) + timedelta(hours=24), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    requester_agent = relationship("Agent", foreign_keys=[requester_agent_id], back_populates="requested_payments")
    payer_agent = relationship("Agent", foreign_keys=[payer_agent_id], back_populates="invoiced_payments")
    transaction = relationship("Transaction")
