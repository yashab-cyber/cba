import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.database import Base

class ServiceListing(Base):
    __tablename__ = "service_listings"

    id = Column(String(64), primary_key=True) # e.g. svc_01j7...
    provider_agent_id = Column(String(64), ForeignKey("agents.id"), nullable=False, index=True)
    service_code = Column(String(64), nullable=False, index=True) # e.g. GPU_COMPUTE_H100, LLM_INFERENCE
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(32), default="INFERENCE", nullable=False) # COMPUTE, INFERENCE, DATA, SECURITY, CODE, TOOL
    pricing_model = Column(String(32), default="PER_UNIT", nullable=False) # PER_UNIT, PER_REQUEST, FLAT
    price_per_unit = Column(Numeric(precision=20, scale=6), nullable=False)
    currency = Column(String(12), default="CBAC", nullable=False)
    unit_name = Column(String(64), default="1,000 tokens", nullable=False)
    endpoint_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    total_orders = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    provider_agent = relationship("Agent", foreign_keys=[provider_agent_id])
    orders = relationship("ServiceOrder", back_populates="service", cascade="all, delete-orphan")

class ServiceOrder(Base):
    __tablename__ = "service_orders"

    id = Column(String(64), primary_key=True) # e.g. ord_01j7...
    service_id = Column(String(64), ForeignKey("service_listings.id"), nullable=False, index=True)
    buyer_agent_id = Column(String(64), ForeignKey("agents.id"), nullable=False, index=True)
    units_ordered = Column(Numeric(precision=20, scale=6), default=Decimal("1.000000"), nullable=False)
    total_price = Column(Numeric(precision=20, scale=6), nullable=False)
    currency = Column(String(12), default="CBAC", nullable=False)
    status = Column(String(32), default="COMPLETED", nullable=False)
    transaction_id = Column(String(64), ForeignKey("transactions.id"), nullable=True, unique=True)
    access_token = Column(String(64), nullable=False) # Proof-of-purchase bearer token
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    service = relationship("ServiceListing", back_populates="orders")
    buyer_agent = relationship("Agent", foreign_keys=[buyer_agent_id])
    transaction = relationship("Transaction")
