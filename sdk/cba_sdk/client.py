import uuid
import time
from decimal import Decimal
from typing import Optional, Dict, Any, List, Union
import httpx
from cryptography.hazmat.primitives.asymmetric import ed25519

from cba_sdk.exceptions import (
    CBAError, AuthenticationError, InsufficientFundsError,
    PolicyViolationError, ResourceNotFoundError
)
from cba_sdk.models import (
    WalletBalance, TransactionReceipt, ServiceListingItem, ServiceOrderReceipt
)

class CBAClient:
    """
    Central Bank of Agents (CBA) Client for Autonomous AI Agents and Developers.
    
    Supports:
    - High-entropy Agent API Key authentication
    - Cryptographic Ed25519 asymmetric payment signing (non-repudiation)
    - Agent Service Marketplace discovery & 1-click execution
    - Real-time balance verification and invoice handling

    Usage:
        client = CBAClient(
            agent_id="agent_coder_02",
            api_key="cba_live_...",
            private_key="a1b2c3...",  # Ed25519 private key hex
            base_url="http://localhost:8000"
        )
        balance = client.get_balance()
        receipt = client.pay_agent_signed(recipient_agent_id="agent_gpu_03", amount=15.00, description="GPU slice")
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "http://localhost:8000",
        token: Optional[str] = None,
        agent_id: Optional[str] = None,
        private_key: Optional[str] = None,
        timeout: float = 15.0
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.token = token
        self.agent_id = agent_id
        self.private_key = private_key
        self.timeout = timeout
        
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-CBA-API-KEY"] = self.api_key
        elif self.token:
            headers["Authorization"] = f"Bearer {self.token}"
            
        self.http = httpx.Client(base_url=self.base_url, headers=headers, timeout=self.timeout)

    def _handle_response(self, resp: httpx.Response) -> Dict[str, Any]:
        if resp.status_code == 401:
            raise AuthenticationError(resp.json().get("detail", "Authentication failed"))
        elif resp.status_code == 402:
            raise InsufficientFundsError(resp.json().get("detail", "Insufficient wallet funds"))
        elif resp.status_code == 403:
            raise PolicyViolationError(resp.json().get("detail", "Spending policy limit exceeded"))
        elif resp.status_code == 404:
            raise ResourceNotFoundError(resp.json().get("detail", "Resource not found"))
        elif resp.is_error:
            raise CBAError(f"HTTP {resp.status_code}: {resp.text}")
        return resp.json()

    def get_balance(self, wallet_id: Optional[str] = None) -> WalletBalance:
        """Retrieves and cryptographically verifies current CBAC balance."""
        if not wallet_id:
            if not self.agent_id:
                raise CBAError("Must provide wallet_id or initialize client with agent_id")
            # Fetch agent profile to get wallet
            ag_data = self._handle_response(self.http.get(f"/api/v1/agents/{self.agent_id}"))
            wallet_id = ag_data["wallet"]["id"]

        data = self._handle_response(self.http.get(f"/api/v1/wallets/{wallet_id}/balance"))
        return WalletBalance(
            wallet_id=data["wallet_id"],
            agent_id=data.get("agent_id"),
            currency=data["currency"],
            cached_balance=Decimal(str(data["cached_balance"])),
            ledger_verified_balance=Decimal(str(data["ledger_verified_balance"])),
            is_reconciled=data["is_reconciled"],
            status=data["status"]
        )

    def pay_agent(
        self,
        recipient_agent_id: str,
        amount: Union[float, str, Decimal],
        description: Optional[str] = None,
        service_code: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> TransactionReceipt:
        """
        Executes an atomic CBAC payment to another registered AI agent via API Key.
        """
        key = idempotency_key or f"sdk_{uuid.uuid4().hex}"
        payload = {
            "recipient_agent_id": recipient_agent_id,
            "amount": str(amount),
            "description": description,
            "service_code": service_code,
            "metadata": metadata or {}
        }
        headers = {"Idempotency-Key": key}
        resp_data = self._handle_response(self.http.post("/api/v1/payments", json=payload, headers=headers))
        tx = resp_data["transaction"]
        return TransactionReceipt(
            transaction_id=tx["id"],
            idempotency_key=tx["idempotency_key"],
            sender_wallet_id=tx["sender_wallet_id"],
            recipient_wallet_id=tx["recipient_wallet_id"],
            amount=Decimal(str(tx["amount"])),
            fee_amount=Decimal(str(tx["fee_amount"])),
            currency=tx["currency"],
            status=tx["status"],
            verification_status=resp_data.get("verification_status", "UNKNOWN"),
            sender_balance_after=Decimal(str(resp_data["sender_balance_after"])) if resp_data.get("sender_balance_after") else None,
            recipient_balance_after=Decimal(str(resp_data["recipient_balance_after"])) if resp_data.get("recipient_balance_after") else None,
            created_at=tx["created_at"],
            description=tx.get("description")
        )

    def pay_agent_signed(
        self,
        recipient_agent_id: str,
        amount: Union[float, str, Decimal],
        description: Optional[str] = None,
        service_code: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> TransactionReceipt:
        """
        Executes a payment authorized via an asymmetric Ed25519 cryptographic signature.
        Requires agent_id and private_key to be configured.
        """
        if not self.agent_id:
            raise CBAError("Client must be initialized with 'agent_id' for signed payments")
        if not self.private_key:
            raise CBAError("Client must be initialized with 'private_key' for signed payments")

        key = idempotency_key or f"sdk_sig_{uuid.uuid4().hex}"
        amount_canonical = f"{Decimal(str(amount)):.6f}"
        now_ts = int(time.time())

        # Generate Ed25519 signature
        priv_key = ed25519.Ed25519PrivateKey.from_private_bytes(bytes.fromhex(self.private_key))
        canonical_msg = f"{now_ts}:{self.agent_id}:{recipient_agent_id}:{amount_canonical}:{key}".encode("utf-8")
        sig_hex = priv_key.sign(canonical_msg).hex()

        headers = {
            "Idempotency-Key": key,
            "X-CBA-AGENT-ID": self.agent_id,
            "X-CBA-TIMESTAMP": str(now_ts),
            "X-CBA-SIGNATURE": sig_hex
        }
        payload = {
            "recipient_agent_id": recipient_agent_id,
            "amount": amount_canonical,
            "description": description or f"Ed25519 signed payment from {self.agent_id}",
            "service_code": service_code,
            "metadata": metadata or {}
        }

        resp_data = self._handle_response(self.http.post("/api/v1/payments", json=payload, headers=headers))
        tx = resp_data["transaction"]
        return TransactionReceipt(
            transaction_id=tx["id"],
            idempotency_key=tx["idempotency_key"],
            sender_wallet_id=tx["sender_wallet_id"],
            recipient_wallet_id=tx["recipient_wallet_id"],
            amount=Decimal(str(tx["amount"])),
            fee_amount=Decimal(str(tx["fee_amount"])),
            currency=tx["currency"],
            status=tx["status"],
            verification_status=resp_data.get("verification_status", "UNKNOWN"),
            sender_balance_after=Decimal(str(resp_data["sender_balance_after"])) if resp_data.get("sender_balance_after") else None,
            recipient_balance_after=Decimal(str(resp_data["recipient_balance_after"])) if resp_data.get("recipient_balance_after") else None,
            created_at=tx["created_at"],
            description=tx.get("description")
        )

    def list_marketplace_services(
        self,
        category: Optional[str] = None,
        provider_id: Optional[str] = None
    ) -> List[ServiceListingItem]:
        """Discovers available tools, computational models, and services in CBA Marketplace."""
        params = {}
        if category:
            params["category"] = category
        if provider_id:
            params["provider_id"] = provider_id

        items = self._handle_response(self.http.get("/api/v1/marketplace/services", params=params))
        return [
            ServiceListingItem(
                id=item["id"],
                provider_agent_id=item["provider_agent_id"],
                service_code=item["service_code"],
                title=item["title"],
                description=item.get("description"),
                category=item["category"],
                pricing_model=item["pricing_model"],
                price_per_unit=Decimal(str(item["price_per_unit"])),
                currency=item["currency"],
                unit_name=item["unit_name"],
                endpoint_url=item.get("endpoint_url"),
                is_active=item["is_active"],
                total_orders=item["total_orders"],
                created_at=item["created_at"]
            )
            for item in items
        ]

    def get_service_listing(self, service_id: str) -> ServiceListingItem:
        """Retrieves details of a specific marketplace service."""
        item = self._handle_response(self.http.get(f"/api/v1/marketplace/services/{service_id}"))
        return ServiceListingItem(
            id=item["id"],
            provider_agent_id=item["provider_agent_id"],
            service_code=item["service_code"],
            title=item["title"],
            description=item.get("description"),
            category=item["category"],
            pricing_model=item["pricing_model"],
            price_per_unit=Decimal(str(item["price_per_unit"])),
            currency=item["currency"],
            unit_name=item["unit_name"],
            endpoint_url=item.get("endpoint_url"),
            is_active=item["is_active"],
            total_orders=item["total_orders"],
            created_at=item["created_at"]
        )

    def order_marketplace_service(
        self,
        service_id: str,
        units: Union[float, str, Decimal] = Decimal("1.000000"),
        idempotency_key: Optional[str] = None
    ) -> ServiceOrderReceipt:
        """
        Orders and purchases an autonomous service on the CBA Marketplace.
        Performs atomic double-entry settlement and issues an access bearer token.
        """
        key = idempotency_key or f"order_{uuid.uuid4().hex}"
        payload = {
            "units": str(units),
            "buyer_agent_id": self.agent_id
        }
        headers = {"Idempotency-Key": key}
        data = self._handle_response(self.http.post(f"/api/v1/marketplace/services/{service_id}/order", json=payload, headers=headers))
        return ServiceOrderReceipt(
            id=data["id"],
            service_id=data["service_id"],
            buyer_agent_id=data["buyer_agent_id"],
            units_ordered=Decimal(str(data["units_ordered"])),
            total_price=Decimal(str(data["total_price"])),
            currency=data["currency"],
            status=data["status"],
            transaction_id=data.get("transaction_id"),
            access_token=data["access_token"],
            created_at=data["created_at"]
        )

    def request_payment(
        self,
        payer_agent_id: str,
        amount: Union[float, str, Decimal],
        service_code: str,
        service_description: Optional[str] = None,
        expires_in_hours: int = 24
    ) -> Dict[str, Any]:
        """Creates an invoice / payment request for another agent to pay."""
        payload = {
            "payer_agent_id": payer_agent_id,
            "amount": str(amount),
            "service_code": service_code,
            "service_description": service_description,
            "expires_in_hours": expires_in_hours
        }
        return self._handle_response(self.http.post("/api/v1/payment-requests", json=payload))

    def approve_invoice(self, request_id: str) -> Dict[str, Any]:
        """Approves and immediately settles a payment request."""
        return self._handle_response(self.http.post(f"/api/v1/payment-requests/{request_id}/approve"))

    def reject_invoice(self, request_id: str, reason: Optional[str] = None) -> Dict[str, Any]:
        """Rejects a payment request."""
        return self._handle_response(self.http.post(f"/api/v1/payment-requests/{request_id}/reject", params={"reason": reason}))

    def close(self):
        self.http.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
