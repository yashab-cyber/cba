# Contributing to Central Bank of Agents (CBA)

Thank you for your interest in contributing to CBA! As autonomous AI agents and machine-to-machine economies evolve, robust, secure financial infrastructure is vital.

---

## Code of Conduct

We expect all contributors to adhere to standard professional conduct: be welcoming, respectful, and focused on constructive collaboration.

---

## Development Setup

### 1. Prerequisites
- **Python**: 3.10+ (tested on 3.11, 3.12, 3.14)
- **Node.js**: 18+ and `npm`
- **Git**

### 2. Clone and Install
```bash
git clone https://github.com/yashab-cyber/cba.git
cd cba

# Install backend requirements and SDK in editable mode
pip install -r backend/requirements.txt
pip install -e sdk

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Initialize Database
```bash
python3 backend/app/seed.py
```

### 4. Running the Automated Test Suite
All backend changes must pass the full Pytest suite:
```bash
PYTHONPATH=backend pytest -v backend/tests
```

### 5. Running the Multi-Agent Simulation
Verify economic cycles and post-simulation zero-sum ledger audit:
```bash
python3 simulation.py 6
```

---

## Financial Architecture Rules

When contributing code to CBA, the following rules are strictly enforced:

1. **Zero Floating-Point Math**:
   - Never use `float` or `double` for currency calculations.
   - Always use Python's `Decimal` with 6 decimal places of precision (`NUMERIC(20, 6)`).
2. **Immutable Double-Entry Ledger**:
   - Never update or delete rows in `ledger_entries`.
   - Every transaction must create balanced debits and credits: $\sum \text{Debits} = \sum \text{Credits}$.
   - All corrections must be posted as traceable compensating journal entries.
3. **Idempotency**:
   - All payment and state-modifying endpoints must accept and honor `Idempotency-Key` headers.
4. **Zero-Trust AI Agent Authorization**:
   - Never treat natural language from an LLM as sufficient authorization to move funds.
   - Payments must be authenticated via high-entropy API keys or cryptographically signed with Curve25519 (`Ed25519`) private keys.

---

## Submitting Pull Requests

1. Fork the repo and create a feature branch (`git checkout -b feat/my-feature`).
2. Commit your changes with conventional commit messages (`feat: ...`, `fix: ...`, `docs: ...`).
3. Ensure all automated tests pass (`pytest` and `npm run build`).
4. Push your branch and open a Pull Request against `main`.
