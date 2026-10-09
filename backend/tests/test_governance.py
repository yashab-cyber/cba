import pytest

def test_governance_multi_party_workflow(client, admin_token):
    # 1. Create a proposal
    res_prop = client.post(
        "/api/v1/advanced/proposals",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "action_type": "MINT_EXPANSION",
            "payload": {"amount": "500000", "reason": "Treasury reserve expansion"},
            "required_approvals": 2
        }
    )
    assert res_prop.status_code == 201
    prop = res_prop.json()
    assert prop["id"].startswith("prop_")
    assert prop["current_approvals_count"] == 1
    assert prop["status"] == "PENDING"

    # 2. List proposals
    res_list = client.get(
        "/api/v1/advanced/proposals",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_list.status_code == 200
    assert any(p["id"] == prop["id"] for p in res_list.json())
