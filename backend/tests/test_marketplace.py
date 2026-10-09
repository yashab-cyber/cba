from decimal import Decimal
import pytest
from app.models.wallet import Wallet
from app.models.marketplace import ServiceListing

def test_marketplace_create_listing_and_discovery(client, db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    key1 = seeded_agents["key1"]

    # 1. Create Service Listing as Agent 1
    create_res = client.post(
        "/api/v1/marketplace/services",
        headers={"X-CBA-API-KEY": key1},
        json={
            "service_code": "GPU_INFERENCE_LLAMA_70B",
            "title": "Llama 3.3 70B Quantized Inference Slice",
            "description": "High-throughput token inference endpoint",
            "category": "INFERENCE",
            "pricing_model": "PER_UNIT",
            "price_per_unit": 25.0,
            "currency": "CBAC",
            "unit_name": "1,000,000 tokens",
            "endpoint_url": "https://api.agent1.cba/v1/generate"
        }
    )
    assert create_res.status_code == 201, create_res.text
    svc = create_res.json()
    assert svc["id"].startswith("svc_")
    assert svc["service_code"] == "GPU_INFERENCE_LLAMA_70B"
    assert Decimal(str(svc["price_per_unit"])) == Decimal("25.000000")

    # 2. Discover Services
    list_res = client.get("/api/v1/marketplace/services")
    assert list_res.status_code == 200
    services = list_res.json()
    assert any(s["id"] == svc["id"] for s in services)

    # 3. Filter by Category
    filter_res = client.get("/api/v1/marketplace/services?category=INFERENCE")
    assert filter_res.status_code == 200
    assert all(s["category"] == "INFERENCE" for s in filter_res.json())

def test_marketplace_order_settlement_and_token_issuance(client, db_session, seeded_agents):
    ag1 = seeded_agents["agent1"] # Provider
    key1 = seeded_agents["key1"]
    ag2 = seeded_agents["agent2"] # Buyer
    key2 = seeded_agents["key2"]

    # Provider creates service
    create_res = client.post(
        "/api/v1/marketplace/services",
        headers={"X-CBA-API-KEY": key1},
        json={
            "service_code": "AST_SECURITY_SCAN",
            "title": "Smart Contract AST Vulnerability Audit",
            "category": "SECURITY",
            "price_per_unit": 50.0,
            "unit_name": "1 Code Scan"
        }
    )
    assert create_res.status_code == 201
    svc_id = create_res.json()["id"]

    buyer_initial_bal = db_session.query(Wallet).filter(Wallet.id == ag2.wallet.id).first().cached_balance
    provider_initial_bal = db_session.query(Wallet).filter(Wallet.id == ag1.wallet.id).first().cached_balance

    # Buyer orders 2 units
    units = 2.0
    expected_cost = Decimal("100.000000")

    order_res = client.post(
        f"/api/v1/marketplace/services/{svc_id}/order",
        headers={
            "X-CBA-API-KEY": key2,
            "Idempotency-Key": "order_market_test_001"
        },
        json={
            "units": units
        }
    )
    assert order_res.status_code == 200, order_res.text
    order_data = order_res.json()

    assert order_data["id"].startswith("ord_")
    assert order_data["status"] == "COMPLETED"
    assert Decimal(str(order_data["total_price"])) == expected_cost
    assert order_data["access_token"].startswith("cba_token_")
    assert order_data["transaction_id"].startswith("tx_")

    # Verify wallet balance settlements
    db_session.expire_all()
    buyer_after_bal = db_session.query(Wallet).filter(Wallet.id == ag2.wallet.id).first().cached_balance
    provider_after_bal = db_session.query(Wallet).filter(Wallet.id == ag1.wallet.id).first().cached_balance

    # Buyer pays cost + 0.1 CBAC system transaction fee
    fee = Decimal("0.100000")
    assert buyer_after_bal == buyer_initial_bal - expected_cost - fee
    assert provider_after_bal == provider_initial_bal + expected_cost

    # Verify total orders counter incremented
    listing = db_session.query(ServiceListing).filter(ServiceListing.id == svc_id).first()
    assert listing.total_orders == 1

def test_marketplace_self_purchase_rejected(client, db_session, seeded_agents):
    ag1 = seeded_agents["agent1"]
    key1 = seeded_agents["key1"]

    create_res = client.post(
        "/api/v1/marketplace/services",
        headers={"X-CBA-API-KEY": key1},
        json={
            "service_code": "DATA_FEED",
            "title": "Crypto Oracle Price Feed",
            "category": "DATA",
            "price_per_unit": 10.0,
            "unit_name": "100 Queries"
        }
    )
    svc_id = create_res.json()["id"]

    # Try purchasing own listing
    order_res = client.post(
        f"/api/v1/marketplace/services/{svc_id}/order",
        headers={"X-CBA-API-KEY": key1},
        json={"units": 1.0}
    )
    assert order_res.status_code == 400
    assert "cannot purchase its own" in order_res.text.lower()
