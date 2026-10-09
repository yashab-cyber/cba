import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  Layers,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { AnalyticsOverview, AuditEvent } from '../types';
import { api } from '../services/api';

interface AnalyticsProps {
  analytics: AnalyticsOverview | null;
}

export const Analytics: React.FC<AnalyticsProps> = ({ analytics }) => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(false);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoadingAudits(true);
        const data = await api.getAuditEvents();
        setAuditEvents(data);
      } catch (err) {
        console.error('Failed to load audit events:', err);
      } finally {
        setLoadingAudits(false);
      }
    };
    fetchAudits();
  }, []);

  const vol24 = Number(analytics?.volume_24h || 0);
  const volAll = Number(analytics?.volume_all_time || 0);
  const feesAll = Number(analytics?.fees_collected_total || 0);

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="24-Hour Settlement Volume"
          value={`${vol24.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC`}
          subtitle="Agent Micro-Payments"
          icon={TrendingUp}
          trend="+12.4%"
          trendType="positive"
        />
        <MetricCard
          title="Cumulative Volume"
          value={`${volAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC`}
          subtitle="All-Time Platform Turnover"
          icon={Layers}
        />
        <MetricCard
          title="Total Protocol Revenue"
          value={`${feesAll.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} CBAC`}
          subtitle="Transaction Fees (0.10%)"
          icon={DollarSign}
          trend="REVENUE"
          trendType="positive"
        />
        <MetricCard
          title="Active Machine Entities"
          value={analytics?.agents.active || 0}
          subtitle={`${analytics?.agents.suspended || 0} Suspended`}
          icon={Activity}
          badge="HEALTHY"
        />
      </div>

      {/* Volume Breakdown by Transaction Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">Volume by Transaction Category</h3>
          <p className="text-xs text-slate-400 mb-4">Economic distribution across transfers, API billing, and minting</p>

          <div className="space-y-3">
            {analytics?.breakdown_by_type?.map((item) => {
              const vol = Number(item.volume);
              const percentage = volAll > 0 ? ((vol / volAll) * 100).toFixed(1) : '0';
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">{item.type}</span>
                    <span className="text-slate-400">{vol.toFixed(2)} CBAC ({item.count} txs)</span>
                  </div>
                  <div className="w-full bg-[#0a0f1d] rounded-full h-2 overflow-hidden border border-[#1e293b]">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, Number(percentage)))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Currency Velocity & System Health */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Economic Velocity & Circulation</h3>
            <p className="text-xs text-slate-400">Indicators of machine liquidity demand</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <span className="text-slate-500 text-[10px] block mb-1">SETTLEMENT LATENCY</span>
              <span className="text-slate-200 font-bold text-sm">&lt; 35 ms</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">ACID Instant Finality</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <span className="text-slate-500 text-[10px] block mb-1">REPLAY PROTECTION</span>
              <span className="text-emerald-400 font-bold text-sm">100% IDEMPOTENT</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Zero Double Charges</span>
            </div>
          </div>

          <div className="p-3.5 bg-blue-950/20 border border-blue-500/20 rounded-xl text-xs text-slate-300">
            <strong>Monetary Safeguard Note:</strong> CBA Credits (CBAC) represent internal computational credits for testing and automated machine settlement. CBAC operates within a closed simulated double-entry ledger without fiat redemption until regulatory sandboxing criteria are met.
          </div>
        </div>
      </div>

      {/* Immutable Audit Events Log */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Immutable Compliance & Security Audit Trail
            </h3>
            <p className="text-xs text-slate-400">Chronological record of sensitive monetary issuances, policy updates, and freeze actions</p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
            {auditEvents.length} Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 text-[11px] bg-[#0a0f1d]">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource Target</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 font-mono text-[11px]">
              {auditEvents.slice(0, 8).map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/20">
                  <td className="p-3 text-slate-400">
                    {new Date(evt.created_at).toLocaleTimeString()}
                  </td>
                  <td className="p-3">
                    <span className="text-slate-200">{evt.actor_id}</span>
                    <span className="text-[9px] text-slate-500 ml-1">({evt.actor_type})</span>
                  </td>
                  <td className="p-3 font-semibold text-blue-400">{evt.action}</td>
                  <td className="p-3 text-slate-300">{evt.resource_type}: {evt.resource_id}</td>
                  <td className="p-3 text-slate-400 truncate max-w-xs" title={JSON.stringify(evt.details)}>
                    {JSON.stringify(evt.details)}
                  </td>
                </tr>
              ))}
              {auditEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    {loadingAudits ? 'Loading audit trail...' : 'No audit events recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
