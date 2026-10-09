from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.schemas.wallet import WalletResponse, WalletBalanceResponse
from app.schemas.transaction import TransactionResponse
from app.services.ledger_service import LedgerService
from app.api.deps import get_current_user

router = APIRouter(prefix="/wallets", tags=["Digital Wallets"])

@router.get("", response_model=List[WalletResponse])
def list_wallets(
    wallet_type: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Wallet)
    # Role-Based Scoping: Non-admin users only see wallets of their own agents
    if current_user.role not in ["admin", "operator", "auditor"]:
        user_agent_ids = [a.id for a in current_user.agents]
        query = query.filter(Wallet.agent_id.in_(user_agent_ids))
    if wallet_type:
        query = query.filter(Wallet.wallet_type == wallet_type.upper())
    wallets = query.order_by(Wallet.created_at.desc()).all()
    return [WalletResponse.model_validate(w) for w in wallets]

@router.get("/{wallet_id}", response_model=WalletResponse)
def get_wallet(
    wallet_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Wallet '{wallet_id}' not found")
    
    if current_user.role not in ["admin", "operator", "auditor"]:
        user_agent_ids = [a.id for a in current_user.agents]
        if wallet.agent_id not in user_agent_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this wallet")
    return WalletResponse.model_validate(wallet)

@router.get("/{wallet_id}/balance", response_model=WalletBalanceResponse)
def get_verified_wallet_balance(
    wallet_id: str,
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Wallet '{wallet_id}' not found")

    # Double-entry ledger verification
    acc = LedgerService.get_account_by_wallet_id(db, wallet.id)
    ledger_balance = LedgerService.compute_account_balance(db, acc.id)
    cached = Decimal(str(wallet.cached_balance))

    return WalletBalanceResponse(
        wallet_id=wallet.id,
        agent_id=wallet.agent_id,
        currency=wallet.currency,
        cached_balance=cached,
        ledger_verified_balance=ledger_balance,
        is_reconciled=(cached == ledger_balance),
        status=wallet.status
    )

@router.get("/{wallet_id}/activity", response_model=List[TransactionResponse])
def get_wallet_activity(
    wallet_id: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Wallet '{wallet_id}' not found")

    txs = db.query(Transaction).filter(
        or_(
            Transaction.sender_wallet_id == wallet.id,
            Transaction.recipient_wallet_id == wallet.id
        )
    ).order_by(Transaction.created_at.desc()).limit(limit).all()

    return [
        TransactionResponse(
            id=tx.id,
            idempotency_key=tx.idempotency_key,
            sender_wallet_id=tx.sender_wallet_id,
            recipient_wallet_id=tx.recipient_wallet_id,
            sender_agent_id=tx.sender_wallet.agent_id if tx.sender_wallet else None,
            recipient_agent_id=tx.recipient_wallet.agent_id if tx.recipient_wallet else None,
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
        for tx in txs
    ]
