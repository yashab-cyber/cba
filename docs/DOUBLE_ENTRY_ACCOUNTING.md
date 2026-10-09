# Double-Entry Ledger and Monetary Architecture
## CBA — Central Bank of Agents

---

### 1. Fundamental Principles

The core accounting engine of CBA implements standard financial double-entry bookkeeping with immutable, append-only journal entries.

#### Fundamental Equation:
$$\text{Assets} = \text{Liabilities} + \text{Equity}$$

In the Central Bank of Agents model:
- **Assets ($A$)**: `1000 - CBAC Central Reserve Account`. Holds the initial proof-of-backing assets for all issued CBAC units. Normal balance: `DEBIT`.
- **Liabilities ($L$)**: `2000 - Agent Wallet Deposit Accounts`. Each AI Agent wallet represents a demand liability owed by the Central Bank to that agent. Normal balance: `CREDIT`.
- **Equity ($E$)**: `3000 - Central Bank Treasury Capital Account`. Represents unallocated capital created by Central Bank monetary expansion. Normal balance: `CREDIT`.
- **Revenue ($R$)**: `4000 - Protocol Fee Collection Pool Account`. Accumulates transaction fees deducted from agent transfers. Normal balance: `CREDIT`.
- **Equity Reduction ($Burn$)**: `3100 - CBAC Permanent Retirement Account`. Destination for destroyed or slashed currency. Normal balance: `CREDIT`.

---

### 2. Zero-Sum Invariant

For every transaction $T$:
$$\sum_{e \in T} \text{Debit}(e) - \sum_{e \in T} \text{Credit}(e) = 0.000000$$

If this condition evaluates to anything other than exact zero, the database transaction is immediately aborted with a `LedgerImbalanceError` and rolled back.

---

### 3. Precision & Decimal Arithmetic

- **Smallest Sub-unit**: Micro-CBAC ($10^{-6}$ CBAC).
- **Storage**: `NUMERIC(20, 6)`.
- **Arithmetic**: Python `decimal.Decimal` with `ROUND_HALF_EVEN`.
- **Strict Rule**: IEEE-754 floating-point arithmetic (`float`) is strictly prohibited in monetary paths.

---

### 4. Journal Entry Examples

#### A. Central Bank Minting (1,000,000 CBAC)
```
DEBIT  1000_ASSET_CENTRAL_RESERVE     1,000,000.000000 CBAC
CREDIT 3000_EQUITY_MINT_TREASURY      1,000,000.000000 CBAC
Net Imbalance: 0.000000 CBAC
```

#### B. Treasury Grant to Agent Alpha (25,000 CBAC)
```
DEBIT  3000_EQUITY_MINT_TREASURY         25,000.000000 CBAC
CREDIT 2000_wal_agent_search_01          25,000.000000 CBAC
Net Imbalance: 0.000000 CBAC
```

#### C. Agent Alpha Pays Agent Gamma (100.00 CBAC, 0.10 CBAC Fee)
```
DEBIT  2000_wal_agent_search_01             100.100000 CBAC
CREDIT 2000_wal_agent_gpu_03                100.000000 CBAC
CREDIT 4000_REVENUE_FEE_POOL                  0.100000 CBAC
Net Imbalance: 0.000000 CBAC
```

#### D. Currency Retirement / Burning (1,000 CBAC)
```
DEBIT  2000_wal_agent_search_01           1,000.000000 CBAC
CREDIT 3100_EQUITY_BURN_RETIREMENT        1,000.000000 CBAC
Net Imbalance: 0.000000 CBAC
```

---

### 5. Cryptographic Hash Chaining

Every `ledger_entries` record includes:
$$H_i = \text{SHA256}(\text{id}_i \mathbin{\Vert} \text{tx\_id}_i \mathbin{\Vert} \text{acc\_id}_i \mathbin{\Vert} \text{type}_i \mathbin{\Vert} \text{amt}_i \mathbin{\Vert} H_{i-1})$$

Where $H_0$ is the genesis block hash. Any external modification to previous entries invalidates the cryptographic chain link and alerts the compliance audit monitor.
