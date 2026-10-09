from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.wallet import WalletResponse
from app.schemas.policy import SpendingPolicyResponse, SpendingPolicyBase

class AgentCreate(BaseModel):
    id: str = Field(..., description="Unique alphanumeric identifier, e.g. agent_search_01", min_length=3, max_length=64)
    name: str = Field(..., min_length=2, max_length=128)
    description: Optional[str] = None
    initial_policy: Optional[SpendingPolicyBase] = None
    initial_funding: Optional[Decimal] = Field(default=Decimal("0.000000"), ge=0, description="Optional initial CBAC allocation from Treasury")
    metadata: Optional[Dict[str, Any]] = None

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AgentResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    description: Optional[str] = None
    status: str
    public_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    wallet_id: Optional[str] = None
    cached_balance: Optional[Decimal] = None

    class Config:
        from_attributes = True

class AgentDetailResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    description: Optional[str] = None
    status: str
    public_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    wallet: Optional[WalletResponse] = None
    spending_policy: Optional[SpendingPolicyResponse] = None

class AgentCredentialResponse(BaseModel):
    agent_id: str
    raw_api_key: Optional[str] = Field(None, description="Only returned once at generation time")
    key_prefix: str
    scopes: str
    expires_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime
