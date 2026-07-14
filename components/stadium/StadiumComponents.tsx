'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

// 1. MetricCard
interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  desc?: string;
  icon?: React.ReactNode;
  trend?: { type: 'up' | 'down'; val: string };
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, desc, icon, trend }) => {
  return (
    <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="text-2xl font-black text-white block tracking-tight">{value}</span>
        {desc && <span className="text-[9px] text-slate-400 block font-mono">{desc}</span>}
        {trend && (
          <span className={`text-[8.5px] font-bold font-mono ${trend.type === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.type === 'up' ? '▲' : '▼'} {trend.val}
          </span>
        )}
      </CardContent>
    </Card>
  );
};

// 2. ChartCard
interface ChartCardProps {
  title: string;
  desc?: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, desc, children }) => {
  return (
    <Card className="bg-[#080d19]/45 border-slate-900/60 p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <div className="h-64">{children}</div>
    </Card>
  );
};

// 3. StatusIndicator
interface StatusIndicatorProps {
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical' | 'Healthy' | 'Degraded' | 'Offline';
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, pulse = false }) => {
  const getColors = () => {
    switch (status) {
      case 'Excellent':
      case 'Healthy':
        return 'bg-emerald-400 text-emerald-400';
      case 'Good':
        return 'bg-cyan-400 text-cyan-400';
      case 'Warning':
      case 'Degraded':
        return 'bg-amber-400 text-amber-400';
      case 'Critical':
      case 'Offline':
      default:
        return 'bg-rose-500 text-rose-500';
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold">
      <span className={`h-1.5 w-1.5 rounded-full ${getColors()} ${pulse ? 'animate-pulse' : ''}`} />
      <span className="capitalize">{status.toLowerCase()}</span>
    </span>
  );
};

// 4. EmptyState
interface EmptyStateProps {
  message: string;
  subMessage?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, subMessage, icon }) => {
  return (
    <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-900 bg-slate-950/20 text-slate-500 space-y-1">
      {icon && <div className="flex justify-center mb-1.5">{icon}</div>}
      <p className="text-xs font-bold text-slate-400">{message}</p>
      {subMessage && <p className="text-[10px] text-slate-600">{subMessage}</p>}
    </div>
  );
};

// 5. LoadingState
export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div className="h-6 w-6 rounded-full border-2 border-slate-800 border-t-cyan-500 animate-spin" />
      <span className="text-xs font-mono text-slate-500 tracking-wider">LOADING TELEMETRY...</span>
    </div>
  );
};

// 6. SectionHeader
interface SectionHeaderProps {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, desc, action }) => {
  return (
    <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-900/60 mb-4">
      <div>
        <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">{title}</h4>
        {desc && <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// 7. InfoPanel
interface InfoPanelProps {
  title: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ title, type = 'info', children }) => {
  const getStyle = () => {
    switch (type) {
      case 'warning':
        return { border: 'border-amber-950/40', bg: 'bg-amber-950/10', text: 'text-amber-400', icon: <AlertTriangle className="h-4 w-4" /> };
      case 'error':
        return { border: 'border-rose-950/40', bg: 'bg-rose-950/10', text: 'text-rose-400', icon: <AlertTriangle className="h-4 w-4 text-rose-500" /> };
      case 'success':
        return { border: 'border-emerald-950/40', bg: 'bg-emerald-950/10', text: 'text-emerald-400', icon: <CheckCircle className="h-4 w-4" /> };
      case 'info':
      default:
        return { border: 'border-cyan-950/40', bg: 'bg-cyan-950/10', text: 'text-cyan-400', icon: <Info className="h-4 w-4" /> };
    }
  };

  const style = getStyle();

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${style.border} ${style.bg} text-xs`}>
      <div className="shrink-0 mt-0.5">{style.icon}</div>
      <div className="space-y-1">
        <span className={`font-bold block ${style.text}`}>{title}</span>
        <div className="text-slate-300 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
