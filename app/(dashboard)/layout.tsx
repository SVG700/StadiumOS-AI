'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Map,
  Users,
  Bus,
  Accessibility,
  Leaf,
  ShieldAlert,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  Server,
  User,
  Shield,
  Ticket,
  Globe,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const VISITOR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard/visitor', icon: Home },
  { name: 'Ticket Info', href: '/dashboard/visitor#ticket', icon: Ticket },
  { name: 'Smart Navigation', href: '/navigation', icon: Map },
  { name: 'Transportation', href: '/transport', icon: Bus },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
  { name: 'Accessibility', href: '/accessibility', icon: Accessibility },
  { name: 'Sustainability', href: '/sustainability', icon: Leaf },
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

const getAllowedRoutes = (role: string): string[] => {
  if (role === 'visitor' || role === 'fan') {
    return ROLE_ALLOWED_ROUTES.visitor;
  }
  if (role === 'fifa' || role === 'admin') {
    return ROLE_ALLOWED_ROUTES.fifa;
  }
  return ROLE_ALLOWED_ROUTES.staff;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, isDemoMode, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Global client-side route protection guard
  useEffect(() => {
    if (!isLoading && user) {
      const allowed = getAllowedRoutes(user.role);
      const isAllowed = allowed.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      );

      // Skip guard checking on root redirect "/dashboard" as it handles its own routing
      if (!isAllowed && pathname !== '/dashboard') {
        router.push('/access-denied');
      }
    }
  }, [user, pathname, isLoading, router]);

  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return [];
    if (user.role === 'visitor' || user.role === 'fan') return VISITOR_ITEMS;
    if (user.role === 'fifa' || user.role === 'admin') return FIFA_ITEMS;
    return STAFF_ITEMS;
  };

  const getPageTitle = () => {
    const items = getSidebarItems();
    const item = items.find((i) => i.href === pathname);
    return item ? item.name : 'Control Center';
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
      return {
        icon: <Ticket className="h-4.5 w-4.5 text-cyan-400" />,
        label: 'Fan Companion',
      };
    }
    if (user.role === 'fifa' || user.role === 'admin') {
      return {
        icon: <Trophy className="h-4.5 w-4.5 text-amber-400" />,
        label: 'FIFA Board',
      };
    }
    return {
      icon: <Shield className="h-4.5 w-4.5 text-emerald-400" />,
      label: 'Operations Desk',
    };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070c] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const sidebarItems = getSidebarItems();
  const brand = getBrandDetails();

  return (
    <div className="flex h-screen overflow-hidden bg-[#05070c] text-slate-100 font-sans">
      {/* ----------------------------------------------------
          DESKTOP SIDEBAR
          ---------------------------------------------------- */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-900 bg-[#080d19]/90 backdrop-blur-lg">
        {/* Brand */}
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

        {/* Navigation */}
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

        {/* User Card & Logout */}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="w-full justify-start text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/15"
          >
            <LogOut className="mr-2.5 h-3.5 w-3.5" />
            Sign Out Session
          </Button>
        </div>
      </aside>

      {/* ----------------------------------------------------
          MOBILE DRAWER (TRANSITION)
          ---------------------------------------------------- */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-[#04060d]/80 backdrop-blur-sm"
            />

            {/* Sidebar drawer content */}
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileOpen(false)}
                  className="h-8 w-8 text-slate-400"
                >
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
                        isActive
                          ? 'text-white bg-blue-950/40 border-l-2 border-cyan-400'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/30'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-900/80 bg-slate-950/20">
                <div className="flex items-center gap-3 px-2 py-2 mb-3 rounded-lg bg-slate-950/40 border border-slate-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[9px] text-slate-400 truncate">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="w-full justify-start text-xs text-slate-400 hover:text-red-400"
                >
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
        <header className="flex h-16 items-center justify-between border-b border-slate-900/70 bg-[#080d19]/40 backdrop-blur-md px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-slate-300"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-white leading-none">
              {getPageTitle()}
            </h1>
          </div>

          {/* Quick status bar */}
          <div className="flex items-center gap-3.5">
            {/* Supabase status display */}
            <div className="flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1 text-xs border border-slate-900 text-slate-300">
              <Server className="h-3.5 w-3.5 text-slate-400" />
              <span>Database:</span>
              {isDemoMode ? (
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shadow-md shadow-amber-500/50" />
                  <span className="text-[10px] text-amber-400 font-medium">Demo Mode</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
                  <span className="text-[10px] text-emerald-400 font-medium">Live Supabase</span>
                </div>
              )}
            </div>

            <Badge variant="cyan" className="hidden sm:inline-flex uppercase tracking-wider text-[10px] px-2 py-0.5">
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </header>

        {/* Nested Routing Contents */}
        <main className="flex-1 overflow-y-auto bg-[#05070c] p-6 focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
