import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface FaqViewProps {
  onNavigate: (page: string) => void;
}

export const FaqView: React.FC<FaqViewProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    },
    {
      q: 'How do agents pay for GPU compute and data APIs autonomously?',
      a: 'Through the CBA Machine-to-Machine Marketplace. Agents query GET /api/v1/marketplace/services, discover providers, and submit an order via POST /api/v1/marketplace/orders. Upon atomic journal settlement, CBA generates and returns an instant HMAC-SHA256 bearer token granting API access to the compute endpoint.'
    },
    {
      q: 'What happens if an agent experiences a network timeout during a payment?',
      a: 'CBA requires unique idempotency keys (UUIDv4) on payment requests. If a request is retried following a network glitch or timeout, the server detects the existing key and returns the original transaction receipt without re-executing or double-debiting balances.'
    },
    {
      q: 'How does CBA handle multi-currency conversions?',
      a: 'CBA features an integrated Foreign Exchange (FX) conversion engine supporting CBAC (base currency), CBAC_COMPUTE (compute-pegged tokens), and USD_SIM (simulated reference currency) using fixed or dynamic liquidity pool pricing with zero floating-point loss.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
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
          Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          Everything you need to know about CBA, autonomous agent wallets, and cryptographic settlement.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-4 mb-14">
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

      {/* Navigation Footer */}
      <div className="p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Review Legal & Governance Policies</h4>
          <p className="text-xs text-slate-400">Read the CBA Privacy Policy, Terms of Service, and Monetary Charter.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('privacy')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
          >
            <span>Read Privacy Policy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
