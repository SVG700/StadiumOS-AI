'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Info } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Password reset request failed.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#05070c] px-4">
      {/* Background glowing rings */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-950/20 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-950/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        {/* Brand Logo */}
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">
            StadiumOS <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400">FIFA World Cup 2026 Operations Console</p>
        </div>

        {/* Forgot Password Card */}
        <div className="rounded-2xl border border-blue-950/50 bg-[#0d121f]/70 p-8 shadow-2xl backdrop-blur-md">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-100">Instructions Transmitted</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                If the email address exists in our stadium directory, a password reset link has been dispatched.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button className="w-full">Back to Sign In</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-100">Request Password Reset</h2>
              <p className="mt-1 text-xs text-slate-400">Enter your email to receive recovery instructions.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Operations Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@stadiumos.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                    required
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
                  Send Recovery Link
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-400">
                Remember your passcode?{' '}
                <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
