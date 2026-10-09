import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  BookOpen,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Zap,
  Key
} from 'lucide-react';
import { api } from '../services/api';

export const DeveloperSDK: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Playground state
  const [apiKey, setApiKey] = useState('cba_live_6834d8e9355be5a6c3d4c26bfa3e2f8ec74c4dc4a5da2ef3');
  const [targetAgent, setTargetAgent] = useState('agent_gpu_03');
  const [testAmount, setTestAmount] = useState('25.00');
  const [playgroundOutput, setPlaygroundOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const pythonSnippet = `from cba_sdk import CBAClient

# 1. Initialize CBA Client with Agent API key
client = CBAClient(
    api_key="cba_live_your_agent_secret_key_here",
    base_url="http://localhost:8000"
)

# 2. Check and cryptographically verify current balance
balance = client.get_balance("wal_agent_search_01")
print(f"Current CBAC Balance: {balance.cached_balance} (Reconciled: {balance.is_reconciled})")

# 3. Pay peer agent for GPU inference quota (Idempotent & Policy-Checked)
receipt = client.pay_agent(
    recipient_agent_id="agent_gpu_03",
    amount=25.50,
    service_code="LLM_INFERENCE_QWEN_72B",
    description="Payment for 50,000 reasoning tokens",
    idempotency_key="tx_unique_job_id_98214"
)

print(f"Settled Tx ID: {receipt.transaction_id}")
print(f"Double-Entry Status: {receipt.verification_status}")
print(f"Balance After: {receipt.sender_balance_after} CBAC")`;

  const langchainSnippet = `from langchain.tools import tool
from cba_sdk import CBAClient

cba = CBAClient(api_key="cba_live_agent_key")

@tool
def pay_service_agent(recipient_agent_id: str, amount: float, reason: str) -> str:
    """Pay another AI agent in CBA Credits (CBAC) for API calls, GPU compute, or tools."""
    receipt = cba.pay_agent(
        recipient_agent_id=recipient_agent_id,
        amount=amount,
        description=reason
    )
    return f"Payment successful. Tx ID: {receipt.transaction_id}, Status: {receipt.status}"`;

  const handleRunPlayground = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsRunning(true);
      setPlaygroundOutput('Executing payment request via CBA REST API with idempotency header...');
      const res = await api.sendPayment(
        {
          recipient_agent_id: targetAgent,
          amount: testAmount,
          description: 'Developer Sandbox automated micro-payment test',
          service_code: 'SANDBOX_INTERACTIVE_TEST',
        },
        apiKey
      );
      setPlaygroundOutput(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setPlaygroundOutput(`ERROR: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <Code2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Developer Integration Portal & Python SDK
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empower your autonomous AI agents with financial capabilities: micro-payments, programmatic balance queries, 
            service invoicing, and sub-cent API billing in 3 lines of Python code.
          </p>
        </div>
      </div>

      {/* Code Snippets & Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Python SDK */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-200">Python SDK Quickstart (`cba_sdk`)</h3>
              </div>
              <button
                onClick={() => copySnippet('python', pythonSnippet)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
              >
                {copiedCode === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'python' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b] text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
              <code>{pythonSnippet}</code>
            </pre>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e293b] text-[11px] text-slate-400">
            Install via package: <code className="text-blue-400 font-mono">pip install -e ./sdk</code>
          </div>
        </div>

        {/* LangChain / ReAct Integration */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-slate-200">LangChain & Agentic Tool Definition</h3>
              </div>
              <button
                onClick={() => copySnippet('langchain', langchainSnippet)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
              >
                {copiedCode === 'langchain' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'langchain' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b] text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
              <code>{langchainSnippet}</code>
            </pre>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e293b] text-[11px] text-slate-400">
            Compatible with CrewAI, AutoGen, LangGraph, and OpenAI Swarm function tools.
          </div>
        </div>
      </div>

      {/* Interactive REST API Playground */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            Interactive Agent API Sandbox
          </h3>
          <p className="text-xs text-slate-400">Test live agent API authentication and micro-settlements directly from the dashboard</p>
        </div>

        <form onSubmit={handleRunPlayground} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Agent API Key (Bearer)</label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px] outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Recipient Agent ID</label>
            <input
              type="text"
              required
              value={targetAgent}
              onChange={(e) => setTargetAgent(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px] outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Transfer Amount (CBAC)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                min="0.000001"
                required
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px] outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isRunning}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shrink-0 disabled:opacity-50"
              >
                {isRunning ? 'Sending...' : 'Test Send'}
              </button>
            </div>
          </div>
        </form>

        {playgroundOutput && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">API Response Output:</span>
            <pre className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b] text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60">
              {playgroundOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
