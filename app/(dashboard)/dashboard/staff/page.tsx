'use client';

import React, { useState } from 'react';
import { useStadium } from '@/components/stadium/StadiumContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Users, ShieldAlert, Clock, UserCheck, PlusCircle, 
  RefreshCw, ClipboardList, AlertOctagon, CheckSquare, CheckCircle, Leaf, Trophy
} from 'lucide-react';

export default function StaffDashboard() {
  const {
    visitors,
    alerts,
    volunteers,
    tasks,
    incidents,
    timeline,
    addTask,
    toggleTask,
    addEmergency,
    resolveEmergency,
    refreshFeeds
  } = useStadium();

  const [refreshing, setRefreshing] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [alertLocation, setAlertLocation] = useState('');
  const [alertTeam, setAlertTeam] = useState('');

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

  const handleRefreshClick = () => {
    setRefreshing(true);
    refreshFeeds();
    setTimeout(() => setRefreshing(false), 800);
  };

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const openIncidents = incidents.filter(i => i.status === 'open');

  return (
    <div className="space-y-5">
      {/* Title / Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Stadium Operations Control</h2>
          <p className="text-xs text-slate-400">Matchday Operations Console • FIFA World Cup 2026</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshClick} 
            disabled={refreshing}
            className="text-xs flex gap-1.5 items-center border-slate-800 bg-[#0c101d] cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
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

      {/* Match Information Banner */}
      <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Trophy className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white">Argentina vs Germany</span>
              <Badge variant="cyan" className="text-[9px] uppercase font-mono px-1.5 py-0">Quarter Final</Badge>
            </div>
            <p className="text-[10px] text-slate-400">Stadium Alpha • Kickoff in 1h 24m • Match Ref: P. Maza (Chile)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block uppercase">Crowd Footprint</span>
            <span className="text-slate-200 font-bold">{visitors.total.toLocaleString()} ({Math.round((visitors.total / 70000) * 100)}%)</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block uppercase">Active Workforce</span>
            <span className="text-emerald-400 font-bold">{visitors.staff} Staff</span>
          </div>
        </div>
      </Card>

      {/* OPERATIONAL SUMMARY STATS ROW */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Crowd */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Active Crowd</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{visitors.total.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Capacity Load: {Math.round((visitors.total / 70000) * 100)}%</p>
        </Card>

        {/* Staff On Duty */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Staff On Duty</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{visitors.staff}</div>
          <p className="text-[10px] text-emerald-400 mt-0.5">{volunteers.length} Active Volunteers</p>
        </Card>

        {/* Open Incidents */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Open Incidents</span>
            <AlertOctagon className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{openIncidents.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Reports from telemetry</p>
        </Card>

        {/* Pending Tasks */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 p-3.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Pending Tasks</span>
            <ClipboardList className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{tasks.filter(t => t.status === 'pending').length}</div>
          <p className="text-[10px] text-cyan-400 mt-0.5">{tasks.filter(t => t.priority === 'high' && t.status === 'pending').length} High Priority</p>
        </Card>
      </div>

      {/* MAIN CONSOLE GRID */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Left Column: Live Operations Timeline & Incidents */}
        <div className="space-y-5">
          {/* Operations Timeline */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[280px]">
            <CardHeader className="py-2.5 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-white">
                <Clock className="h-4 w-4 text-cyan-400" />
                Operations Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              <div className="relative border-l border-slate-800 ml-1 pl-4 space-y-3">
                {timeline.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-[#05070c] ${
                      item.type === 'security' ? 'bg-rose-500' :
                      item.type === 'medical' ? 'bg-amber-500' :
                      item.type === 'transport' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} />
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 block">{item.time}</span>
                        <p className="text-slate-200 text-[11px] leading-tight">{item.event}</p>
                      </div>
                      <Badge variant="secondary" className="text-[8px] uppercase tracking-wider font-mono px-1 shrink-0">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Incident Log */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[260px]">
            <CardHeader className="py-2.5 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-amber-400">
                <AlertOctagon className="h-4 w-4" />
                Open Incidents
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {incidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-4 text-center">
                  <CheckCircle className="h-7 w-7 text-emerald-500 mb-1" />
                  <span className="font-bold text-white text-xs">No Active Incidents</span>
                  <span className="text-[10px] text-slate-500">All reports clear.</span>
                </div>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="p-2.5 rounded-lg border border-slate-800/80 bg-[#070b13]/50 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white truncate max-w-[150px]">{inc.issue}</span>
                      <Badge variant={inc.status === 'open' ? 'warning' : 'success'} className="text-[9px]">
                        {inc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span>Reporter: {inc.reporter}</span>
                      <span>{inc.time}</span>
                    </div>
                    {inc.status === 'open' && (
                      <div className="pt-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resolveEmergency(inc.id)}
                          className="h-5 text-[9px] px-2 text-emerald-400 hover:bg-emerald-950/20 cursor-pointer"
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
        </div>

        {/* Middle Column: Emergency Dispatch & Staff Tasks */}
        <div className="space-y-5">
          {/* Emergency Dispatch */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[280px]">
            <CardHeader className="py-2.5 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="h-4 w-4" />
                Live Alerts & Emergency Dispatch
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-4 text-center">
                  <CheckCircle className="h-7 w-7 text-emerald-500 mb-1" />
                  <span className="font-extrabold text-slate-200 text-xs">No Emergency Dispatches</span>
                  <span className="text-[10px] text-slate-500">Security nominal.</span>
                </div>
              ) : (
                activeAlerts.map((alert) => (
                  <div key={alert.id} className="p-2.5 rounded-lg border border-slate-800 bg-[#080d19]/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white truncate max-w-[140px]">{alert.title}</span>
                      <Badge variant={alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'warning'} className="text-[9px]">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-tight">{alert.description}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1">
                      <span>Loc: {alert.location}</span>
                      <span>Team: {alert.assignedTeam}</span>
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveEmergency(alert.id)}
                        className="h-5 text-[9px] px-2 border-emerald-900/40 text-emerald-400 bg-emerald-950/10 cursor-pointer"
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[260px]">
            <CardHeader className="py-2.5 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-cyan-400">
                <ClipboardList className="h-4 w-4" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="p-2 rounded-lg border border-slate-800 bg-[#070b13]/40 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                          task.status === 'completed' 
                            ? 'bg-emerald-600 border-emerald-500 text-white' 
                            : 'border-slate-700 bg-slate-900/60 text-transparent'
                        }`}
                      >
                        <CheckSquare className="h-3 w-3 text-white" />
                      </button>
                      <span className={`font-semibold text-slate-200 text-[11px] truncate max-w-[130px] ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[8px]">
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500">
                    <span>Loc: {task.location}</span>
                    <span className="text-cyan-400 font-bold">{task.assignee}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sustainability Summary */}
        <div className="space-y-5">
          <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[555px]">
            <CardHeader className="py-2.5 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400">
                <Leaf className="h-4 w-4" />
                Sustainability Summary
              </CardTitle>
              <CardDescription className="text-[10px]">Resource & waste telemetry</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 text-xs">
              {/* Recycling Bins */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Recycling Bin Status</span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
                  <div className="p-1.5 rounded border border-slate-900 bg-slate-950/40">
                    <span className="text-slate-400 block text-[9px]">Organic</span>
                    <span className="font-bold text-emerald-400">75%</span>
                  </div>
                  <div className="p-1.5 rounded border border-slate-900 bg-slate-950/40">
                    <span className="text-slate-400 block text-[9px]">Plastic</span>
                    <span className="font-bold text-emerald-400">45%</span>
                  </div>
                  <div className="p-1.5 rounded border border-slate-900 bg-rose-950/20 border-rose-900/30">
                    <span className="text-slate-400 block text-[9px]">General</span>
                    <span className="font-bold text-rose-400">90% (Req)</span>
                  </div>
                </div>
              </div>

              {/* Water Refill Stations */}
              <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Water Refill Stations</span>
                  <span className="text-slate-200 font-bold block text-xs mt-0.5">8 / 8 Online</span>
                </div>
                <Badge variant="success" className="text-[8px]">Active</Badge>
              </div>

              {/* Waste Collection Schedule */}
              <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Waste Sweep Schedule</span>
                  <span className="text-slate-200 font-bold block text-xs mt-0.5">22:30 (Halftime)</span>
                </div>
                <Badge variant="cyan" className="text-[8px] font-mono">ON TIME</Badge>
              </div>

              {/* Energy Grid Status */}
              <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Solar Grid Canopy</span>
                  <span className="text-slate-200 font-bold block text-xs mt-0.5">3,600 kW Load</span>
                </div>
                <Badge variant="success" className="text-[8px]">Optimal</Badge>
              </div>

              {/* Telemetry Indicator */}
              <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/20 text-[10px] text-slate-400 leading-relaxed">
                <span className="font-bold text-emerald-400 block mb-0.5">Environmental Audit</span>
                Waste diverted from landfill: 84.2%. Carbon neutral target on schedule for matchday.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DIALOGS */}
      {/* Emergency Alert Dispatch Dialog */}
      <Dialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Dispatch Security & Emergency Units"
        description="Initiate an active emergency alert and dispatch the relevant stadium workforce team."
      >
        <form onSubmit={handleAddAlertSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Incident Title</label>
            <Input
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
              placeholder="e.g. Turnstile Sensor Overload Gate 3"
              className="mt-1 bg-slate-950 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Severity</label>
            <select
              value={alertSeverity}
              onChange={(e) => setAlertSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Location</label>
            <Input
              value={alertLocation}
              onChange={(e) => setAlertLocation(e.target.value)}
              placeholder="e.g. Gate 3 / Section 104"
              className="mt-1 bg-slate-950 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Assigned Team</label>
            <Input
              value={alertTeam}
              onChange={(e) => setAlertTeam(e.target.value)}
              placeholder="e.g. Security Response Alpha"
              className="mt-1 bg-slate-950 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <Input
              value={alertDesc}
              onChange={(e) => setAlertDesc(e.target.value)}
              placeholder="Provide tactical operational details..."
              className="mt-1 bg-slate-950 text-xs text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAlertOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="destructive" size="sm" className="text-xs">
              Dispatch Incident
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Task Creation Dialog */}
      <Dialog
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        title="Assign Operations Task"
        description="Create and assign a tactical task to on-duty stadium staff."
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Task Title</label>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Restock Water Stations"
              className="mt-1 bg-slate-950 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Assignee</label>
            <Input
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
              placeholder="e.g. Logistics Team 4"
              className="mt-1 bg-slate-950 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Location</label>
            <Input
              value={taskLocation}
              onChange={(e) => setTaskLocation(e.target.value)}
              placeholder="e.g. Gate 2 Concourse"
              className="mt-1 bg-slate-950 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Priority</label>
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsTaskOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white">
              Assign Task
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
