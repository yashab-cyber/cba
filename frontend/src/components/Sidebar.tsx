import React from 'react';
import {
  LayoutDashboard,
  Wallet as WalletIcon,
  Bot,
  ArrowLeftRight,
  FileText,
  Landmark,
  BarChart3,
  Code2,
  ShieldCheck,
  Zap,
  ShoppingBag,
  ShieldAlert,
  Users,
  LogOut,
  Shield
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user?: User | null;
  onLogout?: () => void;
  onRunSimulation?: () => void;
  isSimulating?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onLogout,
  onRunSimulation,
  isSimulating
}) => {
  const isAdminOrOperator = user?.role === 'admin' || user?.role === 'operator';
  const isAuditor = user?.role === 'auditor';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Service Marketplace', icon: ShoppingBag },
    { id: 'wallets', label: 'Wallets & Balances', icon: WalletIcon },
    { id: 'agents', label: 'AI Agent Directory', icon: Bot },
    { id: 'payments', label: 'Payments & Ledger', icon: ArrowLeftRight },
    { id: 'invoices', label: 'Invoices & Invoicing', icon: FileText },
    // Admin / Operator / Auditor only tabs
    ...(isAdminOrOperator || isAuditor
      ? [
          { id: 'central-bank', label: 'Central Bank Authority', icon: Landmark },
          { id: 'risk-audit', label: 'Risk & Merkle Verifier', icon: ShieldAlert },
        ]
      : []),
    // Admin only user management tab
    ...(isAdminOrOperator
      ? [{ id: 'users', label: 'Users & Access Control', icon: Users }]
      : []),
    { id: 'analytics', label: 'Economic Analytics', icon: BarChart3 },
    { id: 'developer', label: 'Agent SDK & APIs', icon: Code2 },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-[#1e293b] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e293b] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl tracking-wider">
          CBA
        </div>
        <div>
          <div className="font-semibold text-slate-100 text-sm tracking-wide flex items-center gap-1.5">
            Central Bank
            <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">v1.2</span>
          </div>
          <p className="text-[11px] text-slate-400">Financial OS for AI Agents</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
          <span>{isAdminOrOperator ? 'System & Operations' : 'Agent Operations'}</span>
          <span className="text-[9px] font-mono text-slate-500">{user?.role?.toUpperCase()}</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                active
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Simulation Button */}
      <div className="p-3 border-t border-[#1e293b] space-y-2">
        {onRunSimulation && (
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 disabled:opacity-60 transition"
          >
            <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Running Cycle...' : 'Simulate Economy'}</span>
          </button>
        )}

        {/* User Footer Profile & Logout */}
        {user && (
          <div className="p-2.5 bg-[#0f172a] rounded-xl border border-[#1e293b] flex items-center justify-between">
            <div className="overflow-hidden pr-2">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {user.full_name || user.email.split('@')[0]}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {user.organization || user.email}
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
