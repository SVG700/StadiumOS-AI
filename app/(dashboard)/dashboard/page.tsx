'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardForRole } from '@/components/auth/AuthProvider';

export default function DashboardRedirectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace(getDashboardForRole(user.role));
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4" />
      <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">Routing to portal...</span>
    </div>
  );
}
