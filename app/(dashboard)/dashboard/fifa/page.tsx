'use client';

import React, { useState } from 'react';
import { useStadium } from '@/components/stadium/StadiumContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Trophy, Globe, TrendingUp, Users, Shield, Leaf, DollarSign, Activity, RefreshCw, Landmark, 
  Sparkles, Clock, AlertTriangle, CheckCircle, Undo2, Info
} from 'lucide-react';

export default function FifaBoardDashboard() {
  const { user } = useAuth();
  const { 
    stadiumHealth, healthScore, visitors, alerts, transport, sustainability, timeline, history, rollbackOperation
  } = useStadium();

  const [refreshing, setRefreshing] = useState(false);

  // Broadcast and revenue telemetry
  const metrics = {
    broadcast: 428.5,
    concurrent: 24.3,
    revenue: 23.68,
  };

  const stadiumStatus = [
    { name: 'Stadium Alpha (Vancouver)', occupancy: 94, health: 'Excellent' },
    { name: 'Stadium Beta (Seattle)', occupancy: 88, health: 'Good' },
    { name: 'Stadium Gamma (Los Angeles)', occupancy: 98, health: 'Under Monitoring' },
  ];

  const sustainMix = [
    { name: 'Solar Energy', value: sustainability.renewablePercentage - 20 },
    { name: 'Grid Batteries', value: 20 },
    { name: 'Wind Energy', value: 100 - sustainability.renewablePercentage },
  ];

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

  if (!user) return null;

  const SUSTAIN_COLORS = ['#10b981', '#059669', '#34d399'];

  return (
    <div className="space-y-6">
      {/* Welcome & Analytics Mode Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-900/40 border border-amber-950/30">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            Executive Operations Ledger
          </h2>
          <p className="text-sm text-slate-400">FIFA Administration Portal • Tournament KPI Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning" className="px-3 py-1 uppercase tracking-widest text-[10px] bg-amber-950/80 text-amber-400 border border-amber-500/25">
            FIFA Executive Clearance
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshClick} 
            disabled={refreshing}
            className="text-xs flex gap-1.5 items-center border-slate-800 bg-[#0c101d] text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </Button>
        </div>
      </div>

      {/* Global Match Center & AI Predictive Projections */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Match Center Card (Executive Overview) */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl rounded-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Trophy className="h-4.5 w-4.5 text-amber-400" />
                Global Match Center (Executive View)
              </span>
              <Badge variant="warning" className="text-[9px] uppercase tracking-wider font-mono">Quarter Final</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Seattle Stadium Command Center Telemetry</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between text-center bg-slate-950/40 border border-slate-900 rounded-xl p-4">
              <div className="flex-1">
                <span className="text-2xl font-black block text-white">ARG</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Argentina</span>
              </div>
              <div className="px-4">
                <span className="text-[9px] font-mono font-bold text-amber-400 block mb-1">COUNTDOWN</span>
                <Badge variant="secondary" className="font-mono text-sm py-1 px-3 bg-blue-950/80 text-blue-300 border border-blue-800/40">1h 24m</Badge>
              </div>
              <div className="flex-1">
                <span className="text-2xl font-black block text-white">GER</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Germany</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3.5 text-xs text-center">
              <div className="p-2.5 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono mb-0.5">Broadcast Streams</span>
                <span className="text-white font-bold">{metrics.broadcast}M Streams</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono mb-0.5">Corporate Boxes</span>
                <span className="text-emerald-400 font-bold">100% Occupied</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-500 block text-[9px] uppercase font-mono mb-0.5">VIP Attendees</span>
                <span className="text-white font-bold">FIFA delegation</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900/60 pt-3">
              <span>Referee: Piero Maza (Chile)</span>
              <span>Matchday Merch Gross: <strong className="text-emerald-400">$820,000</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* AI Predictions */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/60">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
                AI Risk Projections
              </span>
              <Badge variant="cyan" className="text-[9px] uppercase font-mono">Predictive</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Capacity projections in the next hour</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2 text-[10px] leading-snug">
              <div className="p-2 border border-slate-900 bg-slate-950/45 rounded flex justify-between items-center">
                <span className="text-slate-300">Gate 3 likely to exceed capacity in 18 minutes.</span>
                <span className="text-cyan-400 font-bold font-mono ml-2">92%</span>
              </div>
              <div className="p-2 border border-slate-900 bg-slate-950/45 rounded flex justify-between items-center">
                <span className="text-slate-300">Food Court A concessions projected to peak at halftime.</span>
                <span className="text-cyan-400 font-bold font-mono ml-2">88%</span>
              </div>
              <div className="p-2 border border-slate-900 bg-slate-950/45 rounded flex justify-between items-center">
                <span className="text-slate-300">Metro station departure load forecast peak in 45 mins.</span>
                <span className="text-cyan-400 font-bold font-mono ml-2">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EXECUTIVE AI INSIGHTS PANEL */}
      <Card className="bg-[#080d19]/45 border-slate-900/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(234,179,8,0.02),transparent)] pointer-events-none" />
        <CardHeader className="pb-3 border-b border-slate-900/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
            <Sparkles className="h-4.5 w-4.5 text-amber-400" />
            Executive Intelligence Insights
          </CardTitle>
          <CardDescription className="text-xs">AI recommendations and environmental checks</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Green Card */}
            <div className="p-3.5 rounded-xl border border-emerald-900/30 bg-emerald-950/10 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>Attendance & Safety</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Attendance exceeded baseline expectations by 7%. Emergency response index improved by 18% (average threshold: 54 seconds).
              </p>
            </div>
            {/* Amber Card */}
            <div className="p-3.5 rounded-xl border border-amber-900/30 bg-amber-950/10 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Gate & Crowd Flows</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Gate 3 remains the busiest entrance (92% load). Recommended Action: **Increase volunteers near Gate 3** concourse immediately.
              </p>
            </div>
            {/* Red Card */}
            <div className="p-3.5 rounded-xl border border-rose-900/30 bg-rose-950/10 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Energy & Transport Limits</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Food Court waiting times remain above target limits. Recommended Action: **Deploy standby electric shuttles** to Gate B.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EXECUTIVE KPI CENTER */}
      <Card className="bg-[#080d19]/45 border-slate-900/60">
        <CardHeader className="pb-3 border-b border-slate-900/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
            <Activity className="h-4.5 w-4.5 text-cyan-400" />
            Executive KPI Center
          </CardTitle>
          <CardDescription className="text-xs">Primary operational indexes with historical trend drifts</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 text-center text-xs">
          {[
            { label: 'Fan Satisfaction', value: '94%', trend: '▲ +1.2%', variant: 'success' },
            { label: 'Security Index', value: '99.8%', trend: 'Stable', variant: 'cyan' },
            { label: 'Operational Efficiency', value: '92%', trend: '▲ +3.4%', variant: 'success' },
            { label: 'Accessibility Score', value: '96%', trend: 'Stable', variant: 'cyan' },
            { label: 'Sustainability Score', value: '98%', trend: '▲ +2.0%', variant: 'success' },
            { label: 'Transport Efficiency', value: '91%', trend: '▼ -1.5%', variant: 'warning' },
            { label: 'Revenue Per Visitor', value: '$128.50', trend: '▲ +4.3%', variant: 'success' },
            { label: 'Average Queue Time', value: '4.5 mins', trend: '▼ -12%', variant: 'success' },
            { label: 'Medical Response Time', value: '54s', trend: '▲ +18%', variant: 'success' },
            { label: 'Stadium Health Score', value: `${healthScore}/100`, trend: stadiumHealth, variant: stadiumHealth === 'Excellent' || stadiumHealth === 'Good' ? 'success' : 'warning' }
          ].map((kpi, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-slate-900 bg-slate-950/45 flex flex-col justify-between">
              <span className="text-slate-500 block text-[9.5px] uppercase font-mono tracking-wider mb-1">{kpi.label}</span>
              <span className="text-lg font-black text-white block font-mono">{kpi.value}</span>
              <Badge variant={kpi.variant as any} className="text-[8px] py-0 font-mono mt-1 justify-center">
                {kpi.trend}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* REVENUE GRAPH & TIMELINE ROW */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue Graph */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-emerald-400">
              <Landmark className="h-4 w-4" />
              Tournament Revenue Stream Analysis ($ USD)
            </CardTitle>
            <CardDescription className="text-xs">Concession sales, ticket gains, and merchandise metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
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

        {/* AI Operations History Panel */}
        <Card className="flex flex-col h-[370px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Clock className="h-4.5 w-4.5 text-cyan-400" />
              AI Operations History
            </CardTitle>
            <CardDescription className="text-xs">History logs and rollback controls</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8">
                <Info className="h-8 w-8 text-slate-600 mb-2" />
                <span>No Operations Executed Yet</span>
                <span className="text-[9px] text-slate-600 mt-1">Submit prompt actions in AI Assistant.</span>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-slate-900 bg-slate-950/20 text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-white capitalize">{item.actionName.replace('_', ' ')}</span>
                    <Badge variant={item.status === 'success' ? 'success' : item.status === 'cancelled' ? 'secondary' : 'warning'} className="text-[8px] font-mono">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">"{item.prompt}"</p>
                  <p className="text-[11px] text-slate-200">{item.outcome}</p>
                  {item.status === 'success' && (
                    <div className="flex justify-end pt-1">
                      <Button
                        onClick={() => rollbackOperation(item.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[9px] text-amber-500 hover:bg-amber-950/20 flex items-center gap-1 cursor-pointer"
                      >
                        <Undo2 className="h-3 w-3" />
                        <span>Undo Operation</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* MULTI STADIUM, SUSTAINABILITY & SECURITY DETAILED SPLITS */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Multi-Stadium Monitoring */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[320px]">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Activity className="h-4.5 w-4.5 text-cyan-400" />
              Multi-Stadium Diagnostics
            </CardTitle>
            <CardDescription className="text-xs">Live status across tournament venues</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {stadiumStatus.map((stadium, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-900 bg-slate-950/30 text-xs space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white leading-tight">{stadium.name}</h4>
                  <Badge variant="success" className="text-[8px] py-0 font-mono">
                    {stadium.health}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 border-t border-slate-900/40 pt-1 text-[9px] text-slate-400 font-mono">
                  <div>
                    Occupancy: <span className="text-white font-bold">{stadium.occupancy}%</span>
                  </div>
                  <div>
                    Active Alerts: <span className="text-white font-bold">{alerts.filter(a => a.status !== 'resolved').length}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sustainability Executive Audit */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[320px]">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-emerald-400">
              <Leaf className="h-4.5 w-4.5" />
              Sustainability Reports
            </CardTitle>
            <CardDescription className="text-xs">Carbon offsets and green grid shares</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between py-4">
            <div className="h-32 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sustainMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sustainMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SUSTAIN_COLORS[index % SUSTAIN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 text-center text-[9px] text-slate-400 border-t border-slate-900/80 pt-3 font-mono">
              {sustainMix.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="font-semibold truncate max-w-[85px]">{item.name}</span>
                  <span className="text-emerald-400 font-black mt-0.5">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Overview */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[320px]">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-purple-400">
              <Shield className="h-4.5 w-4.5" />
              Security Overview
            </CardTitle>
            <CardDescription className="text-xs">Active safeguards and response KPIs</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            <div className="p-3.5 rounded-lg border border-slate-900 bg-slate-950/20 text-xs">
              <div className="flex justify-between items-center mb-1 text-[9px] font-bold text-slate-400 uppercase font-mono">
                <span>Security Patrols</span>
                <span className="text-white">Active</span>
              </div>
              <p className="text-slate-300 font-bold">14 Patrol Quadrants deployed</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-900 bg-slate-950/20 text-xs">
              <div className="flex justify-between items-center mb-1 text-[9px] font-bold text-slate-400 uppercase font-mono">
                <span>Response Times</span>
                <span className="text-emerald-400">Target Met</span>
              </div>
              <p className="text-slate-300 font-bold">Average dispatch time: 48 seconds</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-900 bg-slate-950/20 text-xs">
              <div className="flex justify-between items-center mb-1 text-[9px] font-bold text-slate-400 uppercase font-mono">
                <span>Medical Readiness</span>
                <span className="text-white">Standby</span>
              </div>
              <p className="text-slate-300 font-bold">4 Mobile Trauma pods online</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
