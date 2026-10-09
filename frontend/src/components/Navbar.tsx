import React from 'react';
import { Landmark, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';
import { MonetarySupply } from '../types';

interface NavbarProps {
  currentTab: string;
  supply?: MonetarySupply | null;
  onRefresh?: () => void;
  onOpenMintModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  supply,
  onRefresh,
  onOpenMintModal
}) => {
  const titles: Record<string, { title: string; subtitle: string }> = {
    overview: { title: 'Executive Overview', subtitle: 'Central Banking operations, circulation metrics, and real-time transaction activity' },
    wallets: { title: 'Wallets & Balances', subtitle: 'Deterministic agent liability wallets and central reserve balance audits' },
    agents: { title: 'AI Agent Directory', subtitle: 'Agent registrations, spending policies, velocity limits, and credential security' },
    payments: { title: 'Transactions & Ledger', subtitle: 'Double-entry journal, atomic settlements, and cryptographic hash verification' },
    invoices: { title: 'Invoices & Invoicing', subtitle: 'Autonomous agent billing, service requests, and invoice settlement flows' },
    'central-bank': { title: 'Monetary Authority', subtitle: 'Monetary base expansion, treasury grants, token retirement, and zero-sum audits' },
    analytics: { title: 'Economic Analytics', subtitle: 'Transaction velocity, volume distributions, fee aggregation, and system health' },
    developer: { title: 'Agent SDK & APIs', subtitle: 'Developer documentation, Python SDK examples, and LangChain/CrewAI integrations' },
  };

  const headerInfo = titles[currentTab] || { title: 'CBA Dashboard', subtitle: 'Autonomous Digital Banking' };

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur border-b border-[#1e293b] flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          {headerInfo.title}
        </h1>
        <p className="text-[11px] text-slate-400 hidden sm:block">{headerInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {supply && (
          <div className="hidden lg:flex items-center gap-3 bg-[#0f172a] border border-[#1e293b] px-3 py-1.5 rounded-lg text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Circulating CBAC</span>
              <span className="font-mono font-semibold text-emerald-400">
                {Number(supply.circulating_in_agents).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Treasury Reserve</span>
              <span className="font-mono font-semibold text-blue-400">
                {Number(supply.treasury_reserve).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CBAC
              </span>
            </div>
          </div>
        )}

        {onOpenMintModal && (
          <button
            onClick={onOpenMintModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Mint CBAC</span>
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition border border-[#1e293b]"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            CB
          </div>
          <div className="text-left hidden md:block">
            <span className="text-xs font-medium text-slate-200 block leading-tight">Master Operator</span>
            <span className="text-[10px] text-slate-400 font-mono">admin@cba.bank</span>
          </div>
        </div>
      </div>
    </header>
  );
};
