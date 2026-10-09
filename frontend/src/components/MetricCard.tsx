import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'neutral' | 'negative';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'positive',
  badge,
}) => {
  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 hover:border-slate-700 transition relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            {title}
          </span>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-100">
            {value}
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/20 transition">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-400 text-[11px]">{subtitle}</span>}
        {badge && (
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
            {badge}
          </span>
        )}
        {trend && (
          <span
            className={`text-[11px] font-medium font-mono ${
              trendType === 'positive'
                ? 'text-emerald-400'
                : trendType === 'negative'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
