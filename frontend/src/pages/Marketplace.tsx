import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Zap,
  Server,
  Cpu,
  Code,
  Shield,
  Database,
  Search,
  Plus,
  CheckCircle2,
  Copy,
  ExternalLink,
  Coins
} from 'lucide-react';
import { ServiceListing, ServiceOrder, Agent } from '../types';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

interface MarketplaceProps {
  agents: Agent[];
  onRefresh: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ agents, onRefresh }) => {
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ordering modal state
  const [orderingService, setOrderingService] = useState<ServiceListing | null>(null);
  const [buyerAgentId, setBuyerAgentId] = useState<string>(agents[0]?.id || '');
  const [units, setUnits] = useState<string>('1');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<ServiceOrder | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Create listing modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState('INFERENCE');
  const [newPrice, setNewPrice] = useState('10.0');
  const [newUnit, setNewUnit] = useState('1,000 tokens');
  const [newDesc, setNewDesc] = useState('');
  const [newEndpoint, setNewEndpoint] = useState('https://agent.cba.internal/v1/service');
  const [newProviderId, setNewProviderId] = useState(agents[0]?.id || '');

  useEffect(() => {
    fetchMarketplaceData();
  }, [selectedCategory]);

  useEffect(() => {
    if (agents.length > 0 && !buyerAgentId) {
      setBuyerAgentId(agents[0].id);
      setNewProviderId(agents[0].id);
    }
  }, [agents]);

  const fetchMarketplaceData = async () => {
    try {
      setIsLoading(true);
      const cat = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const [svcData, ordData] = await Promise.all([
        api.getMarketplaceServices(cat).catch(() => []),
        api.getMarketplaceOrders().catch(() => [])
      ]);
      setServices(svcData);
      setOrders(ordData);
    } catch (err) {
      console.error('Failed to load marketplace services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Services', icon: ShoppingBag },
    { id: 'COMPUTE', label: 'Compute & GPUs', icon: Cpu },
    { id: 'INFERENCE', label: 'LLM Inference', icon: Zap },
    { id: 'CODE', label: 'Code & Tools', icon: Code },
    { id: 'SECURITY', label: 'Audit & SecOps', icon: Shield },
    { id: 'DATA', label: 'Data & Search', icon: Database },
  ];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.service_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'COMPUTE':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'INFERENCE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'CODE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'SECURITY':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'DATA':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const handleExecutePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingService) return;

    try {
      setIsSubmittingOrder(true);
      const order = await api.orderMarketplaceService(
        orderingService.id,
        Number(units),
        buyerAgentId
      );
      setCompletedOrder(order);
      setOrderingService(null);
      fetchMarketplaceData();
      onRefresh();
    } catch (err: any) {
      alert(`Order placement failed: ${err.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMarketplaceService(
        {
          service_code: newCode,
          title: newTitle,
          description: newDesc,
          category: newCategory,
          price_per_unit: Number(newPrice),
          unit_name: newUnit,
          endpoint_url: newEndpoint,
        },
        newProviderId
      );
      setIsCreateOpen(false);
      setNewTitle('');
      setNewCode('');
      setNewDesc('');
      fetchMarketplaceData();
    } catch (err: any) {
      alert(`Failed to list service: ${err.message}`);
    }
  };

  const selectedBuyer = agents.find((a) => a.id === buyerAgentId);
  const orderUnitsNum = parseFloat(units) || 0;
  const unitPriceNum = orderingService ? parseFloat(String(orderingService.price_per_unit)) : 0;
  const estimatedTotal = (orderUnitsNum * unitPriceNum).toFixed(6);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] p-6 rounded-xl border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">AI Agent Service Marketplace</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Phase 2 Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous agent service catalog. Agents discover APIs, computational resources, and code synthesis services, settling instantly via CBA Credits (CBAC) double-entry ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>List New Service</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const Icon = c.icon;
            const active = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  active
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-[#0f172a] text-slate-400 border-[#1e293b] hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search services or codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading marketplace catalog...</div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-[#0f172a] rounded-xl border border-[#1e293b]">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No services found in this category</p>
          <p className="text-xs text-slate-400 mt-1">Try switching categories or list a new service listing above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-[#0f172a] rounded-xl border border-[#1e293b] hover:border-blue-500/40 transition-all p-5 flex flex-col justify-between shadow-sm group"
            >
              <div>
                {/* Category & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadge(svc.category)}`}>
                    {svc.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {svc.total_orders} fulfilled
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-slate-100 text-sm group-hover:text-blue-400 transition">
                  {svc.title}
                </h3>
                <div className="mt-1">
                  <span className="font-mono text-[10px] bg-slate-800/80 text-blue-400 px-1.5 py-0.5 rounded border border-slate-700">
                    {svc.service_code}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                  {svc.description || 'Autonomous machine service endpoint.'}
                </p>

                {/* Provider info */}
                <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Provider:</span>
                  <span className="font-mono text-[11px] text-slate-300">{svc.provider_agent_id}</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-5 pt-3 border-t border-[#1e293b] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Unit Price</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    {Number(svc.price_per_unit).toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">/ {svc.unit_name}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOrderingService(svc);
                    setUnits('1');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Order Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Marketplace Orders Log */}
      <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-200">Recent Service Order Settlements</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{orders.length} total settlements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a0f1d] text-slate-400 font-medium border-b border-[#1e293b]">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Service Code</th>
                <th className="p-3">Buyer Agent</th>
                <th className="p-3">Units</th>
                <th className="p-3">Total Cost</th>
                <th className="p-3">Bearer Token</th>
                <th className="p-3">Status</th>
                <th className="p-3">Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No marketplace orders executed yet. Click "Order Now" on any service above!
                  </td>
                </tr>
              ) : (
                orders.slice(0, 10).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/20">
                    <td className="p-3 font-mono text-blue-400">{ord.id}</td>
                    <td className="p-3 font-mono text-slate-300">
                      {services.find((s) => s.id === ord.service_id)?.service_code || ord.service_id}
                    </td>
                    <td className="p-3 font-mono text-slate-300">{ord.buyer_agent_id}</td>
                    <td className="p-3 font-mono">{Number(ord.units_ordered).toFixed(1)}</td>
                    <td className="p-3 font-mono font-semibold text-emerald-400">{Number(ord.total_price).toFixed(2)} CBAC</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {ord.access_token.slice(0, 14)}...
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(ord.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Order / Purchase Service */}
      {orderingService && (
        <Modal
          isOpen={true}
          onClose={() => setOrderingService(null)}
          title={`Order: ${orderingService.title}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleExecutePurchase} className="space-y-4">
            <div className="bg-[#0a0f1d] p-3 rounded-lg border border-[#1e293b] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Service Code:</span>
                <span className="font-mono text-blue-400 font-semibold">{orderingService.service_code}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Unit Price:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {Number(orderingService.price_per_unit).toFixed(2)} CBAC / {orderingService.unit_name}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Provider Agent:</span>
                <span className="font-mono text-slate-300">{orderingService.provider_agent_id}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Purchasing Buyer Agent</label>
              <select
                value={buyerAgentId}
                onChange={(e) => setBuyerAgentId(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                required
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.id}) — Bal: {Number(ag.cached_balance || 0).toFixed(2)} CBAC
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Order Quantity ({orderingService.unit_name})
              </label>
              <input
                type="number"
                step="any"
                min="0.000001"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            {/* Cost breakdown */}
            <div className="p-3.5 bg-blue-950/20 border border-blue-900/40 rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({units} units):</span>
                <span className="font-mono text-slate-200">{estimatedTotal} CBAC</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Network Protocol Fee:</span>
                <span className="font-mono text-slate-200">0.100000 CBAC</span>
              </div>
              <div className="pt-2 border-t border-blue-900/40 flex justify-between font-semibold text-slate-100">
                <span>Total Debit:</span>
                <span className="font-mono text-emerald-400">
                  {(parseFloat(estimatedTotal) + 0.1).toFixed(6)} CBAC
                </span>
              </div>
              {selectedBuyer && (
                <div className="text-[10px] text-slate-400 pt-1">
                  Buyer Available Balance: <span className="font-mono text-slate-200">{Number(selectedBuyer.cached_balance || 0).toFixed(2)} CBAC</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderingService(null)}
                className="px-4 py-2 border border-[#1e293b] hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSubmittingOrder ? 'Settling...' : 'Confirm Double-Entry Settlement'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Order Receipt & Access Bearer Token */}
      {completedOrder && (
        <Modal
          isOpen={true}
          onClose={() => {
            setCompletedOrder(null);
            setCopiedToken(false);
          }}
          title="Service Order Fulfilled & Settled!"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-100 text-sm">Settlement Verified via Double-Entry Journal</h3>
              <p className="text-xs text-slate-400 mt-1">
                Transaction ID: <span className="font-mono text-blue-400">{completedOrder.transaction_id}</span>
              </p>
            </div>

            <div className="bg-[#0a0f1d] p-3 rounded-lg border border-[#1e293b] space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Order Reference:</span>
                <span className="font-mono text-slate-200">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Settled:</span>
                <span className="font-mono font-bold text-emerald-400">{Number(completedOrder.total_price).toFixed(6)} CBAC</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Buyer Agent:</span>
                <span className="font-mono text-slate-300">{completedOrder.buyer_agent_id}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Proof-of-Purchase Bearer Access Token:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={completedOrder.access_token}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-blue-400 font-mono focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(completedOrder.access_token);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedToken ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Pass this bearer token in the <code>Authorization: Bearer</code> header when executing service requests.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCompletedOrder(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: List New Service */}
      {isCreateOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          title="Publish New Machine Service Listing"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateListing} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Provider Agent</label>
              <select
                value={newProviderId}
                onChange={(e) => setNewProviderId(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                required
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Service Title</label>
                <input
                  type="text"
                  placeholder="e.g. DeepSeek-V3 Reasoning Endpoint"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Machine Service Code</label>
                <input
                  type="text"
                  placeholder="e.g. INFERENCE_DEEPSEEK_V3"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="INFERENCE">INFERENCE</option>
                  <option value="COMPUTE">COMPUTE</option>
                  <option value="CODE">CODE</option>
                  <option value="SECURITY">SECURITY</option>
                  <option value="DATA">DATA</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Price (CBAC)</label>
                <input
                  type="number"
                  step="any"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Unit Name</label>
                <input
                  type="text"
                  placeholder="e.g. 1M tokens"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Endpoint URL</label>
              <input
                type="url"
                value={newEndpoint}
                onChange={(e) => setNewEndpoint(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Service Description</label>
              <textarea
                rows={3}
                placeholder="Capabilities, model parameters, API latency SLA..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-[#1e293b] hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition"
              >
                Publish Listing
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
