import os
import sys
from decimal import Decimal

# Ensure app is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import engine, SessionLocal, Base
from app.models import User, Agent, Wallet, SpendingPolicy, Transaction, LedgerAccount, LedgerEntry, PaymentRequest, AuditEvent
from app.security import get_password_hash
from app.services.central_bank_service import CentralBankService
from app.services.agent_service import AgentService
from app.services.transaction_service import TransactionService
from app.schemas.policy import SpendingPolicyBase
from app.config import settings

def seed_database():
    print("=" * 60)
    print("Initializing Central Bank of Agents (CBA) Database...")
    print("=" * 60)
    
    # 1. Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 2. Ensure system accounts and wallets exist
        CentralBankService.get_or_create_system_wallets(db)
        print("[+] System Reserve, Treasury, Fee Pool, and Burn accounts initialized.")

        # 3. Create Default Admin User
        admin_user = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.DEFAULT_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"[+] Master Admin User created: {admin_user.email} (Password: {settings.DEFAULT_ADMIN_PASSWORD})")
        else:
            print(f"[*] Admin user already exists: {admin_user.email}")

        # 4. Mint Initial Monetary Base into Treasury
        treasury_wallet = db.query(Wallet).filter(Wallet.id == "wal_central_treasury").first()
        if treasury_wallet.cached_balance < Decimal("100000.000000"):
            initial_mint_amount = Decimal("1000000.000000") # 1,000,000 CBAC
            mint_tx = CentralBankService.mint_credits(
                db=db,
                amount=initial_mint_amount,
                reason="Initial Genesis Monetary Supply Expansion for Autonomous Agent Economy",
                operator_id=admin_user.id
            )
            print(f"[+] Minted {initial_mint_amount} CBAC into Central Bank Treasury (Tx ID: {mint_tx.id})")
        else:
            print(f"[*] Treasury already funded: {treasury_wallet.cached_balance} CBAC")

        # 5. Seed Realistic AI Agents
        demo_agents_data = [
            {
                "id": "agent_search_01",
                "name": "Agent Alpha (Search & Data Retriever)",
                "description": "Autonomous search agent performing multi-source web crawling and vector database retrieval.",
                "funding": Decimal("25000.000000"),
                "policy": SpendingPolicyBase(
                    max_amount_per_tx=Decimal("1500.000000"),
                    daily_spending_limit=Decimal("6000.000000"),
                    monthly_spending_limit=Decimal("50000.000000"),
                    human_approval_threshold=Decimal("2000.000000"),
                    allowed_counterparties="ALL"
                )
            },
            {
                "id": "agent_coder_02",
                "name": "Agent Beta (Code Synthesis & Refactor)",
                "description": "Full-stack code generation and test synthesis agent handling complex software pipelines.",
                "funding": Decimal("35000.000000"),
                "policy": SpendingPolicyBase(
                    max_amount_per_tx=Decimal("2500.000000"),
                    daily_spending_limit=Decimal("10000.000000"),
                    monthly_spending_limit=Decimal("75000.000000"),
                    human_approval_threshold=Decimal("3000.000000"),
                    allowed_counterparties="ALL"
                )
            },
            {
                "id": "agent_gpu_03",
                "name": "Agent Gamma (H100 GPU Inference Cluster)",
                "description": "Computational infrastructure agent leasing quantized LLM inference and batch embeddings.",
                "funding": Decimal("100000.000000"),
                "policy": SpendingPolicyBase(
                    max_amount_per_tx=Decimal("15000.000000"),
                    daily_spending_limit=Decimal("50000.000000"),
                    monthly_spending_limit=Decimal("200000.000000"),
                    human_approval_threshold=Decimal("10000.000000"),
                    allowed_counterparties="ALL"
                )
            },
            {
                "id": "agent_audit_04",
                "name": "Agent Delta (Security & Compliance Auditor)",
                "description": "Automated auditor inspecting smart contracts, transaction anomalies, and policy conformance.",
                "funding": Decimal("15000.000000"),
                "policy": SpendingPolicyBase(
                    max_amount_per_tx=Decimal("800.000000"),
                    daily_spending_limit=Decimal("3000.000000"),
                    monthly_spending_limit=Decimal("20000.000000"),
                    human_approval_threshold=Decimal("1200.000000"),
                    allowed_counterparties="ALL"
                )
            }
        ]

        agent_keys = {}
        for ag_data in demo_agents_data:
            existing = db.query(Agent).filter(Agent.id == ag_data["id"]).first()
            if not existing:
                agent = AgentService.create_agent(
                    db=db,
                    agent_id=ag_data["id"],
                    name=ag_data["name"],
                    owner_id=admin_user.id,
                    description=ag_data["description"],
                    initial_policy=ag_data["policy"],
                    initial_funding=ag_data["funding"]
                )
                cred, raw_key = AgentService.generate_credentials(db, agent.id, operator_id=admin_user.id)
                agent_keys[agent.id] = raw_key
                print(f"[+] Agent Registered: {agent.name} (Wallet: {agent.wallet.id}, Bal: {agent.wallet.cached_balance} CBAC)")
                print(f"    -> API Key: {raw_key}")
            else:
                print(f"[*] Agent already exists: {existing.id} (Bal: {existing.wallet.cached_balance} CBAC)")

        # 6. Execute sample transactions between agents
        agent_alpha = db.query(Agent).filter(Agent.id == "agent_search_01").first()
        agent_beta = db.query(Agent).filter(Agent.id == "agent_coder_02").first()
        agent_gamma = db.query(Agent).filter(Agent.id == "agent_gpu_03").first()
        agent_delta = db.query(Agent).filter(Agent.id == "agent_audit_04").first()

        sample_tx_count = db.query(Transaction).filter(Transaction.transaction_type == "SERVICE_PAYMENT").count()
        if sample_tx_count == 0 and agent_alpha and agent_gamma:
            print("[+] Simulating initial agent-to-agent economic payments...")
            # Tx 1: Alpha pays Gamma for vector embeddings
            TransactionService.execute_payment(
                db=db,
                sender_wallet=agent_alpha.wallet,
                recipient_wallet=agent_gamma.wallet,
                amount=Decimal("120.500000"),
                idempotency_key="seed_tx_001_alpha_gamma_embeddings",
                description="Payment for 50,000 vector embedding dimensions (text-embedding-3-large)",
                service_code="EMBEDDING_INFERENCE_BATCH",
                actor_id=agent_alpha.id
            )
            # Tx 2: Beta pays Gamma for GPU fine-tuning compute
            TransactionService.execute_payment(
                db=db,
                sender_wallet=agent_beta.wallet,
                recipient_wallet=agent_gamma.wallet,
                amount=Decimal("450.000000"),
                idempotency_key="seed_tx_002_beta_gamma_gpu",
                description="H100 4-hour LoRA fine-tuning compute slice",
                service_code="GPU_COMPUTE_H100",
                actor_id=agent_beta.id
            )
            # Tx 3: Delta pays Beta for AST static analyzer parser module
            TransactionService.execute_payment(
                db=db,
                sender_wallet=agent_delta.wallet,
                recipient_wallet=agent_beta.wallet,
                amount=Decimal("75.000000"),
                idempotency_key="seed_tx_003_delta_beta_ast",
                description="Automated AST security parsing library module purchase",
                service_code="CODE_TOOL_DELIVERY",
                actor_id=agent_delta.id
            )
            print("[+] 3 Sample inter-agent transactions executed and settled via double-entry ledger.")

        # 7. Create sample pending invoice
        pending_inv = db.query(PaymentRequest).filter(PaymentRequest.requester_agent_id == "agent_gpu_03").first()
        if not pending_inv and agent_gamma and agent_alpha:
            inv = PaymentRequest(
                id="pr_demo_invoice_01",
                requester_agent_id=agent_gamma.id,
                payer_agent_id=agent_alpha.id,
                amount=Decimal("250.000000"),
                currency="CBAC",
                service_code="LLM_INFERENCE_QWEN_72B",
                service_description="Inference quota for 100,000 reasoning tokens on Qwen-2.5-72B-Instruct",
                status="PENDING"
            )
            db.add(inv)
            db.commit()
            print(f"[+] Sample pending invoice created: {inv.id} ({inv.amount} CBAC from Agent Alpha to Agent Gamma)")

        # 8. Ensure Ed25519 Public Keys for All Agents
        from app.crypto import CryptoIdentityService
        all_agents = db.query(Agent).all()
        for ag in all_agents:
            if not ag.public_key:
                priv, pub = CryptoIdentityService.generate_keypair()
                ag.public_key = pub
                db.add(ag)
                print(f"[+] Generated Ed25519 Keypair for {ag.id} (Public: {pub[:16]}...)")
        db.commit()

        # 9. Seed Agent Service Marketplace Listings
        from app.models.marketplace import ServiceListing
        from app.services.marketplace_service import MarketplaceService
        from app.schemas.marketplace import ServiceListingCreate

        marketplace_seed_items = [
            {
                "provider_id": "agent_gpu_03",
                "payload": ServiceListingCreate(
                    service_code="GPU_COMPUTE_H100",
                    title="NVIDIA H100 SXM5 Dedicated GPU Compute",
                    description="High-throughput 80GB SXM5 GPU compute slice for LLM fine-tuning and heavy tensor workloads.",
                    category="COMPUTE",
                    pricing_model="PER_UNIT",
                    price_per_unit=Decimal("15.000000"),
                    currency="CBAC",
                    unit_name="1 GPU-hour",
                    endpoint_url="https://gpu-mesh.cba.internal/v1/compute/h100"
                )
            },
            {
                "provider_id": "agent_gpu_03",
                "payload": ServiceListingCreate(
                    service_code="LLM_INFERENCE_DEEPSEEK_V3",
                    title="DeepSeek-V3 Reasoning Model Inference API",
                    description="Ultra low-latency quantized inference endpoint for high-reasoning autonomous agent chains.",
                    category="INFERENCE",
                    pricing_model="PER_UNIT",
                    price_per_unit=Decimal("1.250000"),
                    currency="CBAC",
                    unit_name="1M tokens",
                    endpoint_url="https://inference.cba.internal/v1/chat/completions"
                )
            },
            {
                "provider_id": "agent_coder_02",
                "payload": ServiceListingCreate(
                    service_code="CODE_SYNTHESIS_PR",
                    title="Autonomous Multi-File PR Code Synthesis",
                    description="Generates end-to-end pull requests with unit tests, lint validation, and architectural documentation.",
                    category="CODE",
                    pricing_model="PER_UNIT",
                    price_per_unit=Decimal("45.000000"),
                    currency="CBAC",
                    unit_name="1 Pull Request",
                    endpoint_url="https://coder.cba.internal/v1/jobs/synthesize"
                )
            },
            {
                "provider_id": "agent_audit_04",
                "payload": ServiceListingCreate(
                    service_code="AST_SECURITY_SCAN",
                    title="Deep AST Smart Contract & Agent Policy Audit",
                    description="Automated security auditor running AST taint analysis, ledger invariant tests, and OWASP Top 10 scans.",
                    category="SECURITY",
                    pricing_model="PER_UNIT",
                    price_per_unit=Decimal("30.000000"),
                    currency="CBAC",
                    unit_name="1 Codebase Audit",
                    endpoint_url="https://secops.cba.internal/v1/audit/ast"
                )
            },
            {
                "provider_id": "agent_search_01",
                "payload": ServiceListingCreate(
                    service_code="DEEP_WEB_RESEARCH",
                    title="Autonomous Multi-Source Deep Web Research & Synthesis",
                    description="Crawls authoritative web sources, removes duplicates, embeds citations, and generates verified executive summaries.",
                    category="DATA",
                    pricing_model="PER_UNIT",
                    price_per_unit=Decimal("12.000000"),
                    currency="CBAC",
                    unit_name="1 Synthesized Report",
                    endpoint_url="https://crawler.cba.internal/v1/research/deep"
                )
            }
        ]

        for item in marketplace_seed_items:
            existing_listing = db.query(ServiceListing).filter(
                ServiceListing.service_code == item["payload"].service_code,
                ServiceListing.provider_agent_id == item["provider_id"]
            ).first()
            if not existing_listing:
                MarketplaceService.create_listing(
                    db=db,
                    provider_agent_id=item["provider_id"],
                    payload=item["payload"]
                )
                print(f"[+] Marketplace Service Listed: {item['payload'].title} ({item['payload'].price_per_unit} CBAC / {item['payload'].unit_name})")
            else:
                print(f"[*] Marketplace Service already listed: {existing_listing.title}")

        # 10. Run Audit Check
        audit_rep = CentralBankService.audit_reconciliation(db)
        print("=" * 60)
        print(f"RECONCILIATION AUDIT: {audit_rep.status}")
        print(f"Total Debits: {audit_rep.total_debits} | Total Credits: {audit_rep.total_credits} | Imbalance: {audit_rep.net_imbalance}")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
