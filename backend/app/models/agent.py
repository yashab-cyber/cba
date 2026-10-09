import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String(64), primary_key=True) # e.g. agent_search_01
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(32), default="ACTIVE", nullable=False) # ACTIVE, SUSPENDED, REVOKED
    public_key = Column(Text, nullable=True) # For future Ed25519 signature verification
    metadata_json = Column(Text, default="{}", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", back_populates="agents")
    credentials = relationship("AgentCredential", back_populates="agent", cascade="all, delete-orphan")
    wallet = relationship("Wallet", back_populates="agent", uselist=False, cascade="all, delete-orphan")
    spending_policy = relationship("SpendingPolicy", back_populates="agent", uselist=False, cascade="all, delete-orphan")
    requested_payments = relationship("PaymentRequest", foreign_keys="PaymentRequest.requester_agent_id", back_populates="requester_agent")
    invoiced_payments = relationship("PaymentRequest", foreign_keys="PaymentRequest.payer_agent_id", back_populates="payer_agent")

class AgentCredential(Base):
    __tablename__ = "agent_credentials"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String(64), ForeignKey("agents.id"), nullable=False, index=True)
    key_prefix = Column(String(16), nullable=False) # e.g. cba_live_a1b2
    key_hash = Column(String(64), nullable=False, index=True) # SHA-256 hash
    scopes = Column(String(255), default="wallets:read,payments:create,invoices:create", nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    agent = relationship("Agent", back_populates="credentials")
