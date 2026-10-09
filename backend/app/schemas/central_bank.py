from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field

class MintRequest(BaseModel):
    amount: Decimal = Field(..., gt=Decimal("0.000000"), description="Amount of CBAC to mint into Treasury")
    reason: str = Field(..., min_length=5, description="Administrative justification for monetary expansion")

class AllocateRequest(BaseModel):
    recipient_agent_id: str = Field(..., description="Agent ID to receive initial capital from Treasury")
    amount: Decimal = Field(..., gt=Decimal("0.000000"), description="Amount of CBAC to transfer from Treasury")
    reason: Optional[str] = Field("Initial economic grant / operational compute budget", description="Grant justification")

class BurnRequest(BaseModel):
    source_agent_id: str = Field(..., description="Agent ID whose wallet will be debited for retirement")
    amount: Decimal = Field(..., gt=Decimal("0.000000"), description="Amount of CBAC to permanently retire")
    reason: str = Field(..., min_length=5, description="Administrative justification for monetary contraction")

class MonetarySupplyResponse(BaseModel):
    currency: str
    total_issued: Decimal
    circulating_in_agents: Decimal
    treasury_reserve: Decimal
    fee_pool_revenue: Decimal
    burned_total: Decimal
    total_assets: Decimal
    total_liabilities_and_equity: Decimal
    is_monetary_equation_balanced: bool
    active_agents_count: int
    total_transactions_count: int

class ReconciliationReportResponse(BaseModel):
    is_balanced: bool
    total_debits: Decimal
    total_credits: Decimal
    net_imbalance: Decimal
    cached_vs_ledger_discrepancies_count: int
    total_ledger_entries_verified: int
    accounts_audited: int
    audit_timestamp: datetime
    discrepancy_details: List[str]
    status: str
