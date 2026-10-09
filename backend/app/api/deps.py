from typing import Optional, Union, Tuple
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.agent import Agent, AgentCredential
from app.security import decode_access_token, hash_agent_api_key

security_bearer = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    # Check if this is an agent API key passed as Bearer
    if token.startswith("cba_live_") or token.startswith("cba_test_"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent API key provided where operator user token is required"
        )
    
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or not found",
        )
    return user

def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required for this operation"
        )
    return user

def get_current_agent(
    x_cba_api_key: Optional[str] = Header(None, alias="X-CBA-API-KEY"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> Tuple[Agent, AgentCredential]:
    """
    Authenticates an AI Agent via API key (either X-CBA-API-KEY header or Bearer cba_live_...).
    """
    raw_key = None
    if x_cba_api_key:
        raw_key = x_cba_api_key.strip()
    elif credentials and credentials.credentials:
        cred = credentials.credentials.strip()
        if cred.startswith("cba_live_") or cred.startswith("cba_test_"):
            raw_key = cred

    if not raw_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing agent API key. Provide 'X-CBA-API-KEY' header or 'Bearer cba_live_...'"
        )

    key_hash = hash_agent_api_key(raw_key)
    credential = db.query(AgentCredential).filter(
        AgentCredential.key_hash == key_hash,
        AgentCredential.is_active == True
    ).first()

    if not credential:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid agent API key or credential revoked"
        )

    agent = credential.agent
    if not agent or agent.status == "REVOKED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Agent identity is revoked or deleted"
        )

    return agent, credential

def get_authenticated_actor(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    x_cba_api_key: Optional[str] = Header(None, alias="X-CBA-API-KEY"),
    x_cba_agent_id: Optional[str] = Header(None, alias="X-CBA-AGENT-ID"),
    x_cba_timestamp: Optional[int] = Header(None, alias="X-CBA-TIMESTAMP"),
    x_cba_signature: Optional[str] = Header(None, alias="X-CBA-SIGNATURE"),
    db: Session = Depends(get_db)
) -> Tuple[str, str, Optional[Agent], Optional[User]]:
    """
    Unified resolver: Returns (actor_type, actor_id, agent_instance, user_instance)
    Supports:
    1. Cryptographic Ed25519 Signatures (X-CBA-SIGNATURE + X-CBA-AGENT-ID)
    2. High-entropy API Keys (X-CBA-API-KEY or Bearer cba_live_...)
    3. Operator JWT Bearer tokens
    """
    # 0. Check cryptographic signature (Must be verified by endpoints supporting signed execution)
    if x_cba_signature and x_cba_agent_id:
        agent = db.query(Agent).filter(Agent.id == x_cba_agent_id).first()
        if not agent:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent '{x_cba_agent_id}' not found")
        if not agent.public_key:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Agent '{x_cba_agent_id}' does not have a registered Ed25519 public key")
        if agent.status == "REVOKED":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Agent identity is revoked")
        return "AGENT_SIGNED", agent.id, agent, None

    # 1. Check agent key
    if x_cba_api_key:
        key_hash = hash_agent_api_key(x_cba_api_key.strip())
        cred = db.query(AgentCredential).filter(AgentCredential.key_hash == key_hash, AgentCredential.is_active == True).first()
        if cred and cred.agent:
            return "AGENT", cred.agent.id, cred.agent, None
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid agent API key or credential revoked"
        )

    # 2. Check Bearer token
    if credentials and credentials.credentials:
        token = credentials.credentials.strip()
        if token.startswith("cba_live_") or token.startswith("cba_test_"):
            key_hash = hash_agent_api_key(token)
            cred = db.query(AgentCredential).filter(AgentCredential.key_hash == key_hash, AgentCredential.is_active == True).first()
            if cred and cred.agent:
                return "AGENT", cred.agent.id, cred.agent, None
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid agent API key or credential revoked"
            )
        else:
            payload = decode_access_token(token)
            if payload and payload.get("sub"):
                user = db.query(User).filter(User.id == payload["sub"]).first()
                if user:
                    return "USER", user.id, None, user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Valid authentication credentials required"
    )
