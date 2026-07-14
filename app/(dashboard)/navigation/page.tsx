'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Map, Navigation, Locate, Eye, Compass, Info } from 'lucide-react';

export default function SmartNavigationPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-white">Smart Navigation</h2>
        <p className="text-sm text-slate-400">Indoor stadium maps, zone routing, and spectator pathfinding nodes.</p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Wayfinding Telemetry */}
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-cyan-400">
                <Compass className="h-4 w-4" />
                Wayfinding Node Status
              </CardTitle>
              <CardDescription className="text-xs">UWB and Bluetooth Beacon network status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Concourse Beacons</span>
                <Badge variant="success">Online (420/420)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">UWB Gate Sensors</span>
                <Badge variant="success">Online (32/32)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Elevator Nodes</span>
                <Badge variant="warning">Maintenance (1 delayed)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Emergency Signage</span>
                <Badge variant="success">Broadcasting (124)</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                <Navigation className="h-4 w-4" />
                Route Optimizations
              </CardTitle>
              <CardDescription className="text-xs">Current routing profiles dispatched to fan app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3 rounded border border-slate-800 bg-[#070b13]/40">
                <div className="flex items-center justify-between font-bold mb-1 text-white">
                  <span>Concourse Flow East</span>
                  <Badge variant="cyan">Active</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Fans exiting West bowl are rerouted via North Corridor to balance exit speed.</p>
              </div>
              <div className="p-3 rounded border border-slate-800 bg-[#070b13]/40">
                <div className="flex items-center justify-between font-bold mb-1 text-white">
                  <span>VIP Shuttle Gate 1</span>
                  <Badge variant="secondary">Standby</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Taxi queues routed to Bay B due to traffic at central boulevard.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center/Right: Interactive Map Wireframe */}
        <Card className="md:col-span-2 flex flex-col min-h-[450px]">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Map className="h-4 w-4 text-cyan-400" />
                Stadium Grid View (FIFA Standard)
              </CardTitle>
              <CardDescription className="text-xs">UWB tracking nodes and zone subdivisions</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-slate-800 bg-[#0c101d] text-slate-300 flex gap-1.5 items-center">
              <Locate className="h-3.5 w-3.5 text-cyan-400" />
              <span>Center Stadium</span>
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6 border-t border-slate-900 bg-slate-950/20">
            {/* SVG Stadium Mapping Placeholder */}
            <div className="relative w-full max-w-lg aspect-square max-h-[350px] border border-blue-900/30 rounded-xl bg-slate-950/70 p-4 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/30 via-slate-950 to-slate-950" />
              
              {/* Stadium Ring Graphic */}
              <svg className="w-full h-full relative z-10 text-cyan-500/20 max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
                {/* Outer Ring */}
                <ellipse cx="100" cy="100" rx="90" ry="70" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,3" />
                {/* Seating bowl */}
                <ellipse cx="100" cy="100" rx="70" ry="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Pitch field */}
                <rect x="65" y="75" width="70" height="50" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Midfield circle */}
                <circle cx="100" cy="100" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="100" y1="75" x2="100" y2="125" stroke="currentColor" strokeWidth="1.5" />
                
                {/* Tracker dots */}
                <circle cx="50" cy="65" r="4" className="fill-emerald-500 text-emerald-400 animate-ping" />
                <circle cx="50" cy="65" r="3.5" className="fill-emerald-500" />
                
                <circle cx="150" cy="135" r="4" className="fill-rose-500 text-rose-400 animate-ping" />
                <circle cx="150" cy="135" r="3.5" className="fill-rose-500" />

                <circle cx="100" cy="50" r="3.5" className="fill-cyan-500" />
                <circle cx="100" cy="150" r="3.5" className="fill-cyan-500" />
              </svg>

              <div className="absolute bottom-4 left-4 z-10 rounded border border-slate-800 bg-[#080d19]/90 px-3 py-1.5 text-[10px] text-slate-400 flex flex-col gap-1">
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Normal Congestion</div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-500" /> Staff Dispatch Zone</div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Critical Alert Node</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 text-center">
              <Info className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Phase 1 Sandbox. Vector map overlay and UWB indoor coordinates pathfinding will be fully integrated in Phase 2.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
