// ============================================================
// GlassCard — Reusable glassmorphic card component
// WHITE theme with subtle shadows and red accent on hover
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  variant?: 'default' | 'accent' | 'danger' | 'success';
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white border-gray-200 shadow-sm',
  accent: 'bg-red-50/50 border-red-200 shadow-sm',
  danger: 'bg-red-50/50 border-red-200 shadow-sm',
  success: 'bg-emerald-50/50 border-emerald-200 shadow-sm',
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
        glow && 'hover:shadow-lg hover:shadow-red-100/50 hover:border-red-200',
        !glow && 'hover:shadow-md',
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
