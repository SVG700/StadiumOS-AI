'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Map, Navigation, Locate, Compass, Info, ShieldAlert, DoorOpen, Shield, ShieldCheck
} from 'lucide-react';

export default function SmartNavigationPage() {
  useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<'medical' | 'gates' | 'exits' | 'corridors' | null>(null);
  
  const [beaconStatus, setBeaconStatus] = useState({
    beacons: 'Online (420/420)',
    sensors: 'Online (32/32)',
    elevators: 'Online (16/16)',
    signage: 'Broadcasting (124)'
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);

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
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Staff Navigation & Perimeter Map</h2>
        <p className="text-xs text-slate-400">Tactical stadium map, medical pods, gates, emergency exit routes, and staff corridors.</p>
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
      <div className="grid gap-5 md:grid-cols-3">
        {/* Left Side: Staff Navigation Controls & Telemetry */}
        <div className="space-y-4">
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="py-3 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-white">
                <Navigation className="h-4 w-4 text-cyan-400" />
                Staff Operational Routing
              </CardTitle>
              <CardDescription className="text-[10px]">Select sector to highlight tactical access path</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button
                variant={activeHighlight === 'medical' ? 'default' : 'outline'}
                onClick={() => setActiveHighlight('medical')}
                className={`w-full justify-start text-xs border-slate-800 cursor-pointer ${
                  activeHighlight === 'medical' ? 'bg-rose-700 text-white' : 'bg-[#0c101d] text-slate-300 hover:text-white'
                }`}
              >
                <ShieldAlert className="mr-2 h-4 w-4 text-rose-400" />
                <span>Medical Pods & Trauma Hubs</span>
              </Button>

              <Button
                variant={activeHighlight === 'gates' ? 'default' : 'outline'}
                onClick={() => setActiveHighlight('gates')}
                className={`w-full justify-start text-xs border-slate-800 cursor-pointer ${
                  activeHighlight === 'gates' ? 'bg-cyan-600 text-white' : 'bg-[#0c101d] text-slate-300 hover:text-white'
                }`}
              >
                <DoorOpen className="mr-2 h-4 w-4 text-cyan-400" />
                <span>Gates & Turnstile Lines</span>
              </Button>

              <Button
                variant={activeHighlight === 'exits' ? 'default' : 'outline'}
                onClick={() => setActiveHighlight('exits')}
                className={`w-full justify-start text-xs border-slate-800 cursor-pointer ${
                  activeHighlight === 'exits' ? 'bg-amber-600 text-white' : 'bg-[#0c101d] text-slate-300 hover:text-white'
                }`}
              >
                <Shield className="mr-2 h-4 w-4 text-amber-400" />
                <span>Emergency Exit Corridors</span>
              </Button>

              <Button
                variant={activeHighlight === 'corridors' ? 'default' : 'outline'}
                onClick={() => setActiveHighlight('corridors')}
                className={`w-full justify-start text-xs border-slate-800 cursor-pointer ${
                  activeHighlight === 'corridors' ? 'bg-emerald-600 text-white' : 'bg-[#0c101d] text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="mr-2 h-4 w-4 text-emerald-400" />
                <span>Staff-Only Secured Passages</span>
              </Button>

              {activeHighlight && (
                <Button
                  variant="ghost"
                  onClick={() => setActiveHighlight(null)}
                  className="w-full text-xs text-slate-400 hover:text-white mt-1 border border-dashed border-slate-800 cursor-pointer"
                >
                  Clear Highlighted Routes
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="py-3 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-cyan-400">
                <Compass className="h-4 w-4" />
                Node Sensor Status
              </CardTitle>
              <CardDescription className="text-[10px]">Staff RFID & UWB network</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Concourse Beacons</span>
                <Badge variant="success" className="text-[8px]">{beaconStatus.beacons}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">UWB Gate Readers</span>
                <Badge variant="success" className="text-[8px]">{beaconStatus.sensors}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Elevator Nodes</span>
                <Badge variant="success" className="text-[8px]">{beaconStatus.elevators}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center/Right: Interactive Stadium Floorplan Map */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60 flex flex-col min-h-[460px]">
          <CardHeader className="py-3 px-4 flex flex-row justify-between items-center border-b border-slate-900/40">
            <div>
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-white">
                <Map className="h-4 w-4 text-cyan-400" />
                Tactical Stadium Operations Floorplan
              </CardTitle>
              <CardDescription className="text-[10px]">Restricted Operations & Security Sector Overview</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveHighlight(null)}
              className="text-xs border-slate-800 bg-[#0c101d] text-slate-300 flex gap-1.5 items-center cursor-pointer"
            >
              <Locate className="h-3.5 w-3.5 text-cyan-400" />
              <span>Center Floorplan</span>
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col items-center justify-center p-4 border-t border-slate-900 bg-slate-950/20">
            {/* Interactive SVG Map */}
            <div className="relative w-full max-w-2xl aspect-[4/3] border border-blue-900/30 rounded-xl bg-slate-950/70 p-4 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950 pointer-events-none" />
              
              <svg className="w-full h-full relative z-10 text-cyan-500/20 max-h-[380px]" viewBox="0 0 500 380">
                {/* Outer Perimeter */}
                <ellipse cx="250" cy="190" rx="200" ry="140" fill="none" stroke="#1e293b" strokeWidth="3" />
                
                {/* Concourse Corridor */}
                <ellipse cx="250" cy="190" rx="165" ry="115" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="6,4" />
                <text x="250" y="325" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle">Main Concourse Loop</text>

                {/* Staff-Only Corridor Loop */}
                {activeHighlight === 'corridors' && (
                  <ellipse cx="250" cy="190" rx="180" ry="125" fill="none" stroke="#10b981" strokeWidth="2.5" className="animate-flow" />
                )}

                {/* Seating Bowls */}
                <ellipse cx="250" cy="190" rx="135" ry="92" fill="none" stroke="#0e172c" strokeWidth="16" />
                <ellipse cx="250" cy="190" rx="112" ry="73" fill="none" stroke="#0c111d" strokeWidth="6" />

                {/* Pitch */}
                <rect x="200" y="160" width="100" height="60" fill="#042f1a" stroke="#10b981" strokeWidth="1.5" opacity="0.75" />
                <circle cx="250" cy="190" r="14" fill="none" stroke="#10b981" strokeWidth="1.2" />
                <line x1="250" y1="160" x2="250" y2="220" stroke="#10b981" strokeWidth="1.2" />

                {/* Gates */}
                <g className={activeHighlight === 'gates' ? 'opacity-100' : 'opacity-75'}>
                  <rect x="235" y="40" width="30" height="12" rx="2" fill="#080e1a" stroke={activeHighlight === 'gates' ? '#06b6d4' : '#0284c7'} strokeWidth="1.5" />
                  <text x="250" y="49" fill="#0284c7" fontSize="7" fontWeight="black" textAnchor="middle">GATE 4</text>
                  
                  <rect x="35" y="184" width="30" height="12" rx="2" fill="#080e1a" stroke={activeHighlight === 'gates' ? '#06b6d4' : '#334155'} strokeWidth="1.5" />
                  <text x="50" y="193" fill="#64748b" fontSize="7" fontWeight="bold" textAnchor="middle">GATE 2</text>

                  <rect x="435" y="184" width="30" height="12" rx="2" fill="#080e1a" stroke={activeHighlight === 'gates' ? '#06b6d4' : '#334155'} strokeWidth="1.5" />
                  <text x="450" y="193" fill="#64748b" fontSize="7" fontWeight="bold" textAnchor="middle">GATE 3</text>

                  <rect x="235" y="328" width="30" height="12" rx="2" fill="#080e1a" stroke={activeHighlight === 'gates' ? '#06b6d4' : '#334155'} strokeWidth="1.5" />
                  <text x="250" y="337" fill="#64748b" fontSize="7" fontWeight="bold" textAnchor="middle">GATE 1</text>
                </g>

                {/* Medical Pods */}
                <circle cx="385" cy="245" r="9" fill="#090d16" stroke="#ef4444" strokeWidth={activeHighlight === 'medical' ? '2.5' : '1'} />
                <ShieldAlert className="h-3 w-3 text-rose-500" x="379" y="239" />
                <text x="385" y="261" fill="#ef4444" fontSize="6.5" fontWeight="bold" textAnchor="middle">Medical Pod 2</text>

                <circle cx="115" cy="120" r="9" fill="#090d16" stroke="#ef4444" strokeWidth={activeHighlight === 'medical' ? '2.5' : '1'} />
                <ShieldAlert className="h-3 w-3 text-rose-500" x="109" y="114" />
                <text x="115" y="136" fill="#ef4444" fontSize="6.5" fontWeight="bold" textAnchor="middle">Medical Pod 1</text>

                {/* Emergency Exits */}
                <g className={activeHighlight === 'exits' ? 'opacity-100' : 'opacity-70'}>
                  <line x1="420" y1="120" x2="445" y2="120" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,2" />
                  <text x="450" y="115" fill="#f59e0b" fontSize="6.5" fontWeight="bold">EMERGENCY EXIT E</text>

                  <line x1="55" y1="120" x2="80" y2="120" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,2" />
                  <text x="50" y="115" fill="#f59e0b" fontSize="6.5" fontWeight="bold">EMERGENCY EXIT W</text>
                </g>

                {/* Interactive Highlight Vectors */}
                {activeHighlight === 'medical' && (
                  <path d="M 250,52 C 340,52 385,150 385,236" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-flow" />
                )}
                {activeHighlight === 'gates' && (
                  <path d="M 250,52 L 250,328 M 50,190 L 435,190" fill="none" stroke="#06b6d4" strokeWidth="2" className="animate-flow" />
                )}
                {activeHighlight === 'exits' && (
                  <path d="M 250,52 C 400,52 440,80 440,115" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="animate-flow" />
                )}
              </svg>

              {/* Map Legend Overlay */}
              <div className="absolute bottom-4 left-4 z-10 rounded border border-slate-900 bg-[#080d19]/95 px-3 py-2 text-[10px] text-slate-400 flex flex-col gap-1 shadow-xl">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span>Gates & Access Points</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Medical Trauma Pods</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Emergency Exits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Staff Corridors</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 text-center">
              <Info className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Staff Wayfinding Mesh active. Security clearance routing enabled for operations personnel.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
