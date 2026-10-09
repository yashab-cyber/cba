import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Modal } from './components/Modal';
import { Overview } from './pages/Overview';
import { Wallets } from './pages/Wallets';
import { Agents } from './pages/Agents';
import { Payments } from './pages/Payments';
import { Invoices } from './pages/Invoices';
import { CentralBank } from './pages/CentralBank';
import { Analytics } from './pages/Analytics';
import { DeveloperSDK } from './pages/DeveloperSDK';
import { Marketplace } from './pages/Marketplace';
import {
  Agent, Wallet, Transaction, PaymentRequest,
  MonetarySupply, ReconciliationReport, AnalyticsOverview
} from './types';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [supply, setSupply] = useState<MonetarySupply | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationReport | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<PaymentRequest[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGlobalMintOpen, setIsGlobalMintOpen] = useState(false);
  const [mintAmount, setMintAmount] = useState('500000');
  const [mintReason, setMintReason] = useState('Treasury reserve expansion');

  // Authenticate default operator on load if not set
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!localStorage.getItem('cba_token')) {
          await api.login('admin@cba.bank', 'CBA_Master_Operator_2026!');
        }
      } catch (err) {
        console.warn('Auto-login notice:', err);
      }
      fetchAllData();
    };
    initAuth();
  }, []);

  const fetchAllData = async () => {
    try {
      const [supplyData, reconData, walletsData, agentsData, txsData, invsData, analyticsData] =
        await Promise.all([
          api.getMonetarySupply().catch(() => null),
          api.getReconciliation().catch(() => null),
          api.getWallets().catch(() => []),
          api.getAgents().catch(() => []),
          api.getTransactions().catch(() => []),
          api.getPaymentRequests().catch(() => []),
          api.getAnalytics().catch(() => null),
        ]);

      if (supplyData) setSupply(supplyData);
      if (reconData) setReconciliation(reconData);
      if (walletsData) setWallets(walletsData);
      if (agentsData) setAgents(agentsData);
      if (txsData) setTransactions(txsData);
      if (invsData) setInvoices(invsData);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (err) {
      console.error('Data refresh error:', err);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setIsSimulating(true);
      // Run quick payment cycle between agents
      if (agents.length >= 2) {
        const buyer = agents[0];
        const provider = agents[1];
        await api.sendPayment({
          recipient_agent_id: provider.id,
          amount: (Math.random() * 30 + 10).toFixed(2),
          description: `Autonomous service invoice: GPU inference slice #${Date.now().toString().slice(-4)}`,
          service_code: 'GPU_COMPUTE_H100',
        });
      }
      await fetchAllData();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRunAudit = async () => {
    try {
      setIsAuditing(true);
      const rep = await api.getReconciliation();
      setReconciliation(rep);
    } catch (err: any) {
      alert(`Reconciliation error: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGlobalMint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.mintCurrency(mintAmount, mintReason);
      setIsGlobalMintOpen(false);
      fetchAllData();
      alert(`Successfully minted ${mintAmount} CBAC into Central Bank Treasury!`);
    } catch (err: any) {
      alert(`Minting failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onRunSimulation={handleRunSimulation}
        isSimulating={isSimulating}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar
          currentTab={currentTab}
          supply={supply}
          onRefresh={fetchAllData}
          onOpenMintModal={() => setIsGlobalMintOpen(true)}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <Overview
              supply={supply}
              transactions={transactions}
              agents={agents}
              onSelectTransaction={(tx) => {
                setSelectedTx(tx);
                setCurrentTab('payments');
              }}
              onRunSimulation={handleRunSimulation}
              isSimulating={isSimulating}
            />
          )}

          {currentTab === 'marketplace' && (
            <Marketplace agents={agents} onRefresh={fetchAllData} />
          )}

          {currentTab === 'wallets' && (
            <Wallets wallets={wallets} onRefresh={fetchAllData} />
          )}

          {currentTab === 'agents' && (
            <Agents agents={agents} onRefresh={fetchAllData} />
          )}

          {currentTab === 'payments' && (
            <Payments
              transactions={transactions}
              agents={agents}
              selectedTx={selectedTx}
              setSelectedTx={setSelectedTx}
              onRefresh={fetchAllData}
            />
          )}

          {currentTab === 'invoices' && (
            <Invoices invoices={invoices} agents={agents} onRefresh={fetchAllData} />
          )}

          {currentTab === 'central-bank' && (
            <CentralBank
              supply={supply}
              reconciliation={reconciliation}
              agents={agents}
              onRefresh={fetchAllData}
              onRunAudit={handleRunAudit}
              isAuditing={isAuditing}
            />
          )}

          {currentTab === 'analytics' && (
            <Analytics analytics={analytics} />
          )}

          {currentTab === 'developer' && (
            <DeveloperSDK />
          )}
        </main>
      </div>

      {/* Global Mint Modal */}
      <Modal
        isOpen={isGlobalMintOpen}
        onClose={() => setIsGlobalMintOpen(false)}
        title="Central Bank Monetary Base Expansion (Mint CBAC)"
        subtitle="Expands internal monetary supply by issuing new credits into Central Bank Treasury reserves"
      >
        <form onSubmit={handleGlobalMint} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Mint Amount (CBAC)</label>
            <input
              type="number"
              step="any"
              min="1"
              required
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Monetary Policy Purpose</label>
            <input
              type="text"
              required
              value={mintReason}
              onChange={(e) => setMintReason(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsGlobalMintOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow transition"
            >
              Authorize & Mint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;
