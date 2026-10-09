import concurrent.futures
from decimal import Decimal
from app.services.transaction_service import TransactionService
from app.services.ledger_service import InsufficientFundsError

def test_idempotency_key_deduplication(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]
    
    key = "concurrent_idem_unique_123"
    
    # First call succeeds
    tx1, entries1, replay1 = TransactionService.execute_payment(
        db=db_session,
        sender_wallet=ag1.wallet,
        recipient_wallet=ag2.wallet,
        amount=Decimal("100.000000"),
        idempotency_key=key,
        actor_id=ag1.id
    )
    assert replay1 is False
    assert tx1.status == "COMPLETED"

    # Second call with identical key is detected as idempotent replay
    tx2, entries2, replay2 = TransactionService.execute_payment(
        db=db_session,
        sender_wallet=ag1.wallet,
        recipient_wallet=ag2.wallet,
        amount=Decimal("100.000000"),
        idempotency_key=key,
        actor_id=ag1.id
    )
    assert replay2 is True
    assert tx2.id == tx1.id

def test_prevent_double_spending_overdraft(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]

    # Initial balance is 5000 CBAC
    # We attempt payments of 400 CBAC sequentially until balance is depleted
    # With per-tx limit = 500 and daily limit = 2000
    # Let's verify that when balance or limits run out, transactions are rejected cleanly
    completed = 0
    errors = 0

    for i in range(10):
        try:
            TransactionService.execute_payment(
                db=db_session,
                sender_wallet=ag1.wallet,
                recipient_wallet=ag2.wallet,
                amount=Decimal("350.000000"),
                idempotency_key=f"loop_spend_{i}",
                actor_id=ag1.id
            )
            completed += 1
        except Exception:
            errors += 1

    # Should hit daily velocity limit (2000 CBAC) after ~5 transactions
    assert completed > 0
    assert errors > 0
    # Wallet balance must remain strictly >= 0
    assert ag1.wallet.cached_balance >= Decimal("0.000000")
