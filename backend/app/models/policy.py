import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class SpendingPolicy(Base):
    __tablename__ = "spending_policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String(64), ForeignKey("agents.id"), unique=True, nullable=False, index=True)
    
    # Financial Policy Limits in CBAC
    max_amount_per_tx = Column(Numeric(precision=20, scale=6), default=Decimal("1000.000000"), nullable=False)
    daily_spending_limit = Column(Numeric(precision=20, scale=6), default=Decimal("5000.000000"), nullable=False)
    monthly_spending_limit = Column(Numeric(precision=20, scale=6), default=Decimal("50000.000000"), nullable=False)
    human_approval_threshold = Column(Numeric(precision=20, scale=6), default=Decimal("2500.000000"), nullable=False)
    
    # Counterparty Allowlist: "ALL" or JSON list of agent IDs: '["agent_coder_02", "agent_gpu_03"]'
    allowed_counterparties_json = Column(Text, default="\"ALL\"", nullable=False)
    
    # Emergency circuit-breaker
    emergency_freeze = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    agent = relationship("Agent", back_populates="spending_policy")
