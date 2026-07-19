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
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });

export default function CrowdIntelligencePage() {
  const gateData = [
    { gate: 'Gate 1', density: 40, queueTime: 3, status: 'low' },
    { gate: 'Gate 2', density: 78, queueTime: 11, status: 'high' },
    { gate: 'Gate 3', density: 92, queueTime: 18, status: 'critical' },
    { gate: 'Gate 4', density: 22, queueTime: 2, status: 'low' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Crowd Intelligence</h2>
        <p className="text-xs text-slate-400">Gate security flow, queue time telemetry, and crowd density analysis.</p>
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

      {/* Enterprise Multi-Metric Crowd Graph */}
      <Card className="bg-[#080d19]/45 border-slate-900/60">
        <CardHeader className="py-3 px-4 border-b border-slate-900/40">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-white">
            <BarChart2 className="h-4 w-4 text-cyan-400" />
            Gate Crowd Density vs Queue Time Analysis
          </CardTitle>
          <CardDescription className="text-[10px]">Real-time turnstile telemetry comparing capacity load (%) and wait time (mins)</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gateData} margin={{ top: 15, right: 20, left: 0, bottom: 15 }}>
                <XAxis dataKey="gate" stroke="#94a3b8" fontSize={12} tickLine={false} dy={5} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} dx={-5} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                />
                <Bar name="Crowd Density (%)" dataKey="density" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar name="Queue Time (mins)" dataKey="queueTime" fill="#f97316" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-900/60 pt-3 text-xs">
            {gateData.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded border border-slate-900 bg-slate-950/40 text-center">
                <span className="font-bold text-white block text-xs">{item.gate}</span>
                <div className="mt-1 space-y-0.5 text-[10px]">
                  <span className="text-blue-400 block font-semibold">Density: {item.density}%</span>
                  <span className="text-amber-500 block font-semibold">Wait: {item.queueTime}m</span>
                </div>
                <Badge variant={item.status === 'critical' ? 'destructive' : item.status === 'high' ? 'warning' : 'success'} className="text-[8px] mt-1.5 uppercase font-mono">
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
