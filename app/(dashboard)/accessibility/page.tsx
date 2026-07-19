'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accessibility, HeartHandshake } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Accessibility Desk</h2>
        <p className="text-xs text-slate-400">Manage active spectator requests for wheelchairs, audio guides, and sensory kits.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Left Side: Device Inventory (Wheelchairs, Audio Guides, Sensory Kits) */}
        <div className="space-y-5">
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="py-3 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-cyan-400">
                <Accessibility className="h-4 w-4" />
                Equipment Inventory
              </CardTitle>
              <CardDescription className="text-[10px]">Active device availability</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Wheelchairs</span>
                <Badge variant="success">18 Available</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Audio Guides</span>
                <Badge variant="success">34 Available</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Sensory Kits</span>
                <Badge variant="warning">5 Available</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Assistance Requests */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="py-3 px-4 border-b border-slate-900/40">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-white">
              <HeartHandshake className="h-4 w-4 text-cyan-400" />
              Active Assistance Requests
            </CardTitle>
            <CardDescription className="text-[10px]">Spectator requests requiring companion escorts or device deployment</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              { id: '1', request: 'Wheelchair Transfer Escort', location: 'Gate 1 Dropoff', user: 'fan1@example.com', time: '10 mins ago', assignee: 'Sarah M.', status: 'in-progress' as const },
              { id: '2', request: 'Sensory Kit Request', location: 'Suite 24 Entrance', user: 'fan2@example.com', time: '2 mins ago', status: 'pending' as const },
              { id: '3', request: 'Audio Guide Headset Setup', location: 'Info Desk North', user: 'fan3@example.com', time: '30 mins ago', assignee: 'David K.', status: 'completed' as const }
            ].map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#080d19]/35 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-cyan-400">
                    <Accessibility className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{ticket.request}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Loc: {ticket.location} • User: {ticket.user}</p>
                    {ticket.assignee && (
                      <p className="text-[9px] text-slate-500 mt-0.5">Assigned Agent: {ticket.assignee}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block mb-1">{ticket.time}</span>
                  <Badge variant={ticket.status === 'pending' ? 'warning' : ticket.status === 'in-progress' ? 'cyan' : 'success'} className="text-[9px]">
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
