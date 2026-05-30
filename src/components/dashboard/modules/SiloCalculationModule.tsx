// ============================================================
// SiloCalculationModule — Kalkulasi Kekosongan Silo
// Berdasarkan formula asli YWM (discharge calculation)
// Mengukur kedalaman kekosongan di 7 lubang, lalu hitung volume
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import {
  getData, saveData, deleteData, generateId, exportToCSV,
} from '@/lib/supabase-data';
import {
  KV_PREFIXES, SILO_CONFIG, type SiloId, type SiloCalculation,
} from '@/types/dashboard';
import {
  Plus, Download, Search, Cylinder, Info, Edit2, Trash2,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import DeleteConfirmDialog from '@/components/dashboard/DeleteConfirmDialog';

// ─── Formula YWM ─────────────────────────────────────────
function hitungKekosongan(silo: SiloId, ukuran: number[], pengeluaran: number) {
  const config = SILO_CONFIG[silo];

  // (b) Jumlah 1-7
  const jumlah = ukuran.reduce((s, v) => s + v, 0);

  // (c) Tinggi Rata-Rata
  const tinggiRataRata = jumlah / 7;

  // (d) t Silinder = 18 - (c) — jika (c) > 18 maka = 0
  const tSilinder = tinggiRataRata <= config.tinggiSilinder
    ? config.tinggiSilinder - tinggiRataRata
    : 0;

  // (e) t Conis: jika (c) ≤ 18m → pakai tetap (A=4.6, B=2.9)
  //                jika (c) > 18m → A=22.6-(c), B=20.9-(c)
  const tConis = tinggiRataRata <= config.tinggiSilinder
    ? config.tConisMax
    : config.tConisFormula - tinggiRataRata;

  // Volume Silinder = 145.42 × tSilinder
  const volumeSilinder = config.areaSilinder * tSilinder;

  // Volume Conis = 48.47 × tConis (untuk conis penuh: × tConisMax / tConisMax × tConisMax)
  // Formula asli: 48.47 * tConis (ketika ≤ 18m) atau 48.47 * tConis/tConisMax * tConisMax
  const volumeConis = tinggiRataRata <= config.tinggiSilinder
    ? config.areaConis * tConis // conis penuh terisi
    : config.areaConis * tConis / config.tConisMax * config.tConisMax; // conis sebagian

  // Total Volume Silo = volumeSilinder + volumeConis
  const volumeTotal = volumeSilinder + volumeConis;

  // Kekosongan: (tinggi rata-rata - 2.5m) × 145
  const kekosonganBase = (tinggiRataRata - 2.5) * 145;
  const kekosongan = kekosonganBase > 0 ? kekosonganBase : 0;

  // Space Silo = kekosongan - pengeluaran
  const spaceSilo = kekosongan - pengeluaran;

  return {
    jumlah: Math.round(jumlah * 1000) / 1000,
    tinggiRataRata: Math.round(tinggiRataRata * 10000) / 10000,
    tSilinder: Math.round(tSilinder * 10000) / 10000,
    tConis: Math.round(Math.max(0, tConis) * 10000) / 10000,
    volumeSilinder: Math.round(volumeSilinder * 1000) / 1000,
    volumeConis: Math.round(volumeConis * 1000) / 1000,
    volumeTotal: Math.round(volumeTotal * 1000) / 1000,
    kekosongan: Math.round(kekosongan * 1000) / 1000,
    spaceSilo: Math.round(spaceSilo * 1000) / 1000,
  };
}

type UkuranTuple = [number, number, number, number, number, number, number];

const EMPTY_UKURAN: UkuranTuple = [0, 0, 0, 0, 0, 0, 0];

const EMPTY_FORM: Omit<SiloCalculation, 'id' | 'createdAt' | 'updatedAt'> = {
  silo: 'A',
  tanggal: new Date().toISOString().split('T')[0],
  jam: new Date().toTimeString().slice(0, 5),
  ukuran: [...EMPTY_UKURAN],
  jumlah: 0,
  tinggiRataRata: 0,
  tSilinder: 0,
  tConis: 0,
  volumeSilinder: 0,
  volumeConis: 0,
  volumeTotal: 0,
  kekosongan: 0,
  spaceSilo: 0,
  pengeluaran: 0,
  keterangan: '',
  petugas: '',
};

export default function SiloCalculationModule() {
  const [data, setData] = useState<SiloCalculation[]>([]);
  const [search, setSearch] = useState('');
  const [filterSilo, setFilterSilo] = useState<SiloId | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SiloCalculation | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<SiloCalculation>(KV_PREFIXES.siloCalculation);
    setData(items);
    setLoading(false);
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  // Latest readings per silo
  const latestA = data.filter((d) => d.silo === 'A').sort((a, b) =>
    `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`)
  )[0];
  const latestB = data.filter((d) => d.silo === 'B').sort((a, b) =>
    `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`)
  )[0];

  const filtered = data.filter((item) => {
    const matchSearch = search
      ? item.petugas.toLowerCase().includes(search.toLowerCase()) ||
        item.keterangan.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchSilo = filterSilo ? item.silo === filterSilo : true;
    return matchSearch && matchSilo;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Chart: last 7 days per silo
  const chartData: Array<{ name: string; siloA: number; siloB: number }> = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayA = data
      .filter((r) => r.silo === 'A' && r.tanggal === dateStr)
      .sort((a, b) => b.jam.localeCompare(a.jam))[0];
    const dayB = data
      .filter((r) => r.silo === 'B' && r.tanggal === dateStr)
      .sort((a, b) => b.jam.localeCompare(a.jam))[0];
    chartData.push({
      name: dayNames[date.getDay()],
      siloA: dayA?.volumeTotal ?? 0,
      siloB: dayB?.volumeTotal ?? 0,
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-white/90 border border-white/60 rounded-lg px-3 py-2 text-xs">
          <p className="text-slate-600 mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {entry.value.toLocaleString()} m³
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ─── Update ukuran & recalculate ────────────────────
  const updateUkuran = (index: number, value: number) => {
    const newUkuran = [...form.ukuran] as UkuranTuple;
    newUkuran[index] = value;
    const calc = hitungKekosongan(form.silo, newUkuran, form.pengeluaran);
    setForm({ ...form, ukuran: newUkuran, ...calc });
  };

  const handleSiloChange = (silo: SiloId) => {
    const calc = hitungKekosongan(silo, form.ukuran, form.pengeluaran);
    setForm({ ...form, silo, ...calc });
  };

  const handlePengeluaranChange = (value: number) => {
    const calc = hitungKekosongan(form.silo, form.ukuran, value);
    setForm({ ...form, pengeluaran: value, ...calc });
  };

  const handleSave = () => {
    if (!form.tanggal) return;
    if (editingItem) {
      saveData(KV_PREFIXES.siloCalculation, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.siloCalculation, {
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
    deleteData(KV_PREFIXES.siloCalculation, id);
    setDeleteConfirm(null);
    loadData();
  };

  const handleEdit = (item: SiloCalculation) => {
    setEditingItem(item);
    setForm({
      silo: item.silo,
      tanggal: item.tanggal,
      jam: item.jam,
      ukuran: [...item.ukuran] as UkuranTuple,
      jumlah: item.jumlah,
      tinggiRataRata: item.tinggiRataRata,
      tSilinder: item.tSilinder,
      tConis: item.tConis,
      volumeSilinder: item.volumeSilinder,
      volumeConis: item.volumeConis,
      volumeTotal: item.volumeTotal,
      kekosongan: item.kekosongan,
      spaceSilo: item.spaceSilo,
      pengeluaran: item.pengeluaran,
      keterangan: item.keterangan,
      petugas: item.petugas,
    });
    setDialogOpen(true);
  };

  // ─── Silo Visual Component ──────────────────────────
  const SiloVisual = ({ siloId, volumeTotal, kekosongan }: {
    siloId: SiloId; volumeTotal: number; kekosongan: number;
  }) => {
    const config = SILO_CONFIG[siloId];
    // Persentase pengisian (estimasi)
    const maxVolume = config.areaSilinder * config.tinggiSilinder + config.areaConis * config.tConisMax;
    const persentase = maxVolume > 0 ? Math.round((volumeTotal / maxVolume) * 100) : 0;
    const fillHeight = Math.min(persentase, 100);

    return (
      <div className="flex flex-col items-center">
        <h3 className="text-slate-800 font-semibold text-sm mb-3">{config.name}</h3>
        <div className="relative w-20 h-48 rounded-t-[2rem] rounded-b-lg border-2 border-slate-200/50 overflow-hidden bg-white/40">
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out',
              persentase > 0 && `bg-gradient-to-t ${persentase >= 80 ? 'from-red-500/40 to-red-600/10' : persentase >= 50 ? 'from-amber-500/40 to-amber-600/10' : 'from-cyan-500/40 to-cyan-600/10'}`
            )}
            style={{ height: `${fillHeight}%` }}
          />
          {/* 7 hole indicators */}
          {Array.from({ length: 7 }).map((_, i) => {
            const topPercent = 5 + i * 12;
            return (
              <div
                key={i}
                className="absolute left-0 right-0 flex items-center"
                style={{ top: `${topPercent}%`, transform: 'translateY(-50%)' }}
              >
                <div className="w-3 h-3 rounded-full border-2 ml-[-6px] bg-white/50 border-white/30" />
                <div className="ml-auto mr-1 text-[9px] text-slate-400">L{i + 1}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-center">
          <p className={cn('text-lg font-bold', persentase >= 80 ? 'text-red-600' : persentase >= 50 ? 'text-amber-600' : 'text-cyan-600')}>
            {volumeTotal.toLocaleString()} m³
          </p>
          <p className="text-slate-400 text-xs">{persentase}% kapasitas</p>
          <p className="text-slate-400 text-[10px]">Kekosongan: {kekosongan.toLocaleString()} m³</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Kalkulasi Silo</strong> — Kalkulasi kekosongan silo berdasarkan pengukuran 7 lubang menggunakan formula asli YWM. Hitung volume silinder, conis, kekosongan, dan space silo secara otomatis.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Kalkulasi Silo</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kalkulasi kekosongan silo berdasarkan pengukuran 7 lubang
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest as Record<string, unknown>), 'kalkulasi-silo-ywm')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 hover:bg-white/50 text-sm transition-all"
          >
            <Download size={16} /> Ekspor
          </button>
          <button
            onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all"
          >
            <Plus size={16} /> Input Kalkulasi
          </button>
        </div>
      </div>

      {/* Silo Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['A', 'B'] as SiloId[]).map((siloId) => {
          const latest = siloId === 'A' ? latestA : latestB;
          const config = SILO_CONFIG[siloId];
          return (
            <GlassCard key={siloId} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Cylinder size={18} className={siloId === 'A' ? 'text-cyan-600' : 'text-purple-600'} />
                <h2 className="text-slate-800 font-semibold text-sm">{config.name} — Kekosongan Saat Ini</h2>
              </div>
              <div className="flex items-center gap-6">
                <SiloVisual
                  siloId={siloId}
                  volumeTotal={latest?.volumeTotal ?? 0}
                  kekosongan={latest?.kekosongan ?? 0}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Tinggi Rata-Rata (c)</span>
                    <span className="text-slate-600">{latest?.tinggiRataRata?.toFixed(2) ?? '-'} m</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">t Silinder (d)</span>
                    <span className="text-cyan-600">{latest?.tSilinder?.toFixed(2) ?? '-'} m</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">t Conis (e)</span>
                    <span className="text-purple-600">{latest?.tConis?.toFixed(2) ?? '-'} m</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Vol. Silinder</span>
                    <span className="text-slate-500">{latest?.volumeSilinder?.toLocaleString() ?? '-'} m³</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Vol. Conis</span>
                    <span className="text-slate-500">{latest?.volumeConis?.toLocaleString() ?? '-'} m³</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-white/60 pt-1">
                    <span className="text-slate-400 font-medium">Total Volume</span>
                    <span className="text-slate-800 font-bold">{latest?.volumeTotal?.toLocaleString() ?? '-'} m³</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Kekosongan</span>
                    <span className="text-amber-600">{latest?.kekosongan?.toLocaleString() ?? '-'} m³</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Terakhir dicek</span>
                    <span className="text-slate-500">{latest ? `${latest.tanggal} ${latest.jam}` : 'Belum ada data'}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Info Card — Formula Explanation */}
      <GlassCard variant="accent" className="p-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-cyan-600 flex-shrink-0 mt-0.5" />
          <div className="text-slate-500 text-xs space-y-1">
            <p className="font-medium text-slate-600">Formula Kalkulasi Kekosongan Silo (YWM)</p>
            <p><span className="text-cyan-600">(a)</span> Pengukuran 1-7: kedalaman kekosongan di tiap lubang (meter)</p>
            <p><span className="text-cyan-600">(b)</span> Jumlah = SUM(1-7)</p>
            <p><span className="text-cyan-600">(c)</span> Tinggi Rata-Rata = Jumlah / 7</p>
            <p><span className="text-cyan-600">(d)</span> t Silinder = 18 - (c) — jika (c) &gt; 18m maka = 0</p>
            <p><span className="text-cyan-600">(e)</span> t Conis: ≤18m → A=4.6, B=2.9; &gt;18m → A=22.6-(c), B=20.9-(c)</p>
            <p>Volume Silinder = 145.42 × (d); Volume Conis = 48.47 × (e); Total = Silinder + Conis</p>
            <p>Kekosongan = ((c) - 2.5) × 145; Space Silo = Kekosongan - Pengeluaran</p>
          </div>
        </div>
      </GlassCard>

      {/* Chart */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-800 font-semibold text-sm">Volume Silo — 7 Hari Terakhir</h2>
          <span className="text-slate-400 text-xs">m³ per hari</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              <Bar dataKey="siloA" name="Silo A" fill="rgba(6,182,212,0.7)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="siloB" name="Silo B" fill="rgba(168,85,247,0.6)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari petugas / keterangan..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" />
          </div>
          <select value={filterSilo} onChange={(e) => { setFilterSilo(e.target.value as SiloId | ''); setPage(1); }}
            className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[150px]">
            <option value="" className="bg-white/90">Semua Silo</option>
            <option value="A" className="bg-white/90">Silo A</option>
            <option value="B" className="bg-white/90">Silo B</option>
          </select>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60">
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Tanggal</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Silo</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Ukuran 1-7</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">(c) Rata²</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">(d) t Silinder</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Vol Total</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Kekosongan</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Petugas</th>
                <th className="text-right px-3 py-3 text-slate-400 font-medium text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-slate-400">Belum ada data kalkulasi</td></tr>
              ) : (
                paged.map((item) => (
                  <tr key={item.id} className="border-b border-white/60 hover:bg-white/[0.03] transition-colors">
                    <td className="px-3 py-2 text-slate-600 text-xs">{item.tanggal} <span className="text-slate-400">{item.jam}</span></td>
                    <td className="px-3 py-2">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', item.silo === 'A' ? 'bg-cyan-100/80 text-cyan-600' : 'bg-purple-100/80 text-purple-600')}>
                        Silo {item.silo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-500 font-mono text-[10px]">
                      {item.ukuran.map((u) => u.toFixed(1)).join(' | ')}
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{item.tinggiRataRata.toFixed(2)}m</td>
                    <td className="px-3 py-2 text-cyan-600 text-xs">{item.tSilinder.toFixed(2)}m</td>
                    <td className="px-3 py-2 text-slate-800 font-medium text-xs">{item.volumeTotal.toLocaleString()} m³</td>
                    <td className="px-3 py-2 text-amber-600 text-xs">{item.kekosongan.toLocaleString()} m³</td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{item.petugas || '-'}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1 rounded-lg hover:bg-white/50 text-slate-400 hover:text-cyan-600 transition-all"><Edit2 size={12} /></button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1 rounded-lg hover:bg-white/50 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={12} /></button>
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
            <DialogTitle className="text-slate-800">{editingItem ? 'Edit Kalkulasi Silo' : 'Input Kalkulasi Kekosongan Silo'}</DialogTitle>
            <DialogDescription className="text-slate-400">Masukkan kedalaman kekosongan (meter) di tiap lubang pengukuran</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Silo & Time */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Silo</label>
                <select value={form.silo} onChange={(e) => handleSiloChange(e.target.value as SiloId)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  <option value="A" className="bg-white/90">Silo A</option>
                  <option value="B" className="bg-white/90">Silo B</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Jam</label>
                <input type="time" value={form.jam} onChange={(e) => setForm({ ...form, jam: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>

            {/* (a) Pengukuran 1-7 */}
            <div>
              <label className="text-slate-500 text-xs mb-2 block">(a) Kedalaman Kekosongan per Lubang (meter)</label>
              <div className="grid grid-cols-7 gap-2">
                {form.ukuran.map((val, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-slate-400 text-[10px]">L{i + 1}</span>
                    <input type="number" step="0.01" min="0" value={val || ''} onChange={(e) => updateUkuran(i, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-slate-800 text-sm text-center focus:border-cyan-500/40 focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Calculated Results */}
            <GlassCard variant="accent" className="p-4 space-y-1.5">
              <p className="text-slate-500 text-xs font-medium mb-2">Hasil Kalkulasi</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">(b) Jumlah</span><span className="text-slate-600">{form.jumlah.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">(c) Tinggi Rata²</span><span className="text-cyan-600 font-medium">{form.tinggiRataRata.toFixed(4)} m</span></div>
                <div className="flex justify-between"><span className="text-slate-400">(d) t Silinder</span><span className="text-cyan-600">{form.tSilinder.toFixed(4)} m</span></div>
                <div className="flex justify-between"><span className="text-slate-400">(e) t Conis</span><span className="text-purple-600">{form.tConis.toFixed(4)} m</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Vol. Silinder</span><span className="text-slate-500">{form.volumeSilinder.toLocaleString()} m³</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Vol. Conis</span><span className="text-slate-500">{form.volumeConis.toLocaleString()} m³</span></div>
              </div>
              <div className="border-t border-white/60 pt-2 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-slate-400 text-[10px]">Total Volume</p>
                  <p className="text-xl font-bold text-slate-800">{form.volumeTotal.toLocaleString()} <span className="text-xs font-normal">m³</span></p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-[10px]">Kekosongan</p>
                  <p className="text-xl font-bold text-amber-600">{form.kekosongan.toLocaleString()} <span className="text-xs font-normal">m³</span></p>
                </div>
              </div>
            </GlassCard>

            {/* Pengeluaran */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Pengeluaran (ton)</label>
                <input type="number" value={form.pengeluaran || ''} onChange={(e) => handlePengeluaranChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" placeholder="0" />
                <p className="text-slate-400 text-[10px] mt-1">Truck + Curah sejak pengukuran terakhir</p>
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Space Silo</label>
                <div className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-amber-600 text-sm font-medium">
                  {form.spaceSilo.toLocaleString()} m³
                </div>
                <p className="text-slate-400 text-[10px] mt-1">Kekosongan - Pengeluaran</p>
              </div>
            </div>

            {/* Petugas & Keterangan */}
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Petugas</label>
              <input value={form.petugas} onChange={(e) => setForm({ ...form, petugas: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Nama petugas" />
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Keterangan</label>
              <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} rows={2}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none resize-none" placeholder="Catatan (opsional)" />
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
        title="Hapus Kalkulasi?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />
      </>)}
    </div>
  );
}
