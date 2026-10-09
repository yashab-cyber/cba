from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class WalletResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agent_id: Optional[str] = None
    wallet_type: str
    currency: str
    cached_balance: Decimal = Field(..., description="Current balance in CBAC")
    status: str
    created_at: datetime
    updated_at: datetime

class WalletBalanceResponse(BaseModel):
    wallet_id: str
    agent_id: Optional[str] = None
    currency: str
    cached_balance: Decimal
    ledger_verified_balance: Decimal
    is_reconciled: bool
    status: str
