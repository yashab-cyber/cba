import React from 'react';
import {
  Scale,
  Database,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Layers,
  Coins,
  Cpu,
  FileCheck2
} from 'lucide-react';

interface ArchitectureViewProps {
  onNavigate: (page: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Public Overview</span>
      </button>

      {/* Hero Header */}
      <div className="mb-14">
        <span className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider">
          FinTech Engineering Core
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
          Double-Entry ACID Financial Ledger
        </h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          At the center of CBA is a classical double-entry transaction engine. Every transfer writes balanced debit and credit entries to an immutable, append-only journal in a single atomic database transaction.
        </p>
      </div>

      {/* Double-Entry Equation Banner */}
      <div className="p-8 rounded-2xl bg-[#0e1628] border border-blue-500/30 mb-14 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">
            Monetary Equilibrium Invariance
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
            Assets = Liabilities + Equity &nbsp;&hArr;&nbsp; &Sigma;Debits - &Sigma;Credits = 0
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Every credit has an equal and opposite debit. Currency cannot leak or appear from nowhere.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#070b14] px-5 py-3 rounded-xl border border-[#1e293b] shrink-0">
          <Scale className="w-6 h-6 text-emerald-400" />
          <div className="text-xs">
            <div className="font-semibold text-slate-200">Zero-Sum Ledger Status</div>
            <div className="text-emerald-400 font-mono text-[11px]">Equilibrium Delta: 0.000000 CBAC</div>
          </div>
        </div>
      </div>

      {/* 4-Step Pipeline Flow */}
      <div className="mb-14">
        <h2 className="text-xl font-bold text-white mb-6">
          The 4-Stage Atomic Execution Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#0e1628] border border-[#1e293b]">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono font-bold text-sm mb-3">
              01
            </div>
            <h4 className="font-semibold text-slate-100 text-sm mb-1.5">Signed Request</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agent submits payment request with Ed25519 signature, timestamp freshness window (&plusmn;300s), and idempotency key.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0e1628] border border-[#1e293b]">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono font-bold text-sm mb-3">
              02
            </div>
            <h4 className="font-semibold text-slate-100 text-sm mb-1.5">Policy & Risk Evaluation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Server verifies velocity caps (&lt;100 tx/hr), single-tx ceiling, counterparty allowlist, and 85% drain tripwires.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0e1628] border border-[#1e293b]">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm mb-3">
              03
            </div>
            <h4 className="font-semibold text-slate-100 text-sm mb-1.5">Atomic Journaling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Balanced debit row (payer) and credit row (recipient) written atomically in a single ACID database transaction.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0e1628] border border-[#1e293b]">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-sm mb-3">
              04
            </div>
            <h4 className="font-semibold text-slate-100 text-sm mb-1.5">Merkle Root Update</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Journal entries incorporated into canonical binary SHA-256 Merkle tree, enabling O(log N) inclusion proofs.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Ledger Journal Mockup */}
      <div className="mb-14">
        <h2 className="text-xl font-bold text-white mb-4">
          Double-Entry Journal Anatomy
        </h2>
        <div className="rounded-2xl bg-[#0e1628] border border-[#1e293b] overflow-hidden shadow-2xl">
          <div className="px-5 py-3.5 bg-[#070b14] border-b border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-semibold text-slate-300">
                Transaction Journal &bull; tx_7c41a98e210b
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ACID Committed &bull; Delta = 0
            </span>
          </div>

          <div className="p-5 font-mono text-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#0a0f1d] border border-[#1e293b]/70">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Account</span>
                <span className="text-blue-300 font-bold">wal_agent_coder_02</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Entry Type</span>
                <span className="text-rose-400 font-bold">DEBIT (-15.000000)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Currency</span>
                <span className="text-slate-300">CBAC</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">SHA-256 Digest</span>
                <span className="text-slate-400 text-[11px]">8f3a9e...1b02</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#0a0f1d] border border-[#1e293b]/70">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Account</span>
                <span className="text-purple-300 font-bold">wal_agent_gpu_h100</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Entry Type</span>
                <span className="text-emerald-400 font-bold">CREDIT (+14.992500)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Currency</span>
                <span className="text-slate-300">CBAC</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">SHA-256 Digest</span>
                <span className="text-slate-400 text-[11px]">3b72cf...41a8</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#0a0f1d] border border-[#1e293b]/70">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Account</span>
                <span className="text-amber-300 font-bold">wal_treasury_fees</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Entry Type</span>
                <span className="text-amber-400 font-bold">CREDIT (+0.007500)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Fee Assessment</span>
                <span className="text-slate-300">0.05% Network Fee</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">SHA-256 Digest</span>
                <span className="text-slate-400 text-[11px]">e210a4...9f6b</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Autonomous M2M Marketplace</h4>
          <p className="text-xs text-slate-400">See how agents discover compute services and exchange micro-credits.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('marketplace')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
