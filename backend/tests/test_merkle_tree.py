import pytest
from app.services.merkle_service import MerkleService
from app.models.ledger import LedgerEntry

def test_merkle_tree_root_and_inclusion_proof(db_session):
    # Fetch entries from test genesis
    entries = db_session.query(LedgerEntry).all()
    assert len(entries) >= 2

    # 1. Compute Merkle Root
    root, count = MerkleService.compute_merkle_root(db_session)
    assert len(root) == 64
    assert count == len(entries)

    # 2. Generate Proof for first entry
    target_entry = entries[0]
    proof = MerkleService.generate_proof(db_session, target_entry.id)
    assert proof is not None
    assert proof["entry_id"] == target_entry.id
    assert proof["merkle_root"] == root
    assert len(proof["proof_path"]) > 0

    # 3. Verify Valid Proof
    is_valid = MerkleService.verify_proof(
        leaf_hash=proof["leaf_hash"],
        proof_path=proof["proof_path"],
        expected_root=root
    )
    assert is_valid is True

    # 4. Tampered Leaf or Root Fails Verification
    tampered_leaf = "f" * 64
    is_invalid = MerkleService.verify_proof(
        leaf_hash=tampered_leaf,
        proof_path=proof["proof_path"],
        expected_root=root
    )
    assert is_invalid is False

def test_merkle_api_endpoints(client, db_session):
    entries = db_session.query(LedgerEntry).all()
    target_entry = entries[0]

    # Test /merkle-root
    res_root = client.get("/api/v1/advanced/merkle-root")
    assert res_root.status_code == 200
    root_data = res_root.json()
    assert len(root_data["merkle_root"]) == 64

    # Test /merkle-proof/{entry_id}
    res_proof = client.get(f"/api/v1/advanced/merkle-proof/{target_entry.id}")
    assert res_proof.status_code == 200
    proof_data = res_proof.json()
    assert proof_data["entry_id"] == target_entry.id

    # Test /verify-merkle-proof
    res_verify = client.post(
        "/api/v1/advanced/verify-merkle-proof",
        json={
            "leaf_hash": proof_data["leaf_hash"],
            "merkle_root": proof_data["merkle_root"],
            "proof_path": proof_data["proof_path"]
        }
    )
    assert res_verify.status_code == 200
    verify_data = res_verify.json()
    assert verify_data["is_valid"] is True
