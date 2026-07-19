'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldCheck, Siren } from 'lucide-react';

export default function EmergencyAIPage() {
  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Emergency Dispatch AI</h2>
        <p className="text-xs text-slate-400">Active emergency incident escalation, responder tracking, and squad dispatch.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Left Side: Controls & Squad Availability */}
        <div className="space-y-5">
          <Card className="bg-[#080d19]/45 border-slate-900/60 border-red-950/40">
            <CardHeader className="py-3 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-rose-500">
                <Siren className="h-4 w-4" />
                Dispatch Controls
              </CardTitle>
              <CardDescription className="text-[10px]">Direct link to sector command teams</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button variant="destructive" className="w-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                <Siren className="h-4 w-4" />
                Broadcast Tactical Alert
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="py-3 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-blue-400">
                <ShieldCheck className="h-4 w-4" />
                Squad Availability
              </CardTitle>
              <CardDescription className="text-[10px]">Security, medical, and fire squads</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Security Patrols</span>
                <Badge variant="success">14 Units Free</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Medical Responders</span>
                <Badge variant="warning">2 Units Active</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Fire/Hazard Watch</span>
                <Badge variant="success">8 Teams Ready</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Emergency Incidents */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="py-3 px-4 border-b border-slate-900/40">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Active Emergency Incidents
            </CardTitle>
            <CardDescription className="text-[10px]">Live responder tracking & sector dispatches</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              { id: '1', title: 'Section 104 Heat Exhaustion Spectator', details: 'Spectator collapsed in Row K. Medical Response 1 dispatched with cooling unit.', time: '5 mins ago', squad: 'Medical 1', status: 'deploying' },
              { id: '2', title: 'Gate 3 Turnstile Congestion Bottleneck', details: 'High ticket reader fail rate slowing concourse entrance. Security Alpha deploying fencing.', time: '15 mins ago', squad: 'Security Alpha', status: 'active' },
              { id: '3', title: 'Elevator EL-4 Service Stop', details: 'Elevator cabin stationary at Level 2. Maintenance key dispatched.', time: '45 mins ago', squad: 'Maintenance B', status: 'investigating' }
            ].map((incident) => (
              <div key={incident.id} className="p-3 rounded-lg border border-slate-800 bg-[#080d19]/35 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-white">
                  <h4 className="text-xs font-extrabold">{incident.title}</h4>
                  <Badge variant={incident.status === 'deploying' ? 'destructive' : 'warning'} className="text-[9px]">
                    {incident.status}
                  </Badge>
                </div>
                <p className="text-slate-400 leading-normal text-[11px]">{incident.details}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900/60 pt-1.5">
                  <span>Reported: {incident.time}</span>
                  <span className="text-cyan-400 font-bold">Squad: {incident.squad}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
