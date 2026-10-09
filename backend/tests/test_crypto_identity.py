import time
from decimal import Decimal
import pytest
from app.crypto import CryptoIdentityService
from app.models.agent import Agent

def test_crypto_keypair_generation_and_payment_signing():
    priv_hex, pub_hex = CryptoIdentityService.generate_keypair()
    assert len(priv_hex) == 64
    assert len(pub_hex) == 64

    now_ts = int(time.time())
    sig_hex = CryptoIdentityService.sign_payment(
        private_key_hex=priv_hex,
        timestamp=now_ts,
        sender_agent_id="agent_alpha",
        recipient_agent_id="agent_beta",
        amount="150.000000",
        idempotency_key="tx_canonical_001"
    )
    assert len(sig_hex) == 128  # 64 bytes hex = 128 chars

    is_valid, reason = CryptoIdentityService.verify_payment_signature(
        public_key_hex=pub_hex,
        signature_hex=sig_hex,
        timestamp=now_ts,
        sender_agent_id="agent_alpha",
        recipient_agent_id="agent_beta",
        amount="150.000000",
        idempotency_key="tx_canonical_001"
    )
    assert is_valid is True
    assert reason == "SIGNATURE_VERIFIED"

def test_crypto_tampered_payload_rejected():
    priv_hex, pub_hex = CryptoIdentityService.generate_keypair()
    now_ts = int(time.time())
    sig_hex = CryptoIdentityService.sign_payment(
        private_key_hex=priv_hex,
        timestamp=now_ts,
        sender_agent_id="agent_alpha",
        recipient_agent_id="agent_beta",
        amount="50.000000",
        idempotency_key="tx_canonical_002"
    )

    # Tampered amount
    is_valid, reason = CryptoIdentityService.verify_payment_signature(
        public_key_hex=pub_hex,
        signature_hex=sig_hex,
        timestamp=now_ts,
        sender_agent_id="agent_alpha",
        recipient_agent_id="agent_beta",
        amount="5000.000000",
        idempotency_key="tx_canonical_002"
    )
    assert is_valid is False

    # Tampered counterparty
    is_valid, reason = CryptoIdentityService.verify_payment_signature(
        public_key_hex=pub_hex,
        signature_hex=sig_hex,
        timestamp=now_ts,
        sender_agent_id="agent_alpha",
        recipient_agent_id="agent_adversary",
        amount="50.000000",
        idempotency_key="tx_canonical_002"
    )
    assert is_valid is False

def test_crypto_expired_timestamp_replay_prevention():
    priv_hex, pub_hex = CryptoIdentityService.generate_keypair()
    old_ts = int(time.time()) - 600  # 10 minutes ago (> 300s clock skew)

    sig_hex = CryptoIdentityService.sign_payment(
        private_key_hex=priv_hex,
        timestamp=old_ts,
        sender_agent_id="agent_alpha",
        recipient_agent_id="agent_beta",
        amount="50.000000",
        idempotency_key="tx_canonical_003"
    )

    is_valid, reason = CryptoIdentityService.verify_payment_signature(
        public_key_hex=pub_hex,
        signature_hex=sig_hex,
        timestamp=old_ts,
        sender_agent_id="agent_alpha",
        recipient_agent_id="agent_beta",
        amount="50.000000",
        idempotency_key="tx_canonical_003",
        max_clock_skew_seconds=300
    )
    assert is_valid is False
    assert "expired" in reason.lower()

def test_signed_payment_api_execution(client, db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]

    # Generate and bind Ed25519 keypair to ag1
    priv_hex, pub_hex = CryptoIdentityService.generate_keypair()
    db_agent = db_session.query(Agent).filter(Agent.id == ag1.id).first()
    db_agent.public_key = pub_hex
    db_session.add(db_agent)
    db_session.commit()

    now_ts = int(time.time())
    idem_key = "signed_payment_test_001"
    amount_str = "120.000000"

    sig_hex = CryptoIdentityService.sign_payment(
        private_key_hex=priv_hex,
        timestamp=now_ts,
        sender_agent_id=ag1.id,
        recipient_agent_id=ag2.id,
        amount=amount_str,
        idempotency_key=idem_key
    )

    # Execute signed payment
    res = client.post(
        "/api/v1/payments",
        headers={
            "X-CBA-AGENT-ID": ag1.id,
            "X-CBA-SIGNATURE": sig_hex,
            "X-CBA-TIMESTAMP": str(now_ts),
            "Idempotency-Key": idem_key
        },
        json={
            "recipient_agent_id": ag2.id,
            "amount": 120.0,
            "description": "Cryptographically signed settlement via Ed25519"
        }
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["transaction"]["status"] == "COMPLETED"
    assert data["verification_status"] == "SETTLED_DOUBLE_ENTRY_BALANCED"

    # Forged signature attempt must be rejected with 401
    bad_sig = "a" * 128
    res_bad = client.post(
        "/api/v1/payments",
        headers={
            "X-CBA-AGENT-ID": ag1.id,
            "X-CBA-SIGNATURE": bad_sig,
            "X-CBA-TIMESTAMP": str(now_ts),
            "Idempotency-Key": "forged_tx_001"
        },
        json={
            "recipient_agent_id": ag2.id,
            "amount": 10.0,
            "description": "Attempted forged payment"
        }
    )
    assert res_bad.status_code == 401
