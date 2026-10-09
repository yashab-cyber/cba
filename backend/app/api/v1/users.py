from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse, UserUpdate, UserStatusUpdate
from app.services.audit_service import AuditService
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["User Management & Access Control"])

def _serialize_user(u: User) -> UserResponse:
    return UserResponse(
        id=u.id,
        email=u.email,
        full_name=u.full_name or u.email.split("@")[0].capitalize(),
        organization=u.organization or "Independent Entity",
        role=u.role,
        tier=u.tier or "TIER_1",
        kyc_status=u.kyc_status or "VERIFIED",
        is_active=u.is_active,
        created_at=u.created_at,
        last_login_at=u.last_login_at,
        agent_count=len(u.agents) if u.agents else 0
    )

@router.get("", response_model=List[UserResponse])
def list_users(
    role_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all registered banking users. Only accessible by administrators or operators.
    """
    if current_user.role not in ["admin", "operator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Central Bank Administrators and Operators"
        )
    
    query = db.query(User)
    if role_filter:
        query = query.filter(User.role == role_filter.lower())
    users = query.order_by(User.created_at.desc()).all()
    return [_serialize_user(u) for u in users]

@router.get("/{user_id}", response_model=UserResponse)
def get_user_detail(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "operator"] and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to view details of other user accounts"
        )
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")
    return _serialize_user(target_user)

@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user profile, role, tier, and status. Requires administrator permissions.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")
    
    if payload.role is not None:
        if payload.role not in ["admin", "operator", "auditor", "user", "developer"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role: {payload.role}")
        target_user.role = payload.role
    
    if payload.full_name is not None:
        target_user.full_name = payload.full_name
    if payload.organization is not None:
        target_user.organization = payload.organization
    if payload.tier is not None:
        target_user.tier = payload.tier
    if payload.kyc_status is not None:
        target_user.kyc_status = payload.kyc_status
    if payload.is_active is not None:
        target_user.is_active = payload.is_active

    AuditService.log_event(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="USER_PROFILE_UPDATED",
        resource_type="USER_ACCOUNT",
        resource_id=target_user.id,
        details={
            "updated_by": admin.email,
            "target_email": target_user.email,
            "new_role": target_user.role,
            "new_tier": target_user.tier,
            "is_active": target_user.is_active
        }
    )
    db.commit()
    db.refresh(target_user)
    return _serialize_user(target_user)

@router.post("/{user_id}/status", response_model=UserResponse)
def toggle_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Suspend or activate a user account. If suspended, user and all their agents are frozen.
    """
    if admin.id == user_id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend the currently authenticated administrator"
        )
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")
    
    target_user.is_active = payload.is_active

    # If suspended, also suspend all agents belonging to this user
    action_type = "USER_ACTIVATED" if payload.is_active else "USER_SUSPENDED"
    if not payload.is_active and target_user.agents:
        for ag in target_user.agents:
            ag.status = "SUSPENDED"

    AuditService.log_event(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action=action_type,
        resource_type="USER_ACCOUNT",
        resource_id=target_user.id,
        details={
            "admin_email": admin.email,
            "target_email": target_user.email,
            "reason": payload.reason or "Administrative status update"
        }
    )
    db.commit()
    db.refresh(target_user)
    return _serialize_user(target_user)
