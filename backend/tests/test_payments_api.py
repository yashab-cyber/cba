from decimal import Decimal

def test_agent_to_agent_payment_api(client, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]
    key1 = seeded_agents["key1"]

    headers = {
        "X-CBA-API-KEY": key1,
        "Idempotency-Key": "api_test_tx_001"
    }
    payload = {
        "recipient_agent_id": ag2.id,
        "amount": "150.000000",
        "description": "API call for tool execution",
        "service_code": "TOOL_EXECUTION"
    }

    response = client.post("/api/v1/payments", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["transaction"]["status"] == "COMPLETED"
    assert data["verification_status"] == "SETTLED_DOUBLE_ENTRY_BALANCED"
    assert len(data["ledger_entries"]) >= 2
    assert Decimal(str(data["transaction"]["amount"])) == Decimal("150.000000")

    # Idempotent replay: sending identical request with same Idempotency-Key
    replay_resp = client.post("/api/v1/payments", json=payload, headers=headers)
    assert replay_resp.status_code == 200
    assert replay_resp.json()["transaction"]["id"] == data["transaction"]["id"]

def test_invoice_creation_and_approval(client, seeded_agents):
    ag1 = seeded_agents["agent1"]
    ag2 = seeded_agents["agent2"]
    key1 = seeded_agents["key1"]
    key2 = seeded_agents["key2"]

    # ag2 invoices ag1 for 80 CBAC
    inv_headers = {"X-CBA-API-KEY": key2}
    inv_payload = {
        "payer_agent_id": ag1.id,
        "amount": "80.000000",
        "service_code": "DATA_SCRAPING",
        "service_description": "Scraped 200 PDF papers"
    }
    create_resp = client.post("/api/v1/payment-requests", json=inv_payload, headers=inv_headers)
    assert create_resp.status_code == 201
    inv_data = create_resp.json()
    req_id = inv_data["id"]
    assert inv_data["status"] == "PENDING"

    # ag1 approves invoice
    payer_headers = {"X-CBA-API-KEY": key1}
    app_resp = client.post(f"/api/v1/payment-requests/{req_id}/approve", headers=payer_headers)
    assert app_resp.status_code == 200
    assert app_resp.json()["status"] == "FULFILLED"

def test_verified_balance_endpoint(client, seeded_agents):
    ag1 = seeded_agents["agent1"]
    resp = client.get(f"/api/v1/wallets/{ag1.wallet.id}/balance")
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_reconciled"] is True
    assert Decimal(str(data["cached_balance"])) == Decimal(str(data["ledger_verified_balance"]))
