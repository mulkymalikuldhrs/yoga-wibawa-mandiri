// ============================================================
// InstallPWAButton — Install App button with glassmorphic design
// Shows when PWA is installable, hides after installation
// Can be dismissed by user
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Download,
  X,
  Smartphone,
  Monitor,
} from 'lucide-react';
import {
  showInstallPrompt,
  onInstallPromptAvailable,
  isPWAInstalled,
  type BeforeInstallPromptEvent,
} from '@/lib/pwa';

interface InstallPWAButtonProps {
  /** Optional className for positioning */
  className?: string;
  /** Variant: compact for inline, full for standalone */
  variant?: 'compact' | 'full';
}

export default function InstallPWAButton({
  className,
  variant = 'full',
}: InstallPWAButtonProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    setIsPWA(isPWAInstalled());

    // Listen for install prompt
    const cleanup = onInstallPromptAvailable((e) => {
      setCanInstall(true);
    });

    // Also check if dismissed before
    const wasDismissed = localStorage.getItem('ywm_pwa_dismissed');
    if (wasDismissed) {
      const dismissedAt = parseInt(wasDismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setDismissed(true);
      } else {
        localStorage.removeItem('ywm_pwa_dismissed');
      }
    }

    // Listen for appinstalled
    const handleInstalled = () => {
      setCanInstall(false);
      setIsPWA(true);
    };
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      cleanup?.();
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    setInstalling(true);
    const accepted = await showInstallPrompt();
    setInstalling(false);
    if (accepted) {
      setCanInstall(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem('ywm_pwa_dismissed', Date.now().toString());
  }, []);

  // Don't show if PWA is already installed, can't install, or dismissed
  if (isPWA || !canInstall || dismissed) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-cyan-500/15 border border-cyan-500/25',
          'text-cyan-400 text-sm font-medium',
          'hover:bg-cyan-500/25 hover:border-cyan-500/40',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <Download size={16} className={installing ? 'animate-bounce' : ''} />
        <span>{installing ? 'Menginstal...' : 'Instal Aplikasi'}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'relative p-4 rounded-2xl',
        'bg-white/5 backdrop-blur-xl border border-white/10',
        'shadow-lg shadow-black/20',
        'transition-all duration-300',
        className
      )}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
        aria-label="Tutup"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 
          flex items-center justify-center border border-cyan-500/20 flex-shrink-0">
          <Smartphone size={20} className="text-cyan-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm mb-0.5">Instal YWM Dashboard</h4>
          <p className="text-white/40 text-xs leading-relaxed mb-3">
            Akses dashboard lebih cepat dan bisa digunakan offline langsung dari perangkat Anda.
          </p>

          <button
            onClick={handleInstall}
            disabled={installing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'bg-gradient-to-r from-cyan-500/20 to-blue-600/20',
              'border border-cyan-500/30',
              'text-cyan-400 text-sm font-medium',
              'hover:from-cyan-500/30 hover:to-blue-600/30 hover:border-cyan-500/50',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'shadow-[0_0_15px_rgba(0,212,255,0.1)]'
            )}
          >
            <Download size={16} className={installing ? 'animate-bounce' : ''} />
            <span>{installing ? 'Menginstal...' : 'Instal Sekarang'}</span>
            <Monitor size={14} className="text-white/30" />
          </button>
        </div>
      </div>
    </div>
  );
}
