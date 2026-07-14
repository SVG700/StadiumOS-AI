'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Leaf, Sun, Wind, Trash2, Droplet, CheckCircle, Award, Compass, 
  Bus, Info, Calendar, Sparkles, MapPin, Coffee, HelpCircle, Trophy
} from 'lucide-react';

export default function SustainabilityPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [points, setPoints] = useState(3);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const isVisitor = user.role === 'visitor' || user.role === 'fan';

  const handleScanBottleCode = () => {
    if (scanned) return;
    setPoints(prev => prev + 1);
    setScanned(true);
    setTimeout(() => setScanned(false), 8000);
  };

  // --- RENDER 1: VISITOR PORTAL VIEW (GREEN STADIUM) ---
  if (isVisitor) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-950/40">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Leaf className="h-6 w-6 text-emerald-400" />
              Green Stadium Hub
            </h2>
            <p className="text-sm text-slate-400">Doing our part for a sustainable FIFA World Cup 2026.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="px-3 py-1 uppercase tracking-widest text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              FIFA Five-Star Rated
            </Badge>
            <Badge variant="cyan" className="px-3 py-1 uppercase tracking-widest text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              Carbon Neutral Match
            </Badge>
          </div>
        </div>

        {/* Top score & certification overview */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Circular Eco-Score Ring */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 text-center flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/5 to-transparent blur-2xl rounded-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-center gap-1.5 text-slate-300">
                <Trophy className="h-4.5 w-4.5 text-amber-500" />
                Stadium Eco Score
              </CardTitle>
              <CardDescription className="text-xs">Certified LEED Platinum Standard</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="relative inline-flex items-center justify-center">
                {/* SVG circular progress ring */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="50" strokeWidth="8" stroke="#1e293b" fill="transparent" />
                  <circle cx="64" cy="64" r="50" strokeWidth="8" stroke="#10b981" fill="transparent"
                    strokeDasharray="314" strokeDashoffset="18" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-black">94</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">out of 100</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-emerald-400 font-semibold">Excellent Ecological Performance</p>
            </CardContent>
          </Card>

          {/* BYOB (Bring Your Own Bottle) Rewards */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <Droplet className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                BYOB Eco Rewards
              </CardTitle>
              <CardDescription className="text-xs">Bring your bottle, refill at stations, earn free eco-cups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
              <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Your Refill Points</span>
                <span className="text-3xl font-black text-white">{points} <span className="text-xs text-slate-400 font-normal">pts</span></span>
                <span className="block text-[9px] text-cyan-400 mt-1">5 points required for collectible EcoCup</span>
              </div>

              {scanned && (
                <div className="text-[10px] text-center text-emerald-400 bg-emerald-950/20 border border-emerald-800/30 p-2 rounded-lg">
                  🎉 Code scanned! +1 Eco-point added.
                </div>
              )}

              <Button
                onClick={handleScanBottleCode}
                disabled={scanned}
                className="w-full text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-9 shrink-0 cursor-pointer"
              >
                Scan Refill Station QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Transit Carbon Savings */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent blur-2xl rounded-full" />
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <Bus className="h-4.5 w-4.5 text-blue-400" />
                Transit Carbon Savings
              </CardTitle>
              <CardDescription className="text-xs">Your transit offset index vs driving</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-1 flex-1 flex flex-col justify-between">
              <div className="p-3 rounded-lg border border-slate-900 bg-[#070b13]/40 text-xs">
                <div className="flex justify-between items-center font-bold mb-1 text-slate-200">
                  <span>Carbon Diversion</span>
                  <Badge variant="success" className="text-[9px]">1.8 kg CO2</Badge>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  By arriving via the Metro link shuttle instead of a personal vehicle, you diverted significant emissions today.
                </p>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center gap-2 p-2 rounded bg-slate-950/20 border border-slate-900">
                <span className="text-amber-500 text-xs">🎁</span>
                <span>Show transit pass at concession pods for 10% eco-discount.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Eco Map Finders & tips */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recycling & Water Refills Finder */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <MapPin className="h-4.5 w-4.5 text-emerald-400" />
                Eco Facility Locator
              </CardTitle>
              <CardDescription className="text-xs">Ditch single-use items. Access green resources instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {[
                { title: 'Smart Water Refills (North Stands)', details: '4 stations near Gate 4 Concourse', icon: '💧', status: 'Active (Free)' },
                { title: 'Organic Composting Pods', details: 'Located at all concession food courts', icon: '♻️', status: 'Capacity: Stable' },
                { title: 'Plastic Reclamation Bays', details: 'Divert plastic caps at Sections 102 & 108', icon: '🥤', status: 'Points reward active' },
                { title: 'Green Volunteers Pod', details: 'Green-vested helpers stationed near Gate 1/4 info desks', icon: '👕', status: 'On-duty support' }
              ].map((pod, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-900 bg-slate-950/30 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-lg bg-slate-900 p-1.5 rounded-lg border border-slate-800">{pod.icon}</span>
                    <div>
                      <h4 className="font-bold text-white leading-tight">{pod.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{pod.details}</p>
                    </div>
                  </div>
                  <Badge variant="cyan" className="text-[9px] font-mono">
                    {pod.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Eco Tips for Fans */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <Sparkles className="h-4.5 w-4.5 text-amber-400" />
                Spectator Green Guide
              </CardTitle>
              <CardDescription className="text-xs">Follow these simple practices on matchday</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {[
                { title: 'Use Digital Match Passes Only', desc: 'Saves over 85g of paper waste per visitor. Thank you for scanning via mobile device.' },
                { title: 'Return Collectible Cups', desc: 'Concession cups are recyclable. Deposit them back to reclaim points or save resources.' },
                { title: 'Use Low-Emission Transit Links', desc: 'Regional express buses, shuttles, and metro trains are fully powered by green grid electricity.' },
                { title: 'Leverage Composting Pods', desc: 'Keep organic materials separate from plastic bottles to maintain our 98% recycling redirection rate.' }
              ].map((tip, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-900 bg-slate-950/20 text-xs space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-cyan-400 text-xs">#0{idx+1}</span>
                    {tip.title}
                  </h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Live sustainability achievements */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.03),transparent)] pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Calendar className="h-4.5 w-4.5 text-cyan-400" />
              Live Tournament Eco Impact
            </CardTitle>
            <CardDescription className="text-xs">Real-time cumulative achievements for matchday operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 text-center pt-2">
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/50">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Bottles Reclaimed</span>
              <span className="text-2xl font-black text-white">48,204</span>
              <span className="block text-[8px] text-emerald-400 mt-1 font-mono">Diverted from Landfill</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/50">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Water Reclaimed</span>
              <span className="text-2xl font-black text-white">324,500 <span className="text-xs font-normal text-slate-400">L</span></span>
              <span className="block text-[8px] text-cyan-400 mt-1 font-mono">Toilet Pod Graywater</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/50">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">CO2 Diverted</span>
              <span className="text-2xl font-black text-white">124.8 <span className="text-xs font-normal text-slate-400">Tons</span></span>
              <span className="block text-[8px] text-amber-400 mt-1 font-mono">Via Transit Links</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDER 2: STAFF & FIFA VIEW (SUSTAINABILITY LEDGER) ---
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-white">Sustainability Ledger</h2>
        <p className="text-sm text-slate-400">Solar canopy inputs, waste redirection, and water preservation auditing.</p>
      </div>

      {/* Grid of details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Energy Grid */}
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-emerald-400">
                <Sun className="h-4 w-4" />
                Stadium Clean Grid
              </CardTitle>
              <CardDescription className="text-xs">Real-time solar & battery load</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Solar Canopy Output</span>
                <Badge variant="success">3,600 kW</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Wind Cell Storage</span>
                <Badge variant="success">600 kW</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Renewable energy ratio</span>
                <Badge variant="cyan">86%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Grid Reserve Batteries</span>
                <Badge variant="success">98% Charged</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                <Droplet className="h-4 w-4" />
                Water Conservation
              </CardTitle>
              <CardDescription className="text-xs">Rainwater harvesting and low-flow audits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded border border-slate-800 bg-[#070b13]/40">
                <div className="flex justify-between items-center font-bold text-white mb-0.5">
                  <span>Rainwater Reservoirs</span>
                  <Badge variant="success">12,400 L saved</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Supplying graywater systems across toilet pods in South/East stands.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Waste redirection audits */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Trash2 className="h-4 w-4 text-cyan-400" />
                Waste Recycling Quotas
              </CardTitle>
              <CardDescription className="text-xs">Live bin fill weights and composting metrics</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-slate-800 bg-[#0c101d] text-slate-300">
              Audit Materials
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-slate-900/60 pt-4">
            {[
              { id: '1', bin: 'Organic Composting Pods (Concourse Level 1)', type: 'Compost Bin', weight: '840 kg', status: '75% Capacity' },
              { id: '2', bin: 'Plastic Bottle Reclamation Bays (Gate 2)', type: 'Recycling Bin', weight: '420 kg', status: '45% Capacity' },
              { id: '3', bin: 'Aluminum Can Redirection Unit (Gate 5)', type: 'Recycling Bin', weight: '220 kg', status: '30% Capacity' },
              { id: '4', bin: 'General Trash Redirection Pods', type: 'Incinerator Fuel', weight: '1,200 kg', status: '90% Capacity' }
            ].map((pod) => (
              <div key={pod.id} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-800 bg-[#080d19]/35 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-emerald-400">
                    <CheckCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{pod.bin}</h4>
                    <p className="text-[10px] text-slate-500">{pod.type} • Weight: {pod.weight}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block text-sm">{pod.status}</span>
                  <Badge variant={parseInt(pod.status) > 80 ? 'destructive' : parseInt(pod.status) > 60 ? 'warning' : 'success'}>
                    {parseInt(pod.status) > 80 ? 'requires service' : 'stable'}
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
