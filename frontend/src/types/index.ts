export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  owner_id: string;
  wallet_id?: string;
  cached_balance?: string | number;
  public_key?: string;
  created_at: string;
  updated_at?: string;
}

export interface Wallet {
  id: string;
  agent_id?: string | null;
  wallet_type: 'AGENT' | 'TREASURY' | 'FEE_POOL' | 'BURN' | 'ESCROW';
  currency: string;
  cached_balance: string | number;
  status: 'ACTIVE' | 'FROZEN';
  created_at: string;
  updated_at?: string;
}

export interface LedgerEntry {
  id: string;
  ledger_account_id: string;
  account_number?: string;
  account_type?: string;
  entry_type: 'DEBIT' | 'CREDIT';
  amount: string | number;
  entry_hash?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  idempotency_key: string;
  sender_wallet_id: string;
  recipient_wallet_id: string;
  sender_agent_id?: string | null;
  recipient_agent_id?: string | null;
  amount: string | number;
  fee_amount: string | number;
  currency: string;
  status: 'PENDING' | 'AUTHORIZED' | 'PENDING_APPROVAL' | 'COMPLETED' | 'REJECTED' | 'REVERSED';
  transaction_type: string;
  reference_tx_id?: string | null;
  description?: string | null;
  created_at: string;
  settled_at?: string | null;
}

export interface TransactionReceipt {
  transaction: Transaction;
  ledger_entries: LedgerEntry[];
  sender_balance_after?: string | number;
  recipient_balance_after?: string | number;
  verification_status: string;
}

export interface PaymentRequest {
  id: string;
  requester_agent_id: string;
  payer_agent_id: string;
  amount: string | number;
  currency: string;
  service_code: string;
  service_description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'FULFILLED';
  transaction_id?: string | null;
  expires_at: string;
  created_at: string;
}

export interface SpendingPolicy {
  id: string;
  agent_id: string;
  max_amount_per_tx: string | number;
  daily_spending_limit: string | number;
  monthly_spending_limit: string | number;
  human_approval_threshold: string | number;
  allowed_counterparties: string | string[];
  emergency_freeze: boolean;
  created_at: string;
  updated_at?: string;
}

export interface MonetarySupply {
  currency: string;
  total_issued: string | number;
  circulating_in_agents: string | number;
  treasury_reserve: string | number;
  fee_pool_revenue: string | number;
  burned_total: string | number;
  total_assets: string | number;
  total_liabilities_and_equity: string | number;
  is_monetary_equation_balanced: boolean;
  active_agents_count: number;
  total_transactions_count: number;
}

export interface ReconciliationReport {
  is_balanced: boolean;
  total_debits: string | number;
  total_credits: string | number;
  net_imbalance: string | number;
  cached_vs_ledger_discrepancies_count: number;
  total_ledger_entries_verified: number;
  accounts_audited: number;
  audit_timestamp: string;
  status: string;
  discrepancy_details: string[];
}

export interface AnalyticsOverview {
  volume_24h: string | number;
  volume_all_time: string | number;
  fees_collected_total: string | number;
  transactions_24h: number;
  transactions_total: number;
  pending_approval_transactions: number;
  agents: {
    total: number;
    active: number;
    suspended: number;
  };
  breakdown_by_type: Array<{
    type: string;
    count: number;
    volume: string | number;
  }>;
  monetary_unit: string;
}

export interface AuditEvent {
  id: string;
  actor_type: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address?: string;
  details: Record<string, any>;
  created_at: string;
}

export interface ServiceListing {
  id: string;
  provider_agent_id: string;
  service_code: string;
  title: string;
  description?: string;
  category: string;
  pricing_model: string;
  price_per_unit: string | number;
  currency: string;
  unit_name: string;
  endpoint_url?: string;
  is_active: boolean;
  total_orders: number;
  created_at: string;
}

export interface ServiceOrder {
  id: string;
  service_id: string;
  buyer_agent_id: string;
  units_ordered: string | number;
  total_price: string | number;
  currency: string;
  status: string;
  transaction_id?: string;
  access_token: string;
  created_at: string;
}

export interface KeypairResponse {
  agent_id: string;
  public_key: string;
  private_key: string;
  key_algorithm: string;
  instructions: string;
}
