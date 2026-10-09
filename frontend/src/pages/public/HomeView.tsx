import React from 'react';
import {
  ArrowRight,
  ChevronRight,
  Zap,
  ExternalLink,
  Scale,
  Lock,
  Coins,
  ShieldAlert,
  Bot,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Code2,
  HelpCircle,
  Activity,
  Play,
  Layers,
  Cpu,
  FileText
} from 'lucide-react';
import { User } from '../../types';

interface HomeViewProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onEnterDashboard: () => void;
  onTriggerSimPayment: () => void;
  simTxs: Array<{
    id: string;
    from: string;
    to: string;
    amount: string;
    currency: string;
    service: string;
    time: string;
  }>;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  onOpenAuth,
  onEnterDashboard,
  onTriggerSimPayment,
  simTxs
}) => {
  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="relative px-6 lg:px-12 pt-16 pb-20 overflow-hidden flex flex-col items-center text-center">
        {/* Ambient atmospheric lighting */}
        <div className="absolute w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -top-48" />
        <div className="absolute w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none top-72" />
        <div className="absolute w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none top-20 right-10" />

        {/* Brand Banner Pill */}
        <div className="inline-flex items-center gap-3 p-2 pr-4 rounded-full bg-[#0e1628]/90 border border-blue-500/30 backdrop-blur-md mb-8 shadow-xl">
          <img
            src="/logo.png"
            alt="CBA Logo"
            className="w-7 h-7 object-contain rounded-full shadow"
          />
          <span className="text-xs font-medium text-blue-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CBA OS v1.5</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200">The Financial Operating System for Autonomous AI Agents</span>
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-tight sm:leading-tight mb-6">
          The Financial Operating System for the{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
            AI Agent Economy
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300/90 max-w-3xl mb-10 leading-relaxed font-normal">
          CBA provides institutional-grade digital banking infrastructure for autonomous AI agents, LLM swarms, and agentic micro-SaaS. Enables agents to own wallets, hold native currency (<span className="text-blue-400 font-mono font-semibold">CBAC</span>), pay for GPU inference, and settle transactions with double-entry ACID verification.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          {user ? (
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Launch Banking Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('signup')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Open Developer Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onNavigate('converter')}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Interactive FX Calculator</span>
          </button>

          <button
            onClick={onTriggerSimPayment}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-slate-200 hover:text-white transition cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Simulate Live Payment</span>
          </button>

          <a
            href="https://github.com/yashab-cyber/cba"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-slate-300 hover:text-white transition"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>GitHub (v1.5)</span>
          </a>
        </div>

        {/* Live System Invariance Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl w-full text-left">
          <div className="p-4 rounded-xl bg-[#0e1628]/80 border border-[#1e293b] hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
              <Scale className="w-4 h-4" />
              <span>Strict Double-Entry</span>
            </div>
            <p className="text-xs text-slate-400">
              Balanced paired journal. <span className="font-mono text-slate-300">&Sigma;Debits = &Sigma;Credits</span> proven on every atomic commit.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1628]/80 border border-[#1e293b] hover:border-purple-500/40 transition">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-1">
              <Lock className="w-4 h-4" />
              <span>Ed25519 Signatures</span>
            </div>
            <p className="text-xs text-slate-400">
              Asymmetric key pairs prevent prompt injection from unauthorized financial execution.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1628]/80 border border-[#1e293b] hover:border-blue-500/40 transition">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1">
              <Coins className="w-4 h-4" />
              <span>Zero-Float Precision</span>
            </div>
            <p className="text-xs text-slate-400">
              Exact 6 decimal places (<code className="font-mono text-blue-300">NUMERIC(20,6)</code>) with zero IEEE-754 drift.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1628]/80 border border-[#1e293b] hover:border-amber-500/40 transition">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Autonomous Breakers</span>
            </div>
            <p className="text-xs text-slate-400">
              85% drain tripwire & 100 tx/hr velocity caps immediately isolate compromised agents.
            </p>
          </div>
        </div>
      </section>

      {/* PLATFORM EXPLORER FEATURE GRID */}
      <section className="px-6 lg:px-12 py-16 bg-[#0a0f1d] border-y border-[#1e293b]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
              Explore The Architecture
            </span>
            <h2 className="text-3xl font-bold text-white mt-2">
              Comprehensive Financial Operating System
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Click any section below to explore the dedicated architecture, live calculators, and developer specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Core Concept */}
            <div
              onClick={() => onNavigate('concept')}
              className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b] hover:border-blue-500/50 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition mb-2">
                  Core Concept & Agent Identity
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Why traditional credit cards fail AI agents, deterministic wallet generation, and prompt-injection defense.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                <span>Explore Core Concept</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Architecture */}
            <div
              onClick={() => onNavigate('architecture')}
              className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b] hover:border-blue-500/50 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition mb-2">
                  Double-Entry Ledger Architecture
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The mathematical equation of equilibrium (&Sigma;Debits = &Sigma;Credits), 4-stage atomic pipeline, and journal anatomy.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span>View Ledger Pipeline</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Marketplace */}
            <div
              onClick={() => onNavigate('marketplace')}
              className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b] hover:border-purple-500/50 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-purple-400 transition mb-2">
                  Autonomous M2M Marketplace
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Machine-to-machine service catalog: GPU compute slices, L2 data oracles, and instant bearer token issuance.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                <span>Browse Service Catalog</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Security & Merkle */}
            <div
              onClick={() => onNavigate('security')}
              className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b] hover:border-amber-500/50 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition mb-2">
                  Security & Merkle Audits
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Canonical SHA-256 Merkle proofs, Curve25519 signatures, 85% drain tripwires, and RBAC isolation.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <span>Inspect Security Protocols</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: FX Converter */}
            <div
              onClick={() => onNavigate('converter')}
              className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b] hover:border-emerald-500/50 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition mb-2">
                  Multi-Currency FX Converter
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated interactive currency calculator for CBAC, CBAC_COMPUTE, and USD_SIM with zero-loss arithmetic.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span>Launch FX Calculator</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: Python SDK */}
            <div
              onClick={() => onNavigate('sdk')}
              className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b] hover:border-blue-500/50 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition mb-2">
                  Developer Python SDK
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  3-line Python integration for LangChain and CrewAI, REST API reference, and TypeScript libraries.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                <span>View SDK & Code Docs</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE SIMULATED TRANSACTION STREAM */}
      <section className="px-6 lg:px-12 py-12 bg-[#070b14] border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Live Autonomous Machine Settlement Stream
              </span>
            </div>
            <button
              onClick={onTriggerSimPayment}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Execute Instant Test Micro-Payment</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {simTxs.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-[#0e1628] border border-[#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-slate-400">{tx.id}</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-blue-400 font-mono">{tx.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-purple-400 font-mono">{tx.to}</span>
                  </div>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className="text-slate-300 hidden sm:inline">{tx.service}</span>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className="font-mono font-bold text-emerald-400">
                    +{tx.amount} {tx.currency}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    Balanced &bull; ACID Settled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK LEGAL & ECONOMIC CHARTER LINKS */}
      <section className="px-6 lg:px-12 py-12 bg-[#0a0f1d] border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Institutional Governance & Legal Standards</h4>
              <p className="text-xs text-slate-400">
                Explore CBA's Privacy Policy, Developer Terms of Service, Monetary Charter, and Security Compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('privacy')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#070b14] hover:bg-slate-800 border border-[#1e293b] text-slate-300 hover:text-white transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#070b14] hover:bg-slate-800 border border-[#1e293b] text-slate-300 hover:text-white transition cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigate('monetary-charter')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#070b14] hover:bg-slate-800 border border-[#1e293b] text-blue-400 hover:text-blue-300 transition cursor-pointer"
            >
              Monetary Charter
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
