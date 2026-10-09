# OpenAPI REST API Specification
## CBA — Central Bank of Agents (v1)

Base URL: `http://localhost:8000/api/v1`
Interactive Swagger UI: `http://localhost:8000/docs`
ReDoc Specification: `http://localhost:8000/redoc`

---

### Authentication Headers

- **Operators / Humans**: `Authorization: Bearer <jwt_token>`
- **AI Agents**: `X-CBA-API-KEY: cba_live_<token>` or `Authorization: Bearer cba_live_<token>`
- **Mutation Headers**: `Idempotency-Key: <unique_string>` (Required for all `POST` / `PUT` mutations)

---

### Endpoints Overview

#### 1. Authentication (`/auth`)
- `POST /auth/login`: Authenticate human operator, receive JWT.
- `POST /auth/register`: Register operator account.
- `GET /auth/me`: Inspect current logged-in profile.

#### 2. AI Agents (`/agents`)
- `POST /agents`: Register new AI agent with wallet and initial spending policy.
- `GET /agents`: List registered agents.
- `GET /agents/{id}`: Detailed view of agent, wallet, and spending policy.
- `POST /agents/{id}/credentials`: Generate high-entropy API key.
- `PUT /agents/{id}/policy`: Update spending limits and velocity constraints.
- `POST /agents/{id}/freeze?freeze=true`: Activate emergency spending freeze.
- `POST /agents/{id}/suspend?status_str=SUSPENDED`: Suspend compromised agent.

#### 3. Wallets (`/wallets`)
- `GET /wallets`: List all wallets (Agent, Treasury, Fee Pool, Burn).
- `GET /wallets/{id}`: Inspect specific wallet metadata.
- `GET /wallets/{id}/balance`: Recomputed and verified balance directly from ledger.
- `GET /wallets/{id}/activity`: Incoming and outgoing transactions.

#### 4. Payments (`/payments`)
- `POST /payments`: Execute atomic inter-agent transfer.
- `GET /payments`: List transactions with status/date/agent filters.
- `GET /payments/{id}`: Full double-entry transaction receipt.
- `POST /payments/{id}/approve`: Approve transaction held for human review.

#### 5. Invoices & Billing (`/payment-requests`)
- `POST /payment-requests`: Create invoice / payment request.
- `GET /payment-requests`: List invoices with status filter.
- `GET /payment-requests/{id}`: Inspect invoice details.
- `POST /payment-requests/{id}/approve`: Pay invoice via double-entry journal.
- `POST /payment-requests/{id}/reject`: Reject invoice.

#### 6. Central Bank Authority (`/central-bank`)
- `GET /central-bank/supply`: Monetary supply metrics (Issued, Circulating, Reserve, Burned).
- `POST /central-bank/mint`: Mint CBAC into Treasury (Admin only).
- `POST /central-bank/allocate`: Grant CBAC from Treasury to an agent (Admin only).
- `POST /central-bank/burn`: Permanently retire CBAC from circulation (Admin only).
- `GET /central-bank/reconciliation`: Real-time zero-sum ledger audit report.

#### 7. Analytics & Auditing (`/analytics`, `/audit`)
- `GET /analytics/overview`: 24h volume, fee totals, transaction distributions.
- `GET /audit/events`: Immutable compliance and security log.
