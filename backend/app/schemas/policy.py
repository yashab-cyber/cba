from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Union
from pydantic import BaseModel, Field

class SpendingPolicyBase(BaseModel):
    max_amount_per_tx: Decimal = Field(default=Decimal("1000.000000"), ge=0)
    daily_spending_limit: Decimal = Field(default=Decimal("5000.000000"), ge=0)
    monthly_spending_limit: Decimal = Field(default=Decimal("50000.000000"), ge=0)
    human_approval_threshold: Decimal = Field(default=Decimal("2500.000000"), ge=0)
    allowed_counterparties: Union[str, List[str]] = Field(default="ALL")
    emergency_freeze: bool = False

class SpendingPolicyUpdate(BaseModel):
    max_amount_per_tx: Optional[Decimal] = None
    daily_spending_limit: Optional[Decimal] = None
    monthly_spending_limit: Optional[Decimal] = None
    human_approval_threshold: Optional[Decimal] = None
    allowed_counterparties: Optional[Union[str, List[str]]] = None
    emergency_freeze: Optional[bool] = None

class SpendingPolicyResponse(BaseModel):
    id: str
    agent_id: str
    max_amount_per_tx: Decimal
    daily_spending_limit: Decimal
    monthly_spending_limit: Decimal
    human_approval_threshold: Decimal
    allowed_counterparties: Union[str, List[str]]
    emergency_freeze: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
