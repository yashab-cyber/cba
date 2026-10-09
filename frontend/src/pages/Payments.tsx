import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Hash,
  ChevronRight
} from 'lucide-react';
import { Transaction, TransactionReceipt, Agent } from '../types';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

interface PaymentsProps {
  transactions: Transaction[];
  agents: Agent[];
  selectedTx: Transaction | null;
  setSelectedTx: (tx: Transaction | null) => void;
  onRefresh: () => void;
}

export const Payments: React.FC<PaymentsProps> = ({
  transactions,
  agents,
  selectedTx,
  setSelectedTx,
  onRefresh,
}) => {
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<TransactionReceipt | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

  // Send form states
  const [senderAgentId, setSenderAgentId] = useState('');
  const [recipientAgentId, setRecipientAgentId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [serviceCode, setServiceCode] = useState('DIRECT_AGENT_TRANSFER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenReceipt = async (tx: Transaction) => {
    setSelectedTx(tx);
    try {
      setIsLoadingReceipt(true);
      const receipt = await api.getTransactionReceipt(tx.id);
      setReceiptData(receipt);
    } catch (err: any) {
      alert(`Failed to load receipt: ${err.message}`);
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientAgentId || !amount) return;

    try {
      setIsSubmitting(true);
      // Find sender agent API key if applicable, or send via admin session
      const receipt = await api.sendPayment({
        recipient_agent_id: recipientAgentId,
        amount,
        description: description || `Payment to ${recipientAgentId}`,
        service_code: serviceCode,
      });

      setIsSendOpen(false);
      setAmount('');
      setDescription('');
      onRefresh();
      setReceiptData(receipt);
      setSelectedTx(receipt.transaction);
    } catch (err: any) {
      alert(`Payment rejected: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveHeldTx = async (txId: string) => {
    try {
      const updatedReceipt = await api.approveTransaction(txId);
      setReceiptData(updatedReceipt);
      setSelectedTx(updatedReceipt.transaction);
      onRefresh();
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterStatus !== 'ALL' && tx.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = tx.id.toLowerCase().includes(q);
      const matchSender = (tx.sender_agent_id || tx.sender_wallet_id).toLowerCase().includes(q);
      const matchRec = (tx.recipient_agent_id || tx.recipient_wallet_id).toLowerCase().includes(q);
      return matchId || matchSender || matchRec;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] border border-[#1e293b] p-4 rounded-xl">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Tx ID or Agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#0a0f1d] border border-[#1e293b] p-1 rounded-lg">
            {['ALL', 'COMPLETED', 'PENDING_APPROVAL'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsSendOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Execute CBAC Payment</span>
        </button>
      </div>

      {/* Transactions Journal Table */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0a0f1d] text-slate-400 text-[11px]">
                <th className="p-4 font-semibold">Transaction ID</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Sender Account</th>
                <th className="p-4 font-semibold">Recipient Account</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-right">Fee</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 font-mono">
                    <div className="font-semibold text-slate-200">{tx.id}</div>
                    <span className="text-[10px] text-slate-500">{new Date(tx.created_at).toLocaleString()}</span>
                  </td>
                  <td className="p-4 font-mono text-[10px] text-slate-400 uppercase">
                    {tx.transaction_type}
                  </td>
                  <td className="p-4 font-mono text-slate-300">
                    {tx.sender_agent_id ? (
                      <span className="font-medium text-slate-200">{tx.sender_agent_id}</span>
                    ) : (
                      <span className="text-slate-500">{tx.sender_wallet_id}</span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-slate-300">
                    {tx.recipient_agent_id ? (
                      <span className="font-medium text-emerald-400">{tx.recipient_agent_id}</span>
                    ) : (
                      <span className="text-slate-500">{tx.recipient_wallet_id}</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-slate-100">
                    {Number(tx.amount).toFixed(2)} CBAC
                  </td>
                  <td className="p-4 text-right font-mono text-slate-400 text-[11px]">
                    {Number(tx.fee_amount).toFixed(4)}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : tx.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {tx.status === 'COMPLETED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {tx.status === 'PENDING_APPROVAL' && <Clock className="w-2.5 h-2.5" />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenReceipt(tx)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] font-medium transition"
                    >
                      Inspect Receipt
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No transactions match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Send Payment */}
      <Modal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        title="Execute Payment Transfer"
        subtitle="Initiate an atomic CBAC payment with programmable spending policy checks"
      >
        <form onSubmit={handleSendPayment} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Recipient AI Agent</label>
            <select
              required
              value={recipientAgentId}
              onChange={(e) => setRecipientAgentId(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="">Select Recipient Agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id}) - Bal: {Number(a.cached_balance || 0).toFixed(2)} CBAC
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Transfer Amount (CBAC)</label>
            <input
              type="number"
              step="any"
              min="0.000001"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50.00"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Subject to 0.10% protocol transaction fee (min 0.01 CBAC).</span>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Service Code (Optional)</label>
            <input
              type="text"
              value={serviceCode}
              onChange={(e) => setServiceCode(e.target.value)}
              placeholder="e.g. LLM_INFERENCE, GPU_COMPUTE"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Memo / Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Settlement for 200 embedding queries"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsSendOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow transition disabled:opacity-50"
            >
              {isSubmitting ? 'Settling...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Transaction Receipt & Double-Entry Ledger Breakdown */}
      {selectedTx && (
        <Modal
          isOpen={true}
          onClose={() => { setSelectedTx(null); setReceiptData(null); }}
          title="Double-Entry Settlement Receipt"
          subtitle={`Immutable Journal Record: ${selectedTx.id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Status & Summary */}
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Net Transfer Amount</span>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {Number(selectedTx.amount).toFixed(6)} CBAC
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Protocol Fee: {Number(selectedTx.fee_amount).toFixed(6)} CBAC
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-medium ${
                    selectedTx.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {selectedTx.status}
                </span>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Settled: {selectedTx.settled_at ? new Date(selectedTx.settled_at).toLocaleTimeString() : 'Pending'}
                </div>
              </div>
            </div>

            {/* Human Approval Escalation Action if Pending */}
            {selectedTx.status === 'PENDING_APPROVAL' && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-amber-300">Escalated for Human Approval</div>
                  <p className="text-slate-400 text-[11px]">
                    This transaction exceeded the agent's autonomous approval threshold.
                  </p>
                </div>
                <button
                  onClick={() => handleApproveHeldTx(selectedTx.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow"
                >
                  Authorize & Settle
                </button>
              </div>
            )}

            {/* Metadata Information */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0a0f1d] border border-[#1e293b] font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">IDEMPOTENCY KEY:</span>
                <span className="text-slate-300 break-all">{selectedTx.idempotency_key}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">TYPE & CURRENCY:</span>
                <span className="text-slate-300">{selectedTx.transaction_type} • {selectedTx.currency}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">DESCRIPTION:</span>
                <span className="text-slate-300">{selectedTx.description || 'No memo provided'}</span>
              </div>
            </div>

            {/* Double-Entry Journal Entries Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-blue-400" />
                  Double-Entry Journal Entries (Zero-Sum Invariant)
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  DEBITS = CREDITS
                </span>
              </div>

              <div className="border border-[#1e293b] rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-[#0a0f1d] border-b border-[#1e293b] text-slate-400">
                      <th className="p-3">Account Number</th>
                      <th className="p-3">Entry Type</th>
                      <th className="p-3 text-right">Debit</th>
                      <th className="p-3 text-right">Credit</th>
                      <th className="p-3 font-mono">SHA-256 Entry Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]/60">
                    {receiptData?.ledger_entries?.map((ent) => (
                      <tr key={ent.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-300">
                          {ent.account_number || ent.ledger_account_id}
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-mono font-medium px-1.5 py-0.5 rounded text-[10px] ${
                              ent.entry_type === 'DEBIT'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {ent.entry_type}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-rose-400">
                          {ent.entry_type === 'DEBIT' ? Number(ent.amount).toFixed(6) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-400">
                          {ent.entry_type === 'CREDIT' ? Number(ent.amount).toFixed(6) : '-'}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-500" title={ent.entry_hash}>
                          {ent.entry_hash ? `${ent.entry_hash.slice(0, 12)}...` : 'n/a'}
                        </td>
                      </tr>
                    ))}
                    {(!receiptData?.ledger_entries || receiptData.ledger_entries.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500">
                          {isLoadingReceipt ? 'Querying ledger entries...' : 'Entries pending settlement.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => { setSelectedTx(null); setReceiptData(null); }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
