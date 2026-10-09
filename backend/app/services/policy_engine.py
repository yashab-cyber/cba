import json
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.agent import Agent
from app.models.policy import SpendingPolicy
from app.models.transaction import Transaction

class PolicyViolationError(Exception):
    """Raised when a payment violates the agent's spending policy."""
    pass

class PolicyEngine:
    @staticmethod
    def evaluate_payment(
        db: Session,
        sender_agent: Agent,
        recipient_agent: Optional[Agent],
        amount: Decimal,
        fee_amount: Decimal
    ) -> Tuple[bool, Optional[str], bool]:
        """
        Evaluates a proposed payment against the sender agent's spending policy.
        Returns:
            (is_allowed: bool, rejection_reason: Optional[str], requires_human_approval: bool)
        """
        # 1. Operational status checks
        if sender_agent.status == "SUSPENDED":
            return False, f"Sender agent '{sender_agent.id}' is currently SUSPENDED", False
        if sender_agent.status == "REVOKED":
            return False, f"Sender agent '{sender_agent.id}' credentials have been REVOKED", False

        if recipient_agent and recipient_agent.status == "REVOKED":
            return False, f"Recipient agent '{recipient_agent.id}' has been REVOKED", False

        # 2. Retrieve spending policy
        policy = db.query(SpendingPolicy).filter(SpendingPolicy.agent_id == sender_agent.id).first()
        if not policy:
            # Default fallback policy if none explicitly attached
            return True, None, False

        # 3. Emergency freeze check
        if policy.emergency_freeze:
            return False, "Emergency spending freeze is ACTIVE for this agent", False

        # 4. Maximum amount per transaction
        total_deduction = amount + fee_amount
        if total_deduction > policy.max_amount_per_tx:
            return False, f"Transaction total ({total_deduction} CBAC) exceeds max limit of {policy.max_amount_per_tx} CBAC per transaction", False

        # 5. Counterparty allowlist check
        try:
            allowed = json.loads(policy.allowed_counterparties_json)
        except Exception:
            allowed = "ALL"

        if allowed != "ALL" and recipient_agent:
            if isinstance(allowed, list) and recipient_agent.id not in allowed:
                return False, f"Recipient '{recipient_agent.id}' is not in authorized counterparties allowlist", False

        # 6. Velocity limit: Rolling 24-hour spending
        since_24h = datetime.now(timezone.utc) - timedelta(hours=24)
        rolling_24h_spend = db.query(
            func.coalesce(func.sum(Transaction.amount + Transaction.fee_amount), Decimal("0.000000"))
        ).filter(
            Transaction.sender_wallet_id == sender_agent.wallet.id,
            Transaction.status == "COMPLETED",
            Transaction.created_at >= since_24h
        ).scalar()

        rolling_24h_spend = Decimal(str(rolling_24h_spend))
        if rolling_24h_spend + total_deduction > policy.daily_spending_limit:
            return False, f"Payment would exceed 24-hour spending limit ({rolling_24h_spend + total_deduction} / {policy.daily_spending_limit} CBAC)", False

        # 7. Human approval escalation threshold
        requires_human_approval = False
        if amount >= policy.human_approval_threshold:
            requires_human_approval = True

        return True, None, requires_human_approval
