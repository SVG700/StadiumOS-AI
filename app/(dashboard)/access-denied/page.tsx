'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth, getDashboardForRole } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Shield } from 'lucide-react';

export default function AccessDeniedPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleGoBack = () => {
    if (user) {
      router.push(getDashboardForRole(user.role));
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center p-4">
      {/* Glow ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-950/15 blur-[120px] pointer-events-none" />

      <div className="relative max-w-md w-full p-8 rounded-2xl border border-red-950/40 bg-slate-950/65 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Shield Alert Icon with pulse/glow */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/30 border border-red-500/20 text-red-500 shadow-lg shadow-red-500/10 animate-pulse">
          <ShieldAlert className="h-9 w-9" />
        </div>

        {/* Warning text */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Access Classified</h2>
          <p className="text-xs uppercase tracking-widest text-red-400 font-mono">Clearance Level Insufficient</p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2">
            Your active credentials do not possess the security clearance required to access this operational dashboard module.
          </p>
        </div>

        {/* User context info if logged in */}
        {user && (
          <div className="p-3.5 rounded-lg border border-slate-900 bg-slate-950/40 text-left text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Identity:</span>
              <span className="text-white font-bold">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Portal:</span>
              <span className="text-cyan-400 font-bold capitalize">{user.role} Portal</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go to My Dashboard</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 border-slate-800 hover:bg-red-950/15 hover:text-red-400 hover:border-red-900/30"
          >
            <LogOut className="h-4 w-4" />
            <span>Switch Portal Session</span>
          </Button>
        </div>
      </div>
      
      {/* Brand logo footer */}
      <div className="mt-8 flex items-center gap-1.5 text-slate-600 text-[10px] uppercase font-mono tracking-widest">
        <Shield className="h-3.5 w-3.5" />
        <span>StadiumOS Security Desk</span>
      </div>
    </div>
  );
}
