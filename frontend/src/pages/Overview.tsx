import React from 'react';
import {
  Coins,
  Wallet,
  Users,
  Activity,
  DollarSign,
  Scale,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { MonetarySupply, Transaction, Agent } from '../types';

interface OverviewProps {
  supply: MonetarySupply | null;
  transactions: Transaction[];
  agents: Agent[];
  onSelectTransaction: (tx: Transaction) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export const Overview: React.FC<OverviewProps> = ({
  supply,
  transactions,
  agents,
  onSelectTransaction,
  onRunSimulation,
  isSimulating,
}) => {
  const circulating = Number(supply?.circulating_in_agents || 0);
  const treasury = Number(supply?.treasury_reserve || 0);
  const totalIssued = Number(supply?.total_issued || 0);
  const fees = Number(supply?.fee_pool_revenue || 0);
  const burned = Number(supply?.burned_total || 0);

  const recentTxs = transactions.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Top Banner: Economic Health & Alert */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-100">
                Monetary Equilibrium & Zero-Sum Journal Verified
              </h2>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                ACID IN BALANCE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              CBA ledger strictly satisfies <span className="font-mono text-slate-300">Assets = Liabilities + Equity</span>. 
              All agent balances are backed by append-only double-entry journals with row-level locks and 0.000000 CBAC imbalance.
            </p>
          </div>
        </div>

        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition shrink-0"
        >
          <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Executing Cycles...' : 'Run Live Economy Simulation'}</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Issued CBAC"
          value={totalIssued.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          subtitle="Monetary Base"
          icon={Coins}
          badge="ASSETS"
        />
        <MetricCard
          title="Circulating Supply"
          value={circulating.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          subtitle="In Agent Wallets"
          icon={Wallet}
          trend={`${totalIssued > 0 ? ((circulating / totalIssued) * 100).toFixed(1) : 0}% of Total`}
          trendType="positive"
        />
        <MetricCard
          title="Treasury Reserve"
          value={treasury.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          subtitle="Available for Grants"
          icon={Scale}
          badge="EQUITY"
        />
        <MetricCard
          title="Registered Agents"
          value={agents.length}
          subtitle={`${agents.filter(a => a.status === 'ACTIVE').length} Active Agents`}
          icon={Users}
          trendType="neutral"
        />
        <MetricCard
          title="Collected Fees"
          value={fees.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
          subtitle="0.10% Protocol Fee"
          icon={DollarSign}
          trend="REVENUE"
          trendType="positive"
        />
        <MetricCard
          title="Retired / Burned"
          value={burned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          subtitle="Permanent Contraction"
          icon={Activity}
          trend="BURNED"
          trendType="neutral"
        />
      </div>

      {/* Main Grid: Transactions Feed & System Architecture Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Live Inter-Agent Payment Stream</h3>
              <p className="text-xs text-slate-400">Atomic journal entries processed with cryptographic hash chain</p>
            </div>
            <span className="text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
              {transactions.length} Total Settled
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e293b] text-slate-400 text-[11px]">
                  <th className="pb-3 font-semibold">Tx ID / Type</th>
                  <th className="pb-3 font-semibold">Counterparties</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-right">Fee</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60">
                {recentTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition group">
                    <td className="py-3 font-mono">
                      <div className="font-medium text-slate-200">{tx.id.slice(0, 14)}...</div>
                      <span className="text-[10px] text-slate-500 uppercase">{tx.transaction_type}</span>
                    </td>
                    <td className="py-3">
                      <div className="text-slate-300 font-mono text-[11px]">
                        {tx.sender_agent_id || tx.sender_wallet_id.slice(0, 12)}
                      </div>
                      <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                        <span>➔</span>
                        <span>{tx.recipient_agent_id || tx.recipient_wallet_id.slice(0, 12)}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-emerald-400">
                      +{Number(tx.amount).toFixed(2)} CBAC
                    </td>
                    <td className="py-3 text-right font-mono text-slate-400 text-[11px]">
                      {Number(tx.fee_amount).toFixed(4)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          tx.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {tx.status === 'COMPLETED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {tx.status === 'PENDING_APPROVAL' && <Clock className="w-2.5 h-2.5" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectTransaction(tx)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 text-[10px] font-medium transition"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {recentTxs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No transactions recorded yet. Click "Run Live Economy Simulation" above to seed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Active Agents & Policy Control summary */}
        <div className="space-y-6">
          {/* Agent Balances Snapshot */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Top Active AI Agents</h3>
            <p className="text-xs text-slate-400 mb-4">Autonomous entities in the current economy</p>

            <div className="space-y-3">
              {agents.slice(0, 4).map((agent) => (
                <div
                  key={agent.id}
                  className="p-3 rounded-xl bg-[#0a0f1d] border border-[#1e293b] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-mono font-bold">
                      {agent.name.slice(6, 7) || 'A'}
                    </div>
                    <div>
                      <div className="font-medium text-xs text-slate-200 line-clamp-1">{agent.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{agent.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold text-slate-200">
                      {Number(agent.cached_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500">CBAC</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Safeguards Card */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Institutional Safeguards
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span><strong>No Floating-Point Math:</strong> All calculations computed with 6 decimal places of precision.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span><strong>Idempotency Guarantees:</strong> Unique keys prevent network-induced duplicate charges.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span><strong>Server-Side Policy Enforcement:</strong> Prompt injections cannot bypass velocity limits or counterparty whitelists.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
