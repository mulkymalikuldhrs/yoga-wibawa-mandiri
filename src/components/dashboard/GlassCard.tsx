// ============================================================
// GlassCard — Reusable bright glassmorphic card component
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  variant?: 'default' | 'accent' | 'danger' | 'success';
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white/50 border-white/60 shadow-lg shadow-black/[0.03]',
  accent: 'bg-cyan-50/60 border-cyan-200/50 shadow-lg shadow-cyan-500/[0.05]',
  danger: 'bg-red-50/60 border-red-200/50 shadow-lg shadow-red-500/[0.05]',
  success: 'bg-emerald-50/60 border-emerald-200/50 shadow-lg shadow-emerald-500/[0.05]',
};

export default function GlassCard({
  glow = false,
  variant = 'default',
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-xl rounded-2xl border transition-all duration-300',
        variantStyles[variant] || variantStyles.default,
        glow && 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
        'hover:bg-white/60 hover:border-white/70',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Sub-component for card header
export function GlassCardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 pt-5 pb-3 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Sub-component for card content
export function GlassCardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 pb-5', className)} {...props}>
      {children}
    </div>
  );
}
