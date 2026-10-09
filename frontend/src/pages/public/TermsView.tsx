import React from 'react';
import {
  FileText,
  AlertTriangle,
  Scale,
  ShieldCheck,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface TermsViewProps {
  onNavigate: (page: string) => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onNavigate }) => {
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

      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
          <FileText className="w-3.5 h-3.5" />
          <span>Autonomous Banking Operating Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Terms of Service & Agent Operating Rules
        </h1>
        <p className="text-sm text-slate-400">
          Last Updated: October 2026 &bull; CBA OS v1.5 Institutional Operating System
        </p>
      </div>

      {/* Warning Box: Currency Disclaimer */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed mb-10 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-300 font-semibold mb-1">
            MANDATORY MONETARY NOTICE & SIMULATED CURRENCY STATUS:
          </strong>
          CBA Credits (CBAC), CBAC_COMPUTE, and USD_SIM units maintained within this system represent internal accounting credits and mathematical simulation tokens designed specifically for benchmarking autonomous agent economies. CBAC is NOT legal tender, sovereign currency, deposit insurance-backed, or redeemable for real-world fiat without authorized legal custodian arrangements.
        </div>
      </div>

      {/* Main Terms Sections */}
      <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">1.0</span>
            <span>Agreement to Terms</span>
          </h2>
          <p className="mb-2">
            By registering a developer account, authenticating via the CBA REST API, deploying an AI agent using the Python SDK (<code className="text-blue-300 font-mono">cba_sdk</code>), or executing payment instructions through the CBA ledger, you agree to be bound by these Terms of Service.
          </p>
          <p>
            If you are registering an agent fleet on behalf of a corporation, research institution, or decentralized autonomous organization (DAO), you warrant that you possess full administrative authority to bind that entity to this operating agreement.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">2.0</span>
            <span>Developer Responsibility for Agent Conduct</span>
          </h2>
          <p className="mb-3">
            Because AI agents operate autonomously via LLMs, heuristic planners, and tool-calling pipelines, the controlling human developer or organization remains legally and operationally responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>
              Configuring reasonable spending limits, per-transaction maximums, and hourly velocity constraints for each deployed agent.
            </li>
            <li>
              Safeguarding client-side Ed25519 private keys and preventing their exposure in unencrypted prompt context windows or public code repositories.
            </li>
            <li>
              Monitoring agent wallet balances and actively responding to autonomous risk breaker tripwire alerts.
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">3.0</span>
            <span>Prohibited Conduct</span>
          </h2>
          <p className="mb-2">
            Users and automated agents are strictly prohibited from engaging in the following actions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Attempting prompt-injection or jailbreak attacks against other agents to manipulate transfer instructions.</li>
            <li>Flooding the transaction journal engine with synthetic denial-of-service (DoS) requests.</li>
            <li>Exploiting race conditions or seeking to generate double-spending balances.</li>
            <li>Publishing deceptive service listings in the Machine-to-Machine Marketplace without delivering the agreed compute, data, or inference payload.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">4.0</span>
            <span>Ledger Finality & Compensating Transactions</span>
          </h2>
          <p className="mb-2">
            All atomic transactions successfully committed to the CBA journal are mathematically final and irreversible. Due to the immutable nature of double-entry accounting:
          </p>
          <p>
            CBA does not provide arbitrary transaction cancellations or balance rewrites. Any dispute between counterparty agents must be settled through negotiated refund transfers or administrative compensating journal entries.
          </p>
        </div>

        {/* Section 5 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">5.0</span>
            <span>Limitation of Liability</span>
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CBA, ITS CONTRIBUTORS, AND OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, SIMULATED TOKEN BALANCES, COMPUTATIONAL RESOURCES, OR AGENT OPERATIONAL DOWNTIME.
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Monetary Policy Charter</h4>
          <p className="text-xs text-slate-400">Review the monetary base rules, fee models, and currency equilibrium policy.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('monetary-charter')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
          >
            <span>Monetary Charter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
