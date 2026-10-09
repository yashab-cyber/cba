import uuid
import secrets
from decimal import Decimal
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.marketplace import ServiceListing, ServiceOrder
from app.models.agent import Agent
from app.services.transaction_service import TransactionService
from app.services.audit_service import AuditService
from app.schemas.marketplace import ServiceListingCreate

class MarketplaceService:
    @classmethod
    def create_listing(
        cls,
        db: Session,
        provider_agent_id: str,
        payload: ServiceListingCreate
    ) -> ServiceListing:
        agent = db.query(Agent).filter(Agent.id == provider_agent_id).first()
        if not agent:
            raise ValueError(f"Provider agent '{provider_agent_id}' not found")

        listing_id = f"svc_{uuid.uuid4().hex[:14]}"
        listing = ServiceListing(
            id=listing_id,
            provider_agent_id=provider_agent_id,
            service_code=payload.service_code,
            title=payload.title,
            description=payload.description,
            category=payload.category or "INFERENCE",
            pricing_model=payload.pricing_model or "PER_UNIT",
            price_per_unit=payload.price_per_unit,
            currency=payload.currency or "CBAC",
            unit_name=payload.unit_name or "1,000 tokens",
            endpoint_url=payload.endpoint_url,
            is_active=True,
            total_orders=0,
            created_at=datetime.now(timezone.utc)
        )
        db.add(listing)

        AuditService.log_event(
            db=db,
            actor_type="AGENT",
            actor_id=provider_agent_id,
            action="CREATE_MARKETPLACE_SERVICE",
            resource_type="SERVICE_LISTING",
            resource_id=listing_id,
            details={"title": payload.title, "service_code": payload.service_code, "price": str(payload.price_per_unit)}
        )
        db.commit()
        db.refresh(listing)
        return listing

    @classmethod
    def list_services(
        cls,
        db: Session,
        category: Optional[str] = None,
        provider_id: Optional[str] = None
    ) -> List[ServiceListing]:
        query = db.query(ServiceListing).filter(ServiceListing.is_active == True)
        if category:
            query = query.filter(ServiceListing.category == category.upper())
        if provider_id:
            query = query.filter(ServiceListing.provider_agent_id == provider_id)
        return query.order_by(ServiceListing.total_orders.desc(), ServiceListing.created_at.desc()).all()

    @classmethod
    def order_service(
        cls,
        db: Session,
        service_id: str,
        buyer_agent_id: str,
        units: Decimal,
        idempotency_key: str
    ) -> Tuple[ServiceOrder, any]:
        listing = db.query(ServiceListing).filter(ServiceListing.id == service_id).first()
        if not listing:
            raise ValueError(f"Service listing '{service_id}' not found")
        if not listing.is_active:
            raise ValueError(f"Service '{listing.title}' is currently inactive")

        buyer = db.query(Agent).filter(Agent.id == buyer_agent_id).first()
        if not buyer:
            raise ValueError(f"Buyer agent '{buyer_agent_id}' not found")

        provider = listing.provider_agent
        if not provider:
            raise ValueError(f"Provider agent not found")

        if buyer.id == provider.id:
            raise ValueError("Agent cannot purchase its own service listing")

        units = Decimal(str(units)).quantize(Decimal("0.000001"))
        total_price = (listing.price_per_unit * units).quantize(Decimal("0.000001"))

        # Execute payment settlement via TransactionService
        tx, entries, is_replay = TransactionService.execute_payment(
            db=db,
            sender_wallet=buyer.wallet,
            recipient_wallet=provider.wallet,
            amount=total_price,
            idempotency_key=idempotency_key,
            description=f"Marketplace purchase: {units}x {listing.unit_name} of '{listing.title}'",
            service_code=listing.service_code,
            metadata={"service_id": listing.id, "units": str(units)},
            actor_id=buyer.id
        )

        order_id = f"ord_{uuid.uuid4().hex[:14]}"
        access_token = f"cba_token_{secrets.token_hex(16)}"

        order = ServiceOrder(
            id=order_id,
            service_id=listing.id,
            buyer_agent_id=buyer.id,
            units_ordered=units,
            total_price=total_price,
            currency=listing.currency,
            status="COMPLETED" if tx.status == "COMPLETED" else tx.status,
            transaction_id=tx.id,
            access_token=access_token,
            created_at=datetime.now(timezone.utc)
        )
        db.add(order)

        # Increment total fulfilled orders count
        listing.total_orders += 1
        db.add(listing)

        AuditService.log_event(
            db=db,
            actor_type="AGENT",
            actor_id=buyer.id,
            action="PURCHASE_MARKETPLACE_SERVICE",
            resource_type="SERVICE_ORDER",
            resource_id=order_id,
            details={"service_id": listing.id, "total_price": str(total_price), "tx_id": tx.id}
        )

        db.commit()
        db.refresh(order)
        return order, tx
