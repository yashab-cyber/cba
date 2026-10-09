import json
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.agent import Agent, AgentCredential
from app.models.policy import SpendingPolicy
from app.schemas.agent import AgentCreate, AgentUpdate, AgentResponse, AgentDetailResponse, AgentCredentialResponse
from app.schemas.policy import SpendingPolicyUpdate, SpendingPolicyResponse
from app.schemas.wallet import WalletResponse
from app.services.agent_service import AgentService
from app.services.audit_service import AuditService
from app.api.deps import get_current_user

router = APIRouter(prefix="/agents", tags=["AI Agent Identity & Management"])

@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def register_agent(
    payload: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        agent = AgentService.create_agent(
            db=db,
            agent_id=payload.id,
            name=payload.name,
            owner_id=current_user.id,
            description=payload.description,
            initial_policy=payload.initial_policy,
            initial_funding=payload.initial_funding or Decimal("0.000000"),
            metadata=payload.metadata
        )
        return AgentResponse(
            id=agent.id,
            owner_id=agent.owner_id,
            name=agent.name,
            description=agent.description,
            status=agent.status,
            public_key=agent.public_key,
            created_at=agent.created_at,
            updated_at=agent.updated_at,
            wallet_id=agent.wallet.id if agent.wallet else None,
            cached_balance=agent.wallet.cached_balance if agent.wallet else Decimal("0.000000")
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("", response_model=List[AgentResponse])
def list_agents(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Agent)
    # Role-Based Scoping: Non-admin users only see agents they own
    if current_user.role not in ["admin", "operator", "auditor"]:
        query = query.filter(Agent.owner_id == current_user.id)
    if status_filter:
        query = query.filter(Agent.status == status_filter.upper())
    agents = query.order_by(Agent.created_at.desc()).all()
    
    return [
        AgentResponse(
            id=a.id,
            owner_id=a.owner_id,
            name=a.name,
            description=a.description,
            status=a.status,
            public_key=a.public_key,
            created_at=a.created_at,
            updated_at=a.updated_at,
            wallet_id=a.wallet.id if a.wallet else None,
            cached_balance=a.wallet.cached_balance if a.wallet else Decimal("0.000000")
        )
        for a in agents
    ]

@router.get("/{agent_id}", response_model=AgentDetailResponse)
def get_agent_detail(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent '{agent_id}' not found")

    if current_user.role not in ["admin", "operator", "auditor"] and agent.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: You do not have permission to view this agent's private credentials and policies."
        )

    policy_resp = None
    if agent.spending_policy:
        try:
            allowed_cp = json.loads(agent.spending_policy.allowed_counterparties_json)
        except Exception:
            allowed_cp = "ALL"
        policy_resp = SpendingPolicyResponse(
            id=agent.spending_policy.id,
            agent_id=agent.spending_policy.agent_id,
            max_amount_per_tx=agent.spending_policy.max_amount_per_tx,
            daily_spending_limit=agent.spending_policy.daily_spending_limit,
            monthly_spending_limit=agent.spending_policy.monthly_spending_limit,
            human_approval_threshold=agent.spending_policy.human_approval_threshold,
            allowed_counterparties=allowed_cp,
            emergency_freeze=agent.spending_policy.emergency_freeze,
            created_at=agent.spending_policy.created_at,
            updated_at=agent.spending_policy.updated_at
        )

    wallet_resp = None
    if agent.wallet:
        wallet_resp = WalletResponse.model_validate(agent.wallet)

    return AgentDetailResponse(
        id=agent.id,
        owner_id=agent.owner_id,
        name=agent.name,
        description=agent.description,
        status=agent.status,
        public_key=agent.public_key,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
        wallet=wallet_resp,
        spending_policy=policy_resp
    )

@router.post("/{agent_id}/credentials", response_model=AgentCredentialResponse)
def generate_credentials(
    agent_id: str,
    scopes: Optional[str] = "wallets:read,payments:create,invoices:create",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        cred, raw_key = AgentService.generate_credentials(
            db=db,
            agent_id=agent_id,
            scopes=scopes,
            operator_id=current_user.id
        )
        return AgentCredentialResponse(
            agent_id=agent_id,
            raw_api_key=raw_key,
            key_prefix=cred.key_prefix,
            scopes=cred.scopes,
            expires_at=cred.expires_at,
            is_active=cred.is_active,
            created_at=cred.created_at
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/{agent_id}/policy", response_model=SpendingPolicyResponse)
def update_spending_policy(
    agent_id: str,
    payload: SpendingPolicyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent '{agent_id}' not found")

    policy = agent.spending_policy
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Policy for agent '{agent_id}' not found")

    if payload.max_amount_per_tx is not None:
        policy.max_amount_per_tx = payload.max_amount_per_tx
    if payload.daily_spending_limit is not None:
        policy.daily_spending_limit = payload.daily_spending_limit
    if payload.monthly_spending_limit is not None:
        policy.monthly_spending_limit = payload.monthly_spending_limit
    if payload.human_approval_threshold is not None:
        policy.human_approval_threshold = payload.human_approval_threshold
    if payload.allowed_counterparties is not None:
        if isinstance(payload.allowed_counterparties, list):
            policy.allowed_counterparties_json = json.dumps(payload.allowed_counterparties)
        else:
            policy.allowed_counterparties_json = json.dumps(str(payload.allowed_counterparties))
    if payload.emergency_freeze is not None:
        policy.emergency_freeze = payload.emergency_freeze

    db.add(policy)
    AuditService.log_event(
        db=db,
        actor_type="USER",
        actor_id=current_user.id,
        action="UPDATE_SPENDING_POLICY",
        resource_type="POLICY",
        resource_id=agent_id,
        details={"agent_id": agent_id}
    )
    db.commit()
    db.refresh(policy)

    try:
        allowed_cp = json.loads(policy.allowed_counterparties_json)
    except Exception:
        allowed_cp = "ALL"

    return SpendingPolicyResponse(
        id=policy.id,
        agent_id=policy.agent_id,
        max_amount_per_tx=policy.max_amount_per_tx,
        daily_spending_limit=policy.daily_spending_limit,
        monthly_spending_limit=policy.monthly_spending_limit,
        human_approval_threshold=policy.human_approval_threshold,
        allowed_counterparties=allowed_cp,
        emergency_freeze=policy.emergency_freeze,
        created_at=policy.created_at,
        updated_at=policy.updated_at
    )

@router.post("/{agent_id}/freeze", response_model=SpendingPolicyResponse)
def toggle_emergency_freeze(
    agent_id: str,
    freeze: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        policy = AgentService.set_emergency_freeze(db, agent_id, freeze, current_user.id)
        try:
            allowed_cp = json.loads(policy.allowed_counterparties_json)
        except Exception:
            allowed_cp = "ALL"

        return SpendingPolicyResponse(
            id=policy.id,
            agent_id=policy.agent_id,
            max_amount_per_tx=policy.max_amount_per_tx,
            daily_spending_limit=policy.daily_spending_limit,
            monthly_spending_limit=policy.monthly_spending_limit,
            human_approval_threshold=policy.human_approval_threshold,
            allowed_counterparties=allowed_cp,
            emergency_freeze=policy.emergency_freeze,
            created_at=policy.created_at,
            updated_at=policy.updated_at
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{agent_id}/suspend", response_model=AgentResponse)
def toggle_agent_suspension(
    agent_id: str,
    status_str: str = "SUSPENDED", # SUSPENDED or ACTIVE
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent '{agent_id}' not found")
    
    agent.status = status_str.upper()
    db.add(agent)
    AuditService.log_event(
        db=db,
        actor_type="USER",
        actor_id=current_user.id,
        action=f"AGENT_STATUS_CHANGED_TO_{agent.status}",
        resource_type="AGENT",
        resource_id=agent_id,
        details={"new_status": agent.status}
    )
    db.commit()
    db.refresh(agent)

    return AgentResponse(
        id=agent.id,
        owner_id=agent.owner_id,
        name=agent.name,
        description=agent.description,
        status=agent.status,
        public_key=agent.public_key,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
        wallet_id=agent.wallet.id if agent.wallet else None,
        cached_balance=agent.wallet.cached_balance if agent.wallet else Decimal("0.000000")
    )

@router.get("/{agent_id}/wallet", response_model=WalletResponse)
def get_agent_wallet(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent '{agent_id}' not found")
    if not agent.wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Wallet for agent '{agent_id}' not found")
    return WalletResponse.model_validate(agent.wallet)

@router.post("/{agent_id}/keypair")
def generate_cryptographic_keypair(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.crypto import CryptoIdentityService
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent '{agent_id}' not found")

    private_hex, public_hex = CryptoIdentityService.generate_keypair()
    agent.public_key = public_hex
    db.add(agent)
    AuditService.log_event(
        db=db,
        actor_type="USER",
        actor_id=current_user.id,
        action="REGISTER_ED25519_KEYPAIR",
        resource_type="AGENT",
        resource_id=agent.id,
        details={"public_key": public_hex}
    )
    db.commit()

    return {
        "agent_id": agent.id,
        "public_key": public_hex,
        "private_key": private_hex,
        "key_algorithm": "Ed25519",
        "instructions": "Private key is returned ONCE. Store it securely in your AI agent environment."
    }

@router.put("/{agent_id}/public-key")
def register_agent_public_key(
    agent_id: str,
    public_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent '{agent_id}' not found")

    agent.public_key = public_key.strip()
    db.add(agent)
    AuditService.log_event(
        db=db,
        actor_type="USER",
        actor_id=current_user.id,
        action="ATTACH_EXTERNAL_PUBLIC_KEY",
        resource_type="AGENT",
        resource_id=agent.id,
        details={"public_key": agent.public_key}
    )
    db.commit()

    return {
        "agent_id": agent.id,
        "public_key": agent.public_key,
        "status": "REGISTERED"
    }

