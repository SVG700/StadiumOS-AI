import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, ...props }, ref) => {
    return (
      <button
        className={twMerge(
          'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          // Variants
          variant === 'default' && 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-950/30 hover:from-blue-500 hover:to-cyan-500 hover:shadow-cyan-950/40 border border-blue-400/20',
          variant === 'destructive' && 'bg-gradient-to-r from-red-700 to-rose-600 text-white shadow-lg shadow-red-950/20 hover:from-red-600 hover:to-rose-500 border border-red-500/20',
          variant === 'success' && 'bg-gradient-to-r from-emerald-700 to-green-600 text-white shadow-lg shadow-emerald-950/20 hover:from-emerald-600 hover:to-green-500 border border-emerald-500/20',
          variant === 'outline' && 'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/80 hover:text-white',
          variant === 'secondary' && 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/50',
          variant === 'ghost' && 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
          variant === 'link' && 'text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300',
          // Sizes
          size === 'default' && 'h-10 px-4 py-2',
          size === 'sm' && 'h-8 rounded-md px-3 text-xs',
          size === 'lg' && 'h-12 rounded-lg px-8 text-base',
          size === 'icon' && 'h-10 w-10',
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
