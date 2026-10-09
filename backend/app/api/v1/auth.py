import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserLogin, UserCreate, UserResponse, Token
from app.security import verify_password, get_password_hash, create_access_token
from app.services.audit_service import AuditService
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        organization=user.organization,
        role=user.role,
        tier=user.tier or "TIER_1",
        kyc_status=user.kyc_status or "VERIFIED",
        is_active=user.is_active,
        created_at=user.created_at,
        last_login_at=user.last_login_at,
        agent_count=len(user.agents) if user.agents else 0
    )

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been suspended by Central Bank Administrator"
        )
    
    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)
    AuditService.log_event(
        db=db,
        actor_type="USER",
        actor_id=user.id,
        action="USER_LOGIN_SUCCESS",
        resource_type="USER_SESSION",
        resource_id=user.id,
        details={"email": user.email, "role": user.role}
    )
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user=_to_user_response(user)
    )

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered."
        )
    
    # Default newly self-registered accounts to 'user' role
    role = user_data.role if user_data.role in ["user", "developer"] else "user"
    
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name or user_data.email.split("@")[0].capitalize(),
        organization=user_data.organization or "Autonomous Agent Entity",
        role=role,
        tier=user_data.tier or "TIER_1",
        kyc_status="VERIFIED",
        is_active=True,
        last_login_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    db.flush()
    
    AuditService.log_event(
        db=db,
        actor_type="USER",
        actor_id=new_user.id,
        action="USER_REGISTRATION",
        resource_type="USER_ACCOUNT",
        resource_id=new_user.id,
        details={"email": new_user.email, "role": new_user.role, "organization": new_user.organization}
    )
    db.commit()
    db.refresh(new_user)
    
    return _to_user_response(new_user)

@router.get("/me", response_model=UserResponse)
def get_current_profile(current_user: User = Depends(get_current_user)):
    return _to_user_response(current_user)

