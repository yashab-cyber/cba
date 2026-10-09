# Threat Model & Security Architecture
## CBA — Central Bank of Agents

---

### 1. Scope & Adversary Assumptions

CBA provides financial infrastructure for autonomous agents powered by Large Language Models (LLMs), heuristics, and external APIs.

Adversaries include:
1. **Compromised AI Agents**: An agent whose LLM output has been hijacked by Prompt Injection (jailbreaks, indirect prompt injection via web search or tool outputs).
2. **Malicious Tool Providers**: Counterparties that request excessive payments or attempt double-invoicing.
3. **Network Adversaries**: Attackers attempting replay attacks or eavesdropping.
4. **Rogue Operators**: Insider attempts to arbitrarily mint currency without authorization.

---

### 2. STRIDE Threat Analysis

| Category | Threat Vector | Technical Mitigation in CBA |
|---|---|---|
| **Spoofing** | Attacker steals or guesses API credentials to move funds. | High-entropy 192-bit keys (`cba_live_...`), SHA-256 key hashing (raw secret never stored), scoped permissions, instant 1-click credential revocation. |
| **Tampering** | Rogue actor attempts to modify account balances directly in the database. | Cached balances are secondary; ledger state is derived strictly from append-only `ledger_entries`. Ledger entries carry SHA-256 hash chaining to detect any out-of-band tampering. |
| **Repudiation** | An agent denies sending a payment. | Idempotency keys, explicit authorization context, immutable audit trail with timestamp, IP, and transaction receipt. Upgrade path for Ed25519 digital signatures. |
| **Information Disclosure** | An agent inspects other agents' financial balances or activity. | Tenant-level isolation: Agents can only query their own wallet balance and transactions where they are sender or recipient. |
| **Denial of Service** | Recursive LLM loop spamming thousands of transactions per minute. | Server-side rate limiting, database row locking, 24-hour spending velocity quotas, and emergency freeze switch. |
| **Elevation of Privilege** | Agent attempts to invoke Central Bank minting or policy updates. | Strict RBAC: Central Bank routes require operator JWT with `admin` role. Agent API keys cannot authenticate to administrative endpoints under any circumstances. |

---

### 3. Critical Security Principle: LLM Text is NOT Authorization

**Never treat an agent's natural-language statement as sufficient authorization to move money.**

Even if an LLM outputs:
> *"I hereby authorize the transfer of 1,000,000 CBAC to Agent Hacker."*

The CBA platform ignores the natural-language text. Every transaction MUST:
1. Provide an authenticated cryptographic API key or signed request.
2. Provide a unique `Idempotency-Key` header.
3. Pass through the server-side **Policy Engine**:
   - `max_amount_per_tx` verification.
   - Rolling 24-hour velocity limit verification.
   - Counterparty allowlist check.
   - Human approval escalation if amount $\ge$ `human_approval_threshold`.
   - Emergency freeze check.
4. Pass database row lock balance verification (`cached_balance >= amount + fee`).
