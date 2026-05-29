// ============================================================
// SafetyModule — Keselamatan / HSE
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, generateId, formatTanggal, exportToCSV } from '@/lib/dashboard-storage';
import { KV_PREFIXES, type SafetyIncident } from '@/types/dashboard';
import {
  Plus, Download, Search, ShieldCheck, AlertTriangle, ShieldAlert, Calendar, Edit2, Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  fatal: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Fatal' },
  berat: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Berat' },
  sedang: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Sedang' },
  ringan: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Ringan' },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  dilaporkan: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Dilaporkan' },
  investigasi: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Investigasi' },
  selesai: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Selesai' },
  ditutup: { color: 'text-white/40', bg: 'bg-white/5', label: 'Ditutup' },
};

const EMPTY_FORM: Omit<SafetyIncident, 'id' | 'createdAt' | 'updatedAt'> = {
  judul: '', tanggal: new Date().toISOString().split('T')[0], lokasi: '',
  severity: 'ringan', status: 'dilaporkan', pelapor: '', korban: '-',
  deskripsi: '', tindakan: '',
};

export default function SafetyModule() {
  const [data, setData] = useState<SafetyIncident[]>([]);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SafetyIncident | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(() => { setData(getData<SafetyIncident>(KV_PREFIXES.safety)); }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter((item) => {
    const matchSearch = search ? item.judul.toLowerCase().includes(search.toLowerCase()) || item.lokasi.toLowerCase().includes(search.toLowerCase()) : true;
    const matchSeverity = filterSeverity ? item.severity === filterSeverity : true;
    return matchSearch && matchSeverity;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCount = data.filter((d) => d.status !== 'ditutup' && d.status !== 'selesai').length;
  const criticalCount = data.filter((d) => (d.severity === 'fatal' || d.severity === 'berat') && d.status !== 'ditutup').length;

  // Calculate days without fatal incident
  const fatalIncidents = data.filter((d) => d.severity === 'fatal');
  const daysSinceFatal = fatalIncidents.length > 0
    ? Math.floor((Date.now() - new Date(Math.max(...fatalIncidents.map((f) => new Date(f.tanggal).getTime()))).getTime()) / (1000 * 60 * 60 * 24))
    : 365; // Default to 365 if no fatal incidents

  const handleSave = () => {
    if (!form.judul) return;
    if (editingItem) {
      saveData(KV_PREFIXES.safety, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.safety, { ...form, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setDialogOpen(false); setEditingItem(null); setForm(EMPTY_FORM); loadData();
  };

  const handleDelete = (id: string) => { deleteData(KV_PREFIXES.safety, id); setDeleteConfirm(null); loadData(); };
  const handleEdit = (item: SafetyIncident) => {
    setEditingItem(item);
    setForm({ judul: item.judul, tanggal: item.tanggal, lokasi: item.lokasi, severity: item.severity, status: item.status, pelapor: item.pelapor, korban: item.korban, deskripsi: item.deskripsi, tindakan: item.tindakan });
    setDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Keselamatan (HSE)</h1>
          <p className="text-white/40 text-sm mt-1">Pencatatan insiden dan pelaporan keselamatan kerja</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest), 'hse-ywm')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white/70 hover:bg-white/10 text-sm transition-all"><Download size={16} /> Ekspor</button>
          <button onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm hover:opacity-90 transition-all"><Plus size={16} /> Lapor Insiden</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center"><ShieldCheck size={18} className="text-emerald-400" /></div>
            <div><p className="text-xl font-bold text-white">{daysSinceFatal}</p><p className="text-white/40 text-xs">Hari Tanpa Insiden Fatal</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center"><AlertTriangle size={18} className="text-amber-400" /></div>
            <div><p className="text-xl font-bold text-white">{openCount}</p><p className="text-white/40 text-xs">Insiden Terbuka</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center"><ShieldAlert size={18} className="text-red-400" /></div>
            <div><p className="text-xl font-bold text-white">{criticalCount}</p><p className="text-white/40 text-xs">Fatal/Berat</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center"><Calendar size={18} className="text-blue-400" /></div>
            <div><p className="text-xl font-bold text-white">{data.length}</p><p className="text-white/40 text-xs">Total Insiden</p></div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Cari judul atau lokasi..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none" />
          </div>
          <select value={filterSeverity} onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[150px]">
            <option value="" className="bg-[#0f0c29]">Semua Severity</option>
            {Object.entries(SEVERITY_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-[#0f0c29]">{v.label}</option>)}
          </select>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/40 font-medium">Judul</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Tanggal</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Lokasi</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Severity</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Pelapor</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Korban</th>
                <th className="text-right px-4 py-3 text-white/40 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-white/30">Tidak ada data insiden</td></tr>
              ) : (
                paged.map((item) => {
                  const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.ringan;
                  const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.dilaporkan;
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{item.judul}</td>
                      <td className="px-4 py-3 text-white/50">{formatTanggal(item.tanggal)}</td>
                      <td className="px-4 py-3 text-white/50">{item.lokasi}</td>
                      <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', sev.bg, sev.color)}>{sev.label}</span></td>
                      <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', st.bg, st.color)}>{st.label}</span></td>
                      <td className="px-4 py-3 text-white/50">{item.pelapor}</td>
                      <td className="px-4 py-3 text-white/50">{item.korban || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-cyan-400 transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-white/30 text-xs">Halaman {page} dari {totalPages} ({filtered.length} item)</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 disabled:opacity-30">Sebelumnya</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 disabled:opacity-30">Berikutnya</button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0f0c29] border-white/10 backdrop-blur-xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingItem ? 'Edit Insiden' : 'Lapor Insiden'}</DialogTitle>
            <DialogDescription className="text-white/40">{editingItem ? 'Perbarui data insiden' : 'Laporkan insiden keselamatan baru'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Judul Insiden *</label>
              <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none" placeholder="Deskripsi singkat insiden" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Lokasi</label>
                <input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none" placeholder="Area Packer A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Severity</label>
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as SafetyIncident['severity'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {Object.entries(SEVERITY_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-[#0f0c29]">{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SafetyIncident['status'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-[#0f0c29]">{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Pelapor</label>
                <input value={form.pelapor} onChange={(e) => setForm({ ...form, pelapor: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Korban</label>
                <input value={form.korban} onChange={(e) => setForm({ ...form, korban: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none" placeholder="-" />
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Deskripsi</label>
              <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={2} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Tindakan</label>
              <textarea value={form.tindakan} onChange={(e) => setForm({ ...form, tindakan: e.target.value })} rows={2} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none resize-none" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white/70 text-sm hover:bg-white/10 transition-all">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all">Simpan</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#0f0c29] border-white/10 backdrop-blur-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Hapus Insiden?</DialogTitle>
            <DialogDescription className="text-white/40">Data yang dihapus tidak dapat dikembalikan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white/70 text-sm hover:bg-white/10 transition-all">Batal</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="px-4 py-2 rounded-xl bg-red-500/80 text-white text-sm hover:bg-red-500 transition-all">Hapus</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
