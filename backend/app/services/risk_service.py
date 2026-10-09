import uuid
import json
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.risk import RiskAlert
from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.models.agent import Agent
from app.services.audit_service import AuditService

class RiskService:
    @classmethod
    def evaluate_payment_risk(
        cls,
        db: Session,
        sender_wallet: Wallet,
        recipient_wallet: Wallet,
        amount: Decimal
    ) -> Tuple[int, str, Optional[str], Optional[str]]:
        """
        Evaluates risk score (0-100), severity, anomaly type, and automated action.
        Returns:
            (risk_score, severity, anomaly_type, action_taken)
        """
        risk_score = 0
        reasons = []
        anomaly_type = None
        action_taken = "LOGGED"

        now = datetime.now(timezone.utc)
        one_minute_ago = now - timedelta(seconds=60)

        # 1. Velocity Burst Check: Count txs in last 60s
        recent_tx_count = db.query(Transaction).filter(
            Transaction.sender_wallet_id == sender_wallet.id,
            Transaction.created_at >= one_minute_ago
        ).count()

        if recent_tx_count >= 5:
            risk_score += 45
            reasons.append(f"High frequency velocity burst ({recent_tx_count} txs in last 60 seconds)")
            anomaly_type = "VELOCITY_BURST"

        # 2. Wallet Balance Drain Check: amount > 85% of total balance
        if sender_wallet.cached_balance > Decimal("0.000000"):
            drain_ratio = amount / sender_wallet.cached_balance
            if drain_ratio >= Decimal("0.85"):
                risk_score += 40
                reasons.append(f"Suspicious balance drain: transferring {float(drain_ratio)*100:.1f}% of entire wallet balance")
                if not anomaly_type:
                    anomaly_type = "DRAIN_ATTEMPT"

        # 3. Micro-transaction Spam Check: amount < 0.001 CBAC with rapid count
        if amount < Decimal("0.001000") and recent_tx_count >= 3:
            risk_score += 25
            reasons.append("Micro-dust spam transaction pattern detected")
            if not anomaly_type:
                anomaly_type = "MICRO_SPAM_FLOOD"

        # Determine severity & action
        severity = "LOW"
        if risk_score >= 80:
            severity = "CRITICAL"
            action_taken = "AGENT_AUTO_FROZEN"
            # Auto freeze spending policy if critical
            if sender_wallet.agent and sender_wallet.agent.spending_policy:
                sender_wallet.agent.spending_policy.emergency_freeze = True
                db.add(sender_wallet.agent.spending_policy)
        elif risk_score >= 50:
            severity = "HIGH"
            action_taken = "FLAGGED_FOR_AUDIT"
        elif risk_score >= 25:
            severity = "MEDIUM"

        # If any anomaly detected, log RiskAlert record
        if risk_score >= 25 and sender_wallet.agent_id:
            alert = RiskAlert(
                id=f"risk_{uuid.uuid4().hex[:14]}",
                agent_id=sender_wallet.agent_id,
                transaction_id=None,
                risk_score=risk_score,
                severity=severity,
                anomaly_type=anomaly_type or "BEHAVIORAL_ANOMALY",
                details_json=json.dumps({"reasons": reasons, "amount": str(amount), "balance": str(sender_wallet.cached_balance)}),
                status="ACTIVE",
                action_taken=action_taken,
                created_at=now
            )
            db.add(alert)
            AuditService.log_event(
                db=db,
                actor_type="SYSTEM_RISK_ENGINE",
                actor_id="risk_service",
                action="TRIGGER_RISK_ALERT",
                resource_type="AGENT",
                resource_id=sender_wallet.agent_id,
                details={"score": risk_score, "severity": severity, "action": action_taken}
            )

        return risk_score, severity, anomaly_type, action_taken

    @classmethod
    def list_alerts(cls, db: Session, status: Optional[str] = None) -> List[RiskAlert]:
        query = db.query(RiskAlert)
        if status:
            query = query.filter(RiskAlert.status == status.upper())
        return query.order_by(RiskAlert.created_at.desc()).all()

    @classmethod
    def resolve_alert(cls, db: Session, alert_id: str, operator_id: str, status_decision: str = "RESOLVED") -> RiskAlert:
        alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
        if not alert:
            raise ValueError(f"Risk alert '{alert_id}' not found")
        alert.status = status_decision.upper()
        db.add(alert)
        AuditService.log_event(
            db=db,
            actor_type="USER",
            actor_id=operator_id,
            action="RESOLVE_RISK_ALERT",
            resource_type="RISK_ALERT",
            resource_id=alert.id,
            details={"decision": status_decision}
        )
        db.commit()
        db.refresh(alert)
        return alert
