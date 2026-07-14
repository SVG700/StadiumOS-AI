'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Map, Navigation, Locate, Compass, Info, Coffee, HelpCircle, 
  MapPin, ShieldAlert
} from 'lucide-react';

export default function SmartNavigationPage() {
  useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<'seat' | 'food' | 'restroom' | 'medical' | null>(null);
  
  // Simulation states
  const [beaconStatus, setBeaconStatus] = useState({
    beacons: 'Online (420/420)',
    sensors: 'Online (32/32)',
    elevators: 'Online (16/16)',
    signage: 'Broadcasting (124)'
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);

    // Dynamic telemetry updates (simulating live system)
    const interval = setInterval(() => {
      setBeaconStatus(prev => ({
        ...prev,
        beacons: Math.random() > 0.95 ? 'Online (419/420) • Re-sync' : 'Online (420/420)',
        signage: `Broadcasting (${120 + Math.floor(Math.random() * 8)})`
      }));
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-white">Smart Navigation</h2>
        <p className="text-sm text-slate-400">Indoor stadium maps, zone routing, and spectator pathfinding nodes.</p>
      </div>

      {/* Style overrides for animated paths */}
      <style jsx global>{`
        @keyframes flowDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-flow {
          stroke-dasharray: 6, 4;
          animation: flowDash 1.2s linear infinite;
        }
      `}</style>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Wayfinding Telemetry */}
        <div className="md:col-span-1 space-y-4">
          {/* Direct Actions */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <Navigation className="h-4.5 w-4.5 text-cyan-400" />
                Find Facilities
              </CardTitle>
              <CardDescription className="text-xs">Click to highlight walking path from Gate 4 Entrance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1">
              <Button
                variant={activeHighlight === 'seat' ? 'default' : 'outline'}
                onClick={() => setActiveHighlight('seat')}
                className={`w-full justify-start text-xs border-slate-800 ${
                  activeHighlight === 'seat' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-[#0c101d] text-slate-300 hover:text-white'
                }`}
              >
                <MapPin className="mr-2 h-4 w-4 text-cyan-400" />
                <span>Find My Seat (SEC 102)</span>
              </Button>

              <Button
                variant={activeHighlight === 'food' ? 'default' : 'outline'}
                onClick={() => setActiveHighlight('food')}
                className={`w-full justify-start text-xs border-slate-800 ${
                  activeHighlight === 'food' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-[#0c101d] text-slate-300 hover:text-white'
                }`}
              >
                <Coffee className="mr-2 h-4 w-4 text-amber-400" />
                <span>Nearest Concessions / Food court</span>
              </Button>

              <Button
                variant={activeHighlight === 'restroom' ? 'default' : 'outline'}
                onClick={() => setActiveHighlight('restroom')}
                className={`w-full justify-start text-xs border-slate-800 ${
                  activeHighlight === 'restroom' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-[#0c101d] text-slate-300 hover:text-white'
                }`}
              >
                <HelpCircle className="mr-2 h-4 w-4 text-emerald-400" />
                <span>Nearest Restrooms</span>
              </Button>

              <Button
                variant={activeHighlight === 'medical' ? 'default' : 'outline'}
                onClick={() => setActiveHighlight('medical')}
                className={`w-full justify-start text-xs border-slate-800 ${
                  activeHighlight === 'medical' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-[#0c101d] text-slate-300 hover:text-white'
                }`}
              >
                <ShieldAlert className="mr-2 h-4 w-4 text-rose-400" />
                <span>Emergency Medical Center</span>
              </Button>

              {activeHighlight && (
                <Button
                  variant="ghost"
                  onClick={() => setActiveHighlight(null)}
                  className="w-full text-xs text-slate-400 hover:text-white mt-1 border border-dashed border-slate-800"
                >
                  Clear highlighted route
                </Button>
              )}
            </CardContent>
          </Card>

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
                <Badge variant="success">{beaconStatus.beacons}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">UWB Gate Sensors</span>
                <Badge variant="success">{beaconStatus.sensors}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Elevator Nodes</span>
                <Badge variant="success">{beaconStatus.elevators}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Emergency Signage</span>
                <Badge variant="success">{beaconStatus.signage}</Badge>
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
                <p className="text-[10px] text-slate-400 leading-relaxed">Fans exiting West bowl are rerouted via North Corridor to balance exit speed.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center/Right: Interactive Map */}
        <Card className="md:col-span-2 flex flex-col min-h-[500px]">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Map className="h-4 w-4 text-cyan-400" />
                Stadium Floorplan Map
              </CardTitle>
              <CardDescription className="text-xs">Stadium Alpha Interactive Spectator Layout</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveHighlight(null)}
              className="text-xs border-slate-800 bg-[#0c101d] text-slate-300 flex gap-1.5 items-center"
            >
              <Locate className="h-3.5 w-3.5 text-cyan-400" />
              <span>Center Stadium</span>
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col items-center justify-center p-4 border-t border-slate-900 bg-slate-950/20">
            {/* Interactive SVG Stadium Floorplan Map */}
            <div className="relative w-full max-w-2xl aspect-[4/3] border border-blue-900/30 rounded-xl bg-slate-950/70 p-4 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950 pointer-events-none" />
              
              <svg className="w-full h-full relative z-10 text-cyan-500/20 max-h-[380px]" viewBox="0 0 500 380">
                {/* 1. Parking Zones & External Area */}
                <rect x="15" y="15" width="80" height="40" rx="3" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
                <text x="55" y="40" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">Parking Zone A</text>

                <rect x="405" y="15" width="80" height="40" rx="3" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
                <text x="445" y="40" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">Parking Zone B</text>

                {/* 2. Outer Stadium Boundary Concourse */}
                <ellipse cx="250" cy="190" rx="200" ry="140" fill="none" stroke="#1e293b" strokeWidth="3" />
                
                {/* Concourse Level Labels */}
                <ellipse cx="250" cy="190" rx="165" ry="115" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="6,4" />
                <text x="250" y="325" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle">Concourse Loop Level 1</text>

                {/* 3. Seating Bowls (Inner rings) */}
                {/* Outer Bowl */}
                <ellipse cx="250" cy="190" rx="135" ry="92" fill="none" stroke="#0e172c" strokeWidth="16" />
                <ellipse cx="250" cy="190" rx="135" ry="92" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
                
                {/* VIP Suites ring */}
                <ellipse cx="250" cy="190" rx="112" ry="73" fill="none" stroke="#0c111d" strokeWidth="6" />
                <ellipse cx="250" cy="190" rx="112" ry="73" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.25" />
                <text x="250" y="125" fill="#b45309" fontSize="6" fontWeight="bold" textAnchor="middle" opacity="0.8">VIP LOUNGE SUITES</text>

                {/* Inner Bowl */}
                <ellipse cx="250" cy="190" rx="90" ry="58" fill="none" stroke="#090d16" strokeWidth="14" />
                <ellipse cx="250" cy="190" rx="90" ry="58" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.25" />

                {/* 4. Soccer Field/Pitch */}
                <rect x="200" y="160" width="100" height="60" fill="#042f1a" stroke="#10b981" strokeWidth="1.5" opacity="0.75" />
                <circle cx="250" cy="190" r="14" fill="none" stroke="#10b981" strokeWidth="1.2" />
                <line x1="250" y1="160" x2="250" y2="220" stroke="#10b981" strokeWidth="1.2" />
                
                {/* Goal boxes */}
                <rect x="200" y="177" width="8" height="26" fill="none" stroke="#10b981" strokeWidth="1.2" />
                <rect x="292" y="177" width="8" height="26" fill="none" stroke="#10b981" strokeWidth="1.2" />

                {/* 5. Entrances & Gates */}
                {/* Gate 4 (North Entrance) */}
                <g className="cursor-pointer" onClick={() => setActiveHighlight('seat')}>
                  <rect x="235" y="40" width="30" height="12" rx="2" fill="#080e1a" stroke="#0284c7" strokeWidth="1" />
                  <text x="250" y="49" fill="#0284c7" fontSize="7" fontWeight="black" textAnchor="middle">GATE 4</text>
                  <line x1="250" y1="52" x2="250" y2="60" stroke="#0284c7" strokeWidth="1" strokeDasharray="2,2" />
                </g>

                {/* Gate 2 (West Entrance) */}
                <g>
                  <rect x="35" y="184" width="30" height="12" rx="2" fill="#080e1a" stroke="#334155" strokeWidth="1" />
                  <text x="50" y="193" fill="#64748b" fontSize="7" fontWeight="bold" textAnchor="middle">GATE 2</text>
                </g>

                {/* Gate 3 (East Entrance) */}
                <g>
                  <rect x="435" y="184" width="30" height="12" rx="2" fill="#080e1a" stroke="#334155" strokeWidth="1" />
                  <text x="450" y="193" fill="#64748b" fontSize="7" fontWeight="bold" textAnchor="middle">GATE 3</text>
                </g>

                {/* Gate 1 (South Entrance) */}
                <g>
                  <rect x="235" y="328" width="30" height="12" rx="2" fill="#080e1a" stroke="#334155" strokeWidth="1" />
                  <text x="250" y="337" fill="#64748b" fontSize="7" fontWeight="bold" textAnchor="middle">GATE 1</text>
                </g>

                {/* Seating Section Labels */}
                <text x="250" y="90" fill="#38bdf8" fontSize="8" fontWeight="black" textAnchor="middle">SEC 102</text>
                <text x="250" y="298" fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle">SEC 116</text>
                <text x="130" y="194" fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle">SEC 108</text>
                <text x="370" y="194" fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle">SEC 124</text>

                {/* 6. Concourse Landmarks & Emergency Exits */}
                {/* Food Court */}
                <circle cx="340" cy="115" r="9" fill="#090d16" stroke="#d97706" strokeWidth="1" />
                <Coffee className="h-3 w-3 text-amber-500" x="334" y="109" />
                <text x="340" y="131" fill="#d97706" fontSize="6.5" fontWeight="bold" textAnchor="middle">Concessions A</text>

                {/* Restrooms */}
                <circle cx="160" cy="115" r="9" fill="#090d16" stroke="#10b981" strokeWidth="1" />
                <HelpCircle className="h-3 w-3 text-emerald-500" x="154" y="109" />
                <text x="160" y="131" fill="#10b981" fontSize="6.5" fontWeight="bold" textAnchor="middle">Restrooms West</text>

                {/* Medical Center */}
                <circle cx="385" cy="245" r="9" fill="#090d16" stroke="#ef4444" strokeWidth="1" />
                <ShieldAlert className="h-3 w-3 text-rose-500" x="379" y="239" />
                <text x="385" y="261" fill="#ef4444" fontSize="6.5" fontWeight="bold" textAnchor="middle">Medical Pod 2</text>

                {/* Merchandise */}
                <circle cx="120" cy="250" r="9" fill="#090d16" stroke="#8b5cf6" strokeWidth="1" />
                <text x="120" y="253" fill="#8b5cf6" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">🛍️</text>
                <text x="120" y="266" fill="#8b5cf6" fontSize="6.5" fontWeight="bold" textAnchor="middle">Fan Shop</text>

                {/* Emergency Exit */}
                <g>
                  <line x1="420" y1="120" x2="445" y2="120" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />
                  <text x="450" y="115" fill="#ef4444" fontSize="6.5" fontWeight="bold">EMERGENCY EXIT</text>
                </g>

                {/* 7. Interactive Path Routing */}
                {/* Gate 4 to SEC 102 Path (Seat) */}
                {activeHighlight === 'seat' && (
                  <>
                    <path d="M 250,52 Q 250,75 250,82" fill="none" stroke="#22d3ee" strokeWidth="2.5" className="animate-flow" />
                    <circle cx="250" cy="82" r="5" className="fill-cyan-500 text-cyan-400 animate-ping" />
                    <circle cx="250" cy="82" r="3.5" className="fill-cyan-500" />
                  </>
                )}

                {/* Gate 4 to Concessions Path */}
                {activeHighlight === 'food' && (
                  <>
                    <path d="M 250,52 C 290,52 330,85 340,106" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="animate-flow" />
                    <circle cx="340" cy="115" r="14" fill="none" stroke="#f59e0b" strokeWidth="1" className="animate-ping" />
                  </>
                )}

                {/* Gate 4 to Restrooms Path */}
                {activeHighlight === 'restroom' && (
                  <>
                    <path d="M 250,52 C 210,52 170,85 160,106" fill="none" stroke="#10b981" strokeWidth="2.5" className="animate-flow" />
                    <circle cx="160" cy="115" r="14" fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping" />
                  </>
                )}

                {/* Gate 4 to Medical Pod Path */}
                {activeHighlight === 'medical' && (
                  <>
                    <path d="M 250,52 C 340,52 385,150 385,236" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-flow" />
                    <circle cx="385" cy="245" r="14" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                  </>
                )}
              </svg>

              {/* Map Legend Overlay */}
              <div className="absolute bottom-4 left-4 z-10 rounded border border-slate-900 bg-[#080d19]/95 px-3 py-2 text-[10px] text-slate-400 flex flex-col gap-1.5 shadow-xl">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
                  <span>Visitor Entrance (Gate 4)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shadow-md shadow-amber-500/50" />
                  <span>Concessions / Food court</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
                  <span>Restrooms Loop</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 shadow-md shadow-rose-500/50" />
                  <span>Medical Center</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 text-center">
              <Info className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Interactive Navigation Mesh active. GPS waypoint calculations simulate spectator routes from recommended gates.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
