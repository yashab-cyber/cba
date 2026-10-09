import json
import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk import RiskAlert
from app.models.governance import GovernanceProposal, GovernanceSignature
from app.models.user import User
from app.schemas.phase3 import (
    RiskAlertResponse, MerkleProofResponse, MerkleVerifyRequest, MerkleVerifyResponse,
    FXConvertRequest, FXConvertResponse, GovernanceProposalCreate, GovernanceProposalResponse
)
from app.services.merkle_service import MerkleService
from app.services.risk_service import RiskService
from app.services.fx_service import FXService
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/advanced", tags=["Phase 3: Advanced Infrastructure & Risk Engine"])

# --- Merkle Cryptographic Verification Endpoints ---

@router.get("/merkle-root")
def get_merkle_root(db: Session = Depends(get_db)):
    root, count = MerkleService.compute_merkle_root(db)
    return {
        "merkle_root": root,
        "total_ledger_entries": count,
        "hash_algorithm": "SHA-256",
        "description": "Cryptographic tree root of all historical double-entry ledger journals"
    }

@router.get("/merkle-proof/{entry_id}", response_model=MerkleProofResponse)
def get_merkle_proof(entry_id: str, db: Session = Depends(get_db)):
    proof = MerkleService.generate_proof(db, entry_id)
    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ledger entry '{entry_id}' not found or ledger is empty"
        )
    return MerkleProofResponse(**proof)

@router.post("/verify-merkle-proof", response_model=MerkleVerifyResponse)
def verify_merkle_proof(payload: MerkleVerifyRequest):
    proof_dicts = [{"position": step.position, "hash": step.hash} for step in payload.proof_path]
    current = payload.leaf_hash
    for step in proof_dicts:
        if step["position"] == "right":
            current = MerkleService._hash_pair(current, step["hash"])
        else:
            current = MerkleService._hash_pair(step["hash"], current)

    is_valid = (current == payload.merkle_root)
    return MerkleVerifyResponse(
        is_valid=is_valid,
        computed_root=current,
        expected_root=payload.merkle_root,
        verification_message="CRYPTOGRAPHIC_PROOF_VERIFIED" if is_valid else "PROOF_VERIFICATION_FAILED"
    )

# --- Risk & Anomaly Detection Endpoints ---

@router.get("/risk-alerts", response_model=List[RiskAlertResponse])
def list_risk_alerts(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = RiskService.list_alerts(db, status=status_filter)
    return [RiskAlertResponse.model_validate(a) for a in alerts]

@router.post("/risk-alerts/{alert_id}/resolve", response_model=RiskAlertResponse)
def resolve_risk_alert(
    alert_id: str,
    decision: str = "RESOLVED",
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    try:
        alert = RiskService.resolve_alert(db, alert_id, current_user.id, decision)
        return RiskAlertResponse.model_validate(alert)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

# --- Multi-Currency FX Engine ---

@router.get("/currencies")
def get_supported_currencies():
    return FXService.get_supported_currencies()

@router.post("/convert", response_model=FXConvertResponse)
def convert_currency(payload: FXConvertRequest):
    try:
        converted, rate = FXService.convert(
            payload.from_currency,
            payload.to_currency,
            payload.amount
        )
        return FXConvertResponse(
            from_currency=payload.from_currency.upper(),
            to_currency=payload.to_currency.upper(),
            original_amount=payload.amount,
            converted_amount=converted,
            effective_rate=rate
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# --- Multi-Party Governance M-of-N Proposals ---

@router.get("/proposals", response_model=List[GovernanceProposalResponse])
def list_proposals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proposals = db.query(GovernanceProposal).order_by(GovernanceProposal.created_at.desc()).all()
    return [GovernanceProposalResponse.model_validate(p) for p in proposals]

@router.post("/proposals", response_model=GovernanceProposalResponse, status_code=status.HTTP_201_CREATED)
def create_proposal(
    payload: GovernanceProposalCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    proposal_id = f"prop_{uuid.uuid4().hex[:14]}"
    proposal = GovernanceProposal(
        id=proposal_id,
        proposer_id=current_user.id,
        action_type=payload.action_type.upper(),
        payload_json=json.dumps(payload.payload),
        required_approvals=payload.required_approvals,
        current_approvals_count=1,
        status="PENDING"
    )
    db.add(proposal)
    # Record initial proposer signature
    sig = GovernanceSignature(
        id=f"sig_{uuid.uuid4().hex[:14]}",
        proposal_id=proposal_id,
        signer_id=current_user.id,
        decision="APPROVE",
        comments="Proposer initial authorization"
    )
    db.add(sig)
    db.commit()
    db.refresh(proposal)
    return GovernanceProposalResponse.model_validate(proposal)

@router.post("/proposals/{proposal_id}/sign", response_model=GovernanceProposalResponse)
def sign_proposal(
    proposal_id: str,
    decision: str = "APPROVE",
    comments: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    proposal = db.query(GovernanceProposal).filter(GovernanceProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Proposal '{proposal_id}' not found")

    existing_sig = db.query(GovernanceSignature).filter(
        GovernanceSignature.proposal_id == proposal_id,
        GovernanceSignature.signer_id == current_user.id
    ).first()
    if existing_sig:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Operator has already voted on this proposal")

    sig = GovernanceSignature(
        id=f"sig_{uuid.uuid4().hex[:14]}",
        proposal_id=proposal.id,
        signer_id=current_user.id,
        decision=decision.upper(),
        comments=comments
    )
    db.add(sig)

    if decision.upper() == "APPROVE":
        proposal.current_approvals_count += 1
        if proposal.current_approvals_count >= proposal.required_approvals:
            proposal.status = "APPROVED"

    db.commit()
    db.refresh(proposal)
    return GovernanceProposalResponse.model_validate(proposal)
