from decimal import Decimal

def test_valid_agent_api_key_auth(client, seeded_agents):
    ag1 = seeded_agents["agent1"]
    key1 = seeded_agents["key1"]

    headers = {"X-CBA-API-KEY": key1}
    payload = {
        "payer_agent_id": seeded_agents["agent2"].id,
        "amount": "10.000000",
        "service_code": "TEST_SVC"
    }

    # Should succeed with valid API key
    res = client.post("/api/v1/payment-requests", json=payload, headers=headers)
    assert res.status_code == 201

def test_invalid_agent_api_key_rejected(client, seeded_agents):
    headers = {"X-CBA-API-KEY": "cba_live_invalid_bad_key_1234567890"}
    payload = {
        "payer_agent_id": seeded_agents["agent2"].id,
        "amount": "10.000000",
        "service_code": "TEST_SVC"
    }

    res = client.post("/api/v1/payment-requests", json=payload, headers=headers)
    assert res.status_code == 401
    assert "Invalid agent API key" in res.json()["detail"]

def test_bearer_prefix_agent_api_key(client, seeded_agents):
    key1 = seeded_agents["key1"]

    # Passing API key via Authorization: Bearer cba_live_...
    headers = {"Authorization": f"Bearer {key1}"}
    payload = {
        "payer_agent_id": seeded_agents["agent2"].id,
        "amount": "15.000000",
        "service_code": "TEST_SVC_BEARER"
    }

    res = client.post("/api/v1/payment-requests", json=payload, headers=headers)
    assert res.status_code == 201
