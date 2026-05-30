// ============================================================
// TeamActivityModule — Aktivitas Tim / Kehadiran
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, generateId, exportToCSV } from '@/lib/supabase-data';
import { KV_PREFIXES, type TeamActivity } from '@/types/dashboard';
import {
  Plus,
  Download,
  Search,
  Users,
  UserCheck,
  UserX,
  Clock,
  Edit2,
  Trash2,
  UserPlus,
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

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  hadir: { color: 'text-emerald-600', bg: 'bg-emerald-100/80', label: 'Hadir' },
  izin: { color: 'text-amber-600', bg: 'bg-amber-100/80', label: 'Izin' },
  sakit: { color: 'text-orange-600', bg: 'bg-orange-100/80', label: 'Sakit' },
  alpha: { color: 'text-red-600', bg: 'bg-red-100/80', label: 'Alpha' },
  lembur: { color: 'text-blue-600', bg: 'bg-blue-100/80', label: 'Lembur' },
};

const DIVISI_OPTIONS = ['Produksi', 'Perawatan', 'Keuangan', 'SDM', 'Logistik', 'Umum'];

const EMPTY_FORM: Omit<TeamActivity, 'id' | 'createdAt' | 'updatedAt'> = {
  namaKaryawan: '',
  divisi: 'Produksi',
  aktivitas: '',
  status: 'hadir',
  jamMasuk: '07:00',
  jamKeluar: '15:00',
  tanggal: new Date().toISOString().split('T')[0],
  catatan: '',
};

export default function TeamActivityModule() {
  const [data, setData] = useState<TeamActivity[]>([]);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamActivity | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<TeamActivity>(KV_PREFIXES.teamActivity);
    setData(items);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter((item) => {
    const matchSearch = search
      ? item.namaKaryawan.toLowerCase().includes(search.toLowerCase()) ||
        item.divisi.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchDate = filterDate ? item.tanggal === filterDate : true;
    return matchSearch && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Summary stats for selected date
  const dateData = data.filter((d) => d.tanggal === filterDate);
  const hadirCount = dateData.filter((d) => d.status === 'hadir').length;
  const lemburCount = dateData.filter((d) => d.status === 'lembur').length;
  const izinCount = dateData.filter((d) => d.status === 'izin').length;
  const alphaCount = dateData.filter((d) => d.status === 'alpha').length;

  const handleSave = () => {
    if (!form.namaKaryawan) return;
    if (editingItem) {
      saveData(KV_PREFIXES.teamActivity, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.teamActivity, { ...form, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setDialogOpen(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteData(KV_PREFIXES.teamActivity, id);
    setDeleteConfirm(null);
    loadData();
  };

  const handleEdit = (item: TeamActivity) => {
    setEditingItem(item);
    setForm({ namaKaryawan: item.namaKaryawan, divisi: item.divisi, aktivitas: item.aktivitas, status: item.status, jamMasuk: item.jamMasuk, jamKeluar: item.jamKeluar, tanggal: item.tanggal, catatan: item.catatan });
    setDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Aktivitas Tim</strong> — Pencatatan kehadiran dan aktivitas karyawan harian. Lacak status kehadiran, jam kerja, lembur, dan koordinasi shift kerja operasional.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Aktivitas Tim</h1>
          <p className="text-slate-400 text-sm mt-1">Pencatatan kehadiran dan aktivitas karyawan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest), 'aktivitas-tim')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 hover:bg-white/50 text-sm transition-all">
            <Download size={16} /> Ekspor
          </button>
          <button onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all">
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center">
              <UserCheck size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{hadirCount}</p>
              <p className="text-slate-400 text-xs">Hadir</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100/80 flex items-center justify-center">
              <Clock size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{lemburCount}</p>
              <p className="text-slate-400 text-xs">Lembur</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center">
              <UserPlus size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{izinCount}</p>
              <p className="text-slate-400 text-xs">Izin</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100/80 flex items-center justify-center">
              <UserX size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{alphaCount}</p>
              <p className="text-slate-400 text-xs">Alpha</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari karyawan atau divisi..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" />
          </div>
          <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Karyawan</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Divisi</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Aktivitas</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Jam Masuk</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Jam Keluar</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Catatan</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">Tidak ada data</td></tr>
              ) : (
                paged.map((item) => {
                  const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.hadir;
                  return (
                    <tr key={item.id} className="border-b border-white/60 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 text-slate-800 font-medium">{item.namaKaryawan}</td>
                      <td className="px-4 py-3 text-slate-500">{item.divisi}</td>
                      <td className="px-4 py-3 text-slate-500">{item.aktivitas}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', sc.bg, sc.color)}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{item.jamMasuk}</td>
                      <td className="px-4 py-3 text-slate-500">{item.jamKeluar}</td>
                      <td className="px-4 py-3 text-slate-400 max-w-[150px] truncate">{item.catatan || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-white/50 text-slate-400 hover:text-cyan-600 transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg hover:bg-white/50 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/60">
            <span className="text-slate-400 text-xs">Halaman {page} dari {totalPages} ({filtered.length} item)</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30">Sebelumnya</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30">Berikutnya</button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white/90 border-white/60 backdrop-blur-xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">{editingItem ? 'Edit Aktivitas' : 'Tambah Aktivitas'}</DialogTitle>
            <DialogDescription className="text-slate-400">{editingItem ? 'Perbarui data aktivitas' : 'Isi data aktivitas karyawan'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Nama Karyawan *</label>
              <input value={form.namaKaryawan} onChange={(e) => setForm({ ...form, namaKaryawan: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Nama karyawan" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Divisi</label>
                <select value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {DIVISI_OPTIONS.map((d) => <option key={d} value={d} className="bg-white/90">{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TeamActivity['status'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-white/90">{v.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Aktivitas</label>
              <input value={form.aktivitas} onChange={(e) => setForm({ ...form, aktivitas: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Deskripsi aktivitas" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Jam Masuk</label>
                <input type="time" value={form.jamMasuk} onChange={(e) => setForm({ ...form, jamMasuk: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Jam Keluar</label>
                <input type="time" value={form.jamKeluar} onChange={(e) => setForm({ ...form, jamKeluar: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Catatan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={2} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none resize-none" />
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
        title="Hapus Aktivitas?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />
      </>)}
    </div>
  );
}
