// ============================================================
// PispotModule — Pompa Gemik Bearing / Lubrikasi / Pelumasan
// Checklist siklus bulanan untuk pelumasan dan perawatan bearing/pompa
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, generateId, exportToCSV } from '@/lib/supabase-data';
import { KV_PREFIXES, type PispotRecord } from '@/types/dashboard';
import {
  Plus,
  Download,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import DeleteConfirmDialog from '@/components/dashboard/DeleteConfirmDialog';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  terjadwal: { color: 'text-cyan-600', bg: 'bg-cyan-100/80', label: 'Terjadwal', icon: <Clock size={14} /> },
  selesai: { color: 'text-emerald-600', bg: 'bg-emerald-100/80', label: 'Selesai', icon: <CheckCircle2 size={14} /> },
  terlewat: { color: 'text-red-600', bg: 'bg-red-100/80', label: 'Terlewat', icon: <AlertTriangle size={14} /> },
};

const KONDISI_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  baik: { color: 'text-emerald-600', bg: 'bg-emerald-100/80', label: 'Baik' },
  perlu_perhatian: { color: 'text-amber-600', bg: 'bg-amber-100/80', label: 'Perlu Perhatian' },
  rusak: { color: 'text-red-600', bg: 'bg-red-100/80', label: 'Rusak' },
};

const PERIODE_OPTIONS = ['bulanan', '2-mingguan', 'mingguan', 'kuartalan'];
const STATUS_OPTIONS: Array<PispotRecord['status']> = ['terjadwal', 'selesai', 'terlewat'];
const KONDISI_OPTIONS: Array<PispotRecord['kondisi']> = ['baik', 'perlu_perhatian', 'rusak'];

const EMPTY_FORM: Omit<PispotRecord, 'id' | 'createdAt' | 'updatedAt'> = {
  namaPeralatan: '',
  kodePeralatan: '',
  lokasi: '',
  jenisPelumas: '',
  spesifikasi: '',
  volume: '',
  periode: 'bulanan',
  bulan: new Date().toISOString().slice(0, 7),
  tanggalPelaksanaan: '',
  petugas: '',
  status: 'terjadwal',
  kondisi: 'baik',
  catatan: '',
  tindakLanjut: '',
};

export default function PispotModule() {
  const [data, setData] = useState<PispotRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PispotRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<PispotRecord>(KV_PREFIXES.pispot);
    setData(items);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered data
  const filtered = data.filter((item) => {
    const matchSearch = search
      ? item.namaPeralatan.toLowerCase().includes(search.toLowerCase()) ||
        item.kodePeralatan.toLowerCase().includes(search.toLowerCase()) ||
        item.petugas.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    const matchBulan = filterBulan ? item.bulan === filterBulan : true;
    return matchSearch && matchStatus && matchBulan;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Stats
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthRecords = data.filter((d) => d.bulan === currentMonth);
  const terjadwalCount = thisMonthRecords.filter((d) => d.status === 'terjadwal').length;
  const selesaiCount = thisMonthRecords.filter((d) => d.status === 'selesai').length;
  const terlewatCount = thisMonthRecords.filter((d) => d.status === 'terlewat').length;
  const perluPerhatianCount = thisMonthRecords.filter((d) => d.kondisi === 'perlu_perhatian' || d.kondisi === 'rusak').length;

  // Unique months for filter (used by month input)
  // const uniqueMonths = [...new Set(data.map((d) => d.bulan))].sort().reverse();

  // Calendar data for current month
  const calendarDays = (() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year!, month!, 0).getDate();
    const firstDayOfWeek = new Date(year!, month! - 1, 1).getDay(); // 0=Sun
    const days: Array<{ day: number; items: PispotRecord[] } | null> = [];

    // Fill leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonth}-${String(d).padStart(2, '0')}`;
      const items = thisMonthRecords.filter((r) => r.tanggalPelaksanaan === dateStr);
      days.push({ day: d, items });
    }
    return days;
  })();

  const handleSave = () => {
    if (!form.namaPeralatan || !form.kodePeralatan || !form.bulan) return;
    if (editingItem) {
      saveData(KV_PREFIXES.pispot, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.pispot, {
        ...form,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setDialogOpen(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteData(KV_PREFIXES.pispot, id);
    setDeleteConfirm(null);
    loadData();
  };

  const handleEdit = (item: PispotRecord) => {
    setEditingItem(item);
    setForm({
      namaPeralatan: item.namaPeralatan,
      kodePeralatan: item.kodePeralatan,
      lokasi: item.lokasi,
      jenisPelumas: item.jenisPelumas,
      spesifikasi: item.spesifikasi,
      volume: item.volume,
      periode: item.periode,
      bulan: item.bulan,
      tanggalPelaksanaan: item.tanggalPelaksanaan,
      petugas: item.petugas,
      status: item.status,
      kondisi: item.kondisi,
      catatan: item.catatan,
      tindakLanjut: item.tindakLanjut,
    });
    setDialogOpen(true);
  };

  const handleExport = () => {
    exportToCSV(
      filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest),
      'pispot-pelumasan-ywm'
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description Banner */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Pispot — Pompa Gemik Bearing / Lubrikasi / Pelumasan</strong> — Checklist siklus bulanan untuk pelumasan dan perawatan bearing, pompa, dan komponen mekanis. Pantau jadwal pelumasan, kondisi peralatan, dan pastikan setiap siklus perawatan terlaksana tepat waktu.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Pispot — Pelumasan</h1>
          <p className="text-slate-400 text-sm mt-1">Checklist siklus bulanan pelumasan & perawatan bearing/pompa</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 hover:bg-white/50 text-sm transition-all">
            <Download size={16} /> Ekspor
          </button>
          <button onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all">
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100/80 flex items-center justify-center">
              <Clock size={18} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{terjadwalCount}</p>
              <p className="text-slate-400 text-xs">Terjadwal Bulan Ini</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{selesaiCount}</p>
              <p className="text-slate-400 text-xs">Selesai</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100/80 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{terlewatCount}</p>
              <p className="text-slate-400 text-xs">Terlewat</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center">
              <AlertOctagon size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{perluPerhatianCount}</p>
              <p className="text-slate-400 text-xs">Perlu Perhatian</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Monthly Calendar View */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
            <Calendar size={16} className="text-cyan-500" />
            Kalender Pelumasan — {new Date(currentMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </h2>
          <span className="text-slate-400 text-xs">{thisMonthRecords.length} item bulan ini</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
            <div key={d} className="text-center text-slate-400 text-xs font-medium py-1">{d}</div>
          ))}
          {/* Calendar cells */}
          {calendarDays.map((cell, idx) => (
            <div
              key={idx}
              className={cn(
                'min-h-[48px] p-1 rounded-lg text-xs border border-transparent',
                cell ? 'bg-white/30' : '',
                cell?.items.length ? 'border-cyan-200/50 bg-cyan-50/30' : ''
              )}
            >
              {cell && (
                <>
                  <span className="text-slate-500 font-medium">{cell.day}</span>
                  {cell.items.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {cell.items.slice(0, 2).map((item) => {
                        const sc = STATUS_CONFIG[item.status]!;
                        return (
                          <div key={item.id} className={cn('px-1 py-0.5 rounded text-[9px] truncate', sc.bg, sc.color)} title={item.namaPeralatan}>
                            {item.kodePeralatan}
                          </div>
                        );
                      })}
                      {cell.items.length > 2 && (
                        <div className="text-[9px] text-slate-400 px-1">+{cell.items.length - 2}</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari peralatan, kode, atau petugas..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[130px]"
          >
            <option value="" className="bg-white/90">Semua Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-white/90">{STATUS_CONFIG[s]?.label || s}</option>
            ))}
          </select>
          <input
            type="month"
            value={filterBulan}
            onChange={(e) => { setFilterBulan(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none min-w-[160px]"
          />
        </div>
      </GlassCard>

      {/* Data Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Peralatan</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Kode</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Lokasi</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Jenis Pelumas</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Bulan</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Tgl Pelaksanaan</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Petugas</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Kondisi</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400">Tidak ada data</td>
                </tr>
              ) : (
                paged.map((item) => {
                  const sc = STATUS_CONFIG[item.status]!;
                  const kc = KONDISI_CONFIG[item.kondisi]!;
                  return (
                    <tr key={item.id} className="border-b border-white/60 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 text-slate-800 font-medium">{item.namaPeralatan}</td>
                      <td className="px-4 py-3 text-cyan-600 font-mono text-xs">{item.kodePeralatan}</td>
                      <td className="px-4 py-3 text-slate-500">{item.lokasi}</td>
                      <td className="px-4 py-3 text-slate-500">{item.jenisPelumas}</td>
                      <td className="px-4 py-3 text-slate-500">{item.bulan}</td>
                      <td className="px-4 py-3 text-slate-500">{item.tanggalPelaksanaan}</td>
                      <td className="px-4 py-3 text-slate-500">{item.petugas}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', sc.bg, sc.color)}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', kc.bg, kc.color)}>
                          {kc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-white/50 text-slate-400 hover:text-cyan-600 transition-all" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg hover:bg-white/50 text-slate-400 hover:text-red-600 transition-all" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/60">
            <span className="text-slate-400 text-xs">Halaman {page} dari {totalPages} ({filtered.length} item)</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30 transition-all">Sebelumnya</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30 transition-all">Berikutnya</button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white/90 border-white/60 backdrop-blur-xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">{editingItem ? 'Edit Pispot' : 'Tambah Pispot'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingItem ? 'Perbarui data pelumasan/pemeriksaan' : 'Isi data pelumasan/pemeriksaan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {/* Peralatan info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Nama Peralatan *</label>
                <input value={form.namaPeralatan} onChange={(e) => setForm({ ...form, namaPeralatan: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Bearing Packer A - Nozzle 1" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Kode Peralatan *</label>
                <input value={form.kodePeralatan} onChange={(e) => setForm({ ...form, kodePeralatan: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="BRG-PA1" />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Lokasi</label>
              <input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Packer A" />
            </div>

            {/* Pelumas info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Jenis Pelumas</label>
                <input value={form.jenisPelumas} onChange={(e) => setForm({ ...form, jenisPelumas: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Lithium Grease EP2" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Volume</label>
                <input value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="50 gram" />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Spesifikasi Pelumas</label>
              <input value={form.spesifikasi} onChange={(e) => setForm({ ...form, spesifikasi: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="NLGI Grade 2, -20°C s/d 130°C" />
            </div>

            {/* Jadwal */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Periode</label>
                <select value={form.periode} onChange={(e) => setForm({ ...form, periode: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {PERIODE_OPTIONS.map((p) => <option key={p} value={p} className="bg-white/90">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Bulan *</label>
                <input type="month" value={form.bulan} onChange={(e) => setForm({ ...form, bulan: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Tgl Pelaksanaan</label>
                <input type="date" value={form.tanggalPelaksanaan} onChange={(e) => setForm({ ...form, tanggalPelaksanaan: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>

            {/* Petugas & Status */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Petugas</label>
                <input value={form.petugas} onChange={(e) => setForm({ ...form, petugas: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Budi Santoso" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PispotRecord['status'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-white/90">{STATUS_CONFIG[s]!.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Kondisi</label>
                <select value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value as PispotRecord['kondisi'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {KONDISI_OPTIONS.map((k) => <option key={k} value={k} className="bg-white/90">{KONDISI_CONFIG[k]!.label}</option>)}
                </select>
              </div>
            </div>

            {/* Catatan & Tindak Lanjut */}
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Catatan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={2} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none resize-none" placeholder="Catatan tambahan..." />
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Tindak Lanjut</label>
              <textarea value={form.tindakLanjut} onChange={(e) => setForm({ ...form, tindakLanjut: e.target.value })} rows={2} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none resize-none" placeholder="Tindak lanjut yang diperlukan..." />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 text-sm hover:bg-white/50 transition-all">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all">Simpan</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Hapus Data Pispot?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />
      </>)}
    </div>
  );
}
