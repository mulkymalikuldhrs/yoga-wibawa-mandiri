// ============================================================
// NotificationPopup — Toast-style notification pop-ups (bottom-right)
// Glassmorphic design, auto-dismiss, reply input, max 3 visible
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
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.15)]',
    icon: <Info size={18} />,
  },
  peringatan: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    icon: <AlertTriangle size={18} />,
  },
  bahaya: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    icon: <AlertOctagon size={18} />,
  },
  sukses: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
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
  replyLoading,
}: {
  popup: PopupNotification;
  onDismiss: () => void;
  onMarkRead: () => void;
  onReply: (text: string) => void;
  replyLoading: boolean;
}) {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  const tc = TIPE_CONFIG[popup.tipe] || TIPE_CONFIG.info;

  // ── Auto-dismiss timer (30s, pauses on hover) ──
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
    setTimeLeft(30);
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
        'w-[360px] max-w-[calc(100vw-2rem)] backdrop-blur-xl bg-[#0f0c29]/90',
        'border border-white/10 rounded-2xl shadow-2xl shadow-black/40',
        'transition-all duration-300',
        tc.glow,
        popup.dismissed
          ? 'translate-x-[120%] opacity-0'
          : 'translate-x-0 opacity-100',
        'animate-in slide-in-from-right-4 fade-in duration-500'
      )}
    >
      {/* Progress bar */}
      <div className="h-0.5 rounded-t-2xl overflow-hidden bg-white/5">
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
          style={{ width: `${(timeLeft / 30) * 100}%` }}
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
              <h4 className="text-white text-sm font-semibold leading-tight line-clamp-1">
                {popup.judul}
              </h4>
              <button
                onClick={onDismiss}
                className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                title="Tutup"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-white/50 text-xs mt-1 line-clamp-2 leading-relaxed">
              {popup.pesan}
            </p>
          </div>
        </div>

        {/* Timestamp & Module */}
        <div className="flex items-center gap-3 mt-3 ml-12">
          <div className="flex items-center gap-1 text-white/25 text-[10px]">
            <Clock size={10} />
            <span>{relativeTime(popup.createdAt)}</span>
          </div>
          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', tc.bg, tc.color)}>
            {popup.modul}
          </span>
          {!popup.dibaca && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 ml-12">
          {!popup.dibaca && (
            <button
              onClick={onMarkRead}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-white/40 text-[11px] hover:bg-white/10 hover:text-white/60 transition-all"
            >
              <Eye size={10} />
              Baca
            </button>
          )}
          <button
            onClick={handleToggleReply}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all',
              showReply
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            )}
          >
            <Send size={10} />
            Balas AI
          </button>
          <button
            onClick={onDismiss}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-white/40 text-[11px] hover:bg-white/10 hover:text-white/60 transition-all ml-auto"
          >
            Tutup
          </button>
        </div>

        {/* Reply Input */}
        {showReply && (
          <div className="mt-3 ml-12">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 focus-within:border-cyan-500/30 focus-within:bg-white/[0.07] transition-all">
              <input
                ref={replyInputRef}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleReplyKeyDown}
                placeholder="Ketik balasan ke AI..."
                disabled={replyLoading}
                className="flex-1 bg-transparent text-white text-xs placeholder:text-white/25 outline-none min-w-0"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || replyLoading}
                className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
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
              <p className="text-white/20 text-[10px] mt-1 ml-1">
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
  const { popups, dismissPopup, markAsRead, replyToNotification, replyLoading } =
    useNotifications();

  // Filter out dismissed popups for rendering
  const activePopups = popups.filter((p) => !p.dismissed).slice(0, 3);

  if (activePopups.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col-reverse gap-3 pointer-events-none">
      {activePopups.map((popup) => (
        <div key={popup.popupId} className="pointer-events-auto">
          <PopupCard
            popup={popup}
            onDismiss={() => dismissPopup(popup.popupId)}
            onMarkRead={() => markAsRead(popup.id)}
            onReply={(text) => replyToNotification(popup.id, text)}
            replyLoading={!!replyLoading[popup.id]}
          />
        </div>
      ))}
    </div>
  );
}
