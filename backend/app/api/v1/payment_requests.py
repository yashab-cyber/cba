import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.agent import Agent
from app.models.payment_request import PaymentRequest
from app.schemas.payment_request import (
    PaymentRequestCreate, PaymentRequestResponse, PaymentRequestActionResponse
)
from app.services.transaction_service import TransactionService
from app.services.audit_service import AuditService
from app.api.deps import get_authenticated_actor

router = APIRouter(prefix="/payment-requests", tags=["Agent Payment Requests & Invoicing"])

@router.post("", response_model=PaymentRequestResponse, status_code=status.HTTP_201_CREATED)
def create_payment_request(
    payload: PaymentRequestCreate,
    actor_info = Depends(get_authenticated_actor),
    db: Session = Depends(get_db)
):
    actor_type, actor_id, agent_instance, user_instance = actor_info
    
    # Requester is the calling agent, or if operator, must be specified in headers or context
    requester_agent_id = agent_instance.id if agent_instance else None
    if not requester_agent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only authenticated agents can issue payment requests"
        )

    # Validate payer exists
    payer = db.query(Agent).filter(Agent.id == payload.payer_agent_id).first()
    if not payer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payer agent '{payload.payer_agent_id}' not found"
        )

    if requester_agent_id == payload.payer_agent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot request payment from self"
        )

    pr_id = f"pr_{uuid.uuid4().hex[:18]}"
    expires_at = datetime.now(timezone.utc) + timedelta(hours=payload.expires_in_hours or 24)

    req = PaymentRequest(
        id=pr_id,
        requester_agent_id=requester_agent_id,
        payer_agent_id=payload.payer_agent_id,
        amount=payload.amount,
        currency="CBAC",
        service_code=payload.service_code,
        service_description=payload.service_description,
        status="PENDING",
        expires_at=expires_at,
        created_at=datetime.now(timezone.utc)
    )
    db.add(req)

    AuditService.log_event(
        db=db,
        actor_type="AGENT",
        actor_id=requester_agent_id,
        action="CREATE_PAYMENT_REQUEST",
        resource_type="PAYMENT_REQUEST",
        resource_id=pr_id,
        details={
            "amount": str(payload.amount),
            "service_code": payload.service_code,
            "payer_agent_id": payload.payer_agent_id
        }
    )

    db.commit()
    db.refresh(req)
    return PaymentRequestResponse.model_validate(req)

@router.get("", response_model=List[PaymentRequestResponse])
def list_payment_requests(
    status_filter: Optional[str] = None,
    agent_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PaymentRequest)
    if status_filter:
        query = query.filter(PaymentRequest.status == status_filter.upper())
    if agent_id:
        query = query.filter(
            or_(
                PaymentRequest.payer_agent_id == agent_id,
                PaymentRequest.requester_agent_id == agent_id
            )
        )
    requests = query.order_by(PaymentRequest.created_at.desc()).all()
    return [PaymentRequestResponse.model_validate(r) for r in requests]

@router.get("/{request_id}", response_model=PaymentRequestResponse)
def get_payment_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    req = db.query(PaymentRequest).filter(PaymentRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Payment request '{request_id}' not found")
    return PaymentRequestResponse.model_validate(req)

@router.post("/{request_id}/approve", response_model=PaymentRequestActionResponse)
def approve_payment_request(
    request_id: str,
    actor_info = Depends(get_authenticated_actor),
    db: Session = Depends(get_db)
):
    actor_type, actor_id, agent_instance, user_instance = actor_info

    req = db.query(PaymentRequest).filter(PaymentRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Payment request '{request_id}' not found")

    if req.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invoice cannot be approved: status is {req.status}")

    # Check expiration
    exp_time = req.expires_at if req.expires_at.tzinfo else req.expires_at.replace(tzinfo=timezone.utc)
    if exp_time < datetime.now(timezone.utc):
        req.status = "EXPIRED"
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment request has expired")

    # Authorize: Must be payer agent or human operator
    if agent_instance and agent_instance.id != req.payer_agent_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the designated payer agent or admin can approve this invoice")

    payer_agent = db.query(Agent).filter(Agent.id == req.payer_agent_id).first()
    requester_agent = db.query(Agent).filter(Agent.id == req.requester_agent_id).first()

    if not payer_agent or not requester_agent:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payer or requester agent missing")

    # Execute payment atomically
    idempotency_key = f"inv_pay_{req.id}"
    try:
        tx, entries, is_replay = TransactionService.execute_payment(
            db=db,
            sender_wallet=payer_agent.wallet,
            recipient_wallet=requester_agent.wallet,
            amount=req.amount,
            idempotency_key=idempotency_key,
            description=f"Fulfillment of invoice {req.id}: {req.service_description or req.service_code}",
            service_code=req.service_code,
            metadata={"payment_request_id": req.id},
            actor_id=actor_id
        )

        req.status = "FULFILLED"
        req.transaction_id = tx.id
        db.add(req)
        db.commit()

        return PaymentRequestActionResponse(
            request_id=req.id,
            status=req.status,
            message="Payment request approved and settled via double-entry journal",
            transaction_id=tx.id
        )

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{request_id}/reject", response_model=PaymentRequestActionResponse)
def reject_payment_request(
    request_id: str,
    reason: Optional[str] = "Rejected by payer agent or operator",
    actor_info = Depends(get_authenticated_actor),
    db: Session = Depends(get_db)
):
    actor_type, actor_id, agent_instance, user_instance = actor_info

    req = db.query(PaymentRequest).filter(PaymentRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Payment request '{request_id}' not found")

    if req.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot reject invoice in status {req.status}")

    # Authorize: Must be payer agent or human operator
    if agent_instance and agent_instance.id != req.payer_agent_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the designated payer agent or admin can reject this invoice")

    req.status = "REJECTED"
    db.add(req)

    AuditService.log_event(
        db=db,
        actor_type=actor_type,
        actor_id=actor_id,
        action="REJECT_PAYMENT_REQUEST",
        resource_type="PAYMENT_REQUEST",
        resource_id=req.id,
        details={"reason": reason}
    )

    db.commit()
    return PaymentRequestActionResponse(
        request_id=req.id,
        status="REJECTED",
        message=f"Payment request rejected: {reason}",
        transaction_id=None
    )
