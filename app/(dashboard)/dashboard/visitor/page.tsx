/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStadium } from '@/components/stadium/StadiumContext';
import { DatabaseService } from '@/lib/db';
import { jsPDF } from 'jspdf';
import { 
  Ticket, Bus, Bot, Leaf, QrCode, Compass, Coffee, Trophy, Info, Sun,
  MapPin, Plus, Download, ShieldAlert, Accessibility,
  ShoppingBag, BatteryCharging, Send, User, Bell, X,
  Volume2, Toilet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedNumber } from '@/components/stadium/AnimatedNumber';

// Interfaces for UI sub-systems
interface FoodItem {
  id: string;
  name: string;
  price: string;
  queueTime: number;
  pickupTime: number;
  popular: string;
  category: 'food' | 'drink' | 'snack';
}

interface MerchItem {
  id: string;
  name: string;
  price: string;
  image: string;
  category: 'jersey' | 'scarf' | 'collectible';
}

interface MatchTicket {
  id: string;
  event: string;
  block: string;
  row: string;
  seat: string;
  gate: string;
  gateStatus: string;
}

export default function VisitorDashboard() {
  const { user } = useAuth();
  const { 
    selectedStadium, 
    accessibility, addAccessibilityRequest, notifications 
  } = useStadium();
  const [mounted, setMounted] = useState(false);

  // Layout states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Navigation states
  const [accessibleRoute, setAccessibleRoute] = useState(false);
  const [crowdAware, setCrowdAware] = useState(true);
  const [voiceGuideActive, setVoiceGuideActive] = useState(false);

  // Food Ordering states
  const [foodCart, setFoodCart] = useState<{ [key: string]: number }>({});
  const [orderStatus, setOrderStatus] = useState<'idle' | 'placed' | 'ready'>('idle');
  const [orderEta, setOrderEta] = useState(0);

  // Accessibility Dispatcher states
  const [volunteerStatus, setVolunteerStatus] = useState<'idle' | 'requested' | 'assigned' | 'arrived'>('idle');
  const [volunteerEta, setVolunteerEta] = useState(4);

  // Emergency Beacon states
  const [emergencyAlerted, setEmergencyAlerted] = useState(false);

  // Merch Shop states
  const [merchReserved, setMerchReserved] = useState<string | null>(null);

  // Profile View state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // AI Assistant states
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ id: string; sender: 'user' | 'assistant'; content: string; timestamp: string }[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Match Tickets state (persisted in localstorage to survive refresh)
  const [tickets, setTickets] = useState<MatchTicket[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stadium_visitor_tickets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      { id: 't1', event: 'FIFA World Cup 2026', block: 'SEC 102', row: 'H', seat: '14', gate: 'GATE 4 (North Concourse)', gateStatus: 'Open / Fluid' }
    ];
  });
  
  const [activeTicketIdx, setActiveTicketIdx] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stadium_active_ticket_idx');
      if (saved !== null) {
        const idx = parseInt(saved, 10);
        if (!isNaN(idx)) return idx;
      }
    }
    return 0;
  });

  const handleSetActiveTicketIdx = (idx: number) => {
    setActiveTicketIdx(idx);
    localStorage.setItem('stadium_active_ticket_idx', String(idx));
  };

  const handleAddTicket = () => {
    const nextIndex = tickets.length + 1;
    const seat = String(10 + nextIndex * 2);
    const row = String.fromCharCode(65 + (nextIndex % 26));
    const blockNum = 100 + nextIndex * 4;
    const gateNum = (nextIndex % 6) + 1;
    const newTicket = {
      id: `t${nextIndex}`,
      event: 'FIFA World Cup 2026',
      block: `SEC ${blockNum}`,
      row,
      seat,
      gate: `GATE ${gateNum} (Concourse Lobby)`,
      gateStatus: 'Open / Fluid'
    };
    const updated = [...tickets, newTicket];
    setTickets(updated);
    localStorage.setItem('stadium_visitor_tickets', JSON.stringify(updated));
    handleSetActiveTicketIdx(tickets.length);
  };

  // Reservation timestamps & status tracking
  const [orderReservedTime, setOrderReservedTime] = useState<string | null>(null);
  const [merchReservedTime, setMerchReservedTime] = useState<{ [itemId: string]: string }>({});

  const handleReserveMerch = (itemId: string) => {
    setMerchReserved(itemId);
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setMerchReservedTime(prev => ({ ...prev, [itemId]: formatted }));
  };

  // Currency & Pricing helpers
  const getCurrencyDetails = useCallback(() => {
    const loc = selectedStadium.location.toLowerCase();
    if (loc.includes('canada')) return { code: 'CAD', symbol: 'CAD $' };
    if (loc.includes('mexico')) return { code: 'MXN', symbol: 'MXN $' };
    if (loc.includes('japan')) return { code: 'JPY', symbol: '¥' };
    if (loc.includes('england') || loc.includes('london') || loc.includes('uk')) return { code: 'GBP', symbol: '£' };
    if (loc.includes('australia')) return { code: 'AUD', symbol: 'AUD $' };
    return { code: 'USD', symbol: 'USD $' };
  }, [selectedStadium]);

  const formatPrice = useCallback((amount: number) => {
    const currency = getCurrencyDetails();
    if (currency.code === 'JPY') {
      return `${currency.symbol}${Math.round(amount * 100).toLocaleString()}`;
    }
    if (currency.code === 'GBP') {
      return `£${amount.toFixed(2)}`;
    }
    return `${currency.symbol}${amount.toFixed(2)}`;
  }, [getCurrencyDetails]);

  // Visitor-Specific isolated notifications list
  const visitorNotifications = useMemo(() => {
    if (!user) return [];
    const creationTime = new Date(user.createdAt).getTime();
    
    return notifications
      .filter((n) => {
        const nTime = n.timestampISO ? new Date(n.timestampISO).getTime() : 0;
        // 1. Created after user registration
        if (nTime < creationTime) return false;
        // 2. Matches user email or is broadcast
        if (n.userEmail && n.userEmail !== user.email) return false;
        // 3. Keep only visitor oriented alerts
        const isVisitorOriented = ['match', 'gate', 'promo', 'transit', 'visitor'].includes(n.type);
        if (!isVisitorOriented) return false;
        return true;
      })
      .slice(0, 25);
  }, [notifications, user]);

  // Accessibility tickets targeted to active visitor
  const myAccessibilityTickets = useMemo(() => {
    if (!user) return [];
    return accessibility.filter(req => 
      req.userEmail === user.email || (user.email === 'visitor.demo@stadiumos.ai' && req.userEmail === 'visitor.demo@stadiumos.ai')
    );
  }, [accessibility, user]);

  const handleRequestService = (type: 'wheelchair' | 'guide' | 'sensory' | 'sign-language') => {
    addAccessibilityRequest(user?.email || 'visitor.demo@stadiumos.ai', type, 'Section 102 Row H');
    if (type === 'guide') {
      handleRequestVolunteer();
    }
  };

  // Visitor Profile custom configurations
  const profileDetails = {
    favoriteTeam: 'Canada',
    visits: ['BC Place (Vancouver)', 'Lumen Field (Seattle)', 'MetLife Stadium (New York)'],
    matchHistory: [
      { date: '2026-06-12', fixture: 'CAN vs NGA', result: '2 - 1' },
      { date: '2026-07-04', fixture: 'USA vs GER', result: '3 - 2' }
    ],
    carbonSavedTotal: '24.5 kg CO₂',
    orders: [
      { id: 'ORD-8942', items: '1x Double Cheeseburger, 1x Soda', total: '$18.50', status: 'Completed' }
    ],
    emergencyContacts: 'Primary: Sarah Connor (+1 604-555-0199)'
  };

  // Match statistics (derived / simulated)
  const matchStats = {
    possession: { teamA: 54, teamB: 46 },
    shots: { teamA: 11, teamB: 7 },
    shotsOnTarget: { teamA: 5, teamB: 3 },
    yellowCards: { teamA: 1, teamB: 2 },
    varStatus: 'Clear - Offside Check Completed',
    potm: [
      { name: 'Jonathan David', votes: 48 },
      { name: 'Alphonso Davies', votes: 37 },
      { name: 'Tajon Buchanan', votes: 15 }
    ]
  };

  // Food Menu
  const FOOD_ITEMS: FoodItem[] = [
    { id: 'food-1', name: 'Vantage Gourmet Burger', price: formatPrice(12.50), queueTime: 4, pickupTime: 8, popular: 'Double Bacon Cheeseburger', category: 'food' },
    { id: 'food-2', name: 'Kickoff Pretzels & Soda', price: formatPrice(7.00), queueTime: 1, pickupTime: 3, popular: 'Jumbo Butter Pretzel', category: 'snack' },
    { id: 'food-3', name: 'Executive Halftime Grill', price: formatPrice(14.00), queueTime: 8, pickupTime: 12, popular: 'Footlong Polish Hotdog', category: 'food' },
    { id: 'food-4', name: 'Section 102 Fresh Nachos', price: formatPrice(9.50), queueTime: 3, pickupTime: 6, popular: 'Chili Cheese Nachos', category: 'snack' }
  ];

  // Merchandise Catalog
  const MERCH_ITEMS: MerchItem[] = [
    { id: 'merch-1', name: 'FIFA World Cup 2026 Match Jersey', price: formatPrice(95.00), category: 'jersey', image: '🇨🇦' },
    { id: 'merch-2', name: 'Official Vancouver Stage Scarf', price: formatPrice(25.00), category: 'scarf', image: '🧣' },
    { id: 'merch-3', name: 'Holographic Commemorative Pin', price: formatPrice(12.00), category: 'collectible', image: '🏅' }
  ];

  // Restrooms queues (simulated)
  const RESTROOMS = [
    { id: 'R-1', name: 'Section 102 Restroom Block A', status: 'Fluid', wait: '1m', gender: 'All Gender / Accessible' },
    { id: 'R-2', name: 'Section 108 Restroom Block B', status: 'Busy', wait: '7m', gender: 'Accessible Separated' }
  ];

  // Notifications feed derived from shared context

  // Hydrate states & initial messages
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const isDemo = user?.email === 'visitor.demo@stadiumos.ai';
      setAiMessages(isDemo ? [
        {
          id: 'ai-msg-init',
          sender: 'assistant',
          content: `Welcome back, Commissioner Fan Companion. I am your FIFA Smart Assistant. I see you are located near **Section 102** with an active ticket for today's Match. Ask me anything about routes, concessions, parking, or accessibility services.`,
          timestamp: new Date().toISOString()
        }
      ] : []);
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  // Auto-scroll AI chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiThinking]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500" />
      </div>
    );
  }

  const { match, weather } = selectedStadium;

  // Add to Concessions order basket helper
  const updateCart = (itemId: string, delta: number) => {
    setFoodCart(prev => {
      const nextCount = (prev[itemId] || 0) + delta;
      if (nextCount <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: nextCount };
    });
  };

  const handlePlaceOrder = () => {
    if (Object.keys(foodCart).length === 0) return;
    setOrderStatus('placed');
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setOrderReservedTime(formatted);

    const maxEta = Object.keys(foodCart).reduce((max, id) => {
      const item = FOOD_ITEMS.find(f => f.id === id);
      return item && item.pickupTime > max ? item.pickupTime : max;
    }, 0);
    setOrderEta(maxEta);
    
    // Simulate order progress
    setTimeout(() => {
      setOrderStatus('ready');
    }, 12000);
  };

  // Volunteer Dispatcher simulation
  const handleRequestVolunteer = () => {
    setVolunteerStatus('requested');
    setTimeout(() => {
      setVolunteerStatus('assigned');
      // Decrement ETA over time
      const timer = setInterval(() => {
        setVolunteerEta(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setVolunteerStatus('arrived');
            return 0;
          }
          return prev - 1;
        });
      }, 5000);
    }, 4000);
  };

  // Emergency safety beacon dispatcher
  const handleTriggerEmergency = () => {
    setEmergencyAlerted(true);
    // Mutate global context to simulate emergency dispatch (local feedback)
    DatabaseService.addMessage('demo-conv', 'system', 'EMERGENCY: Spectator triggered local safety beacon at SEC 102.');
  };

  // Chat query logic for Fan Companion
  const handleSendAiMessage = async () => {
    if (!aiInput.trim() || aiThinking) return;
    const userMsg = { id: `usr-${Date.now()}`, sender: 'user', content: aiInput.trim(), timestamp: new Date().toISOString() };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiThinking(true);

    const lowerQuery = userMsg.content.toLowerCase();
    let reply = '';
    
    // NLU-style keywords mapping
    if (lowerQuery.includes('water') || lowerQuery.includes('hydration') || lowerQuery.includes('drink')) {
      reply = `Water stations and free hydration fountains are located at the back of **Section 102** and **Section 108**. Sunscreen dispensers are also available nearby. Would you like me to map the shortest path there?`;
    } else if (lowerQuery.includes('food') || lowerQuery.includes('burger') || lowerQuery.includes('pretzel') || lowerQuery.includes('concessions')) {
      reply = `The closest food pods are **Vantage Gourmet Burger** (Section 102, 4 min line queue) and **Kickoff Pretzels & Soda** (Section 102, 1 min queue). You can pre-order snacks directly from your Quick Actions grid to bypass halftime congestion.`;
    } else if (lowerQuery.includes('charging') || lowerQuery.includes('battery') || lowerQuery.includes('power')) {
      reply = `There is an active **Eco-Charging Station** hub on Concourse Level 1, directly behind Section 102. It currently has 4 free USB-C slots.`;
    } else if (lowerQuery.includes('atm') || lowerQuery.includes('cash') || lowerQuery.includes('bank')) {
      reply = `StadiumOS operates completely cashless. However, there is a currency-to-card kiosk and an ATM behind **Section 114** near the main guest relations lobby.`;
    } else if (lowerQuery.includes('prayer') || lowerQuery.includes('faith') || lowerQuery.includes('mosque')) {
      reply = `The Stadium Multifaith Prayer Room is located on Concourse Level 2 near **Gate 6**. It provides quiet prayer mats and wash facilities.`;
    } else if (lowerQuery.includes('baby') || lowerQuery.includes('nursing') || lowerQuery.includes('care') || lowerQuery.includes('diaper')) {
      reply = `A fully equipped Baby Care and Nursing Suite is located behind **Section 110** next to the first aid station. It includes changing tables and private cubicles.`;
    } else if (lowerQuery.includes('lost') || lowerQuery.includes('missing') || lowerQuery.includes('friend') || lowerQuery.includes('bag')) {
      reply = `I have logged a Missing Item/Friend report. Please proceed to the nearest Guest Relations kiosk at **Gate 4 Lobby** or tap the **Emergency Help** quick action to alert safety stewards.`;
    } else if (lowerQuery.includes('parking') || lowerQuery.includes('car') || lowerQuery.includes('garage')) {
      reply = `Your registered parking pass is valid for **Deck B-3**. Egress congestion from Deck B is currently normal. Shuttles are departing for Metro station Gates every 4 minutes.`;
    } else if (lowerQuery.includes('exit') || lowerQuery.includes('leave') || lowerQuery.includes('egress')) {
      reply = `For exiting your seat in Section 102, the fastest path leads out of **Gate 4 turnstiles (North Concourse)**. Egress delays are predicted to peak at 12 minutes immediately following the full-time whistle.`;
    } else if (lowerQuery.includes('access') || lowerQuery.includes('wheelchair') || lowerQuery.includes('ramp')) {
      reply = `Section 102 has step-free seating paths. If you need immediate companion escort, please tap the **Accessibility** quick action button on your dashboard to dispatch Sarah or another standby volunteer steward.`;
    } else if (lowerQuery.includes('emergency') || lowerQuery.includes('heart') || lowerQuery.includes('steward')) {
      reply = `ALERT: For immediate medical emergencies, please trigger the **Emergency Help** safety beacon on your dashboard now. Medical dispatch will be sent to Section 102 within 2 minutes.`;
    } else if (lowerQuery.includes('shop') || lowerQuery.includes('jersey') || lowerQuery.includes('merchandise') || lowerQuery.includes('souvenir')) {
      reply = `The FIFA World Cup Fan Shop is located on Concourse Level 1 near **Gate 3**. You can preview souvenirs and place a 'Reserve & Collect' order under the Fan Shop section on your dashboard.`;
    } else {
      reply = `I've analyzed your telemetry context. I am ready to guide you to water fountains, concession queues, restrooms, exit paths, or guest services. Could you specify what you'd like to find?`;
    }

    setTimeout(() => {
      setAiThinking(false);
      setAiMessages(prev => [...prev, { id: `ai-${Date.now()}`, sender: 'assistant', content: reply, timestamp: new Date().toISOString() }]);
    }, 1500);
  };

  // PDF Export for Fan Companion Chat Logs
  const handleExportChat = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(12, 18, 32);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.text('FIFA World Cup 2026™', 15, 20);

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('Fan Companion Assistant Audit Ledger', 15, 27);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 33);
      doc.line(15, 36, 195, 36);

      let yPos = 45;
      aiMessages.forEach(msg => {
        if (yPos > 260) {
          doc.addPage();
          doc.setFillColor(12, 18, 32);
          doc.rect(0, 0, 210, 297, 'F');
          yPos = 20;
        }
        const label = msg.sender === 'user' ? 'FAN:' : 'COPILOT:';
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(msg.sender === 'user' ? 14 : 16, msg.sender === 'user' ? 165 : 185, msg.sender === 'user' ? 233 : 129);
        doc.text(label, 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(220, 225, 230);
        const lines = doc.splitTextToSize(msg.content, 160);
        doc.text(lines, 38, yPos);
        yPos += lines.length * 6 + 4;
      });

      doc.save('fifa-fan-companion-chat.pdf');
    } catch (e) {
      console.error('Failed to export PDF:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-skeleton {
          background: linear-gradient(90deg, #0a0f1d 25%, #1d2b4f 50%, #0a0f1d 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}} />
      
      {/* ----------------------------------------------------
          WELCOME HEADER BANNER
          ---------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-slate-900/40 border border-slate-900/50 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div>
          <h2 className="text-2xl font-black text-white">Welcome back, {user?.name || 'Visitor'}!</h2>
          <p className="text-sm text-slate-400 font-mono">FIFA World Cup 2026™ • Fan Companion App</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="cyan" className="px-3 py-1 uppercase tracking-widest text-[9px] font-bold">
            Spectator Entry
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 font-mono text-[9px] text-slate-400 border-slate-800 bg-slate-950/50">
            Seat: {tickets[activeTicketIdx]?.block || 'SEC 102'} | ROW {tickets[activeTicketIdx]?.row || 'H'} | SEAT {tickets[activeTicketIdx]?.seat || '14'}
          </Badge>
          <Button 
            size="sm" 
            onClick={() => setIsProfileOpen(true)}
            className="bg-cyan-900/30 hover:bg-cyan-800/40 border border-cyan-800/40 text-cyan-400 text-[10px] h-7.5 px-3 rounded-lg flex gap-1 items-center cursor-pointer"
          >
            <User className="h-3.5 w-3.5" />
            <span>My Profile</span>
          </Button>
          <Button 
            size="sm" 
            onClick={() => setIsAiOpen(true)}
            className="bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 text-purple-400 text-[10px] h-7.5 px-3 rounded-lg flex gap-1 items-center cursor-pointer"
          >
            <Bot className="h-3.5 w-3.5 animate-pulse" />
            <span>AI Concierge</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        {/* ----------------------------------------------------
            LEFT / MAIN TELEMETRY COLUMN
            ---------------------------------------------------- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. MATCH CENTER WIDGET */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />
            <CardHeader className="pb-2 border-b border-slate-900/30 bg-slate-950/20">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-white">
                  <Trophy className="h-4.5 w-4.5 text-amber-400" />
                  Live Match Center
                </span>
                <Badge variant="warning" className="text-[8.5px] uppercase tracking-wider font-mono">{match.stage}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              {!mounted ? (
                <div className="space-y-4 py-1">
                  <div className="h-20 w-full rounded-xl shimmer-skeleton" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-28 rounded-xl shimmer-skeleton" />
                    <div className="h-28 rounded-xl shimmer-skeleton" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Scoreboard block */}
                  <div className="flex items-center justify-between text-center bg-slate-950/60 border border-slate-900/60 rounded-xl p-4">
                    <div className="flex-1">
                      <span className="text-2xl font-black block text-white">{match.teamA.substring(0,3).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{match.teamA}</span>
                    </div>
                    <div className="px-4 border-x border-slate-900">
                      <span className="text-[8px] font-mono font-bold text-cyan-400 block mb-1">KICKOFF COUNTDOWN</span>
                      <Badge variant="secondary" className="font-mono text-xs py-0.5 px-2 bg-blue-950/80 text-blue-300 border border-blue-800/40">
                        {match.kickoff}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <span className="text-2xl font-black block text-white">{match.teamB.substring(0,3).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{match.teamB}</span>
                    </div>
                  </div>

                  {/* Match Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/20 space-y-3">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Team Statistics</span>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span>Possession</span>
                            <span className="font-bold text-cyan-400">{matchStats.possession.teamA}% - {matchStats.possession.teamB}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                            <div className="bg-cyan-500 h-full" style={{ width: `${matchStats.possession.teamA}%` }} />
                            <div className="bg-slate-700 h-full flex-1" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-900/60 pt-1.5">
                          <span>Shots (Target)</span>
                          <span className="font-bold text-white">{matchStats.shots.teamA}({matchStats.shotsOnTarget.teamA}) vs {matchStats.shots.teamB}({matchStats.shotsOnTarget.teamB})</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-900/60 pt-1.5">
                          <span>Yellow Cards</span>
                          <span className="font-bold text-white">{matchStats.yellowCards.teamA} vs {matchStats.yellowCards.teamB}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-900/60 pt-1.5">
                          <span>VAR Status</span>
                          <span className="font-bold text-emerald-400 font-mono text-[9px]">{matchStats.varStatus}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/20 space-y-3">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Player of the Match</span>
                      <div className="space-y-2 text-xs">
                        {matchStats.potm.map((player, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-semibold text-slate-300">{player.name}</span>
                              <span className="font-bold text-cyan-400">{player.votes}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full" style={{ width: `${player.votes}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 2. WEATHER & AI ADVISORY */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative backdrop-blur-md">
            <CardHeader className="pb-2 border-b border-slate-900/30 bg-slate-950/20">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                <Sun className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                <span>Atmospheric Sensors & Advisory</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {!mounted ? (
                <div className="space-y-3 py-1">
                  <div className="h-20 w-full rounded-xl shimmer-skeleton" />
                  <div className="h-16 w-full rounded-xl shimmer-skeleton" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-center p-4 rounded-xl border border-slate-900 bg-slate-950/50">
                    <div className="flex-1">
                      <span className="text-3xl font-black text-white"><AnimatedNumber value={weather.temp} />°C</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Temperature</span>
                    </div>
                    <div className="w-px h-10 bg-slate-800" />
                    <div className="flex-1">
                      <span className="text-lg font-bold text-cyan-400 font-mono">{weather.uv} / 10</span>
                      <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider block mt-1">UV Index</span>
                    </div>
                    <div className="w-px h-10 bg-slate-800" />
                    <div className="flex-1">
                      <span className="text-white font-bold block">{weather.wind} km/h</span>
                      <span className="text-[10px] text-slate-404 font-bold uppercase tracking-wider block mt-1">Wind Speed</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-900/30 bg-amber-950/10 text-xs">
                    <Info className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-amber-400 block">Spectator Comfort Notice</span>
                      <p className="text-slate-300 leading-relaxed">
                        UV level is moderate (**{weather.uv}/10**). Free sunscreen stations are available near the main gate portals. Keep hydrated using the drinking water fountains located behind **Section 102**.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 3. QUICK ACTIONS GRID (PREMIUM CARDS) */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono px-1">
              ⚡ Fan Quick Actions Desk
            </span>
            {!mounted ? (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl border border-slate-900/60 shimmer-skeleton" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                
                <button onClick={() => setActiveModal('seat')} className="group block text-left">
                  <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/20 cursor-pointer p-4 space-y-2">
                    <Compass className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Find My Seat</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">3D indoor mapping</span>
                    </div>
                  </Card>
                </button>

                <button onClick={() => setActiveModal('food')} className="group block text-left">
                  <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/20 cursor-pointer p-4 space-y-2">
                    <Coffee className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Food & Drinks</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">Pre-order snack pickup</span>
                    </div>
                  </Card>
                </button>

                <button onClick={() => setActiveModal('restrooms')} className="group block text-left">
                  <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-950/20 cursor-pointer p-4 space-y-2">
                    <Toilet className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Restrooms</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">Locate shortest line</span>
                    </div>
                  </Card>
                </button>

                <button onClick={() => setActiveModal('parking')} className="group block text-left">
                  <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-950/20 cursor-pointer p-4 space-y-2">
                    <MapPin className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Parking</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">Egress pass Deck B-3</span>
                    </div>
                  </Card>
                </button>

                <button onClick={() => setActiveModal('accessibility')} className="group block text-left">
                  <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/20 cursor-pointer p-4 space-y-2">
                    <Accessibility className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Accessibility</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">Call steward dispatch</span>
                    </div>
                  </Card>
                </button>

                <button onClick={() => setActiveModal('emergency')} className="group block text-left">
                  <Card className="h-full bg-[#080d19]/45 border-slate-950 hover:border-rose-500/45 transition-all duration-300 hover:shadow-lg hover:shadow-rose-950/30 cursor-pointer p-4 space-y-2 border-rose-900/30">
                    <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">Emergency Help</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">Direct beacon signal</span>
                    </div>
                  </Card>
                </button>

                <button onClick={() => setActiveModal('fanshop')} className="group block text-left">
                  <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-950/20 cursor-pointer p-4 space-y-2">
                    <ShoppingBag className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Fan Shop</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">Souvenirs & Reservation</span>
                    </div>
                  </Card>
                </button>

                <button onClick={() => setActiveModal('charging')} className="group block text-left">
                  <Card className="h-full bg-[#080d19]/45 border-slate-900/60 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/20 cursor-pointer p-4 space-y-2">
                    <BatteryCharging className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Charging</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">Eco USB station maps</span>
                    </div>
                  </Card>
                </button>

              </div>
            )}
          </div>

        </div>

        {/* ----------------------------------------------------
            RIGHT / SIDEBAR DATA COLUMN
            ---------------------------------------------------- */}
        <div className="space-y-6">
          
          {/* 4. DIGITAL MATCH TICKET */}
          <Card className="bg-gradient-to-br from-slate-950 via-[#0d1326] to-slate-950 border-slate-900/60 relative overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent blur-2xl rounded-full" />
            <div className="absolute -left-12 -top-12 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent blur-2xl rounded-full" />
            <CardHeader className="pb-2 border-b border-slate-900/30 bg-slate-950/20">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-white">
                  <Ticket className="h-4.5 w-4.5 text-cyan-400" />
                  FIFA Digital Entry Ticket
                </span>
                <span className="text-[8px] font-mono text-cyan-500 tracking-wider">
                  {tickets[activeTicketIdx]?.block || 'SEC 102'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center text-center space-y-4">
              
              {/* Ticket selector tabs if multiple tickets */}
              {tickets.length > 1 && (
                <div className="flex gap-1 w-full overflow-x-auto pb-1 mb-1 justify-center scrollbar-none">
                  {tickets.map((t, idx) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTicketIdx(idx)}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold border transition cursor-pointer ${
                        activeTicketIdx === idx 
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400 font-extrabold' 
                          : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Seat {t.seat}
                    </button>
                  ))}
                </div>
              )}

              {/* QR Code holographic styling */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-cyan-950/20 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/5 to-blue-500/10 opacity-60 pointer-events-none" />
                <QrCode className="h-32 w-32 text-slate-950" />
              </div>

              {/* Match details block */}
              <div className="w-full text-xs space-y-2 text-left bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[8px] uppercase">EVENT</span>
                  <span className="text-slate-300 font-bold">{tickets[activeTicketIdx]?.event}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5">
                  <span className="text-slate-500 font-mono text-[8px] uppercase">SEAT BLOCK</span>
                  <span className="text-white font-extrabold text-[10px]">
                    {tickets[activeTicketIdx]?.block} / ROW {tickets[activeTicketIdx]?.row} / SEAT {tickets[activeTicketIdx]?.seat}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5">
                  <span className="text-slate-500 font-mono text-[8px] uppercase">GATE ENTRY</span>
                  <span className="text-cyan-400 font-bold">{tickets[activeTicketIdx]?.gate}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5">
                  <span className="text-slate-500 font-mono text-[8px] uppercase">GATE STATUS</span>
                  <span className="text-emerald-400 font-black uppercase font-mono text-[9px] tracking-wider">● {tickets[activeTicketIdx]?.gateStatus}</span>
                </div>
              </div>

              {/* Add Another Match Ticket Button */}
              <div className="w-full pt-1">
                <Button 
                  onClick={handleAddTicket}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs h-9 rounded-lg border border-slate-800 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Another Match Ticket</span>
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* 5. SUSTAINABILITY SUMMARY */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden backdrop-blur-md">
            <CardHeader className="pb-2 border-b border-slate-900/30 bg-slate-950/20">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-white">
                  <Leaf className="h-4.5 w-4.5 text-emerald-400" />
                  Green Footprint Index
                </span>
                <Badge variant="success" className="text-[8px] uppercase font-mono font-bold bg-emerald-950/40 text-emerald-400">Eco Fan</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl border border-slate-900 bg-slate-950/40">
                <span className="text-slate-400 block font-mono text-[9px] uppercase">My Transit Carbon Savings</span>
                <span className="text-white font-black text-sm">1.8 kg CO₂</span>
              </div>
              <div className="space-y-2">
                <span className="block text-slate-500 font-mono text-[8.5px] uppercase tracking-wider">Equivalent Environmental Impact:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-emerald-950/10 border border-emerald-900/20 text-center space-y-0.5">
                    <span className="text-[8px] text-slate-500 block font-mono uppercase">Car Miles Avoided</span>
                    <span className="text-emerald-400 font-black text-xs">7.4 km</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/10 border border-emerald-900/20 text-center space-y-0.5">
                    <span className="text-[8px] text-slate-500 block font-mono uppercase">Tree Seedlings Grown</span>
                    <span className="text-emerald-400 font-black text-xs">0.09 Seedling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. TRANSPORTATION SUMMARY */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden backdrop-blur-md">
            <CardHeader className="pb-2 border-b border-slate-900/30 bg-slate-950/20">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-white">
                  <Bus className="h-4.5 w-4.5 text-blue-400" />
                  Transit Hub Telemetry
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5 text-center">
                <div className="p-2 border border-slate-900 bg-slate-950/40 rounded-lg space-y-0.5">
                  <span className="text-[8px] text-slate-500 font-mono block">LIVE METRO B OCCUPANCY</span>
                  <span className="text-[10px] font-bold text-white">75% (Moderate)</span>
                </div>
                <div className="p-2 border border-slate-900 bg-slate-950/40 rounded-lg space-y-0.5">
                  <span className="text-[8px] text-slate-500 font-mono block">TAXI WAIT INDEX</span>
                  <span className="text-[10px] font-bold text-white">~15 min wait</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/20 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-semibold">Exit Egress Delay Prediction:</span>
                  <span className="font-bold text-amber-400">12 min Peak</span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-t border-slate-900/40 pt-1.5">
                  <span className="text-slate-400 font-semibold">Fastest Route Home (Metro Link):</span>
                  <span className="font-bold text-cyan-400 font-mono">18m transit time</span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-t border-slate-900/40 pt-1.5">
                  <span className="text-slate-400 font-semibold">Ride-Share Pickup Zone:</span>
                  <span className="font-bold text-white">North Deck Portal 3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. MATCHDAY NOTIFICATIONS CENTER */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden backdrop-blur-md max-h-80 overflow-y-auto">
            <CardHeader className="pb-2 border-b border-slate-900/30 bg-slate-950/20 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                <span className="flex items-center gap-1.5 text-white">
                  <Bell className="h-4.5 w-4.5 text-cyan-400" />
                  Matchday Notifications
                </span>
              </CardTitle>
              {visitorNotifications.some(n => !n.read) && (
                <button
                  type="button"
                  onClick={() => {
                    visitorNotifications.forEach(n => {
                      if (!n.read) markNotificationRead(n.id);
                    });
                  }}
                  className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 transition uppercase cursor-pointer bg-transparent border-none outline-none"
                >
                  Mark All Read
                </button>
              )}
            </CardHeader>
            <CardContent className="pt-2 divide-y divide-slate-900/60">
              {visitorNotifications.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic py-4 text-center">No notifications received for this matchday yet.</p>
              ) : (
                visitorNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      if (!notif.read) {
                        markNotificationRead(notif.id);
                      }
                    }}
                    className={`py-2 px-2.5 my-1 rounded-xl transition duration-200 cursor-pointer ${
                      !notif.read 
                        ? 'bg-cyan-950/20 border-l-2 border-cyan-500 pl-2' 
                        : 'hover:bg-slate-900/30 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 text-xs">
                      <span className={`tracking-tight leading-tight ${!notif.read ? 'text-white font-extrabold' : 'text-slate-350'}`}>
                        {notif.message}
                      </span>
                      <span className="text-[8px] text-slate-500 font-mono shrink-0 pt-0.5">{notif.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* ----------------------------------------------------
          VISITOR INTERACTIVE MODALS GRID
          ---------------------------------------------------- */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-[#04060d]/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#090f1d] border border-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-slate-900/80 bg-slate-950/40">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {activeModal === 'seat' && 'Smart Indoor Navigation'}
                    {activeModal === 'food' && 'Express Concessions Pre-Ordering'}
                    {activeModal === 'restrooms' && 'Restrooms Location & Queue Monitor'}
                    {activeModal === 'parking' && 'Registered Parking Companion'}
                    {activeModal === 'accessibility' && 'Accessibility Helper & Volunteer Dispatcher'}
                    {activeModal === 'emergency' && 'Direct Safety Beacon Kiosk'}
                    {activeModal === 'fanshop' && 'World Cup Fan Shop & Reserved Pickup'}
                    {activeModal === 'charging' && 'Eco Charging Stations Map'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">FIFA World Cup Vancouver Venue Ledger</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setActiveModal(null)} className="h-8 w-8 text-slate-400 hover:text-white rounded-xl">
                  <X className="h-4.5 w-4.5" />
                </Button>
              </div>

              {/* Content body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                
                {/* 1. SEAT NAVIGATION MODAL */}
                {activeModal === 'seat' && (
                  <div className="space-y-4">
                    {/* SVG Map Visualizer */}
                    <div className="w-full h-48 bg-slate-950/80 border border-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center text-slate-600 font-mono text-[10px] select-none">
                      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:14px_24px]" />
                      
                      {/* Interactive map SVG mockup */}
                      <svg className="w-full h-full p-4" viewBox="0 0 400 200">
                        {/* Stadium Oval Outline */}
                        <path d="M 100,20 A 100,80 0 0,0 100,180 L 300,180 A 100,80 0 0,0 300,20 Z" fill="none" stroke="#1e293b" strokeWidth="3" />
                        <ellipse cx="200" cy="100" rx="90" ry="45" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
                        
                        {/* Current Location Point (Gate 4) */}
                        <circle cx="200" cy="170" r="6" fill="#14b8a6" className="animate-pulse" />
                        <text x="180" y="190" fill="#14b8a6" fontSize="8" fontWeight="bold">Gate 4 (Start)</text>

                        {/* Route Line */}
                        <path 
                          d={accessibleRoute ? "M 200,170 C 120,165 95,115 130,75" : "M 200,170 C 160,160 140,110 130,75"} 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="2" 
                          strokeDasharray="6,4"
                          className="animate-dash"
                        />

                        {/* Target Seat Point (Sec 102) */}
                        <circle cx="130" cy="75" r="6" fill="#ef4444" />
                        <text x="100" y="65" fill="#ef4444" fontSize="8" fontWeight="bold">SEC 102 (Seat 14)</text>

                        {/* Concessions / Restroom icons on map */}
                        <circle cx="270" cy="80" r="4" fill="#3b82f6" />
                        <text x="250" y="70" fill="#3b82f6" fontSize="6">Concessions Hub</text>
                      </svg>
                    </div>

                    <div className="flex gap-4 items-center justify-between p-3.5 rounded-xl border border-slate-900 bg-slate-950/60 font-mono">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">ESTIMATED WALKING TIME</span>
                        <span className="text-white font-black text-sm">{accessibleRoute ? '5 min' : '3 min'} (180 meters)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">CROWD CONGESTION</span>
                        <span className="text-emerald-400 font-bold">Low Bottlenecks</span>
                      </div>
                    </div>

                    {/* Routing Controls */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Navigation Preferences</span>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center justify-between p-3 rounded-lg border border-slate-900 bg-slate-950/20 hover:bg-slate-950/40 cursor-pointer">
                          <div>
                            <span className="font-bold text-white block">Accessible Route (Elevator Assisted)</span>
                            <span className="text-[9px] text-slate-500">Reroute paths using elevators instead of concourse ramps/stairs</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={accessibleRoute} 
                            onChange={(e) => setAccessibleRoute(e.target.checked)} 
                            className="h-4.5 w-4.5 accent-cyan-500 rounded border-slate-800 bg-slate-950"
                          />
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-lg border border-slate-900 bg-slate-950/20 hover:bg-slate-950/40 cursor-pointer">
                          <div>
                            <span className="font-bold text-white block">Crowd-Aware Dynamic Routing</span>
                            <span className="text-[9px] text-slate-500">Automatically bypass crowded concourse gates and concession hubs</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={crowdAware} 
                            onChange={(e) => setCrowdAware(e.target.checked)} 
                            className="h-4.5 w-4.5 accent-cyan-500 rounded border-slate-800 bg-slate-950"
                          />
                        </label>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setVoiceGuideActive(!voiceGuideActive)}
                      className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex gap-1.5 items-center justify-center ${
                        voiceGuideActive 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      }`}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>{voiceGuideActive ? 'Stop Audio Guide Directional Feed' : 'Start Audio Voice Navigation Guide'}</span>
                    </Button>
                  </div>
                )}

                {/* 2. FOOD & CONCESSIONS MODAL */}
                {activeModal === 'food' && (
                  <div className="space-y-4">
                    {orderStatus === 'placed' && (
                      <div className="p-4 rounded-xl border border-amber-950 bg-amber-950/10 text-center space-y-2">
                        <span className="text-amber-400 font-bold block">Pre-order Reserved</span>
                        <p className="text-[10px] text-slate-300">
                          Please complete payment at the Express Pickup Counter before collecting your food. Pickup: **Section 102 Express Pickup 2**. Est. wait: **{orderEta} minutes**.
                        </p>
                      </div>
                    )}
                    {orderStatus === 'ready' && (
                      <div className="p-4 rounded-xl border border-emerald-950 bg-emerald-950/15 text-center space-y-2 animate-bounce">
                        <span className="text-emerald-400 font-bold block">🚨 Order Ready for Collection!</span>
                        <p className="text-[10px] text-slate-200">
                          Show QR code **ORD-8942** at Concourse Section 102 Pickup 2 desk.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Concessions Menu</span>
                      <div className="space-y-2.5">
                        {FOOD_ITEMS.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 border border-slate-900 bg-slate-950/40 rounded-xl">
                            <div>
                              <span className="font-bold text-white block">{item.name}</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">Popular: {item.popular}</span>
                              <div className="flex gap-2.5 mt-1 text-[8.5px] text-slate-500 font-mono">
                                <span>Queue: {item.queueTime}m</span>
                                <span>Prep: {item.pickupTime}m</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300 font-bold font-mono mr-2">{item.price}</span>
                              <button onClick={() => updateCart(item.id, -1)} className="h-6 w-6 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 flex items-center justify-center text-slate-300 cursor-pointer">-</button>
                              <span className="w-5 text-center text-white font-bold font-mono text-[11px]">{foodCart[item.id] || 0}</span>
                              <button onClick={() => updateCart(item.id, 1)} className="h-6 w-6 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 flex items-center justify-center text-slate-300 cursor-pointer">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {Object.keys(foodCart).length > 0 && orderStatus === 'idle' && (
                      <div className="border-t border-slate-900/60 pt-4 flex flex-col gap-2">
                        <Button 
                          onClick={handlePlaceOrder}
                          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl cursor-pointer text-xs"
                        >
                          Confirm & Pre-Order Snacks
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. RESTROOMS MODAL */}
                {activeModal === 'restrooms' && (
                  <div className="space-y-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Nearest Restrooms</span>
                    <div className="space-y-2.5">
                      {RESTROOMS.map((rm) => (
                        <div key={rm.id} className="p-3 border border-slate-900 bg-slate-950/40 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">{rm.name}</span>
                            <span className="text-[9.5px] text-slate-500 mt-0.5 block">{rm.gender}</span>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={rm.status === 'Fluid' ? 'success' : 'warning'}
                              className="text-[8px] font-mono tracking-wider uppercase bg-slate-950/80 mb-1"
                            >
                              {rm.status}
                            </Badge>
                            <span className="block text-[10px] font-mono text-slate-400">Wait: **{rm.wait}**</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. PARKING MODAL */}
                {activeModal === 'parking' && (
                  <div className="space-y-4 text-center">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-left space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-mono text-[8px] uppercase">PARKING DECK CLEARANCE</span>
                        <Badge variant="cyan" className="text-[8px] uppercase font-mono bg-cyan-950/50 text-cyan-400">Pass Active</Badge>
                      </div>
                      <span className="text-md font-black text-white block font-mono">DECK B-3 / SLOT 244</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        To navigate here: follow egress transit signals to **Gate 4 Corridor North**. Walkway is accessibility ramp assisted.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-slate-200 inline-block">
                      <QrCode className="h-32 w-32 text-slate-950" />
                    </div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase mt-1">Scan pass QR at gate scanners</span>
                  </div>
                )}

                {/* 5. ACCESSIBILITY HELPER MODAL */}
                {activeModal === 'accessibility' && (
                  <div className="space-y-4">
                    {volunteerStatus !== 'idle' && (
                      <div className="p-4 rounded-xl border border-cyan-950 bg-cyan-950/20 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-cyan-400">
                            {volunteerStatus === 'requested' && 'Searching Standby Volunteers...'}
                            {volunteerStatus === 'assigned' && 'Volunteer Dispatched!'}
                            {volunteerStatus === 'arrived' && 'Volunteer Arrived at Seat'}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">Sarah</span>
                        </div>
                        {volunteerStatus === 'assigned' && (
                          <p className="text-[10px] text-slate-300">
                            Steward **Sarah** is coming to Section 102. ETA: **{volunteerEta} minutes**.
                          </p>
                        )}
                        {volunteerStatus === 'arrived' && (
                          <p className="text-[10px] text-slate-300">
                            Sarah has arrived at your section lobby. Tap to close helper.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Accessibility Assistance Services</span>
                      <div className="grid gap-2 grid-cols-2">
                        <Button 
                          onClick={() => handleRequestService('guide')}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs h-10 rounded-xl cursor-pointer"
                        >
                          Volunteer Escort
                        </Button>
                        <Button 
                          onClick={() => handleRequestService('wheelchair')}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs h-10 rounded-xl cursor-pointer"
                        >
                          Wheelchair Assistance
                        </Button>
                        <Button 
                          onClick={() => handleRequestService('sign-language')}
                          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-cyan-400 font-bold text-xs h-10 rounded-xl cursor-pointer"
                        >
                          Sign Language Guide
                        </Button>
                        <Button 
                          onClick={() => handleRequestService('sensory')}
                          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-cyan-400 font-bold text-xs h-10 rounded-xl cursor-pointer"
                        >
                          Sensory Kits
                        </Button>
                      </div>
                    </div>

                    {/* Active Assistance Tickets */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-900/40">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Active Assistance Tickets</span>
                      {myAccessibilityTickets.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic py-2 text-center">No active requests. Select a service above to submit a ticket.</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {myAccessibilityTickets.map((req) => (
                            <div key={req.id} className="p-3 border border-slate-900 bg-slate-950/40 rounded-xl flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-white block capitalize">{req.requestType.replace('-', ' ')} Support</span>
                                <span className="text-[9.5px] text-slate-500 block mt-0.5">Loc: {req.location} • {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={req.status === 'pending' ? 'warning' : req.status === 'in-progress' ? 'cyan' : 'success'}
                                  className="text-[8px] font-mono tracking-wider uppercase bg-slate-950/80 mb-1"
                                >
                                  {req.status}
                                </Badge>
                                {req.assignedStaff && (
                                  <span className="block text-[8px] text-slate-400 mt-0.5">{req.assignedStaff}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. EMERGENCY BEACON MODAL */}
                {activeModal === 'emergency' && (
                  <div className="space-y-4 text-center">
                    {emergencyAlerted ? (
                      <div className="p-5 rounded-2xl border border-rose-950 bg-rose-950/15 space-y-2 animate-pulse">
                        <span className="text-rose-400 font-extrabold text-sm block">🚨 EMERGENCY BEACON ACTIVE!</span>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          Medical Response Team has been notified. Estimated dispatch arrival time to **Section 102 Row H** is **under 120 seconds**. Please remain at your location.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-rose-900/30 bg-rose-950/10 text-xs text-left">
                          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-rose-400 block">Spectator Alert Confirmation</span>
                            <p className="text-slate-300 text-[10px] leading-relaxed">
                              Tapping the button below will immediately transmit your GPS seat coordinates to venue operations and dispatch paramedics.
                            </p>
                          </div>
                        </div>

                        <Button 
                          onClick={handleTriggerEmergency}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-xl cursor-pointer text-xs tracking-wider"
                        >
                          DEPLOY EMERGENCY MEDICS
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. FAN SHOP MODAL */}
                {activeModal === 'fanshop' && (
                  <div className="space-y-4">
                    {merchReserved && (() => {
                      const reservedItem = MERCH_ITEMS.find(m => m.id === merchReserved);
                      const reservedPriceFormatted = reservedItem ? formatPrice(parseFloat(reservedItem.price.replace(/[^0-9.]/g, ''))) : '';
                      return (
                        <div className="p-3.5 rounded-xl border border-emerald-950 bg-emerald-950/15 text-center space-y-1.5">
                          <span className="text-emerald-400 font-bold block">Reserved Successfully</span>
                          <p className="text-[10px] text-slate-300 leading-relaxed">
                            Please pay <strong className="text-white">{reservedPriceFormatted}</strong> at the Gate 3 FIFA Merchandise Counter before collecting your order (Order ID: **MCH-9812**).
                          </p>
                        </div>
                      );
                    })()}

                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Merchandise Collection</span>
                    <div className="space-y-2.5">
                      {MERCH_ITEMS.map((item) => (
                        <div key={item.id} className="p-3 border border-slate-900 bg-slate-950/40 rounded-xl flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl shrink-0">{item.image}</span>
                            <div>
                              <span className="font-bold text-white block">{item.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono capitalize">{item.category}</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className="text-slate-300 font-bold font-mono mr-2">{item.price}</span>
                            <Button 
                              size="sm"
                              onClick={() => setMerchReserved(item.id)}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white text-[9px] h-7.5 px-2.5 rounded-lg cursor-pointer"
                            >
                              Reserve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. CHARGING STATIONS MODAL */}
                {activeModal === 'charging' && (
                  <div className="space-y-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Nearby Charging Hubs</span>
                    <div className="space-y-2.5">
                      <div className="p-3 border border-slate-900 bg-slate-950/40 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">Section 102 Eco-Hub</span>
                          <span className="text-[9.5px] text-slate-500 block mt-0.5">Concourse Level 1, behind main portal</span>
                        </div>
                        <div className="text-right">
                          <Badge variant="cyan" className="text-[8px] font-mono bg-cyan-950/50 text-cyan-400">4 Slots Free</Badge>
                        </div>
                      </div>
                      <div className="p-3 border border-slate-900 bg-slate-950/40 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">Section 108 Operations Desk</span>
                          <span className="text-[9.5px] text-slate-500 block mt-0.5">Next to accessibility volunteer kiosk</span>
                        </div>
                        <div className="text-right">
                          <Badge variant="cyan" className="text-[8px] font-mono bg-cyan-950/50 text-cyan-400">12 Slots Free</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
          VISITOR PROFILE MODAL
          ---------------------------------------------------- */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-[#04060d]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#090f1d] border border-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-900/80 bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">My FIFA Spectator Profile</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsProfileOpen(false)} className="h-8 w-8 text-slate-400 hover:text-white rounded-xl">
                  <X className="h-4.5 w-4.5" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* General Bio */}
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-full bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 text-lg font-black shrink-0">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-sm block">{user.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{user.email}</span>
                  </div>
                </div>

                {/* Profile Grid */}
                <div className="grid gap-3.5 sm:grid-cols-2">
                  
                  <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 space-y-1">
                    <span className="text-[8px] text-slate-500 font-bold block font-mono uppercase">FAVORITE NATIONAL TEAM</span>
                    <span className="text-white font-extrabold text-xs flex items-center gap-1.5">
                      <span>🇨🇦</span>
                      {profileDetails.favoriteTeam}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 space-y-1">
                    <span className="text-[8px] text-slate-500 font-bold block font-mono uppercase">TOTAL CARBON OFFSET</span>
                    <span className="text-emerald-400 font-black text-xs">{profileDetails.carbonSavedTotal}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 space-y-1">
                    <span className="text-[8px] text-slate-500 font-bold block font-mono uppercase">EMERGENCY PREFERENCES</span>
                    <span className="text-slate-300 text-[10px] leading-tight block">{profileDetails.emergencyContacts}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 space-y-1">
                    <span className="text-[8px] text-slate-500 font-bold block font-mono uppercase">STADIUMS VISITED</span>
                    <div className="space-y-0.5 text-slate-300 text-[10px] pt-0.5">
                      {profileDetails.visits.map((vis, idx) => (
                        <div key={idx}>• {vis}</div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Match History */}
                <div className="space-y-2 border-t border-slate-900/60 pt-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Fixture Match History</span>
                  <div className="space-y-1.5">
                    {profileDetails.matchHistory.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 border border-slate-900 bg-slate-950/20 rounded-lg">
                        <span className="font-mono text-slate-500 text-[9px]">{m.date}</span>
                        <span className="font-bold text-slate-300">{m.fixture}</span>
                        <Badge variant="cyan" className="text-[9px] font-mono py-0.2">{m.result}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders */}
                <div className="space-y-2 border-t border-slate-900/60 pt-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Recent Concession Orders</span>
                  {profileDetails.orders.map((ord, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/20 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">{ord.id}</span>
                        <span className="text-[9.5px] text-slate-500">{ord.items}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-slate-300 font-bold font-mono">{ord.total}</span>
                        <span className="text-[9px] text-emerald-400 font-mono">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
          VISITOR AI CONCIERGE ASSISTANT DRAWER
          ---------------------------------------------------- */}
      <AnimatePresence>
        {isAiOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              className="absolute inset-0 bg-[#04060d]/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-md bg-[#080d1a] border-l border-slate-900 h-full shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-slate-900 bg-slate-950/50 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0 shadow shadow-purple-950/30">
                    <Bot className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">FIFA AI Companion</h3>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">Real-time Fan Advisory Desk</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {aiMessages.length > 1 && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleExportChat}
                      className="h-7 px-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer text-[10px]"
                    >
                      <Download className="h-3 w-3" />
                      <span>PDF</span>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsAiOpen(false)} className="h-8 w-8 text-slate-400 hover:text-white rounded-xl">
                    <X className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>

              {/* Chat View */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 flex flex-col">
                <div className="flex-1 space-y-3.5 min-h-0">
                  {aiMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center border ${
                        msg.sender === 'user' 
                          ? 'bg-cyan-950 border-cyan-800/45 text-cyan-400' 
                          : 'bg-slate-900 border-slate-805 text-purple-400'
                      }`}>
                        {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>

                      <div className={`rounded-xl px-3.5 py-2.5 border shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#0f1b2e] border-cyan-900/30 text-slate-100'
                          : 'bg-[#0b0f19] border-slate-900 text-slate-300'
                      }`}>
                        <p className="leading-relaxed text-[11px] whitespace-pre-wrap">{msg.content}</p>
                        <span className="block text-[8px] text-slate-500 text-right mt-1.5 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {aiThinking && (
                    <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                      <div className="h-7 w-7 rounded-full bg-slate-900 border border-slate-800 text-purple-400 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 animate-bounce" />
                      </div>
                      <div className="p-2 rounded-xl border border-slate-900 bg-slate-950/40 text-slate-400 text-[10px] flex items-center gap-1.5">
                        <span className="flex gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        <span className="font-mono text-[8px] text-slate-500">Formulating advice...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Input section */}
              <div className="p-4 border-t border-slate-900 bg-slate-950/30 shrink-0 space-y-2">
                
                {/* Dynamic Quick Prompt bubbles */}
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {['Water station?', 'Pre-order hotdog', 'Request steward', 'Nearest ATM'].map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => { setAiInput(q); }}
                      className="text-[9px] px-2 py-0.5 rounded-full border border-slate-900 bg-slate-950/80 text-slate-400 hover:text-white hover:border-cyan-800/40 whitespace-nowrap cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendAiMessage(); }}
                    placeholder="Ask about water, food, restrooms, exits..."
                    className="bg-slate-950/80 border-slate-900 focus-visible:ring-cyan-500/50 text-[11px] placeholder:text-slate-600 text-white rounded-lg h-9 flex-1"
                  />
                  <Button 
                    onClick={handleSendAiMessage}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white w-9 h-9 p-0 flex items-center justify-center rounded-lg cursor-pointer shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
