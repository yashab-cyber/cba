import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from app.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_type = Column(String(32), nullable=False) # USER, AGENT, SYSTEM
    actor_id = Column(String(64), nullable=False, index=True)
    action = Column(String(64), nullable=False, index=True) # e.g. MINT_CURRENCY, UPDATE_POLICY, SUSPEND_AGENT
    resource_type = Column(String(64), nullable=False) # WALLET, POLICY, AGENT, TRANSACTION
    resource_id = Column(String(64), nullable=False, index=True)
    ip_address = Column(String(64), nullable=True)
    details_json = Column(Text, default="{}", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
