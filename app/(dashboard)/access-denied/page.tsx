'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth, getDashboardForRole } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Shield, KeyRound, Loader2, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DatabaseService } from '@/lib/db';
import { Input } from '@/components/ui/input';

export default function AccessDeniedPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('staff');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleGoBack = () => {
    if (user) {
      router.push(getDashboardForRole(user.role));
    } else {
      router.push('/');
    }
  };

  const handleOpenModal = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsOpen(true);
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !organization || !reason) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await DatabaseService.addAccessRequest({
        name,
        email,
        organization,
        requested_role: role,
        reason
      });
      setSuccess(true);
      // Reset form fields
      setOrganization('');
      setReason('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit access request. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center text-center p-4 relative">
      {/* Glow ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-red-950/15 blur-[130px] pointer-events-none" />

      <div className="relative max-w-md w-full p-8 rounded-2xl border border-red-950/45 bg-slate-950/70 shadow-2xl backdrop-blur-xl space-y-6 z-10">
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
          <div className="p-3.5 rounded-lg border border-slate-900 bg-slate-950/40 text-left text-xs font-mono space-y-1.5">
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
            onClick={handleOpenModal}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-950/40 border-none h-11 rounded-lg transition-all duration-200"
          >
            <KeyRound className="h-4.5 w-4.5" />
            <span>Request Elevated Access</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 border-slate-800 text-slate-300 hover:bg-slate-900 h-11 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go to My Dashboard</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 hover:bg-red-950/10 h-10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Switch Portal Session</span>
          </Button>
        </div>
      </div>

      {/* Reusable Request Access Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04060d]/80 backdrop-blur-md">
            {/* Click backdrop to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!submitting) setIsOpen(false); }}
              className="fixed inset-0 bg-transparent"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0.1 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/95 text-slate-100 shadow-[0_0_50px_-10px_rgba(6,182,212,0.15)] focus:outline-none flex flex-col"
            >
              {/* Cyan Top border */}
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-500 shrink-0" />

              {/* Header */}
              <div className="p-6 pb-4 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <KeyRound className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Request Portal Clearance</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">FIFA Secure Credentials Desk</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={submitting}
                  className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {success ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-100">Clearance Request Logged</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Your request has been filed under status: <span className="text-amber-400 font-bold font-mono">Pending Audit</span>.
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed pt-2">
                        FIFA board directors will review your authorization request. Upon approval, your credentials will update immediately.
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="w-full mt-4"
                    >
                      Acknowledge & Close
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                        ⚠️ {error}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block font-mono">Full Name</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Commissioner Morgan"
                        className="bg-slate-950/60 border-slate-900 focus-visible:ring-cyan-500/40 text-xs placeholder:text-slate-600 text-white rounded-lg h-10"
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block font-mono">Email Address</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@stadiumos.ai"
                        className="bg-slate-950/60 border-slate-900 focus-visible:ring-cyan-500/40 text-xs placeholder:text-slate-600 text-white rounded-lg h-10"
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block font-mono">Organization</label>
                      <Input
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. FIFA Sustainability Committee"
                        className="bg-slate-950/60 border-slate-900 focus-visible:ring-cyan-500/40 text-xs placeholder:text-slate-600 text-white rounded-lg h-10"
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block font-mono">Requested Role Clearance</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-900 text-xs text-white rounded-lg h-10 px-3 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-medium"
                        disabled={submitting}
                      >
                        <option value="staff" className="bg-slate-950 text-white">Staff (Operations)</option>
                        <option value="fifa" className="bg-slate-950 text-white">FIFA Executive (Administration)</option>
                        <option value="volunteer" className="bg-slate-950 text-white">Volunteer Force</option>
                        <option value="operations" className="bg-slate-950 text-white">Operations (Security/Logistics)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block font-mono">Justification Reason</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please state your operational purpose for requesting this security clearance tier..."
                        rows={3}
                        className="w-full bg-slate-950/60 border border-slate-900 text-xs text-white rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-medium resize-none placeholder:text-slate-600"
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-950/30 border-none h-10 rounded-lg flex items-center justify-center gap-1.5"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Filing credentials...</span>
                          </>
                        ) : (
                          <span>Submit Request</span>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Brand logo footer */}
      <div className="mt-8 flex items-center gap-1.5 text-slate-600 text-[10px] uppercase font-mono tracking-widest">
        <Shield className="h-3.5 w-3.5" />
        <span>StadiumOS Security Desk</span>
      </div>
    </div>
  );
}
