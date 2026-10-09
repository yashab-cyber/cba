import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.wallet import Wallet
from app.models.agent import Agent
from app.models.transaction import Transaction
from app.models.ledger import LedgerEntry
from app.schemas.transaction import (
    PaymentCreate, TransactionResponse, TransactionReceiptResponse, LedgerEntryResponse
)
from app.services.transaction_service import TransactionService
from app.services.policy_engine import PolicyViolationError
from app.services.ledger_service import InsufficientFundsError, LedgerImbalanceError
from app.api.deps import get_authenticated_actor, get_current_user

from app.crypto import CryptoIdentityService

router = APIRouter(prefix="/payments", tags=["Payments & Transactions"])

@router.post("", response_model=TransactionReceiptResponse, status_code=status.HTTP_200_OK)
def create_payment(
    payload: PaymentCreate,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    x_cba_signature: Optional[str] = Header(None, alias="X-CBA-SIGNATURE"),
    x_cba_timestamp: Optional[int] = Header(None, alias="X-CBA-TIMESTAMP"),
    actor_info = Depends(get_authenticated_actor),
    db: Session = Depends(get_db)
):
    actor_type, actor_id, agent_instance, user_instance = actor_info

    # 1. Validate or generate Idempotency Key
    if not idempotency_key:
        idempotency_key = f"idem_{uuid.uuid4().hex}"

    # 2. Determine Sender Wallet
    if agent_instance:
        sender_wallet = agent_instance.wallet
        if not sender_wallet:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Agent does not have an active wallet")
    else:
        # User/Operator: if sender_wallet is specified in metadata or default to treasury
        sender_wallet = db.query(Wallet).filter(Wallet.id == "wal_central_treasury").first()
        if not sender_wallet:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="System treasury wallet not initialized")

    # 3. Determine Recipient Wallet
    recipient_wallet = None
    recipient_agent_id_target = payload.recipient_agent_id
    if payload.recipient_agent_id:
        rec_agent = db.query(Agent).filter(Agent.id == payload.recipient_agent_id).first()
        if not rec_agent:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Recipient agent '{payload.recipient_agent_id}' not found")
        recipient_wallet = rec_agent.wallet
    elif payload.recipient_wallet_id:
        recipient_wallet = db.query(Wallet).filter(Wallet.id == payload.recipient_wallet_id).first()
        if recipient_wallet and recipient_wallet.agent_id:
            recipient_agent_id_target = recipient_wallet.agent_id
    
    if not recipient_wallet:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Must provide valid recipient_agent_id or recipient_wallet_id")

    if sender_wallet.id == recipient_wallet.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot send payment to self wallet")

    # Cryptographic signature validation if provided
    if x_cba_signature:
        if not x_cba_timestamp:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing X-CBA-TIMESTAMP header required for signed payments")
        if not agent_instance:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signed payments can only be submitted by registered AI agents")
        if not agent_instance.public_key:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Agent '{agent_instance.id}' does not have a registered Ed25519 public key")

        target_rec_id = recipient_agent_id_target or ""
        amount_canonical = f"{Decimal(str(payload.amount)):.6f}"
        is_valid, reason = CryptoIdentityService.verify_payment_signature(
            public_key_hex=agent_instance.public_key,
            signature_hex=x_cba_signature,
            timestamp=x_cba_timestamp,
            sender_agent_id=agent_instance.id,
            recipient_agent_id=target_rec_id,
            amount=amount_canonical,
            idempotency_key=idempotency_key
        )
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Cryptographic signature verification failed: {reason}")

    # 4. Execute Payment
    try:
        tx, entries, is_replay = TransactionService.execute_payment(
            db=db,
            sender_wallet=sender_wallet,
            recipient_wallet=recipient_wallet,
            amount=payload.amount,
            idempotency_key=idempotency_key,
            description=payload.description,
            service_code=payload.service_code,
            metadata=payload.metadata,
            actor_id=actor_id
        )

        # Convert ledger entries
        ledger_responses = [
            LedgerEntryResponse(
                id=e.id,
                ledger_account_id=e.ledger_account_id,
                account_number=e.ledger_account.account_number if e.ledger_account else None,
                account_type=e.ledger_account.account_type if e.ledger_account else None,
                entry_type=e.entry_type,
                amount=e.amount,
                entry_hash=e.entry_hash,
                created_at=e.created_at
            )
            for e in entries
        ]

        tx_resp = TransactionResponse(
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

        return TransactionReceiptResponse(
            transaction=tx_resp,
            ledger_entries=ledger_responses,
            sender_balance_after=sender_wallet.cached_balance,
            recipient_balance_after=recipient_wallet.cached_balance,
            verification_status="SETTLED_DOUBLE_ENTRY_BALANCED" if tx.status == "COMPLETED" else "HELD_FOR_HUMAN_APPROVAL"
        )

    except InsufficientFundsError as e:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=str(e))
    except PolicyViolationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Spending Policy Violation: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except LedgerImbalanceError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Critical Accounting Failure: {str(e)}")

@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    status_filter: Optional[str] = None,
    agent_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if status_filter:
        query = query.filter(Transaction.status == status_filter.upper())
    if agent_id:
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if agent and agent.wallet:
            query = query.filter(
                or_(
                    Transaction.sender_wallet_id == agent.wallet.id,
                    Transaction.recipient_wallet_id == agent.wallet.id
                )
            )

    txs = query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()

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

@router.get("/{transaction_id}", response_model=TransactionReceiptResponse)
def get_transaction_receipt(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Transaction '{transaction_id}' not found")

    entries = db.query(LedgerEntry).filter(LedgerEntry.transaction_id == tx.id).all()
    ledger_responses = [
        LedgerEntryResponse(
            id=e.id,
            ledger_account_id=e.ledger_account_id,
            account_number=e.ledger_account.account_number if e.ledger_account else None,
            account_type=e.ledger_account.account_type if e.ledger_account else None,
            entry_type=e.entry_type,
            amount=e.amount,
            entry_hash=e.entry_hash,
            created_at=e.created_at
        )
        for e in entries
    ]

    tx_resp = TransactionResponse(
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

    return TransactionReceiptResponse(
        transaction=tx_resp,
        ledger_entries=ledger_responses,
        sender_balance_after=tx.sender_wallet.cached_balance if tx.sender_wallet else None,
        recipient_balance_after=tx.recipient_wallet.cached_balance if tx.recipient_wallet else None,
        verification_status="SETTLED_DOUBLE_ENTRY_BALANCED" if tx.status == "COMPLETED" else "HELD_FOR_HUMAN_APPROVAL"
    )

@router.post("/{transaction_id}/approve", response_model=TransactionReceiptResponse)
def approve_held_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        tx = TransactionService.approve_transaction(db, transaction_id, current_user.id)
        entries = db.query(LedgerEntry).filter(LedgerEntry.transaction_id == tx.id).all()
        ledger_responses = [
            LedgerEntryResponse(
                id=e.id,
                ledger_account_id=e.ledger_account_id,
                account_number=e.ledger_account.account_number if e.ledger_account else None,
                account_type=e.ledger_account.account_type if e.ledger_account else None,
                entry_type=e.entry_type,
                amount=e.amount,
                entry_hash=e.entry_hash,
                created_at=e.created_at
            )
            for e in entries
        ]
        tx_resp = TransactionResponse(
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
        return TransactionReceiptResponse(
            transaction=tx_resp,
            ledger_entries=ledger_responses,
            sender_balance_after=tx.sender_wallet.cached_balance if tx.sender_wallet else None,
            recipient_balance_after=tx.recipient_wallet.cached_balance if tx.recipient_wallet else None,
            verification_status="SETTLED_DOUBLE_ENTRY_BALANCED"
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except InsufficientFundsError as e:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=str(e))
