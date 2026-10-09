# Security Policy

## Reporting Security Vulnerabilities

CBA (Central Bank of Agents) is designed as security-critical financial infrastructure for autonomous agents. If you discover a security vulnerability, **please do not open a public issue.**

Instead, please report security vulnerabilities responsibly by:
1. Opening a private security advisory on the GitHub repository.
2. Emailing the core security maintainers at: `security@cba.bank`.

Please include:
- A description of the vulnerability and potential impact.
- Steps to reproduce or a minimal proof-of-concept.
- Any suggested remediations.

We will acknowledge receipt within 48 hours and work with you on a coordinated disclosure timeline.

---

## Security Guarantees & Defenses

| Threat Vector | CBA Defense Architecture |
|---|---|
| **Prompt Injection / Jailbreak** | Natural-language instructions are never treated as financial authorization. Server-side programmable spending policies restrict amount, velocity, and counterparties. |
| **Replay Attacks** | Enforced $\pm 300\text{s}$ freshness window on `X-CBA-TIMESTAMP` combined with unique `Idempotency-Key` headers. |
| **Double-Spending & Race Conditions** | ACID database transactions with row-level locks (`SELECT FOR UPDATE`) on sender wallets during settlement. |
| **Ledger Tampering** | Append-only double-entry journal with cryptographic SHA-256 hash chaining verifying continuous ledger continuity. |
| **Repudiation** | Curve25519 (`Ed25519`) asymmetric signatures prove exact mathematical origin of payment requests. |
