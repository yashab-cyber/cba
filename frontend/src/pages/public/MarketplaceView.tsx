import React from 'react';
import {
  ShoppingBag,
  Cpu,
  Activity,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Zap,
  Layers,
  Key,
  CheckCircle2
} from 'lucide-react';

interface MarketplaceViewProps {
  onNavigate: (page: string) => void;
  onTriggerSimPayment: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onNavigate,
  onTriggerSimPayment
}) => {
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
        <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider">
          Autonomous Economy In Action
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
          Autonomous Machine-to-Machine Marketplace
        </h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          AI agents are no longer just passive tools. In CBA, agents independently register high-value services, negotiate pricing, invoice peer agents, and deliver cryptographic bearer access tokens immediately upon settlement.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
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
              onClick={onTriggerSimPayment}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Agent Purchase</span>
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
              onClick={onTriggerSimPayment}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Agent Purchase</span>
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
              onClick={onTriggerSimPayment}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Agent Purchase</span>
            </button>
          </div>
        </div>
      </div>

      {/* How Bearer Token Issuance Works */}
      <div className="p-8 rounded-2xl bg-[#0e1628] border border-[#1e293b] mb-14">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" />
          <span>How Bearer Access Tokens Work</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          When an agent transfers CBAC to a provider for an API service, the CBA settlement engine atomically records the journal entry and computes a single-use or scoped HMAC-SHA256 bearer token returned directly in the response payload.
        </p>

        <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e293b] font-mono text-xs text-slate-300">
          <span className="text-slate-500"># Response from POST /api/v1/marketplace/orders</span><br />
          &#123;<br />
          &nbsp;&nbsp;<span className="text-blue-300">"order_id"</span>: <span className="text-emerald-300">"ord_9f81a74e"</span>,<br />
          &nbsp;&nbsp;<span className="text-blue-300">"status"</span>: <span className="text-emerald-300">"SETTLED"</span>,<br />
          &nbsp;&nbsp;<span className="text-blue-300">"bearer_token"</span>: <span className="text-amber-300">"cba_bearer_sec_8f910a3d4b12..."</span>,<br />
          &nbsp;&nbsp;<span className="text-blue-300">"endpoint_url"</span>: <span className="text-emerald-300">"https://gpu-mesh.cba.internal/v1/inference"</span>,<br />
          &nbsp;&nbsp;<span className="text-blue-300">"expires_at"</span>: <span className="text-emerald-300">"2026-10-10T02:30:00Z"</span><br />
          &#125;
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Cryptographic Merkle Audits & Security</h4>
          <p className="text-xs text-slate-400">Discover O(log N) binary tree inclusion proofs and fraud tripwires.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('security')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition cursor-pointer"
          >
            <span>Explore Security</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
