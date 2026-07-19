'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserProfile } from '@/types';
import { Shield, Info } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

function SignupFormContent() {
  const { signUp, isDemoMode } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState<UserProfile['role']>('visitor');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await signUp(email, password, name, 'visitor');
      if (result.success) {
        setSession(result.session || null);
        setRegisteredEmail(result.email || email);
        setSuccess(true);
      } else {
        setError(result.error || 'Account request failed.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isVisitorPortal = true;

  return (
    <div className="relative w-full max-w-md">
      {/* Brand Logo */}
      <div className="mb-6 flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <h1 className="mt-3 text-2xl font-black text-white">
          StadiumOS <span className="text-cyan-400">AI</span>
        </h1>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mt-0.5">
          FIFA World Cup 2026 Operations
        </p>
      </div>

      {/* Signup Card */}
      <div className="rounded-2xl border border-blue-950/50 bg-[#0d121f]/75 p-8 shadow-2xl backdrop-blur-md">
        {success ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {isDemoMode ? (
              <>
                <h2 className="text-lg font-bold text-slate-100">Registration Complete</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In Demo Mode, your account is simulated and auto-authorized. You are now logged in and being redirected...
                </p>
              </>
            ) : !session ? (
              <>
                <h2 className="text-lg font-bold text-slate-100">Account created successfully.</h2>
                <p className="text-xs text-emerald-400 font-semibold leading-relaxed">
                  Please verify your email before signing in.
                </p>
                <div className="my-3 p-3 rounded-lg border border-blue-950 bg-[#070b13] text-xs text-cyan-400 font-mono break-all text-center">
                  {registeredEmail}
                </div>
                <div className="pt-2">
                  <Link href="/login">
                    <Button className="w-full">
                      Proceed to Sign In
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-100">Registration Complete</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You have registered successfully. Redirecting to your dashboard...
                </p>
                <div className="pt-2">
                  <Link href="/dashboard">
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-100">
              Create Visitor Account
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Register details to access your spectator portal.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="fan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Portal / Role Category
                </label>
                <div className="mt-1.5 p-2.5 rounded-lg border border-blue-950 bg-[#070b13] text-xs text-slate-300 font-medium">
                  Visitor / Fan
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password Passcode
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 flex gap-2 items-start">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                {isVisitorPortal ? 'Create Account' : 'Generate Clearance Credentials'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Already registered?{' '}
              <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030611] px-4 py-8 bg-cover bg-center bg-no-repeat"
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
          <span className="text-xs uppercase tracking-widest text-slate-500">Loading Signup Portal...</span>
        </div>
      }>
        <SignupFormContent />
      </Suspense>
    </main>
  );
}
