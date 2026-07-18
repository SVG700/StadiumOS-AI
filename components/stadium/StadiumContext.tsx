/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CrowdDensity, ActiveVisitors, EmergencyAlert, TransportStatus, 
  AccessibilityRequest, SustainabilityMetrics, VolunteerActivity 
} from '@/types';
import { playSynthTone } from '@/lib/audio';

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
  timestampISO?: string;
  userEmail?: string;
}

export interface StadiumWeather {
  temp: number;
  humidity: number;
  wind: number;
  uv: number;
  rainProb: number;
  aqi: number;
  heatRisk: 'Low' | 'Moderate' | 'High';
}

export interface StadiumMatch {
  teamA: string;
  teamB: string;
  stage: string;
  kickoff: string;
  attendance: number;
  referee: string;
  varStatus: 'Online' | 'Offline';
  securityLevel: 'Normal' | 'Elevated' | 'Critical';
  medicalStatus: 'Ready' | 'Busy' | 'Critical';
  parkingOccupancy: number;
  broadcastViewers: number;
}

export interface StadiumPrediction {
  id: string;
  message: string;
  confidence: number;
  impact: string;
  action: string;
  risk: 'Low' | 'Medium' | 'High';
  reasoning: string[];
}

export type MatchPhase = 'pre-match' | 'kickoff' | 'first-half' | 'halftime' | 'second-half' | 'full-time' | 'exit-phase' | 'venue-closed' | 'penalties';

export interface SimulatedIncident {
  id: string;
  title: string;
  type: 'security' | 'medical' | 'transport' | 'operational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  timestamp: string;
  recommendedResponse: string;
  estimatedImpact: string;
  aiConfidence: number;
  expectedResolutionTime: string;
  status: 'detected' | 'assigned' | 'responding' | 'contained' | 'resolved' | 'archived';
  progress: number; // 0 to 100
  afterActionReport: AfterActionReport | null;
}

export interface AfterActionReport {
  id: string;
  title: string;
  summary: string;
  timeline: Array<{ time: string; event: string }>;
  departments: string[];
  aiActions: string[];
  humanActions: string[];
  resolutionTime: string;
  lessonsLearned: string;
  futureRecommendation: string;
}

export interface StadiumData {
  id: string;
  name: string;
  city: string;
  location: string;
  xPercent: number; 
  yPercent: number; 
  healthScore: number;
  stadiumHealth: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  matchPhase: MatchPhase;
  crowdDensity: CrowdDensity[];
  visitors: ActiveVisitors;
  alerts: EmergencyAlert[];
  transport: TransportStatus[];
  accessibility: AccessibilityRequest[];
  sustainability: SustainabilityMetrics;
  volunteers: VolunteerActivity[];
  tasks: TaskAssignment[];
  incidents: IncidentReport[];
  weather: StadiumWeather;
  match: StadiumMatch;
  predictions: StadiumPrediction[];
  simulatedIncidents: SimulatedIncident[];
}

export interface OperationHistoryItem {
  id: string;
  prompt: string;
  time: string;
  actionName: string;
  outcome: string;
  status: 'success' | 'cancelled' | 'rolled_back';
  stadiumId: string;
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
  stadiums: StadiumData[];
  selectedStadiumId: string;
  selectedStadium: StadiumData;
  selectStadium: (id: string) => void;
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
  addAccessibilityRequest: (userEmail: string, requestType: AccessibilityRequest['requestType'], location: string) => void;
  completeAccessibility: (id: string) => void;
  refreshFeeds: () => void;
  refreshTransit: () => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
  // Match phase commands
  changeMatchPhase: (phase: MatchPhase) => void;
  // Command playbooks
  executePlaybook: (playbookId: string) => Promise<void>;
  // Manual trigger simulation
  triggerRandomIncident: () => void;
  // Live indexes
  resilienceScore: number;
  fanExperienceScore: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  fanExperienceBreakdown: {
    queues: number;
    navigation: number;
    accessibility: number;
    food: number;
    restrooms: number;
    weather: number;
  };
}

const StadiumContext = createContext<StadiumContextType | undefined>(undefined);

// Initial templates
const INITIAL_STADIUMS: StadiumData[] = [
  {
    id: 'vancouver',
    name: 'BC Place Stadium',
    city: 'Vancouver',
    location: 'Vancouver, Canada',
    xPercent: 18,
    yPercent: 26,
    healthScore: 82,
    stadiumHealth: 'Warning',
    matchPhase: 'first-half',
    crowdDensity: [
      { zone: 'Zone A (Gate 1-3)', density: 78, capacity: 15000, currentCount: 11700, status: 'high' },
      { zone: 'Zone B (Gate 4-6)', density: 45, capacity: 15000, currentCount: 6750, status: 'moderate' },
      { zone: 'Zone C (Concourse North)', density: 92, capacity: 8000, currentCount: 7360, status: 'critical' },
      { zone: 'Zone D (Concourse South)', density: 60, capacity: 8000, currentCount: 4800, status: 'moderate' },
      { zone: 'Zone E (VIP Lounge)', density: 30, capacity: 2000, currentCount: 600, status: 'low' },
      { zone: 'Zone F (Press Box)', density: 55, capacity: 1000, currentCount: 550, status: 'moderate' },
    ],
    visitors: { total: 68420, fans: 65120, staff: 2800, vip: 500 },
    alerts: [
      { id: 'alert-1', title: 'Crowd Congestion at Gate 3', description: 'High traffic density slowing entry. Re-routing incoming fans to Gate 4.', severity: 'medium', location: 'Gate 3 Turnstiles', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: 'active', assignedTeam: 'Crowd Control Alpha' },
      { id: 'alert-2', title: 'Elevator Outage', description: 'Elevator EL-4 in West Stand is unresponsive. Technician dispatched.', severity: 'low', location: 'West Stand (Level 2)', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: 'investigating', assignedTeam: 'Maintenance Team B' },
    ],
    transport: [
      { id: 't-1', mode: 'metro', lineName: 'Stadium Express (Line 1)', status: 'on-time', etaMinutes: 4, occupancy: 'high' },
      { id: 't-2', mode: 'bus', lineName: 'Downtown Shuttle (Route A)', status: 'delayed', etaMinutes: 12, occupancy: 'medium', delayReason: 'Traffic near Expressway' },
    ],
    accessibility: [
      { id: 'req-1', userEmail: 'fan1@example.com', requestType: 'wheelchair', location: 'Gate 1 Drop-off Zone', status: 'in-progress', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), assignedStaff: 'Volunteer Sarah M.' },
    ],
    sustainability: { energyUsageKw: 4200, renewablePercentage: 86, carbonOffsetKg: 3240, wasteRecycledKg: 1480, waterSavedLitres: 12400 },
    volunteers: [
      { id: 'v-1', name: 'Marcus Vance', task: 'Crowd Directing', location: 'Gate 3', status: 'on-duty', checkInTime: '15:30' },
    ],
    tasks: [],
    incidents: [],
    weather: { temp: 31, humidity: 62, wind: 14, uv: 9, rainProb: 15, aqi: 48, heatRisk: 'High' },
    match: {
      teamA: 'Argentina',
      teamB: 'Germany',
      stage: 'Quarter Final',
      kickoff: '20:00',
      attendance: 68420,
      referee: 'Piero Maza (Chile)',
      varStatus: 'Online',
      securityLevel: 'Normal',
      medicalStatus: 'Ready',
      parkingOccupancy: 83,
      broadcastViewers: 12.4
    },
    predictions: [
      { id: 'p1', message: 'Gate 3 queue likely to exceed capacity in 12 minutes.', confidence: 92, impact: 'Heavy bottleneck, wait times +15m', action: 'Open Gate 4 turnstiles immediately', risk: 'Medium', reasoning: ['Inflow volume +18% past 10m', 'Ticket scan processing lag', 'Historical Quarter Final queue pattern'] }
    ],
    simulatedIncidents: [
      {
        id: 'sim-inc-1',
        title: 'Elevator Escalator Failure',
        type: 'operational',
        severity: 'medium',
        location: 'Section 104 Elevator Lobby',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        recommendedResponse: 'Dispatch Maintenance Crew and assign temporary accessibility guides.',
        estimatedImpact: 'Disabled fan delays +20 mins',
        aiConfidence: 94,
        expectedResolutionTime: '15 mins',
        status: 'responding',
        progress: 35,
        afterActionReport: null
      }
    ]
  },
  {
    id: 'los-angeles',
    name: 'SoFi Stadium',
    city: 'Los Angeles',
    location: 'Los Angeles, USA',
    xPercent: 19,
    yPercent: 54,
    healthScore: 74,
    stadiumHealth: 'Critical',
    matchPhase: 'pre-match',
    crowdDensity: [
      { zone: 'Zone A (Gate 1-3)', density: 60, capacity: 20000, currentCount: 12000, status: 'moderate' },
      { zone: 'Zone B (Gate 4-6)', density: 95, capacity: 20000, currentCount: 19000, status: 'critical' }
    ],
    visitors: { total: 72100, fans: 68900, staff: 2900, vip: 300 },
    alerts: [
      { id: 'la-alert-1', title: 'Gate 5 Congestion', description: 'Overcrowding near West gate escalators.', severity: 'high', location: 'Gate 5 escalator lobby', timestamp: new Date().toISOString(), status: 'active', assignedTeam: 'Crowd Team Bravo' }
    ],
    transport: [
      { id: 'la-t-1', mode: 'shuttle', lineName: 'Shuttle Route B', status: 'delayed', etaMinutes: 18, occupancy: 'high', delayReason: 'Traffic on Century Blvd' }
    ],
    accessibility: [],
    sustainability: { energyUsageKw: 5100, renewablePercentage: 92, carbonOffsetKg: 4100, wasteRecycledKg: 2100, waterSavedLitres: 19200 },
    volunteers: [],
    tasks: [],
    incidents: [],
    weather: { temp: 28, humidity: 45, wind: 12, uv: 8, rainProb: 0, aqi: 82, heatRisk: 'Low' },
    match: {
      teamA: 'Mexico',
      teamB: 'Japan',
      stage: 'Group Stage',
      kickoff: '18:00',
      attendance: 72100,
      referee: 'Carlos Mendes (Spain)',
      varStatus: 'Online',
      securityLevel: 'Elevated',
      medicalStatus: 'Busy',
      parkingOccupancy: 96,
      broadcastViewers: 18.2
    },
    predictions: [],
    simulatedIncidents: []
  },
  {
    id: 'new-york',
    name: 'MetLife Stadium',
    city: 'New York',
    location: 'New York, USA',
    xPercent: 82,
    yPercent: 38,
    healthScore: 96,
    stadiumHealth: 'Excellent',
    matchPhase: 'first-half',
    crowdDensity: [
      { zone: 'Zone A', density: 40, capacity: 25000, currentCount: 10000, status: 'low' }
    ],
    visitors: { total: 80200, fans: 76000, staff: 3500, vip: 700 },
    alerts: [],
    transport: [],
    accessibility: [],
    sustainability: { energyUsageKw: 6200, renewablePercentage: 88, carbonOffsetKg: 5200, wasteRecycledKg: 2800, waterSavedLitres: 24000 },
    volunteers: [],
    tasks: [],
    incidents: [],
    weather: { temp: 26, humidity: 55, wind: 8, uv: 6, rainProb: 10, aqi: 34, heatRisk: 'Low' },
    match: {
      teamA: 'USA',
      teamB: 'England',
      stage: 'Quarter Final',
      kickoff: '20:00',
      attendance: 80200,
      referee: 'Szymon Marciniak (Poland)',
      varStatus: 'Online',
      securityLevel: 'Normal',
      medicalStatus: 'Ready',
      parkingOccupancy: 78,
      broadcastViewers: 22.4
    },
    predictions: [],
    simulatedIncidents: []
  },
  {
    id: 'dallas',
    name: 'AT&T Stadium',
    city: 'Dallas',
    location: 'Dallas, USA',
    xPercent: 52,
    yPercent: 65,
    healthScore: 90,
    stadiumHealth: 'Good',
    matchPhase: 'pre-match',
    crowdDensity: [],
    visitors: { total: 88200, fans: 84000, staff: 3800, vip: 400 },
    alerts: [],
    transport: [],
    accessibility: [],
    sustainability: { energyUsageKw: 7500, renewablePercentage: 82, carbonOffsetKg: 6100, wasteRecycledKg: 3400, waterSavedLitres: 29000 },
    volunteers: [],
    tasks: [],
    incidents: [],
    weather: { temp: 33, humidity: 40, wind: 10, uv: 9, rainProb: 5, aqi: 52, heatRisk: 'Moderate' },
    match: {
      teamA: 'Brazil',
      teamB: 'France',
      stage: 'Semi Final',
      kickoff: '19:30',
      attendance: 88200,
      referee: 'Wilmar Roldán (Colombia)',
      varStatus: 'Online',
      securityLevel: 'Normal',
      medicalStatus: 'Ready',
      parkingOccupancy: 88,
      broadcastViewers: 29.5
    },
    predictions: [],
    simulatedIncidents: []
  },
  {
    id: 'toronto',
    name: 'BMO Field',
    city: 'Toronto',
    location: 'Toronto, Canada',
    xPercent: 72,
    yPercent: 32,
    healthScore: 94,
    stadiumHealth: 'Excellent',
    matchPhase: 'halftime',
    crowdDensity: [],
    visitors: { total: 42100, fans: 39500, staff: 2300, vip: 300 },
    alerts: [],
    transport: [],
    accessibility: [],
    sustainability: { energyUsageKw: 2800, renewablePercentage: 90, carbonOffsetKg: 2400, wasteRecycledKg: 1100, waterSavedLitres: 9100 },
    volunteers: [],
    tasks: [],
    incidents: [],
    weather: { temp: 22, humidity: 75, wind: 16, uv: 5, rainProb: 65, aqi: 28, heatRisk: 'Low' },
    match: {
      teamA: 'Canada',
      teamB: 'Italy',
      stage: 'Group Stage',
      kickoff: '16:00',
      attendance: 42100,
      referee: 'Clement Turpin (France)',
      varStatus: 'Online',
      securityLevel: 'Normal',
      medicalStatus: 'Ready',
      parkingOccupancy: 64,
      broadcastViewers: 8.5
    },
    predictions: [],
    simulatedIncidents: []
  },
  {
    id: 'mexico-city',
    name: 'Estadio Azteca',
    city: 'Mexico City',
    location: 'Mexico City, Mexico',
    xPercent: 48,
    yPercent: 85,
    healthScore: 92,
    stadiumHealth: 'Excellent',
    matchPhase: 'venue-closed',
    crowdDensity: [],
    visitors: { total: 84000, fans: 80000, staff: 3500, vip: 500 },
    alerts: [],
    transport: [],
    accessibility: [],
    sustainability: { energyUsageKw: 5800, renewablePercentage: 84, carbonOffsetKg: 4900, wasteRecycledKg: 2500, waterSavedLitres: 21000 },
    volunteers: [],
    tasks: [],
    incidents: [],
    weather: { temp: 24, humidity: 50, wind: 6, uv: 7, rainProb: 20, aqi: 68, heatRisk: 'Low' },
    match: {
      teamA: 'Mexico',
      teamB: 'Japan',
      stage: 'Group Stage',
      kickoff: '15:00',
      attendance: 84000,
      referee: 'Cesar Ramos (Mexico)',
      varStatus: 'Online',
      securityLevel: 'Normal',
      medicalStatus: 'Ready',
      parkingOccupancy: 81,
      broadcastViewers: 14.6
    },
    predictions: [],
    simulatedIncidents: []
  },
  {
    id: 'atlanta',
    name: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    location: 'Atlanta, USA',
    xPercent: 68,
    yPercent: 52,
    healthScore: 95,
    stadiumHealth: 'Excellent',
    matchPhase: 'pre-match',
    crowdDensity: [],
    visitors: { total: 71000, fans: 67800, staff: 2800, vip: 400 },
    alerts: [],
    transport: [],
    accessibility: [],
    sustainability: { energyUsageKw: 4900, renewablePercentage: 94, carbonOffsetKg: 3900, wasteRecycledKg: 2200, waterSavedLitres: 17800 },
    volunteers: [],
    tasks: [],
    incidents: [],
    weather: { temp: 29, humidity: 48, wind: 9, uv: 8, rainProb: 0, aqi: 42, heatRisk: 'Moderate' },
    match: {
      teamA: 'Spain',
      teamB: 'Portugal',
      stage: 'Quarter Final',
      kickoff: '18:00',
      attendance: 71000,
      referee: 'Anthony Taylor (England)',
      varStatus: 'Online',
      securityLevel: 'Normal',
      medicalStatus: 'Ready',
      parkingOccupancy: 74,
      broadcastViewers: 15.3
    },
    predictions: [],
    simulatedIncidents: []
  },
  {
    id: 'miami',
    name: 'Hard Rock Stadium',
    city: 'Miami',
    location: 'Miami, USA',
    xPercent: 78,
    yPercent: 72,
    healthScore: 96,
    stadiumHealth: 'Excellent',
    matchPhase: 'full-time',
    crowdDensity: [],
    visitors: { total: 64800, fans: 61500, staff: 2800, vip: 500 },
    alerts: [],
    transport: [],
    accessibility: [],
    sustainability: { energyUsageKw: 4800, renewablePercentage: 89, carbonOffsetKg: 3800, wasteRecycledKg: 1900, waterSavedLitres: 16500 },
    volunteers: [],
    tasks: [],
    incidents: [],
    weather: { temp: 32, humidity: 70, wind: 12, uv: 9, rainProb: 55, aqi: 31, heatRisk: 'Moderate' },
    match: {
      teamA: 'Argentina',
      teamB: 'Colombia',
      stage: 'Group Stage',
      kickoff: '20:00',
      attendance: 64800,
      referee: 'Daniele Orsato (Italy)',
      varStatus: 'Online',
      securityLevel: 'Normal',
      medicalStatus: 'Ready',
      parkingOccupancy: 82,
      broadcastViewers: 16.9
    },
    predictions: [],
    simulatedIncidents: []
  }
];

const INITIAL_TIMELINE: TimelineItem[] = [
  { time: '14:29', event: 'Gate 3 congestion warning updated (Vancouver BC Place).', type: 'security' },
  { time: '14:26', event: 'VIP convoy entered West gate bay (New York MetLife).', type: 'operational' },
  { time: '14:20', event: 'Medical Team Alpha dispatched to Section 104.', type: 'medical' },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', message: 'Gate 3 congestion detected in Vancouver. Reroutes active.', type: 'security', read: false, timestamp: '14:32', timestampISO: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'n2', message: 'Medical response completed at Section 104.', type: 'medical', read: false, timestamp: '14:29', timestampISO: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
];

export const StadiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stadiums, setStadiums] = useState<StadiumData[]>(INITIAL_STADIUMS);
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>('vancouver');
  
  const [timeline, setTimeline] = useState<TimelineItem[]>(INITIAL_TIMELINE);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [history, setHistory] = useState<OperationHistoryItem[]>([]);
  const [activeReport, setActiveReport] = useState<OperationReport | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getL = <T,>(key: string, fallback: T): T => {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) as T : fallback;
      };
      const savedStadiums = getL('stadium_multi_list', INITIAL_STADIUMS);
      const savedSelectedId = getL('stadium_selected_id', 'vancouver');
      const savedTimeline = getL('stadium_ops_timeline', INITIAL_TIMELINE);
      const savedNotifs = getL('stadium_notifications', INITIAL_NOTIFICATIONS);
      const savedHistory = getL<OperationHistoryItem[]>('stadium_ops_history', []);

      // Sanitize stadium list items (incidents, tasks, alerts)
      const sanitizedStadiums = savedStadiums.map(stadium => {
        const seenIncidentIds = new Set<string>();
        const seenTaskIds = new Set<string>();
        const seenAlertIds = new Set<string>();

        const incidents = (stadium.simulatedIncidents || []).map(inc => {
          const idStr = String(inc.id);
          const isOld = idStr.match(/^sim-inc-\d+$/) || !idStr.startsWith('sim-inc-');
          if (isOld || seenIncidentIds.has(idStr)) {
            const newId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
              ? `sim-inc-${crypto.randomUUID()}`
              : `sim-inc-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
            seenIncidentIds.add(newId);
            return { ...inc, id: newId };
          }
          seenIncidentIds.add(idStr);
          return { ...inc, id: idStr };
        });

        const tasks = (stadium.tasks || []).map(task => {
          const idStr = String(task.id);
          const isOld = idStr.match(/^task-\d+$/) || !idStr.startsWith('task-');
          if (isOld || seenTaskIds.has(idStr)) {
            const newId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
              ? `task-${crypto.randomUUID()}`
              : `task-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
            seenTaskIds.add(newId);
            return { ...task, id: newId };
          }
          seenTaskIds.add(idStr);
          return { ...task, id: idStr };
        });

        const alerts = (stadium.alerts || []).map(alert => {
          const idStr = String(alert.id);
          const isOld = idStr.match(/^alert-\d+$/) || !idStr.startsWith('alert-');
          if (isOld || seenAlertIds.has(idStr)) {
            const newId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
              ? `alert-${crypto.randomUUID()}`
              : `alert-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
            seenAlertIds.add(newId);
            return { ...alert, id: newId };
          }
          seenAlertIds.add(idStr);
          return { ...alert, id: idStr };
        });

        return {
          ...stadium,
          simulatedIncidents: incidents,
          tasks,
          alerts
        };
      });

      // Sanitize notifications
      const seenNotifIds = new Set<string>();
      const sanitizedNotifs = savedNotifs.map(n => {
        const idStr = String(n.id);
        const isOldFormat = idStr.match(/^not-\d+$/) || !idStr.startsWith('not-');
        if (isOldFormat || seenNotifIds.has(idStr)) {
          const newId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? `not-${crypto.randomUUID()}`
            : `not-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
          seenNotifIds.add(newId);
          return { ...n, id: newId };
        }
        seenNotifIds.add(idStr);
        return { ...n, id: idStr };
      });

      // Sanitize history
      const seenHistoryIds = new Set<string>();
      const sanitizedHistory = savedHistory.map(h => {
        const idStr = String(h.id);
        const isOldFormat = idStr.match(/^hist-\d+$/) || !idStr.startsWith('hist-');
        if (isOldFormat || seenHistoryIds.has(idStr)) {
          const newId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? `hist-${crypto.randomUUID()}`
            : `hist-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
          seenHistoryIds.add(newId);
          return { ...h, id: newId };
        }
        seenHistoryIds.add(idStr);
        return { ...h, id: idStr };
      });

      // Write sanitized states back to localStorage
      localStorage.setItem('stadium_multi_list', JSON.stringify(sanitizedStadiums));
      localStorage.setItem('stadium_notifications', JSON.stringify(sanitizedNotifs));
      localStorage.setItem('stadium_ops_history', JSON.stringify(sanitizedHistory));

      setTimeout(() => {
        setStadiums(sanitizedStadiums);
        setSelectedStadiumId(savedSelectedId);
        setTimeline(savedTimeline);
        setNotifications(sanitizedNotifs);
        setHistory(sanitizedHistory);
      }, 0);
    }
  }, []);

  // Sync state helper
  const saveState = useCallback(<T,>(key: string, val: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
    setter(val);
    localStorage.setItem(key, JSON.stringify(val));
  }, []);



  // Currently active selected stadium object
  const selectedStadium = stadiums.find(s => s.id === selectedStadiumId) || stadiums[0];

  // Dynamic values based on selected stadium
  const crowdDensity = selectedStadium.crowdDensity;
  const visitors = selectedStadium.visitors;
  const alerts = selectedStadium.alerts;
  const transport = selectedStadium.transport;
  const accessibility = selectedStadium.accessibility;
  const sustainability = selectedStadium.sustainability;
  const volunteers = selectedStadium.volunteers;
  const tasks = selectedStadium.tasks;
  const incidents = selectedStadium.incidents;

  // Calculate selected health score
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

  // Live Fan Experience Index Calculation (Dynamic)
  let weatherComfort = 92;
  
  if (selectedStadium.weather.temp >= 32) weatherComfort -= 20;
  if (selectedStadium.weather.rainProb >= 50) weatherComfort -= 15;

  const dynamicWarnings = selectedStadium.simulatedIncidents.filter(i => i.status !== 'resolved').length;
  const queueDeltas = crowdDensity.filter(c => c.status === 'critical').length * 4;

  const queuesIdx = Math.max(20, 95 - queueDeltas * 8);
  const accessibilityIdx = Math.max(40, 98 - (accessibility.filter(a => a.status === 'pending').length * 15));
  const navIdx = 96;

  const fanTotalScore = Math.round((queuesIdx + accessibilityIdx + navIdx + weatherComfort) / 4);
  let fanExperienceScore: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Excellent';
  if (fanTotalScore < 50) fanExperienceScore = 'Poor';
  else if (fanTotalScore < 70) fanExperienceScore = 'Fair';
  else if (fanTotalScore < 88) fanExperienceScore = 'Good';

  const fanExperienceBreakdown = {
    queues: queuesIdx,
    navigation: navIdx,
    accessibility: accessibilityIdx,
    food: Math.max(10, 92 - dynamicWarnings * 10),
    restrooms: Math.max(10, 94 - queueDeltas * 5),
    weather: weatherComfort
  };

  // Live Stadium Resilience Score (AI KPI)
  let resilienceScore = 98;
  resilienceScore -= activeAlertsCount * 12;
  resilienceScore -= criticalZones * 10;
  resilienceScore -= delayedTransport * 6;
  resilienceScore -= selectedStadium.simulatedIncidents.filter(i => i.status !== 'resolved' && i.status !== 'archived').length * 8;
  resilienceScore = Math.max(5, Math.min(100, resilienceScore));

  // central log timeline helper
  const triggerLog = useCallback((event: string, type: TimelineItem['type'] = 'system') => {
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
    setTimeline(prevTimeline => {
      const updated = [{ time, event, type }, ...prevTimeline];
      localStorage.setItem('stadium_ops_timeline', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const selectStadium = useCallback((id: string) => {
    saveState('stadium_selected_id', id, setSelectedStadiumId);
    triggerLog(`Commissioner dashboard switched stadium context to: ${id.toUpperCase()}`, 'system');
  }, [saveState, setSelectedStadiumId, triggerLog]);

  // central notification helper
  const triggerNotif = useCallback((message: string, type: NotificationItem['type'] = 'operational', userEmail?: string) => {
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
    setNotifications(prevNotifications => {
      const uniqueId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `not-${crypto.randomUUID()}`
        : `not-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
      const newNotif = { 
        id: uniqueId, 
        message, 
        type, 
        read: false, 
        timestamp: time, 
        timestampISO: new Date().toISOString(),
        userEmail 
      };
      
      const updated = [newNotif, ...prevNotifications];
      const unique = updated.filter((item, idx, self) => 
        self.findIndex(t => t.message === item.message && t.timestamp === item.timestamp) === idx
      );
      const sliced = unique.slice(0, 25);
      localStorage.setItem('stadium_notifications', JSON.stringify(sliced));
      return sliced;
    });
    playSynthTone('notification');
  }, []);

  // helper to update a specific property of the currently active stadium in the array
  const updateActiveStadium = (mutatedProps: Partial<StadiumData>) => {
    const updatedList = stadiums.map(s => {
      if (s.id === selectedStadiumId) {
        const nextState = { ...s, ...mutatedProps };
        
        // Dynamically compute its custom score
        const nextActiveAlerts = nextState.alerts.filter(a => a.status !== 'resolved').length;
        const nextCriticalZones = nextState.crowdDensity.filter(c => c.density > 90).length;
        const nextDelayedTransport = nextState.transport.filter(t => t.status === 'delayed').length;

        let nextScore = 96;
        if (nextActiveAlerts > 2) nextScore -= 15;
        if (nextCriticalZones > 0) nextScore -= nextCriticalZones * 8;
        if (nextDelayedTransport > 0) nextScore -= nextDelayedTransport * 5;
        nextScore = Math.max(10, Math.min(100, nextScore));

        let nextHealth: 'Excellent' | 'Good' | 'Warning' | 'Critical' = 'Excellent';
        if (nextScore < 50) nextHealth = 'Critical';
        else if (nextScore < 75) nextHealth = 'Warning';
        else if (nextScore < 90) nextHealth = 'Good';

        return {
          ...nextState,
          healthScore: nextScore,
          stadiumHealth: nextHealth
        };
      }
      return s;
    });
    saveState('stadium_multi_list', updatedList, setStadiums);
  };

  // Match Phase changer
  const changeMatchPhase = (phase: MatchPhase) => {
    let updatedCrowd = [...crowdDensity];
    let updatedTransit = [...transport];
    let updatedVisitors = { ...visitors };
    const updatedMatch = { ...selectedStadium.match };
    const updatedSustainability = { ...sustainability };

    if (phase === 'pre-match') {
      updatedVisitors = { total: 43500, fans: 42000, staff: 1200, vip: 300 };
      updatedMatch.attendance = 43500;
      updatedMatch.securityLevel = 'Normal';
      updatedMatch.medicalStatus = 'Ready';
      updatedMatch.parkingOccupancy = 65;
      
      // Gates open, concourses low
      updatedCrowd = [
        { zone: 'Zone A (Gate 1-3)', density: 40, capacity: 15000, currentCount: 6000, status: 'moderate' },
        { zone: 'Zone B (Gate 4-6)', density: 35, capacity: 15000, currentCount: 5250, status: 'low' },
        { zone: 'Zone C (Concourse North)', density: 20, capacity: 8000, currentCount: 1600, status: 'low' },
        { zone: 'Zone D (Concourse South)', density: 15, capacity: 8000, currentCount: 1200, status: 'low' },
        { zone: 'Zone E (VIP Lounge)', density: 10, capacity: 2000, currentCount: 200, status: 'low' },
        { zone: 'Zone F (Press Box)', density: 10, capacity: 1000, currentCount: 100, status: 'low' },
      ];

      updatedTransit = updatedTransit.map(t => ({
        ...t,
        status: 'on-time',
        etaMinutes: 3,
        occupancy: 'medium'
      }));

      triggerLog(`Pre-match phase initialized at ${selectedStadium.name}. Gates open, security normal, medical calls low.`, 'operational');
      triggerNotif(`Spectator ingress underway: attendance rising. Transit operating normally.`, 'transport');

    } else if (phase === 'first-half' || phase === 'kickoff') {
      updatedVisitors = { total: 68420, fans: 65120, staff: 2800, vip: 500 };
      updatedMatch.attendance = 68420;
      updatedMatch.securityLevel = 'Normal';
      updatedMatch.medicalStatus = 'Ready';
      updatedMatch.parkingOccupancy = 83;

      // Concourses active, gates low
      updatedCrowd = [
        { zone: 'Zone A (Gate 1-3)', density: 15, capacity: 15000, currentCount: 2250, status: 'low' },
        { zone: 'Zone B (Gate 4-6)', density: 10, capacity: 15000, currentCount: 1500, status: 'low' },
        { zone: 'Zone C (Concourse North)', density: 75, capacity: 8000, currentCount: 6000, status: 'high' },
        { zone: 'Zone D (Concourse South)', density: 60, capacity: 8000, currentCount: 4800, status: 'moderate' },
        { zone: 'Zone E (VIP Lounge)', density: 45, capacity: 2000, currentCount: 900, status: 'moderate' },
        { zone: 'Zone F (Press Box)', density: 85, capacity: 1000, currentCount: 850, status: 'high' },
      ];

      triggerLog(`Match kickoff whistle blown at ${selectedStadium.name}. Attendance reached full capacity.`, 'operational');
      triggerNotif(`In-seat crowd density stabilized. Concessions showing initial food demand.`, 'operational');

    } else if (phase === 'halftime') {
      updatedVisitors = { total: 68420, fans: 65120, staff: 2800, vip: 500 };
      updatedMatch.attendance = 68420;
      updatedMatch.securityLevel = 'Normal';
      updatedMatch.medicalStatus = 'Ready';

      // Spikes in restrooms/concessions
      updatedCrowd = [
        { zone: 'Zone A (Gate 1-3)', density: 12, capacity: 15000, currentCount: 1800, status: 'low' },
        { zone: 'Zone B (Gate 4-6)', density: 10, capacity: 15000, currentCount: 1500, status: 'low' },
        { zone: 'Zone C (Concourse North)', density: 95, capacity: 8000, currentCount: 7600, status: 'critical' },
        { zone: 'Zone D (Concourse South)', density: 90, capacity: 8000, currentCount: 7200, status: 'critical' },
        { zone: 'Zone E (VIP Lounge)', density: 70, capacity: 2000, currentCount: 1400, status: 'high' },
        { zone: 'Zone F (Press Box)', density: 75, capacity: 1000, currentCount: 750, status: 'high' },
      ];

      updatedSustainability.wasteRecycledKg += 370;

      addTask({ title: 'Deploy extra janitorial team to North Restrooms', assignee: 'Cleaning Crew 4', priority: 'medium', location: 'Concourse North' });
      addTask({ title: 'Manage concession queue bottlenecks', assignee: 'Volunteer Supervisor', priority: 'low', location: 'Section 110 Concession' });

      triggerLog(`Halftime phase active. Restroom and concession queues spiked. Cleaning requests increased.`, 'operational');
      triggerNotif(`Concourse density critical. Recycling bins emptied; waste diversion numbers increased.`, 'operational');

    } else if (phase === 'second-half') {
      updatedVisitors = { total: 68420, fans: 65120, staff: 2800, vip: 500 };
      updatedMatch.attendance = 68420;
      updatedMatch.securityLevel = 'Normal';
      updatedMatch.medicalStatus = 'Ready';

      // Stabilized crowd in seats
      updatedCrowd = [
        { zone: 'Zone A (Gate 1-3)', density: 10, capacity: 15000, currentCount: 1500, status: 'low' },
        { zone: 'Zone B (Gate 4-6)', density: 8, capacity: 15000, currentCount: 1200, status: 'low' },
        { zone: 'Zone C (Concourse North)', density: 50, capacity: 8000, currentCount: 4000, status: 'moderate' },
        { zone: 'Zone D (Concourse South)', density: 45, capacity: 8000, currentCount: 3600, status: 'moderate' },
        { zone: 'Zone E (VIP Lounge)', density: 30, capacity: 2000, currentCount: 600, status: 'low' },
        { zone: 'Zone F (Press Box)', density: 90, capacity: 1000, currentCount: 900, status: 'high' },
      ];

      triggerLog(`Second half underway. Spectators returned to seats; concourse wait times normalized.`, 'operational');
      triggerNotif(`Medical incident dispatch rate reduced. Volunteers preparing for egress.`, 'medical');

    } else if (phase === 'full-time' || phase === 'exit-phase') {
      updatedVisitors = { total: 54000, fans: 51000, staff: 2600, vip: 400 };
      updatedMatch.attendance = 54000;
      updatedMatch.securityLevel = 'Normal';
      updatedMatch.medicalStatus = 'Ready';
      updatedMatch.parkingOccupancy = 95;

      // Heavy exit gate traffic
      updatedCrowd = [
        { zone: 'Zone A (Gate 1-3)', density: 95, capacity: 15000, currentCount: 14250, status: 'critical' },
        { zone: 'Zone B (Gate 4-6)', density: 90, capacity: 15000, currentCount: 13500, status: 'critical' },
        { zone: 'Zone C (Concourse North)', density: 80, capacity: 8000, currentCount: 6400, status: 'high' },
        { zone: 'Zone D (Concourse South)', density: 78, capacity: 8000, currentCount: 6240, status: 'high' },
        { zone: 'Zone E (VIP Lounge)', density: 25, capacity: 2000, currentCount: 500, status: 'low' },
        { zone: 'Zone F (Press Box)', density: 15, capacity: 1000, currentCount: 150, status: 'low' },
      ];

      // Metro delay
      updatedTransit = updatedTransit.map(t => {
        if (t.mode === 'metro') {
          return {
            ...t,
            status: 'delayed',
            etaMinutes: 18,
            delayReason: 'Spectator egress peak volume',
            occupancy: 'high'
          };
        }
        return t;
      });

      addTask({ title: 'Conduct post-match sanitization sweep', assignee: 'Janitorial Force', priority: 'low', location: 'Full Venue' });

      triggerLog(`Full-time egress active. High exit congestion at main gates. metro delays reported.`, 'transport');
      triggerNotif(`Spectators departing. Cleaning operations activated. Metro shuttle increased.`, 'transport');

    } else if (phase === 'penalties') {
      updatedVisitors = { total: 68420, fans: 65120, staff: 2800, vip: 500 };
      updatedMatch.attendance = 68420;
      updatedMatch.securityLevel = 'Elevated';
      updatedMatch.medicalStatus = 'Busy';

      // Crowd in stadium bowl (very low concourse density)
      updatedCrowd = [
        { zone: 'Zone A (Gate 1-3)', density: 8, capacity: 15000, currentCount: 1200, status: 'low' },
        { zone: 'Zone B (Gate 4-6)', density: 5, capacity: 15000, currentCount: 750, status: 'low' },
        { zone: 'Zone C (Concourse North)', density: 35, capacity: 8000, currentCount: 2800, status: 'low' },
        { zone: 'Zone D (Concourse South)', density: 30, capacity: 8000, currentCount: 2400, status: 'low' },
        { zone: 'Zone E (VIP Lounge)', density: 90, capacity: 2000, currentCount: 1800, status: 'high' },
        { zone: 'Zone F (Press Box)', density: 95, capacity: 1000, currentCount: 950, status: 'critical' },
      ];

      triggerLog(`Match entering Penalty Shootout! Crowd emotion high. Police stand-by active.`, 'security');
      triggerNotif(`Security Level raised to ELEVATED. Medical readiness raised to MAXIMUM.`, 'security');
    } else {
      triggerLog(`Matchday phase shifted to: ${phase.toUpperCase()}`, 'operational');
    }

    updateActiveStadium({
      matchPhase: phase,
      crowdDensity: updatedCrowd,
      transport: updatedTransit,
      visitors: updatedVisitors,
      match: updatedMatch,
      sustainability: updatedSustainability
    });

    triggerNotif(`Matchday phase shifted to: ${phase.toUpperCase()} at ${selectedStadium.city}`, 'operational');
  };

  // predefined emergencies playbooks
  const executePlaybook = async (playbookId: string) => {
    triggerLog(`Emergency Playbook initiated: ${playbookId.toUpperCase()} at ${selectedStadium.name}.`, 'security');
    playSynthTone('emergency');

    if (playbookId === 'gate-congestion') {
      await executeAction('OPEN_GATE_4', 'Playbook: Resolve Gate Congestion');
      await executeAction('REDIRECT_CROWD', 'Playbook: Redirection loop');
    } else if (playbookId === 'medical-surge') {
      await executeAction('DEPLOY_MEDICAL', 'Playbook: Deploy Medical Squad 2');
      addTask({ title: 'Mobilise standby medical stretcher unit', assignee: 'Medical Team 2', priority: 'high', location: 'Section 108' });
    } else if (playbookId === 'heavy-rain') {
      await executeAction('OPEN_GATE_4', 'Playbook: Open Covered Entrances');
      await executeAction('INCREASE_SHUTTLE', 'Playbook: Double Shuttle Line B');
      addTask({ title: 'Deploy dry corridor umbrellas', assignee: 'Gate 4 Volunteers', priority: 'medium', location: 'Gate 4' });
    } else if (playbookId === 'power-failure') {
      await executeAction('REDUCE_ENERGY', 'Playbook: Emergency dimming');
      triggerLog('Backup solar grids switched to full battery operation.', 'system');
    }
  };

  // manual incident trigger
  const triggerRandomIncident = () => {
    const INCIDENT_TEMPLATES = [
      { title: 'Lost Child Alert', type: 'operational' as const, severity: 'medium' as const, location: 'Gate 2 Concourse', recommended: 'Dispatch volunteer helpers and display photo alerts.', impact: 'Parent anxiety, local search loop', resolution: '10 mins' },
      { title: 'Suspicious Bag found', type: 'security' as const, severity: 'high' as const, location: 'Section 114 Corridor', recommended: 'Establish 10m perimeter, dispatch Security Bravo.', impact: 'Local corridor bottleneck', resolution: '15 mins' },
      { title: 'Gate Scanner Lag', type: 'operational' as const, severity: 'low' as const, location: 'Gate 3 Entry Turnstile', recommended: 'Reset local scanning terminal, dispatch technician.', impact: 'Turnstile wait times +4m', resolution: '8 mins' }
    ];

    const target = INCIDENT_TEMPLATES[Math.floor(Math.random() * INCIDENT_TEMPLATES.length)];
    const newInc: SimulatedIncident = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `sim-inc-${crypto.randomUUID()}`
        : `sim-inc-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      title: target.title,
      type: target.type,
      severity: target.severity,
      location: target.location,
      timestamp: new Date().toISOString(),
      recommendedResponse: target.recommended,
      estimatedImpact: target.impact,
      aiConfidence: 94,
      expectedResolutionTime: target.resolution,
      status: 'detected',
      progress: 0,
      afterActionReport: null
    };

    updateActiveStadium({
      simulatedIncidents: [newInc, ...selectedStadium.simulatedIncidents]
    });

    triggerLog(`New Incident Detected: ${target.title} at ${target.location}.`, target.type);
    triggerNotif(`🚨 AI Warning: ${target.title} detected. Action recommended.`, target.type);
    playSynthTone('emergency');
  };

  // AI DIGITAL TWIN LOOP: interpolates stadium telemetry values every 18 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Loop over all stadiums and slightly adjust values (crowd, weather, sustainability)
      setStadiums(prevStadiums => {
        return prevStadiums.map(stadium => {
          // 1. Crowd Density fluctuation
          const updatedCrowd = stadium.crowdDensity.map(c => {
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
            const nextDensity = Math.min(100, Math.max(5, c.density + change));
            return {
              ...c,
              density: nextDensity,
              currentCount: Math.round(c.capacity * (nextDensity / 100))
            };
          });

          // 2. Weather temp fluctuation
          const tempChange = Math.floor(Math.random() * 3) - 1; // -1, 0, +1 temp change
          const nextTemp = Math.min(42, Math.max(12, stadium.weather.temp + tempChange * 0.2));

          // 3. Sustainability Energy Output
          const energyChange = Math.floor(Math.random() * 100) - 50;
          const nextEnergy = Math.min(9000, Math.max(1000, stadium.sustainability.energyUsageKw + energyChange));

          // 4. Incident Lifecycle Evolution (Detected -> Assigned -> Responding -> Contained -> Resolved -> Archived)
          const updatedIncidents = stadium.simulatedIncidents.map(inc => {
            if (inc.status === 'archived') return inc;
            
            let nextProgress = inc.progress + Math.floor(Math.random() * 15) + 5;
            let nextStatus: SimulatedIncident['status'] = inc.status;

            if (nextProgress >= 100) {
              nextProgress = 100;
              if (inc.status !== 'resolved') {
                nextStatus = 'resolved';
                
                // Generate After Action Report UI PDF mock
                const reportId = `rep-${inc.id}`;
                const actionReport: AfterActionReport = {
                  id: reportId,
                  title: inc.title,
                  summary: `AI Digital Twin automatically resolved incident: ${inc.title} at ${inc.location}. Operational stability restored.`,
                  timeline: [
                    { time: 'T+0m', event: `Incident detected by AI Telemetry sensors.` },
                    { time: 'T+2m', event: `Security Dispatch payload deployed.` },
                    { time: 'T+8m', event: `Operations crews contained corridor bottlenecks.` },
                    { time: 'T+12m', event: `Resolution verified. Systems returned to nominal.` }
                  ],
                  departments: ['Venue Operations', 'AI Control Team', 'Staff Volunteers'],
                  aiActions: [inc.recommendedResponse],
                  humanActions: ['Field verification check', 'CCTV monitoring log completed'],
                  resolutionTime: inc.expectedResolutionTime,
                  lessonsLearned: 'Sensor configuration requires regular baseline calibration to reduce false alarms.',
                  futureRecommendation: 'Establish redundant backup terminals at Gate entrance lines.'
                };
                inc.afterActionReport = actionReport;

                // Dispatch notification
                setTimeout(() => {
                  triggerLog(`Incident Resolved: ${inc.title} resolved at ${stadium.name}.`, inc.type);
                  triggerNotif(`✓ Incident Resolved: ${inc.title} at ${stadium.city}.`, inc.type);
                  playSynthTone('success');
                }, 100);
              } else {
                nextStatus = 'archived';
              }
            } else if (nextProgress > 80) {
              nextStatus = 'contained';
            } else if (nextProgress > 50) {
              nextStatus = 'responding';
            } else if (nextProgress > 20) {
              nextStatus = 'assigned';
            }

            return {
              ...inc,
              status: nextStatus,
              progress: nextProgress
            };
          });

          return {
            ...stadium,
            crowdDensity: updatedCrowd,
            weather: {
              ...stadium.weather,
              temp: parseFloat(nextTemp.toFixed(1))
            },
            sustainability: {
              ...stadium.sustainability,
              energyUsageKw: nextEnergy
            },
            simulatedIncidents: updatedIncidents
          };
        });
      });
    }, 18000); // Trigger every 18 seconds!

    return () => clearInterval(interval);
  }, [triggerLog, triggerNotif]);

  // REUSABLE AI ACTION EXECUTION ENGINE
  const executeAction = async (actionType: string, prompt: string): Promise<boolean> => {
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
      const updatedCrowd = crowdDensity.map(c => {
        if (c.zone.includes('Gate 3') || c.zone.includes('Concourse North')) {
          return { ...c, density: 68, currentCount: Math.round(c.capacity * 0.68), status: 'moderate' as const };
        }
        if (c.zone.includes('Gate 4') || c.zone.includes('Gate 4-6')) {
          return { ...c, density: 60, currentCount: Math.round(c.capacity * 0.60), status: 'moderate' as const };
        }
        return c;
      });
      const updatedAlerts = alerts.map(a => a.id === 'alert-1' || a.id.includes('la-alert-1') ? { ...a, status: 'resolved' as const } : a);
      
      updateActiveStadium({
        crowdDensity: updatedCrowd,
        alerts: updatedAlerts,
        predictions: [] // clear predicted overflow alert!
      });

      triggerLog(`Gate 4 turnstiles opened. Crowd Control Bravo dispatched to redirect flows at ${selectedStadium.name}.`, 'security');
      triggerNotif(`Gate 4 turnstiles opened at ${selectedStadium.name}.`, 'security');

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
      const newInc: IncidentReport = {
        id: `inc-${newAlert.id}`,
        issue: 'Heat exhaustion alert at Section 108',
        reporter: 'AI Camera Telemetry',
        status: 'open',
        time: '1s ago'
      };
      
      updateActiveStadium({
        alerts: [newAlert, ...alerts],
        incidents: [newInc, ...incidents]
      });

      triggerLog(`Medical Response Team 2 dispatched to Section 108 at ${selectedStadium.name}.`, 'medical');
      triggerNotif(`Medical dispatch mobilized to ${selectedStadium.name}.`, 'medical');

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
        if (t.mode === 'shuttle' || t.id.includes('t-2')) {
          return { ...t, status: 'on-time' as const, etaMinutes: 4, occupancy: 'high' as const };
        }
        return t;
      });

      updateActiveStadium({
        transport: updatedTrans
      });

      triggerLog(`Shuttle frequency increased at ${selectedStadium.name}. Transit delays bypassed.`, 'transport');
      triggerNotif(`Shuttle frequency increased at ${selectedStadium.name}.`, 'transport');

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
        if (v.task.includes('Accessibility') || v.id === 'v-3') {
          return { ...v, status: 'on-duty' as const };
        }
        return v;
      });
      const updatedRequests = accessibility.map(r => {
        if (r.status === 'pending') return { ...r, status: 'in-progress' as const, assignedStaff: 'Volunteer Kenji S.' };
        return r;
      });

      updateActiveStadium({
        volunteers: updatedVolunteers,
        accessibility: updatedRequests
      });

      triggerLog(`Standby accessibility escort volunteers activated at ${selectedStadium.name}.`, 'operational');
      triggerNotif(`Accessibility escort volunteers assigned at ${selectedStadium.name}.`, 'operational');

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
        energyUsageKw: Math.round(sustainability.energyUsageKw * 0.9),
        renewablePercentage: Math.min(100, sustainability.renewablePercentage + 5)
      };

      updateActiveStadium({
        sustainability: updatedSustain
      });

      triggerLog(`Secondary advertising boards dimmed to optimize HVAC power grid at ${selectedStadium.name}.`, 'system');
      triggerNotif(`Advertising boards dimmed to reclaim energy load at ${selectedStadium.name}.`, 'operational');

      outcomeText = 'Concourse power consumption reduced. Clean energy ratio increased.';
      report = {
        title: 'Energy Draw Optimized',
        beforeVal: `${sustainability.energyUsageKw} kW`,
        afterVal: `${updatedSustain.energyUsageKw} kW`,
        metricLabel: 'Grid Consump.',
        divertedCount: 0,
        extraStaff: 0,
        waitBefore: 'Peak Draw',
        waitAfter: 'Nominal'
      };
    } else if (actionType === 'REDIRECT_CROWD') {
      const updatedCrowd = crowdDensity.map(c => {
        if (c.zone.includes('North')) return { ...c, density: 72, currentCount: Math.round(c.capacity * 0.72) };
        if (c.zone.includes('South')) return { ...c, density: 65, currentCount: Math.round(c.capacity * 0.65) };
        return c;
      });

      updateActiveStadium({
        crowdDensity: updatedCrowd
      });

      triggerLog(`Pedestrian inflow redirected to balance concourse zones at ${selectedStadium.name}.`, 'security');
      triggerNotif(`Spectator flows redirected at ${selectedStadium.name}.`, 'security');

      outcomeText = 'Spectator flow balanced. North concourse congestion decreased.';
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
      triggerLog(`Matchday carbon audit ledger generated for ${selectedStadium.name}.`, 'system');
      triggerNotif(`Sustainability ledger generated at ${selectedStadium.name}.`, 'operational');

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

    const historyItem: OperationHistoryItem = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `hist-${crypto.randomUUID()}`
        : `hist-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      prompt,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      actionName: actionType,
      outcome: outcomeText,
      status: 'success',
      stadiumId: selectedStadiumId,
      prevState
    };

    saveState('stadium_ops_history', [historyItem, ...history], setHistory);
    setActiveReport(report);
    
    // Play sound cues
    playSynthTone('success');
    setTimeout(() => playSynthTone('ai-complete'), 350);

    return true;
  };

  // Rollback Undo Operations System
  const rollbackOperation = (historyId: string) => {
    const item = history.find(h => h.id === historyId);
    if (!item || item.status !== 'success') return;

    // Restore state of the targeted stadium
    const updatedList = stadiums.map(s => {
      if (s.id === item.stadiumId) {
        return {
          ...s,
          crowdDensity: item.prevState.crowdDensity,
          visitors: item.prevState.visitors,
          alerts: item.prevState.alerts,
          transport: item.prevState.transport,
          accessibility: item.prevState.accessibility,
          sustainability: item.prevState.sustainability,
          volunteers: item.prevState.volunteers,
          tasks: item.prevState.tasks,
          incidents: item.prevState.incidents
        };
      }
      return s;
    });
    saveState('stadium_multi_list', updatedList, setStadiums);

    const updatedHistory = history.map(h => h.id === historyId ? { ...h, status: 'rolled_back' as const } : h);
    saveState('stadium_ops_history', updatedHistory, setHistory);

    triggerLog(`Operation rolled back: ${item.actionName} at stadium: ${item.stadiumId.toUpperCase()}.`, 'system');
    triggerNotif(`Rollback executed for operation: ${item.actionName}`, 'operational');
  };

  const rejectRecommendation = (actionType: string, prompt: string) => {
    const historyItem: OperationHistoryItem = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `hist-${crypto.randomUUID()}`
        : `hist-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      prompt,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      actionName: actionType,
      outcome: 'Recommendation rejected by FIFA Board.',
      status: 'cancelled',
      stadiumId: selectedStadiumId,
      prevState: {
        crowdDensity, visitors, alerts, transport, accessibility, sustainability, volunteers, tasks, incidents
      }
    };
    saveState('stadium_ops_history', [historyItem, ...history], setHistory);
    triggerLog(`AI Recommendation rejected: ${actionType} by FIFA Board.`, 'system');
  };

  // Direct operations triggers targeting current active stadium
  const addTask = (task: Omit<TaskAssignment, 'id' | 'status'>) => {
    const newTask: TaskAssignment = {
      ...task,
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `task-${crypto.randomUUID()}`
        : `task-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      status: 'pending'
    };
    updateActiveStadium({
      tasks: [newTask, ...tasks]
    });
    triggerLog(`Task assigned: "${task.title}" allocated to ${task.assignee} at ${selectedStadium.name}.`, 'operational');
    playSynthTone('dispatch');
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
    updateActiveStadium({ tasks: updated });
  };

  const addEmergency = (alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => {
    const newAlert: EmergencyAlert = {
      ...alert,
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `alert-${crypto.randomUUID()}`
        : `alert-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    updateActiveStadium({
      alerts: [newAlert, ...alerts]
    });
    triggerLog(`Emergency dispatched: ${alert.title} at ${alert.location} in ${selectedStadium.name}.`, 'security');
    playSynthTone('emergency');
  };

  const resolveEmergency = (id: string) => {
    const target = alerts.find(a => a.id === id);
    if (!target) return;
    const updated = alerts.map(a => a.id === id ? { ...a, status: 'resolved' as const } : a);
    const updatedInc = incidents.map(inc => inc.issue === target.title ? { ...inc, status: 'resolved' as const } : inc);
    
    updateActiveStadium({
      alerts: updated,
      incidents: updatedInc
    });

    triggerLog(`Emergency resolved: ${target.title} at ${selectedStadium.name}.`, 'security');
    triggerNotif(`Emergency dispatch resolved: ${target.title}`, 'security');
  };

  const claimAccessibility = (id: string) => {
    const updated = accessibility.map(r => r.id === id ? { ...r, status: 'in-progress' as const, assignedStaff: 'Volunteer Kenji S.' } : r);
    updateActiveStadium({ accessibility: updated });
    triggerLog('Accessibility wheelchair request companion assigned.', 'operational');
  };

  const addAccessibilityRequest = (userEmail: string, requestType: AccessibilityRequest['requestType'], location: string) => {
    const newReq: AccessibilityRequest = {
      id: `req-${Math.random().toString(36).substring(2, 9)}`,
      userEmail,
      requestType,
      location,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    const updated = [newReq, ...accessibility];
    updateActiveStadium({ accessibility: updated });
    triggerLog(`New accessibility assistance request registered: ${requestType.toUpperCase()} at ${location}.`, 'operational');
    triggerNotif(`Accessibility request submitted: ${requestType.toUpperCase()}`, 'operational');
  };

  const completeAccessibility = (id: string) => {
    const updated = accessibility.map(r => r.id === id ? { ...r, status: 'completed' as const } : r);
    updateActiveStadium({ accessibility: updated });
    triggerLog('Accessibility request marked as completed.', 'operational');
  };

  const refreshFeeds = () => {
    const updated = crowdDensity.map(c => {
      const change = Math.floor(Math.random() * 5) - 2;
      return { ...c, density: Math.min(100, Math.max(5, c.density + change)) };
    });
    updateActiveStadium({ crowdDensity: updated });
    triggerLog('Workforce telemetry sensor feeds re-synced.', 'system');
  };

  const refreshTransit = () => {
    const updated = transport.map(t => {
      const delta = Math.floor(Math.random() * 3) - 1;
      return { ...t, etaMinutes: Math.max(1, t.etaMinutes + delta) };
    });
    updateActiveStadium({ transport: updated });
    triggerLog('Transit operations schedules synchronized.', 'transport');
  };

  const clearNotifications = () => {
    saveState('stadium_notifications', [] as NotificationItem[], setNotifications);
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveState('stadium_notifications', updated, setNotifications);
  };

  const contextValue = useMemo(() => ({
    stadiums,
    selectedStadiumId,
    selectedStadium,
    selectStadium,
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
    addAccessibilityRequest,
    completeAccessibility,
    refreshFeeds,
    refreshTransit,
    clearNotifications,
    markNotificationRead,
    changeMatchPhase,
    executePlaybook,
    triggerRandomIncident,
    resilienceScore,
    fanExperienceScore,
    fanExperienceBreakdown
  }), [
    stadiums,
    selectedStadiumId,
    selectedStadium,
    selectStadium,
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
    addAccessibilityRequest,
    completeAccessibility,
    refreshFeeds,
    refreshTransit,
    clearNotifications,
    markNotificationRead,
    changeMatchPhase,
    executePlaybook,
    triggerRandomIncident,
    resilienceScore,
    fanExperienceScore,
    fanExperienceBreakdown
  ]);

  return (
    <StadiumContext.Provider value={contextValue}>
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
