'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accessibility, HelpCircle, HeartHandshake, Eye, Sparkles } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-white">Accessibility Desk</h2>
        <p className="text-sm text-slate-400">Manage companion escorts, sensory suite bookings, and assistive kit distribution.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Equipment Inventory */}
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-cyan-400">
                <HelpCircle className="h-4 w-4" />
                Device Inventory
              </CardTitle>
              <CardDescription className="text-xs">Assistive equipment availability status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Wheelchairs (Gate A)</span>
                <Badge variant="success">18 Available</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Audio headsets (Sec 102)</span>
                <Badge variant="success">34 Available</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Sensory Kits (Gate C)</span>
                <Badge variant="warning">5 Left</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Sign Language Badges</span>
                <Badge variant="success">12 Available</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                <Sparkles className="h-4 w-4" />
                Sensory Room Status
              </CardTitle>
              <CardDescription className="text-xs">Quiet suites reservations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded border border-slate-800 bg-[#070b13]/40">
                <div className="flex justify-between items-center font-bold text-white mb-0.5">
                  <span>Quiet Suite 24</span>
                  <Badge variant="warning">80% Full</Badge>
                </div>
                <p className="text-[10px] text-slate-400">4 families checked in. Quiet level: Good (34 dB).</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Assistance Tickets */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-cyan-400" />
                Active Assistance Tickets
              </CardTitle>
              <CardDescription className="text-xs">Spectators requesting escort support</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-slate-800 bg-[#0c101d] text-slate-300">
              Export Tickets
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-slate-900/60 pt-4">
            {[
              { id: '1', request: 'Wheelchair Transfer escort', location: 'Gate 1 Dropoff', user: 'fan1@example.com', time: '10 mins ago', assignee: 'Sarah M.', status: 'in-progress' as const },
              { id: '2', request: 'Sensory Kit request', location: 'Suite 24 Entrance', user: 'fan2@example.com', time: '2 mins ago', status: 'pending' as const },
              { id: '3', request: 'Audio guide headset setup', location: 'Information Desk North', user: 'fan3@example.com', time: '30 mins ago', assignee: 'David K.', status: 'completed' as const }
            ].map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-800 bg-[#080d19]/35 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-cyan-400">
                    <Accessibility className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{ticket.request}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Loc: {ticket.location} • User: {ticket.user}</p>
                    {ticket.assignee && (
                      <p className="text-[9px] text-slate-500 mt-1">Agent: {ticket.assignee}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block mb-1">{ticket.time}</span>
                  <Badge variant={ticket.status === 'pending' ? 'warning' : ticket.status === 'in-progress' ? 'cyan' : 'success'}>
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
