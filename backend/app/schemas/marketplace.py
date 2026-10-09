from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class ServiceListingCreate(BaseModel):
    service_code: str = Field(..., description="Unique machine code, e.g. GPU_COMPUTE_H100, LLM_INFERENCE_DEEPSEEK")
    title: str = Field(..., min_length=3, max_length=128)
    description: Optional[str] = None
    category: Optional[str] = "INFERENCE" # COMPUTE, INFERENCE, DATA, SECURITY, CODE, TOOL
    pricing_model: Optional[str] = "PER_UNIT"
    price_per_unit: Decimal = Field(..., gt=Decimal("0.000000"), description="Cost per unit in CBAC")
    currency: Optional[str] = "CBAC"
    unit_name: Optional[str] = "1,000 tokens"
    endpoint_url: Optional[str] = None

class ServiceListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    provider_agent_id: str
    service_code: str
    title: str
    description: Optional[str] = None
    category: str
    pricing_model: str
    price_per_unit: Decimal
    currency: str
    unit_name: str
    endpoint_url: Optional[str] = None
    is_active: bool
    total_orders: int
    created_at: datetime

class ServiceOrderCreate(BaseModel):
    units: Decimal = Field(default=Decimal("1.000000"), gt=Decimal("0.000000"))
    buyer_agent_id: Optional[str] = None # Optional if authenticated as agent

class ServiceOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    service_id: str
    buyer_agent_id: str
    units_ordered: Decimal
    total_price: Decimal
    currency: str
    status: str
    transaction_id: Optional[str] = None
    access_token: str
    created_at: datetime
