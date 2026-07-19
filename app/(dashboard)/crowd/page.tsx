'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart2, TrendingUp, ShieldAlert } from 'lucide-react';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });

export default function CrowdIntelligencePage() {
  const gateData = [
    { gate: 'Gate 1', wait: 3, load: 40, status: 'low' },
    { gate: 'Gate 2', wait: 11, load: 78, status: 'high' },
    { gate: 'Gate 3', wait: 18, load: 92, status: 'critical' },
    { gate: 'Gate 4', wait: 2, load: 22, status: 'low' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Crowd Intelligence</h2>
        <p className="text-xs text-slate-400">Gate security flow, wait time telemetry, and crowd density telemetry.</p>
      </div>

      {/* Summary Row */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Mean Wait Time</span>
            <div className="text-2xl font-black text-white mt-0.5">4.2 min</div>
          </div>
          <div className="text-right text-emerald-400 text-xs font-bold flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Down 12%</span>
          </div>
        </Card>

        <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Peak Congestion</span>
            <div className="text-2xl font-black text-rose-400 mt-0.5">Gate 3 Concourse</div>
          </div>
          <div className="text-right text-rose-400 text-xs font-bold flex items-center gap-1">
            <ShieldAlert className="h-4 w-4" />
            <span>92% Load</span>
          </div>
        </Card>
      </div>

      {/* Single Professional Crowd Density & Gate Queue Graph */}
      <Card className="bg-[#080d19]/45 border-slate-900/60">
        <CardHeader className="py-3 px-4 border-b border-slate-900/40">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-white">
            <BarChart2 className="h-4 w-4 text-cyan-400" />
            Gate Queue Status & Crowd Density (Minutes Wait)
          </CardTitle>
          <CardDescription className="text-[10px]">Real-time turnstile telemetry across primary entry gates</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="gate" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '6px', fontSize: '11px' }}
                  labelStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                />
                <Bar dataKey="wait" radius={[4, 4, 0, 0]}>
                  {gateData.map((entry, index) => {
                    let color = '#3b82f6';
                    if (entry.status === 'critical') color = '#ef4444';
                    else if (entry.status === 'high') color = '#f97316';
                    else if (entry.status === 'low') color = '#10b981';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-900/60 pt-3 text-xs">
            {gateData.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded border border-slate-900 bg-slate-950/40 text-center">
                <span className="font-bold text-white block text-xs">{item.gate}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{item.wait}m wait • {item.load}% load</span>
                <Badge variant={item.status === 'critical' ? 'destructive' : item.status === 'high' ? 'warning' : 'success'} className="text-[8px] mt-1">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
