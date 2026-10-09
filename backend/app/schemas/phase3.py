from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class RiskAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agent_id: str
    transaction_id: Optional[str] = None
    risk_score: int
    severity: str
    anomaly_type: str
    details_json: Optional[str] = None
    status: str
    action_taken: str
    created_at: datetime

class MerkleProofStep(BaseModel):
    position: str # left or right
    hash: str

class MerkleProofResponse(BaseModel):
    entry_id: str
    leaf_hash: str
    merkle_root: str
    total_entries: int
    proof_path: List[MerkleProofStep]

class MerkleVerifyRequest(BaseModel):
    leaf_hash: str
    merkle_root: str
    proof_path: List[MerkleProofStep]

class MerkleVerifyResponse(BaseModel):
    is_valid: bool
    computed_root: str
    expected_root: str
    verification_message: str

class FXConvertRequest(BaseModel):
    from_currency: str
    to_currency: str
    amount: Decimal = Field(..., gt=Decimal("0.000000"))

class FXConvertResponse(BaseModel):
    from_currency: str
    to_currency: str
    original_amount: Decimal
    converted_amount: Decimal
    effective_rate: Decimal

class GovernanceProposalCreate(BaseModel):
    action_type: str # MINT_EXPANSION, RETIRE_BURN, EMERGENCY_HALT
    payload: Dict[str, Any]
    required_approvals: int = 2

class GovernanceProposalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    proposer_id: str
    action_type: str
    payload_json: str
    required_approvals: int
    current_approvals_count: int
    status: str
    created_at: datetime
    executed_at: Optional[datetime] = None
