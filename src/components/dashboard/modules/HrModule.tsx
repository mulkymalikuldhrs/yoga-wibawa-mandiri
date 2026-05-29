// ============================================================
// HrModule — SDM / Payroll
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, generateId, formatRupiah, formatTanggal, exportToCSV } from '@/lib/supabase-data';
import { KV_PREFIXES, type Employee } from '@/types/dashboard';
import {
  Plus, Download, Search, Users, UserCheck, UserMinus, UserCog, Edit2, Trash2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  aktif: { color: 'text-emerald-600', bg: 'bg-emerald-100/80', label: 'Aktif' },
  cuti: { color: 'text-amber-600', bg: 'bg-amber-100/80', label: 'Cuti' },
  resign: { color: 'text-red-600', bg: 'bg-red-100/80', label: 'Resign' },
};

const DIVISI_OPTIONS = ['Produksi', 'Perawatan', 'Keuangan', 'SDM', 'Logistik', 'Umum'];

const PIE_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];

const EMPTY_FORM: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> = {
  nama: '', nip: '', jabatan: '', divisi: 'Produksi',
  tanggalMasuk: new Date().toISOString().split('T')[0], gajiPokok: 0,
  status: 'aktif', noTelepon: '', email: '', alamat: '',
};

export default function HrModule() {
  const [data, setData] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<Employee>(KV_PREFIXES.employee);
    setData(items);
    setLoading(false);
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter((item) => {
    const matchSearch = search ? item.nama.toLowerCase().includes(search.toLowerCase()) || item.nip.toLowerCase().includes(search.toLowerCase()) : true;
    const matchDivisi = filterDivisi ? item.divisi === filterDivisi : true;
    return matchSearch && matchDivisi;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const activeCount = data.filter((d) => d.status === 'aktif').length;
  const cutiCount = data.filter((d) => d.status === 'cuti').length;
  const resignCount = data.filter((d) => d.status === 'resign').length;
  const totalGaji = data.filter((d) => d.status === 'aktif').reduce((s, d) => s + d.gajiPokok, 0);

  // Department distribution for pie chart
  const deptCounts: Record<string, number> = {};
  data.filter((d) => d.status === 'aktif').forEach((d) => {
    deptCounts[d.divisi] = (deptCounts[d.divisi] || 0) + 1;
  });
  const pieData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-white/90 border border-white/60 rounded-lg px-3 py-2 text-xs">
          <p className="text-slate-600">{payload[0].name}: {payload[0].value} orang</p>
        </div>
      );
    }
    return null;
  };

  const handleSave = () => {
    if (!form.nama || !form.nip) return;
    if (editingItem) {
      saveData(KV_PREFIXES.employee, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.employee, { ...form, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setDialogOpen(false); setEditingItem(null); setForm(EMPTY_FORM); loadData();
  };

  const handleDelete = (id: string) => { deleteData(KV_PREFIXES.employee, id); setDeleteConfirm(null); loadData(); };
  const handleEdit = (item: Employee) => {
    setEditingItem(item);
    setForm({ nama: item.nama, nip: item.nip, jabatan: item.jabatan, divisi: item.divisi, tanggalMasuk: item.tanggalMasuk, gajiPokok: item.gajiPokok, status: item.status, noTelepon: item.noTelepon, email: item.email, alamat: item.alamat });
    setDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>SDM / Payroll</strong> — Manajemen data karyawan dan penggajian. Kelola informasi karyawan, jabatan, divisi, status kerja, dan data penggajian.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">SDM / Payroll</h1>
          <p className="text-slate-400 text-sm mt-1">Data karyawan dan penggajian</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest), 'karyawan-ywm')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 hover:bg-white/50 text-sm transition-all"><Download size={16} /> Ekspor</button>
          <button onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all"><Plus size={16} /> Tambah</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center"><UserCheck size={18} className="text-emerald-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{activeCount}</p><p className="text-slate-400 text-xs">Karyawan Aktif</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center"><UserMinus size={18} className="text-amber-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{cutiCount}</p><p className="text-slate-400 text-xs">Sedang Cuti</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100/80 flex items-center justify-center"><UserMinus size={18} className="text-red-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{resignCount}</p><p className="text-slate-400 text-xs">Resign</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 flex items-center justify-center"><UserCog size={18} className="text-purple-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{formatRupiah(totalGaji)}</p><p className="text-slate-400 text-xs">Total Gaji/Bulan</p></div>
          </div>
        </GlassCard>
      </div>

      {/* Chart + Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie Chart */}
        <GlassCard className="p-5">
          <h2 className="text-slate-800 font-semibold text-sm mb-4">Distribusi Departemen</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {pieData.map((d, idx) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="text-slate-500">{d.name}</span>
                <span className="ml-auto text-slate-600 font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Filters */}
        <div className="lg:col-span-2">
          <GlassCard className="p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Cari nama atau NIP..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <select value={filterDivisi} onChange={(e) => { setFilterDivisi(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[150px]">
                <option value="" className="bg-white/90">Semua Divisi</option>
                {DIVISI_OPTIONS.map((d) => <option key={d} value={d} className="bg-white/90">{d}</option>)}
              </select>
            </div>
          </GlassCard>

          {/* Table */}
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/60">
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">NIP</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Nama</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Jabatan</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Divisi</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Tgl Masuk</th>
                    <th className="text-right px-4 py-3 text-slate-400 font-medium">Gaji Pokok</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-slate-400 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-slate-400">Tidak ada data</td></tr>
                  ) : (
                    paged.map((item) => {
                      const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.aktif;
                      return (
                        <tr key={item.id} className="border-b border-white/60 hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-cyan-600 font-mono text-xs">{item.nip}</td>
                          <td className="px-4 py-3 text-slate-800 font-medium">{item.nama}</td>
                          <td className="px-4 py-3 text-slate-500">{item.jabatan}</td>
                          <td className="px-4 py-3 text-slate-500">{item.divisi}</td>
                          <td className="px-4 py-3 text-slate-500">{formatTanggal(item.tanggalMasuk)}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{formatRupiah(item.gajiPokok)}</td>
                          <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', sc.bg, sc.color)}>{sc.label}</span></td>
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
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white/90 border-white/60 backdrop-blur-xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">{editingItem ? 'Edit Karyawan' : 'Tambah Karyawan'}</DialogTitle>
            <DialogDescription className="text-slate-400">{editingItem ? 'Perbarui data karyawan' : 'Isi data karyawan baru'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">NIP *</label>
                <input value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="YWM-001" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Nama *</label>
                <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Nama lengkap" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Jabatan</label>
                <input value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Operator" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Divisi</label>
                <select value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {DIVISI_OPTIONS.map((d) => <option key={d} value={d} className="bg-white/90">{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Tanggal Masuk</label>
                <input type="date" value={form.tanggalMasuk} onChange={(e) => setForm({ ...form, tanggalMasuk: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Gaji Pokok (Rp)</label>
                <input type="number" value={form.gajiPokok} onChange={(e) => setForm({ ...form, gajiPokok: Number(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Employee['status'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-white/90">{v.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">No. Telepon</label>
                <input value={form.noTelepon} onChange={(e) => setForm({ ...form, noTelepon: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="08xx-xxxx-xxxx" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="nama@ywm.co.id" />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Alamat</label>
              <input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Alamat lengkap" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 text-sm hover:bg-white/50 transition-all">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all">Simpan</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-white/90 border-white/60 backdrop-blur-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Hapus Karyawan?</DialogTitle>
            <DialogDescription className="text-slate-400">Data yang dihapus tidak dapat dikembalikan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 text-sm hover:bg-white/50 transition-all">Batal</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="px-4 py-2 rounded-xl bg-red-500/80 text-white text-sm hover:bg-red-500 transition-all">Hapus</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>)}
    </div>
  );
}
