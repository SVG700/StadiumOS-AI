'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { StadiumProvider, useStadium } from '@/components/stadium/StadiumContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, Users, Bus, Accessibility, Leaf, ShieldAlert, Bot, Settings, LogOut,
  Menu, X, User, Shield, Ticket, Trophy, Bell, Search, Check, Trash2,
  ShieldCheck, Activity, Terminal, Undo2, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const VISITOR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard/visitor', icon: Home },
  { name: 'Smart Navigation', href: '/navigation', icon: Map },
  { name: 'Transportation', href: '/transport', icon: Bus },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
  { name: 'Accessibility', href: '/accessibility', icon: Accessibility },
  { name: 'Green Stadium', href: '/sustainability', icon: Leaf },
];

const STAFF_ITEMS: SidebarItem[] = [
  { name: 'Operations Desk', href: '/dashboard/staff', icon: Home },
  { name: 'Crowd Intelligence', href: '/crowd', icon: Users },
  { name: 'Emergency Dispatch', href: '/emergency', icon: ShieldAlert },
  { name: 'Transit Operations', href: '/transport', icon: Bus },
  { name: 'Accessibility Desk', href: '/accessibility', icon: Accessibility },
  { name: 'AI Operations Assistant', href: '/assistant', icon: Bot },
  { name: 'Indoor Navigation', href: '/navigation', icon: Map },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const FIFA_ITEMS: SidebarItem[] = [
  { name: 'Executive Dashboard', href: '/dashboard/fifa', icon: Home },
  { name: 'Sustainability Reports', href: '/sustainability', icon: Leaf },
];

const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  visitor: [
    '/dashboard/visitor',
    '/navigation',
    '/transport',
    '/assistant',
    '/accessibility',
    '/sustainability',
    '/access-denied',
  ],
  staff: [
    '/dashboard/staff',
    '/crowd',
    '/emergency',
    '/transport',
    '/accessibility',
    '/assistant',
    '/navigation',
    '/settings',
    '/access-denied',
  ],
  fifa: [
    '/dashboard/fifa',
    '/sustainability',
    '/access-denied',
  ],
};

const SEARCH_DATABASE = [
  { term: 'Seat SEC 102', description: 'Spectator Seating Row H', path: '/navigation?target=seat' },
  { term: 'Gate 4 Entrance', description: 'North Side Entry Point', path: '/navigation?target=seat' },
  { term: 'Gate 2 Entrance', description: 'West Side Entrance', path: '/navigation' },
  { term: 'Restrooms West', description: 'Concourse Level 1 Facilities', path: '/navigation?target=restroom' },
  { term: 'Concessions / Tacos', description: 'Food Court Concourse A', path: '/navigation?target=food' },
  { term: 'Medical Pod 2', description: 'First Aid Emergency Room', path: '/navigation?target=medical' },
  { term: 'Express Metro Line', description: 'Regional Rail Transit Hub', path: '/transport' },
  { term: 'VIP Executive Lounge', description: 'Suite Tier Level 2', path: '/navigation' },
  { term: 'Green Recycling Bins', description: 'Composting & Can Redirection', path: '/sustainability' },
  { term: 'AI Operations Assistant', description: 'Gemini Copilot Interface', path: '/assistant' },
];

const COMMAND_PALETTE_ITEMS = [
  { label: 'Deploy Medical Unit', actionType: 'DEPLOY_MEDICAL', desc: 'Dispatches trauma response to Section 108', category: 'Emergency' },
  { label: 'Open Gate 4 Turnstiles', actionType: 'OPEN_GATE_4', desc: 'Bypasses Gate 3 congestion bottlenecks', category: 'Crowd Flow' },
  { label: 'Optimize Traffic Frequency', actionType: 'INCREASE_SHUTTLE', desc: 'Reduces shuttle ETA to 4 minutes', category: 'Transport' },
  { label: 'Dispatch Accessibility Escorts', actionType: 'ACTIVATE_ACCESSIBILITY', desc: 'Mobilizes volunteers to Gate 4 turnstiles', category: 'Accessibility' },
  { label: 'Redirect Crowd Flow North', actionType: 'REDIRECT_CROWD', desc: 'Reroutes spectators via Concourse North', category: 'Crowd Flow' },
  { label: 'Dim Advertising displays', actionType: 'REDUCE_ENERGY', desc: 'Reduces peak Kw draw to stabilize grid', category: 'Grid Eco' },
  { label: 'Generate Sustainability Audit', actionType: 'GENERATE_REPORT', desc: 'Compiles matchday carbon ledger', category: 'Audit' },
];

const getAllowedRoutes = (role: string): string[] => {
  if (role === 'visitor' || role === 'fan') return ROLE_ALLOWED_ROUTES.visitor;
  if (role === 'fifa' || role === 'admin') return ROLE_ALLOWED_ROUTES.fifa;
  return ROLE_ALLOWED_ROUTES.staff;
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, signOut, isLoading, isDemoMode } = useAuth();
  const isDemoAccount = !!(user?.email && [
    'visitor.demo@stadiumos.ai',
    'staff.demo@stadiumos.ai',
    'fifa.demo@stadiumos.ai'
  ].includes(user.email));
  const pathname = usePathname();
  const router = useRouter();

  // Consume Shared Context
  const { 
    notifications, clearNotifications, markNotificationRead, 
    executeAction, activeReport, setActiveReport, history, rollbackOperation, stadiumHealth, healthScore
  } = useStadium();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return SEARCH_DATABASE.filter(
      (item) => item.term.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Notification states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'operational' | 'transport' | 'medical' | 'security' | 'visitor'>('all');

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDiagOpen, setIsDiagOpen] = useState(false);

  // Command Palette states
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [thinkingStep, setThinkingStep] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Global Route Guard
  useEffect(() => {
    if (!isLoading && user) {
      const allowed = getAllowedRoutes(user.role);
      const isAllowed = allowed.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      );

      if (!isAllowed && pathname !== '/dashboard') {
        router.push('/access-denied');
      }
    }
  }, [user, pathname, isLoading, router]);

  // Command Palette keybind listener (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spectators/visitors should not access operational commands
      if (user && (user.role === 'visitor' || user.role === 'fan')) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search query filter is handled reactively via useMemo

  const handleSearchResultClick = (path: string) => {
    router.push(path);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // Command Palette executions
  const handleExecuteCommand = async (actionType: string) => {
    setIsCommandOpen(false);
    setCommandQuery('');
    
    // Simulate AI thinking experience
    const steps = [
      'Auditing gate turnstiles telemetry...',
      'Assessing crowd sector densities...',
      'Querying metropolitan transit ETA delays...',
      'Calculating safe pedestrian bypass routes...',
      'Compiling operational payload...'
    ];

    for (const step of steps) {
      setThinkingStep(step);
      await new Promise((r) => setTimeout(r, 600));
    }

    setThinkingStep(null);
    await executeAction(actionType, `Command Palette: ${actionType.replace('_', ' ')}`);
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return [];
    if (user.role === 'visitor' || user.role === 'fan') return VISITOR_ITEMS;
    if (user.role === 'fifa' || user.role === 'admin') return FIFA_ITEMS;
    return STAFF_ITEMS;
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'visitor': return 'Spectator / Fan';
      case 'fan': return 'Spectator / Fan';
      case 'staff': return 'Stadium Operations';
      case 'fifa': return 'FIFA Board Executive';
      case 'organizer': return 'Stadium Organizer';
      case 'security': return 'Security Detail';
      case 'medical': return 'Medical Staff';
      case 'volunteer': return 'Volunteer Force';
      case 'accessibility': return 'Accessibility Agent';
      case 'transport': return 'Transport Lead';
      case 'sustainability': return 'Sustainability Auditor';
      case 'admin': return 'FIFA Director';
      default: return 'Field Operator';
    }
  };

  const getBrandDetails = () => {
    if (!user) return { icon: <Shield className="h-4.5 w-4.5 text-white" />, label: 'StadiumOS' };
    if (user.role === 'visitor' || user.role === 'fan') {
      return { icon: <Ticket className="h-4.5 w-4.5 text-cyan-400" />, label: 'Fan Companion' };
    }
    if (user.role === 'fifa' || user.role === 'admin') {
      return { icon: <Trophy className="h-4.5 w-4.5 text-amber-400" />, label: 'FIFA Board' };
    }
    return { icon: <Shield className="h-4.5 w-4.5 text-emerald-400" />, label: 'Operations Desk' };
  };

  if (!user) return null;

  const sidebarItems = getSidebarItems();
  const brand = getBrandDetails();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifs = notifications.filter(
    (n) => notifFilter === 'all' || n.type === notifFilter
  );

  const filteredCommands = COMMAND_PALETTE_ITEMS.filter(
    (item) => 
      item.label.toLowerCase().includes(commandQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(commandQuery.toLowerCase())
  );

  // Stadium Health colors
  const healthColor = 
    stadiumHealth === 'Excellent' ? 'text-emerald-400' :
    stadiumHealth === 'Good' ? 'text-cyan-400' :
    stadiumHealth === 'Warning' ? 'text-amber-400' : 'text-rose-500';

  return (
    <div className="flex h-screen overflow-hidden bg-[#05070c] text-slate-100 font-sans">
      
      {/* ----------------------------------------------------
          DESKTOP SIDEBAR
          ---------------------------------------------------- */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-900 bg-[#080d19]/90 backdrop-blur-lg">
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-900/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md">
            {brand.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-white leading-none">
              Stadium<span className="text-cyan-400">OS AI</span>
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 font-mono">
              {brand.label}
            </span>
          </div>
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/40 font-mono">
            v2.6
          </span>
        </div>

        {/* Global Stadium Health Bar */}
        {user.role !== 'visitor' && user.role !== 'fan' && (
          <div className="px-4 pt-3.5 pb-1 border-b border-slate-900/60 bg-slate-950/20">
            <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/60 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Stadium Health</span>
                <span className={`font-black ${healthColor}`}>{stadiumHealth}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    stadiumHealth === 'Excellent' ? 'bg-emerald-500' :
                    stadiumHealth === 'Good' ? 'bg-cyan-500' :
                    stadiumHealth === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '#');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-blue-950/60 to-slate-900/40 border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/30'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-900/80 bg-slate-950/20">
          <div className="flex items-center gap-3 px-2 py-2 mb-3 rounded-lg bg-slate-950/40 border border-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
              <User className="h-4.5 w-4.5 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{getRoleLabel(user.role)}</p>
            </div>
          </div>
          {isDemoMode && (
            <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/25 border border-cyan-900/40 text-[10px] space-y-1">
              <span className="font-bold text-cyan-400 block flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Demo Environment Active
              </span>
              <span className="text-[9px] text-slate-400 block leading-tight">
                • No real stadium systems affected<br />
                • AI-generated telemetry<br />
                • Simulated FIFA environment
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="w-full justify-start text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/15 mt-3"
          >
            <LogOut className="mr-2.5 h-3.5 w-3.5" />
            Sign Out Session
          </Button>
        </div>
      </aside>

      {/* ----------------------------------------------------
          MOBILE DRAWER
          ---------------------------------------------------- */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-[#04060d]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative z-10 flex w-64 flex-col bg-[#080d19] border-r border-slate-900"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-slate-900/60">
                <div className="flex items-center gap-2">
                  {brand.icon}
                  <span className="text-md font-bold text-white">StadiumOS AI</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="h-8 w-8 text-slate-400">
                  <X className="h-4.5 w-4.5" />
                </Button>
              </div>

              <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive ? 'text-white bg-blue-950/40 border-l-2 border-cyan-400' : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-900/80 bg-slate-950/20">
                {isDemoMode && (
                  <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/25 border border-cyan-900/40 text-[10px] space-y-1">
                    <span className="font-bold text-cyan-400 block flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Demo Environment Active
                    </span>
                    <span className="text-[9px] text-slate-400 block leading-tight">
                      • No real stadium systems affected<br />
                      • AI-generated telemetry<br />
                      • Simulated FIFA environment
                    </span>
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="w-full justify-start text-xs text-slate-400 hover:text-red-400 mt-3">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign Out Session
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
          MAIN CONTENT WORKSPACE
          ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-900/70 bg-[#080d19]/45 backdrop-blur-md px-6 z-10 shrink-0 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="md:hidden text-slate-300">
              <Menu className="h-5 w-5" />
            </Button>

            {/* Universal Search Bar */}
            <div ref={searchRef} className="relative max-w-sm w-full hidden sm:block">
              <div className="flex items-center bg-[#070b14]/70 border border-slate-900 rounded-xl px-3 py-1.5 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all duration-200">
                <Search className="h-4 w-4 text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search gates, seats, medical hubs, transit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="bg-transparent border-none text-slate-200 text-xs w-full focus:outline-none placeholder-slate-600"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isSearchFocused && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-11 left-0 right-0 z-50 rounded-xl border border-slate-900 bg-[#080d19]/95 p-2 shadow-2xl space-y-1 max-h-60 overflow-y-auto"
                  >
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearchResultClick(item.path)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/60 transition-all flex justify-between items-center text-xs group cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-white group-hover:text-cyan-400 block">{item.term}</span>
                          <span className="text-[10px] text-slate-500">{item.description}</span>
                        </div>
                        <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-mono">Navigate</Badge>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Command Palette Hints (for Staff/FIFA) */}
            {user.role !== 'visitor' && user.role !== 'fan' && (
              <div className="hidden lg:flex items-center text-[10px] text-slate-500 font-mono gap-1 border border-slate-900 px-2.5 py-1 rounded-lg bg-slate-950/40 select-none">
                <span>Press</span>
                <kbd className="bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">Ctrl</kbd>
                <span>+</span>
                <kbd className="bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">K</kbd>
                <span>for Command Palette</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDemoAccount && (
              <Badge className="border-cyan-500/30 text-cyan-400 bg-cyan-950/20 px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase animate-pulse select-none">
                Demo Account
              </Badge>
            )}
            {/* Diagnostics Panel Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsDiagOpen(true)} 
              className="text-slate-400 hover:text-cyan-400 rounded-xl cursor-pointer"
              aria-label="Console system diagnostics"
            >
              <Activity className="h-4.5 w-4.5" />
            </Button>

            {/* Help Center Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsHelpOpen(true)} 
              className="text-slate-400 hover:text-cyan-400 rounded-xl cursor-pointer"
              aria-label="Console help center"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </Button>

            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <Button variant="ghost" size="icon" onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative text-slate-400 hover:text-white rounded-xl">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[8px] font-bold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 z-50 w-80 rounded-xl border border-slate-900 bg-[#0c1220]/95 shadow-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-900/60 pb-2.5">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <Bell className="h-4 w-4 text-cyan-400" />
                        Notification Center
                      </span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[9px] font-bold text-cyan-400 hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-950/40 border border-slate-900/60">
                      {(['all', 'security', 'medical', 'transport', 'operational', 'visitor'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setNotifFilter(cat)}
                          className={`text-[8px] font-bold px-2 py-0.5 rounded capitalize ${
                            notifFilter === cat ? 'bg-[#1e293b] text-white' : 'text-slate-500'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {filteredNotifs.length === 0 ? (
                        <div className="text-center text-[10px] text-slate-500 py-6">No notifications.</div>
                      ) : (
                        filteredNotifs.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-lg border border-slate-900/80 text-[11px] relative transition-all duration-200 ${
                              item.read ? 'bg-slate-950/15 opacity-60' : 'bg-slate-950/40 border-l-2 border-l-cyan-500'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1 pr-4">
                              <span className="text-slate-200 leading-normal">{item.message}</span>
                              <span className="text-[8px] text-slate-500 shrink-0 font-mono">{item.timestamp}</span>
                            </div>
                            
                            {!item.read && (
                              <button onClick={() => markNotificationRead(item.id)} className="absolute bottom-1 right-2 p-0.5 text-cyan-500 hover:text-cyan-400">
                                <Check className="h-3 w-3" />
                              </button>
                            )}

                            <span className="text-[8px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider bg-slate-900 text-slate-400">
                              {item.type}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="flex justify-end pt-1 border-t border-slate-900/60">
                        <button onClick={clearNotifications} className="flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-red-400">
                          <Trash2 className="h-3 w-3" /> Clear Notifications
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Badge variant="cyan" className="hidden sm:inline-flex uppercase tracking-wider text-[10px]">
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </header>

        {/* Command Center Status Ribbon */}
        <div className="flex flex-wrap items-center bg-[#070b14]/85 border-b border-slate-900 px-6 py-2.5 gap-4.5 text-[10.5px] font-mono select-none overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mr-2 flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            CONSOLE STATUS:
          </span>
          {[
            { label: 'AI Engine', status: 'Healthy', color: 'text-emerald-400' },
            { label: 'Database', status: 'Healthy', color: 'text-emerald-400' },
            { label: 'Weather Feed', status: 'Healthy', color: 'text-emerald-400' },
            { label: 'Transport API', status: 'Healthy', color: 'text-emerald-400' },
            { label: 'Indoor Navigation', status: 'Healthy', color: 'text-emerald-400' },
            { label: 'Emergency Network', status: 'Degraded', color: 'text-amber-400 animate-pulse' }
          ].map((srv, idx) => (
            <div key={idx} className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-400">{srv.label}:</span>
              <span className={`font-black ${srv.color}`}>● {srv.status}</span>
            </div>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto bg-[#05070c] p-6 focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* ----------------------------------------------------
          GLOBAL MODALS (COMMAND PALETTE & AI CONFIRMATION)
          ---------------------------------------------------- */}
      
      {/* 1. Ctrl + K Command Palette Modal */}
      <AnimatePresence>
        {isCommandOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCommandOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-blue-900/30 bg-[#0c1220]/95 p-6 shadow-2xl backdrop-blur-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                  <Terminal className="h-4.5 w-4.5 text-cyan-400" />
                  AI OPERATIONS COMMAND PALETTE
                </h3>
                <Badge variant="cyan" className="text-[8px] font-mono uppercase tracking-wider">CLEARANCE ACTIVE</Badge>
              </div>

              <div className="flex items-center bg-slate-950/80 border border-slate-900 rounded-xl px-3 py-2">
                <Search className="h-4.5 w-4.5 text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Type a command (e.g. Deploy Medical, Open Gate 4)..."
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  className="bg-transparent border-none text-slate-200 text-xs w-full focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredCommands.length === 0 ? (
                  <div className="text-center text-xs text-slate-500 py-6">No matching command operations.</div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteCommand(cmd.actionType)}
                      className="w-full text-left p-3 rounded-xl border border-slate-900/40 bg-slate-950/30 hover:bg-[#0f172a] hover:border-slate-800 transition-all flex justify-between items-center group cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-white group-hover:text-cyan-400 block text-xs">{cmd.label}</span>
                        <span className="text-[10px] text-slate-500 leading-none mt-0.5 block">{cmd.desc}</span>
                      </div>
                      <Badge variant="secondary" className="text-[8px] font-mono uppercase tracking-wider">{cmd.category}</Badge>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. AI Thinking Experience Screen Loader */}
      <AnimatePresence>
        {thinkingStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center space-y-4 max-w-sm w-full"
            >
              <div className="relative inline-flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500" />
                <Bot className="absolute h-6 w-6 text-cyan-400 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold block animate-pulse">AI OPERATION IN PROGRESS</span>
                <span className="text-[11px] text-slate-400 font-mono block">{thinkingStep}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Premium Operation Confirmation Modal */}
      <AnimatePresence>
        {activeReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveReport(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-emerald-900/30 bg-[#06110f]/95 p-6 shadow-2xl backdrop-blur-xl space-y-5"
            >
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-emerald-950 text-emerald-400">
                <ShieldCheck className="h-6 w-6 shrink-0" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Operation Completed</h3>
                  <p className="text-[10px] text-emerald-500/80 leading-none mt-0.5">AI Operations Payload Executed Successfully</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-900 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-medium">{activeReport.metricLabel}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 line-through text-xs">{activeReport.beforeVal}</span>
                    <span className="text-emerald-400 font-bold">➔</span>
                    <span className="text-emerald-400 font-black text-sm">{activeReport.afterVal}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono mb-0.5">Wait Time</span>
                    <span className="text-slate-200 font-bold block">{activeReport.waitBefore} ➔ {activeReport.waitAfter}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono mb-0.5">Workforce</span>
                    <span className="text-slate-200 font-bold block">+{activeReport.extraStaff} Personnel</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-dashed border-emerald-900/30 bg-emerald-950/10 text-center text-[10px] text-emerald-400 leading-relaxed">
                  ✓ Redirected approximately <strong className="text-white font-bold">{activeReport.divertedCount.toLocaleString()} visitors</strong> to balance concourse density channels.
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  onClick={() => {
                    const lastHist = history[0];
                    if (lastHist) rollbackOperation(lastHist.id);
                    setActiveReport(null);
                  }}
                  variant="outline"
                  className="flex-1 text-xs border-slate-800 bg-[#0d1715]/40 text-slate-300 hover:text-white cursor-pointer h-9"
                >
                  <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                  <span>Undo Operation</span>
                </Button>
                
                <Button
                  onClick={() => setActiveReport(null)}
                  className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer h-9"
                >
                  Acknowledge Report
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Help Center Modal */}
      <Dialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="StadiumOS Global Help Center"
        description="FIFA World Cup 2026 Operations Console Guide."
      >
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1 text-xs text-slate-300">
          <div className="space-y-1.5">
            <span className="font-bold text-cyan-400 block uppercase tracking-wider font-mono text-[9px]">⌨ Keyboard Shortcuts</span>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded border border-slate-900 font-mono text-[10px]">
              <div>Press <kbd className="bg-slate-900 border border-slate-800 px-1 py-0.2 rounded text-[10px]">Ctrl + K</kbd></div>
              <div>Toggle Command Palette</div>
              <div>Press <kbd className="bg-slate-900 border border-slate-800 px-1 py-0.2 rounded text-[10px]">Esc</kbd></div>
              <div>Close Active Dialogs</div>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-900/60 pt-3">
            <span className="font-bold text-cyan-400 block uppercase tracking-wider font-mono text-[9px]">👤 User Role Reference</span>
            <div className="space-y-2 leading-relaxed text-slate-400">
              <div><strong>Visitor Portal</strong>: Intended for matchday fans. Features crowd status guides, seating maps, and weather alerts.</div>
              <div><strong>Staff Operations Desk</strong>: For stadium coordinators. Allocates volunteers, claims assistance requests, and logs alerts.</div>
              <div><strong>FIFA Board Room</strong>: For World Cup commissioners. Coordinates multi-stadium matches, monitors playbooks, and runs Twin simulator logs.</div>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-900/60 pt-3">
            <span className="font-bold text-cyan-400 block uppercase tracking-wider font-mono text-[9px]">🤖 AI Assistant & Emergency Playbooks</span>
            <div className="space-y-1.5 leading-relaxed text-slate-400">
              <p>Type commands inside the assistant or command palette (e.g. *&quot;Heavy rain forecast in Vancouver&quot;*) to preview AI recommendations. Press **Approve** to deploy direct visual updates.</p>
              <p>Playbooks trigger bundled actions instantly to handle high congestion, medical emergencies, or solar load grid limits.</p>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Diagnostics Dialog */}
      <Dialog
        isOpen={isDiagOpen}
        onClose={() => setIsDiagOpen(false)}
        title="Console System Diagnostics"
        description="Sub-system telemetry nodes status reports."
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/60 space-y-0.5">
              <span className="text-[9px] text-slate-500 font-bold block font-mono">CPU MEMORY USE</span>
              <span className="text-md font-black text-white font-mono">124 MB / 512 MB</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/60 space-y-0.5">
              <span className="text-[9px] text-slate-500 font-bold block font-mono">RESPONSE LATENCY</span>
              <span className="text-md font-black text-emerald-400 font-mono">14 ms</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-900/60 pt-3 text-[11px]">
            <span className="text-[9px] text-slate-500 font-bold block font-mono uppercase">Node Services Registry</span>
            {[
              { label: 'AI Engine Pipeline (v1.1.2)', status: 'Nominal', color: 'text-emerald-400' },
              { label: 'Database Telemetry Ledger', status: 'Nominal', color: 'text-emerald-400' },
              { label: 'Live Weather Feed Service', status: 'Nominal', color: 'text-emerald-400' },
              { label: 'CONCACAF Transit API', status: 'Nominal', color: 'text-emerald-400' },
              { label: 'Emergency Beacon Network', status: 'Degraded', color: 'text-amber-400 animate-pulse' },
              { label: 'PWA Offline Storage Cache', status: 'Active (1.8MB)', color: 'text-emerald-400' }
            ].map((srv, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-900/40 font-mono">
                <span className="text-slate-400">{srv.label}</span>
                <span className={`font-bold ${srv.color}`}>● {srv.status}</span>
              </div>
            ))}
          </div>
        </div>
      </Dialog>

    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StadiumProvider>
      <LayoutContent>{children}</LayoutContent>
    </StadiumProvider>
  );
}
