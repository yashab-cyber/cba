import React from 'react';
import {
  Scale,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface ComparisonViewProps {
  onNavigate: (page: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ onNavigate }) => {
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
        <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
          FinTech Comparative Analysis
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
          Traditional Banking vs. Web3 vs. CBA
        </h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          Autonomous AI agents possess radically different requirements than humans or anonymous cryptocurrency holders: sub-second settlement, negligible fixed fees for micro-inference, strict prompt-injection immunity, and zero floating-point accounting drift.
        </p>
      </div>

      {/* Comparison Table Card */}
      <div className="rounded-2xl bg-[#0e1628] border border-[#1e293b] overflow-hidden shadow-2xl mb-14">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#070b14] text-slate-300">
                <th className="py-4 px-6 font-semibold">Capability</th>
                <th className="py-4 px-6 font-semibold text-slate-400">Traditional Banking (Visa/Stripe)</th>
                <th className="py-4 px-6 font-semibold text-slate-400">Public Blockchains (ETH/SOL)</th>
                <th className="py-4 px-6 font-bold text-blue-400 bg-blue-500/10">CBA (Central Bank of Agents)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              <tr>
                <td className="py-4 px-6 font-medium text-white">Target Entity</td>
                <td className="py-4 px-6 text-slate-400">Humans with Government ID / SSN</td>
                <td className="py-4 px-6 text-slate-400">Anonymous Wallets</td>
                <td className="py-4 px-6 font-semibold text-emerald-400 bg-blue-500/5">
                  Autonomous AI Agents & Swarms
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">Micro-Transaction Fee</td>
                <td className="py-4 px-6 text-rose-400">$0.30 + 2.9% (Infeasible for $0.001 calls)</td>
                <td className="py-4 px-6 text-amber-400">Volatile Gas Fees ($0.05 to $50+)</td>
                <td className="py-4 px-6 font-semibold text-emerald-400 bg-blue-500/5">
                  Fixed 0.05% Proportional Fee
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">Settlement Latency</td>
                <td className="py-4 px-6 text-slate-400">2-3 Business Days (ACH) / 2-5s Gateway</td>
                <td className="py-4 px-6 text-slate-400">12 seconds to 10 minutes</td>
                <td className="py-4 px-6 font-semibold text-emerald-400 bg-blue-500/5">
                  Sub-15ms Atomic ACID Settlement
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">Prompt-Injection Defense</td>
                <td className="py-4 px-6 text-rose-400">None (Card exfiltrated in chat logs)</td>
                <td className="py-4 px-6 text-rose-400">Private key theft if stored in prompt</td>
                <td className="py-4 px-6 font-semibold text-emerald-400 bg-blue-500/5">
                  Ed25519 Signatures & Spending Policies
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">Floating Point Precision</td>
                <td className="py-4 px-6 text-slate-400">Cent rounding issues</td>
                <td className="py-4 px-6 text-slate-400">Integer Wei conversions</td>
                <td className="py-4 px-6 font-semibold text-emerald-400 bg-blue-500/5">
                  NUMERIC(20,6) Zero-Loss Decimal Engine
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">Developer Integration</td>
                <td className="py-4 px-6 text-slate-400">Complex webhooks & human KYC</td>
                <td className="py-4 px-6 text-slate-400">Web3 wallet & RPC node upkeep</td>
                <td className="py-4 px-6 font-semibold text-emerald-400 bg-blue-500/5">
                  3-Line Python SDK (cba_sdk)
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">Audit Verifiability</td>
                <td className="py-4 px-6 text-slate-400">Monthly bank PDF statement</td>
                <td className="py-4 px-6 text-emerald-400">Public block explorer</td>
                <td className="py-4 px-6 font-semibold text-emerald-400 bg-blue-500/5">
                  O(log N) Cryptographic Merkle Proofs
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Knowledge Base & FAQ</h4>
          <p className="text-xs text-slate-400">Find answers to currency mechanics, security tripwires, and API usage.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('faq')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
          >
            <span>Read FAQ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
