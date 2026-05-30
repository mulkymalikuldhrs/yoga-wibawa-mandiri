// ============================================================
// InstallPWAButton — Install App button with glassmorphic design
// Features:
//   - Shows when PWA is installable (beforeinstallprompt)
//   - iOS Safari fallback instructions (no beforeinstallprompt support)
//   - Success message after installation
//   - Dismiss with 7-day cooldown
//   - Compact and full variants
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Download,
  X,
  Smartphone,
  Monitor,
  CheckCircle2,
  Share,
  Plus,
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

/**
 * Detect iOS Safari (which doesn't support beforeinstallprompt)
 */
function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
  return isIOS && isSafari;
}

export default function InstallPWAButton({
  className,
  variant = 'full',
}: InstallPWAButtonProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    setIsPWA(isPWAInstalled());

    // Detect iOS
    const ios = isIOSSafari();
    setIsIOS(ios);

    // On iOS, we can show an install hint since there's no beforeinstallprompt
    if (ios) {
      // Only show if not dismissed and not already installed
      const wasDismissed = localStorage.getItem('ywm_pwa_ios_dismissed');
      if (!wasDismissed || (Date.now() - parseInt(wasDismissed, 10)) / (1000 * 60 * 60 * 24) >= 7) {
        setCanInstall(true);
      } else {
        setDismissed(true);
      }
      return;
    }

    // Listen for install prompt (non-iOS)
    const cleanup = onInstallPromptAvailable(() => {
      setCanInstall(true);
    });

    // Check if dismissed before
    const wasDismissed = localStorage.getItem('ywm_pwa_dismissed');
    if (wasDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(wasDismissed, 10)) / (1000 * 60 * 60 * 24);
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
      setInstalled(true);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setInstalled(false), 5000);
    };
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      cleanup?.();
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    // iOS doesn't support the install prompt
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    setInstalling(true);
    const accepted = await showInstallPrompt();
    setInstalling(false);

    if (accepted) {
      setCanInstall(false);
      setInstalled(true);
      setTimeout(() => setInstalled(false), 5000);
    }
  }, [isIOS]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(
      isIOS ? 'ywm_pwa_ios_dismissed' : 'ywm_pwa_dismissed',
      Date.now().toString()
    );
    setShowIOSInstructions(false);
  }, [isIOS]);

  // Show success message after installation
  if (installed) {
    return (
      <div
        className={cn(
          'p-4 rounded-2xl',
          'bg-emerald-50/80 backdrop-blur-xl border border-emerald-200/60',
          'shadow-lg shadow-emerald-500/[0.05]',
          'transition-all duration-300',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100/80 to-green-100/80 
            flex items-center justify-center border border-emerald-200/50 flex-shrink-0">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <h4 className="text-emerald-800 font-semibold text-sm">Berhasil Diinstal! 🎉</h4>
            <p className="text-emerald-500 text-xs">
              YWM Dashboard telah ditambahkan ke perangkat Anda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show if PWA is already installed, can't install, or dismissed
  if (isPWA || !canInstall || dismissed) {
    return null;
  }

  // ─── iOS Install Instructions Modal ───────────────────────
  if (showIOSInstructions) {
    return (
      <div
        className={cn(
          'relative p-4 rounded-2xl',
          'bg-white/50 backdrop-blur-xl border border-white/60',
          'shadow-lg shadow-black/[0.03]',
          'transition-all duration-300',
          className
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-white/50 transition-all"
          aria-label="Tutup"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100/80 to-indigo-100/80 
            flex items-center justify-center border border-blue-200/50 flex-shrink-0">
            <Share size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-slate-800 font-semibold text-sm mb-2">Instal di iPhone/iPad</h4>
            <ol className="text-slate-500 text-xs leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">1</span>
                <span>Tap ikon <Share size={12} className="inline mx-0.5 text-blue-500" /> <strong>Share</strong> di bar bawah Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">2</span>
                <span>Scroll dan pilih <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">3</span>
                <span>Tap <Plus size={12} className="inline mx-0.5 text-blue-500" /> <strong>"Add"</strong> untuk menginstal</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // ─── Compact Variant ─────────────────────────────────────
  if (variant === 'compact') {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-red-50/80 border border-red-200/50',
          'text-red-600 text-sm font-medium',
          'hover:bg-red-100 hover:border-red-200/60',
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

  // ─── Full Variant ─────────────────────────────────────────
  return (
    <div
      className={cn(
        'relative p-4 rounded-2xl',
        'bg-white/50 backdrop-blur-xl border border-white/60',
        'shadow-lg shadow-black/[0.03]',
        'transition-all duration-300',
        className
      )}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-white/50 transition-all"
        aria-label="Tutup"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100/80 to-orange-100/80 
          flex items-center justify-center border border-red-200/50 flex-shrink-0">
          <Smartphone size={20} className="text-red-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-slate-800 font-semibold text-sm mb-0.5">Instal YWM Dashboard</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            {isIOS
              ? 'Tambahkan ke home screen untuk akses cepat seperti aplikasi native.'
              : 'Akses dashboard lebih cepat dan bisa digunakan offline langsung dari perangkat Anda.'}
          </p>

          <button
            onClick={handleInstall}
            disabled={installing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'bg-gradient-to-r from-red-500/20 to-orange-600/20',
              'border border-red-200/50',
              'text-red-600 text-sm font-medium',
              'hover:from-red-100 hover:to-orange-100 hover:border-red-300/60',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'shadow-[0_0_15px_rgba(220,38,38,0.12)]'
            )}
          >
            <Download size={16} className={installing ? 'animate-bounce' : ''} />
            <span>{installing ? 'Menginstal...' : isIOS ? 'Cara Instal' : 'Instal Sekarang'}</span>
            <Monitor size={14} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
