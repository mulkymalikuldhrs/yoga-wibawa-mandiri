// ============================================================
// NotificationCenter — Full notification panel (Sheet/Drawer)
// Filter by tipe, mark all read, clear all, reply to AI, navigate to module
// ============================================================

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useNotifications } from './NotificationProvider';
import type { Notification, DashboardModule } from '@/types/dashboard';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Bell,
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare,
  ExternalLink,
  Search,
  CheckCheck,
  XCircle,
  Send,
  Loader2,
  Clock,
  Package,
  Wrench,
  Factory,
  ShieldCheck,
  Wallet,
  UserCog,
  FileText,
  BarChart3,
  Users,
} from 'lucide-react';

// ── Tipe config ──
const TIPE_CONFIG: Record<
  string,
  {
    color: string;
    bg: string;
    border: string;
    label: string;
    icon: React.ReactNode;
  }
> = {
  info: {
    color: 'text-cyan-600',
    bg: 'bg-cyan-100/80',
    border: 'border-cyan-200/50',
    label: 'Info',
    icon: <Info size={16} />,
  },
  peringatan: {
    color: 'text-amber-600',
    bg: 'bg-amber-100/80',
    border: 'border-amber-200/50',
    label: 'Peringatan',
    icon: <AlertTriangle size={16} />,
  },
  bahaya: {
    color: 'text-red-600',
    bg: 'bg-red-100/80',
    border: 'border-red-200/50',
    label: 'Bahaya',
    icon: <AlertOctagon size={16} />,
  },
  sukses: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-100/80',
    border: 'border-emerald-200/50',
    label: 'Sukses',
    icon: <CheckCircle2 size={16} />,
  },
};

// ── Module labels ──
const MODULE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  'spare-parts': { label: 'Suku Cadang', icon: <Package size={12} /> },
  maintenance: { label: 'Perawatan', icon: <Wrench size={12} /> },
  production: { label: 'Produksi', icon: <Factory size={12} /> },
  safety: { label: 'Keselamatan', icon: <ShieldCheck size={12} /> },
  finance: { label: 'Keuangan', icon: <Wallet size={12} /> },
  'team-activity': { label: 'Aktivitas Tim', icon: <Users size={12} /> },
  hr: { label: 'SDM', icon: <UserCog size={12} /> },
  documents: { label: 'Dokumen', icon: <FileText size={12} /> },
  analytics: { label: 'Analitik', icon: <BarChart3 size={12} /> },
  overview: { label: 'Ringkasan', icon: <BarChart3 size={12} /> },
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
  if (days < 7) return `${days} hari lalu`;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

// ── Single notification card ──
function NotificationCard({
  notif,
  onMarkRead,
  onDelete,
  onReply,
  onNavigate,
  replyLoading,
}: {
  notif: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
  onReply: (text: string) => void;
  onNavigate: () => void;
  replyLoading: boolean;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const replyInputRef = useRef<HTMLInputElement>(null);

  const tc = TIPE_CONFIG[notif.tipe] || TIPE_CONFIG.info;
  const modInfo = MODULE_LABELS[notif.modul];

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

  return (
    <div
      className={cn(
        'group rounded-xl bg-white/40 border border-white/60 p-4 transition-all duration-200',
        'hover:bg-white/60 hover:border-white/60',
        !notif.dibaca && 'border-l-2 border-l-cyan-500 bg-white/50'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
            tc.bg,
            tc.color
          )}
        >
          {tc.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4
                className={cn(
                  'text-sm font-medium leading-tight line-clamp-1',
                  notif.dibaca ? 'text-slate-500' : 'text-slate-800'
                )}
              >
                {notif.judul}
              </h4>
              <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                {notif.pesan}
              </p>
            </div>
            {/* Tipe badge */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0',
                tc.bg,
                tc.color
              )}
            >
              {tc.label}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Clock size={10} />
              <span>{relativeTime(notif.createdAt)}</span>
            </div>
            {modInfo && (
              <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                {modInfo.icon}
                <span>{modInfo.label}</span>
              </div>
            )}
            {!notif.dibaca && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2 mt-3">
            {!notif.dibaca && (
              <button
                onClick={onMarkRead}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 text-slate-400 text-[11px] hover:bg-white/60 hover:text-slate-500 transition-all"
              >
                <Eye size={10} />
                Tandai Dibaca
              </button>
            )}
            {notif.dibaca && (
              <button
                onClick={onMarkRead}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 text-slate-400 text-[11px] hover:bg-white/60 hover:text-slate-500 transition-all"
              >
                <EyeOff size={10} />
                Belum Dibaca
              </button>
            )}
            <button
              onClick={() => setShowReply((p) => !p)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all',
                showReply
                  ? 'bg-cyan-100/80 text-cyan-600'
                  : 'bg-white/50 text-slate-400 hover:bg-white/60 hover:text-slate-500'
              )}
            >
              <MessageSquare size={10} />
              Balas AI
            </button>
            <button
              onClick={onNavigate}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 text-slate-400 text-[11px] hover:bg-white/60 hover:text-slate-500 transition-all"
            >
              <ExternalLink size={10} />
              Buka
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 text-red-600/40 text-[11px] hover:bg-red-50/80 hover:text-red-600 transition-all ml-auto"
            >
              <Trash2 size={10} />
            </button>
          </div>

          {/* Reply input */}
          {showReply && (
            <div className="mt-3">
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
    </div>
  );
}

// ── NotificationCenter (Sheet panel) ──
export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    centerOpen,
    setCenterOpen,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAll,
    replyToNotification,
    replyLoading,
    navigateToModule,
  } = useNotifications();

  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<
    '' | 'unread' | 'read'
  >('');

  // ── Filtered list ──
  const filtered = notifications.filter((n) => {
    const matchSearch = search
      ? n.judul.toLowerCase().includes(search.toLowerCase()) ||
        n.pesan.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchTipe = filterTipe ? n.tipe === filterTipe : true;
    const matchStatus = filterStatus
      ? filterStatus === 'unread'
        ? !n.dibaca
        : n.dibaca
      : true;
    return matchSearch && matchTipe && matchStatus;
  });

  // ── Handle navigate to module ──
  const handleNavigate = useCallback(
    (notif: Notification) => {
      if (navigateToModule && notif.modul) {
        navigateToModule(notif.modul as DashboardModule);
      }
      setCenterOpen(false);
    },
    [navigateToModule, setCenterOpen]
  );

  // ── Stats ──
  const dangerCount = notifications.filter(
    (n) => n.tipe === 'bahaya' && !n.dibaca
  ).length;
  const warningCount = notifications.filter(
    (n) => n.tipe === 'peringatan' && !n.dibaca
  ).length;
  const successCount = notifications.filter(
    (n) => n.tipe === 'sukses' && !n.dibaca
  ).length;

  return (
    <Sheet open={centerOpen} onOpenChange={setCenterOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[460px] bg-white/90 backdrop-blur-2xl border-l border-white/60 p-0 flex flex-col"
      >
        {/* ── Header ── */}
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-white/60 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100/80 flex items-center justify-center">
                <Bell size={18} className="text-cyan-600" />
              </div>
              <div>
                <SheetTitle className="text-slate-800 text-base">
                  Pusat Notifikasi
                </SheetTitle>
                <SheetDescription className="text-slate-400 text-xs">
                  {unreadCount > 0
                    ? `${unreadCount} notifikasi belum dibaca`
                    : 'Semua notifikasi sudah dibaca'}
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-3">
            {dangerCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50/80 border border-red-200/50">
                <AlertOctagon size={12} className="text-red-600" />
                <span className="text-red-600 text-xs font-medium">
                  {dangerCount} Bahaya
                </span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200/50">
                <AlertTriangle size={12} className="text-amber-600" />
                <span className="text-amber-600 text-xs font-medium">
                  {warningCount} Peringatan
                </span>
              </div>
            )}
            {successCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/50">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span className="text-emerald-600 text-xs font-medium">
                  {successCount} Sukses
                </span>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* ── Search & Filters ── */}
        <div className="px-5 py-3 border-b border-white/60 flex-shrink-0 space-y-2">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari notifikasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-white/50 border border-white/60 rounded-xl text-slate-800 text-xs placeholder:text-slate-400 focus:border-cyan-200/50 focus:outline-none transition-all"
            />
          </div>

          {/* Tipe filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterTipe('')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all',
                !filterTipe
                  ? 'bg-white/60 text-slate-800 border border-slate-200/50'
                  : 'bg-white/40 text-slate-400 hover:bg-white/50 border border-transparent'
              )}
            >
              Semua
            </button>
            {Object.entries(TIPE_CONFIG).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setFilterTipe(filterTipe === key ? '' : key)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1',
                  filterTipe === key
                    ? `${val.bg} ${val.color} border ${val.border}`
                    : 'bg-white/40 text-slate-400 hover:bg-white/50 border border-transparent'
                )}
              >
                {React.cloneElement(val.icon as React.ReactElement, {
                  size: 10,
                })}
                {val.label}
              </button>
            ))}

            <div className="w-px h-4 bg-white/60 mx-1" />

            {/* Status filters */}
            <button
              onClick={() =>
                setFilterStatus(filterStatus === 'unread' ? '' : 'unread')
              }
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all',
                filterStatus === 'unread'
                  ? 'bg-cyan-50/80 text-cyan-600 border border-cyan-200/50'
                  : 'bg-white/40 text-slate-400 hover:bg-white/50 border border-transparent'
              )}
            >
              Belum Dibaca
            </button>
            <button
              onClick={() =>
                setFilterStatus(filterStatus === 'read' ? '' : 'read')
              }
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all',
                filterStatus === 'read'
                  ? 'bg-white/60 text-slate-600 border border-slate-200/50'
                  : 'bg-white/40 text-slate-400 hover:bg-white/50 border border-transparent'
              )}
            >
              Sudah Dibaca
            </button>
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px]">
              {filtered.length} notifikasi
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/40 text-slate-400 text-[10px] hover:bg-white/50 hover:text-slate-500 transition-all"
                >
                  <CheckCheck size={10} />
                  Tandai Semua Dibaca
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/40 text-red-600/30 text-[10px] hover:bg-red-50/80 hover:text-red-600 transition-all"
                >
                  <XCircle size={10} />
                  Hapus Semua
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Notification list ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell size={40} className="text-slate-800/10 mb-3" />
              <p className="text-slate-400 text-sm">
                {search || filterTipe || filterStatus
                  ? 'Tidak ada notifikasi yang cocok'
                  : 'Belum ada notifikasi'}
              </p>
              {(search || filterTipe || filterStatus) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setFilterTipe('');
                    setFilterStatus('');
                  }}
                  className="mt-2 text-cyan-600/60 text-xs hover:text-cyan-600 transition-colors"
                >
                  Hapus filter
                </button>
              )}
            </div>
          ) : (
            filtered.map((notif) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onMarkRead={() => markAsRead(notif.id)}
                onDelete={() => deleteNotification(notif.id)}
                onReply={(text) => replyToNotification(notif.id, text)}
                onNavigate={() => handleNavigate(notif)}
                replyLoading={!!replyLoading[notif.id]}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
