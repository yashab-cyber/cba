import hashlib
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.ledger import LedgerEntry

class MerkleService:
    @staticmethod
    def _hash_pair(left: str, right: str) -> str:
        return hashlib.sha256(f"{left}:{right}".encode("utf-8")).hexdigest()

    @classmethod
    def get_leaves(cls, db: Session) -> List[Tuple[str, str]]:
        """Returns list of (entry_id, leaf_hash) ordered chronologically."""
        entries = db.query(LedgerEntry).order_by(LedgerEntry.created_at.asc(), LedgerEntry.id.asc()).all()
        leaves = []
        for e in entries:
            leaf_content = f"{e.id}:{e.ledger_account_id}:{e.entry_type}:{e.amount}:{e.entry_hash}"
            leaf_hash = hashlib.sha256(leaf_content.encode("utf-8")).hexdigest()
            leaves.append((e.id, leaf_hash))
        return leaves

    @classmethod
    def compute_merkle_root(cls, db: Session) -> Tuple[str, int]:
        """Computes the root hash of the entire double-entry ledger."""
        leaves = cls.get_leaves(db)
        if not leaves:
            return "0" * 64, 0

        current_layer = [h for _, h in leaves]
        while len(current_layer) > 1:
            next_layer = []
            for i in range(0, len(current_layer), 2):
                left = current_layer[i]
                right = current_layer[i + 1] if i + 1 < len(current_layer) else left
                next_layer.append(cls._hash_pair(left, right))
            current_layer = next_layer

        return current_layer[0], len(leaves)

    @classmethod
    def generate_proof(cls, db: Session, entry_id: str) -> Optional[Dict[str, Any]]:
        """Generates an independent cryptographic inclusion proof for a ledger entry."""
        leaves = cls.get_leaves(db)
        if not leaves:
            return None

        # Find target index
        target_idx = -1
        target_leaf_hash = ""
        for idx, (eid, h) in enumerate(leaves):
            if eid == entry_id:
                target_idx = idx
                target_leaf_hash = h
                break

        if target_idx == -1:
            return None

        proof_path = []
        current_layer = [h for _, h in leaves]
        idx = target_idx

        while len(current_layer) > 1:
            is_right_sibling = (idx % 2 == 0)
            sibling_idx = idx + 1 if is_right_sibling else idx - 1

            if sibling_idx < len(current_layer):
                sibling_hash = current_layer[sibling_idx]
            else:
                sibling_hash = current_layer[idx]

            proof_path.append({
                "position": "right" if is_right_sibling else "left",
                "hash": sibling_hash
            })

            # Advance to next layer
            next_layer = []
            for i in range(0, len(current_layer), 2):
                left = current_layer[i]
                right = current_layer[i + 1] if i + 1 < len(current_layer) else left
                next_layer.append(cls._hash_pair(left, right))
            
            idx = idx // 2
            current_layer = next_layer

        root_hash = current_layer[0]

        return {
            "entry_id": entry_id,
            "leaf_hash": target_leaf_hash,
            "merkle_root": root_hash,
            "total_entries": len(leaves),
            "proof_path": proof_path
        }

    @classmethod
    def verify_proof(cls, leaf_hash: str, proof_path: List[Dict[str, str]], expected_root: str) -> bool:
        """Independently verifies that a leaf hash matches the expected Merkle root."""
        current = leaf_hash
        for step in proof_path:
            sibling = step["hash"]
            if step["position"] == "right":
                current = cls._hash_pair(current, sibling)
            else:
                current = cls._hash_pair(sibling, current)
        return current == expected_root
