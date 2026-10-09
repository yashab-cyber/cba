from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

class PaymentRequestCreate(BaseModel):
    payer_agent_id: str = Field(..., description="The agent responsible for paying this invoice")
    amount: Decimal = Field(..., gt=Decimal("0.000000"), description="Invoice amount in CBAC")
    service_code: str = Field(..., description="Standard service code, e.g. LLM_INFERENCE, GPU_COMPUTE, DATASET_ACCESS")
    service_description: Optional[str] = Field(None, description="Detailed explanation of work completed or service delivered")
    expires_in_hours: Optional[int] = Field(default=24, ge=1, le=720)

class PaymentRequestResponse(BaseModel):
    id: str
    requester_agent_id: str
    payer_agent_id: str
    amount: Decimal
    currency: str
    service_code: str
    service_description: Optional[str] = None
    status: str
    transaction_id: Optional[str] = None
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentRequestActionResponse(BaseModel):
    request_id: str
    status: str
    message: str
    transaction_id: Optional[str] = None
