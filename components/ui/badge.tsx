import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'cyan';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2',
        // Variants
        variant === 'default' && 'border-transparent bg-blue-500/10 text-blue-400 border-blue-500/25',
        variant === 'secondary' && 'border-transparent bg-slate-800 text-slate-300 border-slate-700/50',
        variant === 'success' && 'border-transparent bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
        variant === 'warning' && 'border-transparent bg-amber-500/15 text-amber-400 border-amber-500/25',
        variant === 'destructive' && 'border-transparent bg-rose-500/15 text-rose-400 border-rose-500/25 animate-pulse',
        variant === 'cyan' && 'border-transparent bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
        className
      )}
      {...props}
    />
  );
}

export { Badge };
