// ============================================================
// MaintenanceModule — Perawatan / Work Orders
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, generateId, formatRupiah, formatTanggal, exportToCSV } from '@/lib/dashboard-storage';
import { KV_PREFIXES, type MaintenanceRecord } from '@/types/dashboard';
import {
  Plus, Download, Search, Wrench, AlertTriangle, CheckCircle2, Clock, Edit2, Trash2,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

const PRIORITAS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  kritis: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Kritis' },
  tinggi: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Tinggi' },
  sedang: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Sedang' },
  rendah: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Rendah' },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  terjadwal: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Terjadwal' },
  berjalan: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Berjalan' },
  selesai: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Selesai' },
  dibatalkan: { color: 'text-white/40', bg: 'bg-white/5', label: 'Dibatalkan' },
};

const EMPTY_FORM: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
  judul: '', mesin: '', jenis: 'preventif', prioritas: 'sedang', status: 'terjadwal',
  tanggalMulai: new Date().toISOString().split('T')[0], tanggalSelesai: '',
  teknisi: '', estimasiBiaya: 0, catatan: '',
};

export default function MaintenanceModule() {
  const [data, setData] = useState<MaintenanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(() => { setData(getData<MaintenanceRecord>(KV_PREFIXES.maintenance)); }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter((item) => {
    const matchSearch = search ? item.judul.toLowerCase().includes(search.toLowerCase()) || item.mesin.toLowerCase().includes(search.toLowerCase()) : true;
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const activeCount = data.filter((d) => d.status === 'berjalan').length;
  const scheduledCount = data.filter((d) => d.status === 'terjadwal').length;
  const completedCount = data.filter((d) => d.status === 'selesai').length;
  const criticalCount = data.filter((d) => d.prioritas === 'kritis' && d.status !== 'selesai' && d.status !== 'dibatalkan').length;
  const totalEstCost = data.filter((d) => d.status === 'berjalan' || d.status === 'terjadwal').reduce((s, d) => s + d.estimasiBiaya, 0);

  // Overdue detection
  const today = new Date().toISOString().split('T')[0];
  const overdueItems = data.filter((d) => d.status === 'terjadwal' && d.tanggalMulai < today);

  const handleSave = () => {
    if (!form.judul || !form.mesin) return;
    if (editingItem) {
      saveData(KV_PREFIXES.maintenance, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.maintenance, { ...form, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setDialogOpen(false); setEditingItem(null); setForm(EMPTY_FORM); loadData();
  };

  const handleDelete = (id: string) => { deleteData(KV_PREFIXES.maintenance, id); setDeleteConfirm(null); loadData(); };

  const handleEdit = (item: MaintenanceRecord) => {
    setEditingItem(item);
    setForm({ judul: item.judul, mesin: item.mesin, jenis: item.jenis, prioritas: item.prioritas, status: item.status, tanggalMulai: item.tanggalMulai, tanggalSelesai: item.tanggalSelesai, teknisi: item.teknisi, estimasiBiaya: item.estimasiBiaya, catatan: item.catatan });
    setDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Perawatan</h1>
          <p className="text-white/40 text-sm mt-1">Kelola Work Order perawatan mesin dan peralatan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest), 'perawatan-ywm')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white/70 hover:bg-white/10 text-sm transition-all"><Download size={16} /> Ekspor</button>
          <button onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all"><Plus size={16} /> Buat WO</button>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueItems.length > 0 && (
        <GlassCard variant="danger" className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium text-sm">{overdueItems.length} Work Order Terlambat</p>
              <p className="text-white/40 text-xs">Jadwal sudah lewat namun belum dimulai: {overdueItems.map((o) => o.judul).join(', ')}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center"><Wrench size={18} className="text-amber-400" /></div>
            <div><p className="text-xl font-bold text-white">{activeCount}</p><p className="text-white/40 text-xs">Berjalan</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center"><Clock size={18} className="text-blue-400" /></div>
            <div><p className="text-xl font-bold text-white">{scheduledCount}</p><p className="text-white/40 text-xs">Terjadwal</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 size={18} className="text-emerald-400" /></div>
            <div><p className="text-xl font-bold text-white">{completedCount}</p><p className="text-white/40 text-xs">Selesai</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center"><AlertTriangle size={18} className="text-red-400" /></div>
            <div><p className="text-xl font-bold text-white">{criticalCount}</p><p className="text-white/40 text-xs">Kritis</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center"><Wrench size={18} className="text-purple-400" /></div>
            <div><p className="text-lg font-bold text-white">{formatRupiah(totalEstCost)}</p><p className="text-white/40 text-xs">Estimasi Biaya</p></div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Cari judul atau mesin..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none" />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[150px]">
            <option value="" className="bg-[#0f0c29]">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-[#0f0c29]">{v.label}</option>)}
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
                <th className="text-left px-4 py-3 text-white/40 font-medium">Mesin</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Jenis</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Prioritas</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Mulai</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Teknisi</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Est. Biaya</th>
                <th className="text-right px-4 py-3 text-white/40 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-white/30">Tidak ada data</td></tr>
              ) : (
                paged.map((item) => {
                  const pc = PRIORITAS_CONFIG[item.prioritas] || PRIORITAS_CONFIG.sedang;
                  const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.terjadwal;
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{item.judul}</td>
                      <td className="px-4 py-3 text-white/60">{item.mesin}</td>
                      <td className="px-4 py-3 text-white/50 capitalize">{item.jenis}</td>
                      <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', pc.bg, pc.color)}>{pc.label}</span></td>
                      <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', sc.bg, sc.color)}>{sc.label}</span></td>
                      <td className="px-4 py-3 text-white/50">{formatTanggal(item.tanggalMulai)}</td>
                      <td className="px-4 py-3 text-white/50">{item.teknisi}</td>
                      <td className="px-4 py-3 text-white/70">{formatRupiah(item.estimasiBiaya)}</td>
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
            <DialogTitle className="text-white">{editingItem ? 'Edit Work Order' : 'Buat Work Order'}</DialogTitle>
            <DialogDescription className="text-white/40">{editingItem ? 'Perbarui data WO' : 'Isi data work order baru'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Judul WO *</label>
              <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none" placeholder="Ganti Bearing Packer A2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Mesin *</label>
                <input value={form.mesin} onChange={(e) => setForm({ ...form, mesin: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none" placeholder="Packer A" />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Jenis</label>
                <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as MaintenanceRecord['jenis'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  <option value="preventif" className="bg-[#0f0c29]">Preventif</option>
                  <option value="korektif" className="bg-[#0f0c29]">Korektif</option>
                  <option value="darurat" className="bg-[#0f0c29]">Darurat</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Prioritas</label>
                <select value={form.prioritas} onChange={(e) => setForm({ ...form, prioritas: e.target.value as MaintenanceRecord['prioritas'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {Object.entries(PRIORITAS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-[#0f0c29]">{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MaintenanceRecord['status'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-[#0f0c29]">{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Tanggal Mulai</label>
                <input type="date" value={form.tanggalMulai} onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Tanggal Selesai</label>
                <input type="date" value={form.tanggalSelesai} onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Teknisi</label>
                <input value={form.teknisi} onChange={(e) => setForm({ ...form, teknisi: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none" placeholder="Nama teknisi" />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Estimasi Biaya (Rp)</label>
                <input type="number" value={form.estimasiBiaya} onChange={(e) => setForm({ ...form, estimasiBiaya: Number(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Catatan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={2} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:border-cyan-500/40 focus:outline-none resize-none" />
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
            <DialogTitle className="text-white">Hapus Work Order?</DialogTitle>
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
