import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Layers
} from 'lucide-react';

interface SdkViewProps {
  onNavigate: (page: string) => void;
}

export const SdkView: React.FC<SdkViewProps> = ({ onNavigate }) => {
  const [sdkTab, setSdkTab] = useState<'python' | 'curl' | 'typescript'>('python');
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippets = {
    python: `from decimal import Decimal
from cba_sdk import CBAClient

# 1. Initialize client with Ed25519 signing credentials
client = CBAClient(
    agent_id="agent_coder_02",
    api_key="cba_live_9f81a74e...",
    private_key="3a7f8e...canonical_64_hex_ed25519"
)

# 2. Check reconciled wallet balance (Zero Float loss)
balance = client.get_balance()
print(f"Operational Balance: {balance.cached_balance} CBAC")

# 3. Pay peer GPU agent with cryptographic Ed25519 signature
tx = client.pay_agent_signed(
    recipient_agent_id="agent_gpu_h100",
    amount=Decimal("15.000000"),
    description="H100 SXM5 GPU cluster inference slice"
)
print(f"Settled Transaction ID: {tx.transaction_id}")
print(f"Merkle Ledger Entry: {tx.journal_entries[0].id}")`,

    curl: `curl -X POST https://api.cba.bank/api/v1/payments \\
  -H "Authorization: Bearer cba_live_9f81a74e..." \\
  -H "X-Idempotency-Key: e8a719c2-5b91-4e44-8fc1-2a5c68f9a31b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient_agent_id": "agent_gpu_h100",
    "amount": "15.000000",
    "currency": "CBAC",
    "description": "H100 SXM5 GPU cluster inference slice",
    "ed25519_signature": "e7c2a91b...signed_payload_hex"
  }'`,

    typescript: `import { CBAClient } from '@cba/agent-sdk';

// 1. Initialize client with scoped API token
const client = new CBAClient({
  agentId: 'agent_coder_02',
  apiKey: process.env.CBA_API_KEY!,
  privateKey: process.env.CBA_ED25519_PRIVATE_KEY!
});

// 2. Execute instant machine-to-machine payment
const tx = await client.payments.sendSigned({
  recipientAgentId: 'agent_gpu_h100',
  amount: '15.000000',
  currency: 'CBAC',
  description: 'H100 SXM5 GPU cluster inference slice'
});

console.log(\`Settled in \${tx.settlementMs}ms: \${tx.transactionId}\`);`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[sdkTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
        <span className="text-xs font-mono font-semibold uppercase text-blue-400 tracking-wider">
          Developer-First FinTech
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
          Integrate in 3 Lines of Python
        </h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          The official <code className="text-blue-300 font-mono">cba_sdk</code> connects LangChain, CrewAI, AutoGen, and custom autonomous agents to the Central Bank of Agents with built-in Curve25519 payment signing, balance queries, and marketplace discovery.
        </p>
      </div>

      {/* Code Snippets Window */}
      <div className="rounded-2xl bg-[#0e1628] border border-[#1e293b] overflow-hidden shadow-2xl mb-14">
        <div className="px-5 py-3.5 bg-[#070b14] border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <div className="flex items-center gap-1 ml-3 bg-[#0a0f1d] p-1 rounded-lg border border-[#1e293b]">
              <button
                onClick={() => setSdkTab('python')}
                className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  sdkTab === 'python'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python SDK
              </button>
              <button
                onClick={() => setSdkTab('curl')}
                className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  sdkTab === 'curl'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setSdkTab('typescript')}
                className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  sdkTab === 'typescript'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TypeScript
              </button>
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer px-3 py-1.5 rounded-lg bg-[#0f172a] border border-[#1e293b]"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="p-6 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed bg-[#0a0f1d]/90">
          <pre>{codeSnippets[sdkTab]}</pre>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ed25519 Asymmetric Nonces</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The SDK automatically creates cryptographic nonces and signs payments with sub-second accuracy to prevent replay attacks.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Automatic Idempotency</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unique UUIDv4 idempotency keys ensure network timeouts or retries never result in duplicate debit deductions.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pydantic v2 Type Safety</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fully typed data models ensure zero runtime type bugs when serializing wallet states and invoice transactions.
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Traditional vs. Web3 vs. CBA Matrix</h4>
          <p className="text-xs text-slate-400">See why CBA outperforms traditional cards and smart contract chains for AI swarms.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('comparison')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
          >
            <span>View Comparison Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
