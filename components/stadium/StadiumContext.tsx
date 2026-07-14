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

export interface StadiumData {
  id: string;
  name: string;
  city: string;
  location: string;
  xPercent: number; // Relative map x
  yPercent: number; // Relative map y
  healthScore: number;
  stadiumHealth: 'Excellent' | 'Good' | 'Warning' | 'Critical';
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
  refreshFeeds: () => void;
  refreshTransit: () => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
}

const StadiumContext = createContext<StadiumContextType | undefined>(undefined);

// Initial Stadium templates
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
      { id: 'alert-3', title: 'Medical Assistance Required', description: 'Spectator experiencing heat exhaustion in Section 104.', severity: 'high', location: 'Section 104, Row K', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: 'active', assignedTeam: 'Medical Response 1' },
    ],
    transport: [
      { id: 't-1', mode: 'metro', lineName: 'Stadium Express (Line 1)', status: 'on-time', etaMinutes: 4, occupancy: 'high' },
      { id: 't-2', mode: 'bus', lineName: 'Downtown Shuttle (Route A)', status: 'delayed', etaMinutes: 12, occupancy: 'medium', delayReason: 'Traffic near Expressway' },
      { id: 't-3', mode: 'shuttle', lineName: 'West Parking Lot Transfer', status: 'on-time', etaMinutes: 3, occupancy: 'low' },
    ],
    accessibility: [
      { id: 'req-1', userEmail: 'fan1@example.com', requestType: 'wheelchair', location: 'Gate 1 Drop-off Zone', status: 'in-progress', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), assignedStaff: 'Volunteer Sarah M.' },
      { id: 'req-2', userEmail: 'fan2@example.com', requestType: 'sensory', location: 'Suite 24 Entrance', status: 'pending', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    ],
    sustainability: { energyUsageKw: 4200, renewablePercentage: 86, carbonOffsetKg: 3240, wasteRecycledKg: 1480, waterSavedLitres: 12400 },
    volunteers: [
      { id: 'v-1', name: 'Marcus Vance', task: 'Crowd Directing', location: 'Gate 3', status: 'on-duty', checkInTime: '15:30' },
      { id: 'v-2', name: 'Elena Rostova', task: 'Medical Aid Post B', location: 'Section 112', status: 'on-duty', checkInTime: '16:00' },
    ],
    tasks: [
      { id: 't1', title: 'Verify wheelchair ramp deployment', assignee: 'Jane (Volunteer)', priority: 'medium', status: 'pending', location: 'Gate 4 North' },
    ],
    incidents: [
      { id: 'i1', issue: 'Spill reported near concession POD 3', reporter: 'Fan (reported via AI)', status: 'open', time: '5m ago' }
    ],
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
      { id: 'p1', message: 'Gate 3 queue likely to exceed capacity in 12 minutes.', confidence: 92, impact: 'Heavy bottleneck, wait times +15m', action: 'Open Gate 4 turnstiles immediately', risk: 'Medium', reasoning: ['Inflow volume +18% past 10m', 'Ticket scan processing lag', 'Historical Quarter Final queue pattern'] },
      { id: 'p2', message: 'Parking Lot C will reach full capacity in 18 minutes.', confidence: 88, impact: 'Incoming congestion on North Blvd', action: 'Redirect vehicles to West Parking Zone', risk: 'Low', reasoning: ['GPS traffic logs show 340 cars inbound', 'Current occupancy at 94%'] }
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
    crowdDensity: [
      { zone: 'Zone A (Gate 1-3)', density: 60, capacity: 20000, currentCount: 12000, status: 'moderate' },
      { zone: 'Zone B (Gate 4-6)', density: 95, capacity: 20000, currentCount: 19000, status: 'critical' },
      { zone: 'Zone C (Concourse)', density: 85, capacity: 15000, currentCount: 12750, status: 'high' }
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
    predictions: [
      { id: 'la-p1', message: 'Gate 5 bottleneck risk critical in 8 minutes.', confidence: 96, impact: 'Gridlock near main escalators', action: 'Deploy Crowd Control Bravo', risk: 'High', reasoning: ['Gate 5 scan rate at peak capacity', 'Escalator sensor reports load limit'] }
    ]
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
    crowdDensity: [
      { zone: 'Zone A', density: 40, capacity: 25000, currentCount: 10000, status: 'low' },
      { zone: 'Zone B', density: 50, capacity: 25000, currentCount: 12500, status: 'moderate' }
    ],
    visitors: { total: 80200, fans: 76000, staff: 3500, vip: 700 },
    alerts: [],
    transport: [
      { id: 'ny-t-1', mode: 'train', lineName: 'NJ Transit Meadowlands Rail', status: 'on-time', etaMinutes: 5, occupancy: 'high' }
    ],
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
    predictions: [
      { id: 'ny-p1', message: 'Concession queue peaks at halftime.', confidence: 85, impact: 'Wait times +8 mins', action: 'Activate secondary concession POS', risk: 'Low', reasoning: ['Halftime purchase history', 'Pre-match food sales tracker'] }
    ]
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
    crowdDensity: [
      { zone: 'Zone A', density: 65, capacity: 30000, currentCount: 19500, status: 'moderate' }
    ],
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
    predictions: [
      { id: 'dl-p1', message: 'AC load peak demands grid battery activation.', confidence: 91, impact: 'Utility spikes cost +15%', action: 'Deploy Battery Reserve grid optimization', risk: 'Low', reasoning: ['Ambient temp 33C', 'Retractable roof closed logs'] }
    ]
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
    predictions: [
      { id: 'tr-p1', message: 'Rain expected to slow entry scans by 3 minutes.', confidence: 78, impact: 'Slight delays at uncovered lines', action: 'Open overflow scanning gates', risk: 'Low', reasoning: ['Precipitation probability 65%', 'Outdoor queue configuration'] }
    ]
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
    predictions: []
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
    predictions: []
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
    predictions: []
  }
];

const INITIAL_TIMELINE: TimelineItem[] = [
  { time: '14:29', event: 'Gate 3 congestion warning updated (Vancouver BC Place).', type: 'security' },
  { time: '14:26', event: 'VIP convoy entered West gate bay (New York MetLife).', type: 'operational' },
  { time: '14:20', event: 'Medical Team Alpha dispatched to Section 104.', type: 'medical' },
  { time: '14:18', event: 'Metro express arrived at North Terminal.', type: 'transport' },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', message: 'Gate 3 congestion detected in Vancouver. Reroutes active.', type: 'security', read: false, timestamp: '14:32' },
  { id: 'n2', message: 'Medical response completed at Section 104.', type: 'medical', read: false, timestamp: '14:29' },
  { id: 'n3', message: 'Los Angeles metro transit delayed on Century Blvd.', type: 'transport', read: false, timestamp: '14:25' },
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
      const getL = (key: string, fallback: any) => {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      };
      const savedStadiums = getL('stadium_multi_list', INITIAL_STADIUMS);
      const savedSelectedId = getL('stadium_selected_id', 'vancouver');
      const savedTimeline = getL('stadium_ops_timeline', INITIAL_TIMELINE);
      const savedNotifs = getL('stadium_notifications', INITIAL_NOTIFICATIONS);
      const savedHistory = getL('stadium_ops_history', []);

      setTimeout(() => {
        setStadiums(savedStadiums);
        setSelectedStadiumId(savedSelectedId);
        setTimeline(savedTimeline);
        setNotifications(savedNotifs);
        setHistory(savedHistory);
      }, 0);
    }
  }, []);

  // Sync state helper
  const saveState = <T,>(key: string, val: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
    setter(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  const selectStadium = (id: string) => {
    saveState('stadium_selected_id', id, setSelectedStadiumId);
    triggerLog(`Commissioner dashboard switched stadium context to: ${id.toUpperCase()}`, 'system');
  };

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

  // REUSABLE AI ACTION EXECUTION ENGINE (Targets currently active stadium)
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

    if (!outcomeText) {
      triggerLog(`AI Action executed: ${actionType} at ${selectedStadium.name}`, 'system');
      triggerNotif(`Operations applied payload at ${selectedStadium.name}`, 'operational');
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

    const historyItem: OperationHistoryItem = {
      id: `hist-${Date.now()}`,
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
      id: `hist-${Date.now()}`,
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
      id: `task-${Date.now()}`,
      status: 'pending'
    };
    updateActiveStadium({
      tasks: [newTask, ...tasks]
    });
    triggerLog(`Task assigned: "${task.title}" allocated to ${task.assignee} at ${selectedStadium.name}.`, 'operational');
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
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    updateActiveStadium({
      alerts: [newAlert, ...alerts]
    });
    triggerLog(`Emergency dispatched: ${alert.title} at ${alert.location} in ${selectedStadium.name}.`, 'security');
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

  return (
    <StadiumContext.Provider value={{
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
