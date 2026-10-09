import React, { useState } from 'react';
import {
  Bot,
  Key,
  Sliders,
  AlertOctagon,
  CheckCircle2,
  PlusCircle,
  Copy,
  Check,
  ShieldAlert,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { Agent, SpendingPolicy } from '../types';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

interface AgentsProps {
  agents: Agent[];
  onRefresh: () => void;
}

export const Agents: React.FC<AgentsProps> = ({ agents, onRefresh }) => {
  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  
  // Form states
  const [newAgentId, setNewAgentId] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDesc, setNewAgentDesc] = useState('');
  const [newAgentFunding, setNewAgentFunding] = useState('1000');
  
  // Credentials generated
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Cryptographic identity states
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [cryptoKeyData, setCryptoKeyData] = useState<{
    agent_id: string;
    public_key: string;
    private_key?: string;
  } | null>(null);
  const [copiedPubKey, setCopiedPubKey] = useState(false);
  const [copiedPrivKey, setCopiedPrivKey] = useState(false);
  
  // Policy editing
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [policyData, setPolicyData] = useState<Partial<SpendingPolicy>>({
    max_amount_per_tx: '1000',
    daily_spending_limit: '5000',
    human_approval_threshold: '2500',
    emergency_freeze: false,
  });

  const handleManageCrypto = (agent: Agent) => {
    setSelectedAgent(agent);
    setCryptoKeyData({
      agent_id: agent.id,
      public_key: agent.public_key || '',
    });
    setIsCryptoModalOpen(true);
  };

  const handleGenerateNewKeypair = async () => {
    if (!selectedAgent) return;
    try {
      const res = await api.generateKeypair(selectedAgent.id);
      setCryptoKeyData({
        agent_id: res.agent_id,
        public_key: res.public_key,
        private_key: res.private_key,
      });
      onRefresh();
    } catch (err: any) {
      alert(`Failed to generate Ed25519 keypair: ${err.message}`);
    }
  };

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAgent({
        id: newAgentId,
        name: newAgentName,
        description: newAgentDesc,
        initial_funding: newAgentFunding,
      });
      setIsRegisterOpen(false);
      setNewAgentId('');
      setNewAgentName('');
      setNewAgentDesc('');
      onRefresh();
    } catch (err: any) {
      alert(`Registration error: ${err.message}`);
    }
  };

  const handleGenerateKey = async (agent: Agent) => {
    try {
      const res = await api.generateCredentials(agent.id);
      setGeneratedKey(res.raw_api_key || 'cba_live_****************');
      setSelectedAgent(agent);
      setIsKeyModalOpen(true);
    } catch (err: any) {
      alert(`Failed to generate key: ${err.message}`);
    }
  };

  const handleOpenPolicy = async (agent: Agent) => {
    try {
      setSelectedAgent(agent);
      const detail = await api.getAgentDetail(agent.id);
      if (detail.spending_policy) {
        setPolicyData(detail.spending_policy);
      }
      setIsPolicyModalOpen(true);
    } catch (err: any) {
      alert(`Error loading policy: ${err.message}`);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    try {
      await api.updateSpendingPolicy(selectedAgent.id, policyData);
      setIsPolicyModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error updating policy: ${err.message}`);
    }
  };

  const handleToggleSuspension = async (agent: Agent) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change status of ${agent.name} to ${nextStatus}?`)) return;
    try {
      await api.toggleSuspension(agent.id, nextStatus);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] border border-[#1e293b] p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Registered Autonomous AI Agents</h2>
          <p className="text-xs text-slate-400">Manage deterministic agent identities, spending policies, and API keys</p>
        </div>
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New AI Agent</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {agents.map((agent) => {
          const isSuspended = agent.status === 'SUSPENDED';
          return (
            <div
              key={agent.id}
              className={`bg-[#0f172a] border rounded-2xl p-5 transition flex flex-col justify-between ${
                isSuspended ? 'border-rose-500/30 bg-rose-950/10' : 'border-[#1e293b] hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{agent.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400">{agent.id}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium border ${
                      agent.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {agent.description || 'Autonomous agent performing automated services within CBA ecosystem.'}
                </p>

                {/* Balance & Wallet Info */}
                <div className="p-3 rounded-xl bg-[#0a0f1d] border border-[#1e293b] flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Wallet className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono text-[11px]">{agent.wallet_id || `wal_${agent.id}`}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-100">
                      {Number(agent.cached_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">CBAC</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-[#1e293b]">
                <button
                  onClick={() => handleGenerateKey(agent)}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
                  title="Generate API Keys"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>API Key</span>
                </button>

                <button
                  onClick={() => handleManageCrypto(agent)}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 transition border border-purple-500/30"
                  title="Ed25519 Cryptographic Identity"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ed25519</span>
                </button>

                <button
                  onClick={() => handleOpenPolicy(agent)}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
                  title="Edit Spending Policy"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>Policy</span>
                </button>

                <button
                  onClick={() => handleToggleSuspension(agent)}
                  className={`p-2 rounded-lg text-xs font-medium transition border ${
                    isSuspended
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50'
                      : 'bg-rose-950/40 text-rose-400 border-rose-500/30 hover:bg-rose-900/50'
                  }`}
                  title={isSuspended ? 'Resume Agent' : 'Suspend Agent'}
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Register Agent */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New AI Agent"
        subtitle="Deploys an autonomous identity with double-entry liability wallet and initial spending policy"
      >
        <form onSubmit={handleRegisterAgent} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Unique Agent Identifier</label>
            <input
              type="text"
              required
              value={newAgentId}
              onChange={(e) => setNewAgentId(e.target.value)}
              placeholder="e.g. agent_fin_analyzer_05"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Display Name</label>
            <input
              type="text"
              required
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              placeholder="e.g. Agent Epsilon (Financial Valuation Specialist)"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description & Capabilities</label>
            <textarea
              rows={2}
              value={newAgentDesc}
              onChange={(e) => setNewAgentDesc(e.target.value)}
              placeholder="Autonomous financial valuation agent analyzing equity models and balance sheets."
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Initial Treasury Grant Allocation (CBAC)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={newAgentFunding}
              onChange={(e) => setNewAgentFunding(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Debits Central Bank Treasury; credits new agent deposit liability account.</span>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow transition"
            >
              Confirm & Onboard Agent
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Generated API Key */}
      <Modal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        title="Agent Authentication Credentials"
        subtitle={`Live API Key generated for ${selectedAgent?.name || 'Agent'}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Security Policy:</strong> This secret API key is shown only once. CBA stores only high-entropy SHA-256 hashes. Copy and save it into your agent's environment configuration now.
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">API Key (Bearer Token)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedKey || ''}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px] outline-none"
              />
              <button
                type="button"
                onClick={() => generatedKey && copyToClipboard(generatedKey)}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition shrink-0"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1e293b] font-mono text-[11px] text-slate-400 space-y-1">
            <div>Scope: wallets:read, payments:create, invoices:create</div>
            <div>Auth Header: X-CBA-API-KEY: {generatedKey?.slice(0, 16)}...</div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setIsKeyModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Edit Spending Policy */}
      <Modal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        title="Programmable Spending Policy"
        subtitle={`Configure velocity limits and approval escalations for ${selectedAgent?.name || 'Agent'}`}
      >
        <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Max Amount Per Transaction (CBAC)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={policyData.max_amount_per_tx}
              onChange={(e) => setPolicyData({ ...policyData, max_amount_per_tx: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Rolling 24-Hour Velocity Limit (CBAC)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={policyData.daily_spending_limit}
              onChange={(e) => setPolicyData({ ...policyData, daily_spending_limit: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Human Approval Escalation Threshold (CBAC)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={policyData.human_approval_threshold}
              onChange={(e) => setPolicyData({ ...policyData, human_approval_threshold: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Transactions above this threshold pause in PENDING_APPROVAL status.</span>
          </div>

          <div className="flex items-center gap-2 p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl">
            <input
              type="checkbox"
              id="emergency_freeze"
              checked={policyData.emergency_freeze}
              onChange={(e) => setPolicyData({ ...policyData, emergency_freeze: e.target.checked })}
              className="w-4 h-4 accent-rose-500 rounded"
            />
            <label htmlFor="emergency_freeze" className="text-rose-300 font-medium cursor-pointer">
              Emergency Spending Freeze (Immediately rejects all outgoing payments)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsPolicyModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow transition"
            >
              Save Policy Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Ed25519 Cryptographic Identity */}
      <Modal
        isOpen={isCryptoModalOpen}
        onClose={() => {
          setIsCryptoModalOpen(false);
          setCopiedPubKey(false);
          setCopiedPrivKey(false);
        }}
        title="Agent Cryptographic Identity (Ed25519)"
        subtitle={`Asymmetric keypair & mathematical verification for ${selectedAgent?.name || 'Agent'}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-purple-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Cryptographic Guarantee:</strong> Ed25519 signatures mathematically guarantee that payment instructions originate strictly from the private key holder. Prevents natural-language hallucination exploits and replay attacks.
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Registered Public Key (Hex)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={cryptoKeyData?.public_key || 'No public key registered yet'}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-purple-400 font-mono text-[11px] outline-none"
              />
              {cryptoKeyData?.public_key && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(cryptoKeyData.public_key);
                    setCopiedPubKey(true);
                    setTimeout(() => setCopiedPubKey(false), 2000);
                  }}
                  className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition shrink-0"
                >
                  {copiedPubKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPubKey ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>

          {cryptoKeyData?.private_key && (
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg space-y-2">
              <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Newly Generated Private Key (Shown Once)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={cryptoKeyData.private_key}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-amber-300 font-mono text-[11px] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(cryptoKeyData.private_key!);
                    setCopiedPrivKey(true);
                    setTimeout(() => setCopiedPrivKey(false), 2000);
                  }}
                  className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition shrink-0"
                >
                  {copiedPrivKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPrivKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-amber-400/80">
                Store this private key in your agent runtime. It is used with the Python SDK: <code>CBAClient(private_key=...)</code>.
              </p>
            </div>
          )}

          <div className="p-3 bg-[#0a0f1d] border border-[#1e293b] rounded-lg font-mono text-[11px] text-slate-400 space-y-1">
            <div>Algorithm: Curve25519 (Ed25519, RFC 8032)</div>
            <div>Headers: X-CBA-SIGNATURE, X-CBA-AGENT-ID, X-CBA-TIMESTAMP</div>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-[#1e293b]">
            <button
              type="button"
              onClick={handleGenerateNewKeypair}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              Generate New Keypair
            </button>
            <button
              type="button"
              onClick={() => setIsCryptoModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
