import { 
  CrowdDensity, 
  ActiveVisitors, 
  EmergencyAlert, 
  TransportStatus, 
  AccessibilityRequest, 
  SustainabilityMetrics, 
  VolunteerActivity 
} from '@/types';
import { isSupabaseConfigured, getSupabaseBrowserClient } from './supabase/client';

// Default mock data for Local Demo Mode
const DEFAULT_CROWD_DENSITY: CrowdDensity[] = [
  { zone: 'Zone A (Gate 1-3)', density: 78, capacity: 15000, currentCount: 11700, status: 'high' },
  { zone: 'Zone B (Gate 4-6)', density: 45, capacity: 15000, currentCount: 6750, status: 'moderate' },
  { zone: 'Zone C (Concourse North)', density: 92, capacity: 8000, currentCount: 7360, status: 'critical' },
  { zone: 'Zone D (Concourse South)', density: 60, capacity: 8000, currentCount: 4800, status: 'moderate' },
  { zone: 'Zone E (VIP Lounge)', density: 30, capacity: 2000, currentCount: 600, status: 'low' },
  { zone: 'Zone F (Press Box)', density: 55, capacity: 1000, currentCount: 550, status: 'moderate' },
];

const DEFAULT_ACTIVE_VISITORS: ActiveVisitors = {
  total: 68420,
  fans: 65120,
  staff: 2800,
  vip: 500,
};

const DEFAULT_EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: 'alert-1',
    title: 'Crowd Congestion at Gate 3',
    description: 'High traffic density slowing entry. Re-routing incoming fans to Gate 4.',
    severity: 'medium',
    location: 'Gate 3 Turnstiles',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'active',
    assignedTeam: 'Crowd Control Alpha',
  },
  {
    id: 'alert-2',
    title: 'Elevator Outage',
    description: 'Elevator EL-4 in West Stand is unresponsive. Technician dispatched.',
    severity: 'low',
    location: 'West Stand (Level 2)',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'investigating',
    assignedTeam: 'Maintenance Team B',
  },
  {
    id: 'alert-3',
    title: 'Medical Assistance Required',
    description: 'Spectator experiencing heat exhaustion in Section 104.',
    severity: 'high',
    location: 'Section 104, Row K',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'active',
    assignedTeam: 'Medical Response 1',
  },
];

const DEFAULT_TRANSPORT_STATUS: TransportStatus[] = [
  { id: 't-1', mode: 'metro', lineName: 'Stadium Express (Line 1)', status: 'on-time', etaMinutes: 4, occupancy: 'high' },
  { id: 't-2', mode: 'bus', lineName: 'Downtown Shuttle (Route A)', status: 'delayed', etaMinutes: 12, occupancy: 'medium', delayReason: 'Traffic near Expressway' },
  { id: 't-3', mode: 'shuttle', lineName: 'West Parking Lot Transfer', status: 'on-time', etaMinutes: 3, occupancy: 'low' },
  { id: 't-4', mode: 'train', lineName: 'Regional Commuter Rail', status: 'on-time', etaMinutes: 18, occupancy: 'high' },
];

const DEFAULT_ACCESSIBILITY_REQUESTS: AccessibilityRequest[] = [
  {
    id: 'req-1',
    userEmail: 'fan1@example.com',
    requestType: 'wheelchair',
    location: 'Gate 1 Drop-off Zone',
    status: 'in-progress',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    assignedStaff: 'Volunteer Sarah M.',
  },
  {
    id: 'req-2',
    userEmail: 'fan2@example.com',
    requestType: 'sensory',
    location: 'Suite 24 Entrance',
    status: 'pending',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-3',
    userEmail: 'fan3@example.com',
    requestType: 'guide',
    location: 'Information Desk North',
    status: 'completed',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    assignedStaff: 'Volunteer David K.',
  },
];

const DEFAULT_SUSTAINABILITY_METRICS: SustainabilityMetrics = {
  energyUsageKw: 4200,
  renewablePercentage: 86,
  carbonOffsetKg: 3240,
  wasteRecycledKg: 1480,
  waterSavedLitres: 12400,
};

const DEFAULT_VOLUNTEERS: VolunteerActivity[] = [
  { id: 'v-1', name: 'Marcus Vance', task: 'Crowd Directing', location: 'Gate 3', status: 'on-duty', checkInTime: '15:30' },
  { id: 'v-2', name: 'Elena Rostova', task: 'Medical Aid Post B', location: 'Section 112', status: 'on-duty', checkInTime: '16:00' },
  { id: 'v-3', name: 'Kenji Sato', task: 'Accessibility Escort', location: 'Gate 1', status: 'on-duty', checkInTime: '15:45' },
  { id: 'v-4', name: 'Amina Diop', task: 'Sustainability Information', location: 'Green Plaza', status: 'break', checkInTime: '15:00' },
];

// Reusable Database operations
export class DatabaseService {
  private static isClient() {
    return typeof window !== 'undefined';
  }

  private static getLocal<T>(key: string, defaultValue: T): T {
    if (!this.isClient()) return defaultValue;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setLocal<T>(key: string, value: T): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  // --- CROWD DENSITY ---
  static async getCrowdDensity(): Promise<CrowdDensity[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase.from('crowd_density').select('*');
        if (!error && data) return data as CrowdDensity[];
      }
    }
    return this.getLocal('stadium_crowd_density', DEFAULT_CROWD_DENSITY);
  }

  // --- ACTIVE VISITORS ---
  static async getActiveVisitors(): Promise<ActiveVisitors> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase.from('active_visitors').select('*').single();
        if (!error && data) return data as ActiveVisitors;
      }
    }
    return this.getLocal('stadium_active_visitors', DEFAULT_ACTIVE_VISITORS);
  }

  // --- EMERGENCY ALERTS ---
  static async getEmergencyAlerts(): Promise<EmergencyAlert[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('emergency_alerts')
          .select('*')
          .order('timestamp', { ascending: false });
        if (!error && data) return data as EmergencyAlert[];
      }
    }
    return this.getLocal('stadium_emergency_alerts', DEFAULT_EMERGENCY_ALERTS);
  }

  static async addEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>): Promise<EmergencyAlert> {
    const newAlert: EmergencyAlert = {
      ...alert,
      id: `alert-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase.from('emergency_alerts').insert(newAlert).select().single();
        if (!error && data) return data as EmergencyAlert;
      }
    }

    const current = this.getLocal<EmergencyAlert[]>('stadium_emergency_alerts', DEFAULT_EMERGENCY_ALERTS);
    const updated = [newAlert, ...current];
    this.setLocal('stadium_emergency_alerts', updated);
    return newAlert;
  }

  static async resolveEmergencyAlert(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase
          .from('emergency_alerts')
          .update({ status: 'resolved' })
          .eq('id', id);
        if (!error) return true;
      }
    }

    const current = this.getLocal<EmergencyAlert[]>('stadium_emergency_alerts', DEFAULT_EMERGENCY_ALERTS);
    const updated = current.map(alert => alert.id === id ? { ...alert, status: 'resolved' as const } : alert);
    this.setLocal('stadium_emergency_alerts', updated);
    return true;
  }

  // --- TRANSPORT STATUS ---
  static async getTransportStatus(): Promise<TransportStatus[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase.from('transport_status').select('*');
        if (!error && data) return data as TransportStatus[];
      }
    }
    return this.getLocal('stadium_transport_status', DEFAULT_TRANSPORT_STATUS);
  }

  static async updateTransportStatus(id: string, status: TransportStatus['status'], etaMinutes: number): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase
          .from('transport_status')
          .update({ status, etaMinutes })
          .eq('id', id);
        if (!error) return true;
      }
    }

    const current = this.getLocal<TransportStatus[]>('stadium_transport_status', DEFAULT_TRANSPORT_STATUS);
    const updated = current.map(t => t.id === id ? { ...t, status, etaMinutes } : t);
    this.setLocal('stadium_transport_status', updated);
    return true;
  }

  // --- ACCESSIBILITY REQUESTS ---
  static async getAccessibilityRequests(): Promise<AccessibilityRequest[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('accessibility_requests')
          .select('*')
          .order('timestamp', { ascending: false });
        if (!error && data) return data as AccessibilityRequest[];
      }
    }
    return this.getLocal('stadium_accessibility_requests', DEFAULT_ACCESSIBILITY_REQUESTS);
  }

  static async addAccessibilityRequest(req: Omit<AccessibilityRequest, 'id' | 'timestamp' | 'status'>): Promise<AccessibilityRequest> {
    const newReq: AccessibilityRequest = {
      ...req,
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase.from('accessibility_requests').insert(newReq).select().single();
        if (!error && data) return data as AccessibilityRequest;
      }
    }

    const current = this.getLocal<AccessibilityRequest[]>('stadium_accessibility_requests', DEFAULT_ACCESSIBILITY_REQUESTS);
    const updated = [newReq, ...current];
    this.setLocal('stadium_accessibility_requests', updated);
    return newReq;
  }

  static async updateAccessibilityStatus(id: string, status: AccessibilityRequest['status'], assignedStaff?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase
          .from('accessibility_requests')
          .update({ status, assignedStaff })
          .eq('id', id);
        if (!error) return true;
      }
    }

    const current = this.getLocal<AccessibilityRequest[]>('stadium_accessibility_requests', DEFAULT_ACCESSIBILITY_REQUESTS);
    const updated = current.map(r => r.id === id ? { ...r, status, assignedStaff } : r);
    this.setLocal('stadium_accessibility_requests', updated);
    return true;
  }

  // --- SUSTAINABILITY METRICS ---
  static async getSustainabilityMetrics(): Promise<SustainabilityMetrics> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase.from('sustainability_metrics').select('*').single();
        if (!error && data) return data as SustainabilityMetrics;
      }
    }
    return this.getLocal('stadium_sustainability_metrics', DEFAULT_SUSTAINABILITY_METRICS);
  }

  // --- VOLUNTEER ACTIVITY ---
  static async getVolunteers(): Promise<VolunteerActivity[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase.from('volunteer_activity').select('*');
        if (!error && data) return data as VolunteerActivity[];
      }
    }
    return this.getLocal('stadium_volunteers', DEFAULT_VOLUNTEERS);
  }
}
