import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(String(64), primary_key=True)
    agent_id = Column(String(64), ForeignKey("agents.id"), nullable=False, index=True)
    transaction_id = Column(String(64), ForeignKey("transactions.id"), nullable=True, index=True)
    risk_score = Column(Integer, nullable=False) # 0 to 100
    severity = Column(String(32), default="MEDIUM", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    anomaly_type = Column(String(64), nullable=False) # VELOCITY_BURST, DRAIN_ATTEMPT, UNKNOWN_COUNTERPARTY_SPIKE
    details_json = Column(Text, nullable=True)
    status = Column(String(32), default="ACTIVE", nullable=False) # ACTIVE, RESOLVED, FALSE_POSITIVE
    action_taken = Column(String(64), default="LOGGED", nullable=False) # LOGGED, TRANSACTION_BLOCKED, AGENT_AUTO_FROZEN
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    agent = relationship("Agent")
    transaction = relationship("Transaction")
