import {
  Agent, Wallet, Transaction, TransactionReceipt, PaymentRequest,
  MonetarySupply, ReconciliationReport, AnalyticsOverview, AuditEvent, SpendingPolicy,
  User
} from '../types';

const API_BASE = '/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('cba_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization'] && !headers['X-CBA-API-KEY']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      errorDetail = data.detail || data.error || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const data = await request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('cba_token', data.access_token);
    localStorage.setItem('cba_user', JSON.stringify(data.user));
    return data;
  },

  register: async (payload: { email: string; password: string; full_name?: string; organization?: string; role?: string; tier?: string }) => {
    const data = await request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },

  logout: () => {
    localStorage.removeItem('cba_token');
    localStorage.removeItem('cba_user');
  },

  getCurrentUser: () => request<User>('/auth/me'),

  // User Management (Admin / Operator)
  getUsers: (role_filter?: string) =>
    request<User[]>(`/users${role_filter ? `?role_filter=${role_filter}` : ''}`),
  getUser: (user_id: string) =>
    request<User>(`/users/${user_id}`),
  updateUser: (user_id: string, payload: Partial<User>) =>
    request<User>(`/users/${user_id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  toggleUserStatus: (user_id: string, is_active: boolean, reason?: string) =>
    request<User>(`/users/${user_id}/status`, {
      method: 'POST',
      body: JSON.stringify({ is_active, reason }),
    }),

  // Central Bank
  getMonetarySupply: () => request<MonetarySupply>('/central-bank/supply'),
  getReconciliation: () => request<ReconciliationReport>('/central-bank/reconciliation'),
  mintCurrency: (amount: string | number, reason: string) =>
    request<Transaction>('/central-bank/mint', {
      method: 'POST',
      body: JSON.stringify({ amount: String(amount), reason }),
    }),
  allocateFunds: (recipient_agent_id: string, amount: string | number, reason?: string) =>
    request<Transaction>('/central-bank/allocate', {
      method: 'POST',
      body: JSON.stringify({ recipient_agent_id, amount: String(amount), reason }),
    }),
  burnCurrency: (source_agent_id: string, amount: string | number, reason: string) =>
    request<Transaction>('/central-bank/burn', {
      method: 'POST',
      body: JSON.stringify({ source_agent_id, amount: String(amount), reason }),
    }),

  // Wallets
  getWallets: () => request<Wallet[]>('/wallets'),
  getWallet: (id: string) => request<Wallet>(`/wallets/${id}`),
  getWalletBalance: (id: string) =>
    request<{
      wallet_id: string;
      cached_balance: string | number;
      ledger_verified_balance: string | number;
      is_reconciled: boolean;
      status: string;
    }>(`/wallets/${id}/balance`),

  // Agents
  getAgents: () => request<Agent[]>('/agents'),
  getAgentDetail: (id: string) =>
    request<{
      id: string;
      name: string;
      description?: string;
      status: string;
      wallet?: Wallet;
      spending_policy?: SpendingPolicy;
    }>(`/agents/${id}`),
  createAgent: (data: {
    id: string;
    name: string;
    description?: string;
    initial_funding?: string | number;
    initial_policy?: any;
  }) =>
    request<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateCredentials: (agent_id: string) =>
    request<{
      agent_id: string;
      raw_api_key?: string;
      key_prefix: string;
      scopes: string;
      created_at: string;
    }>(`/agents/${agent_id}/credentials`, { method: 'POST' }),
  toggleFreeze: (agent_id: string, freeze: boolean) =>
    request<SpendingPolicy>(`/agents/${agent_id}/freeze?freeze=${freeze}`, { method: 'POST' }),
  toggleSuspension: (agent_id: string, status: 'SUSPENDED' | 'ACTIVE') =>
    request<Agent>(`/agents/${agent_id}/suspend?status_str=${status}`, { method: 'POST' }),
  updateSpendingPolicy: (agent_id: string, policy: Partial<SpendingPolicy>) =>
    request<SpendingPolicy>(`/agents/${agent_id}/policy`, {
      method: 'PUT',
      body: JSON.stringify(policy),
    }),

  // Payments
  getTransactions: (agent_id?: string) =>
    request<Transaction[]>(`/payments${agent_id ? `?agent_id=${agent_id}` : ''}`),
  getTransactionReceipt: (id: string) => request<TransactionReceipt>(`/payments/${id}`),
  sendPayment: (data: {
    recipient_agent_id?: string;
    recipient_wallet_id?: string;
    amount: string | number;
    description?: string;
    service_code?: string;
  }, apiKey?: string) => {
    const headers: Record<string, string> = {};
    if (apiKey) headers['X-CBA-API-KEY'] = apiKey;
    return request<TransactionReceipt>('/payments', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  },
  approveTransaction: (id: string) =>
    request<TransactionReceipt>(`/payments/${id}/approve`, { method: 'POST' }),

  // Invoices / Payment Requests
  getPaymentRequests: () => request<PaymentRequest[]>('/payment-requests'),
  createPaymentRequest: (data: {
    payer_agent_id: string;
    amount: string | number;
    service_code: string;
    service_description?: string;
  }, apiKey: string) =>
    request<PaymentRequest>('/payment-requests', {
      method: 'POST',
      headers: { 'X-CBA-API-KEY': apiKey },
      body: JSON.stringify(data),
    }),
  approvePaymentRequest: (id: string, apiKey?: string) => {
    const headers: Record<string, string> = {};
    if (apiKey) headers['X-CBA-API-KEY'] = apiKey;
    return request<{ request_id: string; status: string; message: string; transaction_id?: string }>(
      `/payment-requests/${id}/approve`,
      { method: 'POST', headers }
    );
  },
  rejectPaymentRequest: (id: string, apiKey?: string) => {
    const headers: Record<string, string> = {};
    if (apiKey) headers['X-CBA-API-KEY'] = apiKey;
    return request<{ request_id: string; status: string; message: string }>(
      `/payment-requests/${id}/reject`,
      { method: 'POST', headers }
    );
  },

  // Agent Cryptographic Identity
  generateKeypair: (agent_id: string) =>
    request<any>(`/agents/${agent_id}/keypair`, { method: 'POST' }),
  registerPublicKey: (agent_id: string, public_key: string) =>
    request<any>(`/agents/${agent_id}/public-key?public_key=${encodeURIComponent(public_key)}`, { method: 'PUT' }),

  // Service Marketplace
  getMarketplaceServices: (category?: string) =>
    request<any[]>(`/marketplace/services${category ? `?category=${category}` : ''}`),
  getMarketplaceOrders: (buyer_id?: string) =>
    request<any[]>(`/marketplace/orders${buyer_id ? `?buyer_id=${buyer_id}` : ''}`),
  orderMarketplaceService: (service_id: string, units: string | number, buyer_agent_id?: string) =>
    request<any>(`/marketplace/services/${service_id}/order`, {
      method: 'POST',
      body: JSON.stringify({ units: Number(units), buyer_agent_id }),
    }),
  createMarketplaceService: (data: any, provider_agent_id?: string) =>
    request<any>(`/marketplace/services${provider_agent_id ? `?provider_agent_id=${provider_agent_id}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Audit
  getAuditEvents: () => request<AuditEvent[]>('/audit/events'),

  // Analytics
  getAnalytics: () => request<AnalyticsOverview>('/analytics/overview'),

  // Phase 3 Advanced: Merkle & Cryptographic Ledger Verification
  getMerkleRoot: () => request<{ merkle_root: string; total_ledger_entries: number; hash_algorithm: string }>('/advanced/merkle-root'),
  getMerkleProof: (entry_id: string) => request<any>(`/advanced/merkle-proof/${entry_id}`),
  verifyMerkleProof: (data: { leaf_hash: string; merkle_root: string; proof_path: any[] }) =>
    request<{ is_valid: boolean; computed_root: string; expected_root: string; verification_message: string }>(
      '/advanced/verify-merkle-proof',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  // Phase 3 Advanced: Risk & Anomaly Alerts
  getRiskAlerts: (status?: string) =>
    request<any[]>(`/advanced/risk-alerts${status ? `?status_filter=${status}` : ''}`),
  resolveRiskAlert: (alert_id: string, decision: string = 'RESOLVED') =>
    request<any>(`/advanced/risk-alerts/${alert_id}/resolve?decision=${decision}`, { method: 'POST' }),

  // Phase 3 Advanced: Multi-Currency FX Engine
  getSupportedCurrencies: () => request<Record<string, any>>('/advanced/currencies'),
  convertCurrency: (from_currency: string, to_currency: string, amount: string | number) =>
    request<{
      from_currency: string;
      to_currency: string;
      original_amount: string | number;
      converted_amount: string | number;
      effective_rate: string | number;
    }>('/advanced/convert', {
      method: 'POST',
      body: JSON.stringify({ from_currency, to_currency, amount: Number(amount) }),
    }),
};
