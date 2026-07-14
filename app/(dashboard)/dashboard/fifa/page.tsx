'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { DatabaseService } from '@/lib/db';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Trophy, Globe, TrendingUp, Users, Shield, Leaf, DollarSign, Activity, RefreshCw, Landmark 
} from 'lucide-react';

export default function FifaBoardDashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live telemetry states
  const [metrics, setMetrics] = useState({
    attendance: 324500,
    broadcast: 428.5,
    concurrent: 24.3,
    revenue: 23.68,
    safety: 99.8
  });

  const [stadiumStatus, setStadiumStatus] = useState([
    { name: 'Stadium Alpha (Vancouver)', occupancy: 94, status: 'stable', alerts: 0, health: 'Excellent' },
    { name: 'Stadium Beta (Seattle)', occupancy: 88, status: 'stable', alerts: 1, health: 'Good' },
    { name: 'Stadium Gamma (Los Angeles)', occupancy: 98, status: 'critical', alerts: 2, health: 'Under Monitoring' },
  ]);

  const [sustainMix, setSustainMix] = useState([
    { name: 'Solar Energy', value: 65 },
    { name: 'Grid Batteries', value: 20 },
    { name: 'Wind Energy', value: 15 },
  ]);

  const [revenueData, setRevenueData] = useState([
    { day: 'Match 1', tickets: 2400000, food: 650000, merch: 420000 },
    { day: 'Match 2', tickets: 2850000, food: 720000, merch: 480000 },
    { day: 'Match 3', tickets: 3100000, food: 810000, merch: 560000 },
    { day: 'Match 4', tickets: 3600000, food: 950000, merch: 690000 },
    { day: 'Match 5', tickets: 4200000, food: 1100000, merch: 820000 },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live simulation telemetry interval
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      // 1. Fluctuate viewers, revenue and metrics
      setMetrics(prev => {
        const streamDelta = (Math.random() * 0.4 - 0.2); // ±0.2M
        const revDelta = Math.random() * 0.05; // +$50k
        return {
          ...prev,
          broadcast: parseFloat((prev.broadcast + (Math.random() > 0.6 ? streamDelta : 0)).toFixed(1)),
          concurrent: parseFloat((prev.concurrent + streamDelta).toFixed(1)),
          revenue: parseFloat((prev.revenue + revDelta).toFixed(2))
        };
      });

      // 2. Fluctuate stadium occupancies
      setStadiumStatus(prev => prev.map(st => {
        const change = Math.floor(Math.random() * 3) - 1; // ±1%
        const newOcc = Math.min(100, Math.max(70, st.occupancy + change));
        return { ...st, occupancy: newOcc };
      }));

      // 3. Fluctuations in energy mix percentages
      setSustainMix(prev => {
        const solarVal = Math.min(75, Math.max(50, prev[0].value + (Math.random() > 0.5 ? 1 : -1)));
        const batteryVal = Math.min(30, Math.max(10, prev[1].value + (Math.random() > 0.5 ? 1 : -1)));
        const windVal = 100 - solarVal - batteryVal;
        return [
          { name: 'Solar Energy', value: solarVal },
          { name: 'Grid Batteries', value: batteryVal },
          { name: 'Wind Energy', value: windVal }
        ];
      });

      // 4. Update latest Match 5 revenue metrics slightly
      setRevenueData(prev => {
        return prev.map((item, idx) => {
          if (idx === prev.length - 1) {
            return {
              ...item,
              tickets: item.tickets + Math.floor(Math.random() * 12000),
              food: item.food + Math.floor(Math.random() * 4000),
              merch: item.merch + Math.floor(Math.random() * 3000)
            };
          }
          return item;
        });
      });

    }, 30000);

    return () => clearInterval(interval);
  }, [mounted]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // Boost ticket sales on refresh
      setMetrics(prev => ({ ...prev, revenue: parseFloat((prev.revenue + 0.08).toFixed(2)) }));
    }, 1000);
  };

  if (!mounted || !user) return null;

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
            onClick={handleRefresh} 
            disabled={refreshing}
            className="text-xs flex gap-1.5 items-center border-slate-800 bg-[#0c101d] text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </Button>
        </div>
      </div>

      {/* TOURNAMENT KPI STATS CARD */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Attendance */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-blue-500/5" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Global Attendance</CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{metrics.attendance.toLocaleString()}</div>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <TrendingUp className="h-3 w-3" /> +14.2% over projections
            </p>
          </CardContent>
        </Card>

        {/* Global Broadcast Viewers */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-amber-500/5" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">TV & Digital Viewers</CardTitle>
            <Globe className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{metrics.broadcast} M</div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Peak: {metrics.concurrent} M concurrent streams</p>
          </CardContent>
        </Card>

        {/* Cumulative Revenue */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-emerald-500/5" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Total Portal Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">${metrics.revenue} M</div>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <TrendingUp className="h-3 w-3" /> Ad-sponsorship margins peak
            </p>
          </CardContent>
        </Card>

        {/* Security Index */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-purple-500/5" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Safety Guarantee Index</CardTitle>
            <Shield className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{metrics.safety}%</div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Response threshold: &lt; 90 seconds</p>
          </CardContent>
        </Card>
      </div>

      {/* REVENUE DASHBOARD GRAPH & MULTI STADIUM ANALYTICS */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue Graph */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Landmark className="h-4 w-4 text-emerald-400" />
              Tournament Revenue Stream Analysis ($ USD)
            </CardTitle>
            <CardDescription className="text-xs">Ticket sales, concessions (food/beverage), and merchandise gross metrics</CardDescription>
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

        {/* Multi-Stadium Monitoring */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[400px]">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Activity className="h-4.5 w-4.5 text-cyan-400" />
              Multi-Stadium Diagnostics
            </CardTitle>
            <CardDescription className="text-xs">Live status across tournament venues</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {stadiumStatus.map((stadium, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-900 bg-slate-950/30 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white leading-tight">{stadium.name}</h4>
                  <Badge variant={stadium.status === 'critical' ? 'destructive' : 'success'} className="text-[8px] py-0 px-1.5 uppercase font-mono">
                    {stadium.health}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-2 text-[10px] text-slate-400 font-mono">
                  <div>
                    Occupancy: <span className="text-white font-bold">{stadium.occupancy}%</span>
                  </div>
                  <div>
                    Active Alerts: <span className={stadium.alerts > 0 ? "text-amber-400 font-bold" : "text-white font-bold"}>{stadium.alerts}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* CROWD SUMMARY, SUSTAINABILITY & SECURITY OVERVIEW */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Crowd Density Summary */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[320px]">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
              <Users className="h-4.5 w-4.5" />
              Spectator Volume Summary
            </CardTitle>
            <CardDescription className="text-xs">Total gate throughput & congestion rates</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
            {[
              { gate: 'Gate 1 (West Concourse)', rate: '430 fans / min', density: 'Moderate flow' },
              { gate: 'Gate 2 (VIP Pavilion)', rate: '120 fans / min', density: 'Low flow' },
              { gate: 'Gate 4 (General Admission)', rate: '860 fans / min', density: 'High density queue' },
              { gate: 'Gate 5 (East Stand)', rate: '340 fans / min', density: 'Stable flow' },
            ].map((g, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded bg-slate-950/20 border border-slate-900">
                <div>
                  <h5 className="font-bold text-slate-200">{g.gate}</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">{g.density}</p>
                </div>
                <Badge variant={g.density.includes('High') ? 'destructive' : g.density.includes('Moderate') ? 'warning' : 'success'} className="text-[9px] py-0 font-mono">
                  {g.rate}
                </Badge>
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
            
            <div className="grid grid-cols-3 text-center text-[10px] text-slate-400 border-t border-slate-900/80 pt-3 font-mono">
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
              <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400 uppercase font-mono">
                <span>Security Patrols</span>
                <span className="text-white">Active</span>
              </div>
              <p className="text-slate-300 font-bold">14 Patrol Quadrants deployed</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-900 bg-slate-950/20 text-xs">
              <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400 uppercase font-mono">
                <span>Response Times</span>
                <span className="text-emerald-400">Target Met</span>
              </div>
              <p className="text-slate-300 font-bold">Average dispatch time: 48 seconds</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-900 bg-slate-950/20 text-xs">
              <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400 uppercase font-mono">
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
