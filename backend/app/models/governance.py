import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class GovernanceProposal(Base):
    __tablename__ = "governance_proposals"

    id = Column(String(64), primary_key=True) # prop_01...
    proposer_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    action_type = Column(String(64), nullable=False) # MINT_EXPANSION, RETIRE_BURN, EMERGENCY_HALT
    payload_json = Column(Text, nullable=False)
    required_approvals = Column(Integer, default=2, nullable=False)
    current_approvals_count = Column(Integer, default=1, nullable=False)
    status = Column(String(32), default="PENDING", nullable=False) # PENDING, APPROVED, EXECUTED, REJECTED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    executed_at = Column(DateTime(timezone=True), nullable=True)

    proposer = relationship("User")
    signatures = relationship("GovernanceSignature", back_populates="proposal", cascade="all, delete-orphan")

class GovernanceSignature(Base):
    __tablename__ = "governance_signatures"

    id = Column(String(64), primary_key=True) # sig_01...
    proposal_id = Column(String(64), ForeignKey("governance_proposals.id"), nullable=False, index=True)
    signer_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    decision = Column(String(32), default="APPROVE", nullable=False) # APPROVE, REJECT
    comments = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    proposal = relationship("GovernanceProposal", back_populates="signatures")
    signer = relationship("User")
