import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.marketplace import ServiceListing, ServiceOrder
from app.models.agent import Agent
from app.schemas.marketplace import (
    ServiceListingCreate, ServiceListingResponse, ServiceOrderCreate, ServiceOrderResponse
)
from app.services.marketplace_service import MarketplaceService
from app.api.deps import get_authenticated_actor

router = APIRouter(prefix="/marketplace", tags=["Agent Service Marketplace"])

@router.post("/services", response_model=ServiceListingResponse, status_code=status.HTTP_201_CREATED)
def create_service_listing(
    payload: ServiceListingCreate,
    provider_agent_id: Optional[str] = None,
    actor_info = Depends(get_authenticated_actor),
    db: Session = Depends(get_db)
):
    actor_type, actor_id, agent_instance, user_instance = actor_info
    if actor_type == "AGENT_SIGNED":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key or operator bearer token required for marketplace listing"
        )
    
    # Target provider agent
    target_id = agent_instance.id if agent_instance else provider_agent_id
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must specify provider_agent_id when creating service listing as operator"
        )
    if user_instance and user_instance.role not in ["admin", "operator"]:
        user_agent_ids = [a.id for a in user_instance.agents]
        if target_id not in user_agent_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create listing for an agent you do not own")

    try:
        listing = MarketplaceService.create_listing(
            db=db,
            provider_agent_id=target_id,
            payload=payload
        )
        return ServiceListingResponse.model_validate(listing)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/services", response_model=List[ServiceListingResponse])
def list_marketplace_services(
    category: Optional[str] = None,
    provider_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    listings = MarketplaceService.list_services(db, category, provider_id)
    return [ServiceListingResponse.model_validate(l) for l in listings]

@router.get("/services/{service_id}", response_model=ServiceListingResponse)
def get_service_listing(service_id: str, db: Session = Depends(get_db)):
    listing = db.query(ServiceListing).filter(ServiceListing.id == service_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Service '{service_id}' not found")
    return ServiceListingResponse.model_validate(listing)

@router.post("/services/{service_id}/order", response_model=ServiceOrderResponse)
def order_marketplace_service(
    service_id: str,
    payload: ServiceOrderCreate,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    actor_info = Depends(get_authenticated_actor),
    db: Session = Depends(get_db)
):
    actor_type, actor_id, agent_instance, user_instance = actor_info
    if actor_type == "AGENT_SIGNED":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key or operator bearer token required for marketplace orders"
        )
    buyer_id = agent_instance.id if agent_instance else payload.buyer_agent_id
    if not buyer_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Must specify buyer_agent_id")
    if user_instance and user_instance.role not in ["admin", "operator"]:
        user_agent_ids = [a.id for a in user_instance.agents]
        if buyer_id not in user_agent_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot order service on behalf of an agent you do not own")

    key = idempotency_key or f"order_{uuid.uuid4().hex[:14]}"
    try:
        order, tx = MarketplaceService.order_service(
            db=db,
            service_id=service_id,
            buyer_agent_id=buyer_id,
            units=payload.units,
            idempotency_key=key
        )
        return ServiceOrderResponse.model_validate(order)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/orders", response_model=List[ServiceOrderResponse])
def list_orders(
    buyer_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(ServiceOrder)
    if buyer_id:
        query = query.filter(ServiceOrder.buyer_agent_id == buyer_id)
    orders = query.order_by(ServiceOrder.created_at.desc()).limit(limit).all()
    return [ServiceOrderResponse.model_validate(o) for o in orders]
