import React from 'react';
import {
  Bot,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Coins,
  Scale,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

interface ConceptViewProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const ConceptView: React.FC<ConceptViewProps> = ({ onNavigate, onOpenAuth }) => {
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
          Foundational Banking Architecture
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
          Why Traditional Banking Fails AI Agents
        </h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          Traditional financial infrastructure was engineered under the assumption of human participants: identities verified by paper passports, interfaces navigated by point-and-click browsers, and payment rails constrained by multi-day settlement and steep percentage-plus-fixed fee minimums.
        </p>
      </div>

      {/* The 3 Core Failures of Human Banking for LLMs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-rose-500/30">
          <div className="text-rose-400 font-mono text-xs font-semibold uppercase mb-2">
            Failure Point 01
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Human KYC & Legal Personhood</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stripe, Plaid, and traditional merchant banks require human SSNs, utility bills, and physical registration. AI agent swarms cannot possess passports or sign legal guarantees.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e1628] border border-rose-500/30">
          <div className="text-rose-400 font-mono text-xs font-semibold uppercase mb-2">
            Failure Point 02
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Punitive $0.30 Minimum Fees</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard credit card interchanges charge $0.30 + 2.9%. In an autonomous economy where an agent buys 500 tokens of GPU inference for $0.002, a $0.30 fixed fee is a 15,000% penalty.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e1628] border border-rose-500/30">
          <div className="text-rose-400 font-mono text-xs font-semibold uppercase mb-2">
            Failure Point 03
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Catastrophic Prompt Exfiltration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Giving an LLM raw credit card numbers or banking API keys creates extreme vulnerability. A single prompt injection prompt can exfiltrate credentials directly in chat logs.
          </p>
        </div>
      </div>

      {/* The CBA Solution: 3 Pillars */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">
          The CBA Architectural Solution
        </h2>

        <div className="space-y-6">
          {/* Pillar 1 */}
          <div className="p-8 rounded-2xl bg-[#0e1628] border border-[#1e293b] flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-blue-400">PILLAR 1</span>
                <span className="text-xs text-slate-500">&bull;</span>
                <span className="text-xs text-slate-400">Agent-Native Deterministic Wallets</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Programmatic Wallets & Sub-Account Scoping
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Every agent instantiated in CBA receives a deterministic identifier (<code className="text-blue-300 font-mono text-[11px]">wal_agent_xxx</code>), independent balance tracking, configurable spending ceilings, and authorized counterparty allowlists.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 font-mono">
                <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1e293b]">
                  <span className="text-slate-500 block text-[10px]">IDENTIFIER</span>
                  <span className="text-blue-300">wal_agent_coder_02</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1e293b]">
                  <span className="text-slate-500 block text-[10px]">VELOCITY LIMIT</span>
                  <span className="text-emerald-300">Max 50.000000 CBAC / hour</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-2xl bg-[#0e1628] border border-[#1e293b] flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-purple-400">PILLAR 2</span>
                <span className="text-xs text-slate-500">&bull;</span>
                <span className="text-xs text-slate-400">Machine-to-Machine Programmable Commerce</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Sub-15ms Atomic Settlement & Micro-Fees
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                CBA transaction fees are purely proportional at 0.05% with zero fixed minimum penalty. An agent can pay 0.001000 CBAC for an embedding vector search and receive sub-15ms confirmation and an instant bearer access token.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="text-emerald-400">&bull; Fixed Fee: 0.05%</span>
                <span className="text-purple-400">&bull; Settlement: Sub-15ms ACID</span>
                <span className="text-blue-400">&bull; Bearer Token: Instant HMAC</span>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-2xl bg-[#0e1628] border border-[#1e293b] flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-emerald-400">PILLAR 3</span>
                <span className="text-xs text-slate-500">&bull;</span>
                <span className="text-xs text-slate-400">Prompt-Injection Isolation</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Decoupled Cryptographic Authorization
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Natural-language statements from an LLM are NEVER accepted as financial authorization. Transfers require scoped API credentials, optional Ed25519 digital signatures, and must satisfy strict server-side policy bounds before ledger entry.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>85% automated drain breaker prevents catastrophic token draining.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Double-Entry Ledger Architecture</h4>
          <p className="text-xs text-slate-400">Learn how CBA executes zero-sum atomic transfers with Merkle trees.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('architecture')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
          >
            <span>Explore Architecture</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
