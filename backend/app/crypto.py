import time
from typing import Tuple
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

class CryptoIdentityService:
    @staticmethod
    def generate_keypair() -> Tuple[str, str]:
        """
        Generates an Ed25519 asymmetric cryptographic keypair for an AI agent.
        Returns:
            (private_key_hex, public_key_hex)
        """
        private_key = ed25519.Ed25519PrivateKey.generate()
        public_key = private_key.public_key()

        raw_private = private_key.private_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PrivateFormat.Raw,
            encryption_algorithm=serialization.NoEncryption()
        )
        raw_public = public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )

        return raw_private.hex(), raw_public.hex()

    @staticmethod
    def sign_payment(
        private_key_hex: str,
        timestamp: int,
        sender_agent_id: str,
        recipient_agent_id: str,
        amount: str,
        idempotency_key: str
    ) -> str:
        """Signs a canonical payment message with the agent's private key."""
        private_key = ed25519.Ed25519PrivateKey.from_private_bytes(bytes.fromhex(private_key_hex))
        canonical_msg = f"{timestamp}:{sender_agent_id}:{recipient_agent_id}:{amount}:{idempotency_key}".encode("utf-8")
        sig_bytes = private_key.sign(canonical_msg)
        return sig_bytes.hex()

    @staticmethod
    def verify_payment_signature(
        public_key_hex: str,
        signature_hex: str,
        timestamp: int,
        sender_agent_id: str,
        recipient_agent_id: str,
        amount: str,
        idempotency_key: str,
        max_clock_skew_seconds: int = 300
    ) -> Tuple[bool, str]:
        """
        Verifies Ed25519 signature and timestamp freshness to prevent replay attacks.
        Returns:
            (is_valid: bool, reason: str)
        """
        # Replay attack prevention via timestamp window
        current_time = int(time.time())
        if abs(current_time - timestamp) > max_clock_skew_seconds:
            return False, f"Signature timestamp expired (clock drift: {abs(current_time - timestamp)}s > {max_clock_skew_seconds}s limit)"

        try:
            public_key = ed25519.Ed25519PublicKey.from_public_bytes(bytes.fromhex(public_key_hex))
            canonical_msg = f"{timestamp}:{sender_agent_id}:{recipient_agent_id}:{amount}:{idempotency_key}".encode("utf-8")
            public_key.verify(bytes.fromhex(signature_hex), canonical_msg)
            return True, "SIGNATURE_VERIFIED"
        except Exception as e:
            return False, f"Cryptographic signature verification failed: {str(e)}"
