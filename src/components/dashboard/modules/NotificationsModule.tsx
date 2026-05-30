// ============================================================
// NotificationsModule — Notifikasi
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, formatTanggal } from '@/lib/supabase-data';
import { KV_PREFIXES, type Notification } from '@/types/dashboard';
import {
  Search, Bell, Info, AlertTriangle, AlertOctagon, CheckCircle2, Eye, EyeOff, Trash2, MessageSquare, ExternalLink,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import DeleteConfirmDialog from '@/components/dashboard/DeleteConfirmDialog';

const TIPE_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  info: { color: 'text-cyan-600', bg: 'bg-cyan-100/80', label: 'Info', icon: <Info size={16} /> },
  peringatan: { color: 'text-amber-600', bg: 'bg-amber-100/80', label: 'Peringatan', icon: <AlertTriangle size={16} /> },
  bahaya: { color: 'text-red-600', bg: 'bg-red-100/80', label: 'Bahaya', icon: <AlertOctagon size={16} /> },
  sukses: { color: 'text-emerald-600', bg: 'bg-emerald-100/80', label: 'Sukses', icon: <CheckCircle2 size={16} /> },
};

export default function NotificationsModule() {
  const [data, setData] = useState<Notification[]>([]);
  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState('');
  const [filterDibaca, setFilterDibaca] = useState('');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<Notification>(KV_PREFIXES.notification);
    // Sort by createdAt desc
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setData(items);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter((item) => {
    const matchSearch = search ? item.judul.toLowerCase().includes(search.toLowerCase()) || item.pesan.toLowerCase().includes(search.toLowerCase()) : true;
    const matchTipe = filterTipe ? item.tipe === filterTipe : true;
    const matchDibaca = filterDibaca === 'unread' ? !item.dibaca : filterDibaca === 'read' ? item.dibaca : true;
    return matchSearch && matchTipe && matchDibaca;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const unreadCount = data.filter((d) => !d.dibaca).length;
  const dangerCount = data.filter((d) => d.tipe === 'bahaya' && !d.dibaca).length;
  const warningCount = data.filter((d) => d.tipe === 'peringatan' && !d.dibaca).length;

  const handleToggleRead = (item: Notification) => {
    saveData(KV_PREFIXES.notification, { ...item, dibaca: !item.dibaca });
    loadData();
  };

  const handleMarkAllRead = () => {
    data.filter((d) => !d.dibaca).forEach((d) => {
      saveData(KV_PREFIXES.notification, { ...d, dibaca: true });
    });
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteData(KV_PREFIXES.notification, id);
    setDeleteConfirm(null);
    loadData();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Notifikasi</strong> — Pusat notifikasi sistem yang menampilkan peringatan stok rendah, work order overdue, insiden keselamatan, dan informasi penting lainnya secara real-time.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span>Memuat data...</span>
          </div>
        </div>
      ) : (<>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Notifikasi</h1>
          <p className="text-slate-400 text-sm mt-1">Pemberitahuan dan peringatan sistem</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 hover:bg-white/50 text-sm transition-all">
              <Eye size={16} /> Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100/80 flex items-center justify-center"><Bell size={18} className="text-orange-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{unreadCount}</p><p className="text-slate-400 text-xs">Belum Dibaca</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100/80 flex items-center justify-center"><AlertOctagon size={18} className="text-red-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{dangerCount}</p><p className="text-slate-400 text-xs">Bahaya</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center"><AlertTriangle size={18} className="text-amber-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{warningCount}</p><p className="text-slate-400 text-xs">Peringatan</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100/80 flex items-center justify-center"><Info size={18} className="text-cyan-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{data.length}</p><p className="text-slate-400 text-xs">Total Notifikasi</p></div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari judul atau pesan..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" />
          </div>
          <select value={filterTipe} onChange={(e) => { setFilterTipe(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[130px]">
            <option value="" className="bg-white/90">Semua Tipe</option>
            {Object.entries(TIPE_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-white/90">{v.label}</option>)}
          </select>
          <select value={filterDibaca} onChange={(e) => { setFilterDibaca(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[130px]">
            <option value="" className="bg-white/90">Semua Status</option>
            <option value="unread" className="bg-white/90">Belum Dibaca</option>
            <option value="read" className="bg-white/90">Sudah Dibaca</option>
          </select>
        </div>
      </GlassCard>

      {/* Notification List */}
      <div className="space-y-2">
        {paged.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Bell size={32} className="text-slate-800/10 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Tidak ada notifikasi</p>
          </GlassCard>
        ) : (
          paged.map((item) => {
            const tc = TIPE_CONFIG[item.tipe] || TIPE_CONFIG.info;
            return (
              <GlassCard
                key={item.id}
                className={cn(
                  'p-4 transition-all cursor-pointer',
                  !item.dibaca ? 'border-l-2 border-l-cyan-500/50' : 'opacity-60',
                  'hover:bg-white/50'
                )}
                onClick={() => { setSelectedNotif(item); if (!item.dibaca) handleToggleRead(item); }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', tc.bg, tc.color)}>
                    {tc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={cn('text-sm font-medium', !item.dibaca ? 'text-slate-800' : 'text-slate-500')}>{item.judul}</h3>
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{item.pesan}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', tc.bg, tc.color)}>{tc.label}</span>
                        {!item.dibaca && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-slate-800/20 text-[10px]">{formatTanggal(item.createdAt)}</span>
                      <span className="text-slate-800/20 text-[10px]">Modul: {item.modul}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30">Sebelumnya</button>
          <span className="text-slate-400 text-xs">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30">Berikutnya</button>
        </div>
      )}

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotif} onOpenChange={() => setSelectedNotif(null)}>
        <DialogContent className="bg-white/90 border-white/60 backdrop-blur-xl max-w-md">
          {selectedNotif && (() => {
            const tc = TIPE_CONFIG[selectedNotif.tipe] || TIPE_CONFIG.info;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', tc.bg, tc.color)}>{tc.icon}</div>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', tc.bg, tc.color)}>{tc.label}</span>
                  </div>
                  <DialogTitle className="text-slate-800 text-lg">{selectedNotif.judul}</DialogTitle>
                  <DialogDescription className="text-slate-400 text-sm mt-2">{selectedNotif.pesan}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Waktu</span>
                    <span className="text-slate-500">{formatTanggal(selectedNotif.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Modul</span>
                    <span className="text-slate-500">{selectedNotif.modul}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className={selectedNotif.dibaca ? 'text-slate-400' : 'text-cyan-600'}>{selectedNotif.dibaca ? 'Sudah dibaca' : 'Belum dibaca'}</span>
                  </div>
                </div>
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <div className="flex gap-2 w-full">
                    <button onClick={() => handleToggleRead(selectedNotif)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 text-sm hover:bg-white/50 transition-all">
                      {selectedNotif.dibaca ? <EyeOff size={14} /> : <Eye size={14} />}
                      {selectedNotif.dibaca ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 text-sm hover:bg-white/50 transition-all">
                      <MessageSquare size={14} /> Tanya AI
                    </button>
                  </div>
                  {selectedNotif.link && (
                    <a href={selectedNotif.link} className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all">
                      <ExternalLink size={14} /> Buka Modul Terkait
                    </a>
                  )}
                  <button onClick={() => { setDeleteConfirm(selectedNotif.id); setSelectedNotif(null); }} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-600/60 text-xs hover:text-red-600 hover:bg-red-50/80 transition-all">
                    <Trash2 size={12} /> Hapus Notifikasi
                  </button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Hapus Notifikasi?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />
      </>)}
    </div>
  );
}
