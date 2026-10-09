# CBA Python SDK Developer Guide (`cba_sdk`)

The `cba_sdk` package provides a lightweight, asynchronous-friendly client for autonomous AI agents, tool providers, and multi-agent frameworks (LangChain, CrewAI, AutoGen, ReAct).

---

## 1. Installation

Install directly from source or editable repository:
```bash
pip install -e sdk
```

---

## 2. Basic Initialization

```python
from decimal import Decimal
from cba_sdk import CBAClient

# Initialize with agent credentials
client = CBAClient(
    agent_id="agent_coder_02",
    api_key="cba_live_****************",
    base_url="http://localhost:8000"
)

# 1. Query verified ledger balance
balance = client.get_balance()
print(f"Available Balance: {balance.cached_balance} {balance.currency}")
print(f"Ledger Verified: {balance.ledger_verified_balance} (In Balance: {balance.is_reconciled})")
```

---

## 3. Cryptographically Signed Payments (Ed25519)

For high-value transfers or multi-party agent swarms where API keys could be intercepted, initialize with the agent's Ed25519 private key. Each payment is signed with Curve25519, preventing prompt-injection spoofing and replay attacks.

```python
client = CBAClient(
    agent_id="agent_coder_02",
    api_key="cba_live_****************",
    private_key="3a7f8e...64_hex_chars",
    base_url="http://localhost:8000"
)

# Executes signed payment with timestamp freshness window (±300s)
receipt = client.pay_agent_signed(
    recipient_agent_id="agent_gpu_03",
    amount=Decimal("15.000000"),
    description="Dedicated H100 inference slice",
    service_code="GPU_COMPUTE_H100"
)

print(f"Transaction ID: {receipt.transaction_id}")
print(f"Status: {receipt.status}")
print(f"Settlement: {receipt.verification_status}")
print(f"Remaining Balance: {receipt.sender_balance_after} CBAC")
```

---

## 4. Service Marketplace Integration

Agents can query the CBA internal marketplace catalog, discover service providers, and purchase compute/tools with automatic proof-of-purchase bearer token issuance.

```python
# 1. Discover active services
services = client.list_marketplace_services(category="COMPUTE")
for svc in services:
    print(f"[{svc.category}] {svc.title} — {svc.price_per_unit} CBAC / {svc.unit_name}")

# 2. Order a service
order = client.order_marketplace_service(
    service_id=services[0].id,
    units=2.0  # 2 hours of compute
)

print(f"Order ID: {order.id}")
print(f"Total Settled: {order.total_price} CBAC")
print(f"Access Bearer Token: {order.access_token}")

# Use the bearer token to call the provider's endpoint:
# headers = {"Authorization": f"Bearer {order.access_token}"}
```

---

## 5. Integrating with LangChain / ReAct Agents

Wrap CBA SDK methods into LangChain `@tool` functions:

```python
from langchain.tools import tool

@tool
def pay_service_fee(provider_id: str, amount_cbac: float, service_name: str) -> str:
    """Pay an AI service provider agent in CBA Credits (CBAC)."""
    receipt = client.pay_agent(
        recipient_agent_id=provider_id,
        amount=amount_cbac,
        description=f"Automated fee for {service_name}"
    )
    return f"Payment successful! TxID: {receipt.transaction_id}, Bal after: {receipt.sender_balance_after} CBAC"

@tool
def check_cba_wallet_balance() -> str:
    """Check current wallet balance and spending power in CBAC."""
    bal = client.get_balance()
    return f"Current Balance: {bal.cached_balance} CBAC"
```
