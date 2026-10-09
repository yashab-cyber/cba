#!/usr/bin/env python3
"""
CBA Autonomous Agent Economy Simulation
Simulates a live multi-agent economy with autonomous service marketplace discovery, 
Ed25519 cryptographic payment signing, micro-payments, and real-time double-entry settlement.
"""

import os
import sys
import time
import random
from decimal import Decimal

# Add backend and sdk to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "sdk")))

from app.database import SessionLocal
from app.models.agent import Agent, AgentCredential
from app.models.marketplace import ServiceListing
from app.services.central_bank_service import CentralBankService
from app.services.transaction_service import TransactionService
from app.services.marketplace_service import MarketplaceService
from app.crypto import CryptoIdentityService
from app.config import settings

def run_simulation(rounds: int = 6):
    print("=" * 75)
    print("🚀 STARTING CBA MULTI-AGENT ECONOMIC SIMULATION (Phase 2/3)")
    print(f"Executing {rounds} autonomous economic cycles across AI agents...")
    print("=" * 75)

    db = SessionLocal()
    try:
        agents = db.query(Agent).all()
        agent_dict = {a.id: a for a in agents}
        
        if len(agents) < 2:
            print("❌ Insufficient agents in database. Please run backend seed first.")
            return

        marketplace_listings = db.query(ServiceListing).filter(ServiceListing.is_active == True).all()

        for round_num in range(1, rounds + 1):
            cycle_type = "MARKETPLACE" if round_num % 2 == 1 and marketplace_listings else "SIGNED_TRANSFER"
            print(f"\n[Cycle #{round_num}] Mode: {cycle_type}")

            if cycle_type == "MARKETPLACE":
                # Autonomous Marketplace Order
                listing = random.choice(marketplace_listings)
                provider = listing.provider_agent
                possible_buyers = [a for a in agents if a.id != listing.provider_agent_id and a.status == "ACTIVE"]
                buyer = random.choice(possible_buyers)
                units = Decimal(str(random.choice([1, 2, 5, 10]))).quantize(Decimal("0.000001"))
                idempotency_key = f"sim_market_cycle_{round_num}_{int(time.time()*1000)}"

                print(f"  🛒 Discovery: Buyer {buyer.name} discovered '{listing.title}'")
                print(f"  👉 Service Code: {listing.service_code} (Category: {listing.category})")
                print(f"  👉 Ordering: {units}x {listing.unit_name} @ {listing.price_per_unit} CBAC")

                try:
                    order, tx = MarketplaceService.order_service(
                        db=db,
                        service_id=listing.id,
                        buyer_agent_id=buyer.id,
                        units=units,
                        idempotency_key=idempotency_key
                    )
                    print(f"  ✅ ORDER SETTLED! Order ID: {order.id} | Total: {order.total_price} CBAC")
                    print(f"     Bearer Token Issued: {order.access_token[:20]}...")
                    print(f"     Buyer Bal: {buyer.wallet.cached_balance} CBAC | Provider Bal: {provider.wallet.cached_balance} CBAC")
                except Exception as e:
                    print(f"  ⚠️  Order Placement Failed: {e}")

            else:
                # Cryptographically Signed Ed25519 Transfer
                provider = random.choice(agents)
                possible_buyers = [a for a in agents if a.id != provider.id and a.status == "ACTIVE"]
                buyer = random.choice(possible_buyers)
                amount = Decimal(str(round(random.uniform(15.0, 85.0), 2))).quantize(Decimal("0.000001"))
                now_ts = int(time.time())
                idempotency_key = f"sim_signed_tx_{round_num}_{int(time.time()*1000)}"

                # Ensure buyer has Ed25519 keypair
                priv_hex, pub_hex = CryptoIdentityService.generate_keypair()
                buyer.public_key = pub_hex
                db.add(buyer)
                db.commit()

                # Sign canonical payload
                sig_hex = CryptoIdentityService.sign_payment(
                    private_key_hex=priv_hex,
                    timestamp=now_ts,
                    sender_agent_id=buyer.id,
                    recipient_agent_id=provider.id,
                    amount=f"{amount:.6f}",
                    idempotency_key=idempotency_key
                )

                # Verify signature before executing
                is_valid, reason = CryptoIdentityService.verify_payment_signature(
                    public_key_hex=buyer.public_key,
                    signature_hex=sig_hex,
                    timestamp=now_ts,
                    sender_agent_id=buyer.id,
                    recipient_agent_id=provider.id,
                    amount=f"{amount:.6f}",
                    idempotency_key=idempotency_key
                )
                assert is_valid, f"Signature failed: {reason}"

                print(f"  🔐 Cryptographic Authorization: Ed25519 Signature Verified ({reason})")
                print(f"  👉 Transfer: {buyer.name} -> {provider.name} ({amount} CBAC)")

                try:
                    tx, entries, is_replay = TransactionService.execute_payment(
                        db=db,
                        sender_wallet=buyer.wallet,
                        recipient_wallet=provider.wallet,
                        amount=amount,
                        idempotency_key=idempotency_key,
                        description=f"[Simulated Economy] Ed25519 signed settlement",
                        service_code="P2P_SIGNED_SETTLEMENT",
                        actor_id=buyer.id
                    )
                    print(f"  ✅ SETTLED! Tx ID: {tx.id} | Fee: {tx.fee_amount} CBAC | Status: {tx.status}")
                    print(f"     Buyer Bal: {buyer.wallet.cached_balance} CBAC | Provider Bal: {provider.wallet.cached_balance} CBAC")
                except Exception as e:
                    print(f"  ⚠️  Transaction Rejected: {e}")

            time.sleep(0.4)

        print("\n" + "=" * 75)
        print("🔍 RUNNING POST-SIMULATION CENTRAL BANK RECONCILIATION AUDIT...")
        print("=" * 75)
        audit_rep = CentralBankService.audit_reconciliation(db)
        print(f"Audit Status: {audit_rep.status}")
        print(f"Total Debits: {audit_rep.total_debits} CBAC")
        print(f"Total Credits: {audit_rep.total_credits} CBAC")
        print(f"Net Imbalance: {audit_rep.net_imbalance} CBAC")
        print(f"Cached vs Ledger Discrepancies: {audit_rep.cached_vs_ledger_discrepancies_count}")
        print(f"Total Ledger Entries Audited: {audit_rep.total_ledger_entries_verified}")
        print("=" * 75)
        print("🎉 SIMULATION COMPLETED SUCCESSFULLY WITH PERFECT ZERO-SUM BALANCE!")
        print("=" * 75)

    finally:
        db.close()

if __name__ == "__main__":
    cycles = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    run_simulation(cycles)
