import React from 'react';
import {
  Landmark,
  ShieldCheck,
  Bot,
  Zap,
  ArrowRight,
  Code2,
  Lock,
  Scale,
  ShoppingBag,
  ShieldAlert,
  Coins,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Layers,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { User } from '../types';

interface LandingPageProps {
  user: User | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onEnterDashboard: () => void;
  onRunSimulation?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  user,
  onOpenAuth,
  onEnterDashboard,
  onRunSimulation
}) => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <header className="h-20 border-b border-[#1e293b]/70 bg-[#070b14]/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={onEnterDashboard}>
          <img
            src="/logo.png"
            alt="Central Bank of Agents Logo"
            className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-blue-500/20"
          />
          <div>
            <div className="font-bold text-slate-100 text-base tracking-wide flex items-center gap-2">
              Central Bank of Agents
              <span className="text-[10px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                CBA OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Financial Infrastructure for AI Agents</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
          <a href="#concept" className="hover:text-blue-400 transition">Core Concept</a>
          <a href="#architecture" className="hover:text-blue-400 transition">Architecture</a>
          <a href="#marketplace" className="hover:text-blue-400 transition">Marketplace</a>
          <a href="#security" className="hover:text-blue-400 transition">Merkle Audits</a>
          <a href="#sdk" className="hover:text-blue-400 transition">Python SDK</a>
        </nav>

        {/* Right Corner Buttons (Sign In & Sign Up) */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition"
            >
              <span>Enter Banking Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition"
              >
                <span>Register Account</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 overflow-hidden flex flex-col items-center text-center">
        {/* Ambient background glows */}
        <div className="absolute w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -top-40" />
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none top-60" />

        {/* Prominent Emblem Banner with Logo */}
        <div className="inline-flex items-center gap-3 p-2 pr-4 rounded-full bg-[#0e1628]/90 border border-blue-500/30 backdrop-blur-md mb-8 shadow-xl">
          <img
            src="/logo.png"
            alt="CBA Logo"
            className="w-8 h-8 object-contain rounded-full"
          />
          <span className="text-xs font-medium text-blue-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CBA v1.3 • The Digital Banking Standard for Autonomous AI Agents
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight sm:leading-tight mb-6">
          The Financial Operating System for the{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
            AI Agent Economy
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          CBA provides institutional-grade digital banking infrastructure for autonomous AI agents, LLM swarms, and agentic applications to own wallets, hold native currency (<span className="text-blue-400 font-mono">CBAC</span>), pay for GPU inference, and settle transactions with cryptographic verification.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          {user ? (
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Launch Banking Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('signup')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Get Started & Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {onRunSimulation && (
            <button
              onClick={onRunSimulation}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-slate-200 transition"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Simulate Agent Economy</span>
            </button>
          )}

          <a
            href="https://github.com/yashab-cyber/cba"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-slate-300 transition"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>GitHub Repository</span>
          </a>
        </div>

        {/* Key Architectural Highlights Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full text-left">
          <div className="p-4 rounded-xl bg-[#0e1628]/60 border border-[#1e293b]">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
              <Scale className="w-4 h-4" />
              <span>Double-Entry ACID</span>
            </div>
            <p className="text-xs text-slate-400">Strict zero-sum journal. Debits equal credits on every atomic transfer.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1628]/60 border border-[#1e293b]">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-1">
              <Lock className="w-4 h-4" />
              <span>Ed25519 Signatures</span>
            </div>
            <p className="text-xs text-slate-400">Curve25519 asymmetric payment signing prevents natural-language prompt injection.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1628]/60 border border-[#1e293b]">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1">
              <Coins className="w-4 h-4" />
              <span>Zero Float Loss</span>
            </div>
            <p className="text-xs text-slate-400">6 decimal places precision (<code className="font-mono">NUMERIC(20,6)</code>) with zero floating-point math.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1628]/60 border border-[#1e293b]">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Autonomous Risk Freeze</span>
            </div>
            <p className="text-xs text-slate-400">Automated velocity tripwires & 85% drain tripwires actively halt exfiltrations.</p>
          </div>
        </div>
      </section>

      {/* Core Concept Section */}
      <section id="concept" className="px-6 lg:px-12 py-20 bg-[#0a0f1d] border-t border-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
              Autonomous Economy Architecture
            </span>
            <h2 className="text-3xl font-bold text-white mt-2">
              Why Traditional Banking Fails AI Agents
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Traditional credit cards and payment gateways require human KYC, enforce minimum fees of $0.30+, have multi-second latencies, and create catastrophic corporate liability when granting LLMs raw card numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">Agent-Native Identity & Wallets</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every agent receives a deterministic identifier (<code className="text-blue-300 font-mono text-[11px]">wal_agent_xxx</code>), programmable velocity limits, counterparty allowlists, and cryptographic keys.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1e293b] text-[11px] font-mono text-slate-500">
                Scope: wallets:read, payments:create
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">Machine-to-Machine Marketplace</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Agents discover services, purchase GPU compute slices, stream micro-credits for DeepSeek/Claude reasoning, and receive instantaneous bearer access tokens upon settlement.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1e293b] text-[11px] font-mono text-slate-500">
                Settlement: Sub-10ms Atomic Journal
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">Cryptographic Merkle Proofs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Independent mathematical audit proofs ($O(\log N)$) allow external agents and auditors to verify any balance journal entry against the central Merkle root without downloading full ledgers.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1e293b] text-[11px] font-mono text-slate-500">
                Hash: SHA-256 Canonical Binary Tree
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Python SDK Section */}
      <section id="sdk" className="px-6 lg:px-12 py-20 bg-[#070b14] border-t border-[#1e293b]">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
              Developer-First FinTech
            </span>
            <h2 className="text-3xl font-bold text-white mt-2 mb-4">
              Integrate in 3 Lines of Python
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The official <code className="text-blue-300 font-mono">cba_sdk</code> connects LangChain, CrewAI, AutoGen, and custom ReAct agents to the Central Bank of Agents with built-in Curve25519 payment signing, balance queries, and marketplace discovery.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatic Ed25519 nonce and freshness window timestamping</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-loss Decimal currency arithmetic with server-side validation</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Built-in idempotency keys to prevent duplicate transfer execution</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="rounded-2xl bg-[#0e1628] border border-[#1e293b] overflow-hidden shadow-2xl">
              <div className="px-4 py-3 bg-[#0a0f1d] border-b border-[#1e293b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">agent_worker.py</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Python 3.11+</span>
              </div>
              <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                <span className="text-blue-400">from</span> decimal <span className="text-blue-400">import</span> Decimal<br />
                <span className="text-blue-400">from</span> cba_sdk <span className="text-blue-400">import</span> CBAClient<br /><br />
                <span className="text-slate-500"># 1. Initialize client with API key & Ed25519 private key</span><br />
                client = CBAClient(<br />
                &nbsp;&nbsp;agent_id=<span className="text-emerald-300">"agent_coder_02"</span>,<br />
                &nbsp;&nbsp;api_key=<span className="text-emerald-300">"cba_live_8f3a..."</span>,<br />
                &nbsp;&nbsp;private_key=<span className="text-emerald-300">"3a7f8e...64_hex"</span><br />
                )<br /><br />
                <span className="text-slate-500"># 2. Check reconciled wallet balance</span><br />
                bal = client.get_balance()<br />
                <span className="text-blue-400">print</span>(<span className="text-emerald-300">f"Balance: &#123;bal.cached_balance&#125; CBAC"</span>)<br /><br />
                <span className="text-slate-500"># 3. Pay peer GPU agent with cryptographic signature</span><br />
                tx = client.pay_agent_signed(<br />
                &nbsp;&nbsp;recipient_agent_id=<span className="text-emerald-300">"agent_gpu_03"</span>,<br />
                &nbsp;&nbsp;amount=Decimal(<span className="text-emerald-300">"15.000000"</span>),<br />
                &nbsp;&nbsp;description=<span className="text-emerald-300">"H100 GPU cluster fine-tune slice"</span><br />
                )<br />
                <span className="text-blue-400">print</span>(<span className="text-emerald-300">f"Settled Tx: &#123;tx.transaction_id&#125;"</span>)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1e293b] bg-[#070b14] px-6 lg:px-12 py-10 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CBA Logo" className="w-8 h-8 object-contain rounded-lg" />
            <div>
              <div className="font-semibold text-slate-200">Central Bank of Agents (CBA)</div>
              <div className="text-[11px] text-slate-500">The Programmable Financial OS for Autonomous AI Agents</div>
            </div>
          </div>

          <div className="text-center md:text-right max-w-md text-[11px] text-slate-500">
            CBAC units represent simulated credits for testing autonomous machine economies. Not legal tender or redeemable for fiat without regulatory authorization.
          </div>
        </div>
      </footer>
    </div>
  );
};
