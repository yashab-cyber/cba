import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  GitBranch,
  Coins,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers
} from 'lucide-react';
import { RiskAlert, MerkleProof } from '../types';
import { api } from '../services/api';

export const RiskAndAudit: React.FC = () => {
  // Merkle state
  const [merkleRootData, setMerkleRootData] = useState<{ merkle_root: string; total_ledger_entries: number } | null>(null);
  const [entryIdInput, setEntryIdInput] = useState('');
  const [proofData, setProofData] = useState<MerkleProof | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ is_valid: boolean; message: string } | null>(null);
  const [isLoadingProof, setIsLoadingProof] = useState(false);

  // Risk alerts state
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  // FX state
  const [currencies, setCurrencies] = useState<Record<string, any>>({});
  const [fxFrom, setFxFrom] = useState('USD_SIM');
  const [fxTo, setFxTo] = useState('CBAC');
  const [fxAmount, setFxAmount] = useState('10');
  const [fxResult, setFxResult] = useState<{ converted: string; rate: string } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoadingAlerts(true);
      const [rootRes, alertsRes, currRes] = await Promise.all([
        api.getMerkleRoot().catch(() => null),
        api.getRiskAlerts().catch(() => []),
        api.getSupportedCurrencies().catch(() => ({})),
      ]);
      if (rootRes) setMerkleRootData(rootRes);
      setAlerts(alertsRes);
      setCurrencies(currRes);
      handleConvert('10', 'USD_SIM', 'CBAC');
    } catch (err) {
      console.error('Error loading Phase 3 data:', err);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleFetchProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryIdInput.trim()) return;
    try {
      setIsLoadingProof(true);
      setVerificationResult(null);
      const proof = await api.getMerkleProof(entryIdInput.trim());
      setProofData(proof);
    } catch (err: any) {
      alert(`Proof lookup error: ${err.message}`);
    } finally {
      setIsLoadingProof(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!proofData) return;
    try {
      const res = await api.verifyMerkleProof({
        leaf_hash: proofData.leaf_hash,
        merkle_root: proofData.merkle_root,
        proof_path: proofData.proof_path,
      });
      setVerificationResult({
        is_valid: res.is_valid,
        message: res.verification_message,
      });
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  const handleConvert = async (amount: string, from: string, to: string) => {
    try {
      const res = await api.convertCurrency(from, to, amount);
      setFxResult({
        converted: String(res.converted_amount),
        rate: String(res.effective_rate),
      });
    } catch (err) {
      console.error('FX conversion failed:', err);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await api.resolveRiskAlert(id, 'RESOLVED');
      loadAllData();
    } catch (err: any) {
      alert(`Failed to resolve alert: ${err.message}`);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] p-6 rounded-xl border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">Advanced Infrastructure & Risk Engine</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Phase 3 Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Independent cryptographic Merkle tree audit proofs, automated fraud & drain detection engine, and multi-currency FX settlement.
          </p>
        </div>
        <button
          onClick={loadAllData}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Verification</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Merkle Verifier & Risk Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Merkle Tree Cryptographic Ledger Verifier */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-semibold text-slate-100">Cryptographic Merkle Tree Ledger Verifier</h2>
              </div>
              <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                SHA-256 Hash Tree
              </span>
            </div>

            {/* Current Merkle Root */}
            <div className="bg-[#0a0f1d] p-3.5 rounded-lg border border-[#1e293b] mb-4">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Current Canonical Merkle Root:</span>
                <span className="font-mono text-[11px] text-slate-300">
                  {merkleRootData?.total_ledger_entries || 0} ledger entries indexed
                </span>
              </div>
              <div className="font-mono text-xs text-purple-300 break-all bg-purple-950/20 p-2 rounded border border-purple-500/20 select-all">
                {merkleRootData?.merkle_root || 'Loading root hash...'}
              </div>
            </div>

            {/* Entry Lookup Form */}
            <form onSubmit={handleFetchProof} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter Ledger Entry ID (e.g. entry_01... or click recent below)"
                  value={entryIdInput}
                  onChange={(e) => setEntryIdInput(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isLoadingProof}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition shrink-0"
              >
                {isLoadingProof ? 'Fetching...' : 'Generate Proof'}
              </button>
            </form>

            {/* Proof Path Visualization */}
            {proofData && (
              <div className="space-y-3 bg-[#0a0f1d] p-4 rounded-xl border border-[#1e293b]">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1e293b]">
                  <span className="font-semibold text-slate-200">Audit Trail for Entry:</span>
                  <span className="font-mono text-blue-400">{proofData.entry_id}</span>
                </div>

                <div className="text-xs">
                  <span className="text-slate-400">Leaf Hash: </span>
                  <span className="font-mono text-[11px] text-slate-300 break-all">{proofData.leaf_hash}</span>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Inclusion Proof Path ({proofData.proof_path.length} sibling steps to root):</span>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {proofData.proof_path.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-800 text-[10px] font-mono"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] uppercase">
                          {step.position}
                        </span>
                        <span className="text-slate-400 truncate flex-1">{step.hash}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleVerifyProof}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Cryptographic Proof</span>
                  </button>

                  {verificationResult && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{verificationResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Real-Time Risk & Anomaly Monitor */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h2 className="text-sm font-semibold text-slate-100">Automated Risk & Fraud Detection Engine</h2>
              </div>
              <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Drain & Velocity Guard
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-[#0a0f1d] rounded-lg border border-[#1e293b]">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Zero Critical Anomalies Detected</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  All agent payment velocities and balance transfer ratios are within safe boundaries.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a0f1d] text-slate-400 font-medium border-b border-[#1e293b]">
                    <tr>
                      <th className="p-2.5">Alert ID</th>
                      <th className="p-2.5">Agent</th>
                      <th className="p-2.5">Anomaly Type</th>
                      <th className="p-2.5">Score</th>
                      <th className="p-2.5">Action Taken</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300">
                    {alerts.map((al) => (
                      <tr key={al.id} className="hover:bg-slate-800/20">
                        <td className="p-2.5 font-mono text-rose-400">{al.id}</td>
                        <td className="p-2.5 font-mono text-slate-300">{al.agent_id}</td>
                        <td className="p-2.5 font-semibold text-slate-200">{al.anomaly_type}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(al.severity)}`}>
                            {al.risk_score} / 100
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-400">{al.action_taken}</td>
                        <td className="p-2.5">
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                            {al.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          {al.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleResolveAlert(al.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Multi-Currency FX Engine */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
              <Coins className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-100">Multi-Currency FX Engine</h2>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Algorithmic currency conversion between general CBA credits, compute-commodity tokens, and simulated fiat pegs.
            </p>

            {/* Supported Currencies List */}
            <div className="space-y-2 mb-5">
              {Object.entries(currencies).map(([code, info]: [string, any]) => (
                <div key={code} className="p-2.5 bg-[#0a0f1d] rounded-lg border border-[#1e293b] text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200">{info.name}</span>
                    <span className="ml-1 text-[10px] font-mono text-amber-400">({code})</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Peg: {info.peg_to_cbac} CBAC
                  </div>
                </div>
              ))}
            </div>

            {/* Converter Calculator */}
            <div className="bg-[#0a0f1d] p-4 rounded-xl border border-[#1e293b] space-y-3 text-xs">
              <h3 className="font-semibold text-slate-200 text-xs">Instant FX Calculator</h3>

              <div>
                <label className="block text-slate-400 mb-1">Amount to Convert</label>
                <input
                  type="number"
                  step="any"
                  value={fxAmount}
                  onChange={(e) => {
                    setFxAmount(e.target.value);
                    handleConvert(e.target.value, fxFrom, fxTo);
                  }}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg p-2 text-slate-100 font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">From Currency</label>
                  <select
                    value={fxFrom}
                    onChange={(e) => {
                      setFxFrom(e.target.value);
                      handleConvert(fxAmount, e.target.value, fxTo);
                    }}
                    className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg p-2 text-slate-100 text-xs outline-none focus:border-amber-500"
                  >
                    <option value="USD_SIM">USD_SIM (Fiat)</option>
                    <option value="CBAC">CBAC (Reserve)</option>
                    <option value="CBAC_COMPUTE">CBAC-C (Compute)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">To Currency</label>
                  <select
                    value={fxTo}
                    onChange={(e) => {
                      setFxTo(e.target.value);
                      handleConvert(fxAmount, fxFrom, e.target.value);
                    }}
                    className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg p-2 text-slate-100 text-xs outline-none focus:border-amber-500"
                  >
                    <option value="CBAC">CBAC (Reserve)</option>
                    <option value="USD_SIM">USD_SIM (Fiat)</option>
                    <option value="CBAC_COMPUTE">CBAC-C (Compute)</option>
                  </select>
                </div>
              </div>

              {fxResult && (
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-center mt-2">
                  <div className="text-[10px] text-slate-400">Converted Value:</div>
                  <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                    {Number(fxResult.converted).toFixed(4)} {fxTo}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Rate: 1 {fxFrom} = {fxResult.rate} {fxTo}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
