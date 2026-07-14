'use client';

import React, { useState } from 'react';
import { useStadium } from '@/components/stadium/StadiumContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Trophy, Globe, TrendingUp, Users, Shield, Leaf, DollarSign, Activity, RefreshCw, Landmark, 
  Sparkles, Clock, AlertTriangle, CheckCircle, Undo2, Sun, CloudRain, Wind, Droplets, Thermometer,
  ShieldCheck, Server, Database, Video, Radio, Cpu, Network, MapPin, Check
} from 'lucide-react';

export default function FifaBoardDashboard() {
  const { user } = useAuth();
  const { 
    stadiums, selectedStadiumId, selectedStadium, selectStadium,
    timeline, history, rollbackOperation
  } = useStadium();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'selected' | 'global'>('selected');

  // Broadcast and revenue telemetry
  const metrics = {
    totalAttendance: 612000,
    avgWaitTime: 4.2,
    medicalIncidents: 12,
    transitDelayPercent: 3,
    renewablePercent: 88,
    globalViewers: 124.5
  };

  const revenueData = [
    { day: 'Match 1', tickets: 2400000, food: 650000, merch: 420000 },
    { day: 'Match 2', tickets: 2850000, food: 720000, merch: 480000 },
    { day: 'Match 3', tickets: 3100000, food: 810000, merch: 560000 },
    { day: 'Match 4', tickets: 3600000, food: 950000, merch: 690000 },
    { day: 'Match 5', tickets: 4200000, food: 1100000, merch: 820000 },
  ];

  const handleRefreshClick = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Timeline Matches
  const matchesTimeline = [
    { id: 'yesterday', label: 'Yesterday', match: 'Mexico vs Japan', status: 'Completed', stadiumId: 'mexico-city' },
    { id: 'today', label: 'Today', match: 'Argentina vs Germany', status: 'LIVE', stadiumId: 'vancouver' },
    { id: 'tomorrow', label: 'Tomorrow', match: 'Brazil vs France', status: 'Upcoming', stadiumId: 'dallas' },
  ];

  const handleSelectTimelineMatch = (stadiumId: string) => {
    selectStadium(stadiumId);
  };

  // Helper for stadium health colors
  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'Excellent': return { bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40', dot: 'bg-emerald-400' };
      case 'Good': return { bg: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/40', dot: 'bg-cyan-400' };
      case 'Warning': return { bg: 'bg-amber-950/80 text-amber-400 border-amber-800/40', dot: 'bg-amber-400' };
      default: return { bg: 'bg-rose-950/80 text-rose-400 border-rose-800/40', dot: 'bg-rose-500' };
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      
      {/* ----------------------------------------------------
          1. EXECUTIVE DAILY BRIEFING BANNER
          ---------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-950/80 border border-slate-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl rounded-full" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="h-5.5 w-5.5 text-amber-400" />
              Welcome Back, Commissioner
            </h2>
            <p className="text-xs text-slate-400 leading-normal">
              FIFA World Cup 2026 Operations Briefing. Current telemetry matches are nominal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="warning" className="px-2.5 py-1 uppercase tracking-widest text-[9px] font-mono bg-amber-950/80 text-amber-400 border border-amber-500/20">
              FIFA Executive Command
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshClick} 
              disabled={refreshing}
              className="text-xs flex gap-1.5 items-center border-slate-800 bg-[#0c101d] text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync Dashboard</span>
            </Button>
          </div>
        </div>

        {/* Global Summary Grid */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-6 mt-6">
          {[
            { label: 'Total Attendance', val: metrics.totalAttendance.toLocaleString(), desc: 'Fans Admitted' },
            { label: 'Avg Wait Time', val: `${metrics.avgWaitTime} min`, desc: 'Turnstile Queue' },
            { label: 'Medical Calls', val: metrics.medicalIncidents, desc: 'Incidents Logged' },
            { label: 'Transit Delays', val: `${metrics.transitDelayPercent}%`, desc: 'System Delayed' },
            { label: 'Renewable Power', val: `${metrics.renewablePercent}%`, desc: 'Clean Grid Share' },
            { label: 'Global Viewers', val: `${metrics.globalViewers}M`, desc: 'Active Broadcasts' }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/50 text-center space-y-0.5">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">{item.label}</span>
              <span className="text-md font-black text-white block">{item.val}</span>
              <span className="text-[8px] text-slate-400 block font-mono">{item.desc}</span>
            </div>
          ))}
        </div>

        {/* Risk Highlight bar */}
        <div className="mt-4 p-3 rounded-lg border border-dashed border-rose-950/40 bg-rose-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-bold font-mono">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Highest Risk: Los Angeles Gate 5 approaching congestion.</span>
          </div>
          <span className="text-slate-400 font-mono text-[10.5px]">Suggested Action: Deploy Crowd Team Bravo.</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          2. TOURNAMENT MAP & STADIUMS CONTROL PANEL
          ---------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Animated pulse world map */}
        <Card className="lg:col-span-2 bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Globe className="h-4.5 w-4.5 text-cyan-400" />
                Live World Cup Stadium Map
              </span>
              <Badge variant="cyan" className="text-[9px] uppercase tracking-wider font-mono">Pulsing Markers Active</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Select any stadium to inspect real-time logs.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
            <div className="relative w-full aspect-[2/1] bg-slate-950/60 rounded-2xl border border-slate-900 overflow-hidden">
              
              {/* Grid Background representing map */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#334155_1.5px,transparent_1px)] [background-size:16px_16px]" />

              {/* Styled SVG Map Overlay */}
              <svg className="absolute inset-0 w-full h-full text-slate-800" fill="none" viewBox="0 0 800 400">
                {/* Stylized North American outline */}
                <path d="M120 80 L200 60 L320 80 L360 140 L450 160 L500 120 L580 180 L620 280 L580 320 L520 280 L460 330 L380 300 L320 340 L260 260 L200 240 L160 180 Z" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
              </svg>

              {/* Pulsing Stadium markers */}
              {stadiums.map((stadium) => {
                const isActive = stadium.id === selectedStadiumId;
                const status = getHealthBadge(stadium.stadiumHealth);
                return (
                  <button
                    key={stadium.id}
                    onClick={() => selectStadium(stadium.id)}
                    className="absolute group transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ left: `${stadium.xPercent}%`, top: `${stadium.yPercent}%` }}
                  >
                    <span className="absolute -inset-2 flex items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-4 w-4 rounded-full opacity-60 ${status.dot}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dot}`} />
                    </span>
                    
                    {/* Tooltip on hover */}
                    <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-[#0c1220] border rounded-lg p-2 text-[10px] whitespace-nowrap shadow-2xl pointer-events-none transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                      isActive ? 'border-cyan-500/50' : 'border-slate-800'
                    }`}>
                      <span className="font-bold text-white block">{stadium.name}</span>
                      <span className="text-slate-400 block">{stadium.city} • Health {stadium.healthScore}%</span>
                    </div>

                    {/* Short City label always visible */}
                    <span className="absolute top-2.5 left-1/2 transform -translate-x-1/2 text-[8px] font-bold font-mono tracking-tighter text-slate-500 bg-slate-950/70 border border-slate-900 px-1 rounded">
                      {stadium.city.substring(0, 3).toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stadiums list control panel */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col h-[400px]">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Trophy className="h-4 w-4 text-amber-400" />
              Tournament Stadiums (8)
            </CardTitle>
            <CardDescription className="text-xs">Click to switch telemetry views.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {stadiums.map((stadium) => {
              const isActive = stadium.id === selectedStadiumId;
              const statusColors = getHealthBadge(stadium.stadiumHealth);
              return (
                <button
                  key={stadium.id}
                  onClick={() => selectStadium(stadium.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center group cursor-pointer ${
                    isActive 
                      ? 'bg-blue-950/40 border-cyan-500/50 text-white' 
                      : 'bg-slate-950/30 border-slate-900/60 text-slate-400 hover:border-slate-800 hover:bg-[#0f172a]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className={`font-bold text-xs group-hover:text-white ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {stadium.name}
                    </span>
                    <span className="text-[9.5px] text-slate-500 block font-mono">
                      {stadium.location} • Match: {stadium.match.teamA} vs {stadium.match.teamB}
                    </span>
                  </div>
                  <Badge variant="secondary" className={`text-[8.5px] font-mono font-bold capitalize flex gap-1.5 items-center ${statusColors.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                    <span>{stadium.stadiumHealth}</span>
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------
          3. MATCH OPERATIONS CENTER & WEATHER INTEL
          ---------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Match Details Operations panel */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Trophy className="h-4.5 w-4.5 text-amber-400" />
              Match Operations Center: {selectedStadium.city}
            </CardTitle>
            <CardDescription className="text-xs">Active fixture schedules and live stadium telemetries.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center text-center p-3.5 rounded-xl border border-slate-900 bg-slate-950/50">
              <div className="flex-1">
                <span className="text-lg font-black block text-white">{selectedStadium.match.teamA}</span>
              </div>
              <div className="px-3 shrink-0">
                <span className="text-[8px] font-mono font-bold text-amber-400 block mb-0.5">STAGE</span>
                <Badge variant="warning" className="text-[9px] uppercase tracking-wider font-mono">
                  {selectedStadium.match.stage}
                </Badge>
              </div>
              <div className="flex-1">
                <span className="text-lg font-black block text-white">{selectedStadium.match.teamB}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider mb-0.5">Kickoff</span>
                <span className="text-white font-bold">{selectedStadium.match.kickoff}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider mb-0.5">Attendance</span>
                <span className="text-white font-bold">{selectedStadium.match.attendance.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider mb-0.5">VAR Room</span>
                <Badge variant={selectedStadium.match.varStatus === 'Online' ? 'success' : 'warning'} className="text-[9px] py-0 font-mono mt-0.5">
                  {selectedStadium.match.varStatus}
                </Badge>
              </div>
              <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider mb-0.5">Security Clearance</span>
                <Badge variant={selectedStadium.match.securityLevel === 'Normal' ? 'success' : 'warning'} className="text-[9px] py-0 font-mono mt-0.5">
                  {selectedStadium.match.securityLevel}
                </Badge>
              </div>
              <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider mb-0.5">Medical Readiness</span>
                <Badge variant={selectedStadium.match.medicalStatus === 'Ready' ? 'success' : 'warning'} className="text-[9px] py-0 font-mono mt-0.5">
                  {selectedStadium.match.medicalStatus}
                </Badge>
              </div>
              <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider mb-0.5">Parking Occupancy</span>
                <span className="text-white font-bold">{selectedStadium.match.parkingOccupancy}%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/20 text-xs flex justify-between items-center">
              <span className="text-slate-500 font-mono text-[10px] uppercase">Active Match Referee</span>
              <span className="font-bold text-white">{selectedStadium.match.referee}</span>
            </div>
          </CardContent>
        </Card>

        {/* Live Weather Intelligence Card */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Sun className="h-4.5 w-4.5 text-amber-400" />
              Live Weather Intelligence
            </CardTitle>
            <CardDescription className="text-xs">Microclimate sensors and warnings at {selectedStadium.city}.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono mb-1.5">Temperature</span>
                <span className="text-lg font-black text-white flex items-center justify-center gap-1">
                  <Thermometer className="h-4 w-4 text-rose-500" />
                  {selectedStadium.weather.temp}°C
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono mb-1.5">UV Index</span>
                <span className="text-lg font-black text-white block font-mono">
                  {selectedStadium.weather.uv} <span className="text-[10px] text-slate-500 font-bold">/ 10</span>
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono mb-1.5">Precip. Prob</span>
                <span className="text-lg font-black text-white flex items-center justify-center gap-1">
                  <CloudRain className="h-4 w-4 text-blue-400" />
                  {selectedStadium.weather.rainProb}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-[11px] text-slate-400 font-mono">
              <div>
                Wind: <strong className="text-white">{selectedStadium.weather.wind} km/h</strong>
              </div>
              <div>
                Humidity: <strong className="text-white">{selectedStadium.weather.humidity}%</strong>
              </div>
              <div>
                AQI Index: <strong className="text-white">{selectedStadium.weather.aqi} AQI</strong>
              </div>
            </div>

            {/* Weather warning triggers */}
            <div className="p-3.5 rounded-xl border border-amber-950/35 bg-amber-950/10 text-xs text-amber-400 leading-relaxed">
              {selectedStadium.weather.temp >= 30 ? (
                <span>⚠️ **Heat Risk Warning**: Current temperature ({selectedStadium.weather.temp}°C) indicates High heat exhaustion risks. AI recommends activating concourse shade screens and increasing water hydration stations.</span>
              ) : selectedStadium.weather.rainProb >= 50 ? (
                <span>⚠️ **Rain Warning**: Rain probability is ({selectedStadium.weather.rainProb}%). Recommended to retract covered roof structures and deploy walkway volunteers.</span>
              ) : (
                <span>✓ **Atmospheric Nominal**: Climate conditions are stable. No weather alerts in effect for this match fixture.</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------
          4. PREDICTIVE AI & EXPLAINABILITY
          ---------------------------------------------------- */}
      <Card className="bg-[#080d19]/45 border-slate-900/60">
        <CardHeader className="pb-3 border-b border-slate-900/30">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
            <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
            AI Decision Intelligence & Projections: {selectedStadium.name}
          </CardTitle>
          <CardDescription className="text-xs">Predictive alerts paired with explainable reasoning checklists.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {selectedStadium.predictions.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-6">
              No predictive risk warnings in effect. Telemetry patterns are normal.
            </div>
          ) : (
            <div className="space-y-4">
              {selectedStadium.predictions.map((pred) => (
                <div key={pred.id} className="p-4 rounded-2xl border border-slate-900 bg-slate-950/30 grid md:grid-cols-3 gap-4">
                  {/* Left Column: Metric Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[8px] font-mono uppercase tracking-wider">
                        Risk: {pred.risk}
                      </Badge>
                      <Badge variant="cyan" className="text-[8px] font-mono">
                        {pred.confidence}% Conf.
                      </Badge>
                    </div>
                    <h4 className="font-bold text-white text-xs">{pred.message}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Impact: <span className="text-slate-200">{pred.impact}</span></p>
                  </div>

                  {/* Middle Column: Explainability Checklist */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 space-y-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Why did AI recommend this?</span>
                    <ul className="space-y-1 text-[10.5px] text-slate-300">
                      {pred.reasoning.map((reason, rIdx) => (
                        <li key={rIdx} className="flex items-center gap-1.5 leading-snug">
                          <Check className="h-3 w-3 text-cyan-400 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: AI Action Dispatch */}
                  <div className="flex flex-col justify-center gap-2">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Action Recommendation</span>
                    <p className="text-slate-200 text-xs font-semibold leading-relaxed mb-1">{pred.action}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => selectStadium(selectedStadiumId)} // Placeholder to trigger re-route or direct execution
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10.5px] px-3.5 h-8.5 rounded-lg cursor-pointer"
                      >
                        Approve Action Plan
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ----------------------------------------------------
          5. TOURNAMENT TIMELINE & RECHARTS GRAPH
          ---------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Interactive Timeline */}
        <Card className="md:col-span-1 bg-[#080d19]/45 border-slate-900/60 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Clock className="h-4.5 w-4.5 text-cyan-400" />
              Tournament Timeline
            </CardTitle>
            <CardDescription className="text-xs">Click matchday to switch stadiums.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {matchesTimeline.map((item) => {
                const isSelected = selectedStadiumId === item.stadiumId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTimelineMatch(item.stadiumId)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-950/40 border-cyan-500/50' 
                        : 'bg-slate-950/40 border-slate-900/60 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">{item.label}</span>
                      <Badge variant={item.status === 'LIVE' ? 'destructive' : 'secondary'} className="text-[8px] font-mono">
                        {item.status}
                      </Badge>
                    </div>
                    <span className="font-bold text-white text-xs leading-none">{item.match}</span>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {item.stadiumId.toUpperCase()} Venue
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Global Analytics graph */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-emerald-400">
              <Landmark className="h-4.5 w-4.5" />
              Tournament Revenue Analysis ($ USD)
            </CardTitle>
            <CardDescription className="text-xs">Concession sales, ticket gains, and merchandise metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0062ff" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0062ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMerch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={9} 
                  tickLine={false} 
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="tickets" stroke="#0062ff" fillOpacity={1} fill="url(#colorTickets)" name="Tickets" />
                <Area type="monotone" dataKey="food" stroke="#10b981" fillOpacity={1} fill="url(#colorFood)" name="Concessions" />
                <Area type="monotone" dataKey="merch" stroke="#eab308" fillOpacity={1} fill="url(#colorMerch)" name="Merchandise" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------
          6. FLOATING COMMAND CENTER STATUS WIDGET
          ---------------------------------------------------- */}
      <div className="fixed bottom-6 left-6 z-40 p-4 rounded-xl border border-slate-900 bg-[#080d19]/90 shadow-2xl backdrop-blur-md space-y-2.5 max-w-[220px] pointer-events-auto">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono border-b border-slate-900 pb-1.5">COMMAND CENTER APIS</span>
        
        <div className="space-y-1.5 text-[10.5px]">
          {[
            { label: 'AI Status', status: 'Connected', color: 'text-emerald-400' },
            { label: 'Database Grid', status: 'Connected', color: 'text-emerald-400' },
            { label: 'Weather feeds', status: 'Connected', color: 'text-emerald-400' },
            { label: 'Emergency API', status: 'Connected', color: 'text-emerald-400' },
            { label: 'Camera Network', status: 'Warning', color: 'text-amber-400' },
            { label: 'Transit Sync', status: 'Connected', color: 'text-emerald-400' }
          ].map((srv, idx) => (
            <div key={idx} className="flex justify-between items-center gap-3">
              <span className="text-slate-400 font-medium">{srv.label}</span>
              <span className={`font-mono text-[9px] font-bold ${srv.color} animate-pulse`}>● {srv.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
