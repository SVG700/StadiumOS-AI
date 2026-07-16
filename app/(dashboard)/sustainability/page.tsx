'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStadium } from '@/components/stadium/StadiumContext';
import { 
  Leaf, Sun, Droplet, Zap, BatteryCharging, 
  Trash2, ShieldCheck, BarChart3, TrendingDown, Wind, Download
} from 'lucide-react';

export default function SustainabilityPage() {
  const { user } = useAuth();
  const { selectedStadium } = useStadium();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !user) return null;

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-900/30 border border-emerald-950/30">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-400" />
            FIFA Sustainability Analytics
          </h2>
          <p className="text-sm text-slate-400">Matchday environmental metrics & executive ESG carbon auditing for {selectedStadium.name}.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="px-3 py-1 uppercase tracking-widest text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/20">
            LEED PLATINUM CERTIFIED
          </Badge>
          <Button variant="outline" size="sm" className="text-xs border-slate-800 bg-[#070b13] text-slate-300 gap-1.5 cursor-pointer">
            <Download className="h-3.5 w-3.5" /> Export ESG Report
          </Button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Renewable Energy Usage */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Renewable Energy Ratio</CardTitle>
            <Sun className="h-4.5 w-4.5 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">86.2%</div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <span>↑</span> +1.4% since last matchday
            </p>
          </CardContent>
        </Card>

        {/* Stadium Power Consumption */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Power Demand</CardTitle>
            <Zap className="h-4.5 w-4.5 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">4,200 kW</div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">Peak load capacity: 6,000 kW</p>
          </CardContent>
        </Card>

        {/* Carbon Saved Today */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Carbon Offset Today</CardTitle>
            <Leaf className="h-4.5 w-4.5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">15.4 Tons CO₂</div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> Diverted via smart transit & solar
            </p>
          </CardContent>
        </Card>

        {/* ESG Compliance Score */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">ESG Compliance Score</CardTitle>
            <ShieldCheck className="h-4.5 w-4.5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">96 / 100 <span className="text-xs text-purple-400 font-bold ml-1">Rank A+</span></div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">FIFA Sustainability Standard</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Energy & Storage telemetry */}
        <div className="md:col-span-1 space-y-6">
          {/* Generation & Storage */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <BatteryCharging className="h-4.5 w-4.5 text-cyan-400" />
                Grid Microgeneration
              </CardTitle>
              <CardDescription className="text-xs">Solar arrays & local storage capacity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs pt-2">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-amber-500" /> Solar Canopy Generation
                </span>
                <Badge variant="success">3,600 kW</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-cyan-500" /> Wind Harvester Cell
                </span>
                <Badge variant="success">600 kW</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Tesla MegaPack Storage</span>
                <Badge variant="cyan" className="font-mono">98% (1,500 kWh)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Grid Return Rate</span>
                <span className="font-bold text-white">240 kW net feed</span>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Conservation */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <Droplet className="h-4.5 w-4.5 text-blue-400" />
                Resource Conservation
              </CardTitle>
              <CardDescription className="text-xs">Water collection & smart building metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="p-3 rounded-lg border border-slate-800 bg-[#070b13]/40 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-white">
                  <span>Rainwater Harvester</span>
                  <Badge variant="success">12,400 L saved</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Used for graywater plumbing throughout North and East concourses.</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-800 bg-[#070b13]/40 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-white">
                  <span>HVAC Smart Ventilation</span>
                  <Badge variant="cyan">94.8% Efficiency</Badge>
                </div>
                <p className="text-[10px] text-slate-400">CO₂ sensors automatically modulate air replacement rates by sector.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Waste auditing & Carbon breakdown */}
        <div className="md:col-span-2 space-y-6">
          {/* Material Redirection Audit */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                  <Trash2 className="h-4.5 w-4.5 text-emerald-400" />
                  Waste Redirection Audits
                </CardTitle>
                <CardDescription className="text-xs">Recycling diversion quotas & compost metrics</CardDescription>
              </div>
              <Badge variant="cyan" className="font-mono">Global Recycling Rate: 78.4%</Badge>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-2">
              {[
                { name: 'Organic Food Waste Composting', weight: '840 kg diverted', status: 'Stable', percent: 75, badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' },
                { name: 'PET Plastic Bottle Reclamation', weight: '420 kg diverted', status: 'Stable', percent: 45, badgeColor: 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' },
                { name: 'Aluminum Cup Reclamation Pods', weight: '220 kg diverted', status: 'Stable', percent: 30, badgeColor: 'bg-blue-950 text-blue-400 border border-blue-500/20' },
                { name: 'General Non-Recyclable Waste', weight: '1,200 kg processed', status: 'Near Capacity', percent: 90, badgeColor: 'bg-rose-950 text-rose-400 border border-rose-500/20' }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/20 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Audit Weight: {item.weight}</p>
                    </div>
                    <Badge className={`text-[9px] uppercase tracking-wider ${item.badgeColor}`}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.percent > 80 ? 'bg-rose-500' : item.percent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Operational emissions telemetry */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <BarChart3 className="h-4.5 w-4.5 text-cyan-400" />
                Carbon Footprint Summary
              </CardTitle>
              <CardDescription className="text-xs">Real-time Scope 1 & Scope 2 carbon footprint logging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-3 text-center">
                <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Scope 1 (Direct)</span>
                  <span className="text-lg font-black text-white">0.42 tCO₂e/h</span>
                  <span className="block text-[8px] text-emerald-400 font-mono mt-0.5">HVAC & generators</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Scope 2 (Indirect)</span>
                  <span className="text-lg font-black text-white">0.78 tCO₂e/h</span>
                  <span className="block text-[8px] text-cyan-400 font-mono mt-0.5">Imported grid power</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Total Emissions</span>
                  <span className="text-lg font-black text-slate-300">1.20 tCO₂e/h</span>
                  <span className="block text-[8px] text-amber-500 font-mono mt-0.5">Net zero target: 0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
