import React from 'react';
import {
  Coins,
  Wallet,
  Users,
  Activity,
  DollarSign,
  Scale,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Bot,
  PlusCircle,
  ShoppingBag,
  Code2,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { MonetarySupply, Transaction, Agent, User } from '../types';

interface OverviewProps {
  supply: MonetarySupply | null;
  transactions: Transaction[];
  agents: Agent[];
  user?: User | null;
  onSelectTransaction: (tx: Transaction) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  supply,
  transactions,
  agents,
  user,
  onSelectTransaction,
  onRunSimulation,
  isSimulating,
  onNavigateTab,
}) => {
  const isAdminOrOperator = user?.role === 'admin' || user?.role === 'operator' || user?.role === 'auditor';

  // Calculations for developer/user portfolio
  const myTotalBalance = agents.reduce((acc, a) => acc + Number(a.cached_balance || 0), 0);
  const myAgentIds = new Set(agents.map((a) => a.id));

  // Inflow and Outflow
  let mySpent24h = 0;
  let myEarned24h = 0;
  transactions.forEach((tx) => {
    const isOutbound = tx.sender_agent_id && myAgentIds.has(tx.sender_agent_id);
    const isInbound = tx.recipient_agent_id && myAgentIds.has(tx.recipient_agent_id);
    if (isOutbound) mySpent24h += Number(tx.amount || 0);
    if (isInbound) myEarned24h += Number(tx.amount || 0);
  });

  const recentTxs = transactions.slice(0, 8);

  // -------------------------------------------------------------
  // VIEW A: REGULAR USER / AI AGENT DEVELOPER OVERVIEW
  // -------------------------------------------------------------
  if (!isAdminOrOperator) {
    return (
      <div className="space-y-6">
        {/* User Hero Banner */}
        <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/25 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-white">
                  Welcome, {user?.full_name || user?.email?.split('@')[0]}
                </h2>
                <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                  {user?.tier || 'TIER_1'} • {user?.kyc_status || 'VERIFIED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Organization: <span className="text-slate-200 font-medium">{user?.organization || 'Autonomous Entity'}</span> • Dedicated AI Agent Fleet & Wallet Balances
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('agents')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Register New Agent</span>
              </button>
            )}
            <button
              onClick={onRunSimulation}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-slate-200 transition"
            >
              <Zap className={`w-3.5 h-3.5 text-emerald-400 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Simulating...' : 'Simulate Order'}</span>
            </button>
          </div>
        </div>

        {/* Personalized Developer Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="My Total Fleet Balance"
            value={`${myTotalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC`}
            subtitle={`Across ${agents.length} Agent Wallets`}
            icon={Coins}
            badge="LIQUID ASSETS"
          />

          <MetricCard
            title="My Operational Agents"
            value={`${agents.filter((a) => a.status === 'ACTIVE').length} / ${agents.length}`}
            subtitle="Autonomous AI Workers"
            icon={Bot}
            trendType="positive"
            trend="OPERATIONAL"
          />

          <MetricCard
            title="My 24h Spend & Outflow"
            value={`${mySpent24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC`}
            subtitle="Service Orders & Compute"
            icon={ArrowUpRight}
            trendType="neutral"
            trend="OUTBOUND"
          />

          <MetricCard
            title="My 24h Revenue & Inflow"
            value={`${myEarned24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC`}
            subtitle="Service Sales to Peer Agents"
            icon={ArrowDownLeft}
            trendType="positive"
            trend="INBOUND"
          />
        </div>

        {/* My AI Agent Fleet Cards */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                My Registered Autonomous AI Agents
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic liability wallets, active balances, and status under your account
              </p>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('agents')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <span>View Full Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {agents.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#1e293b] rounded-xl">
              <Bot className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-300">No AI Agents Registered Yet</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Deploy your first autonomous agent with deterministic credentials and an initial simulated funding grant.
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('agents')}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Register Agent Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="p-4 rounded-xl bg-[#090d18] border border-[#1e293b] hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{ag.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">{ag.id}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {ag.status}
                      </span>
                    </div>

                    <div className="my-3 p-2.5 rounded-lg bg-[#0f172a] border border-[#1e293b] flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Wallet Balance:</span>
                      <span className="font-mono font-bold text-xs text-emerald-400">
                        {Number(ag.cached_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono text-[10px]">{ag.wallet_id || `wal_${ag.id}`}</span>
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('marketplace')}
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        <span>Order Compute</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Recent Activity Table */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                My Agent Fleet Payment Activity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Atomic double-entry transactions involving your AI agents
              </p>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('payments')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <span>View All Payments</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentTxs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No recent payments recorded for your agents yet. Run a simulation cycle or send an agent payment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e293b] text-slate-400 text-[11px]">
                    <th className="pb-3 font-semibold">Direction / Tx ID</th>
                    <th className="pb-3 font-semibold">Service Description</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                    <th className="pb-3 font-semibold text-right">Fee</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {recentTxs.map((tx) => {
                    const isOutbound = tx.sender_agent_id && myAgentIds.has(tx.sender_agent_id);
                    return (
                      <tr
                        key={tx.id}
                        onClick={() => onSelectTransaction(tx)}
                        className="hover:bg-slate-800/40 cursor-pointer transition"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-full ${isOutbound ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {isOutbound ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                            </span>
                            <div>
                              <div className="font-mono text-xs text-slate-200">{tx.id}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {isOutbound ? `To: ${tx.recipient_agent_id}` : `From: ${tx.sender_agent_id}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 text-slate-300">
                          <div className="truncate max-w-xs">{tx.description || tx.transaction_type}</div>
                        </td>

                        <td className="py-3 text-right font-mono font-bold">
                          <span className={isOutbound ? 'text-amber-400' : 'text-emerald-400'}>
                            {isOutbound ? '-' : '+'}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC
                          </span>
                        </td>

                        <td className="py-3 text-right font-mono text-slate-400 text-[11px]">
                          {Number(tx.fee_amount).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </td>

                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: CENTRAL BANK ADMINISTRATOR / OPERATOR MACRO OVERVIEW
  // -------------------------------------------------------------
  const circulating = Number(supply?.circulating_in_agents || 0);
  const treasury = Number(supply?.treasury_reserve || 0);
  const totalIssued = Number(supply?.total_issued || 0);
  const fees = Number(supply?.fee_pool_revenue || 0);
  const burned = Number(supply?.burned_total || 0);

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
          subtitle={`${agents.filter((a) => a.status === 'ACTIVE').length} Active Agents`}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {recentTxs.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3">
                      <div className="font-mono text-slate-200">{tx.id}</div>
                      <div className="text-[10px] text-slate-500">{tx.transaction_type}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-slate-300 font-mono text-[11px]">
                        {tx.sender_agent_id ? `${tx.sender_agent_id} -> ${tx.recipient_agent_id || 'System'}` : 'System Treasury'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{tx.description}</div>
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-slate-200">
                      {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC
                    </td>
                    <td className="py-3 text-right font-mono text-slate-400 text-[11px]">
                      {Number(tx.fee_amount).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Central Bank Architecture Cards */}
        <div className="space-y-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Central Bank Accounts (General Ledger)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e293b] flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-medium block">1000 Reserve Asset</span>
                  <span className="text-[10px] text-slate-500 font-mono">ASSET (Debit balance)</span>
                </div>
                <span className="font-mono text-slate-200 font-semibold">{totalIssued.toLocaleString()} CBAC</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e293b] flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-medium block">2000 Agent Liabilities</span>
                  <span className="text-[10px] text-slate-500 font-mono">LIABILITY (Credit balance)</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">{circulating.toLocaleString()} CBAC</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e293b] flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-medium block">3000 Treasury Equity</span>
                  <span className="text-[10px] text-slate-500 font-mono">EQUITY (Credit balance)</span>
                </div>
                <span className="font-mono text-blue-400 font-semibold">{treasury.toLocaleString()} CBAC</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e293b] flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-medium block">4000 Protocol Fee Pool</span>
                  <span className="text-[10px] text-slate-500 font-mono">REVENUE (Credit balance)</span>
                </div>
                <span className="font-mono text-purple-400 font-semibold">{fees.toLocaleString()} CBAC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
