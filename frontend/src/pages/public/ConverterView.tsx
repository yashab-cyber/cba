import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeftRight,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Coins,
  Scale
} from 'lucide-react';
import { User } from '../../types';

interface ConverterViewProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onEnterDashboard: () => void;
}

export const ConverterView: React.FC<ConverterViewProps> = ({
  user,
  onNavigate,
  onOpenAuth,
  onEnterDashboard
}) => {
  const [fxFrom, setFxFrom] = useState<'CBAC' | 'CBAC_COMPUTE' | 'USD_SIM'>('CBAC');
  const [fxTo, setFxTo] = useState<'CBAC' | 'CBAC_COMPUTE' | 'USD_SIM'>('CBAC_COMPUTE');
  const [fxAmount, setFxAmount] = useState<string>('100.00');
  const [copiedFxQuote, setCopiedFxQuote] = useState(false);

  const getRate = (from: string, to: string): number => {
    if (from === to) return 1.0;
    if (from === 'CBAC' && to === 'CBAC_COMPUTE') return 4.0;
    if (from === 'CBAC_COMPUTE' && to === 'CBAC') return 0.25;
    if (from === 'CBAC' && to === 'USD_SIM') return 1.0;
    if (from === 'USD_SIM' && to === 'CBAC') return 1.0;
    if (from === 'USD_SIM' && to === 'CBAC_COMPUTE') return 4.0;
    if (from === 'CBAC_COMPUTE' && to === 'USD_SIM') return 0.25;
    return 1.0;
  };

  const currentRate = getRate(fxFrom, fxTo);
  const parsedAmount = parseFloat(fxAmount) || 0;
  const convertedAmount = (parsedAmount * currentRate).toFixed(6);
  const networkFee = (parsedAmount * 0.0005).toFixed(6); // 0.05% fee

  const handleSwapFx = () => {
    const temp = fxFrom;
    setFxFrom(fxTo);
    setFxTo(temp);
  };

  const handleCopyFxQuote = () => {
    const quoteText = `CBA FX Quote: ${parsedAmount.toFixed(6)} ${fxFrom} = ${convertedAmount} ${fxTo} (Rate: 1 ${fxFrom} = ${currentRate.toFixed(4)} ${fxTo}, Fee: ${networkFee} ${fxFrom})`;
    navigator.clipboard.writeText(quoteText);
    setCopiedFxQuote(true);
    setTimeout(() => setCopiedFxQuote(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Public Overview</span>
      </button>

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive Currency Calculator</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
          CBA Multi-Currency FX Converter
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Calculate instant conversion rates between CBA Credits (<code className="text-blue-400 font-mono">CBAC</code>), compute inference credits (<code className="text-purple-400 font-mono">CBAC_COMPUTE</code>), and simulated reference USD (<code className="text-emerald-400 font-mono">USD_SIM</code>) with zero-loss decimal arithmetic.
        </p>
      </div>

      {/* Converter Card */}
      <div className="p-8 rounded-3xl bg-[#0e1628] border border-[#1e293b] shadow-2xl mb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Input side */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Send Currency</span>
              <span className="text-[11px] font-mono text-slate-500">From</span>
            </label>
            <div className="flex gap-2">
              <select
                value={fxFrom}
                onChange={(e) => setFxFrom(e.target.value as any)}
                className="w-44 px-3 py-3 rounded-xl bg-[#070b14] border border-[#1e293b] text-sm text-slate-100 font-mono font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="CBAC">CBAC (Base)</option>
                <option value="CBAC_COMPUTE">CBAC_COMPUTE</option>
                <option value="USD_SIM">USD_SIM (Sim)</option>
              </select>
              <input
                type="number"
                value={fxAmount}
                onChange={(e) => setFxAmount(e.target.value)}
                placeholder="100.00"
                step="any"
                className="flex-1 px-4 py-3 rounded-xl bg-[#070b14] border border-[#1e293b] text-base text-white font-mono font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">Presets:</span>
              {['10.00', '50.00', '100.00', '500.00', '1000.00'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setFxAmount(preset)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#070b14] hover:bg-slate-800 text-slate-300 border border-[#1e293b] transition cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button (Mobile) */}
          <div className="flex md:hidden justify-center my-1">
            <button
              onClick={handleSwapFx}
              className="p-2.5 rounded-full bg-[#070b14] border border-[#1e293b] text-blue-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Converted Output side */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">
                <span>Receive Converted Currency</span>
              </label>
              <button
                onClick={handleSwapFx}
                className="hidden md:flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer font-mono"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Swap Pair</span>
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={fxTo}
                onChange={(e) => setFxTo(e.target.value as any)}
                className="w-44 px-3 py-3 rounded-xl bg-[#070b14] border border-[#1e293b] text-sm text-slate-100 font-mono font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="CBAC_COMPUTE">CBAC_COMPUTE</option>
                <option value="CBAC">CBAC (Base)</option>
                <option value="USD_SIM">USD_SIM (Sim)</option>
              </select>
              <div className="flex-1 px-4 py-3 rounded-xl bg-[#070b14]/70 border border-emerald-500/30 text-base text-emerald-400 font-mono font-bold flex items-center overflow-x-auto">
                {convertedAmount}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>1 {fxFrom} = {currentRate.toFixed(4)} {fxTo}</span>
              <span>Network Fee: {networkFee} {fxFrom} (0.05%)</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero floating-point arithmetic. Governed by central bank liquidity rules.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyFxQuote}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#070b14] hover:bg-slate-800 border border-[#1e293b] text-slate-300 transition cursor-pointer"
            >
              {copiedFxQuote ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Quote Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy FX Quote</span>
                </>
              )}
            </button>

            {user ? (
              <button
                onClick={onEnterDashboard}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <span>Execute in Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('signin')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <span>Sign In to Trade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Currency Pair Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h4 className="font-mono text-blue-400 font-bold text-sm mb-1">CBAC (Base)</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The canonical unit of account for the CBA financial system. Stored with 6 decimal places of precision.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h4 className="font-mono text-purple-400 font-bold text-sm mb-1">CBAC_COMPUTE</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Compute-pegged token: 1 CBAC = 4.0 CBAC_COMPUTE. Used for fine-tuning GPU slices and token inference.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-[#1e293b]">
          <h4 className="font-mono text-emerald-400 font-bold text-sm mb-1">USD_SIM</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Simulated reference fiat currency (1:1 parity with CBAC) for economic benchmarking and risk modeling.
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 rounded-2xl bg-[#070b14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Next: Developer Python SDK</h4>
          <p className="text-xs text-slate-400">Integrate CBA signed transfers into LangChain, CrewAI, and AutoGen in 3 lines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('sdk')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
          >
            <span>Explore Python SDK</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
