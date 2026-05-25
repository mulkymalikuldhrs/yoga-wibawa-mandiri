// ============================================================
// GlassCard — Reusable glassmorphic card component
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  variant?: 'default' | 'accent' | 'danger' | 'success';
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white/10 border-white/20',
  accent: 'bg-cyan-500/10 border-cyan-500/30',
  danger: 'bg-red-500/10 border-red-500/30',
  success: 'bg-emerald-500/10 border-emerald-500/30',
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
        glow && 'hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]',
        'hover:bg-white/15 hover:border-white/30',
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
