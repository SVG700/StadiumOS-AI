'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStadium } from '@/components/stadium/StadiumContext';
import { 
  Ticket, Bus, Bot, Leaf, QrCode, Compass, Coffee, Trophy, Info, Sun
} from 'lucide-react';
import Link from 'next/link';
import { AnimatedNumber } from '@/components/stadium/AnimatedNumber';

export default function VisitorDashboard() {
  const { user } = useAuth();
  const { selectedStadium } = useStadium();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500" />
      </div>
    );
  }

  const { match, weather } = selectedStadium;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-slate-900/40 border border-cyan-950/40">
        <div>
          <h2 className="text-2xl font-black text-white">Welcome back, {user.name}!</h2>
          <p className="text-sm text-slate-400">Visitor Portal • StadiumOS Fan Companion</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="cyan" className="px-3 py-1 uppercase tracking-widest text-[10px]">
            Spectator Clearance
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 font-mono text-[10px] text-slate-400 border-slate-800">
            Seat: SEC 102 | ROW H | SEAT 14
          </Badge>
        </div>
      </div>

      {/* Global Match Center & Live Weather Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Match Center Card (Fan View) */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl rounded-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Trophy className="h-4.5 w-4.5 text-amber-400" />
                Global Match Center
              </span>
              <Badge variant="warning" className="text-[9px] uppercase tracking-wider font-mono">{match.stage}</Badge>
            </CardTitle>
            <CardDescription className="text-xs">{selectedStadium.name} Matchday Telemetry</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between text-center bg-slate-950/40 border border-slate-900 rounded-xl p-4">
              <div className="flex-1">
                <span className="text-2xl font-black block text-white">{match.teamA.substring(0,3).toUpperCase()}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{match.teamA}</span>
              </div>
              <div className="px-4">
                <span className="text-[9px] font-mono font-bold text-cyan-400 block mb-1">KICKOFF COUNTDOWN</span>
                <Badge variant="secondary" className="font-mono text-xs py-0.5 px-2 bg-blue-950/80 text-blue-300 border border-blue-800/40">{match.kickoff}</Badge>
              </div>
              <div className="flex-1">
                <span className="text-2xl font-black block text-white">{match.teamB.substring(0,3).toUpperCase()}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{match.teamB}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider mb-0.5">Match Officials</span>
                <span className="text-slate-200 font-bold">Referee: {match.referee}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider mb-0.5">Stadium Seating</span>
                <span className="text-slate-200 font-bold"><AnimatedNumber value={match.attendance} /> Attendance</span>
              </div>
            </div>

            {/* Fan Comfort Advisory */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-900/30 bg-amber-950/10 text-xs">
              <Info className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-400 block">AI Seating Advisory</span>
                <p className="text-slate-300 leading-relaxed">
                  Your seat (**Section 102**) is located in the **West Stand lower tier**. Gates 3 and 4 provide the fastest access paths. Average queue wait times: 4 minutes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Card (Fan View) */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Sun className="h-4.5 w-4.5 text-amber-400" />
              Live Weather Sensor
            </CardTitle>
            <CardDescription className="text-xs">Real-time local atmosphere sensors</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center text-center p-4 rounded-xl border border-slate-900 bg-slate-950/50">
              <div className="flex-1">
                <span className="text-3xl font-black text-white"><AnimatedNumber value={weather.temp} />°C</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Temperature</span>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="flex-1">
                <span className="text-lg font-bold text-cyan-400 font-mono">{weather.uv} / 10</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">UV Index</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-center">
              <div className="p-2 rounded border border-slate-800 bg-[#070b13]/20">
                <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider">Wind</span>
                <span className="text-white font-bold">{weather.wind} km/h</span>
              </div>
              <div className="p-2 rounded border border-slate-800 bg-[#070b13]/20">
                <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider">Precipitation</span>
                <span className="text-white font-bold">{weather.rainProb}%</span>
              </div>
            </div>

            {/* Weather-driven hydration warning */}
            <div className={`p-3 rounded-lg border text-[11px] leading-relaxed flex gap-2 items-start ${
              weather.temp >= 30 
                ? 'border-amber-900/30 bg-amber-950/15 text-amber-400' 
                : 'border-slate-800 bg-slate-950/30 text-slate-400'
            }`}>
              {weather.temp >= 30 ? (
                <>
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>🔥 **Heat Advisory**: Temperatures are high. Please use available sunscreen dispensers and locate hydration stations at Sections 102 and 108.</span>
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>✓ Climate conditions are ideal for kick-off. No weather warnings in effect.</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/navigation" className="block group">
          <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/10 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Indoor Navigation</CardTitle>
              <Compass className="h-4.5 w-4.5 text-cyan-400 group-hover:animate-spin" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 mt-1">Locate your seat, exits, restrooms, and concessions loop paths.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transport" className="block group">
          <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-950/10 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Shuttle & Metro Times</CardTitle>
              <Bus className="h-4.5 w-4.5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 mt-1">Real-time express shuttle transfers, transit timetables, and parking status.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/assistant" className="block group">
          <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-950/10 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Concierge Assistant</CardTitle>
              <Bot className="h-4.5 w-4.5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 mt-1">Chat naturally with the Copilot to find seats or request support.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sustainability" className="block group">
          <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/10 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Eco-Rewards Hub</CardTitle>
              <Leaf className="h-4.5 w-4.5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 mt-1">Participate in carbon recycling challenges to unlock FIFA rewards.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* MATCH TICKET PREVIEW & CONCESSIONS PROMO */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Digital Match Ticket */}
        <Card className="bg-gradient-to-r from-blue-950/50 to-slate-950 border-slate-900 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent blur-2xl rounded-full" />
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Ticket className="h-4.5 w-4.5 text-cyan-400" />
              Your Digital Match Ticket
            </CardTitle>
            <CardDescription className="text-xs">Present QR code at Gate 4 scanning turnstiles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6 pb-6">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0">
              <QrCode className="h-28 w-28 text-slate-950" />
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[9px]">Event</span>
                <span className="text-white font-bold">FIFA World Cup 2026 Quarter Final</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block uppercase font-mono text-[9px]">Section</span>
                  <span className="text-white font-black">SEC 102</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-mono text-[9px]">Row</span>
                  <span className="text-white font-black">ROW H</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-mono text-[9px]">Seat</span>
                  <span className="text-white font-black">SEAT 14</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[9px]">Entry Gate</span>
                <span className="text-cyan-400 font-bold">Gate 4 turnstiles (North Concourse)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Concessions Promo */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-amber-400">
              <Coffee className="h-4.5 w-4.5" />
              Express Concessions Pre-Ordering
            </CardTitle>
            <CardDescription className="text-xs">Order hotdogs and pretzels online to skip match queues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Order concessions via **Fan Companion pre-order link** and collect them from the designated **Express Pickup Counter** in Section 102 at halftime.
            </p>
            <div className="flex gap-2">
              <Link href="/navigation?target=food" className="flex-1">
                <Button className="w-full text-xs bg-slate-900 hover:bg-[#0f172a] text-cyan-400 border border-slate-800 cursor-pointer h-9">
                  Locate Food Pods
                </Button>
              </Link>
              <Button className="flex-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer h-9">
                Pre-Order pre-match Snacks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
