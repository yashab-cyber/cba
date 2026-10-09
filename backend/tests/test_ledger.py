import pytest
from decimal import Decimal
from app.services.ledger_service import (
    LedgerService, LedgerImbalanceError, InsufficientFundsError
)
from app.models.wallet import Wallet
from app.models.ledger import LedgerAccount, LedgerEntry
from app.config import settings

def test_atomic_double_entry_settlement(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]

    initial_bal1 = ag1.wallet.cached_balance
    initial_bal2 = ag2.wallet.cached_balance

    acc1 = LedgerService.get_account_by_wallet_id(db_session, ag1.wallet.id)
    acc2 = LedgerService.get_account_by_wallet_id(db_session, ag2.wallet.id)

    transfer_amount = Decimal("100.000000")
    entries = [
        (acc1, "DEBIT", transfer_amount),
        (acc2, "CREDIT", transfer_amount)
    ]

    created = LedgerService.record_journal_entries(db_session, "test_tx_001", entries)
    assert len(created) == 2

    # Check updated balances
    assert ag1.wallet.cached_balance == initial_bal1 - transfer_amount
    assert ag2.wallet.cached_balance == initial_bal2 + transfer_amount

    # Check recomputed ledger balance matches cached balance exactly
    computed_bal1 = LedgerService.compute_account_balance(db_session, acc1.id)
    computed_bal2 = LedgerService.compute_account_balance(db_session, acc2.id)
    assert computed_bal1 == ag1.wallet.cached_balance
    assert computed_bal2 == ag2.wallet.cached_balance

def test_imbalanced_journal_raises_error(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]

    acc1 = LedgerService.get_account_by_wallet_id(db_session, ag1.wallet.id)
    acc2 = LedgerService.get_account_by_wallet_id(db_session, ag2.wallet.id)

    # Imbalanced: Debit 100 vs Credit 90
    entries = [
        (acc1, "DEBIT", Decimal("100.000000")),
        (acc2, "CREDIT", Decimal("90.000000"))
    ]

    with pytest.raises(LedgerImbalanceError) as exc_info:
        LedgerService.record_journal_entries(db_session, "test_tx_imbalanced", entries)

    assert "Ledger imbalance detected" in str(exc_info.value)

def test_insufficient_funds_rejection(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]

    acc1 = LedgerService.get_account_by_wallet_id(db_session, ag1.wallet.id)
    acc2 = LedgerService.get_account_by_wallet_id(db_session, ag2.wallet.id)

    # ag1 has 5000, attempt to spend 999999
    insane_amount = Decimal("999999.000000")
    entries = [
        (acc1, "DEBIT", insane_amount),
        (acc2, "CREDIT", insane_amount)
    ]

    with pytest.raises(InsufficientFundsError) as exc_info:
        LedgerService.record_journal_entries(db_session, "test_tx_overdraft", entries)

    assert "insufficient funds" in str(exc_info.value)
    # Balance should not have changed
    assert ag1.wallet.cached_balance == Decimal("5000.000000")

def test_cryptographic_hash_chain(db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]
    acc1 = LedgerService.get_account_by_wallet_id(db_session, ag1.wallet.id)
    acc2 = LedgerService.get_account_by_wallet_id(db_session, ag2.wallet.id)

    entries = [
        (acc1, "DEBIT", Decimal("5.000000")),
        (acc2, "CREDIT", Decimal("5.000000"))
    ]
    created = LedgerService.record_journal_entries(db_session, "test_tx_chain", entries)

    assert created[0].entry_hash is not None
    assert len(created[0].entry_hash) == 64 # SHA-256 hex string
    assert created[1].previous_entry_hash == created[0].entry_hash
