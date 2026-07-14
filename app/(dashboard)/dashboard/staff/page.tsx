'use client';

import React, { useEffect, useState } from 'react';
import { DatabaseService } from '@/lib/db';
import { 
  CrowdDensity, 
  ActiveVisitors, 
  EmergencyAlert, 
  TransportStatus, 
  AccessibilityRequest, 
  SustainabilityMetrics, 
  VolunteerActivity 
} from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  Bus, 
  Accessibility, 
  Leaf, 
  Clock, 
  UserCheck, 
  PlusCircle, 
  AlertTriangle,
  RefreshCw,
  ClipboardList,
  AlertOctagon,
  CheckSquare
} from 'lucide-react';

interface TaskAssignment {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  location: string;
}

interface IncidentReport {
  id: string;
  issue: string;
  reporter: string;
  status: 'open' | 'resolved';
  time: string;
}

export default function StaffDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States for dashboard datasets
  const [crowdDensity, setCrowdDensity] = useState<CrowdDensity[]>([]);
  const [visitors, setVisitors] = useState<ActiveVisitors | null>(null);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [transport, setTransport] = useState<TransportStatus[]>([]);
  const [accessibility, setAccessibility] = useState<AccessibilityRequest[]>([]);
  const [sustainability, setSustainability] = useState<SustainabilityMetrics | null>(null);
  const [volunteers, setVolunteers] = useState<VolunteerActivity[]>([]);

  // Task & Incident mock states
  const [tasks, setTasks] = useState<TaskAssignment[]>([
    { id: 't1', title: 'Verify wheelchair ramp deployment', assignee: 'Jane (Volunteer)', priority: 'medium', status: 'pending', location: 'Gate 4 North' },
    { id: 't2', title: 'Inspect ticket scanners response lag', assignee: 'John (Tech Crew)', priority: 'high', status: 'pending', location: 'Gate B West' },
    { id: 't3', title: 'Relocate extra wastepod unit', assignee: 'Dave (Ground Staff)', priority: 'low', status: 'completed', location: 'Concourse L1' },
    { id: 't4', title: 'Distribute rain ponchos to zone volunteers', assignee: 'Sarah (Team Lead)', priority: 'medium', status: 'pending', location: 'East Pavilion' }
  ]);

  const [incidents, setIncidents] = useState<IncidentReport[]>([
    { id: 'i1', issue: 'Spill reported near concession POD 3', reporter: 'Fan (reported via AI)', status: 'open', time: '5m ago' },
    { id: 'i2', issue: 'Overcrowded stairwell queue', reporter: 'Security Crew #12', status: 'open', time: '12m ago' },
    { id: 'i3', issue: 'Damaged seat Section 102 Row G', reporter: 'Volunteer 4', status: 'resolved', time: '40m ago' }
  ]);

  // Dialog control states
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  // Form States
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<EmergencyAlert['severity']>('medium');
  const [alertLocation, setAlertLocation] = useState('');
  const [alertTeam, setAlertTeam] = useState('');

  const [accessEmail, setAccessEmail] = useState('');
  const [accessType, setAccessType] = useState<AccessibilityRequest['requestType']>('wheelchair');
  const [accessLocation, setAccessLocation] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskLocation, setTaskLocation] = useState('');

  // Hydration fix
  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [
        crowdData, 
        visitorData, 
        alertData, 
        transportData, 
        accessData, 
        sustainData, 
        volunteerData
      ] = await Promise.all([
        DatabaseService.getCrowdDensity(),
        DatabaseService.getActiveVisitors(),
        DatabaseService.getEmergencyAlerts(),
        DatabaseService.getTransportStatus(),
        DatabaseService.getAccessibilityRequests(),
        DatabaseService.getSustainabilityMetrics(),
        DatabaseService.getVolunteers()
      ]);

      setCrowdDensity(crowdData);
      setVisitors(visitorData);
      setAlerts(alertData);
      setTransport(transportData);
      setAccessibility(accessData);
      setSustainability(sustainData);
      setVolunteers(volunteerData);
    } catch (e) {
      console.error('Error fetching dashboard statistics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle || !alertDesc || !alertLocation || !alertTeam) return;

    try {
      await DatabaseService.addEmergencyAlert({
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
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessEmail || !accessLocation) return;

    try {
      await DatabaseService.addAccessibilityRequest({
        userEmail: accessEmail,
        requestType: accessType,
        location: accessLocation
      });
      setAccessEmail('');
      setAccessType('wheelchair');
      setAccessLocation('');
      setIsAccessOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskAssignee || !taskLocation) return;

    const newTask: TaskAssignment = {
      id: `t-${Math.random().toString(36).substr(2, 9)}`,
      title: taskTitle,
      assignee: taskAssignee,
      priority: taskPriority,
      status: 'pending',
      location: taskLocation
    };

    setTasks(prev => [newTask, ...prev]);
    setTaskTitle('');
    setTaskAssignee('');
    setTaskPriority('medium');
    setTaskLocation('');
    setIsTaskOpen(false);
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await DatabaseService.resolveEmergencyAlert(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  const resolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc));
  };

  if (!mounted) return null;

  const visitorChartData = visitors ? [
    { name: 'Fans', value: visitors.fans, color: '#0062ff' },
    { name: 'Staff', value: visitors.staff, color: '#10b981' },
    { name: 'VIPs', value: visitors.vip, color: '#06b6d4' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Title / Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Stadium Operations Control</h2>
          <p className="text-sm text-slate-400">Matchday Operations • FIFA World Cup 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData} 
            disabled={refreshing}
            className="text-xs flex gap-1.5 items-center border-slate-800 bg-[#0c101d]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh feeds</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsTaskOpen(true)}
            className="text-xs flex gap-1.5 items-center border-slate-800 bg-[#0c101d] text-cyan-400 hover:text-cyan-300"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Assign Task</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsAlertOpen(true)}
            className="text-xs flex gap-1.5 items-center bg-rose-700 hover:bg-rose-800"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Dispatch Emergency</span>
          </Button>
        </div>
      </div>

      {/* ----------------------------------------------------
          TOP STATS ROW
          ---------------------------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Visitors */}
        <Card className="relative overflow-hidden bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Footprint</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-9 w-28" /> : (
              <>
                <div className="text-2xl font-black text-white">{visitors?.total.toLocaleString() || '0'}</div>
                <p className="text-[10px] text-slate-400 mt-1">Fans: {visitors?.fans.toLocaleString()} • Staff: {visitors?.staff.toLocaleString()}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Emergency Alerts */}
        <Card className="relative overflow-hidden bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Emergency Dispatches</CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-9 w-28" /> : (
              <>
                <div className="text-2xl font-black text-white">
                  {alerts.filter(a => a.status !== 'resolved').length}
                </div>
                <p className="text-[10px] text-rose-400 mt-1">
                  {alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length} Urgent Incidents
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Operations Tasks */}
        <Card className="relative overflow-hidden bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Staff Tasks</CardTitle>
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
        <Card className="relative overflow-hidden bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Volunteers On Duty</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-9 w-28" /> : (
              <>
                <div className="text-2xl font-black text-white">{volunteers.length}</div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {volunteers.filter(v => v.status === 'on-duty').length} Active • {volunteers.filter(v => v.status === 'break').length} On Break
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CHARTS ROW */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Crowd Density Chart */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-cyan-400" />
              Real-Time Crowd Density distribution
            </CardTitle>
            <CardDescription className="text-xs">Real-time gate sensors detecting pedestrian volume (%)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? <Skeleton className="h-full w-full" /> : (
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
            )}
          </CardContent>
        </Card>

        {/* Visitor Distribution Chart */}
        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-400" />
              Visitor Allocation Split
            </CardTitle>
            <CardDescription className="text-xs">Total active stadium footprint by class</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            {loading ? <Skeleton className="h-full w-full" /> : (
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
                {/* Custom Legend */}
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* OPERATIONS LOGS ROW */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Emergency Dispatch */}
        <Card className="flex flex-col h-[380px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 flex flex-row justify-between items-center space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-red-400">
                <ShieldAlert className="h-4 w-4" />
                Emergency Operations
              </CardTitle>
              <CardDescription className="text-xs">Live dispatch log and unit routing</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 space-y-3">
            {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8">
                <AlertTriangle className="h-8 w-8 text-slate-600 mb-2" />
                <span>No Active Emergency Dispatches</span>
              </div>
            ) : (
              alerts.map((alert) => (
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
                  {alert.status !== 'resolved' && (
                    <div className="mt-2.5 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                        className="h-6 text-[10px] py-0 border-emerald-900/40 text-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/30 hover:border-emerald-500/40"
                      >
                        Resolve Dispatch
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tasks Assignments */}
        <Card className="flex flex-col h-[380px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-cyan-400">
                <ClipboardList className="h-4 w-4" />
                Task Assignments
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
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`h-4.5 w-4.5 rounded border transition-colors flex items-center justify-center shrink-0 ${
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

        {/* Incident Reports */}
        <Card className="flex flex-col h-[380px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-amber-400">
              <AlertOctagon className="h-4.5 w-4.5" />
              Incident Reports
            </CardTitle>
            <CardDescription className="text-xs">Live reports from crowd and AI agents</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {incidents.map((inc) => (
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
                      onClick={() => resolveIncident(inc.id)}
                      className="h-6 text-[9px] px-2 text-emerald-400 hover:bg-emerald-950/20"
                    >
                      Mark Resolved
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Transit and Accessibility Desk */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Transit Operations */}
        <Card className="flex flex-col h-[300px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
              <Bus className="h-4 w-4" />
              Transit Operations Feed
            </CardTitle>
            <CardDescription className="text-xs">Metro, Shuttles, and regional rail status</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />) : (
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
        <Card className="flex flex-col h-[300px] bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-cyan-400">
                <Accessibility className="h-4 w-4" />
                Accessibility Assistance Desk
              </CardTitle>
              <CardDescription className="text-xs">Support requests and companion routing</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAccessOpen(true)}
              className="h-7 text-[10px] px-2.5 flex items-center border-slate-800 bg-[#0c101d] text-cyan-400 hover:text-cyan-300"
            >
              <PlusCircle className="mr-1 h-3 w-3" /> Add Request
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 space-y-3">
            {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />) : accessibility.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8">
                <span>No Accessibility Tickets</span>
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
                  {!req.assignedStaff && (
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await DatabaseService.updateAccessibilityStatus(req.id, 'in-progress', 'Operations Desk');
                          fetchData();
                        }}
                        className="h-6 text-[9px] px-2 text-cyan-400 hover:bg-cyan-950/20"
                      >
                        Claim Ticket
                      </Button>
                    </div>
                  )}
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
        <form onSubmit={handleAddAlert} className="space-y-4">
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
                onChange={e => setAlertSeverity(e.target.value as EmergencyAlert['severity'])}
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
        <form onSubmit={handleAddAccessRequest} className="space-y-4">
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
                onChange={e => setAccessType(e.target.value as AccessibilityRequest['requestType'])}
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
        <form onSubmit={handleCreateTask} className="space-y-4">
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
              onChange={e => setTaskPriority(e.target.value as TaskAssignment['priority'])}
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
