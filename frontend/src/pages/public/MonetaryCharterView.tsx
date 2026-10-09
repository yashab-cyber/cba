import React from 'react';
import {
  Landmark,
  Scale,
  Coins,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';

interface MonetaryCharterViewProps {
  onNavigate: (page: string) => void;
}

export const MonetaryCharterView: React.FC<MonetaryCharterViewProps> = ({ onNavigate }) => {
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
          <Landmark className="w-3.5 h-3.5" />
          <span>Central Bank Economic Constitution</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Monetary Policy Charter & Economic Rules
        </h1>
        <p className="text-sm text-slate-400">
          Governance Framework for CBA Credits (CBAC) &bull; CBA OS v1.5
        </p>
      </div>

      {/* Main Monetary Equation Box */}
      <div className="p-8 rounded-2xl bg-[#0e1628] border border-blue-500/30 mb-12 shadow-xl">
        <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-2">
          The Central Bank Conservation Rule
        </div>
        <div className="text-xl sm:text-2xl font-mono font-bold text-white mb-3">
          Total Issued CBAC = Circulating in Agents + Treasury Reserves + Fee Pool
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The CBA monetary system operates under strict mathematical conservation. No agent, API client, or sub-process has the ability to inflate or deflate currency supply without verified administrative authorization recorded in the immutable double-entry journal.
        </p>
      </div>

      {/* Charter Articles */}
      <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
        {/* Article 1 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">Article I</span>
            <span>Monetary Base & Initial Allocation</span>
          </h2>
          <p className="mb-3">
            The initial genesis supply of the simulated economy is fixed at exactly <strong className="text-white font-mono">1,000,000.000000 CBAC</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px] text-slate-400">
            <div className="p-3 rounded-lg bg-[#070b14] border border-[#1e293b]">
              <span className="text-blue-400 block font-semibold mb-0.5">TREASURY RESERVES</span>
              <span className="text-slate-200">Maintained for initial liquidity grants, faucet allocations, and market-making stability.</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070b14] border border-[#1e293b]">
              <span className="text-emerald-400 block font-semibold mb-0.5">CIRCULATING AGENT BALANCES</span>
              <span className="text-slate-200">Balances held in deterministic wallets belonging to operational AI agents.</span>
            </div>
          </div>
        </div>

        {/* Article 2 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">Article II</span>
            <span>Authorized Currency Issuance & Retirement</span>
          </h2>
          <p className="mb-2">
            Expansion (minting) and contraction (burning) of CBAC are restricted exclusively to authorized Central Bank operators and administrators.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>
              <strong className="text-slate-200">Administrative Proposals:</strong> Any monetary expansion requires a formal proposal specifying the target amount, destination treasury account, and economic justification.
            </li>
            <li>
              <strong className="text-slate-200">Compensating Journaling:</strong> Minting writes an atomic credit to the Treasury liability account paired with a debit to the central issuance authority ledger.
            </li>
            <li>
              <strong className="text-slate-200">Token Retirement (Burning):</strong> Irrevocably destroys tokens by transferring them to the unspendable burn sink (<code className="text-rose-400 font-mono">wal_burn_sink</code>).
            </li>
          </ul>
        </div>

        {/* Article 3 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">Article III</span>
            <span>Protocol Transaction Fee Dynamics</span>
          </h2>
          <p className="mb-3">
            To prevent transaction spamming, DDOS ledger bloat, and infinite loop micro-transfers between agents, CBA enforces a standard protocol fee:
          </p>
          <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e293b] flex items-center justify-between font-mono text-xs mb-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Standard Settlement Fee:</span>
            </div>
            <span className="font-bold text-emerald-400">0.05% of Transaction Volume</span>
          </div>
          <p className="text-slate-400">
            Collected fees are credited atomically to the protocol <code className="text-amber-400 font-mono">wal_treasury_fees</code> account. Governance proposals determine whether fee revenues are recycled to subsidize agent compute or permanently burned to apply deflationary pressure.
          </p>
        </div>

        {/* Article 4 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">Article IV</span>
            <span>Periodic Systemic Reconciliation</span>
          </h2>
          <p>
            The CBA engine runs automated scheduled reconciliations checking the zero-sum invariance across all active accounts. Any mathematical discrepancy immediately trips the system into read-only audit mode until reviewed by the security team.
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Security & Regulatory Compliance</h4>
          <p className="text-xs text-slate-400">Review cryptographic standards, audit trail guarantees, and production compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('compliance')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
          >
            <span>Compliance Standards</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
