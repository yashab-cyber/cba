from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    full_name: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = "user" # user, operator, admin, auditor
    tier: Optional[str] = "TIER_1"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    tier: Optional[str] = None
    kyc_status: Optional[str] = None
    is_active: Optional[bool] = None

class UserStatusUpdate(BaseModel):
    is_active: bool
    reason: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: Optional[str] = None
    organization: Optional[str] = None
    role: str
    tier: Optional[str] = "TIER_1"
    kyc_status: Optional[str] = "VERIFIED"
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None
    agent_count: Optional[int] = 0

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

