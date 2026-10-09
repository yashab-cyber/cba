from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class AuditEventResponse(BaseModel):
    id: str
    actor_type: str
    actor_id: str
    action: str
    resource_type: str
    resource_id: str
    ip_address: Optional[str] = None
    details: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
