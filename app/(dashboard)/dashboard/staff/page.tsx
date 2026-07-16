'use client';

import React, { useState } from 'react';
import { useStadium } from '@/components/stadium/StadiumContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then((m) => m.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then((m) => m.Bar),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((m) => m.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((m) => m.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((m) => m.Tooltip),
  { ssr: false }
);
const PieChart = dynamic(
  () => import('recharts').then((m) => m.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import('recharts').then((m) => m.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then((m) => m.Cell),
  { ssr: false }
);
import { 
  Users, ShieldAlert, Activity, Bus, Accessibility, Clock, UserCheck, PlusCircle, 
  RefreshCw, ClipboardList, AlertOctagon, CheckSquare, CheckCircle, Trophy, Sparkles, Leaf
} from 'lucide-react';

export default function StaffDashboard() {
  // Consume global synchronized context
  const {
    crowdDensity,
    visitors,
    alerts,
    transport,
    accessibility,
    volunteers,
    tasks,
    incidents,
    timeline,
    addTask,
    toggleTask,
    addEmergency,
    resolveEmergency,
    claimAccessibility,
    refreshFeeds,
    refreshTransit
  } = useStadium();

  const [refreshing, setRefreshing] = useState(false);

  // Dialog control states
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  // Form States
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [alertLocation, setAlertLocation] = useState('');
  const [alertTeam, setAlertTeam] = useState('');

  const [accessEmail, setAccessEmail] = useState('');
  const [accessType, setAccessType] = useState<'wheelchair' | 'sensory' | 'guide' | 'sign-language' | 'other'>('wheelchair');
  const [accessLocation, setAccessLocation] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskLocation, setTaskLocation] = useState('');

  const handleAddAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle || !alertDesc || !alertLocation || !alertTeam) return;

    addEmergency({
      title: alertTitle,
      description: alertDesc,
      severity: alertSeverity,
      location: alertLocation,
      assignedTeam: alertTeam
    });

    setAlertTitle('');
    setAlertDesc('');
    setAlertSeverity('medium');
    setAlertLocation('');
    setAlertTeam('');
    setIsAlertOpen(false);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskAssignee || !taskLocation) return;

    addTask({
      title: taskTitle,
      assignee: taskAssignee,
      priority: taskPriority,
      location: taskLocation
    });

    setTaskTitle('');
    setTaskAssignee('');
    setTaskPriority('medium');
    setTaskLocation('');
    setIsTaskOpen(false);
  };

  const handleAddAccessRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessEmail || !accessLocation) return;

    const uniqueAccessId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `access-${crypto.randomUUID()}`
      : `access-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    claimAccessibility(uniqueAccessId); // Mock request creation through dispatcher
    setAccessEmail('');
    setAccessType('wheelchair');
    setAccessLocation('');
    setIsAccessOpen(false);
  };

  const handleRefreshClick = () => {
    setRefreshing(true);
    refreshFeeds();
    setTimeout(() => setRefreshing(false), 800);
  };

  const visitorChartData = visitors ? [
    { name: 'Fans', value: visitors.fans, color: '#0062ff' },
    { name: 'Staff', value: visitors.staff, color: '#10b981' },
    { name: 'VIPs', value: visitors.vip, color: '#06b6d4' }
  ] : [];

  const PREDICTIVE_ALERTS = [
    { id: 'p1', message: 'Gate 3 queue likely to exceed capacity in 18 minutes.', confidence: 92 },
    { id: 'p2', message: 'Food Court A concessions projected to peak at halftime.', confidence: 88 },
    { id: 'p3', message: 'Metro station departure load forecast peak in 45 mins.', confidence: 94 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title / Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Stadium Operations Control</h2>
          <p className="text-sm text-slate-400">Matchday Operations Desk • FIFA World Cup 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshClick} 
            disabled={refreshing}
            className="text-xs flex gap-1.5 items-center border-slate-800 bg-[#0c101d] cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh feeds</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsTaskOpen(true)}
            className="text-xs flex gap-1.5 items-center border-slate-800 bg-[#0c101d] text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Assign Task</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsAlertOpen(true)}
            className="text-xs flex gap-1.5 items-center bg-rose-700 hover:bg-rose-800 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Dispatch Emergency</span>
          </Button>
        </div>
      </div>

      {/* Global Match Center & AI Predictive Alerts */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Match Center Card (Staff Operations View) */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent blur-3xl rounded-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Trophy className="h-4.5 w-4.5 text-amber-400" />
                Global Match Center (Operations Console)
              </span>
              <Badge variant="cyan" className="text-[9px] uppercase tracking-wider font-mono">Quarter Final</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Stadium Alpha Matchday Telemetry Hub</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between text-center bg-slate-950/40 border border-slate-900 rounded-xl p-4">
              <div className="flex-1">
                <span className="text-2xl font-black block text-white">ARG</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Argentina</span>
              </div>
              <div className="px-4">
                <span className="text-[9px] font-mono font-bold text-cyan-400 block mb-1">COUNTDOWN</span>
                <Badge variant="secondary" className="font-mono text-sm py-1 px-3 bg-blue-950/80 text-blue-300 border border-blue-800/40">1h 24m</Badge>
              </div>
              <div className="flex-1">
                <span className="text-2xl font-black block text-white">GER</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Germany</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3.5 text-xs text-center">
              <div className="p-2.5 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider mb-0.5">Match Ref</span>
                <span className="text-slate-200 font-bold">P. Maza (Chile)</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider mb-0.5">Crowd Footprint</span>
                <span className="text-slate-200 font-bold">{visitors.total.toLocaleString()} ({Math.round((visitors.total/70000)*100)}%)</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider mb-0.5">Workforce</span>
                <span className="text-emerald-400 font-bold">{visitors.staff} Active Staff</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] text-center border-t border-slate-900/60 pt-3">
              {crowdDensity.slice(0, 4).map((c, i) => (
                <div key={i}>
                  <span className="text-slate-500 block truncate max-w-[80px]">{c.zone.split(' ')[0]} {c.zone.split(' ')[1]}</span>
                  <span className={`font-bold ${c.density > 85 ? 'text-rose-500' : c.density > 65 ? 'text-amber-500' : 'text-emerald-400'}`}>
                    {c.density}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Predictive Alerts Widget */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/60">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
                AI Predictive Alerts
              </span>
              <Badge variant="cyan" className="text-[9px] uppercase font-mono">Predictive</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Risk projections based on crowd flows</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {PREDICTIVE_ALERTS.map((pred) => (
                <div key={pred.id} className="p-2.5 rounded border border-slate-800 bg-[#070b13]/20 flex justify-between items-start gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-300 block leading-tight">{pred.message}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-cyan-400 font-black block font-mono">{pred.confidence}%</span>
                    <span className="text-[8px] text-slate-500 block font-mono">Conf</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STATS ROW */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Visitors */}
        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Active Footprint</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{visitors.total.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 mt-1">Fans: {visitors.fans.toLocaleString()} • Staff: {visitors.staff.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Emergency Alerts */}
        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Emergency Dispatches</CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white text-rose-400">
              {alerts.filter(a => a.status !== 'resolved').length}
            </div>
            <p className="text-[10px] text-rose-400 mt-1">
              {alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length} Urgent Incidents
            </p>
          </CardContent>
        </Card>

        {/* Pending Operations Tasks */}
        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Pending Staff Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">
              {tasks.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-[10px] text-cyan-400 mt-1">
              {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length} Urgent Assignments
            </p>
          </CardContent>
        </Card>

        {/* Active Volunteers */}
        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Volunteers On Duty</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{volunteers.length}</div>
            <p className="text-[10px] text-slate-400 mt-1">
              {volunteers.filter(v => v.status === 'on-duty').length} Active • {volunteers.filter(v => v.status === 'break').length} On Break
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS ROW */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Crowd Density Chart */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Activity className="h-4 w-4 text-cyan-400" />
              Real-Time Crowd Density distribution
            </CardTitle>
            <CardDescription className="text-xs">Real-time gate sensors detecting volume (%)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crowdDensity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="zone" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  labelStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                />
                <Bar dataKey="density" radius={[4, 4, 0, 0]}>
                  {crowdDensity.map((entry, index) => {
                    let color = '#3b82f6';
                    if (entry.status === 'critical') color = '#ef4444';
                    else if (entry.status === 'high') color = '#f97316';
                    else if (entry.status === 'low') color = '#10b981';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visitor Distribution Chart */}
        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Users className="h-4 w-4 text-blue-400" />
              Visitor Allocation Split
            </CardTitle>
            <CardDescription className="text-xs">Total active stadium footprint by class</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <div className="w-full h-full flex flex-col justify-between">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visitorChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {visitorChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-xs border-t border-slate-900/60 pt-4">
                {visitorChartData.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-white font-bold font-mono text-[11px] mt-0.5">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OPERATIONS LOGS & TIMELINE ROW */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Live Operations Timeline */}
        <Card className="flex flex-col h-[380px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Clock className="h-4.5 w-4.5 text-cyan-400" />
              Live Operations Timeline
            </CardTitle>
            <CardDescription className="text-xs">Dynamic matchday operations feed (Newest first)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="relative border-l-2 border-slate-800 ml-1.5 pl-5 space-y-4">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative text-xs">
                  <span className={`absolute -left-[26px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#05070c] ${
                    item.type === 'security' ? 'bg-rose-500' :
                    item.type === 'medical' ? 'bg-amber-500' :
                    item.type === 'transport' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block mb-0.5">{item.time}</span>
                      <p className="text-slate-200 leading-normal">{item.event}</p>
                    </div>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-mono px-1">
                      {item.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incident Reports */}
        <Card className="flex flex-col h-[380px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-amber-400">
              <AlertOctagon className="h-4.5 w-4.5" />
              Incident Log
            </CardTitle>
            <CardDescription className="text-xs">Live reports from crowd and AI agents</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {incidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8">
                <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                <span className="font-bold text-white">No Active Incidents</span>
                <span className="text-[10px] text-slate-500 mt-1">All reports are clear.</span>
              </div>
            ) : (
              incidents.map((inc) => (
                <div key={inc.id} className="p-3 rounded-lg border border-slate-800 bg-[#080d19]/40 text-xs">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-white truncate max-w-[160px]">{inc.issue}</span>
                    <Badge variant={inc.status === 'open' ? 'warning' : 'success'}>
                      {inc.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 border-t border-slate-900/40 pt-1.5">
                    <span>Reporter: {inc.reporter}</span>
                    <span>{inc.time}</span>
                  </div>
                  {inc.status === 'open' && (
                    <div className="mt-2.5 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveEmergency(inc.id)}
                        className="h-6 text-[9px] px-2 text-emerald-400 hover:bg-emerald-950/20 cursor-pointer"
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sustainability Operations Widget */}
        <Card className="flex flex-col h-[380px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-emerald-400">
              <Leaf className="h-4.5 w-4.5" />
              Sustainability Operations
            </CardTitle>
            <CardDescription className="text-xs">Waste & resource telemetry audits</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 text-xs">
            {/* Recycling Bins */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Recycling Bin Status</span>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
                <div className="p-1.5 rounded border border-slate-900 bg-slate-950/40">
                  <span className="text-slate-400 block truncate">Organic</span>
                  <span className="font-bold text-emerald-400">75% (Stable)</span>
                </div>
                <div className="p-1.5 rounded border border-slate-900 bg-slate-950/40">
                  <span className="text-slate-400 block truncate">Plastic</span>
                  <span className="font-bold text-emerald-400">45% (Stable)</span>
                </div>
                <div className="p-1.5 rounded border border-slate-900 bg-[#ef4444]/10 border-[#ef4444]/20">
                  <span className="text-slate-400 block truncate">General</span>
                  <span className="font-bold text-rose-400">90% (Service Req)</span>
                </div>
              </div>
            </div>

            {/* Water Refill Stations */}
            <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Water Refill Stations</span>
                <span className="text-slate-200 font-bold block mt-0.5">8 / 8 Stations Online</span>
              </div>
              <Badge variant="success" className="text-[9px] uppercase tracking-wider">Active</Badge>
            </div>

            {/* Waste Collection Schedule */}
            <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Waste Collection Schedule</span>
                <span className="text-slate-200 font-bold block mt-0.5">Next Sweep: 22:30 (Halftime)</span>
              </div>
              <Badge variant="cyan" className="text-[9px] uppercase tracking-wider font-mono">ON SCHEDULE</Badge>
            </div>

            {/* Energy Grid Status / Alerts */}
            <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Energy Grid Alerts</span>
                <span className="text-slate-200 font-bold block mt-0.5">Solar Canopy Load: 3,600 kW</span>
              </div>
              <Badge variant="success" className="text-[9px] uppercase tracking-wider">Optimal</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DISPATCHES, TASKS, TRANSIT & ACCESSIBILITY DESKS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Emergency Dispatch */}
        <Card className="flex flex-col h-[320px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 flex flex-row justify-between items-center space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="h-4 w-4" />
                Emergency Operations Desk
              </CardTitle>
              <CardDescription className="text-xs">Security routing & trauma unit dispatch</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 space-y-3">
            {alerts.filter(a => a.status !== 'resolved').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-900">
                <CheckCircle className="h-9 w-9 text-emerald-500 mb-2" />
                <span className="font-extrabold text-slate-200">No Active Emergencies</span>
                <span className="text-[10px] text-slate-500 mt-1">Great job! No current incidents require attention.</span>
              </div>
            ) : (
              alerts.filter(a => a.status !== 'resolved').map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg border border-slate-800 bg-[#080d19]/55 hover:border-slate-700/60 transition-all text-xs">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-white truncate max-w-[150px]">{alert.title}</span>
                    <Badge variant={alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'warning'}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900/60 pt-1.5">
                    <span>Loc: {alert.location}</span>
                    <span>Team: {alert.assignedTeam}</span>
                  </div>
                  <div className="mt-2.5 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveEmergency(alert.id)}
                      className="h-6 text-[10px] py-0 border-emerald-900/40 text-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/30 hover:border-emerald-500/40 cursor-pointer"
                    >
                      Resolve Dispatch
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tasks Assignments */}
        <Card className="flex flex-col h-[320px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-cyan-400">
                <ClipboardList className="h-4 w-4" />
                Staff Tasks
              </CardTitle>
              <CardDescription className="text-xs">Manage active operations tasks</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 rounded-lg border border-slate-800 bg-[#080d19]/40 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`h-4.5 w-4.5 rounded border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                        task.status === 'completed' 
                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                          : 'border-slate-700 bg-slate-900/60 text-transparent hover:border-cyan-500/60'
                      }`}
                    >
                      <CheckSquare className="h-3 w-3 text-white" />
                    </button>
                    <span className={`font-semibold text-slate-200 truncate max-w-[130px] ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900/60 pt-1.5">
                  <span>Loc: {task.location}</span>
                  <span className="text-cyan-400 font-bold">{task.assignee}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Transit Operations */}
        <Card className="flex flex-col h-[320px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 flex flex-row justify-between items-center space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                <Bus className="h-4 w-4" />
                Transit Desk
              </CardTitle>
              <CardDescription className="text-xs">Metro, Shuttles, and regional rail status</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshTransit}
              className="h-7 text-[10px] px-2.5 flex items-center border-slate-800 bg-[#0c101d] text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Refresh Schedule
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {transport.filter(t => t.status === 'delayed').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-900">
                <CheckCircle className="h-9 w-9 text-emerald-500 mb-2" />
                <span className="font-extrabold text-slate-200">No Transportation Delays</span>
                <span className="text-[10px] text-slate-500 mt-1">Transit systems operating normally.</span>
              </div>
            ) : (
              transport.map((transit) => (
                <div key={transit.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800/80 bg-[#080d19]/40 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/30">
                      <Bus className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white truncate max-w-[150px]">{transit.lineName}</h4>
                      <p className="text-[10px] text-slate-500 capitalize">Mode: {transit.mode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={transit.status === 'on-time' ? 'success' : 'warning'}>
                      {transit.status === 'on-time' ? `${transit.etaMinutes}m ETA` : transit.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Accessibility Desk */}
        <Card className="flex flex-col h-[320px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-cyan-400">
                <Accessibility className="h-4 w-4" />
                Accessibility Desk
              </CardTitle>
              <CardDescription className="text-xs">Support requests and companion routing</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAccessOpen(true)}
              className="h-7 text-[10px] px-2.5 flex items-center border-slate-800 bg-[#0c101d] text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              <PlusCircle className="mr-1 h-3 w-3" /> Add Request
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 space-y-3">
            {accessibility.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-900">
                <CheckCircle className="h-9 w-9 text-emerald-500 mb-2" />
                <span className="font-extrabold text-slate-200">No Accessibility Requests</span>
                <span className="text-[10px] text-slate-500 mt-1">All visitor requests have been completed.</span>
              </div>
            ) : (
              accessibility.map((req) => (
                <div key={req.id} className="p-3 rounded-lg border border-slate-800 bg-[#080d19]/40 text-xs">
                  <div className="flex items-center justify-between font-bold mb-1.5">
                    <span className="capitalize text-white">{req.requestType} Assistant</span>
                    <Badge variant={req.status === 'pending' ? 'warning' : req.status === 'in-progress' ? 'cyan' : 'success'}>
                      {req.status}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-1 mb-2">
                    <p>Location: <span className="text-slate-200">{req.location}</span></p>
                    <p>Email: <span className="text-slate-300">{req.userEmail}</span></p>
                  </div>
                  {req.status === 'pending' ? (
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => claimAccessibility(req.id)}
                        className="h-6 text-[9px] px-2 text-cyan-400 hover:bg-cyan-950/20 cursor-pointer"
                      >
                        Claim Ticket
                      </Button>
                    </div>
                  ) : req.assignedStaff ? (
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 border-t border-slate-900/60 pt-1.5 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>Assigned: {req.assignedStaff}</span>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------
          MODALS
          ---------------------------------------------------- */}

      {/* Emergency Alert Dispatch Dialog */}
      <Dialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Dispatch Security & Emergency Units"
        description="Initiate an active emergency alert and dispatch the relevant stadium workforce team."
      >
        <form onSubmit={handleAddAlertSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Alert Heading</label>
            <Input 
              placeholder="e.g. Broken turnstile / Heat exhaustion" 
              value={alertTitle} 
              onChange={e => setAlertTitle(e.target.value)} 
              className="mt-1"
              required 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Description</label>
            <Input 
              placeholder="Detailed description of active incident..." 
              value={alertDesc} 
              onChange={e => setAlertDesc(e.target.value)} 
              className="mt-1"
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Severity Level</label>
              <Select
                options={[
                  { value: 'low', label: 'Low Severity' },
                  { value: 'medium', label: 'Medium Severity' },
                  { value: 'high', label: 'High Severity' },
                  { value: 'critical', label: 'Critical Incident' }
                ]}
                value={alertSeverity}
                onChange={e => setAlertSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Zone / Location</label>
              <Input 
                placeholder="e.g. Section 102" 
                value={alertLocation} 
                onChange={e => setAlertLocation(e.target.value)} 
                className="mt-1"
                required 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Assigned Squad</label>
            <Input 
              placeholder="e.g. Crowd Control Alpha / Medical 3" 
              value={alertTeam} 
              onChange={e => setAlertTeam(e.target.value)} 
              className="mt-1"
              required 
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsAlertOpen(false)}>Cancel</Button>
            <Button variant="destructive" type="submit">Deploy Emergency Alert</Button>
          </div>
        </form>
      </Dialog>

      {/* Accessibility request dialog */}
      <Dialog
        isOpen={isAccessOpen}
        onClose={() => setIsAccessOpen(false)}
        title="Register Accessibility Assistance ticket"
        description="Book assistive equipment or dispatch accessibility volunteers to escort spectators."
      >
        <form onSubmit={handleAddAccessRequestSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">User/Fan Email</label>
            <Input 
              type="email" 
              placeholder="spectator@example.com" 
              value={accessEmail} 
              onChange={e => setAccessEmail(e.target.value)} 
              className="mt-1"
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Support Type</label>
              <Select
                options={[
                  { value: 'wheelchair', label: 'Wheelchair Assistance' },
                  { value: 'guide', label: 'Audio/Visual Guide' },
                  { value: 'sensory', label: 'Sensory Kit Booking' },
                  { value: 'sign-language', label: 'Sign Language Escort' },
                  { value: 'other', label: 'Other Special Help' }
                ]}
                value={accessType}
                onChange={e => setAccessType(e.target.value as 'wheelchair' | 'sensory' | 'guide' | 'sign-language' | 'other')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Meeting Point</label>
              <Input 
                placeholder="e.g. Gate 1 Taxi stand" 
                value={accessLocation} 
                onChange={e => setAccessLocation(e.target.value)} 
                className="mt-1"
                required 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsAccessOpen(false)}>Cancel</Button>
            <Button variant="default" type="submit">Submit Request</Button>
          </div>
        </form>
      </Dialog>

      {/* Assign Task dialog */}
      <Dialog
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        title="Assign Operations Task"
        description="Create an assignment for venue operations and volunteer teams."
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Task Title</label>
            <Input 
              placeholder="e.g. Clear spill near Section 102" 
              value={taskTitle} 
              onChange={e => setTaskTitle(e.target.value)} 
              className="mt-1"
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Assignee Name</label>
              <Input 
                placeholder="e.g. John (Tech Crew)" 
                value={taskAssignee} 
                onChange={e => setTaskAssignee(e.target.value)} 
                className="mt-1"
                required 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Task Location</label>
              <Input 
                placeholder="e.g. Gate 4 entrance" 
                value={taskLocation} 
                onChange={e => setTaskLocation(e.target.value)} 
                className="mt-1"
                required 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Priority Level</label>
            <Select
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' }
              ]}
              value={taskPriority}
              onChange={e => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsTaskOpen(false)}>Cancel</Button>
            <Button variant="default" type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Create Task</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
