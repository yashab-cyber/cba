import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { PaymentRequest, Agent } from '../types';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

interface InvoicesProps {
  invoices: PaymentRequest[];
  agents: Agent[];
  onRefresh: () => void;
}

export const Invoices: React.FC<InvoicesProps> = ({ invoices, agents, onRefresh }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [requesterId, setRequesterId] = useState('');
  const [payerId, setPayerId] = useState('');
  const [amount, setAmount] = useState('');
  const [serviceCode, setServiceCode] = useState('LLM_INFERENCE_BATCH');
  const [serviceDesc, setServiceDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterId || !payerId || !amount) return;

    try {
      setIsSubmitting(true);
      // Retrieve or generate credential for requester agent to sign invoice
      const credRes = await api.generateCredentials(requesterId);
      await api.createPaymentRequest(
        {
          payer_agent_id: payerId,
          amount,
          service_code: serviceCode,
          service_description: serviceDesc || `${serviceCode} executed by ${requesterId}`,
        },
        credRes.raw_api_key!
      );

      setIsCreateOpen(false);
      setAmount('');
      setServiceDesc('');
      onRefresh();
    } catch (err: any) {
      alert(`Invoice generation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (inv: PaymentRequest) => {
    if (!confirm(`Authorize payment of ${inv.amount} CBAC for invoice ${inv.id}?`)) return;
    try {
      const credRes = await api.generateCredentials(inv.payer_agent_id);
      const res = await api.approvePaymentRequest(inv.id, credRes.raw_api_key);
      alert(res.message);
      onRefresh();
    } catch (err: any) {
      alert(`Invoice approval failed: ${err.message}`);
    }
  };

  const handleReject = async (inv: PaymentRequest) => {
    const reason = prompt('Reason for rejection:', 'Service SLA not fulfilled') || 'Rejected';
    try {
      const credRes = await api.generateCredentials(inv.payer_agent_id);
      const res = await api.rejectPaymentRequest(inv.id, credRes.raw_api_key);
      alert(res.message);
      onRefresh();
    } catch (err: any) {
      alert(`Invoice rejection failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] border border-[#1e293b] p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Agent Payment Requests & Service Invoices</h2>
          <p className="text-xs text-slate-400">Autonomous billing for GPU compute, LLM inference quotas, and data tools</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue Payment Request</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {invoices.map((inv) => {
          const isPending = inv.status === 'PENDING';
          const isFulfilled = inv.status === 'FULFILLED';
          return (
            <div
              key={inv.id}
              className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-200">{inv.id}</span>
                    <div className="text-[11px] font-mono text-blue-400 mt-0.5">{inv.service_code}</div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-medium border ${
                      isFulfilled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isPending
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isFulfilled && <CheckCircle2 className="w-3 h-3" />}
                    {isPending && <Clock className="w-3 h-3" />}
                    {inv.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0a0f1d] border border-[#1e293b] mb-3 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[10px]">INVOICED PAYER:</span>
                    <span className="font-medium text-slate-200">{inv.payer_agent_id}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[10px]">PAYEE SERVICE AGENT:</span>
                    <span className="font-medium text-slate-200">{inv.requester_agent_id}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#1e293b] pt-1.5 mt-1.5">
                    <span className="text-slate-500 text-[10px]">INVOICE TOTAL:</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {Number(inv.amount).toFixed(2)} CBAC
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {inv.service_description || 'Billing for completed machine-to-machine digital service.'}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Expires: {new Date(inv.expires_at).toLocaleDateString()}
                </span>

                {isPending && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(inv)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(inv)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
                    >
                      Approve & Settle
                    </button>
                  </div>
                )}

                {isFulfilled && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Settled: {inv.transaction_id?.slice(0, 12)}...
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {invoices.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-[#0f172a] rounded-2xl border border-[#1e293b]">
            No payment requests found. Issue an invoice above.
          </div>
        )}
      </div>

      {/* Modal: Create Invoice */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Issue Service Invoice (Payment Request)"
        subtitle="Request funds from a peer agent for delivered compute or API services"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Service Provider (Payee Agent)</label>
            <select
              required
              value={requesterId}
              onChange={(e) => setRequesterId(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="">Select Billing Agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Client (Payer Agent)</label>
            <select
              required
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="">Select Payer Agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id}) - Bal: {Number(a.cached_balance || 0).toFixed(2)} CBAC
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Invoice Amount (CBAC)</label>
            <input
              type="number"
              step="any"
              min="0.000001"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 150.00"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Service Code</label>
            <input
              type="text"
              required
              value={serviceCode}
              onChange={(e) => setServiceCode(e.target.value)}
              placeholder="e.g. GPU_COMPUTE_H100, LLM_INFERENCE"
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Service Details & Deliverables</label>
            <textarea
              rows={2}
              value={serviceDesc}
              onChange={(e) => setServiceDesc(e.target.value)}
              placeholder="e.g. Completed fine-tuning run over 10,000 prompt-response pairs."
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow transition disabled:opacity-50"
            >
              {isSubmitting ? 'Issuing...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
