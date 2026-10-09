import json
import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        actor_type: str,
        actor_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditEvent:
        event = AuditEvent(
            id=str(uuid.uuid4()),
            actor_type=actor_type,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            details_json=json.dumps(details or {})
        )
        db.add(event)
        return event
