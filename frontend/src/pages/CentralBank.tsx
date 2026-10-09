import React, { useState } from 'react';
import {
  Landmark,
  Coins,
  Scale,
  Flame,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { MonetarySupply, ReconciliationReport, Agent } from '../types';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

interface CentralBankProps {
  supply: MonetarySupply | null;
  reconciliation: ReconciliationReport | null;
  agents: Agent[];
  onRefresh: () => void;
  onRunAudit: () => void;
  isAuditing: boolean;
}

export const CentralBank: React.FC<CentralBankProps> = ({
  supply,
  reconciliation,
  agents,
  onRefresh,
  onRunAudit,
  isAuditing,
}) => {
  // Modals
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [isAllocOpen, setIsAllocOpen] = useState(false);
  const [isBurnOpen, setIsBurnOpen] = useState(false);

  // Form states
  const [mintAmount, setMintAmount] = useState('500000');
  const [mintReason, setMintReason] = useState('Expansion of algorithmic liquidity reserves');

  const [allocAgentId, setAllocAgentId] = useState('');
  const [allocAmount, setAllocAmount] = useState('10000');
  const [allocReason, setAllocReason] = useState('Compute development grant');

  const [burnAgentId, setBurnAgentId] = useState('');
  const [burnAmount, setBurnAmount] = useState('1000');
  const [burnReason, setBurnReason] = useState('Excess liquidity retirement');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.mintCurrency(mintAmount, mintReason);
      setIsMintOpen(false);
      onRefresh();
      alert(`Successfully minted ${mintAmount} CBAC into Treasury.`);
    } catch (err: any) {
      alert(`Minting failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocAgentId) return;
    try {
      setIsSubmitting(true);
      await api.allocateFunds(allocAgentId, allocAmount, allocReason);
      setIsAllocOpen(false);
      onRefresh();
      alert(`Successfully allocated ${allocAmount} CBAC to ${allocAgentId}.`);
    } catch (err: any) {
      alert(`Allocation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!burnAgentId) return;
    try {
      setIsSubmitting(true);
      await api.burnCurrency(burnAgentId, burnAmount, burnReason);
      setIsBurnOpen(false);
      onRefresh();
      alert(`Successfully retired ${burnAmount} CBAC from circulation.`);
    } catch (err: any) {
      alert(`Retirement failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Monetary Authority Operations */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100">
              Central Bank Monetary Policy & Supply Authority
            </h2>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
              GOVERNANCE: ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Authorize currency issuance into Treasury, allocate computational grants to emerging agents, 
            and enforce currency contraction through verifiable burning.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsMintOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Mint CBAC</span>
          </button>
          <button
            onClick={() => setIsAllocOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Grant Capital</span>
          </button>
          <button
            onClick={() => setIsBurnOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow transition"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Burn Credits</span>
          </button>
        </div>
      </div>

      {/* Monetary Supply Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Total Issued (Monetary Base)
          </span>
          <div className="text-xl font-bold font-mono text-slate-100">
            {Number(supply?.total_issued || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Proof of Reserve Assets</span>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Treasury Reserve Balance
          </span>
          <div className="text-xl font-bold font-mono text-blue-400">
            {Number(supply?.treasury_reserve || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Unallocated Capital Reserve</span>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Circulating in Agent Wallets
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {Number(supply?.circulating_in_agents || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Central Bank Liabilities</span>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Retired & Burned
          </span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {Number(supply?.burned_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Permanent Contraction</span>
        </div>
      </div>

      {/* Live Reconciliation Inspector */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Live Double-Entry Ledger Reconciliation Inspector</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Audits all immutable journal entries and compares account balances against raw ledger debits and credits
            </p>
          </div>

          <button
            onClick={onRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing Ledger...' : 'Run Real-Time Audit'}</span>
          </button>
        </div>

        {reconciliation && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <span className="text-slate-500 text-[10px] block mb-1">TOTAL DEBITS RECORDED</span>
              <span className="font-bold text-slate-200 text-sm">
                {Number(reconciliation.total_debits).toFixed(6)} CBAC
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <span className="text-slate-500 text-[10px] block mb-1">TOTAL CREDITS RECORDED</span>
              <span className="font-bold text-slate-200 text-sm">
                {Number(reconciliation.total_credits).toFixed(6)} CBAC
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <span className="text-slate-500 text-[10px] block mb-1">NET IMBALANCE (Δ)</span>
              <span className="font-bold text-emerald-400 text-sm">
                {Number(reconciliation.net_imbalance).toFixed(6)} CBAC
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <span className="text-slate-500 text-[10px] block mb-1">LEDGER AUDIT VERDICT</span>
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {reconciliation.status}
              </span>
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1e293b] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>
              Verified {reconciliation?.total_ledger_entries_verified || 0} ledger entries across {reconciliation?.accounts_audited || 0} accounts. Discrepancies detected: {reconciliation?.cached_vs_ledger_discrepancies_count || 0}.
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Last Audit: {reconciliation?.audit_timestamp ? new Date(reconciliation.audit_timestamp).toLocaleTimeString() : 'Just now'}
          </span>
        </div>
      </div>

      {/* Modal: Mint Currency */}
      <Modal
        isOpen={isMintOpen}
        onClose={() => setIsMintOpen(false)}
        title="Mint New CBA Credits (Monetary Expansion)"
        subtitle="Expands monetary base: Debits Central Reserve (Asset) and Credits Treasury (Equity)"
      >
        <form onSubmit={handleMint} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Mint Amount (CBAC)</label>
            <input
              type="number"
              step="any"
              min="1"
              required
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Monetary Policy Justification / Reason</label>
            <input
              type="text"
              required
              value={mintReason}
              onChange={(e) => setMintReason(e.target.value)}
              placeholder="e.g. Expansion of algorithmic compute liquidity for Q4"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl text-blue-300">
            <strong>Monetary Accounting Invariant:</strong> Minted credits enter Central Bank Treasury reserves and do not inflate circulating agent balances until explicitly granted.
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsMintOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow transition disabled:opacity-50"
            >
              {isSubmitting ? 'Minting...' : 'Authorize Minting'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Allocate Grant */}
      <Modal
        isOpen={isAllocOpen}
        onClose={() => setIsAllocOpen(false)}
        title="Grant Capital from Treasury to AI Agent"
        subtitle="Debits Treasury Equity and Credits Agent Deposit Liability Account"
      >
        <form onSubmit={handleAllocate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Recipient AI Agent</label>
            <select
              required
              value={allocAgentId}
              onChange={(e) => setAllocAgentId(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="">Select Target Agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id}) - Current Bal: {Number(a.cached_balance || 0).toFixed(2)} CBAC
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Allocation Amount (CBAC)</label>
            <input
              type="number"
              step="any"
              min="1"
              required
              value={allocAmount}
              onChange={(e) => setAllocAmount(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Grant Reason</label>
            <input
              type="text"
              required
              value={allocReason}
              onChange={(e) => setAllocReason(e.target.value)}
              placeholder="e.g. Inference quota subsidy for research agent"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsAllocOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow transition disabled:opacity-50"
            >
              {isSubmitting ? 'Allocating...' : 'Execute Capital Grant'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Burn Currency */}
      <Modal
        isOpen={isBurnOpen}
        onClose={() => setIsBurnOpen(false)}
        title="Retire / Burn CBAC Credits"
        subtitle="Permanently debits agent liability and credits Burn Retirement Account"
      >
        <form onSubmit={handleBurn} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Source Agent Wallet</label>
            <select
              required
              value={burnAgentId}
              onChange={(e) => setBurnAgentId(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="">Select Agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id}) - Current Bal: {Number(a.cached_balance || 0).toFixed(2)} CBAC
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Burn Amount (CBAC)</label>
            <input
              type="number"
              step="any"
              min="0.000001"
              required
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Contraction Justification</label>
            <input
              type="text"
              required
              value={burnReason}
              onChange={(e) => setBurnReason(e.target.value)}
              placeholder="e.g. Slashing fee penalty / regulatory retirement"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsBurnOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow transition disabled:opacity-50"
            >
              {isSubmitting ? 'Burning...' : 'Execute Permanent Burn'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
