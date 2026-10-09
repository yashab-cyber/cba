import json
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.audit import AuditEvent
from app.schemas.audit import AuditEventResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit Trail & Compliance"])

@router.get("/events", response_model=List[AuditEventResponse])
def list_audit_events(
    actor_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEvent)
    if current_user.role not in ["admin", "operator", "auditor"]:
        user_agent_ids = [a.id for a in current_user.agents]
        allowed_ids = [current_user.id] + user_agent_ids
        query = query.filter(or_(AuditEvent.actor_id.in_(allowed_ids), AuditEvent.resource_id.in_(allowed_ids)))

    if actor_id:
        query = query.filter(AuditEvent.actor_id == actor_id)
    if action:
        query = query.filter(AuditEvent.action == action)
    
    events = query.order_by(AuditEvent.created_at.desc()).offset(offset).limit(limit).all()
    
    results = []
    for e in events:
        try:
            details_dict = json.loads(e.details_json)
        except Exception:
            details_dict = {}
        results.append(AuditEventResponse(
            id=e.id,
            actor_type=e.actor_type,
            actor_id=e.actor_id,
            action=e.action,
            resource_type=e.resource_type,
            resource_id=e.resource_id,
            ip_address=e.ip_address,
            details=details_dict,
            created_at=e.created_at
        ))
    return results
