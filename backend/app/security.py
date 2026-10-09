import os
import secrets
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
from jose import jwt
import bcrypt
from app.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")

def create_access_token(subject: Union[str, Any], role: str = "operator", expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None

def generate_agent_api_key(is_live: bool = True) -> tuple[str, str, str]:
    """
    Generates a cryptographically strong API key for an AI agent.
    Returns:
        (raw_key, key_prefix, key_hash)
    Raw key looks like: cba_live_7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e
    Raw key is shown ONCE to the caller; only key_prefix and key_hash are stored.
    """
    prefix_type = "live" if is_live else "test"
    random_bytes = secrets.token_hex(24)
    raw_key = f"cba_{prefix_type}_{random_bytes}"
    key_prefix = raw_key[:16] # e.g. cba_live_7f8a9b1
    key_hash = hash_agent_api_key(raw_key)
    return raw_key, key_prefix, key_hash

def hash_agent_api_key(raw_key: str) -> str:
    """Computes SHA-256 hash of API key for database lookup and storage."""
    return hashlib.sha256(raw_key.strip().encode("utf-8")).hexdigest()

def verify_agent_api_key(raw_key: str, stored_hash: str) -> bool:
    """Constant-time comparison to protect against timing attacks."""
    computed_hash = hash_agent_api_key(raw_key)
    return hmac.compare_digest(computed_hash, stored_hash)
