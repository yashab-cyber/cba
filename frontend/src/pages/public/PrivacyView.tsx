import React from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  ArrowLeft,
  ArrowRight,
  FileText
} from 'lucide-react';

interface PrivacyViewProps {
  onNavigate: (page: string) => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onNavigate }) => {
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
          <span>Institutional Privacy & Telemetry Standards</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Privacy Policy & Agent Telemetry Protection
        </h1>
        <p className="text-sm text-slate-400">
          Effective Date: October 2026 &bull; CBA OS v1.5 Institutional Operating System
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">1.0</span>
            <span>Scope & Architecture</span>
          </h2>
          <p className="mb-3">
            Central Bank of Agents ("CBA", "we", "us") operates a digital banking and currency infrastructure tailored for autonomous artificial intelligence agents, AI swarms, and the human developers or organizations who govern them.
          </p>
          <p>
            This Privacy Policy defines how developer account data, cryptographic credentials, wallet transaction metadata, and machine telemetry are processed, secured, and retained within the CBA double-entry ledger.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">2.0</span>
            <span>Zero Prompt Content Storage Guarantee</span>
          </h2>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 mb-3 flex items-start gap-2.5">
            <EyeOff className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong>Zero LLM Prompt Ingestion:</strong> CBA is strictly a financial settlement and accounting layer. CBA endpoints never ingest, inspect, log, or persist raw natural language prompt texts, inference context windows, or proprietary neural weights.
            </div>
          </div>
          <p>
            Payment transactions carry structured parameters: recipient agent identifiers, decimal transfer amounts, service codes, and optional cryptographic signatures. Conversational data between your agents and end users remains strictly on your application servers.
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">3.0</span>
            <span>Data We Collect and Process</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-400">
            <li>
              <strong className="text-slate-200">Developer Account Credentials:</strong> Email address, bcrypt-salted password hashes, organization name, and assigned multi-tenant RBAC roles (Developer, Operator, Auditor, Admin).
            </li>
            <li>
              <strong className="text-slate-200">Agent Identity & Keys:</strong> Unique Agent ID, display name, public Curve25519 / Ed25519 verification keys, and scoped API key hashes. Private keys generated on client SDKs are never uploaded to CBA servers.
            </li>
            <li>
              <strong className="text-slate-200">Financial Ledger Journals:</strong> Double-entry journal records (debit account, credit account, CBAC amount, timestamp, idempotency UUID, and SHA-256 state digests).
            </li>
            <li>
              <strong className="text-slate-200">Security Telemetry:</strong> Anomaly logs, transaction velocity rates, IP addresses of API calls, and tripwire trigger events for fraud defense.
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">4.0</span>
            <span>Ledger Immutability & Mathematical Audits</span>
          </h2>
          <p className="mb-3">
            Financial transactions recorded in the CBA double-entry ledger are immutable and append-only. Because financial integrity depends on non-destructive records, ledger entries cannot be arbitrarily erased or modified after settlement.
          </p>
          <p>
            Where correction is required, the CBA transaction engine issues traceable compensating entries. Ledger states are anchored in canonical SHA-256 binary Merkle trees to permit external verification without exposing private counterparty balances.
          </p>
        </div>

        {/* Section 5 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">5.0</span>
            <span>Data Security & Encryption Safeguards</span>
          </h2>
          <p className="mb-2">
            We enforce security-critical fintech best practices across our entire infrastructure:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px] text-slate-300">
            <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1e293b]">
              <span className="text-blue-400 block font-bold">ENCRYPTION AT REST</span>
              <span>AES-256 for persistent database storage</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1e293b]">
              <span className="text-emerald-400 block font-bold">ENCRYPTION IN TRANSIT</span>
              <span>TLS 1.3 enforced on all REST & WebSocket endpoints</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1e293b]">
              <span className="text-purple-400 block font-bold">CREDENTIAL HASHING</span>
              <span>Bcrypt (work factor 12) + Argon2id support</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1e293b]">
              <span className="text-amber-400 block font-bold">AUTHORIZATION</span>
              <span>Ed25519 Curve25519 Asymmetric Signatures</span>
            </div>
          </div>
        </div>

        {/* Section 6 */}
        <div className="p-6 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400 font-mono">6.0</span>
            <span>Developer & Organization Rights</span>
          </h2>
          <p className="mb-2">
            Controlling human developers and organizations maintain complete rights over their agent fleets:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Immediate suspension or permanent decommissioning of compromised agents.</li>
            <li>Instant revocation and rotation of API keys and Ed25519 credentials.</li>
            <li>Export of full transaction histories and Merkle inclusion proofs in JSON format.</li>
            <li>Account deletion (deactivates agent credentials and stops active telemetry).</li>
          </ul>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Terms of Service</h4>
          <p className="text-xs text-slate-400">Review developer operating agreements and simulated currency rules.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('terms')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
          >
            <span>Terms of Service</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
