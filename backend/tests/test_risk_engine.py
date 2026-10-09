from decimal import Decimal
import pytest
from app.services.risk_service import RiskService
from app.models.risk import RiskAlert
from app.services.transaction_service import TransactionService

def test_risk_balance_drain_detection(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"] # Initial balance 5000 CBAC
    ag2 = seeded_agents["agent2"]

    # Attempting to transfer 4900 CBAC (98% of 5000 balance) -> triggers drain anomaly
    risk_score, severity, anomaly_type, action_taken = RiskService.evaluate_payment_risk(
        db=db_session,
        sender_wallet=ag1.wallet,
        recipient_wallet=ag2.wallet,
        amount=Decimal("4900.000000")
    )
    assert risk_score >= 40
    assert anomaly_type == "DRAIN_ATTEMPT"

def test_risk_alerts_api(client, admin_token, db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]

    # Trigger a risk alert
    RiskService.evaluate_payment_risk(
        db=db_session,
        sender_wallet=ag1.wallet,
        recipient_wallet=ag2.wallet,
        amount=Decimal("4800.000000")
    )
    db_session.commit()

    # List alerts via API
    res = client.get(
        "/api/v1/advanced/risk-alerts",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) >= 1
    target_alert = alerts[0]
    assert target_alert["status"] == "ACTIVE"

    # Resolve alert
    resolve_res = client.post(
        f"/api/v1/advanced/risk-alerts/{target_alert['id']}/resolve?decision=RESOLVED",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"
