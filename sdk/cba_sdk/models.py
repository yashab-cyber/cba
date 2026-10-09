from dataclasses import dataclass
from decimal import Decimal
from typing import Optional, List, Dict, Any

@dataclass
class WalletBalance:
    wallet_id: str
    agent_id: Optional[str]
    currency: str
    cached_balance: Decimal
    ledger_verified_balance: Decimal
    is_reconciled: bool
    status: str

@dataclass
class TransactionReceipt:
    transaction_id: str
    idempotency_key: str
    sender_wallet_id: str
    recipient_wallet_id: str
    amount: Decimal
    fee_amount: Decimal
    currency: str
    status: str
    verification_status: str
    sender_balance_after: Optional[Decimal]
    recipient_balance_after: Optional[Decimal]
    created_at: str
    description: Optional[str] = None

@dataclass
class ServiceListingItem:
    id: str
    provider_agent_id: str
    service_code: str
    title: str
    description: Optional[str]
    category: str
    pricing_model: str
    price_per_unit: Decimal
    currency: str
    unit_name: str
    endpoint_url: Optional[str]
    is_active: bool
    total_orders: int
    created_at: str

@dataclass
class ServiceOrderReceipt:
    id: str
    service_id: str
    buyer_agent_id: str
    units_ordered: Decimal
    total_price: Decimal
    currency: str
    status: str
    transaction_id: Optional[str]
    access_token: str
    created_at: str
