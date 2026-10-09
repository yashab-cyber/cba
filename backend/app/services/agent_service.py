import json
from decimal import Decimal
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.agent import Agent, AgentCredential
from app.models.wallet import Wallet
from app.models.policy import SpendingPolicy
from app.services.ledger_service import LedgerService
from app.security import generate_agent_api_key
from app.services.central_bank_service import CentralBankService
from app.services.audit_service import AuditService
from app.schemas.policy import SpendingPolicyBase

class AgentService:
    @classmethod
    def create_agent(
        cls,
        db: Session,
        agent_id: str,
        name: str,
        owner_id: str,
        description: Optional[str] = None,
        initial_policy: Optional[SpendingPolicyBase] = None,
        initial_funding: Decimal = Decimal("0.000000"),
        metadata: Optional[Dict[str, Any]] = None
    ) -> Agent:
        # Check uniqueness
        if db.query(Agent).filter(Agent.id == agent_id).first():
            raise ValueError(f"Agent ID '{agent_id}' already exists")

        agent = Agent(
            id=agent_id,
            owner_id=owner_id,
            name=name,
            description=description,
            status="ACTIVE",
            metadata_json=json.dumps(metadata or {})
        )
        db.add(agent)
        db.flush()

        # Create Agent Wallet
        wallet_id = f"wal_{agent_id}"
        wallet = Wallet(
            id=wallet_id,
            agent_id=agent.id,
            wallet_type="AGENT",
            currency="CBAC",
            cached_balance=Decimal("0.000000"),
            status="ACTIVE"
        )
        db.add(wallet)
        db.flush()

        # Create Ledger Account (Liability of Central Bank to Agent)
        LedgerService.get_or_create_system_account(
            db=db,
            account_number=f"2000_{wallet_id}",
            account_type="LIABILITY",
            normal_balance="CREDIT",
            description=f"Agent Deposit Liability: {name} ({agent_id})",
            wallet_id=wallet.id
        )

        # Create Spending Policy
        pol = initial_policy or SpendingPolicyBase()
        allowed_cp = pol.allowed_counterparties
        if isinstance(allowed_cp, list):
            allowed_cp_json = json.dumps(allowed_cp)
        else:
            allowed_cp_json = json.dumps(str(allowed_cp))

        policy = SpendingPolicy(
            agent_id=agent.id,
            max_amount_per_tx=pol.max_amount_per_tx,
            daily_spending_limit=pol.daily_spending_limit,
            monthly_spending_limit=pol.monthly_spending_limit,
            human_approval_threshold=pol.human_approval_threshold,
            allowed_counterparties_json=allowed_cp_json,
            emergency_freeze=pol.emergency_freeze
        )
        db.add(policy)
        db.flush()

        AuditService.log_event(
            db=db,
            actor_type="USER",
            actor_id=owner_id,
            action="CREATE_AGENT",
            resource_type="AGENT",
            resource_id=agent.id,
            details={"name": name, "wallet_id": wallet.id}
        )
        db.commit()

        # Optional initial Treasury allocation
        if initial_funding > Decimal("0.000000"):
            CentralBankService.allocate_from_treasury(
                db=db,
                recipient_agent_id=agent.id,
                amount=initial_funding,
                reason="Initial agent registration grant",
                operator_id=owner_id
            )

        db.refresh(agent)
        return agent

    @classmethod
    def generate_credentials(
        cls,
        db: Session,
        agent_id: str,
        scopes: str = "wallets:read,payments:create,invoices:create",
        operator_id: Optional[str] = None
    ) -> Tuple[AgentCredential, str]:
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")

        raw_key, key_prefix, key_hash = generate_agent_api_key(is_live=True)
        cred = AgentCredential(
            agent_id=agent.id,
            key_prefix=key_prefix,
            key_hash=key_hash,
            scopes=scopes,
            is_active=True
        )
        db.add(cred)

        AuditService.log_event(
            db=db,
            actor_type="USER" if operator_id else "SYSTEM",
            actor_id=operator_id or "SYSTEM",
            action="GENERATE_AGENT_CREDENTIALS",
            resource_type="AGENT",
            resource_id=agent.id,
            details={"key_prefix": key_prefix, "scopes": scopes}
        )
        db.commit()
        return cred, raw_key

    @classmethod
    def set_emergency_freeze(cls, db: Session, agent_id: str, freeze: bool, operator_id: str) -> SpendingPolicy:
        policy = db.query(SpendingPolicy).filter(SpendingPolicy.agent_id == agent_id).first()
        if not policy:
            raise ValueError(f"Spending policy for agent {agent_id} not found")

        policy.emergency_freeze = freeze
        db.add(policy)

        action = "EMERGENCY_FREEZE_ACTIVATED" if freeze else "EMERGENCY_FREEZE_DEACTIVATED"
        AuditService.log_event(
            db=db,
            actor_type="USER",
            actor_id=operator_id,
            action=action,
            resource_type="POLICY",
            resource_id=agent_id,
            details={"frozen": freeze}
        )
        db.commit()
        return policy
