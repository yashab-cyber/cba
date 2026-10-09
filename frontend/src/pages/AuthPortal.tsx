import React, { useState } from 'react';
import { Landmark, Shield, Lock, Mail, User, Building, ArrowRight, CheckCircle2, AlertCircle, Bot, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface AuthPortalProps {
  onAuthSuccess: (user: UserType) => void;
  initialMode?: 'signin' | 'signup';
  onBackToHome?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  onAuthSuccess,
  initialMode = 'signin',
  onBackToHome
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<'user' | 'operator'>('user');
  const [tier, setTier] = useState('TIER_1');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signin') {
        const res = await api.login(email, password);
        onAuthSuccess(res.user);
      } else {
        // Sign up
        const newUser = await api.register({
          email,
          password,
          full_name: fullName || undefined,
          organization: organization || undefined,
          role,
          tier,
        });
        setSuccessMessage('Account registered successfully! Signing you in...');
        const loginRes = await api.login(email, password);
        setTimeout(() => {
          onAuthSuccess(loginRes.user);
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -bottom-20 -right-20" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 my-8">
        {/* Back to Home Button */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-4 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <span>← Back to Public Home</span>
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/logo.png"
              alt="CBA Logo"
              className="w-16 h-16 object-contain rounded-2xl shadow-xl shadow-blue-500/25 border border-blue-400/20"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Central Bank of Agents
            <span className="text-[11px] font-mono font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              CBA OS
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
            Institutional digital banking infrastructure & programmable currency for the AI Agent economy
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0e1628]/90 backdrop-blur-md border border-[#1e293b] rounded-2xl shadow-2xl p-7">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#090d18] rounded-xl border border-[#1e293b] mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Secure Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* Quick Demo Pickers (Sign In mode only) */}
          {mode === 'signin' && (
            <div className="mb-5 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Quick Test Credentials
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@cba.bank', 'CBA_Master_Operator_2026!')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0d1527] hover:bg-[#16223d] border border-blue-500/30 text-left transition group"
                >
                  <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                    👑 Master Admin
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">admin@cba.bank</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('developer@cba.bank', 'CBA_Developer_2026!')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0d1527] hover:bg-[#16223d] border border-emerald-500/30 text-left transition group"
                >
                  <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                    🤖 AI Developer
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">developer@cba.bank</div>
                </button>
              </div>
            </div>
          )}

          {/* Error & Success Banners */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#080d1a] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Organization / AI Entity</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. NeuroMesh Autonomous Labs"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full bg-[#080d1a] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-[#080d1a] border border-[#1e293b] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                    >
                      <option value="user">AI Agent Developer</option>
                      <option value="operator">System Operator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">KYC Tier</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full bg-[#080d1a] border border-[#1e293b] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                    >
                      <option value="TIER_1">Tier 1 (Sandbox)</option>
                      <option value="TIER_2">Tier 2 (Enterprise)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="agent.owner@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080d1a] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#080d1a] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Authenticate into CBA' : 'Create Banking Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Compliance & Security Footer */}
          <div className="mt-6 pt-5 border-t border-[#1e293b] text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mb-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Ed25519 Cryptographic Guard & Double-Entry Zero-Sum Accounting</span>
            </div>
            <p className="text-[10px] text-slate-400">
              CBAC units represent simulated credits for autonomous agent testnets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
