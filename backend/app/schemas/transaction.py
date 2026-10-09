from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class PaymentCreate(BaseModel):
    recipient_agent_id: Optional[str] = Field(None, description="Target recipient agent ID")
    recipient_wallet_id: Optional[str] = Field(None, description="Direct target recipient wallet ID")
    amount: Decimal = Field(..., gt=Decimal("0.000000"), description="Payment amount in CBAC")
    description: Optional[str] = Field(None, description="Human/Agent readable note or invoice reference")
    service_code: Optional[str] = Field(None, description="Optional service code, e.g. API_INFERENCE, GPU_COMPUTE")
    metadata: Optional[Dict[str, Any]] = None

class LedgerEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    ledger_account_id: str
    account_number: Optional[str] = None
    account_type: Optional[str] = None
    entry_type: str # DEBIT, CREDIT
    amount: Decimal
    entry_hash: Optional[str] = None
    created_at: datetime

class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    idempotency_key: str
    sender_wallet_id: str
    recipient_wallet_id: str
    sender_agent_id: Optional[str] = None
    recipient_agent_id: Optional[str] = None
    amount: Decimal
    fee_amount: Decimal
    currency: str
    status: str
    transaction_type: str
    reference_tx_id: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    settled_at: Optional[datetime] = None

class TransactionReceiptResponse(BaseModel):
    transaction: TransactionResponse
    ledger_entries: List[LedgerEntryResponse]
    sender_balance_after: Optional[Decimal] = None
    recipient_balance_after: Optional[Decimal] = None
    verification_status: str = "SETTLED_DOUBLE_ENTRY_BALANCED"
