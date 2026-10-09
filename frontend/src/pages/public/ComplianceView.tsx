import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Lock,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Scale
} from 'lucide-react';

interface ComplianceViewProps {
  onNavigate: (page: string) => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({ onNavigate }) => {
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
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Institutional Standards</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Security, Cryptographic & Regulatory Compliance
        </h1>
        <p className="text-sm text-slate-400">
          Cryptographic Standards, Audit Invariance, and Sandbox Governance &bull; CBA OS v1.5
        </p>
      </div>

      {/* Compliance Modules */}
      <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
        {/* Module 1 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">1.0</span>
            <span>Cryptographic Standards Specification</span>
          </h2>
          <p className="mb-4 text-slate-400">
            CBA integrates industry-standard cryptographic primitives designed for zero trust and high-throughput machine transactions:
          </p>
          <div className="space-y-3 font-mono text-[11px]">
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block">RFC 8032 &bull; Edwards-curve Digital Signatures (Ed25519)</strong>
                <span className="text-slate-400">Used for asymmetric agent payment signing, replay resistance, and non-repudiation.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block">FIPS 180-4 &bull; SHA-256 Canonical Binary Merkle Tree</strong>
                <span className="text-slate-400">Provides O(log N) inclusion proofs for verifying ledger records against the central Merkle root.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block">RFC 7519 &bull; Scoped JSON Web Tokens (JWT)</strong>
                <span className="text-slate-400">Time-limited bearer authentication with fine-grained capability scopes (wallets:read, payments:create).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">2.0</span>
            <span>Immutable Audit Trails & Double-Entry Integrity</span>
          </h2>
          <p className="mb-2">
            Every transfer executed across CBA creates an indelible financial footprint:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Zero destructive operations: Historical records cannot be modified or deleted.</li>
            <li>Paired debit and credit balancing guaranteed at the database engine level.</li>
            <li>Idempotency keys prevent double execution across retried HTTP requests.</li>
            <li>Full audit event logging on user logins, key rotations, and policy changes.</li>
          </ul>
        </div>

        {/* Module 3 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">3.0</span>
            <span>Simulated Economy vs. Regulated Money Services</span>
          </h2>
          <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e293b] text-slate-300 mb-3">
            <div className="font-semibold text-white mb-1">Clear Legal Distinction:</div>
            CBA currently operates as a financial operating system sandbox for autonomous AI agent research, benchmarking, and machine-to-machine micro-transactions.
          </div>
          <p className="text-slate-400">
            CBA explicitly distinguishes between simulated credits (<code className="text-blue-300 font-mono">CBAC</code>), tokenized bearer credentials, and regulated fiat money services. Before any integration with real-world fiat or regulated banking rails, CBA will require formal banking-as-a-service (BaaS) custodian partnerships and applicable licenses (e.g. Money Services Business / FinCEN / MiCA where required).
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Return to Overview</h4>
          <p className="text-xs text-slate-400">Explore CBA's live console, interactive converters, or register an agent fleet.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
          >
            <span>Back to Home</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
