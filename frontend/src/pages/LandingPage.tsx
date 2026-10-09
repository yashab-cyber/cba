import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  Shield,
  FileText
} from 'lucide-react';
import { User } from '../types';

import { HomeView } from './public/HomeView';
import { ConceptView } from './public/ConceptView';
import { ArchitectureView } from './public/ArchitectureView';
import { MarketplaceView } from './public/MarketplaceView';
import { SecurityView } from './public/SecurityView';
import { ConverterView } from './public/ConverterView';
import { SdkView } from './public/SdkView';
import { ComparisonView } from './public/ComparisonView';
import { FaqView } from './public/FaqView';
import { PrivacyView } from './public/PrivacyView';
import { TermsView } from './public/TermsView';
import { MonetaryCharterView } from './public/MonetaryCharterView';
import { ComplianceView } from './public/ComplianceView';

interface LandingPageProps {
  user: User | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onEnterDashboard: () => void;
  onRunSimulation?: () => void;
}

const VALID_PAGES = [
  'home',
  'concept',
  'architecture',
  'marketplace',
  'security',
  'converter',
  'sdk',
  'comparison',
  'faq',
  'privacy',
  'terms',
  'monetary-charter',
  'compliance'
];

export const LandingPage: React.FC<LandingPageProps> = ({
  user,
  onOpenAuth,
  onEnterDashboard,
  onRunSimulation
}) => {
  // Read current page from URL hash or default to 'home'
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return VALID_PAGES.includes(hash) ? hash : 'home';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [legalDropdownOpen, setLegalDropdownOpen] = useState(false);
  const legalDropdownRef = useRef<HTMLDivElement>(null);

  // Simulated transaction stream state
  const [simTxs, setSimTxs] = useState([
    {
      id: 'tx_8f910a',
      from: 'agent_coder_02',
      to: 'agent_gpu_h100',
      amount: '15.000000',
      currency: 'CBAC',
      service: 'H100 SXM5 GPU Fine-Tune Slice (32k ctx)',
      time: 'Just now'
    },
    {
      id: 'tx_3d4b12',
      from: 'agent_analyst_04',
      to: 'agent_oracle_nasdaq',
      amount: '4.500000',
      currency: 'CBAC',
      service: 'L2 Real-Time Order Book Stream (10k ticks)',
      time: '24s ago'
    },
    {
      id: 'tx_9e7c33',
      from: 'agent_scraper_01',
      to: 'agent_proxy_mesh',
      amount: '1.750000',
      currency: 'CBAC',
      service: 'Rotating Residential Proxy Bandwidth (5GB)',
      time: '1m ago'
    }
  ]);

  // Sync hash changes with page state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (VALID_PAGES.includes(hash)) {
        setCurrentPage(hash);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Close legal dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        legalDropdownRef.current &&
        !legalDropdownRef.current.contains(event.target as Node)
      ) {
        setLegalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setLegalDropdownOpen(false);
    window.history.pushState(null, '', `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerSimPayment = () => {
    if (onRunSimulation) {
      onRunSimulation();
    }
    const newTx = {
      id: `tx_${Math.random().toString(16).substring(2, 8)}`,
      from: 'agent_researcher_03',
      to: 'agent_vllm_deepseek',
      amount: (Math.random() * 20 + 5).toFixed(6),
      currency: 'CBAC',
      service: `DeepSeek-R1 32k reasoning tokens #${Date.now().toString().slice(-4)}`,
      time: 'Just now'
    };
    setSimTxs((prev) => [newTx, ...prev.slice(0, 4)]);
  };

  const isLegalPage = ['privacy', 'terms', 'monetary-charter', 'compliance'].includes(currentPage);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <header className="h-20 border-b border-[#1e293b]/80 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-3.5 cursor-pointer group"
          onClick={() => navigateTo('home')}
        >
          <div className="relative">
            <img
              src="/logo.png"
              alt="Central Bank of Agents Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#070b14] rounded-full" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-base tracking-wide flex items-center gap-2">
              Central Bank of Agents
              <span className="text-[10px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                CBA OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Financial Infrastructure for AI Agents</p>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-5 text-xs text-slate-300 font-medium">
          <button
            onClick={() => navigateTo('home')}
            className={`transition cursor-pointer py-1 ${
              currentPage === 'home' ? 'text-blue-400 font-semibold border-b-2 border-blue-400' : 'hover:text-blue-400 text-slate-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigateTo('concept')}
            className={`transition cursor-pointer py-1 ${
              currentPage === 'concept' ? 'text-blue-400 font-semibold border-b-2 border-blue-400' : 'hover:text-blue-400 text-slate-300'
            }`}
          >
            Core Concept
          </button>
          <button
            onClick={() => navigateTo('architecture')}
            className={`transition cursor-pointer py-1 ${
              currentPage === 'architecture' ? 'text-blue-400 font-semibold border-b-2 border-blue-400' : 'hover:text-blue-400 text-slate-300'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => navigateTo('marketplace')}
            className={`transition cursor-pointer py-1 ${
              currentPage === 'marketplace' ? 'text-blue-400 font-semibold border-b-2 border-blue-400' : 'hover:text-blue-400 text-slate-300'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => navigateTo('security')}
            className={`transition cursor-pointer py-1 ${
              currentPage === 'security' ? 'text-blue-400 font-semibold border-b-2 border-blue-400' : 'hover:text-blue-400 text-slate-300'
            }`}
          >
            Security & Merkle
          </button>
          <button
            onClick={() => navigateTo('converter')}
            className={`transition cursor-pointer py-1 flex items-center gap-1 ${
              currentPage === 'converter' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>FX Converter</span>
          </button>
          <button
            onClick={() => navigateTo('sdk')}
            className={`transition cursor-pointer py-1 ${
              currentPage === 'sdk' ? 'text-blue-400 font-semibold border-b-2 border-blue-400' : 'hover:text-blue-400 text-slate-300'
            }`}
          >
            Python SDK
          </button>
          <button
            onClick={() => navigateTo('comparison')}
            className={`transition cursor-pointer py-1 ${
              currentPage === 'comparison' ? 'text-blue-400 font-semibold border-b-2 border-blue-400' : 'hover:text-blue-400 text-slate-300'
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => navigateTo('faq')}
            className={`transition cursor-pointer py-1 ${
              currentPage === 'faq' ? 'text-blue-400 font-semibold border-b-2 border-blue-400' : 'hover:text-blue-400 text-slate-300'
            }`}
          >
            FAQ
          </button>

          {/* Legal & Governance Dropdown */}
          <div className="relative" ref={legalDropdownRef}>
            <button
              onClick={() => setLegalDropdownOpen(!legalDropdownOpen)}
              className={`flex items-center gap-1 transition cursor-pointer py-1 ${
                isLegalPage ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-blue-400'
              }`}
            >
              <span>Legal & Policies</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${legalDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {legalDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0e1628] border border-[#1e293b] shadow-2xl py-2 z-50">
                <button
                  onClick={() => navigateTo('privacy')}
                  className={`w-full text-left px-4 py-2 text-xs transition cursor-pointer flex items-center gap-2 ${
                    currentPage === 'privacy' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Privacy Policy</span>
                </button>
                <button
                  onClick={() => navigateTo('terms')}
                  className={`w-full text-left px-4 py-2 text-xs transition cursor-pointer flex items-center gap-2 ${
                    currentPage === 'terms' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Terms of Service</span>
                </button>
                <button
                  onClick={() => navigateTo('monetary-charter')}
                  className={`w-full text-left px-4 py-2 text-xs transition cursor-pointer flex items-center gap-2 ${
                    currentPage === 'monetary-charter' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Monetary Charter</span>
                </button>
                <button
                  onClick={() => navigateTo('compliance')}
                  className={`w-full text-left px-4 py-2 text-xs transition cursor-pointer flex items-center gap-2 ${
                    currentPage === 'compliance' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compliance Standards</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Corner Buttons (Sign In / Register / Enter Console) */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition cursor-pointer"
            >
              <span>Enter Banking Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition cursor-pointer"
              >
                <span>Register Account</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0c1222] border-b border-[#1e293b] px-6 py-4 flex flex-col gap-2.5 sticky top-20 z-40 shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
          <button
            onClick={() => navigateTo('home')}
            className={`text-left text-xs py-1.5 transition ${currentPage === 'home' ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
          >
            Home Overview
          </button>
          <button
            onClick={() => navigateTo('concept')}
            className={`text-left text-xs py-1.5 transition ${currentPage === 'concept' ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
          >
            Core Concept
          </button>
          <button
            onClick={() => navigateTo('architecture')}
            className={`text-left text-xs py-1.5 transition ${currentPage === 'architecture' ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
          >
            Architecture & Double-Entry Ledger
          </button>
          <button
            onClick={() => navigateTo('marketplace')}
            className={`text-left text-xs py-1.5 transition ${currentPage === 'marketplace' ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
          >
            M2M Service Marketplace
          </button>
          <button
            onClick={() => navigateTo('security')}
            className={`text-left text-xs py-1.5 transition ${currentPage === 'security' ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
          >
            Security & Merkle Audits
          </button>
          <button
            onClick={() => navigateTo('converter')}
            className={`text-left text-xs py-1.5 flex items-center gap-1.5 transition ${currentPage === 'converter' ? 'text-emerald-300 font-bold' : 'text-emerald-400'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive FX Converter</span>
          </button>
          <button
            onClick={() => navigateTo('sdk')}
            className={`text-left text-xs py-1.5 transition ${currentPage === 'sdk' ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
          >
            Developer Python SDK
          </button>
          <button
            onClick={() => navigateTo('comparison')}
            className={`text-left text-xs py-1.5 transition ${currentPage === 'comparison' ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
          >
            Comparison Matrix
          </button>
          <button
            onClick={() => navigateTo('faq')}
            className={`text-left text-xs py-1.5 transition ${currentPage === 'faq' ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
          >
            Knowledge Base & FAQ
          </button>

          <div className="pt-2 border-t border-[#1e293b] space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Legal & Compliance</span>
            <button
              onClick={() => navigateTo('privacy')}
              className={`text-left text-xs py-1 block w-full transition ${currentPage === 'privacy' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigateTo('terms')}
              className={`text-left text-xs py-1 block w-full transition ${currentPage === 'terms' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigateTo('monetary-charter')}
              className={`text-left text-xs py-1 block w-full transition ${currentPage === 'monetary-charter' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
            >
              Monetary Policy Charter
            </button>
            <button
              onClick={() => navigateTo('compliance')}
              className={`text-left text-xs py-1 block w-full transition ${currentPage === 'compliance' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
            >
              Security Compliance
            </button>
          </div>
        </div>
      )}

      {/* Main Page Body: Renders Active Component */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomeView
            user={user}
            onNavigate={navigateTo}
            onOpenAuth={onOpenAuth}
            onEnterDashboard={onEnterDashboard}
            onTriggerSimPayment={handleTriggerSimPayment}
            simTxs={simTxs}
          />
        )}

        {currentPage === 'concept' && (
          <ConceptView onNavigate={navigateTo} onOpenAuth={onOpenAuth} />
        )}

        {currentPage === 'architecture' && (
          <ArchitectureView onNavigate={navigateTo} />
        )}

        {currentPage === 'marketplace' && (
          <MarketplaceView
            onNavigate={navigateTo}
            onTriggerSimPayment={handleTriggerSimPayment}
          />
        )}

        {currentPage === 'security' && (
          <SecurityView onNavigate={navigateTo} />
        )}

        {currentPage === 'converter' && (
          <ConverterView
            user={user}
            onNavigate={navigateTo}
            onOpenAuth={onOpenAuth}
            onEnterDashboard={onEnterDashboard}
          />
        )}

        {currentPage === 'sdk' && (
          <SdkView onNavigate={navigateTo} />
        )}

        {currentPage === 'comparison' && (
          <ComparisonView onNavigate={navigateTo} />
        )}

        {currentPage === 'faq' && (
          <FaqView onNavigate={navigateTo} />
        )}

        {currentPage === 'privacy' && (
          <PrivacyView onNavigate={navigateTo} />
        )}

        {currentPage === 'terms' && (
          <TermsView onNavigate={navigateTo} />
        )}

        {currentPage === 'monetary-charter' && (
          <MonetaryCharterView onNavigate={navigateTo} />
        )}

        {currentPage === 'compliance' && (
          <ComplianceView onNavigate={navigateTo} />
        )}
      </main>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="mt-auto border-t border-[#1e293b] bg-[#070b14] px-6 lg:px-12 py-14 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="CBA Logo" className="w-9 h-9 object-contain rounded-xl" />
              <div>
                <div className="font-semibold text-slate-200 text-sm">Central Bank of Agents (CBA)</div>
                <div className="text-[11px] text-slate-500">
                  The Financial Operating System for the AI Agent Economy
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Providing deterministic wallets, double-entry ACID settlement, cryptographic Ed25519 authorization, and machine-to-machine commerce for autonomous AI agent swarms.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0e1628] border border-[#1e293b] text-[11px] font-mono text-emerald-400 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ledger Balanced &bull; v1.5 Release</span>
            </div>
          </div>

          {/* Column 1: Core Platform */}
          <div className="space-y-3">
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono">Platform</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-blue-400 transition cursor-pointer">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('concept')} className="hover:text-blue-400 transition cursor-pointer">
                  Core Concept
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('architecture')} className="hover:text-blue-400 transition cursor-pointer">
                  Ledger Architecture
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('marketplace')} className="hover:text-blue-400 transition cursor-pointer">
                  M2M Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('security')} className="hover:text-blue-400 transition cursor-pointer">
                  Security & Merkle
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Tools & Developers */}
          <div className="space-y-3">
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono">Developers</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('converter')} className="hover:text-emerald-400 transition cursor-pointer text-emerald-400">
                  FX Currency Converter
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('sdk')} className="hover:text-blue-400 transition cursor-pointer">
                  Python SDK (cba_sdk)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('comparison')} className="hover:text-blue-400 transition cursor-pointer">
                  Comparison Matrix
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('faq')} className="hover:text-blue-400 transition cursor-pointer">
                  Knowledge Base & FAQ
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/yashab-cyber/cba"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition inline-flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Governance */}
          <div className="space-y-3">
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono">Governance</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('privacy')} className="hover:text-blue-400 transition cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-blue-400 transition cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('monetary-charter')} className="hover:text-blue-400 transition cursor-pointer">
                  Monetary Charter
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('compliance')} className="hover:text-blue-400 transition cursor-pointer">
                  Security Compliance
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-[#1e293b]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Central Bank of Agents. All rights reserved.
          </div>
          <div className="text-center sm:text-right max-w-lg">
            CBAC units represent simulated credits for testing autonomous machine economies. Not legal tender or redeemable for fiat without regulatory authorization.
          </div>
        </div>
      </footer>
    </div>
  );
};
