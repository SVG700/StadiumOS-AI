'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart2, ShieldAlert, TrendingUp, Users } from 'lucide-react';
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
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Crowd Intelligence</h2>
        <p className="text-xs text-slate-400">Gate security flow, queue telemetry, and patrol intervention monitoring.</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Mean Wait Time</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">4.2 min</div>
          <p className="text-[10px] text-emerald-400 mt-0.5">Down 12% from match start</p>
        </Card>

        <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Scanning Rate</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">1,240 /min</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Across 32 active turnstiles</p>
        </Card>

        <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Peak Congestion Zone</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-400">Gate 3 Concourse</div>
          <p className="text-[10px] text-rose-400 mt-0.5">92% sensor density load</p>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Gate Queue Monitoring & Chart */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60 flex flex-col justify-between">
          <CardHeader className="py-3 px-4 border-b border-slate-900/40">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-white">
              <BarChart2 className="h-4 w-4 text-cyan-400" />
              Gate Status & Queue Times (minutes)
            </CardTitle>
            <CardDescription className="text-[10px]">Turnstile wait time telemetry</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="gate" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-900/60 pt-3 text-xs">
              {gateData.map((item, idx) => (
                <div key={idx} className="p-2 rounded border border-slate-900 bg-slate-950/40 text-center">
                  <span className="font-bold text-white block text-[11px]">{item.gate}</span>
                  <span className="text-[10px] text-slate-400 block">{item.wait}m wait • {item.load}% load</span>
                  <Badge variant={item.status === 'critical' ? 'destructive' : item.status === 'high' ? 'warning' : 'success'} className="text-[8px] mt-1">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patrol Interventions Console */}
        <Card className="md:col-span-1 bg-[#080d19]/45 border-slate-900/60 flex flex-col justify-between">
          <CardHeader className="py-3 px-4 border-b border-slate-900/40">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-rose-400">
              <ShieldAlert className="h-4 w-4" />
              Patrol Interventions
            </CardTitle>
            <CardDescription className="text-[10px]">Active crowd control dispatches</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 flex-1 text-xs">
            <div className="p-2.5 rounded border border-slate-800 bg-[#070b13]/50 space-y-1">
              <div className="flex justify-between items-center font-bold text-white">
                <span>Sector 4 Guard Dispatch</span>
                <Badge variant="warning" className="text-[8px]">Deploying</Badge>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Crowd bottleneck at food stall bays. Routing fences deployed.</p>
              <span className="text-[9px] font-mono text-slate-500 block">Team: Patrol Squad C</span>
            </div>
            
            <div className="p-2.5 rounded border border-slate-800 bg-[#070b13]/50 space-y-1">
              <div className="flex justify-between items-center font-bold text-white">
                <span>Gate 3 Queue Assist</span>
                <Badge variant="destructive" className="text-[8px]">Urgent</Badge>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">10 stewards deployed to Gate 3 for turnstile assist.</p>
              <span className="text-[9px] font-mono text-slate-500 block">Team: Staff Reserve A</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
