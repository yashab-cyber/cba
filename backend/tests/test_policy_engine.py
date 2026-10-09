import pytest
from decimal import Decimal
from app.services.transaction_service import TransactionService
from app.services.policy_engine import PolicyEngine, PolicyViolationError

def test_spending_policy_max_amount_per_tx(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]
    # ag1 policy has max_amount_per_tx = 500

    # 600 CBAC exceeds max_amount_per_tx
    with pytest.raises(PolicyViolationError) as exc_info:
        TransactionService.execute_payment(
            db=db_session,
            sender_wallet=ag1.wallet,
            recipient_wallet=ag2.wallet,
            amount=Decimal("600.000000"),
            idempotency_key="test_policy_max_fail",
            actor_id=ag1.id
        )

    assert "exceeds max limit" in str(exc_info.value)

def test_emergency_freeze_blocks_spending(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]

    ag1.spending_policy.emergency_freeze = True
    db_session.commit()

    with pytest.raises(PolicyViolationError) as exc_info:
        TransactionService.execute_payment(
            db=db_session,
            sender_wallet=ag1.wallet,
            recipient_wallet=ag2.wallet,
            amount=Decimal("50.000000"),
            idempotency_key="test_policy_freeze_fail",
            actor_id=ag1.id
        )

    assert "Emergency spending freeze is ACTIVE" in str(exc_info.value)

def test_daily_velocity_limit(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]
    # ag1 policy: daily limit is 2000, max per tx is 500

    # Pay 450 four times (total 1800 + fees ~ 1804)
    for i in range(4):
        TransactionService.execute_payment(
            db=db_session,
            sender_wallet=ag1.wallet,
            recipient_wallet=ag2.wallet,
            amount=Decimal("450.000000"),
            idempotency_key=f"velocity_tx_{i}",
            actor_id=ag1.id
        )

    # 5th payment of 450 would push total to ~2255 > 2000 daily limit
    with pytest.raises(PolicyViolationError) as exc_info:
        TransactionService.execute_payment(
            db=db_session,
            sender_wallet=ag1.wallet,
            recipient_wallet=ag2.wallet,
            amount=Decimal("450.000000"),
            idempotency_key="velocity_tx_overflow",
            actor_id=ag1.id
        )

    assert "would exceed 24-hour spending limit" in str(exc_info.value)
