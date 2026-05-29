// ============================================================
// ProductionModule — Produksi per Shift
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, generateId, exportToCSV } from '@/lib/supabase-data';
import { KV_PREFIXES, type ProductionRecord } from '@/types/dashboard';
import {
  Plus, Download, Search, Factory, TrendingUp, Target, Edit2, Trash2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const SHIFT_LABELS: Record<string, string> = { pagi: 'Pagi', siang: 'Siang', malam: 'Malam' };
const KUALITAS_CONFIG: Record<string, { color: string; bg: string }> = {
  A: { color: 'text-emerald-600', bg: 'bg-emerald-100/80' },
  B: { color: 'text-amber-600', bg: 'bg-amber-100/80' },
  C: { color: 'text-red-600', bg: 'bg-red-100/80' },
};

const EMPTY_FORM: Omit<ProductionRecord, 'id' | 'createdAt' | 'updatedAt'> = {
  tanggal: new Date().toISOString().split('T')[0], shift: 'pagi', mesin: 'Packer A',
  target: 170, aktual: 170, satuan: 'ton', kualitas: 'A', catatan: '',
};

export default function ProductionModule() {
  const [data, setData] = useState<ProductionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductionRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<ProductionRecord>(KV_PREFIXES.production);
    setData(items);
    setLoading(false);
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter((item) => {
    const matchSearch = search ? item.mesin.toLowerCase().includes(search.toLowerCase()) : true;
    const matchShift = filterShift ? item.shift === filterShift : true;
    return matchSearch && matchShift;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const today = new Date().toISOString().split('T')[0];
  const todayData = data.filter((d) => d.tanggal === today);
  const todayTotal = todayData.reduce((s, d) => s + d.aktual, 0);
  const todayTarget = todayData.reduce((s, d) => s + d.target, 0);
  const avgEfficiency = todayTarget > 0 ? ((todayTotal / todayTarget) * 100).toFixed(1) : '0';

  // Chart data: last 7 days
  const chartData: Array<{ name: string; target: number; aktual: number; efisiensi: number }> = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayProds = data.filter((p) => p.tanggal === dateStr);
    const totalTarget = dayProds.reduce((s, p) => s + p.target, 0);
    const totalAktual = dayProds.reduce((s, p) => s + p.aktual, 0);
    chartData.push({ name: dayNames[date.getDay()], target: totalTarget, aktual: totalAktual, efisiensi: totalTarget > 0 ? Math.round((totalAktual / totalTarget) * 100) : 0 });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-white/90 border border-white/60 rounded-lg px-3 py-2 text-xs">
          <p className="text-slate-600 mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.color }} className="font-medium">{entry.name}: {entry.value} {entry.name === 'Efisiensi' ? '%' : 'ton'}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleSave = () => {
    if (!form.tanggal || !form.mesin) return;
    if (editingItem) {
      saveData(KV_PREFIXES.production, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.production, { ...form, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setDialogOpen(false); setEditingItem(null); setForm(EMPTY_FORM); loadData();
  };

  const handleDelete = (id: string) => { deleteData(KV_PREFIXES.production, id); setDeleteConfirm(null); loadData(); };
  const handleEdit = (item: ProductionRecord) => {
    setEditingItem(item);
    setForm({ tanggal: item.tanggal, shift: item.shift, mesin: item.mesin, target: item.target, aktual: item.aktual, satuan: item.satuan, kualitas: item.kualitas, catatan: item.catatan });
    setDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Produksi</strong> — Pencatatan hasil produksi harian per shift dan mesin. Bandingkan target vs aktual, pantau kualitas output, dan analisis efisiensi produksi.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Produksi</h1>
          <p className="text-slate-400 text-sm mt-1">Pencatatan produksi harian per shift</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest), 'produksi-ywm')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 hover:bg-white/50 text-sm transition-all"><Download size={16} /> Ekspor</button>
          <button onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all"><Plus size={16} /> Input</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center"><Factory size={18} className="text-emerald-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{todayTotal} ton</p><p className="text-slate-400 text-xs">Produksi Hari Ini</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100/80 flex items-center justify-center"><Target size={18} className="text-cyan-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{todayTarget} ton</p><p className="text-slate-400 text-xs">Target Hari Ini</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 flex items-center justify-center"><TrendingUp size={18} className="text-purple-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{avgEfficiency}%</p><p className="text-slate-400 text-xs">Efisiensi</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center"><Factory size={18} className="text-amber-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{data.length}</p><p className="text-slate-400 text-xs">Total Catatan</p></div>
          </div>
        </GlassCard>
      </div>

      {/* Chart */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-800 font-semibold text-sm">Produksi vs Target — 7 Hari Terakhir</h2>
          <span className="text-slate-400 text-xs">Ton per hari</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              <Bar dataKey="target" name="Target" fill="rgba(148,163,184,0.25)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aktual" name="Aktual" fill="rgba(6,182,212,0.7)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari mesin..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" />
          </div>
          <select value={filterShift} onChange={(e) => { setFilterShift(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[150px]">
            <option value="" className="bg-white/90">Semua Shift</option>
            <option value="pagi" className="bg-white/90">Pagi</option>
            <option value="siang" className="bg-white/90">Siang</option>
            <option value="malam" className="bg-white/90">Malam</option>
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
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Shift</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Mesin</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Target</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Aktual</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Efisiensi</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Kualitas</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Catatan</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-slate-400">Tidak ada data</td></tr>
              ) : (
                paged.map((item) => {
                  const eff = item.target > 0 ? ((item.aktual / item.target) * 100).toFixed(1) : '0';
                  const effNum = parseFloat(eff);
                  const effColor = effNum >= 100 ? 'text-emerald-600' : effNum >= 90 ? 'text-amber-600' : 'text-red-600';
                  const qc = KUALITAS_CONFIG[item.kualitas] || KUALITAS_CONFIG.A;
                  return (
                    <tr key={item.id} className="border-b border-white/60 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 text-slate-600">{item.tanggal}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-white/40 text-slate-500 text-xs">{SHIFT_LABELS[item.shift] || item.shift}</span></td>
                      <td className="px-4 py-3 text-slate-500">{item.mesin}</td>
                      <td className="px-4 py-3 text-slate-500">{item.target} {item.satuan}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{item.aktual} {item.satuan}</td>
                      <td className="px-4 py-3"><span className={cn('text-xs font-medium', effColor)}>{eff}%</span></td>
                      <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', qc.bg, qc.color)}>{item.kualitas}</span></td>
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
            <DialogTitle className="text-slate-800">{editingItem ? 'Edit Produksi' : 'Input Produksi'}</DialogTitle>
            <DialogDescription className="text-slate-400">{editingItem ? 'Perbarui data produksi' : 'Isi data produksi per shift'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Shift</label>
                <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value as ProductionRecord['shift'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  <option value="pagi" className="bg-white/90">Pagi</option>
                  <option value="siang" className="bg-white/90">Siang</option>
                  <option value="malam" className="bg-white/90">Malam</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Mesin</label>
                <input value={form.mesin} onChange={(e) => setForm({ ...form, mesin: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Packer A" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Satuan</label>
                <input value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Target</label>
                <input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Aktual</label>
                <input type="number" value={form.aktual} onChange={(e) => setForm({ ...form, aktual: Number(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Kualitas</label>
              <select value={form.kualitas} onChange={(e) => setForm({ ...form, kualitas: e.target.value as ProductionRecord['kualitas'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                <option value="A" className="bg-white/90">A (Baik)</option>
                <option value="B" className="bg-white/90">B (Cukup)</option>
                <option value="C" className="bg-white/90">C (Kurang)</option>
              </select>
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
            <DialogTitle className="text-slate-800">Hapus Catatan Produksi?</DialogTitle>
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
