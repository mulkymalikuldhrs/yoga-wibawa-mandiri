// ============================================================
// FinanceModule — Keuangan
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, generateId, formatRupiah, formatTanggal, exportToCSV } from '@/lib/supabase-data';
import { KV_PREFIXES, type FinanceRecord } from '@/types/dashboard';
import {
  Plus, Download, Search, Wallet, TrendingUp, TrendingDown, DollarSign, Edit2, Trash2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const JENIS_OPTIONS = ['pemasukan', 'pengeluaran'];
const KATEGORI_OPTIONS = ['Penjualan', 'Pembelian Material', 'Gaji', 'Utilitas', 'Transportasi', 'Perawatan', 'Lainnya'];
const METODE_OPTIONS = ['Transfer Bank', 'Tunai', 'Auto Debit', 'Giro'];

const EMPTY_FORM: Omit<FinanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
  tanggal: new Date().toISOString().split('T')[0], jenis: 'pemasukan', kategori: 'Penjualan',
  deskripsi: '', jumlah: 0, metodePembayaran: 'Transfer Bank', referensi: '', catatan: '',
};

export default function FinanceModule() {
  const [data, setData] = useState<FinanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinanceRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<FinanceRecord>(KV_PREFIXES.finance);
    setData(items);
    setLoading(false);
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter((item) => {
    const matchSearch = search ? item.deskripsi.toLowerCase().includes(search.toLowerCase()) || item.kategori.toLowerCase().includes(search.toLowerCase()) : true;
    const matchJenis = filterJenis ? item.jenis === filterJenis : true;
    return matchSearch && matchJenis;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Calculate stats
  const totalPemasukan = data.filter((d) => d.jenis === 'pemasukan').reduce((s, d) => s + d.jumlah, 0);
  const totalPengeluaran = data.filter((d) => d.jenis === 'pengeluaran').reduce((s, d) => s + d.jumlah, 0);
  const saldo = totalPemasukan - totalPengeluaran;

  // Monthly chart data
  const monthlyData: Record<string, { pemasukan: number; pengeluaran: number }> = {};
  data.forEach((d) => {
    const month = d.tanggal.substring(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { pemasukan: 0, pengeluaran: 0 };
    if (d.jenis === 'pemasukan') monthlyData[month].pemasukan += d.jumlah;
    else monthlyData[month].pengeluaran += d.jumlah;
  });
  const chartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({
      name: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      pemasukan: Math.round(vals.pemasukan / 1000000),
      pengeluaran: Math.round(vals.pengeluaran / 1000000),
    }));

  // Running balance
  const sortedData = [...filtered].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  let runningBalance = 0;
  const balances: Record<string, number> = {};
  sortedData.forEach((d) => {
    runningBalance += d.jenis === 'pemasukan' ? d.jumlah : -d.jumlah;
    balances[d.id] = runningBalance;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-white/90 border border-white/60 rounded-lg px-3 py-2 text-xs">
          <p className="text-slate-600 mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.color }} className="font-medium">{entry.name}: {entry.value}M</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleSave = () => {
    if (!form.deskripsi || form.jumlah <= 0) return;
    if (editingItem) {
      saveData(KV_PREFIXES.finance, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.finance, { ...form, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setDialogOpen(false); setEditingItem(null); setForm(EMPTY_FORM); loadData();
  };

  const handleDelete = (id: string) => { deleteData(KV_PREFIXES.finance, id); setDeleteConfirm(null); loadData(); };
  const handleEdit = (item: FinanceRecord) => {
    setEditingItem(item);
    setForm({ tanggal: item.tanggal, jenis: item.jenis, kategori: item.kategori, deskripsi: item.deskripsi, jumlah: item.jumlah, metodePembayaran: item.metodePembayaran, referensi: item.referensi, catatan: item.catatan });
    setDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Keuangan</strong> — Pencatatan transaksi keuangan harian. Kelola pemasukan dan pengeluaran, lacak metode pembayaran, dan pantau arus kas operasional perusahaan.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Keuangan</h1>
          <p className="text-slate-400 text-sm mt-1">Pencatatan pemasukan dan pengeluaran perusahaan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest), 'keuangan-ywm')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 hover:bg-white/50 text-sm transition-all"><Download size={16} /> Ekspor</button>
          <button onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all"><Plus size={16} /> Tambah</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center"><TrendingUp size={18} className="text-emerald-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{formatRupiah(totalPemasukan)}</p><p className="text-slate-400 text-xs">Total Pemasukan</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100/80 flex items-center justify-center"><TrendingDown size={18} className="text-red-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{formatRupiah(totalPengeluaran)}</p><p className="text-slate-400 text-xs">Total Pengeluaran</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', saldo >= 0 ? 'bg-cyan-100/80' : 'bg-red-100/80')}>
              <DollarSign size={18} className={saldo >= 0 ? 'text-cyan-600' : 'text-red-600'} />
            </div>
            <div><p className={cn('text-lg font-bold', saldo >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatRupiah(saldo)}</p><p className="text-slate-400 text-xs">Saldo Bersih</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 flex items-center justify-center"><Wallet size={18} className="text-purple-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{data.length}</p><p className="text-slate-400 text-xs">Total Transaksi</p></div>
          </div>
        </GlassCard>
      </div>

      {/* Chart */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-800 font-semibold text-sm">Pemasukan vs Pengeluaran</h2>
          <span className="text-slate-400 text-xs">Juta Rupiah</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pemasukan" name="Pemasukan" fill="rgba(52,211,153,0.6)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="rgba(248,113,113,0.6)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari deskripsi atau kategori..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" />
          </div>
          <select value={filterJenis} onChange={(e) => { setFilterJenis(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[150px]">
            <option value="" className="bg-white/90">Semua Jenis</option>
            <option value="pemasukan" className="bg-white/90">Pemasukan</option>
            <option value="pengeluaran" className="bg-white/90">Pengeluaran</option>
          </select>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Tanggal</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Jenis</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Kategori</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Deskripsi</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Jumlah</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Metode</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Saldo</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">Tidak ada data</td></tr>
              ) : (
                paged.map((item) => (
                  <tr key={item.id} className="border-b border-white/60 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-slate-600">{formatTanggal(item.tanggal)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', item.jenis === 'pemasukan' ? 'bg-emerald-100/80 text-emerald-600' : 'bg-red-100/80 text-red-600')}>
                        {item.jenis === 'pemasukan' ? '↑ Masuk' : '↓ Keluar'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.kategori}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{item.deskripsi}</td>
                    <td className={cn('px-4 py-3 text-right font-medium', item.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-red-600')}>
                      {item.jenis === 'pemasukan' ? '+' : '-'}{formatRupiah(item.jumlah)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.metodePembayaran}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{balances[item.id] !== undefined ? formatRupiah(balances[item.id]) : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-white/50 text-slate-400 hover:text-cyan-600 transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg hover:bg-white/50 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
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
            <DialogTitle className="text-slate-800">{editingItem ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
            <DialogDescription className="text-slate-400">{editingItem ? 'Perbarui data transaksi' : 'Isi data transaksi keuangan'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Jenis</label>
                <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as FinanceRecord['jenis'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  <option value="pemasukan" className="bg-white/90">Pemasukan</option>
                  <option value="pengeluaran" className="bg-white/90">Pengeluaran</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Kategori</label>
                <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {KATEGORI_OPTIONS.map((k) => <option key={k} value={k} className="bg-white/90">{k}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Jumlah (Rp)</label>
                <input type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Deskripsi *</label>
              <input value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Deskripsi transaksi" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Metode Pembayaran</label>
                <select value={form.metodePembayaran} onChange={(e) => setForm({ ...form, metodePembayaran: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {METODE_OPTIONS.map((m) => <option key={m} value={m} className="bg-white/90">{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Referensi</label>
                <input value={form.referensi} onChange={(e) => setForm({ ...form, referensi: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="INV-2026-001" />
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

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-white/90 border-white/60 backdrop-blur-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Hapus Transaksi?</DialogTitle>
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
