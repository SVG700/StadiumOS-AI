'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart2, ShieldAlert, TrendingUp } from 'lucide-react';

export default function CrowdIntelligencePage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-white">Crowd Intelligence</h2>
        <p className="text-sm text-slate-400">Computer-vision crowd estimation, queue times, and gate security flow analytics.</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mean Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">4.2 min</div>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              Down 12% from match start
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scanning Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">1,240 /min</div>
            <p className="text-[10px] text-slate-400 mt-1">Across 32 active turnstiles</p>
          </CardContent>
        </Card>

        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Peak Congestion Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-500">Concourse North</div>
            <p className="text-[10px] text-rose-400 mt-1">92% sensor density load</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Gate Queue Monitoring */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4 text-cyan-400" />
                Gate Telemetry & Queue Times
              </CardTitle>
              <CardDescription className="text-xs">Live status report from RFID ticket turnstiles</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-slate-800 bg-[#0c101d] text-slate-300">
              Export Logs
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-slate-900/60 pt-4">
            {/* Gate row */}
            {[
              { gate: 'Gate 1 (West Stand)', queues: 'Normal', wait: '3 mins', load: '40%', status: 'low' as const },
              { gate: 'Gate 2 (South Stand)', queues: 'Congested', wait: '11 mins', load: '78%', status: 'high' as const },
              { gate: 'Gate 3 (East Stand)', queues: 'Critical Bottle', wait: '18 mins', load: '92%', status: 'destructive' as const },
              { gate: 'Gate 4 (North Stand)', queues: 'Minimal Queue', wait: '2 mins', load: '22%', status: 'success' as const },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#080d19]/35 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">{item.gate}</span>
                  <span className="text-[10px] text-slate-500">Queue Index: {item.queues}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-slate-200 block">{item.wait}</span>
                    <span className="text-[9px] text-slate-400">Load: {item.load}</span>
                  </div>
                  <Badge variant={item.status === 'destructive' ? 'destructive' : item.status === 'high' ? 'warning' : 'success'}>{item.status === 'destructive' ? 'critical' : item.status === 'high' ? 'heavy' : 'clear'}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Side: Security Dispatch Console */}
        <Card className="md:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-rose-400">
              <ShieldAlert className="h-4 w-4" />
              Patrol Interventions
            </CardTitle>
            <CardDescription className="text-xs">Active crowd control dispatches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 overflow-y-auto max-h-[300px] text-xs">
            <div className="p-3 rounded border border-slate-800 bg-[#070b13]/40">
              <div className="flex justify-between items-center font-bold text-white mb-1">
                <span>Sector 4 Guard Dispatch</span>
                <Badge variant="warning">Deploying</Badge>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">Crowd bottleneck at food stall bays. Staff routing fences needed.</p>
              <span className="text-[9px] text-slate-500">Team: Patrol Squad C</span>
            </div>
            
            <div className="p-3 rounded border border-slate-800 bg-[#070b13]/40">
              <div className="flex justify-between items-center font-bold text-white mb-1">
                <span>Gate 3 Queue Assist</span>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">Deploying 10 additional stewards to Gate 3 to assist ticket scans.</p>
              <span className="text-[9px] text-slate-500">Team: Staff Reserve A</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
