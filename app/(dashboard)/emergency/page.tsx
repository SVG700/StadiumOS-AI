'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldCheck, Siren, PhoneCall, Info } from 'lucide-react';

export default function EmergencyAIPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-white">Emergency Dispatch AI</h2>
        <p className="text-sm text-slate-400">Incident escalation monitoring, medical squad allocation, and panic alert sensors.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Panic line controls */}
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-[#080d19]/45 border-slate-900/60 border-red-950/40">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-rose-500">
                <Siren className="h-4 w-4" />
                Stadium Alarm Controls
              </CardTitle>
              <CardDescription className="text-xs">Direct link to safety authority systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
                <PhoneCall className="h-4 w-4" />
                Emergency Intercom Link
              </Button>
              <Button variant="outline" className="w-full text-xs border-slate-800 bg-[#0c101d] text-slate-300">
                Test PA Broadcast Speaker
              </Button>
              <div className="rounded border border-red-500/20 bg-red-500/5 p-3 text-[10px] text-red-400 leading-relaxed">
                <strong>WARNING:</strong> Triggering intercom links or alerts broadcasts live notifications immediately to sector command centres.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                <ShieldCheck className="h-4 w-4" />
                Squad Availability
              </CardTitle>
              <CardDescription className="text-xs">Security, medical and fire squads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
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

        {/* Right Side: Active Incidents Dispatch */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Active Emergency Incidents
              </CardTitle>
              <CardDescription className="text-xs">Live dispatch status and responder tracking</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-slate-800 bg-[#0c101d] text-slate-300">
              Dispatch Logs
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-slate-900/60 pt-4">
            {[
              { id: '1', title: 'Section 104 Heat Exhaustion Spectator', details: 'Spectator collapsed in Row K. Medical Response 1 dispatched with cooling stretcher.', time: '5 mins ago', squad: 'Medical 1', status: 'deploying' },
              { id: '2', title: 'Gate 3 Turnstile Congestion Bottleneck', details: 'High ticket reader fail rate slowing concourse entrance. Crowd Control Alpha deploying fencing.', time: '15 mins ago', squad: 'Security Alpha', status: 'active' },
              { id: '3', title: 'Elevator EL-4 Malfunction', details: 'Elevator cabin stationary at Level 2. Maintenance dispatching service key.', time: '45 mins ago', squad: 'Maintenance B', status: 'investigating' }
            ].map((incident) => (
              <div key={incident.id} className="p-4 rounded-lg border border-slate-800 bg-[#080d19]/35 text-xs">
                <div className="flex items-center justify-between font-bold text-white mb-1.5">
                  <h4 className="text-sm">{incident.title}</h4>
                  <Badge variant={incident.status === 'deploying' ? 'destructive' : 'warning'}>
                    {incident.status}
                  </Badge>
                </div>
                <p className="text-slate-400 leading-relaxed mb-3">{incident.details}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900/60 pt-2">
                  <span>Reported: {incident.time}</span>
                  <span>Squad: {incident.squad}</span>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center pt-2">
              <Info className="h-4 w-4 text-rose-500 shrink-0" />
              <span>Incidents are simulated using in-memory state. Dispatch dispatches push alerts directly to workforce channels.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
