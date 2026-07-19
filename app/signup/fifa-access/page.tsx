import React from 'react';
import Link from 'next/link';
import { Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FifaBoardAccessPage() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030611] px-4 py-12 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(3, 6, 17, 0.94), rgba(3, 6, 17, 0.98)), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop')`,
      }}
    >
      {/* Background glowing rings */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-blue-950/20 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Logo */}
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/20">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-3.5 text-2xl font-black tracking-tight text-white">
            Stadium<span className="text-cyan-400">OS AI</span>
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mt-0.5">
            FIFA World Cup 2026 Operations
          </p>
        </div>

        {/* Access Request Card */}
        <div className="rounded-2xl border border-amber-900/40 bg-[#0d121f]/80 p-8 shadow-2xl backdrop-blur-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Globe className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-bold text-white mb-3">
            Request FIFA Board Access
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            To obtain FIFA Executive Board access, please contact the StadiumOS AI administration team.
          </p>

          <div className="mb-6 p-3.5 rounded-xl border border-amber-900/50 bg-[#070b14] flex items-center justify-center gap-2">
            <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <a
              href="mailto:fifa.demo@stadiumos.ai"
              className="text-xs font-mono font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
            >
              fifa.demo@stadiumos.ai
            </a>
          </div>

          <Link href="/login" className="block w-full">
            <Button className="w-full">
              ← Back to Login
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] text-slate-600 tracking-wider font-mono">
          SECURE SYSTEMS CLASSIFIED ACCESS. SYSTEM AUDITING ACTIVE.
        </p>
      </div>
    </main>
  );
}
