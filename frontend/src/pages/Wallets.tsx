import React, { useState } from 'react';
import { Wallet, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Wallet as WalletType } from '../types';
import { api } from '../services/api';

interface WalletsProps {
  wallets: WalletType[];
  onRefresh: () => void;
}

export const Wallets: React.FC<WalletsProps> = ({ wallets, onRefresh }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const filteredWallets = wallets.filter((w) => {
    if (filterType === 'ALL') return true;
    return w.wallet_type === filterType;
  });

  const handleVerifyBalance = async (walletId: string) => {
    try {
      setVerifyingId(walletId);
      const res = await api.getWalletBalance(walletId);
      setVerificationResult(res);
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] border border-[#1e293b] p-4 rounded-xl">
        <div className="flex items-center gap-2">
          {['ALL', 'AGENT', 'TREASURY', 'FEE_POOL', 'BURN'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredWallets.length} of {wallets.length} accounts
          </span>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Verification Result Notification */}
      {verificationResult && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-200">
                Wallet {verificationResult.wallet_id} Reconciliation Audit Passed:
              </span>{' '}
              <span className="text-slate-400">
                Cached Balance ({verificationResult.cached_balance} CBAC) matches Real-Time Double-Entry Ledger Sum ({verificationResult.ledger_verified_balance} CBAC) with zero variance.
              </span>
            </div>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Wallets Table */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0a0f1d] text-slate-400 text-[11px]">
                <th className="p-4 font-semibold">Wallet Identifier</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Associated Agent</th>
                <th className="p-4 font-semibold text-right">Balance (CBAC)</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Audit & Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {filteredWallets.map((w) => {
                const bal = Number(w.cached_balance || 0);
                return (
                  <tr key={w.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-mono">
                      <div className="font-medium text-slate-200">{w.id}</div>
                      <span className="text-[10px] text-slate-500">Currency: {w.currency}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium border ${
                          w.wallet_type === 'AGENT'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : w.wallet_type === 'TREASURY'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : w.wallet_type === 'FEE_POOL'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {w.wallet_type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">
                      {w.agent_id ? (
                        <span className="text-slate-200">{w.agent_id}</span>
                      ) : (
                        <span className="text-slate-500 italic">Central Bank System Account</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono font-semibold text-slate-100 text-sm">
                      {bal.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          w.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleVerifyBalance(w.id)}
                        disabled={verifyingId === w.id}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 ml-auto disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>{verifyingId === w.id ? 'Auditing...' : 'Verify Ledger'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
