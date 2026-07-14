'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStadium, MatchPhase, SimulatedIncident, AfterActionReport } from '@/components/stadium/StadiumContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedNumber } from '@/components/stadium/AnimatedNumber';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { 
  Globe, AlertTriangle, Play, CheckCircle2, RefreshCw, Trophy, ShieldAlert,
  FlameKindling, Sun, Shield, Layers, HelpCircle, Activity, Sparkles,
  Users, Ticket, Bus, HeartPulse, Clock, FileText, ArrowRight, X, Printer
} from 'lucide-react';

export default function FifaDashboard() {
  const { user } = useAuth();
  const {
    stadiums,
    selectedStadiumId,
    selectedStadium,
    selectStadium,
    timeline,
    history,
    executeAction,
    rejectRecommendation,
    changeMatchPhase,
    executePlaybook,
    triggerRandomIncident,
    resilienceScore,
    fanExperienceScore,
    fanExperienceBreakdown
  } = useStadium();

  // Dialog state for After Action Reports
  const [selectedReport, setSelectedReport] = useState<AfterActionReport | null>(null);
  // Timeline Filter state
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'security' | 'medical' | 'transport' | 'operational'>('all');

  // Compute total mock statistics across all 8 stadiums
  const totalCrowd = stadiums.reduce((sum, s) => sum + s.visitors.total, 0);
  const totalAlerts = stadiums.reduce((sum, s) => sum + s.alerts.filter(a => a.status !== 'resolved').length, 0);
  const totalTransit = stadiums.reduce((sum, s) => sum + s.transport.length, 0);
  
  const metrics = {
    totalAttendance: totalCrowd,
    avgWaitTime: selectedStadium.id === 'vancouver' ? 4.2 : 6.8,
    medicalIncidents: totalAlerts,
    transitDelayPercent: Math.round((stadiums.filter(s => s.transport.some(t => t.status === 'delayed')).length / stadiums.length) * 100),
    renewablePercent: Math.round(stadiums.reduce((sum, s) => sum + s.sustainability.renewablePercentage, 0) / stadiums.length),
    globalViewers: parseFloat(stadiums.reduce((sum, s) => sum + s.match.broadcastViewers, 0).toFixed(1))
  };

  // Weather indicator formatter
  const getWeatherIcon = (prob: number) => {
    if (prob > 50) return <FlameKindling className="h-5 w-5 text-blue-400 animate-bounce" />;
    return <Sun className="h-5 w-5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />;
  };

  // Health Score Style helper
  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'Excellent':
        return { variant: 'success' as const, bg: 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400', dot: 'bg-emerald-400' };
      case 'Good':
        return { variant: 'cyan' as const, bg: 'bg-cyan-950/20 border-cyan-900/40 text-cyan-400', dot: 'bg-cyan-400' };
      case 'Warning':
        return { variant: 'warning' as const, bg: 'bg-amber-950/20 border-amber-900/40 text-amber-400', dot: 'bg-amber-400' };
      case 'Critical':
      default:
        return { variant: 'destructive' as const, bg: 'bg-rose-950/20 border-rose-900/40 text-rose-400', dot: 'bg-rose-400' };
    }
  };

  // Recharts Visit Trends Mock Data
  const chartData = [
    { name: '12:00', Vancouver: 12000, LA: 8000, Dallas: 15000, NY: 20000 },
    { name: '14:00', Vancouver: 28000, LA: 19000, Dallas: 34000, NY: 42000 },
    { name: '16:00', Vancouver: 54000, LA: 45000, Dallas: 68000, NY: 72000 },
    { name: '18:00', Vancouver: 68420, LA: 72100, Dallas: 88200, NY: 80200 },
    { name: '20:00', Vancouver: 68420, LA: 72100, Dallas: 88200, NY: 80200 },
  ];

  // Filtered Decision Timeline
  const filteredTimeline = timeline.filter(item => {
    if (timelineFilter === 'all') return true;
    return item.type === timelineFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* ----------------------------------------------------
          1. COMMISSIONER EXECUTIVE BRIEFING & PHASE ENGINE
          ---------------------------------------------------- */}
      <div className="p-6 rounded-2xl border border-slate-900 bg-[#080d19]/45 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge variant="cyan" className="uppercase tracking-widest text-[9px] mb-2 font-mono">
              FIFA Headquarters Command Room
            </Badge>
            <h2 className="text-2xl font-black text-white">
              Welcome, Commissioner {user?.name || 'Director'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Global operations overview for Matchday 12. Active selected venue: <strong className="text-cyan-400">{selectedStadium.name} ({selectedStadium.city})</strong>.
            </p>
          </div>

          {/* Match Phase Engine Selectors */}
          <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-3 space-y-2 shrink-0 max-w-md w-full">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">
              ⚡ Live Match Phase Engine
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['pre-match', 'kickoff', 'first-half', 'halftime', 'second-half', 'full-time', 'exit-phase', 'venue-closed'] as MatchPhase[]).map((phase) => (
                <button
                  key={phase}
                  onClick={() => changeMatchPhase(phase)}
                  className={`text-[9px] font-bold py-1 px-1 rounded transition capitalize select-none cursor-pointer ${
                    selectedStadium.matchPhase === phase 
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30' 
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {phase.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Summary Grid */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-6 mt-6">
          {[
            { label: 'Total Attendance', val: <AnimatedNumber value={metrics.totalAttendance} />, desc: 'Fans Admitted' },
            { label: 'Avg Wait Time', val: <span className="flex justify-center gap-0.5"><AnimatedNumber value={metrics.avgWaitTime} duration={600} formatter={v => v.toFixed(1)} /> min</span>, desc: 'Turnstile Queue' },
            { label: 'Medical Calls', val: <AnimatedNumber value={metrics.medicalIncidents} />, desc: 'Incidents Logged' },
            { label: 'Transit Delays', val: <span className="flex justify-center gap-0.5"><AnimatedNumber value={metrics.transitDelayPercent} />%</span>, desc: 'System Delayed' },
            { label: 'Renewable Power', val: <span className="flex justify-center gap-0.5"><AnimatedNumber value={metrics.renewablePercent} />%</span>, desc: 'Clean Grid Share' },
            { label: 'Global Viewers', val: <span className="flex justify-center gap-0.5"><AnimatedNumber value={metrics.globalViewers} duration={600} formatter={v => v.toFixed(1)} />M</span>, desc: 'Active Broadcasts' }
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
          2. TOURNAMENT MAP & COMMAND CENTER CONTROLS
          ---------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Pulsing Regional Map */}
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
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#334155_1.5px,transparent_1px)] [background-size:16px_16px]" />
              
              <svg className="absolute inset-0 w-full h-full text-slate-800" fill="none" viewBox="0 0 800 400">
                <path d="M120 80 L200 60 L320 80 L360 140 L450 160 L500 120 L580 180 L620 280 L580 320 L520 280 L460 330 L380 300 L320 340 L260 260 L200 240 L160 180 Z" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
              </svg>

              {stadiums.map((stadium) => {
                const isActive = stadium.id === selectedStadiumId;
                const status = getHealthBadge(stadium.stadiumHealth);
                return (
                  <button
                    key={stadium.id}
                    onClick={() => selectStadium(stadium.id)}
                    className="absolute group transform -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
                    style={{ left: `${stadium.xPercent}%`, top: `${stadium.yPercent}%` }}
                    aria-label={`Inspect ${stadium.name} in ${stadium.city}`}
                  >
                    <span className="absolute -inset-2 flex items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-4 w-4 rounded-full opacity-60 ${status.dot}`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.dot}`} />
                    </span>
                    <span className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded text-[8px] font-bold text-white whitespace-nowrap bg-slate-950 border border-slate-800 ${
                      isActive ? 'border-cyan-400 text-cyan-400' : 'opacity-60 group-hover:opacity-100'
                    }`}>
                      {stadium.city} ({stadium.healthScore}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Command Controls (Resilience & Playbooks) */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Activity className="h-4.5 w-4.5 text-cyan-400" />
              Command Center Portal
            </CardTitle>
            <CardDescription className="text-xs">Dynamic gauges and fast emergency response loops.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            
            {/* Resilience Score & Fan Experience Index Gauges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 text-center relative overflow-hidden">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono mb-1">
                  Resilience Score
                </span>
                <span className="text-3xl font-black text-cyan-400 block font-mono">
                  <AnimatedNumber value={resilienceScore} />
                </span>
                <span className="text-[8px] text-slate-400 block mt-1">AI Stability Index</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 text-center relative overflow-hidden">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono mb-1">
                  Fan Experience
                </span>
                <span className={`text-xl font-black block uppercase tracking-widest mt-1 ${
                  fanExperienceScore === 'Excellent' ? 'text-emerald-400' :
                  fanExperienceScore === 'Good' ? 'text-cyan-400' :
                  fanExperienceScore === 'Fair' ? 'text-amber-400' : 'text-rose-500'
                }`}>
                  {fanExperienceScore}
                </span>
                <span className="text-[8px] text-slate-400 block mt-2">Live Satisfaction Index</span>
              </div>
            </div>

            {/* Interactive Playbook Launcher */}
            <div className="space-y-2 border-t border-slate-900/60 pt-3 flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono mb-1">
                🚒 Dispatch Emergency Playbooks
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gate-congestion', label: 'Gate Congestion', color: 'bg-amber-900/20 hover:bg-amber-950/30 border-amber-900/40 text-amber-300' },
                  { id: 'medical-surge', label: 'Medical Surge', color: 'bg-rose-900/20 hover:bg-rose-950/30 border-rose-900/40 text-rose-300' },
                  { id: 'heavy-rain', label: 'Heavy Rain', color: 'bg-cyan-900/20 hover:bg-cyan-950/30 border-cyan-900/40 text-cyan-300' },
                  { id: 'power-failure', label: 'Power Failure', color: 'bg-red-900/20 hover:bg-red-950/30 border-red-900/40 text-red-300' }
                ].map((play) => (
                  <Button
                    key={play.id}
                    variant="outline"
                    onClick={() => executePlaybook(play.id)}
                    className={`text-[10px] py-1.5 h-8.5 font-bold border rounded-lg cursor-pointer ${play.color}`}
                  >
                    {play.label}
                  </Button>
                ))}
              </div>
            </div>

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
                <span className="text-white font-bold"><AnimatedNumber value={selectedStadium.match.attendance} /></span>
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
                <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider mb-0.5">Global Viewers</span>
                <span className="text-white font-bold"><AnimatedNumber value={selectedStadium.match.broadcastViewers} duration={500} formatter={v => v.toFixed(1)} />M</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Weather Card */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-white">
              <span className="flex items-center gap-1.5">
                <Sun className="h-4.5 w-4.5 text-amber-400" />
                Live Climate Intelligence: {selectedStadium.city}
              </span>
              {getWeatherIcon(selectedStadium.weather.rainProb)}
            </CardTitle>
            <CardDescription className="text-xs">Atmospheric parameters driving local water & shade dispatches.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center text-center p-3.5 rounded-xl border border-slate-900 bg-slate-950/50">
              <div className="flex-1">
                <span className="text-2xl font-black text-white"><AnimatedNumber value={selectedStadium.weather.temp} />°C</span>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">TEMPERATURE</span>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="flex-1">
                <span className="text-xl font-bold text-amber-400 block font-mono">{selectedStadium.weather.uv} / 10</span>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">UV INDEX</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[8px] font-mono">Humidity</span>
                <span className="text-white font-bold">{selectedStadium.weather.humidity}%</span>
              </div>
              <div className="p-2 rounded border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[8px] font-mono">Wind</span>
                <span className="text-white font-bold">{selectedStadium.weather.wind} km/h</span>
              </div>
              <div className="p-2 rounded border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[8px] font-mono">Precip.</span>
                <span className="text-white font-bold">{selectedStadium.weather.rainProb}%</span>
              </div>
              <div className="p-2 rounded border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 block text-[8px] font-mono">AQI</span>
                <span className="text-white font-bold">{selectedStadium.weather.aqi}</span>
              </div>
            </div>

            {selectedStadium.weather.temp >= 30 && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-900/30 bg-rose-950/10 text-xs">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1 text-slate-300">
                  <span className="font-bold text-rose-400 block">AI Heat Mitigation Alert</span>
                  <span>Spectator Heat Index exceeds 30°C. Hydration advisors triggered in fans app section.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------
          4. SIMULATED INCIDENT LIFECYCLE & AAR REPORTS
          ---------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Incident lifecycle list */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/30 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-400" />
                AI Digital Twin Incident Lifecycle Tracker
              </CardTitle>
              <CardDescription className="text-xs">Real-time simulator progressing live incidents.</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={triggerRandomIncident}
              className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-bold py-1 h-7.5 px-3 rounded-lg cursor-pointer"
            >
              Trigger Incident
            </Button>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3 flex-1 overflow-y-auto max-h-76 pr-1">
              {selectedStadium.simulatedIncidents.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs space-y-1">
                  <span>Excellent! No incidents require attention.</span>
                  <span className="block text-[10px] text-slate-600">You're all caught up.</span>
                </div>
              ) : (
                selectedStadium.simulatedIncidents.map((inc) => (
                  <div key={inc.id} className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/50 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          inc.severity === 'critical' ? 'bg-red-500 animate-ping' :
                          inc.severity === 'high' ? 'bg-orange-500 animate-pulse' :
                          inc.severity === 'medium' ? 'bg-amber-400' : 'bg-cyan-400'
                        }`} />
                        <h4 className="font-bold text-white text-xs">{inc.title}</h4>
                      </div>
                      <Badge variant="cyan" className="uppercase tracking-widest text-[8px] font-mono capitalize">
                        {inc.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                      <div>Location: <strong className="text-slate-200">{inc.location}</strong></div>
                      <div>Impact: <strong className="text-slate-200">{inc.estimatedImpact}</strong></div>
                    </div>

                    {/* Progress tracking gauge */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono text-slate-500">
                        <span>LIFECYCLE PROGRESS: {inc.progress}%</span>
                        <span>EST. RESOLUTION: {inc.expectedResolutionTime}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 transition-all duration-500"
                          style={{ width: `${inc.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Inspect report button once resolved */}
                    {inc.afterActionReport && (
                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          onClick={() => setSelectedReport(inc.afterActionReport)}
                          className="flex items-center gap-1 text-[9px] font-bold border border-cyan-900 bg-cyan-950/40 text-cyan-300 h-6.5 cursor-pointer rounded"
                        >
                          <FileText className="h-3 w-3" /> Inspect After Action Report
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Executive Decision Timeline */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Clock className="h-4.5 w-4.5 text-cyan-400" />
              Executive Decision Timeline
            </CardTitle>
            <CardDescription className="text-xs">Log chronological operator actions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col justify-between">
            {/* Timeline category filters */}
            <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-950/60 border border-slate-900 mb-3">
              {(['all', 'security', 'medical', 'transport', 'operational'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTimelineFilter(cat)}
                  className={`text-[8px] font-bold px-2 py-0.5 rounded capitalize cursor-pointer select-none ${
                    timelineFilter === cat ? 'bg-slate-900 text-white' : 'text-slate-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3.5 flex-1 overflow-y-auto max-h-60 pr-1 text-xs">
              {filteredTimeline.length === 0 ? (
                <div className="text-center py-12 text-slate-600 text-xs">No matching logs in scope.</div>
              ) : (
                filteredTimeline.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="text-[10px] font-mono text-slate-500 tracking-wider font-bold shrink-0 mt-0.5">
                      {item.time}
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-slate-300 leading-normal">{item.event}</p>
                      <span className="text-[7.5px] px-1 py-0.1 rounded font-mono uppercase tracking-wider bg-slate-950 text-slate-500 border border-slate-900">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Analytics chart */}
      <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Matchday Capacity Utilization Matrix</h3>
          <p className="text-xs text-slate-400">Total ingress visitor distribution trends across primary quadrants.</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} className="font-mono" />
              <YAxis stroke="#64748b" fontSize={10} className="font-mono" />
              <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" dataKey="Vancouver" stroke="#22d3ee" fillOpacity={1} fill="url(#colorVan)" strokeWidth={2} />
              <Area type="monotone" dataKey="NY" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNY)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ----------------------------------------------------
          5. AFTER ACTION REPORT MOCK PDF DIALOG OVERLAY
          ---------------------------------------------------- */}
      <AnimatePresence>
        {selectedReport && (
          <Dialog
            isOpen={!!selectedReport}
            onClose={() => setSelectedReport(null)}
            title="FIFA Official After Action Audit Report"
          >
            <div className="p-4 space-y-5 bg-[#03070d] border border-slate-900 rounded-xl relative">
              
              {/* PDF Header Logo */}
              <div className="flex justify-between items-start border-b border-slate-950 pb-4">
                <div>
                  <Badge variant="cyan" className="uppercase tracking-widest text-[8px] mb-1 font-mono">
                    Official Document
                  </Badge>
                  <h3 className="text-sm font-black text-white">{selectedReport.title}</h3>
                  <span className="text-[10px] text-slate-500 block font-mono">REPORT ID: {selectedReport.id}</span>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono">
                  <div>FIFA WORLD CUP 2026</div>
                  <div>SECURITY CONTROL DIVISION</div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block font-mono">
                  1. Executive Summary
                </span>
                <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-900/40">
                  {selectedReport.summary}
                </p>
              </div>

              {/* Operations logs timeline */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block font-mono">
                  2. Incident Timeline Logs
                </span>
                <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-900/40">
                  {selectedReport.timeline.map((t, idx) => (
                    <div key={idx} className="flex gap-4 font-mono text-[10.5px]">
                      <span className="text-cyan-400 font-bold shrink-0">{t.time}</span>
                      <span className="text-slate-300">{t.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departments & Action plans */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block font-mono mb-1.5">
                    3. Stakeholder Departments
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedReport.departments.map((d, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[9px] font-bold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block font-mono mb-1.5">
                    4. Resolution Time
                  </span>
                  <span className="text-slate-200 font-bold font-mono">{selectedReport.resolutionTime}</span>
                </div>
              </div>

              {/* Lessons Learned */}
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-900/60 pt-4">
                <div className="space-y-1 text-slate-300">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block font-mono">
                    Lessons Learned
                  </span>
                  <p className="leading-relaxed text-[11px] text-slate-400">{selectedReport.lessonsLearned}</p>
                </div>
                <div className="space-y-1 text-slate-300">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block font-mono">
                    Future Recommendation
                  </span>
                  <p className="leading-relaxed text-[11px] text-slate-400">{selectedReport.futureRecommendation}</p>
                </div>
              </div>

              {/* PDF Mock Control Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-900/60 pt-3">
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1.5 h-8.5 cursor-pointer rounded-lg px-4"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Audit PDF
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-8.5 cursor-pointer rounded-lg px-4"
                >
                  Close Report
                </Button>
              </div>

            </div>
          </Dialog>
        )}
      </AnimatePresence>

    </div>
  );
}
