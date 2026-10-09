from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.transaction import Transaction
from app.models.agent import Agent
from app.models.wallet import Wallet
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Economic Analytics"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    since_24h = now - timedelta(hours=24)

    # 24-hour volume
    vol_24h = db.query(
        func.coalesce(func.sum(Transaction.amount), Decimal("0.000000"))
    ).filter(
        Transaction.status == "COMPLETED",
        Transaction.created_at >= since_24h,
        Transaction.transaction_type.in_(["TRANSFER", "SERVICE_PAYMENT"])
    ).scalar()
    vol_24h = Decimal(str(vol_24h))

    # All-time volume
    vol_all = db.query(
        func.coalesce(func.sum(Transaction.amount), Decimal("0.000000"))
    ).filter(
        Transaction.status == "COMPLETED",
        Transaction.transaction_type.in_(["TRANSFER", "SERVICE_PAYMENT"])
    ).scalar()
    vol_all = Decimal(str(vol_all))

    # All-time fees
    fees_total = db.query(
        func.coalesce(func.sum(Transaction.fee_amount), Decimal("0.000000"))
    ).filter(Transaction.status == "COMPLETED").scalar()
    fees_total = Decimal(str(fees_total))

    tx_count_24h = db.query(Transaction).filter(Transaction.created_at >= since_24h).count()
    tx_total_count = db.query(Transaction).count()
    pending_approval_count = db.query(Transaction).filter(Transaction.status == "PENDING_APPROVAL").count()

    # Agent breakdown
    total_agents = db.query(Agent).count()
    active_agents = db.query(Agent).filter(Agent.status == "ACTIVE").count()
    suspended_agents = db.query(Agent).filter(Agent.status == "SUSPENDED").count()

    # Breakdown by transaction type
    by_type = db.query(
        Transaction.transaction_type,
        func.count(Transaction.id),
        func.coalesce(func.sum(Transaction.amount), Decimal("0.000000"))
    ).filter(Transaction.status == "COMPLETED").group_by(Transaction.transaction_type).all()

    breakdown = [
        {"type": row[0], "count": row[1], "volume": Decimal(str(row[2]))}
        for row in by_type
    ]

    return {
        "timestamp": now,
        "volume_24h": vol_24h,
        "volume_all_time": vol_all,
        "fees_collected_total": fees_total,
        "transactions_24h": tx_count_24h,
        "transactions_total": tx_total_count,
        "pending_approval_transactions": pending_approval_count,
        "agents": {
            "total": total_agents,
            "active": active_agents,
            "suspended": suspended_agents
        },
        "breakdown_by_type": breakdown,
        "monetary_unit": "CBAC"
    }
