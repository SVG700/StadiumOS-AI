'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, Clock, MapPin, Compass, AlertTriangle } from 'lucide-react';

export default function TransportationPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-white">Logistics & Transportation</h2>
        <p className="text-sm text-slate-400">Manage metro intervals, parking shuttle fleets, and highway congestion sensors.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Fleet Telemetry */}
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                <Bus className="h-4 w-4" />
                Transit Fleet Status
              </CardTitle>
              <CardDescription className="text-xs">Summary of active transit vehicles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Active Shuttle Buses</span>
                <Badge variant="success">45 Running</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Metro Block Trainsets</span>
                <Badge variant="success">12 Active</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Taxi Drop Bays</span>
                <Badge variant="warning">82% Capacity</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Charter Coach Park</span>
                <Badge variant="success">140 Parked</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60 border-amber-950/30">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Logistics Bulletin
              </CardTitle>
              <CardDescription className="text-xs">Real-time alerts affecting inbound traffic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-slate-300">
                <h4 className="font-bold text-white mb-0.5">Highway Ramp Congestion</h4>
                <p className="text-[10px] text-slate-400">Avenue 4 exit blocked due to security perimeter check. Shuttle route B redirected.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Schedules Board */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-cyan-400" />
                Live Transit Dispatch Board
              </CardTitle>
              <CardDescription className="text-xs">Incoming and departing logistics fleets telemetry</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-slate-800 bg-[#0c101d] text-slate-300">
              Refresh Schedules
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-slate-900/60 pt-4">
            {/* Transit Line Grid */}
            {[
              { id: '1', route: 'Stadium Express (Line 1)', mode: 'Metro Train', status: 'On Time', eta: '4 min', occupancy: 'High' },
              { id: '2', route: 'Downtown Shuttle (Route A)', mode: 'Shuttle Bus', status: 'Delayed (12m)', eta: '12 min', occupancy: 'Medium' },
              { id: '3', route: 'West Parking Transfer', mode: 'Electric Shuttle', status: 'On Time', eta: '3 min', occupancy: 'Low' },
              { id: '4', route: 'Regional Commuter Rail', mode: 'Commuter Train', status: 'On Time', eta: '18 min', occupancy: 'High' },
              { id: '5', route: 'VIP Airport Escort (Fleet C)', mode: 'Electric VIP SUV', status: 'On Time', eta: '8 min', occupancy: 'Low' }
            ].map((transit) => (
              <div key={transit.id} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-800 bg-[#080d19]/35 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-cyan-400">
                    <Compass className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{transit.route}</h4>
                    <p className="text-[10px] text-slate-500">{transit.mode} • Load: {transit.occupancy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block text-sm">{transit.eta}</span>
                  <Badge variant={transit.status.includes('Delay') ? 'warning' : 'success'}>
                    {transit.status}
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
