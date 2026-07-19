'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Users, Ticket, Shield, Building, Globe, Trophy, Info, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortalSelectionPage() {
  const { isLoading } = useAuth();
  const router = useRouter();



  const handlePortalSelect = (portal: 'visitor' | 'staff' | 'fifa') => {
    router.push(`/login?portal=${portal}`);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#05070c] text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 animate-pulse">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs uppercase tracking-widest text-slate-500">Loading StadiumOS Portal...</span>
        </div>
      </main>
    );
  }

  const portals = [
    {
      id: 'visitor' as const,
      title: 'Visitor Portal',
      subtitle: 'For football fans attending matches.',
      icon: (
        <div className="flex gap-1 items-center text-cyan-400">
          <Users className="h-7 w-7" />
          <span className="text-slate-500 text-sm">/</span>
          <Ticket className="h-7 w-7" />
        </div>
      ),
      includes: [
        'Smart indoor navigation',
        'AI Assistant',
        'Transportation guidance',
        'Accessibility support',
        'Sustainability dashboard',
        'Personal notifications',
      ],
      buttonText: 'Continue as Visitor',
      color: 'from-cyan-600 to-blue-600 shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:border-cyan-500/50',
      tag: 'Fans & Spectators',
    },
    {
      id: 'staff' as const,
      title: 'Stadium Operations Portal',
      subtitle: 'For volunteers, security staff, operations teams and venue managers.',
      icon: (
        <div className="flex gap-1 items-center text-emerald-400">
          <Shield className="h-7 w-7" />
          <span className="text-slate-500 text-sm">/</span>
          <Building className="h-7 w-7" />
        </div>
      ),
      includes: [
        'Crowd Intelligence',
        'Emergency Dispatch',
        'Workforce Management',
        'Incident Response',
        'Accessibility Operations',
        'Transport Coordination',
      ],
      buttonText: 'Continue as Stadium Staff',
      color: 'from-emerald-600 to-teal-600 shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:border-emerald-500/50',
      tag: 'Venue Workforce',
    },
    {
      id: 'fifa' as const,
      title: 'FIFA Administration Portal',
      subtitle: 'For FIFA board members and tournament directors.',
      icon: (
        <div className="flex gap-1 items-center text-amber-400">
          <Globe className="h-7 w-7" />
          <span className="text-slate-500 text-sm">/</span>
          <Trophy className="h-7 w-7" />
        </div>
      ),
      includes: [
        'Executive analytics',
        'Multi-stadium monitoring',
        'Sustainability reports',
        'Tournament KPIs',
        'Global operational intelligence',
      ],
      buttonText: 'Continue as FIFA Board',
      color: 'from-amber-600 to-yellow-600 shadow-amber-500/10 hover:shadow-amber-500/20 hover:border-amber-500/50',
      tag: 'Tournament Directors',
    },
  ];

  return (
    <main 
      className="relative flex min-h-screen flex-col items-center justify-between overflow-x-hidden bg-[#030611] text-slate-100 py-12 px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(3, 6, 17, 0.93), rgba(3, 6, 17, 0.98)), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop')`,
      }}
    >
      {/* Aesthetic ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-blue-900/20 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-amber-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-10 mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-5 backdrop-blur-md">
          <Star className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span>Unified Demonstration Portal</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
          Stadium<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">OS AI</span>
        </h1>
        <p className="text-lg sm:text-xl font-bold text-slate-200 tracking-wide uppercase font-mono mb-2">
          FIFA World Cup 2026
        </p>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
          Select the portal you would like to access. Each portal features distinct layouts, operational scopes, and access restrictions.
        </p>
      </div>

      {/* Grid of Portals */}
      <div className="relative z-10 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-7xl w-full mx-auto px-2 sm:px-6 mb-12">
        {portals.map((portal, index) => (
          <motion.div
            key={portal.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className={`group relative flex flex-col justify-between rounded-2xl border border-slate-900 bg-slate-950/65 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 ${portal.color}`}
          >
            {/* Top Section */}
            <div>
              <div className="flex justify-between items-start mb-6">
                {portal.icon}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-400 border border-slate-800 font-mono">
                  {portal.tag}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {portal.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                {portal.subtitle}
              </p>

              {/* Includes checklist */}
              <div className="border-t border-slate-900/60 pt-5 mb-8">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3.5">
                  Portal Includes:
                </span>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {portal.includes.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-cyan-400 shrink-0 mt-0.5">•</span>
                      <span className="leading-tight">{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handlePortalSelect(portal.id)}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-slate-900 to-slate-950 hover:from-cyan-950 hover:to-blue-900 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-md group-hover:shadow-cyan-950/50 cursor-pointer"
            >
              <span>{portal.buttonText}</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Demo Notice Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4"
      >
        <div className="rounded-2xl border border-blue-950/40 bg-gradient-to-r from-blue-950/20 via-slate-950/60 to-blue-950/20 p-5 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="flex gap-4 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900/20 border border-blue-800/40 text-blue-400 shadow-inner shadow-blue-500/10">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300">
                Demonstration Notice
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                In the production deployment these portals would be hosted on separate secure domains with independent authentication systems and strict role-based access controls.
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                For judging purposes, all portals have been consolidated into a single demonstration environment so every feature can be evaluated without switching websites.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <div className="relative z-10 text-center text-[10px] text-slate-600 mt-10 tracking-widest uppercase">
        © 2026 StadiumOS AI • Secure Operations Desk
      </div>
    </main>
  );
}
