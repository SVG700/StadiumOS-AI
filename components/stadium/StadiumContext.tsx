'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CrowdDensity, ActiveVisitors, EmergencyAlert, TransportStatus, 
  AccessibilityRequest, SustainabilityMetrics, VolunteerActivity 
} from '@/types';

export interface TaskAssignment {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  location: string;
}

export interface IncidentReport {
  id: string;
  issue: string;
  reporter: string;
  status: 'open' | 'resolved';
  time: string;
}

export interface TimelineItem {
  time: string;
  event: string;
  type: 'security' | 'medical' | 'transport' | 'operational' | 'system';
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'operational' | 'transport' | 'medical' | 'security' | 'visitor';
  read: boolean;
  timestamp: string;
}

export interface OperationHistoryItem {
  id: string;
  prompt: string;
  time: string;
  actionName: string;
  outcome: string;
  status: 'success' | 'cancelled' | 'rolled_back';
  prevState: {
    crowdDensity: CrowdDensity[];
    visitors: ActiveVisitors;
    alerts: EmergencyAlert[];
    transport: TransportStatus[];
    accessibility: AccessibilityRequest[];
    sustainability: SustainabilityMetrics;
    volunteers: VolunteerActivity[];
    tasks: TaskAssignment[];
    incidents: IncidentReport[];
  };
}

export interface OperationReport {
  title: string;
  beforeVal: string;
  afterVal: string;
  metricLabel: string;
  divertedCount: number;
  extraStaff: number;
  waitBefore: string;
  waitAfter: string;
}

interface StadiumContextType {
  stadiumHealth: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  healthScore: number;
  crowdDensity: CrowdDensity[];
  visitors: ActiveVisitors;
  alerts: EmergencyAlert[];
  transport: TransportStatus[];
  accessibility: AccessibilityRequest[];
  sustainability: SustainabilityMetrics;
  volunteers: VolunteerActivity[];
  tasks: TaskAssignment[];
  incidents: IncidentReport[];
  timeline: TimelineItem[];
  notifications: NotificationItem[];
  history: OperationHistoryItem[];
  activeReport: OperationReport | null;
  setActiveReport: (report: OperationReport | null) => void;
  executeAction: (actionType: string, prompt: string) => Promise<boolean>;
  rollbackOperation: (historyId: string) => void;
  rejectRecommendation: (actionType: string, prompt: string) => void;
  addTask: (task: Omit<TaskAssignment, 'id' | 'status'>) => void;
  toggleTask: (id: string) => void;
  addEmergency: (alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => void;
  resolveEmergency: (id: string) => void;
  claimAccessibility: (id: string) => void;
  refreshFeeds: () => void;
  refreshTransit: () => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
}

const StadiumContext = createContext<StadiumContextType | undefined>(undefined);

// Initial default states
const INITIAL_CROWD: CrowdDensity[] = [
  { zone: 'Zone A (Gate 1-3)', density: 78, capacity: 15000, currentCount: 11700, status: 'high' },
  { zone: 'Zone B (Gate 4-6)', density: 45, capacity: 15000, currentCount: 6750, status: 'moderate' },
  { zone: 'Zone C (Concourse North)', density: 92, capacity: 8000, currentCount: 7360, status: 'critical' },
  { zone: 'Zone D (Concourse South)', density: 60, capacity: 8000, currentCount: 4800, status: 'moderate' },
  { zone: 'Zone E (VIP Lounge)', density: 30, capacity: 2000, currentCount: 600, status: 'low' },
  { zone: 'Zone F (Press Box)', density: 55, capacity: 1000, currentCount: 550, status: 'moderate' },
];

const INITIAL_VISITORS: ActiveVisitors = { total: 68420, fans: 65120, staff: 2800, vip: 500 };

const INITIAL_ALERTS: EmergencyAlert[] = [
  { id: 'alert-1', title: 'Crowd Congestion at Gate 3', description: 'High traffic density slowing entry. Re-routing incoming fans to Gate 4.', severity: 'medium', location: 'Gate 3 Turnstiles', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: 'active', assignedTeam: 'Crowd Control Alpha' },
  { id: 'alert-2', title: 'Elevator Outage', description: 'Elevator EL-4 in West Stand is unresponsive. Technician dispatched.', severity: 'low', location: 'West Stand (Level 2)', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: 'investigating', assignedTeam: 'Maintenance Team B' },
  { id: 'alert-3', title: 'Medical Assistance Required', description: 'Spectator experiencing heat exhaustion in Section 104.', severity: 'high', location: 'Section 104, Row K', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: 'active', assignedTeam: 'Medical Response 1' },
];

const INITIAL_TRANSPORT: TransportStatus[] = [
  { id: 't-1', mode: 'metro', lineName: 'Stadium Express (Line 1)', status: 'on-time', etaMinutes: 4, occupancy: 'high' },
  { id: 't-2', mode: 'bus', lineName: 'Downtown Shuttle (Route A)', status: 'delayed', etaMinutes: 12, occupancy: 'medium', delayReason: 'Traffic near Expressway' },
  { id: 't-3', mode: 'shuttle', lineName: 'West Parking Lot Transfer', status: 'on-time', etaMinutes: 3, occupancy: 'low' },
  { id: 't-4', mode: 'train', lineName: 'Regional Commuter Rail', status: 'on-time', etaMinutes: 18, occupancy: 'high' },
];

const INITIAL_ACCESSIBILITY: AccessibilityRequest[] = [
  { id: 'req-1', userEmail: 'fan1@example.com', requestType: 'wheelchair', location: 'Gate 1 Drop-off Zone', status: 'in-progress', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), assignedStaff: 'Volunteer Sarah M.' },
  { id: 'req-2', userEmail: 'fan2@example.com', requestType: 'sensory', location: 'Suite 24 Entrance', status: 'pending', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: 'req-3', userEmail: 'fan3@example.com', requestType: 'guide', location: 'Information Desk North', status: 'completed', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), assignedStaff: 'Volunteer David K.' },
];

const INITIAL_SUSTAINABILITY: SustainabilityMetrics = { energyUsageKw: 4200, renewablePercentage: 86, carbonOffsetKg: 3240, wasteRecycledKg: 1480, waterSavedLitres: 12400 };

const INITIAL_VOLUNTEERS: VolunteerActivity[] = [
  { id: 'v-1', name: 'Marcus Vance', task: 'Crowd Directing', location: 'Gate 3', status: 'on-duty', checkInTime: '15:30' },
  { id: 'v-2', name: 'Elena Rostova', task: 'Medical Aid Post B', location: 'Section 112', status: 'on-duty', checkInTime: '16:00' },
  { id: 'v-3', name: 'Kenji Sato', task: 'Accessibility Escort', location: 'Gate 1', status: 'on-duty', checkInTime: '15:45' },
  { id: 'v-4', name: 'Amina Diop', task: 'Sustainability Information', location: 'Green Plaza', status: 'break', checkInTime: '15:00' },
];

const INITIAL_TASKS: TaskAssignment[] = [
  { id: 't1', title: 'Verify wheelchair ramp deployment', assignee: 'Jane (Volunteer)', priority: 'medium', status: 'pending', location: 'Gate 4 North' },
  { id: 't2', title: 'Inspect ticket scanners response lag', assignee: 'John (Tech Crew)', priority: 'high', status: 'pending', location: 'Gate B West' },
  { id: 't3', title: 'Relocate extra wastepod unit', assignee: 'Dave (Ground Staff)', priority: 'low', status: 'completed', location: 'Concourse L1' },
];

const INITIAL_INCIDENTS: IncidentReport[] = [
  { id: 'i1', issue: 'Spill reported near concession POD 3', reporter: 'Fan (reported via AI)', status: 'open', time: '5m ago' },
  { id: 'i2', issue: 'Overcrowded stairwell queue', reporter: 'Security Crew #12', status: 'open', time: '12m ago' },
  { id: 'i3', issue: 'Damaged seat Section 102 Row G', reporter: 'Volunteer 4', status: 'resolved', time: '40m ago' }
];

const INITIAL_TIMELINE: TimelineItem[] = [
  { time: '14:29', event: 'Gate 3 congestion warning updated.', type: 'security' },
  { time: '14:26', event: 'VIP convoy entered West gate bay.', type: 'operational' },
  { time: '14:20', event: 'Medical Team Alpha dispatched to Section 104.', type: 'medical' },
  { time: '14:18', event: 'Metro express arrived at North Terminal.', type: 'transport' },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', message: 'Gate 3 congestion detected. Reroutes active.', type: 'security', read: false, timestamp: '14:32' },
  { id: 'n2', message: 'Medical response completed at Section 104.', type: 'medical', read: false, timestamp: '14:29' },
  { id: 'n3', message: 'Metro express delayed by 8 minutes (signal lag).', type: 'transport', read: false, timestamp: '14:25' },
];

export const StadiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [crowdDensity, setCrowdDensity] = useState<CrowdDensity[]>(INITIAL_CROWD);
  const [visitors, setVisitors] = useState<ActiveVisitors>(INITIAL_VISITORS);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(INITIAL_ALERTS);
  const [transport, setTransport] = useState<TransportStatus[]>(INITIAL_TRANSPORT);
  const [accessibility, setAccessibility] = useState<AccessibilityRequest[]>(INITIAL_ACCESSIBILITY);
  const [sustainability, setSustainability] = useState<SustainabilityMetrics>(INITIAL_SUSTAINABILITY);
  const [volunteers, setVolunteers] = useState<VolunteerActivity[]>(INITIAL_VOLUNTEERS);
  const [tasks, setTasks] = useState<TaskAssignment[]>(INITIAL_TASKS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [timeline, setTimeline] = useState<TimelineItem[]>(INITIAL_TIMELINE);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [history, setHistory] = useState<OperationHistoryItem[]>([]);
  
  const [activeReport, setActiveReport] = useState<OperationReport | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getL = (key: string, fallback: any) => {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      };
      setCrowdDensity(getL('stadium_crowd_density', INITIAL_CROWD));
      setVisitors(getL('stadium_active_visitors', INITIAL_VISITORS));
      setAlerts(getL('stadium_emergency_alerts', INITIAL_ALERTS));
      setTransport(getL('stadium_transport_status', INITIAL_TRANSPORT));
      setAccessibility(getL('stadium_accessibility_requests', INITIAL_ACCESSIBILITY));
      setSustainability(getL('stadium_sustainability_metrics', INITIAL_SUSTAINABILITY));
      setVolunteers(getL('stadium_volunteers', INITIAL_VOLUNTEERS));
      setTasks(getL('stadium_os_demo_tasks', INITIAL_TASKS));
      setIncidents(getL('stadium_os_demo_incidents', INITIAL_INCIDENTS));
      setTimeline(getL('stadium_ops_timeline', INITIAL_TIMELINE));
      setNotifications(getL('stadium_notifications', INITIAL_NOTIFICATIONS));
      setHistory(getL('stadium_ops_history', []));
    }
  }, []);

  // Save changes helper
  const saveState = (key: string, val: any, setter: any) => {
    setter(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  // Live calculated overall stadium health score
  const activeAlertsCount = alerts.filter(a => a.status !== 'resolved').length;
  const criticalZones = crowdDensity.filter(c => c.density > 90).length;
  const delayedTransport = transport.filter(t => t.status === 'delayed').length;

  let healthScore = 96;
  if (activeAlertsCount > 2) healthScore -= 15;
  if (criticalZones > 0) healthScore -= criticalZones * 8;
  if (delayedTransport > 0) healthScore -= delayedTransport * 5;
  healthScore = Math.max(10, Math.min(100, healthScore));

  let stadiumHealth: 'Excellent' | 'Good' | 'Warning' | 'Critical' = 'Excellent';
  if (healthScore < 50) stadiumHealth = 'Critical';
  else if (healthScore < 75) stadiumHealth = 'Warning';
  else if (healthScore < 90) stadiumHealth = 'Good';

  // central log timeline helper
  const triggerLog = (event: string, type: TimelineItem['type'] = 'system') => {
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const updated = [{ time, event, type }, ...timeline];
    saveState('stadium_ops_timeline', updated, setTimeline);
  };

  // central notification helper
  const triggerNotif = (message: string, type: NotificationItem['type'] = 'operational') => {
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const updated = [{ id: `not-${Date.now()}`, message, type, read: false, timestamp: time }, ...notifications];
    saveState('stadium_notifications', updated, setNotifications);
  };

  // REUSABLE AI ACTION EXECUTION ENGINE
  const executeAction = async (actionType: string, prompt: string): Promise<boolean> => {
    // Keep record of previous state for rollback
    const prevState = {
      crowdDensity,
      visitors,
      alerts,
      transport,
      accessibility,
      sustainability,
      volunteers,
      tasks,
      incidents
    };

    let outcomeText = '';
    let report: OperationReport | null = null;

    if (actionType === 'OPEN_GATE_4') {
      // 1. Crowd metrics
      const updatedCrowd = crowdDensity.map(c => {
        if (c.zone === 'Zone C (Concourse North)') return { ...c, density: 68, currentCount: 5440, status: 'moderate' as const };
        if (c.zone === 'Zone B (Gate 4-6)') return { ...c, density: 60, currentCount: 9000, status: 'moderate' as const };
        return c;
      });
      saveState('stadium_crowd_density', updatedCrowd, setCrowdDensity);

      // 2. Incident & Alerts
      const updatedAlerts = alerts.map(a => a.id === 'alert-1' ? { ...a, status: 'resolved' as const } : a);
      saveState('stadium_emergency_alerts', updatedAlerts, setAlerts);

      // 3. Log logs
      triggerLog('Gate 4 turnstiles opened. Crowd Control Alpha dispatched.', 'security');
      triggerNotif('Gate 4 turnstiles opened to clear Gate 3 congestion.', 'security');

      outcomeText = 'Gate 3 load reduced from 92% to 68%. Wait time decreased to 7 min.';
      report = {
        title: 'Gate 4 Overflow Diverted',
        beforeVal: '92% Load',
        afterVal: '68% Load',
        metricLabel: 'Gate 3 Congestion',
        divertedCount: 1920,
        extraStaff: 12,
        waitBefore: '18 min',
        waitAfter: '7 min'
      };
    } else if (actionType === 'DEPLOY_MEDICAL') {
      const newAlert: EmergencyAlert = {
        id: `alert-${Math.random().toString(36).substr(2, 9)}`,
        title: 'Medical Call: Section 108',
        description: 'AI Dispatch: Spectator experiencing heat exhaustion. Medical response unit dispatched.',
        severity: 'high',
        location: 'Section 108, Row E',
        timestamp: new Date().toISOString(),
        status: 'active',
        assignedTeam: 'Medical Response 2'
      };
      saveState('stadium_emergency_alerts', [newAlert, ...alerts], setAlerts);

      const newInc: IncidentReport = {
        id: `inc-${newAlert.id}`,
        issue: 'Heat exhaustion alert at Section 108',
        reporter: 'AI Camera Telemetry',
        status: 'open',
        time: '1s ago'
      };
      saveState('stadium_os_demo_incidents', [newInc, ...incidents], setIncidents);

      triggerLog('Medical Response Team 2 dispatched to Section 108.', 'medical');
      triggerNotif('Medical Call: Response unit mobilized to Section 108.', 'medical');

      outcomeText = 'Medical response team dispatched. Estimated arrival in 45 seconds.';
      report = {
        title: 'Medical Team Deployed',
        beforeVal: 'Pending',
        afterVal: 'Dispatched',
        metricLabel: 'Emergency Status',
        divertedCount: 1,
        extraStaff: 3,
        waitBefore: '5 min',
        waitAfter: '45 sec'
      };
    } else if (actionType === 'INCREASE_SHUTTLE') {
      const updatedTrans = transport.map(t => {
        if (t.id === 't-2') return { ...t, status: 'on-time' as const, etaMinutes: 4, occupancy: 'high' as const };
        return t;
      });
      saveState('stadium_transport_status', updatedTrans, setTransport);

      triggerLog('Express metro frequency increased. Shuttle line A load stabilized.', 'transport');
      triggerNotif('Shuttle frequency increased to bypass regional delay.', 'transport');

      outcomeText = 'Downtown Shuttle delay resolved. ETA reduced to 4 minutes.';
      report = {
        title: 'Shuttle Dispatch Optimized',
        beforeVal: '12 min Delay',
        afterVal: '4 min ETA',
        metricLabel: 'Transit Schedule',
        divertedCount: 380,
        extraStaff: 4,
        waitBefore: '12 min',
        waitAfter: '4 min'
      };
    } else if (actionType === 'ACTIVATE_ACCESSIBILITY') {
      const updatedVolunteers = volunteers.map(v => {
        if (v.id === 'v-3') return { ...v, status: 'on-duty' as const, location: 'Gate 4' };
        return v;
      });
      saveState('stadium_volunteers', updatedVolunteers, setVolunteers);

      const updatedRequests = accessibility.map(r => {
        if (r.status === 'pending') return { ...r, status: 'in-progress' as const, assignedStaff: 'Volunteer Kenji S.' };
        return r;
      });
      saveState('stadium_accessibility_requests', updatedRequests, setAccessibility);

      triggerLog('Standby accessibility escort volunteers activated at Gate 4 turnstiles.', 'operational');
      triggerNotif('Accessibility escort volunteers assigned to Gate 4.', 'operational');

      outcomeText = 'Accessibility requests cleared. Escorts assigned to all wheelchair visitors.';
      report = {
        title: 'Accessibility Crew Dispatched',
        beforeVal: '3 Pending',
        afterVal: '0 Pending',
        metricLabel: 'Spectator Escorts',
        divertedCount: 3,
        extraStaff: 5,
        waitBefore: '15 min',
        waitAfter: '2 min'
      };
    } else if (actionType === 'REDUCE_ENERGY') {
      const updatedSustain = {
        ...sustainability,
        energyUsageKw: 3750,
        renewablePercentage: 92
      };
      saveState('stadium_sustainability_metrics', updatedSustain, setSustainability);

      triggerLog('Secondary concourse advertising displays dimmed for energy load conservation.', 'system');
      triggerNotif('Advertising grid dimmed. 450 kW reclaimed.', 'operational');

      outcomeText = 'Concourse power consumption reduced. Clean energy ratio increased to 92%.';
      report = {
        title: 'Energy Draw Optimized',
        beforeVal: '4200 kW',
        afterVal: '3750 kW',
        metricLabel: 'Grid Consump.',
        divertedCount: 0,
        extraStaff: 0,
        waitBefore: 'Peak Draw',
        waitAfter: 'Nominal'
      };
    } else if (actionType === 'REDIRECT_CROWD') {
      const updatedCrowd = crowdDensity.map(c => {
        if (c.zone === 'Zone C (Concourse North)') return { ...c, density: 72, currentCount: 5760 };
        if (c.zone === 'Zone D (Concourse South)') return { ...c, density: 65, currentCount: 5200 };
        return c;
      });
      saveState('stadium_crowd_density', updatedCrowd, setCrowdDensity);

      triggerLog('Arriving spectator flows redirected via North Loop concourse.', 'security');
      triggerNotif('Crowd rerouted to North Loop concourse.', 'security');

      outcomeText = 'Spectator flow balance. North concourse congestion decreased.';
      report = {
        title: 'Flow Rerouted',
        beforeVal: '92% North',
        afterVal: '72% North',
        metricLabel: 'Concourse Density',
        divertedCount: 1420,
        extraStaff: 8,
        waitBefore: '14 min',
        waitAfter: '4 min'
      };
    } else if (actionType === 'GENERATE_REPORT') {
      triggerLog('Matchday sustainability carbon ledger report generated.', 'system');
      triggerNotif('Sustainability report generated successfully.', 'operational');

      outcomeText = 'Sustainability carbon ledger report successfully synced to local servers.';
      report = {
        title: 'Sustainability Audit Generated',
        beforeVal: 'Pending',
        afterVal: 'Generated',
        metricLabel: 'Audit Status',
        divertedCount: 0,
        extraStaff: 1,
        waitBefore: 'N/A',
        waitAfter: 'Immediate'
      };
    }

    // Default Fallback Action log details if not custom match
    if (!outcomeText) {
      triggerLog(`AI Action executed: ${actionType}`, 'system');
      triggerNotif(`Operations applied payload: ${actionType}`, 'operational');
      outcomeText = 'Operations parameters successfully adjusted.';
      report = {
        title: 'AI Action Completed',
        beforeVal: 'Operational Mode',
        afterVal: 'Optimized Mode',
        metricLabel: 'Stadium Status',
        divertedCount: 0,
        extraStaff: 2,
        waitBefore: 'N/A',
        waitAfter: 'Optimized'
      };
    }

    // Save to history
    const historyItem: OperationHistoryItem = {
      id: `hist-${Date.now()}`,
      prompt,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      actionName: actionType,
      outcome: outcomeText,
      status: 'success',
      prevState
    };

    const updatedHistory = [historyItem, ...history];
    saveState('stadium_ops_history', updatedHistory, setHistory);
    setActiveReport(report);

    return true;
  };

  // Rollback Undo Operations System
  const rollbackOperation = (historyId: string) => {
    const item = history.find(h => h.id === historyId);
    if (!item || item.status !== 'success') return;

    // Restore States
    saveState('stadium_crowd_density', item.prevState.crowdDensity, setCrowdDensity);
    saveState('stadium_active_visitors', item.prevState.visitors, setVisitors);
    saveState('stadium_emergency_alerts', item.prevState.alerts, setAlerts);
    saveState('stadium_transport_status', item.prevState.transport, setTransport);
    saveState('stadium_accessibility_requests', item.prevState.accessibility, setAccessibility);
    saveState('stadium_sustainability_metrics', item.prevState.sustainability, setSustainability);
    saveState('stadium_volunteers', item.prevState.volunteers, setVolunteers);
    saveState('stadium_os_demo_tasks', item.prevState.tasks, setTasks);
    saveState('stadium_os_demo_incidents', item.prevState.incidents, setIncidents);

    // Update history state
    const updatedHistory = history.map(h => h.id === historyId ? { ...h, status: 'rolled_back' as const } : h);
    saveState('stadium_ops_history', updatedHistory, setHistory);

    triggerLog(`Operation rolled back: ${item.actionName}. Restored previous stadium parameters.`, 'system');
    triggerNotif(`Rollback executed for operation: ${item.actionName}`, 'operational');
  };

  const rejectRecommendation = (actionType: string, prompt: string) => {
    const historyItem: OperationHistoryItem = {
      id: `hist-${Date.now()}`,
      prompt,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      actionName: actionType,
      outcome: 'Recommendation rejected by FIFA Board.',
      status: 'cancelled',
      prevState: {
        crowdDensity, visitors, alerts, transport, accessibility, sustainability, volunteers, tasks, incidents
      }
    };
    saveState('stadium_ops_history', [historyItem, ...history], setHistory);
    triggerLog(`AI Recommendation rejected: ${actionType} by FIFA Board.`, 'system');
  };

  // Direct state updates helpers
  const addTask = (task: Omit<TaskAssignment, 'id' | 'status'>) => {
    const newTask: TaskAssignment = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'pending'
    };
    const updated = [newTask, ...tasks];
    saveState('stadium_os_demo_tasks', updated, setTasks);
    triggerLog(`Task assigned: "${task.title}" allocated to ${task.assignee}.`, 'operational');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'pending' as const : 'completed' as const;
        triggerLog(nextStatus === 'completed' ? `Task completed: ${t.title}` : `Task reopened: ${t.title}`, 'operational');
        return { ...t, status: nextStatus };
      }
      return t;
    });
    saveState('stadium_os_demo_tasks', updated, setTasks);
  };

  const addEmergency = (alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => {
    const newAlert: EmergencyAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    saveState('stadium_emergency_alerts', [newAlert, ...alerts], setAlerts);
    triggerLog(`Emergency dispatched: ${alert.title} at ${alert.location}.`, 'security');
  };

  const resolveEmergency = (id: string) => {
    const target = alerts.find(a => a.id === id);
    if (!target) return;
    const updated = alerts.map(a => a.id === id ? { ...a, status: 'resolved' as const } : a);
    saveState('stadium_emergency_alerts', updated, setAlerts);
    
    // Also resolve incident reports matching this alert title
    const updatedInc = incidents.map(inc => inc.issue === target.title ? { ...inc, status: 'resolved' as const } : inc);
    saveState('stadium_os_demo_incidents', updatedInc, setIncidents);

    triggerLog(`Emergency resolved: ${target.title}.`, 'security');
    triggerNotif(`Emergency dispatch resolved: ${target.title}`, 'security');
  };

  const claimAccessibility = (id: string) => {
    const updated = accessibility.map(r => r.id === id ? { ...r, status: 'in-progress' as const, assignedStaff: 'Volunteer Kenji S.' } : r);
    saveState('stadium_accessibility_requests', updated, setAccessibility);
    triggerLog('Accessibility wheelchair request companion assigned.', 'operational');
  };

  const refreshFeeds = () => {
    // Generate crowd fluctuations
    const updated = crowdDensity.map(c => {
      const change = Math.floor(Math.random() * 5) - 2;
      return { ...c, density: Math.min(100, Math.max(5, c.density + change)) };
    });
    saveState('stadium_crowd_density', updated, setCrowdDensity);
    triggerLog('Workforce telemetry sensor feeds re-synced.', 'system');
  };

  const refreshTransit = () => {
    const updated = transport.map(t => {
      const delta = Math.floor(Math.random() * 3) - 1;
      return { ...t, etaMinutes: Math.max(1, t.etaMinutes + delta) };
    });
    saveState('stadium_transport_status', updated, setTransport);
    triggerLog('Transit operations schedules synchronized.', 'transport');
  };

  const clearNotifications = () => {
    saveState('stadium_notifications', [], setNotifications);
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveState('stadium_notifications', updated, setNotifications);
  };

  return (
    <StadiumContext.Provider value={{
      stadiumHealth,
      healthScore,
      crowdDensity,
      visitors,
      alerts,
      transport,
      accessibility,
      sustainability,
      volunteers,
      tasks,
      incidents,
      timeline,
      notifications,
      history,
      activeReport,
      setActiveReport,
      executeAction,
      rollbackOperation,
      rejectRecommendation,
      addTask,
      toggleTask,
      addEmergency,
      resolveEmergency,
      claimAccessibility,
      refreshFeeds,
      refreshTransit,
      clearNotifications,
      markNotificationRead
    }}>
      {children}
    </StadiumContext.Provider>
  );
};

export const useStadium = () => {
  const context = useContext(StadiumContext);
  if (!context) {
    throw new Error('useStadium must be used within a StadiumProvider');
  }
  return context;
};
