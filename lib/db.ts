/* eslint-disable @typescript-eslint/no-explicit-any */
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

  static async updateSustainabilityMetrics(metrics: Partial<SustainabilityMetrics>): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase
          .from('sustainability_metrics')
          .update(metrics)
          .eq('id', 1); // Assuming singular row
        if (!error) return true;
      }
    }
    const current = this.getLocal<SustainabilityMetrics>('stadium_sustainability_metrics', DEFAULT_SUSTAINABILITY_METRICS);
    const updated = { ...current, ...metrics };
    this.setLocal('stadium_sustainability_metrics', updated);
    return true;
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

  static async updateVolunteerStatus(id: string, status: VolunteerActivity['status'], task?: string, location?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const updates: Record<string, string> = { status };
        if (task) updates.task = task;
        if (location) updates.location = location;
        const { error } = await supabase
          .from('volunteer_activity')
          .update(updates)
          .eq('id', id);
        if (!error) return true;
      }
    }
    const current = this.getLocal<VolunteerActivity[]>('stadium_volunteers', DEFAULT_VOLUNTEERS);
    const updated = current.map(v => v.id === id ? { ...v, status, task: task || v.task, location: location || v.location } : v);
    this.setLocal('stadium_volunteers', updated);
    return true;
  }

  // --- CROWD DENSITY UPDATE ---
  static async updateCrowdDensity(zone: string, density: number): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase
          .from('crowd_density')
          .update({ density })
          .eq('zone', zone);
        if (!error) return true;
      }
    }
    const current = this.getLocal<CrowdDensity[]>('stadium_crowd_density', DEFAULT_CROWD_DENSITY);
    const updated = current.map(c => {
      if (c.zone === zone) {
        const currentCount = Math.round((density / 100) * c.capacity);
        let status: CrowdDensity['status'] = 'low';
        if (density > 85) status = 'critical';
        else if (density > 70) status = 'high';
        else if (density > 45) status = 'moderate';
        return { ...c, density, currentCount, status };
      }
      return c;
    });
    this.setLocal('stadium_crowd_density', updated);
    return true;
  }

  // --- ACCESS REQUESTS WORKFLOW ---
  static async getAccessRequests(): Promise<any[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('access_requests')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data) return data;
        } catch (err) {
          console.warn('Supabase access_requests query failed, using local fallback:', err);
        }
      }
    }
    return this.getLocal<any[]>('stadium_access_requests', []);
  }

  static async addAccessRequest(req: { name: string; email: string; organization: string; requested_role: string; reason: string }): Promise<any> {
    const newReq = {
      ...req,
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `req-${Date.now()}`,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await supabase.from('access_requests').insert(newReq).select().single();
          if (!error && data) return data;
        } catch (err) {
          console.warn('Supabase access_requests insert failed, using local fallback:', err);
        }
      }
    }

    const current = this.getLocal<any[]>('stadium_access_requests', []);
    const updated = [newReq, ...current];
    this.setLocal('stadium_access_requests', updated);
    return newReq;
  }

  static async updateUserRoleByEmail(email: string, role: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('email', email);
          if (!error) return true;
        } catch (err) {
          console.warn('Failed to update profile role in Supabase:', err);
        }
      }
    }

    const usersStr = localStorage.getItem('stadium_os_demo_users') || '[]';
    let users = JSON.parse(usersStr);
    let updated = false;
    users = users.map((u: any) => {
      if (u.email === email) {
        updated = true;
        return { ...u, role };
      }
      return u;
    });
    if (updated) {
      localStorage.setItem('stadium_os_demo_users', JSON.stringify(users));
    }

    const currentDemoUserStr = localStorage.getItem('stadium_os_demo_user');
    if (currentDemoUserStr) {
      const currentDemoUser = JSON.parse(currentDemoUserStr);
      if (currentDemoUser.email === email) {
        currentDemoUser.role = role;
        localStorage.setItem('stadium_os_demo_user', JSON.stringify(currentDemoUser));
      }
    }

    return true;
  }

  static async updateAccessRequestStatus(id: string, status: 'Approved' | 'Rejected'): Promise<boolean> {
    let email = '';
    let requestedRole = '';

    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: request } = await supabase
            .from('access_requests')
            .select('email, requested_role')
            .eq('id', id)
            .single();
          
          if (request) {
            email = request.email;
            requestedRole = request.requested_role;
          }

          const { error } = await supabase
            .from('access_requests')
            .update({ status })
            .eq('id', id);
          
          if (error) console.warn('Supabase access_requests update status error:', error);
        } catch (err) {
          console.warn('Supabase access_requests update status query failed:', err);
        }
      }
    }

    const current = this.getLocal<any[]>('stadium_access_requests', []);
    const request = current.find(r => r.id === id);
    if (request) {
      email = request.email;
      requestedRole = request.requested_role;
    }
    const updated = current.map(r => r.id === id ? { ...r, status } : r);
    this.setLocal('stadium_access_requests', updated);

    if (status === 'Approved' && email && requestedRole) {
      let mappedRole = 'visitor';
      const roleLower = requestedRole.toLowerCase();
      if (roleLower === 'fifa executive' || roleLower === 'fifa') {
        mappedRole = 'fifa';
      } else if (roleLower === 'staff' || roleLower === 'volunteer' || roleLower === 'operations') {
        mappedRole = 'staff';
      }
      await this.updateUserRoleByEmail(email, mappedRole);
    }

    return true;
  }

  // --- PERSISTENT AI CHAT HISTORY ---
  static async getConversations(userId: string, role: string): Promise<any[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .eq('role', role)
            .order('updated_at', { ascending: false });
          if (!error && data) return data;
        } catch (err) {
          console.warn('Supabase conversations query failed, using local fallback:', err);
        }
      }
    }
    const all = this.getLocal<any[]>('stadium_conversations', []);
    return all.filter(c => c.user_id === userId && c.role === role);
  }

  static async createConversation(userId: string, role: 'visitor' | 'staff' | 'fifa', title: string, metadata: any): Promise<any> {
    const newConv = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `conv-${Date.now()}`,
      user_id: userId,
      role,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: JSON.stringify(metadata)
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await supabase.from('conversations').insert(newConv).select().single();
          if (!error && data) return data;
        } catch (err) {
          console.warn('Supabase conversation create failed, using local fallback:', err);
        }
      }
    }

    const current = this.getLocal<any[]>('stadium_conversations', []);
    const updated = [newConv, ...current];
    this.setLocal('stadium_conversations', updated);
    return newConv;
  }

  static async updateConversationTitle(id: string, title: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { error } = await supabase
            .from('conversations')
            .update({ title, updated_at: new Date().toISOString() })
            .eq('id', id);
          if (!error) return true;
        } catch (err) {
          console.warn('Supabase conversation update title failed:', err);
        }
      }
    }

    const current = this.getLocal<any[]>('stadium_conversations', []);
    const updated = current.map(c => c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c);
    this.setLocal('stadium_conversations', updated);
    return true;
  }

  static async deleteConversation(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from('messages').delete().eq('conversation_id', id);
          const { error } = await supabase.from('conversations').delete().eq('id', id);
          if (!error) return true;
        } catch (err) {
          console.warn('Supabase conversation delete failed:', err);
        }
      }
    }

    const current = this.getLocal<any[]>('stadium_conversations', []);
    const updated = current.filter(c => c.id !== id);
    this.setLocal('stadium_conversations', updated);

    const msgs = this.getLocal<any[]>('stadium_messages', []);
    const updatedMsgs = msgs.filter(m => m.conversation_id !== id);
    this.setLocal('stadium_messages', updatedMsgs);

    return true;
  }

  static async getMessages(conversationId: string): Promise<any[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('timestamp', { ascending: true });
          if (!error && data) {
            return data.map((m: any) => ({
              id: m.id,
              sender: m.role as 'user' | 'assistant' | 'system',
              content: m.content,
              timestamp: m.timestamp
            }));
          }
        } catch (err) {
          console.warn('Supabase messages read failed, using local fallback:', err);
        }
      }
    }
    const all = this.getLocal<any[]>('stadium_messages', []);
    return all
      .filter(m => m.conversation_id === conversationId)
      .map(m => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        timestamp: m.timestamp
      }));
  }

  static async addMessage(conversationId: string, sender: 'user' | 'assistant' | 'system', content: string): Promise<any> {
    const newMsg = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
      conversation_id: conversationId,
      sender,
      role: sender,
      content,
      timestamp: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const dbMsg = {
            id: newMsg.id,
            conversation_id: newMsg.conversation_id,
            role: newMsg.role,
            content: newMsg.content,
            timestamp: newMsg.timestamp
          };
          const { error } = await supabase.from('messages').insert(dbMsg);
          await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
          if (!error) {
            return {
              id: newMsg.id,
              sender,
              content,
              timestamp: newMsg.timestamp
            };
          }
        } catch (err) {
          console.warn('Supabase message insert failed, using local fallback:', err);
        }
      }
    }

    const current = this.getLocal<any[]>('stadium_messages', []);
    current.push(newMsg);
    this.setLocal('stadium_messages', current);

    const convs = this.getLocal<any[]>('stadium_conversations', []);
    const updatedConvs = convs.map(c => c.id === conversationId ? { ...c, updated_at: new Date().toISOString() } : c);
    this.setLocal('stadium_conversations', updatedConvs);

    return {
      id: newMsg.id,
      sender,
      content,
      timestamp: newMsg.timestamp
    };
  }
}
