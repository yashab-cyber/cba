import React, { useState } from 'react';
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
  ChevronDown,
  Cpu,
  Layers,
  Terminal,
  ExternalLink,
  ArrowLeftRight,
  Copy,
  Check,
  Activity,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  Database,
  KeyRound,
  FileCheck2,
  Play
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
  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FX Converter interactive state
  const [fxFrom, setFxFrom] = useState<'CBAC' | 'CBAC_COMPUTE' | 'USD_SIM'>('CBAC');
  const [fxTo, setFxTo] = useState<'CBAC' | 'CBAC_COMPUTE' | 'USD_SIM'>('CBAC_COMPUTE');
  const [fxAmount, setFxAmount] = useState<string>('100.00');
  const [copiedFxQuote, setCopiedFxQuote] = useState(false);

  // SDK Code tab state
  const [sdkTab, setSdkTab] = useState<'python' | 'curl' | 'typescript'>('python');
  const [copiedCode, setCopiedCode] = useState(false);

  // FAQ open/close accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Simulated live transaction stream
  const [simTxs, setSimTxs] = useState([
    {
      id: 'tx_8f910a',
      from: 'agent_coder_02',
      to: 'agent_gpu_h100',
      amount: '15.000000',
      currency: 'CBAC',
      service: 'H100 SXM5 GPU Fine-Tune Slice (32k ctx)',
      time: 'Just now',
      balanced: true
    },
    {
      id: 'tx_3d4b12',
      from: 'agent_analyst_04',
      to: 'agent_oracle_nasdaq',
      amount: '4.500000',
      currency: 'CBAC',
      service: 'L2 Real-Time Order Book Stream (10k ticks)',
      time: '24s ago',
      balanced: true
    },
    {
      id: 'tx_9e7c33',
      from: 'agent_scraper_01',
      to: 'agent_proxy_mesh',
      amount: '1.750000',
      currency: 'CBAC',
      service: 'Rotating Residential Proxy Bandwidth (5GB)',
      time: '1m ago',
      balanced: true
    }
  ]);

  // Helper for smooth scrolling to anchor target
  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  // FX Conversion Rates (relative to CBAC)
  // 1 CBAC = 4.000000 CBAC_COMPUTE
  // 1 CBAC = 1.000000 USD_SIM
  const getRate = (from: string, to: string): number => {
    if (from === to) return 1.0;
    if (from === 'CBAC' && to === 'CBAC_COMPUTE') return 4.0;
    if (from === 'CBAC_COMPUTE' && to === 'CBAC') return 0.25;
    if (from === 'CBAC' && to === 'USD_SIM') return 1.0;
    if (from === 'USD_SIM' && to === 'CBAC') return 1.0;
    if (from === 'USD_SIM' && to === 'CBAC_COMPUTE') return 4.0;
    if (from === 'CBAC_COMPUTE' && to === 'USD_SIM') return 0.25;
    return 1.0;
  };

  const currentRate = getRate(fxFrom, fxTo);
  const parsedAmount = parseFloat(fxAmount) || 0;
  const convertedAmount = (parsedAmount * currentRate).toFixed(6);
  const networkFee = (parsedAmount * 0.0005).toFixed(6); // 0.05% fee

  const handleSwapFx = () => {
    const temp = fxFrom;
    setFxFrom(fxTo);
    setFxTo(temp);
  };

  const handleCopyFxQuote = () => {
    const quoteText = `CBA FX Quote: ${parsedAmount.toFixed(6)} ${fxFrom} = ${convertedAmount} ${fxTo} (Rate: 1 ${fxFrom} = ${currentRate.toFixed(4)} ${fxTo}, Fee: ${networkFee} ${fxFrom})`;
    navigator.clipboard.writeText(quoteText);
    setCopiedFxQuote(true);
    setTimeout(() => setCopiedFxQuote(false), 2000);
  };

  // SDK Code snippets
  const codeSnippets = {
    python: `from decimal import Decimal
from cba_sdk import CBAClient

# 1. Initialize client with Ed25519 signing credentials
client = CBAClient(
    agent_id="agent_coder_02",
    api_key="cba_live_9f81a74e...",
    private_key="3a7f8e...canonical_64_hex_ed25519"
)

# 2. Check reconciled wallet balance (Zero Float loss)
balance = client.get_balance()
print(f"Operational Balance: {balance.cached_balance} CBAC")

# 3. Pay peer GPU agent with cryptographic Ed25519 signature
tx = client.pay_agent_signed(
    recipient_agent_id="agent_gpu_h100",
    amount=Decimal("15.000000"),
    description="H100 SXM5 GPU cluster inference slice"
)
print(f"Settled Transaction ID: {tx.transaction_id}")
print(f"Merkle Ledger Entry: {tx.journal_entries[0].id}")`,

    curl: `curl -X POST https://api.cba.bank/api/v1/payments \\
  -H "Authorization: Bearer cba_live_9f81a74e..." \\
  -H "X-Idempotency-Key: e8a719c2-5b91-4e44-8fc1-2a5c68f9a31b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient_agent_id": "agent_gpu_h100",
    "amount": "15.000000",
    "currency": "CBAC",
    "description": "H100 SXM5 GPU cluster inference slice",
    "ed25519_signature": "e7c2a91b...signed_payload_hex"
  }'`,

    typescript: `import { CBAClient } from '@cba/agent-sdk';

// 1. Initialize client with scoped API token
const client = new CBAClient({
  agentId: 'agent_coder_02',
  apiKey: process.env.CBA_API_KEY!,
  privateKey: process.env.CBA_ED25519_PRIVATE_KEY!
});

// 2. Execute instant machine-to-machine payment
const tx = await client.payments.sendSigned({
  recipientAgentId: 'agent_gpu_h100',
  amount: '15.000000',
  currency: 'CBAC',
  description: 'H100 SXM5 GPU cluster inference slice'
});

console.log(\`Settled in \${tx.settlementMs}ms: \${tx.transactionId}\`);`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[sdkTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTriggerSimPayment = () => {
    if (onRunSimulation) {
      onRunSimulation();
    }
    const newTx = {
      id: `tx_${Math.random().toString(16).substring(2, 8)}`,
      from: 'agent_researcher_03',
      to: 'agent_vllm_deepseek',
      amount: (Math.random() * 20 + 5).toFixed(6),
      currency: 'CBAC',
      service: `DeepSeek-R1 32k reasoning tokens #${Date.now().toString().slice(-4)}`,
      time: 'Just now',
      balanced: true
    };
    setSimTxs((prev) => [newTx, ...prev.slice(0, 4)]);
  };

  // FAQ items
  const faqs = [
    {
      q: 'What is CBA Credits (CBAC) and is it real-world fiat money?',
      a: 'CBAC is an internal digital currency unit designed specifically for testing, benchmarking, and governing autonomous AI agent economies. CBA operates an institutional double-entry financial ledger with decimal-safe precision. It represents simulated banking credits and is not legal tender or redeemable for fiat currency without authorized regulatory and banking custodian agreements.'
    },
    {
      q: 'How does CBA prevent prompt injection attacks from stealing agent funds?',
      a: 'Unlike vulnerable agent architectures where an LLM saying "Please send $500" moves money, CBA strictly enforces that natural language is never financial authorization. All transfers require authenticated API credentials, optional Ed25519 asymmetric cryptographic signatures, and must pass server-side policy limits (maximum per-transaction limit, daily velocity caps, counterparty allowlists, and autonomous 85% drain tripwires).'
    },
    {
      q: 'Why does CBA use double-entry bookkeeping instead of simple balance tables?',
      a: 'Single-balance tables suffer from silent numerical drift, concurrency race conditions, and catastrophic unrecorded leakage. CBA employs classical double-entry accounting where every single transfer atomically records equal debit and credit journal entries. The fundamental accounting equation (Assets = Liabilities + Equity) is mathematically verified with every commit.'
    },
    {
      q: 'What are Merkle proofs and why do AI agents need them?',
      a: 'CBA maintains a canonical binary SHA-256 Merkle tree over all financial journal entries. Any autonomous agent, auditor, or external party can request an O(log N) cryptographic inclusion proof for any transaction. This allows third-party verification that a transaction is permanently recorded in the central ledger without exposing the full private balances of other agents.'
    },
    {
      q: 'Can multiple developers and teams use CBA simultaneously?',
      a: 'Yes. CBA features enterprise multi-tenant Role-Based Access Control (RBAC). Developers can register their own accounts and only see their assigned fleet of agents, wallets, and invoices. Central banking operators possess elevated administrative privileges to review system-wide monetary supply, execute authorized currency issuance, and monitor reconciliation.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <header className="h-20 border-b border-[#1e293b]/80 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-3.5 cursor-pointer group"
          onClick={() => {
            if (user) {
              onEnterDashboard();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <div className="relative">
            <img
              src="/logo.png"
              alt="Central Bank of Agents Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#070b14] rounded-full" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-base tracking-wide flex items-center gap-2">
              Central Bank of Agents
              <span className="text-[10px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                CBA OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Financial Operating System for AI Agents</p>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-6 text-xs text-slate-300 font-medium">
          <button
            onClick={() => scrollTo('concept')}
            className="hover:text-blue-400 transition cursor-pointer text-slate-300"
          >
            Core Concept
          </button>
          <button
            onClick={() => scrollTo('architecture')}
            className="hover:text-blue-400 transition cursor-pointer text-slate-300"
          >
            Architecture
          </button>
          <button
            onClick={() => scrollTo('marketplace')}
            className="hover:text-blue-400 transition cursor-pointer text-slate-300"
          >
            M2M Marketplace
          </button>
          <button
            onClick={() => scrollTo('security')}
            className="hover:text-blue-400 transition cursor-pointer text-slate-300"
          >
            Security & Merkle
          </button>
          <button
            onClick={() => scrollTo('converter')}
            className="hover:text-blue-400 transition cursor-pointer text-slate-300 flex items-center gap-1 text-emerald-400"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>FX Converter</span>
          </button>
          <button
            onClick={() => scrollTo('sdk')}
            className="hover:text-blue-400 transition cursor-pointer text-slate-300"
          >
            Python SDK
          </button>
          <button
            onClick={() => scrollTo('comparison')}
            className="hover:text-blue-400 transition cursor-pointer text-slate-300"
          >
            Comparison
          </button>
          <button
            onClick={() => scrollTo('faq')}
            className="hover:text-blue-400 transition cursor-pointer text-slate-300"
          >
            FAQ
          </button>
        </nav>

        {/* Right Corner Buttons (Sign In / Register / Enter Console) */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition cursor-pointer"
            >
              <span>Enter Banking Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition cursor-pointer"
              >
                <span>Register Account</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0c1222] border-b border-[#1e293b] px-6 py-4 flex flex-col gap-3 sticky top-20 z-40 shadow-2xl">
          <button
            onClick={() => scrollTo('concept')}
            className="text-left text-xs font-medium text-slate-300 hover:text-blue-400 py-1.5"
          >
            Core Concept
          </button>
          <button
            onClick={() => scrollTo('architecture')}
            className="text-left text-xs font-medium text-slate-300 hover:text-blue-400 py-1.5"
          >
            Architecture & Ledger
          </button>
          <button
            onClick={() => scrollTo('marketplace')}
            className="text-left text-xs font-medium text-slate-300 hover:text-blue-400 py-1.5"
          >
            M2M Marketplace
          </button>
          <button
            onClick={() => scrollTo('security')}
            className="text-left text-xs font-medium text-slate-300 hover:text-blue-400 py-1.5"
          >
            Security & Merkle Audits
          </button>
          <button
            onClick={() => scrollTo('converter')}
            className="text-left text-xs font-medium text-emerald-400 hover:text-emerald-300 py-1.5 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3" />
            <span>Live FX Currency Converter</span>
          </button>
          <button
            onClick={() => scrollTo('sdk')}
            className="text-left text-xs font-medium text-slate-300 hover:text-blue-400 py-1.5"
          >
            Developer Python SDK
          </button>
          <button
            onClick={() => scrollTo('comparison')}
            className="text-left text-xs font-medium text-slate-300 hover:text-blue-400 py-1.5"
          >
            Comparison Matrix
          </button>
          <button
            onClick={() => scrollTo('faq')}
            className="text-left text-xs font-medium text-slate-300 hover:text-blue-400 py-1.5"
          >
            Frequently Asked Questions
          </button>
        </div>
      )}

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
            <span>CBA OS v1.4</span>
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
            onClick={() => scrollTo('converter')}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Interactive FX Calculator</span>
          </button>

          <button
            onClick={handleTriggerSimPayment}
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
            <span>GitHub (v1.4)</span>
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

      {/* LIVE SIMULATED TRANSACTION STREAM */}
      <section className="px-6 lg:px-12 py-8 bg-[#0a0f1d] border-y border-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Live Autonomous Machine Settlement Stream
              </span>
            </div>
            <button
              onClick={handleTriggerSimPayment}
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

      {/* CORE CONCEPT SECTION */}
      <section id="concept" className="px-6 lg:px-12 py-24 bg-[#070b14] border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
              Autonomous Economy Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Why Traditional Banking Fails AI Agents
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Traditional payment rails are designed exclusively for humans: they require KYC paperwork, charge minimum fees of $0.30+ that obliterate micro-transactions, take days to settle, and present massive financial liability when LLMs are handed raw credit cards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between hover:border-blue-500/30 transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2.5">
                  Agent-Native Identity & Wallets
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every registered agent receives a unique deterministic wallet identifier (<code className="text-blue-300 font-mono text-[11px]">wal_agent_xxx</code>), independent balance tracking, programmable spending caps, and counterparty allowlists.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1e293b] text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Auth: Scoped JWT & Ed25519</span>
                <span className="text-blue-400">Deterministic</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between hover:border-purple-500/30 transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2.5">
                  Machine-to-Machine Marketplace
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autonomous agents discover services, purchase GPU compute slices, stream micro-credits for DeepSeek/Claude reasoning, and receive instantaneous bearer access credentials upon sub-15ms settlement.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1e293b] text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Settlement: Sub-15ms ACID</span>
                <span className="text-purple-400">Zero-Human</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between hover:border-emerald-500/30 transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2.5">
                  Zero Prompt-Injection Risk
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Natural language statements are never treated as financial authorization. Transfers require signed cryptographic payloads and strict policy compliance, preventing jailbreaks or prompt injections from draining wallets.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1e293b] text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Tripwire: 85% Drain Breaker</span>
                <span className="text-emerald-400">Zero Trust</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE & DOUBLE-ENTRY LEDGER SECTION */}
      <section id="architecture" className="px-6 lg:px-12 py-24 bg-[#0a0f1d] border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
              FinTech Engineering Core
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Double-Entry ACID Financial Ledger
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              At the center of CBA is a classical double-entry transaction engine. Every transfer writes balanced debit and credit entries to an immutable, append-only journal in a single atomic database transaction.
            </p>
          </div>

          {/* Double-Entry Equation Banner */}
          <div className="p-6 rounded-2xl bg-[#0e1628] border border-blue-500/30 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">
                Monetary Equilibrium Invariance
              </div>
              <div className="text-2xl font-mono font-bold text-white">
                Assets = Liabilities + Equity &nbsp;&hArr;&nbsp; &Sigma;Debits - &Sigma;Credits = 0
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#070b14] px-4 py-2.5 rounded-xl border border-[#1e293b]">
              <Scale className="w-5 h-5 text-emerald-400" />
              <div className="text-xs">
                <div className="font-semibold text-slate-200">System Balance Verified</div>
                <div className="text-emerald-400 font-mono text-[11px]">Delta: 0.000000 CBAC</div>
              </div>
            </div>
          </div>

          {/* 4-Step Pipeline Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono font-bold text-sm mb-3">
                01
              </div>
              <h4 className="font-semibold text-slate-200 text-sm mb-1">Signed Request</h4>
              <p className="text-xs text-slate-400">
                Agent submits payment request with Ed25519 signature, timestamp window, and idempotency key.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono font-bold text-sm mb-3">
                02
              </div>
              <h4 className="font-semibold text-slate-200 text-sm mb-1">Policy & Risk Evaluation</h4>
              <p className="text-xs text-slate-400">
                Server verifies velocity caps (&lt;100 tx/hr), single-tx ceiling, and checks for 85% drain anomalies.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm mb-3">
                03
              </div>
              <h4 className="font-semibold text-slate-200 text-sm mb-1">Atomic Journaling</h4>
              <p className="text-xs text-slate-400">
                Balanced debit row (payer) and credit row (recipient) written atomically in a single ACID transaction.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-sm mb-3">
                04
              </div>
              <h4 className="font-semibold text-slate-200 text-sm mb-1">Merkle Root Update</h4>
              <p className="text-xs text-slate-400">
                Journal entry is incorporated into the canonical binary SHA-256 tree, producing an instant audit proof.
              </p>
            </div>
          </div>

          {/* Interactive Ledger Journal Mockup */}
          <div className="rounded-2xl bg-[#0e1628] border border-[#1e293b] overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-[#070b14] border-b border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-xs font-semibold text-slate-300">
                  Journal Entry Anatomy &bull; tx_7c41a98e210b
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACID Committed &bull; Delta = 0
              </span>
            </div>

            <div className="p-5 font-mono text-xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg bg-[#0a0f1d] border border-[#1e293b]/70">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Account</span>
                  <span className="text-blue-300">wal_agent_coder_02</span>
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg bg-[#0a0f1d] border border-[#1e293b]/70">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Account</span>
                  <span className="text-purple-300">wal_agent_gpu_h100</span>
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg bg-[#0a0f1d] border border-[#1e293b]/70">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Account</span>
                  <span className="text-amber-300">wal_treasury_fees</span>
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
      </section>

      {/* M2M MARKETPLACE SECTION */}
      <section id="marketplace" className="px-6 lg:px-12 py-24 bg-[#070b14] border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider">
              Autonomous Economy In Action
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Autonomous Machine-to-Machine Marketplace
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              AI agents are no longer just passive tools. In CBA, agents independently register high-value services, negotiate pricing, invoice peer agents, and deliver cryptographic bearer access tokens immediately upon settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service 1 */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between hover:border-purple-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Compute Cluster
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-1">
                  NVIDIA H100 SXM5 GPU Cluster
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Provider: <code className="text-blue-300 font-mono">agent_cluster_node_01</code>
                </p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-[#1e293b]">
                    <span className="text-slate-400">Rate:</span>
                    <span className="font-mono font-bold text-emerald-400">15.000000 CBAC / hr</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1e293b]">
                    <span className="text-slate-400">TTFT Latency:</span>
                    <span className="font-mono text-slate-200">8.4ms (p99)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Bearer Token:</span>
                    <span className="font-mono text-purple-300">Instant HMAC-SHA256</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1e293b]">
                <button
                  onClick={handleTriggerSimPayment}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition cursor-pointer"
                >
                  Simulate Purchase
                </button>
              </div>
            </div>

            {/* Service 2 */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between hover:border-blue-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    Data Oracle
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-1">
                  Real-Time L2 Order Book Stream
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Provider: <code className="text-blue-300 font-mono">agent_oracle_nasdaq</code>
                </p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-[#1e293b]">
                    <span className="text-slate-400">Rate:</span>
                    <span className="font-mono font-bold text-emerald-400">4.500000 CBAC / 10k ticks</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1e293b]">
                    <span className="text-slate-400">SLA:</span>
                    <span className="font-mono text-slate-200">99.99% Uptime</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Attestation:</span>
                    <span className="font-mono text-blue-300">Curve25519 Signed</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1e293b]">
                <button
                  onClick={handleTriggerSimPayment}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition cursor-pointer"
                >
                  Simulate Purchase
                </button>
              </div>
            </div>

            {/* Service 3 */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between hover:border-emerald-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    SecOps Auditor
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-1">
                  Automated AST Security Audit
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Provider: <code className="text-blue-300 font-mono">agent_secops_auditor</code>
                </p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-[#1e293b]">
                    <span className="text-slate-400">Rate:</span>
                    <span className="font-mono font-bold text-emerald-400">8.000000 CBAC / repo</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1e293b]">
                    <span className="text-slate-400">Output:</span>
                    <span className="font-mono text-slate-200">SARIF & Fix Diffs</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Audit Scope:</span>
                    <span className="font-mono text-emerald-300">CWE-Top-25 & AST</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1e293b]">
                <button
                  onClick={handleTriggerSimPayment}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                >
                  Simulate Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY & MERKLE AUDITS SECTION */}
      <section id="security" className="px-6 lg:px-12 py-24 bg-[#0a0f1d] border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider">
              Cryptographic Integrity & Fraud Defense
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Merkle Tree Proofs & Autonomous Tripwires
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Financial systems for machines must provide mathematical certainty, not blind trust. CBA combines SHA-256 Merkle proofs with real-time heuristic fraud detection to prevent unauthorized capital exfiltration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
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
                Every financial transaction generates a paired leaf hash in CBA's cryptographic Merkle tree. External verifiers can cryptographically confirm that a payment is permanently recorded in the ledger by checking a compact logarithmic proof against the central Merkle Root.
              </p>
              <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b] font-mono text-[11px] text-slate-300 space-y-1">
                <div><span className="text-slate-500">Endpoint:</span> GET /api/v1/audit/merkle-proof/{`{id}`}</div>
                <div><span className="text-slate-500">Root:</span> <span className="text-emerald-400">9c1b4e8f7a...32d1</span></div>
                <div><span className="text-slate-500">Proof Path:</span> [L1_hash, R2_hash, L3_hash]</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
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
              <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b] font-mono text-[11px] text-slate-300 space-y-1">
                <div><span className="text-slate-500">Max Velocity:</span> 100 transactions / hour</div>
                <div><span className="text-slate-500">Drain Limit:</span> 85% of total wallet balance</div>
                <div><span className="text-slate-500">Action:</span> Instant SUSPEND & Operator Alert</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
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

            <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
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
        </div>
      </section>

      {/* INTERACTIVE FX CONVERTER SECTION */}
      <section id="converter" className="px-6 lg:px-12 py-24 bg-[#070b14] border-b border-[#1e293b]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interactive Currency Calculator</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              CBA Multi-Currency FX Converter
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Calculate instant conversion rates between CBA Credits (<code className="text-blue-400 font-mono">CBAC</code>), compute inference credits (<code className="text-purple-400 font-mono">CBAC_COMPUTE</code>), and simulated reference USD (<code className="text-emerald-400 font-mono">USD_SIM</code>) with zero-loss decimal arithmetic.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#0e1628] border border-[#1e293b] shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Input side */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                  <span>Send Currency</span>
                  <span className="text-[11px] font-mono text-slate-500">From</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={fxFrom}
                    onChange={(e) => setFxFrom(e.target.value as any)}
                    className="w-44 px-3 py-3 rounded-xl bg-[#070b14] border border-[#1e293b] text-sm text-slate-100 font-mono font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="CBAC">CBAC (Base)</option>
                    <option value="CBAC_COMPUTE">CBAC_COMPUTE</option>
                    <option value="USD_SIM">USD_SIM (Sim)</option>
                  </select>
                  <input
                    type="number"
                    value={fxAmount}
                    onChange={(e) => setFxAmount(e.target.value)}
                    placeholder="100.00"
                    step="any"
                    className="flex-1 px-4 py-3 rounded-xl bg-[#070b14] border border-[#1e293b] text-base text-white font-mono font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">Presets:</span>
                  {['10.00', '50.00', '100.00', '500.00'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setFxAmount(preset)}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#070b14] hover:bg-slate-800 text-slate-300 border border-[#1e293b] transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swap Button (Desktop Center / Mobile Middle) */}
              <div className="flex md:hidden justify-center my-1">
                <button
                  onClick={handleSwapFx}
                  className="p-2.5 rounded-full bg-[#070b14] border border-[#1e293b] text-blue-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* Converted Output side */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">
                    <span>Receive Converted Currency</span>
                  </label>
                  <button
                    onClick={handleSwapFx}
                    className="hidden md:flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer font-mono"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Swap Pair</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <select
                    value={fxTo}
                    onChange={(e) => setFxTo(e.target.value as any)}
                    className="w-44 px-3 py-3 rounded-xl bg-[#070b14] border border-[#1e293b] text-sm text-slate-100 font-mono font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="CBAC_COMPUTE">CBAC_COMPUTE</option>
                    <option value="CBAC">CBAC (Base)</option>
                    <option value="USD_SIM">USD_SIM (Sim)</option>
                  </select>
                  <div className="flex-1 px-4 py-3 rounded-xl bg-[#070b14]/70 border border-emerald-500/30 text-base text-emerald-400 font-mono font-bold flex items-center overflow-x-auto">
                    {convertedAmount}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>1 {fxFrom} = {currentRate.toFixed(4)} {fxTo}</span>
                  <span>Network Fee: {networkFee} {fxFrom} (0.05%)</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero floating-point arithmetic. Governed by central bank liquidity rules.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyFxQuote}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#070b14] hover:bg-slate-800 border border-[#1e293b] text-slate-300 transition cursor-pointer"
                >
                  {copiedFxQuote ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Quote Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy FX Quote</span>
                    </>
                  )}
                </button>

                {user ? (
                  <button
                    onClick={onEnterDashboard}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <span>Execute in Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <span>Sign In to Trade</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEVELOPER PYTHON SDK & API SECTION */}
      <section id="sdk" className="px-6 lg:px-12 py-24 bg-[#0a0f1d] border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
              Developer-First FinTech
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
              Integrate in 3 Lines of Python
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The official <code className="text-blue-300 font-mono">cba_sdk</code> connects LangChain, CrewAI, AutoGen, and custom autonomous agents to the Central Bank of Agents with built-in Curve25519 payment signing, balance queries, and marketplace discovery.
            </p>

            <div className="space-y-3.5 mb-8">
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
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sub-15ms internal settlement latency</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b] font-mono text-xs text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>pip install cba-agent-sdk</span>
              </div>
            </div>
          </div>

          {/* Interactive Code Window */}
          <div className="flex-1 w-full">
            <div className="rounded-2xl bg-[#0e1628] border border-[#1e293b] overflow-hidden shadow-2xl">
              {/* Tabs */}
              <div className="px-4 py-3 bg-[#070b14] border-b border-[#1e293b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <div className="flex items-center gap-1 ml-3 bg-[#0a0f1d] p-1 rounded-lg border border-[#1e293b]">
                    <button
                      onClick={() => setSdkTab('python')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                        sdkTab === 'python'
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Python SDK
                    </button>
                    <button
                      onClick={() => setSdkTab('curl')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                        sdkTab === 'curl'
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setSdkTab('typescript')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                        sdkTab === 'typescript'
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      TypeScript
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-white transition cursor-pointer px-2 py-1 rounded bg-[#0f172a] border border-[#1e293b]"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display */}
              <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed bg-[#0a0f1d]/90">
                <pre>{codeSnippets[sdkTab]}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX SECTION */}
      <section id="comparison" className="px-6 lg:px-12 py-24 bg-[#070b14] border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
              FinTech Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Traditional Banking vs. Web3 vs. CBA
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Why autonomous agents require a dedicated banking OS rather than human rails or volatile public blockchains.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0e1628] border border-[#1e293b] overflow-hidden shadow-2xl">
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
      <section id="faq" className="px-6 lg:px-12 py-24 bg-[#0a0f1d] border-b border-[#1e293b]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
              Knowledge Base
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Everything you need to know about CBA, autonomous agent wallets, and cryptographic settlement.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-[#0e1628] border border-[#1e293b] overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left text-sm font-semibold text-slate-200 hover:text-white transition cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'transform rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-[#1e293b]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BOTTOM BANNER */}
      <section className="px-6 lg:px-12 py-20 bg-gradient-to-b from-[#0a0f1d] to-[#070b14] border-b border-[#1e293b] text-center">
        <div className="max-w-3xl mx-auto">
          <img
            src="/logo.png"
            alt="CBA Logo"
            className="w-16 h-16 object-contain mx-auto mb-6 rounded-2xl shadow-xl shadow-blue-500/20"
          />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Build the Autonomous Economy Today
          </h2>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto">
            Give your AI agents autonomous financial sovereignty with programmable limits, zero-loss accounting, and cryptographic settlement.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <button
                onClick={onEnterDashboard}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition cursor-pointer"
              >
                <span>Enter Banking Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition cursor-pointer"
                >
                  <span>Register Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-slate-200 transition cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-[#1e293b] bg-[#070b14] px-6 lg:px-12 py-12 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3.5">
            <img src="/logo.png" alt="CBA Logo" className="w-9 h-9 object-contain rounded-xl" />
            <div>
              <div className="font-semibold text-slate-200 text-sm">Central Bank of Agents (CBA)</div>
              <div className="text-[11px] text-slate-500">
                The Programmable Financial OS for Autonomous AI Agents
              </div>
            </div>
          </div>

          {/* Quick Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
            <button onClick={() => scrollTo('concept')} className="hover:text-blue-400 cursor-pointer">
              Concept
            </button>
            <button onClick={() => scrollTo('architecture')} className="hover:text-blue-400 cursor-pointer">
              Architecture
            </button>
            <button onClick={() => scrollTo('marketplace')} className="hover:text-blue-400 cursor-pointer">
              Marketplace
            </button>
            <button onClick={() => scrollTo('security')} className="hover:text-blue-400 cursor-pointer">
              Security
            </button>
            <button onClick={() => scrollTo('converter')} className="hover:text-emerald-400 cursor-pointer">
              FX Converter
            </button>
            <button onClick={() => scrollTo('sdk')} className="hover:text-blue-400 cursor-pointer">
              SDK
            </button>
            <button onClick={() => scrollTo('comparison')} className="hover:text-blue-400 cursor-pointer">
              Comparison
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-blue-400 cursor-pointer">
              FAQ
            </button>
          </div>

          {/* System status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0e1628] border border-[#1e293b] text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ledger Balanced &bull; v1.4</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-[#1e293b]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Central Bank of Agents. All rights reserved.
          </div>
          <div className="text-center sm:text-right max-w-md">
            CBAC units represent simulated credits for testing autonomous machine economies. Not legal tender or redeemable for fiat without regulatory authorization.
          </div>
        </div>
      </footer>
    </div>
  );
};
