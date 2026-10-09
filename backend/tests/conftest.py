import pytest
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

import app.models  # Ensure all models are registered in Base.metadata
from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.security import get_password_hash, create_access_token
from app.services.central_bank_service import CentralBankService
from app.services.agent_service import AgentService
from app.schemas.policy import SpendingPolicyBase

# In-memory SQLite with StaticPool so all connections share the same memory instance
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    
    # Initialize system accounts & mint initial 1M CBAC
    CentralBankService.get_or_create_system_wallets(db)
    
    # Create test admin
    admin = User(
        email="test_admin@cba.bank",
        hashed_password=get_password_hash("password123"),
        role="admin",
        is_active=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    CentralBankService.mint_credits(
        db=db,
        amount=Decimal("1000000.000000"),
        reason="Test Genesis Minting",
        operator_id=admin.id
    )

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def admin_token(db_session):
    admin = db_session.query(User).filter(User.email == "test_admin@cba.bank").first()
    return create_access_token(subject=admin.id, role="admin")

@pytest.fixture(scope="function")
def seeded_agents(db_session):
    admin = db_session.query(User).filter(User.email == "test_admin@cba.bank").first()
    
    # Agent 1
    ag1 = AgentService.create_agent(
        db=db_session,
        agent_id="agent_test_1",
        name="Test Agent One",
        owner_id=admin.id,
        initial_policy=SpendingPolicyBase(
            max_amount_per_tx=Decimal("500.000000"),
            daily_spending_limit=Decimal("2000.000000"),
            human_approval_threshold=Decimal("1000.000000")
        ),
        initial_funding=Decimal("5000.000000")
    )
    cred1, key1 = AgentService.generate_credentials(db_session, ag1.id, operator_id=admin.id)

    # Agent 2
    ag2 = AgentService.create_agent(
        db=db_session,
        agent_id="agent_test_2",
        name="Test Agent Two",
        owner_id=admin.id,
        initial_funding=Decimal("1000.000000")
    )
    cred2, key2 = AgentService.generate_credentials(db_session, ag2.id, operator_id=admin.id)

    return {
        "agent1": ag1, "key1": key1,
        "agent2": ag2, "key2": key2
    }
