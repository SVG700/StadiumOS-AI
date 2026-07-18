export interface UserProfile {
  id: string;
  email: string;
  role: 'fan' | 'organizer' | 'security' | 'volunteer' | 'medical' | 'accessibility' | 'transport' | 'sustainability' | 'admin' | 'visitor' | 'staff' | 'fifa';
  name: string;
  createdAt: string;
  avatarUrl?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
}

export interface CrowdDensity {
  zone: string;
  density: number; // 0 to 100
  capacity: number;
  currentCount: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
}

export interface ActiveVisitors {
  total: number;
  fans: number;
  staff: number;
  vip: number;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating';
  assignedTeam: string;
}

export interface TransportStatus {
  id: string;
  mode: 'bus' | 'train' | 'metro' | 'shuttle';
  lineName: string;
  status: 'on-time' | 'delayed' | 'suspended';
  etaMinutes: number;
  occupancy: 'low' | 'medium' | 'high';
  delayReason?: string;
}

export interface AccessibilityRequest {
  id: string;
  userEmail: string;
  requestType: 'wheelchair' | 'guide' | 'sensory' | 'sign-language' | 'other';
  location: string;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp: string;
  assignedStaff?: string;
}

export interface SustainabilityMetrics {
  energyUsageKw: number;
  renewablePercentage: number;
  carbonOffsetKg: number;
  wasteRecycledKg: number;
  waterSavedLitres: number;
}

export interface VolunteerActivity {
  id: string;
  name: string;
  task: string;
  location: string;
  status: 'idle' | 'on-duty' | 'break';
  checkInTime: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
