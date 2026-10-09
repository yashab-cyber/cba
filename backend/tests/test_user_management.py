import pytest
from app.models.user import User
from app.models.agent import Agent
from app.security import create_access_token

def test_user_signup_and_login_flow(client, db_session):
    # 1. Sign up a new developer user
    signup_payload = {
        "email": "sarah.connor@cyberdyne.ai",
        "password": "SecurePassword2026!",
        "full_name": "Sarah Connor",
        "organization": "Cyberdyne AI Defense",
        "role": "user",
        "tier": "TIER_1"
    }
    signup_res = client.post("/api/v1/auth/register", json=signup_payload)
    assert signup_res.status_code == 200, signup_res.text
    user_data = signup_res.json()
    assert user_data["email"] == "sarah.connor@cyberdyne.ai"
    assert user_data["full_name"] == "Sarah Connor"
    assert user_data["role"] == "user"
    assert user_data["is_active"] is True
    assert user_data["tier"] == "TIER_1"

    # 2. Reject duplicate email registration
    dup_res = client.post("/api/v1/auth/register", json=signup_payload)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"]

    # 3. Log in with credentials
    login_payload = {
        "email": "sarah.connor@cyberdyne.ai",
        "password": "SecurePassword2026!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200, login_res.text
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == "sarah.connor@cyberdyne.ai"
    assert token_data["user"]["last_login_at"] is not None

def test_user_management_rbac_and_isolation(client, db_session):
    # Find admin user created in conftest db_session
    admin = db_session.query(User).filter(User.role == "admin").first()
    assert admin is not None
    admin_token = create_access_token(subject=admin.id, role=admin.role)

    # Create a regular user
    reg_user = User(
        email="test_dev_client@cba.bank",
        hashed_password="some_hashed_password",
        full_name="Alex Developer",
        organization="Fintech Swarm Corp",
        role="user",
        tier="TIER_1",
        is_active=True
    )
    db_session.add(reg_user)
    db_session.commit()
    db_session.refresh(reg_user)
    reg_token = create_access_token(subject=reg_user.id, role=reg_user.role)

    # 1. Non-admin user cannot access /users directory
    unauth_list = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {reg_token}"}
    )
    assert unauth_list.status_code == 403

    # 2. Admin can list all users
    admin_list = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_list.status_code == 200
    users_list = admin_list.json()
    assert len(users_list) >= 2
    emails = [u["email"] for u in users_list]
    assert "test_dev_client@cba.bank" in emails

    # 3. Admin updates user tier and role
    update_res = client.patch(
        f"/api/v1/users/{reg_user.id}",
        json={"tier": "TIER_2", "kyc_status": "VERIFIED"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["tier"] == "TIER_2"

    # 4. Admin suspends user
    suspend_res = client.post(
        f"/api/v1/users/{reg_user.id}/status",
        json={"is_active": False, "reason": "Compliance review triggered"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert suspend_res.status_code == 200
    assert suspend_res.json()["is_active"] is False

    # 5. Suspended user cannot log in
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "test_dev_client@cba.bank", "password": "some_password"}
    )
    # 401 or 403
    assert login_res.status_code in [401, 403]

def test_multi_tenant_agent_and_wallet_isolation(client, db_session):
    admin = db_session.query(User).filter(User.role == "admin").first()
    admin_token = create_access_token(subject=admin.id, role=admin.role)

    dev_user = User(
        email="developer_isolation_test@cba.bank",
        hashed_password="some_hashed_password",
        full_name="Devin Vance",
        organization="Autonomous AI Labs",
        role="user",
        is_active=True
    )
    db_session.add(dev_user)
    db_session.commit()
    db_session.refresh(dev_user)
    dev_token = create_access_token(subject=dev_user.id, role=dev_user.role)

    # 1. Developer registers an agent
    reg_agent_res = client.post(
        "/api/v1/agents",
        json={
            "id": "agent_isolated_dev_01",
            "name": "Isolated Dev Agent",
            "description": "Agent belonging strictly to Devin",
            "initial_funding": "100.00"
        },
        headers={"Authorization": f"Bearer {dev_token}"}
    )
    assert reg_agent_res.status_code == 201
    created_agent = reg_agent_res.json()
    assert created_agent["owner_id"] == dev_user.id

    # 2. Developer only sees agents they own
    dev_agents_res = client.get(
        "/api/v1/agents",
        headers={"Authorization": f"Bearer {dev_token}"}
    )
    assert dev_agents_res.status_code == 200
    dev_agents = dev_agents_res.json()
    assert len(dev_agents) == 1
    assert dev_agents[0]["id"] == "agent_isolated_dev_01"

    # 3. Developer cannot view details of an agent owned by admin
    admin_agent = Agent(
        id="agent_admin_internal_99",
        name="Admin Sovereign Agent",
        owner_id=admin.id,
        status="ACTIVE"
    )
    db_session.add(admin_agent)
    db_session.commit()

    detail_res = client.get(
        f"/api/v1/agents/{admin_agent.id}",
        headers={"Authorization": f"Bearer {dev_token}"}
    )
    assert detail_res.status_code == 403
    assert "Unauthorized" in detail_res.json()["detail"]

    # 4. IDOR Protection: Developer cannot generate credentials or freeze an agent owned by admin
    cred_res = client.post(
        f"/api/v1/agents/{admin_agent.id}/credentials",
        headers={"Authorization": f"Bearer {dev_token}"}
    )
    assert cred_res.status_code == 403
    assert "Forbidden" in cred_res.json()["detail"] or "permission" in cred_res.json()["detail"]

    freeze_res = client.post(
        f"/api/v1/agents/{admin_agent.id}/freeze?freeze=true",
        headers={"Authorization": f"Bearer {dev_token}"}
    )
    assert freeze_res.status_code == 403

def test_cross_tenant_invoice_and_wallet_authorization(client, db_session):
    admin = db_session.query(User).filter(User.role == "admin").first()
    admin_token = create_access_token(subject=admin.id, role=admin.role)

    # Create User A and User B
    user_a = User(
        email="tenant_a@cba.bank",
        hashed_password="some_hashed_password",
        role="user",
        is_active=True
    )
    user_b = User(
        email="tenant_b@cba.bank",
        hashed_password="some_hashed_password",
        role="user",
        is_active=True
    )
    db_session.add_all([user_a, user_b])
    db_session.commit()

    token_a = create_access_token(subject=user_a.id, role=user_a.role)
    token_b = create_access_token(subject=user_b.id, role=user_b.role)

    # Register Agent for User A and Agent for User B
    res_a = client.post(
        "/api/v1/agents",
        json={"id": "agent_alpha_sec", "name": "Alpha Sec", "initial_funding": "500.00"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res_a.status_code == 201

    res_b = client.post(
        "/api/v1/agents",
        json={"id": "agent_bravo_sec", "name": "Bravo Sec", "initial_funding": "500.00"},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res_b.status_code == 201

    # User A creates a payment request (invoice) billed to User B's agent
    # We can create it via DB or API
    from app.models.payment_request import PaymentRequest
    from datetime import datetime, timezone, timedelta
    from decimal import Decimal

    req = PaymentRequest(
        id="pr_test_sec_idor_01",
        requester_agent_id="agent_alpha_sec",
        payer_agent_id="agent_bravo_sec",
        amount=Decimal("50.000000"),
        service_code="AUDIT_INVOICE",
        service_description="Cross-tenant test invoice",
        status="PENDING",
        expires_at=datetime.now(timezone.utc) + timedelta(days=1)
    )
    db_session.add(req)
    db_session.commit()

    # User A tries to approve the invoice that User B's agent must pay -> 403 Forbidden!
    unauth_approve = client.post(
        f"/api/v1/payment-requests/{req.id}/approve",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert unauth_approve.status_code == 403
    assert "Only the owner of the payer agent can approve" in unauth_approve.json()["detail"]

    # User A tries to view User B's wallet activity -> 403 Forbidden!
    from app.models.wallet import Wallet
    wallet_b = db_session.query(Wallet).filter(Wallet.agent_id == "agent_bravo_sec").first()
    assert wallet_b is not None

    unauth_activity = client.get(
        f"/api/v1/wallets/{wallet_b.id}/activity",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert unauth_activity.status_code == 403
    assert "Access denied" in unauth_activity.json()["detail"]

    # User B (the actual owner) can approve the invoice successfully
    auth_approve = client.post(
        f"/api/v1/payment-requests/{req.id}/approve",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert auth_approve.status_code == 200
    assert auth_approve.json()["status"] == "FULFILLED"
