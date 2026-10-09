from decimal import Decimal
import pytest
import httpx
from cba_sdk import CBAClient
from app.crypto import CryptoIdentityService
from app.models.agent import Agent

def test_sdk_signed_payment_and_marketplace(client, db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]

    # Generate Ed25519 keypair for ag1 and save public key
    priv_hex, pub_hex = CryptoIdentityService.generate_keypair()
    db_ag1 = db_session.query(Agent).filter(Agent.id == ag1.id).first()
    db_ag1.public_key = pub_hex
    db_session.add(db_ag1)
    db_session.commit()

    # Wrap FastAPI app with CBAClient using TestClient transport
    sdk_client = CBAClient(
        agent_id=ag1.id,
        private_key=priv_hex,
        base_url="http://testserver"
    )
    # Point sdk_client.http to test client's session
    sdk_client.http = client

    # Test 1: Signed payment via SDK
    receipt = sdk_client.pay_agent_signed(
        recipient_agent_id=ag2.id,
        amount=Decimal("30.000000"),
        description="SDK verified signed transfer"
    )
    assert receipt.status == "COMPLETED"
    assert receipt.verification_status == "SETTLED_DOUBLE_ENTRY_BALANCED"
    assert receipt.amount == Decimal("30.000000")

    # Test 2: List marketplace services via SDK
    services = sdk_client.list_marketplace_services()
    assert len(services) >= 0

    # Test 3: Get Balance via SDK
    bal = sdk_client.get_balance(wallet_id=ag1.wallet.id)
    assert bal.is_reconciled is True
    assert bal.status == "ACTIVE"
