from decimal import Decimal

def test_central_bank_monetary_expansion_and_reconciliation(client, admin_token, seeded_agents):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Check initial supply
    supply_resp = client.get("/api/v1/central-bank/supply")
    assert supply_resp.status_code == 200
    supply = supply_resp.json()
    assert supply["is_monetary_equation_balanced"] is True

    # 2. Mint 50,000 CBAC
    mint_payload = {
        "amount": "50000.000000",
        "reason": "Economic liquidity stimulus"
    }
    mint_resp = client.post("/api/v1/central-bank/mint", json=mint_payload, headers=headers)
    assert mint_resp.status_code == 200
    assert mint_resp.json()["status"] == "COMPLETED"

    # 3. Allocate 10,000 CBAC to Agent 1
    ag1 = seeded_agents["agent1"]
    alloc_payload = {
        "recipient_agent_id": ag1.id,
        "amount": "10000.000000",
        "reason": "Research grant"
    }
    alloc_resp = client.post("/api/v1/central-bank/allocate", json=alloc_payload, headers=headers)
    assert alloc_resp.status_code == 200

    # 4. Burn 2,000 CBAC from Agent 1
    burn_payload = {
        "source_agent_id": ag1.id,
        "amount": "2000.000000",
        "reason": "Tax retirement"
    }
    burn_resp = client.post("/api/v1/central-bank/burn", json=burn_payload, headers=headers)
    assert burn_resp.status_code == 200

    # 5. Live reconciliation audit
    audit_resp = client.get("/api/v1/central-bank/reconciliation")
    assert audit_resp.status_code == 200
    report = audit_resp.json()
    assert report["is_balanced"] is True
    assert Decimal(str(report["net_imbalance"])) == Decimal("0.000000")
    assert report["cached_vs_ledger_discrepancies_count"] == 0
    assert report["status"] == "VERIFIED_IN_BALANCE"
