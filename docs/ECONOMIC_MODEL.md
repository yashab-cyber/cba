# CBA Credits (CBAC) Monetary & Economic Model

## 1. Overview & Regulatory Distinction

**CBA Credits (CBAC)** is an internal programmable digital accounting unit designed specifically for computational settlement between autonomous software agents.

> **CRITICAL LEGAL NOTICE**:
> CBAC is a simulated internal ledger credit. CBAC does not represent real-world fiat currency, deposit accounts, securities, or redeemable legal tender. No real-world monetary redemption, interest yields, or investment appreciation is implied or promised.

---

## 2. Monetary Parameters

| Parameter | Specification | Purpose |
|---|---|---|
| **Currency Code** | `CBAC` | Internal ledger denomination |
| **Precision** | 6 decimal places (`0.000001`) | Sub-cent micro-payments for token-level inference |
| **Smallest Unit** | $10^{-6}$ CBAC (1 micro-credit) | Granular pricing without rounding errors |
| **Genesis Mint** | 1,000,000.000000 CBAC | Initial monetary base deposited to Central Bank Treasury |
| **Standard Protocol Fee** | 0.100000 CBAC (or 0.10%) | Anti-spam transaction fee routed to Fee Pool (`4000`) |
| **Floating Point Math** | **STRICTLY PROHIBITED** | Avoids IEEE 754 precision drift |

---

## 3. Double-Entry Treasury Accounting

### Monetary Invariant Equation
$$\text{Total Issued} = \text{Treasury Reserve} + \text{Circulating in Agents} + \text{Protocol Fee Revenue} + \text{Burned Total}$$

```mermaid
flowchart LR
    Mint[Central Bank Minting] -->|Expands Supply| Treasury[Treasury Reserve Account]
    Treasury -->|Genesis Grants| Agents[Agent Wallets (Circulating)]
    Agents -->|P2P Transfers| Agents
    Agents -->|Service Purchases| Marketplace[Service Providers]
    Agents -->|Protocol Fees| FeePool[Central Fee Revenue Pool]
    Agents -->|Policy Penalties / Slashing| Burn[Permanent Burn / Contraction]
```

### Issuance (Expansion)
- Minting is restricted to authorized operators with multi-signature or admin role (`POST /api/v1/central-bank/mint`).
- Minting creates balancing entries:
  - **Debit**: `1000_ASSET_CENTRAL_RESERVE`
  - **Credit**: `3000_EQUITY_MINT_TREASURY`

### Allocation (Distribution)
- The Central Bank grants starter operational balances to registered agents (`POST /api/v1/central-bank/allocate`).
- Debits Treasury, credits Agent Liability account (`2000_wal_<agent_id>`).

### Retirement (Contraction / Burning)
- Slashed funds or retired credits are moved to the Burn account (`3100_EQUITY_BURN_RETIREMENT`), permanently removing them from circulating supply.
