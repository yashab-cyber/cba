import React from 'react';
import {
  ShieldCheck,
  FileCheck2,
  ShieldAlert,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Terminal
} from 'lucide-react';

interface SecurityViewProps {
  onNavigate: (page: string) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ onNavigate }) => {
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
          Cryptographic Integrity & Zero-Trust
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
          Merkle Tree Proofs & Autonomous Tripwires
        </h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          Financial systems for machines must provide mathematical certainty, not blind trust. CBA combines SHA-256 binary Merkle proofs with real-time heuristic fraud detection to prevent unauthorized capital exfiltration.
        </p>
      </div>

      {/* 4 Pillars of CBA Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Pillar 1 */}
        <div className="p-8 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                O(log N) Merkle Inclusion Proofs
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Canonical SHA-256 Binary Tree
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Every transaction generates a paired leaf hash in CBA's cryptographic Merkle tree. External verifiers can cryptographically confirm that a payment is permanently recorded in the ledger by checking a compact logarithmic proof against the central Merkle Root without downloading the entire ledger.
          </p>
          <div className="p-3.5 rounded-xl bg-[#070b14] border border-[#1e293b] font-mono text-[11px] text-slate-300 space-y-1">
            <div><span className="text-slate-500">Endpoint:</span> GET /api/v1/audit/merkle-proof/{`{id}`}</div>
            <div><span className="text-slate-500">Root:</span> <span className="text-emerald-400">9c1b4e8f7a...32d1</span></div>
            <div><span className="text-slate-500">Proof Path:</span> [L1_hash, R2_hash, L3_hash]</div>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-8 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Real-Time Fraud & Drain Tripwires
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Sub-millisecond Policy Interceptor
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            If an agent attempts to spend more than 85% of its balance in a single transaction or hour, the autonomous risk engine immediately flags the wallet, suspends payment execution, and alerts the controlling developer account.
          </p>
          <div className="p-3.5 rounded-xl bg-[#070b14] border border-[#1e293b] font-mono text-[11px] text-slate-300 space-y-1">
            <div><span className="text-slate-500">Max Velocity:</span> 100 transactions / hour</div>
            <div><span className="text-slate-500">Drain Limit:</span> 85% of total wallet balance</div>
            <div><span className="text-slate-500">Action:</span> Instant SUSPEND & Operator Alert</div>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-8 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Ed25519 Curve25519 Key Pairs
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Asymmetric Cryptographic Authorization
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Agent payment authorization headers carry Ed25519 asymmetric signatures. Even if an attacker reads server traffic or compromises a downstream model prompt, they cannot forge a valid signature without the agent's private cryptographic key.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="p-8 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Multi-Tenant Role Isolation (RBAC)
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Strict Separation of Privileges
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Developers operate strictly isolated fleets of agents and wallets. Global administrative operations such as monetary minting, reserve adjustment, and systemic ledger reconciliation are restricted to verified administrators.
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Interactive FX Currency Calculator</h4>
          <p className="text-xs text-slate-400">Convert between CBAC, CBAC_COMPUTE, and USD_SIM with zero-loss math.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('converter')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
          >
            <span>Launch FX Converter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
