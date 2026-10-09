import React from 'react';
import { RefreshCw, PlusCircle, LogOut, Shield, Bot, User as UserIcon } from 'lucide-react';
import { MonetarySupply, User } from '../types';

interface NavbarProps {
  currentTab: string;
  supply?: MonetarySupply | null;
  user?: User | null;
  onRefresh?: () => void;
  onOpenMintModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  supply,
  user,
  onRefresh,
  onOpenMintModal,
  onLogout
}) => {
  const titles: Record<string, { title: string; subtitle: string }> = {
    home: { title: 'CBA Public Portal', subtitle: 'Institutional overview, architecture, FX converter, and developer SDK' },
    overview: { title: 'Executive Overview', subtitle: 'Central Banking operations, circulation metrics, and real-time transaction activity' },
    marketplace: { title: 'Autonomous Service Marketplace', subtitle: 'Machine-to-machine catalog for compute, inference, code synthesis, and data APIs' },
    wallets: { title: 'Wallets & Balances', subtitle: 'Deterministic agent liability wallets and balance audits' },
    agents: { title: 'AI Agent Directory', subtitle: 'Agent registrations, spending policies, velocity limits, and credential security' },
    payments: { title: 'Transactions & Ledger', subtitle: 'Double-entry journal, atomic settlements, and cryptographic hash verification' },
    invoices: { title: 'Invoices & Invoicing', subtitle: 'Autonomous agent billing, service requests, and invoice settlement flows' },
    'central-bank': { title: 'Monetary Authority', subtitle: 'Monetary base expansion, treasury grants, token retirement, and zero-sum audits' },
    'risk-audit': { title: 'Risk & Merkle Verifier', subtitle: 'Cryptographic SHA-256 Merkle proofs, FX converter, and fraud anomaly detection' },
    users: { title: 'Users & Access Control', subtitle: 'Institutional multi-tenant user management, KYC tiers, and RBAC permissions' },
    analytics: { title: 'Economic Analytics', subtitle: 'Transaction velocity, volume distributions, fee aggregation, and system health' },
    developer: { title: 'Agent SDK & APIs', subtitle: 'Developer documentation, Python SDK examples, and LangChain/CrewAI integrations' },
  };

  const headerInfo = titles[currentTab] || { title: 'CBA Dashboard', subtitle: 'Autonomous Digital Banking' };
  const isAdminOrOperator = user?.role === 'admin' || user?.role === 'operator';

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur border-b border-[#1e293b] flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          {headerInfo.title}
        </h1>
        <p className="text-[11px] text-slate-400 hidden sm:block">{headerInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {supply && isAdminOrOperator && (
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

        {isAdminOrOperator && onOpenMintModal && (
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

        {/* User Profile Badge */}
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${
              isAdminOrOperator
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              {isAdminOrOperator ? <Shield className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="text-left hidden md:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200 block leading-tight">
                  {user.full_name || user.email.split('@')[0]}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                  user.role === 'admin'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : user.role === 'operator'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {user.role.toUpperCase()}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[140px]">
                {user.email}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/30"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
