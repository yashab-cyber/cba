from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.central_bank import (
    MintRequest, AllocateRequest, BurnRequest, MonetarySupplyResponse, ReconciliationReportResponse
)
from app.schemas.transaction import TransactionResponse
from app.services.central_bank_service import CentralBankService
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/central-bank", tags=["Central Bank Monetary Authority"])

@router.get("/supply", response_model=MonetarySupplyResponse)
def get_monetary_supply(db: Session = Depends(get_db)):
    return CentralBankService.get_monetary_supply(db)

@router.post("/mint", response_model=TransactionResponse)
def mint_currency(
    payload: MintRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    try:
        tx = CentralBankService.mint_credits(
            db=db,
            amount=payload.amount,
            reason=payload.reason,
            operator_id=current_user.id
        )
        return TransactionResponse(
            id=tx.id,
            idempotency_key=tx.idempotency_key,
            sender_wallet_id=tx.sender_wallet_id,
            recipient_wallet_id=tx.recipient_wallet_id,
            sender_agent_id=None,
            recipient_agent_id=None,
            amount=tx.amount,
            fee_amount=tx.fee_amount,
            currency=tx.currency,
            status=tx.status,
            transaction_type=tx.transaction_type,
            reference_tx_id=tx.reference_tx_id,
            description=tx.description,
            created_at=tx.created_at,
            settled_at=tx.settled_at
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/allocate", response_model=TransactionResponse)
def allocate_treasury_capital(
    payload: AllocateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    try:
        tx = CentralBankService.allocate_from_treasury(
            db=db,
            recipient_agent_id=payload.recipient_agent_id,
            amount=payload.amount,
            reason=payload.reason or "Treasury Allocation Grant",
            operator_id=current_user.id
        )
        return TransactionResponse(
            id=tx.id,
            idempotency_key=tx.idempotency_key,
            sender_wallet_id=tx.sender_wallet_id,
            recipient_wallet_id=tx.recipient_wallet_id,
            sender_agent_id=None,
            recipient_agent_id=payload.recipient_agent_id,
            amount=tx.amount,
            fee_amount=tx.fee_amount,
            currency=tx.currency,
            status=tx.status,
            transaction_type=tx.transaction_type,
            reference_tx_id=tx.reference_tx_id,
            description=tx.description,
            created_at=tx.created_at,
            settled_at=tx.settled_at
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/burn", response_model=TransactionResponse)
def burn_currency(
    payload: BurnRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    try:
        tx = CentralBankService.burn_credits(
            db=db,
            source_agent_id=payload.source_agent_id,
            amount=payload.amount,
            reason=payload.reason,
            operator_id=current_user.id
        )
        return TransactionResponse(
            id=tx.id,
            idempotency_key=tx.idempotency_key,
            sender_wallet_id=tx.sender_wallet_id,
            recipient_wallet_id=tx.recipient_wallet_id,
            sender_agent_id=payload.source_agent_id,
            recipient_agent_id=None,
            amount=tx.amount,
            fee_amount=tx.fee_amount,
            currency=tx.currency,
            status=tx.status,
            transaction_type=tx.transaction_type,
            reference_tx_id=tx.reference_tx_id,
            description=tx.description,
            created_at=tx.created_at,
            settled_at=tx.settled_at
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/reconciliation", response_model=ReconciliationReportResponse)
def get_reconciliation_audit(db: Session = Depends(get_db)):
    return CentralBankService.audit_reconciliation(db)
