// ============================================================
// NotificationPopup — Toast-style notification pop-ups (bottom-right)
// Glassmorphic design, auto-dismiss after 8s, reply input, max 3 visible
// Updated: 2026-05-29 — 8s auto-dismiss, navigate button, improved positioning
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useNotifications, type PopupNotification } from './NotificationProvider';
import {
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  X,
  Send,
  Loader2,
  Eye,
  Clock,
  ExternalLink,
} from 'lucide-react';

// ── Tipe config ──
const TIPE_CONFIG: Record<
  string,
  {
    color: string;
    bg: string;
    border: string;
    glow: string;
    icon: React.ReactNode;
  }
> = {
  info: {
    color: 'text-cyan-600',
    bg: 'bg-cyan-100/80',
    border: 'border-cyan-200/50',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.12)]',
    icon: <Info size={18} />,
  },
  peringatan: {
    color: 'text-amber-600',
    bg: 'bg-amber-100/80',
    border: 'border-amber-200/50',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    icon: <AlertTriangle size={18} />,
  },
  bahaya: {
    color: 'text-red-600',
    bg: 'bg-red-100/80',
    border: 'border-red-200/50',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.12)]',
    icon: <AlertOctagon size={18} />,
  },
  sukses: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-100/80',
    border: 'border-emerald-200/50',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    icon: <CheckCircle2 size={18} />,
  },
};

// ── Relative time ──
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

// ── Single popup card ──
function PopupCard({
  popup,
  onDismiss,
  onMarkRead,
  onReply,
  onNavigate,
  replyLoading,
}: {
  popup: PopupNotification;
  onDismiss: () => void;
  onMarkRead: () => void;
  onReply: (text: string) => void;
  onNavigate: () => void;
  replyLoading: boolean;
}) {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8); // 8 seconds auto-dismiss
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  const tc = TIPE_CONFIG[popup.tipe] || TIPE_CONFIG.info;

  // ── Auto-dismiss timer (8s, pauses on hover) ──
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setTimeLeft(8); // Reset to 8 seconds on mouse leave
  };

  const handleReply = () => {
    if (!replyText.trim() || replyLoading) return;
    onReply(replyText.trim());
    setReplyText('');
    setShowReply(false);
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const handleToggleReply = () => {
    setShowReply((prev) => !prev);
    setTimeout(() => replyInputRef.current?.focus(), 100);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'w-[360px] max-w-[calc(100vw-2rem)] backdrop-blur-xl bg-white/90',
        'border border-white/60 rounded-2xl shadow-2xl shadow-black/[0.08]',
        'transition-all duration-500 ease-out',
        tc.glow,
        popup.dismissed
          ? 'translate-x-[120%] opacity-0 scale-95'
          : 'translate-x-0 opacity-100 scale-100'
      )}
      style={{
        animation: popup.dismissed ? undefined : 'ywm-slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Progress bar */}
      <div className="h-0.5 rounded-t-2xl overflow-hidden bg-white/50">
        <div
          className={cn(
            'h-full transition-all duration-1000 ease-linear',
            popup.tipe === 'bahaya'
              ? 'bg-red-500/60'
              : popup.tipe === 'peringatan'
              ? 'bg-amber-500/60'
              : popup.tipe === 'sukses'
              ? 'bg-emerald-500/60'
              : 'bg-cyan-500/60'
          )}
          style={{ width: `${(timeLeft / 8) * 100}%` }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
              tc.bg,
              tc.color
            )}
          >
            {tc.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-slate-800 text-sm font-semibold leading-tight line-clamp-1">
                {popup.judul}
              </h4>
              <button
                onClick={onDismiss}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-white/60 transition-all flex-shrink-0"
                title="Tutup"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
              {popup.pesan}
            </p>
          </div>
        </div>

        {/* Timestamp & Module */}
        <div className="flex items-center gap-3 mt-3 ml-12">
          <div className="flex items-center gap-1 text-slate-400 text-[10px]">
            <Clock size={10} />
            <span>{relativeTime(popup.createdAt)}</span>
          </div>
          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', tc.bg, tc.color)}>
            {popup.modul}
          </span>
          {!popup.dibaca && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 ml-12">
          {!popup.dibaca && (
            <button
              onClick={onMarkRead}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 text-slate-400 text-[11px] hover:bg-white/60 hover:text-slate-500 transition-all"
            >
              <Eye size={10} />
              Baca
            </button>
          )}
          <button
            onClick={onNavigate}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 text-cyan-500 text-[11px] hover:bg-cyan-50/80 hover:text-cyan-600 transition-all"
          >
            <ExternalLink size={10} />
            Buka
          </button>
          <button
            onClick={handleToggleReply}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all',
              showReply
                ? 'bg-cyan-100/80 text-cyan-600'
                : 'bg-white/50 text-slate-400 hover:bg-white/60 hover:text-slate-500'
            )}
          >
            <Send size={10} />
            Balas AI
          </button>
          <button
            onClick={onDismiss}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 text-slate-400 text-[11px] hover:bg-white/60 hover:text-slate-500 transition-all ml-auto"
          >
            Tutup
          </button>
        </div>

        {/* Reply Input */}
        {showReply && (
          <div className="mt-3 ml-12">
            <div className="flex items-center gap-2 bg-white/50 border border-white/60 rounded-xl p-1.5 focus-within:border-cyan-200/50 focus-within:bg-white/60 transition-all">
              <input
                ref={replyInputRef}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleReplyKeyDown}
                placeholder="Ketik balasan ke AI..."
                disabled={replyLoading}
                className="flex-1 bg-transparent text-slate-800 text-xs placeholder:text-slate-400 outline-none min-w-0"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || replyLoading}
                className="p-1.5 rounded-lg bg-cyan-100/80 text-cyan-600 hover:bg-cyan-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                title="Kirim balasan"
              >
                {replyLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
              </button>
            </div>
            {replyLoading && (
              <p className="text-slate-400 text-[10px] mt-1 ml-1">
                AI sedang memproses balasan...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Popup Container ──
export default function NotificationPopup() {
  const { popups, dismissPopup, markAsRead, replyToNotification, replyLoading, navigateToModule } =
    useNotifications();

  // Filter out dismissed popups for rendering
  const activePopups = popups.filter((p) => !p.dismissed).slice(0, 3);

  if (activePopups.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col gap-3 pointer-events-none sm:top-6 sm:right-6" style={{ animation: 'none' }}>
      {activePopups.map((popup) => (
        <div key={popup.popupId} className="pointer-events-auto">
          <PopupCard
            popup={popup}
            onDismiss={() => dismissPopup(popup.popupId)}
            onMarkRead={() => markAsRead(popup.id)}
            onReply={(text) => replyToNotification(popup.id, text)}
            onNavigate={() => {
              if (popup.modul && navigateToModule) {
                navigateToModule(popup.modul as import('@/types/dashboard').DashboardModule);
              }
              dismissPopup(popup.popupId);
            }}
            replyLoading={!!replyLoading[popup.id]}
          />
        </div>
      ))}
    </div>
  );
}
