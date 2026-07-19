'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Info, Ticket, Globe, ArrowLeft } from 'lucide-react';

function LoginFormContent() {
  const { signIn } = useAuth();
  const searchParams = useSearchParams();
  
  // Initialize portal from query param, fallback to visitor
  const portalParam = searchParams.get('portal') as 'visitor' | 'staff' | 'fifa' | null;
  const [selectedPortal, setSelectedPortal] = useState<'visitor' | 'staff' | 'fifa'>('visitor');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (portalParam && ['visitor', 'staff', 'fifa'].includes(portalParam)) {
        setSelectedPortal(portalParam);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [portalParam]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<'v' | 's' | 'f' | 'p' | null>(null);

  const handleCopy = (text: string, key: 'v' | 's' | 'f' | 'p') => {
    navigator.clipboard.writeText(text);
    setCopiedState(key);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleDemoLogin = async (portal: 'visitor' | 'staff' | 'fifa') => {
    setSelectedPortal(portal);
    
    let demoEmail = 'visitor.demo@stadiumos.ai';
    let demoPassword = 'Visitor@2026';
    if (portal === 'staff') {
      demoEmail = 'staff.demo@stadiumos.ai';
      demoPassword = 'Staff@2026';
    } else if (portal === 'fifa') {
      demoEmail = 'fifa.demo@stadiumos.ai';
      demoPassword = 'FIFA@2026';
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn(demoEmail, demoPassword);
      if (!result.success) {
        setError(result.error || 'Login failed.');
        setIsLoading(false);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMsg);
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getPortalDetails = () => {
    switch (selectedPortal) {
      case 'visitor':
        return {
          title: 'Visitor Portal',
          subtitle: 'Sign in to continue as a Visitor',
          badgeText: 'Visitor Access',
          badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20',
          emailLabel: 'Visitor Email Address',
          icon: <Ticket className="h-5 w-5 text-cyan-400" />,
        };
      case 'staff':
        return {
          title: 'Stadium Staff Portal',
          subtitle: 'Authorized Stadium Personnel Only',
          badgeText: 'Workforce Access',
          badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
          emailLabel: 'Staff Operational Email',
          icon: <Shield className="h-5 w-5 text-emerald-400" />,
        };
      case 'fifa':
        return {
          title: 'FIFA Board Portal',
          subtitle: 'FIFA Executive Access',
          badgeText: 'Board Executive Access',
          badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
          emailLabel: 'FIFA Board Email',
          icon: <Globe className="h-5 w-5 text-amber-400" />,
        };
    }
  };

  const portalDetails = getPortalDetails();

  return (
    <div className="relative w-full max-w-lg">
      {/* Back button */}
      <Link
        href="/"
        className="absolute -top-12 left-0 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1 cursor-pointer"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        <span>Back to Portal Selection</span>
      </Link>

      {/* Brand Logo */}
      <div className="mb-6 flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 ring-1 ring-cyan-400/20">
          <Shield className="h-6 w-6 text-white animate-pulse" />
        </div>
        <h1 className="mt-3.5 text-2xl font-black tracking-tight text-white">
          Stadium<span className="text-cyan-400">OS AI</span>
        </h1>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mt-0.5">
          FIFA World Cup 2026 Operations
        </p>
      </div>

      {/* Portal Tabs Selector */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-[#090d18] border border-slate-900 mb-5 shadow-inner">
        {(['visitor', 'staff', 'fifa'] as const).map((p) => {
          const isActive = selectedPortal === p;
          const label = p === 'visitor' ? 'Visitor' : p === 'staff' ? 'Staff' : 'FIFA Board';
          return (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPortal(p)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#10172b] text-white shadow-lg border border-slate-800/80 font-extrabold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {p === 'visitor' ? (
                <Ticket className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              ) : p === 'staff' ? (
                <Shield className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              ) : (
                <Globe className={`h-3.5 w-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-blue-950/45 bg-[#0d1220]/75 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-4 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-100">{portalDetails.title}</h2>
            <p className="mt-1 text-xs text-slate-400">{portalDetails.subtitle}</p>
          </div>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold ${portalDetails.badgeColor}`}>
            {portalDetails.badgeText}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              {portalDetails.emailLabel}
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@stadiumos.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3.5 text-xs text-red-400 flex gap-2 items-start">
              <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-3"
            isLoading={isLoading}
          >
            Authorize Portal Session
          </Button>
        </form>

        {/* Judge Sandbox Operations (One-Click Bypass) */}
        <div className="mt-6 pt-5 border-t border-slate-900/60 space-y-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Judge Sandbox Operations (One-Click Bypass)
          </span>
          <div>
            {selectedPortal === 'visitor' && (
              <button
                type="button"
                onClick={() => handleDemoLogin('visitor')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 hover:border-cyan-500/60 hover:bg-cyan-950/40 transition duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-md font-sans"
              >
                <span>Login as Visitor Demo</span>
              </button>
            )}
            {selectedPortal === 'staff' && (
              <button
                type="button"
                onClick={() => handleDemoLogin('staff')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-800/30 hover:border-emerald-500/60 hover:bg-emerald-950/40 transition duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-md font-sans"
              >
                <span>Login as Staff Demo</span>
              </button>
            )}
            {selectedPortal === 'fifa' && (
              <button
                type="button"
                onClick={() => handleDemoLogin('fifa')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-400 bg-amber-950/20 border border-amber-800/30 hover:border-amber-500/60 hover:bg-amber-950/40 transition duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-md font-sans"
              >
                <span>Login as FIFA Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Demo Credentials Panel */}
        <div className="mt-5 rounded-xl border border-slate-900 bg-slate-950/50 p-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1.5">
            <Info className="h-3.5 w-3.5" />
            <span>Demo Credentials</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
            {selectedPortal === 'visitor' && 'Use the Visitor Demo account to explore the fan experience.'}
            {selectedPortal === 'staff' && 'Use the Staff Demo account to explore stadium operations.'}
            {selectedPortal === 'fifa' && 'Use the FIFA Executive Demo account to explore the Global Command Center.'}
          </p>
          <div className="space-y-2">
            {selectedPortal === 'visitor' && (
              <>
                <div className="flex justify-between items-center bg-[#070b13]/60 px-3 py-2 rounded border border-slate-800/70 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Visitor Email</span>
                    <span className="text-white">visitor.demo@stadiumos.ai</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleCopy('visitor.demo@stadiumos.ai', 'v')} 
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer font-sans underline"
                  >
                    {copiedState === 'v' ? 'Copied!' : 'Copy Email'}
                  </button>
                </div>
                
                <div className="flex justify-between items-center bg-[#070b13]/60 px-3 py-2 rounded border border-slate-800/70 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Default Password</span>
                    <span className="text-white">Visitor@2026</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleCopy('Visitor@2026', 'p')} 
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer font-sans underline"
                  >
                    {copiedState === 'p' ? 'Copied!' : 'Copy Password'}
                  </button>
                </div>
              </>
            )}

            {selectedPortal === 'staff' && (
              <>
                <div className="flex justify-between items-center bg-[#070b13]/60 px-3 py-2 rounded border border-slate-800/70 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Staff Email</span>
                    <span className="text-white">staff.demo@stadiumos.ai</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleCopy('staff.demo@stadiumos.ai', 's')} 
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 cursor-pointer font-sans underline"
                  >
                    {copiedState === 's' ? 'Copied!' : 'Copy Email'}
                  </button>
                </div>
                
                <div className="flex justify-between items-center bg-[#070b13]/60 px-3 py-2 rounded border border-slate-800/70 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Default Password</span>
                    <span className="text-white">Staff@2026</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleCopy('Staff@2026', 'p')} 
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 cursor-pointer font-sans underline"
                  >
                    {copiedState === 'p' ? 'Copied!' : 'Copy Password'}
                  </button>
                </div>
              </>
            )}

            {selectedPortal === 'fifa' && (
              <>
                <div className="flex justify-between items-center bg-[#070b13]/60 px-3 py-2 rounded border border-slate-800/70 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">FIFA Email</span>
                    <span className="text-white">fifa.demo@stadiumos.ai</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleCopy('fifa.demo@stadiumos.ai', 'f')} 
                    className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer font-sans underline"
                  >
                    {copiedState === 'f' ? 'Copied!' : 'Copy Email'}
                  </button>
                </div>
                
                <div className="flex justify-between items-center bg-[#070b13]/60 px-3 py-2 rounded border border-slate-800/70 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Default Password</span>
                    <span className="text-white">FIFA@2026</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleCopy('FIFA@2026', 'p')} 
                    className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer font-sans underline"
                  >
                    {copiedState === 'p' ? 'Copied!' : 'Copy Password'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-900/60 pt-4">
          {selectedPortal === 'visitor' ? (
            <>
              New spectator?{' '}
              <Link href="/signup?role=visitor" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                Create Visitor Account
              </Link>
            </>
          ) : selectedPortal === 'staff' ? (
            <>
              Need a credentials clearance?{' '}
              <Link href="/signup?role=staff" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                Request Staff Account
              </Link>
            </>
          ) : (
            <>
              Need a credentials clearance?{' '}
              <Link href="/signup?role=fifa" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                Request FIFA Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-[10px] text-slate-600 tracking-wider font-mono">
        SECURE SYSTEMS CLASSIFIED ACCESS. SYSTEM AUDITING ACTIVE.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main 
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030611] px-4 py-12 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(3, 6, 17, 0.94), rgba(3, 6, 17, 0.98)), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop')`,
      }}
    >
      {/* Background glowing rings */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500" />
          <span className="text-xs uppercase tracking-widest text-slate-500">Loading Portal Credentials...</span>
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </main>
  );
}
