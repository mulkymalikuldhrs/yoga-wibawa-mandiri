// ============================================================
// SiloOpnameModule — Berita Acara Opname Silo A & B
// Berdasarkan format asli YWM (Opname Silo.xlsx)
// Opname I (Sebelum Bongkar) + Opname II (Sesudah Bongkar)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import {
  getData, saveData, deleteData, generateId, exportToCSV,
} from '@/lib/supabase-data';
import {
  KV_PREFIXES, SILO_CONFIG, type SiloId, type SiloOpname, type SiloCalculation,
} from '@/types/dashboard';
import {
  Plus, Download, Search, ClipboardCheck, Edit2, Trash2, Info, Ship,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import DeleteConfirmDialog from '@/components/dashboard/DeleteConfirmDialog';

// ─── Formula YWM ─────────────────────────────────────────
type UkuranTuple = [number, number, number, number, number, number, number];

function hitungVolume(silo: SiloId, ukuran: UkuranTuple): number {
  const config = SILO_CONFIG[silo];
  const tinggiRataRata = ukuran.reduce((s, v) => s + v, 0) / 7;
  const tSilinder = tinggiRataRata <= config.tinggiSilinder
    ? config.tinggiSilinder - tinggiRataRata : 0;
  const tConis = tinggiRataRata <= config.tinggiSilinder
    ? config.tConisMax
    : config.tConisFormula - tinggiRataRata;
  const volumeSilinder = config.areaSilinder * tSilinder;
  // Proporsional: areaConis * tConis * (tConis / tConisMax) — scaling berdasarkan rasio isi conis
  const volumeConis = tinggiRataRata <= config.tinggiSilinder
    ? config.areaConis * tConis
    : config.areaConis * tConis * (tConis / config.tConisMax);
  return Math.round((volumeSilinder + volumeConis) * 1000) / 1000;
}

const EMPTY_UKURAN: UkuranTuple = [0, 0, 0, 0, 0, 0, 0];

const EMPTY_FORM: Omit<SiloOpname, 'id' | 'createdAt' | 'updatedAt'> = {
  tanggal: new Date().toISOString().split('T')[0],
  jam: new Date().toTimeString().slice(0, 5),
  kapal: '',
  opname1Tanggal: '',
  opname1Jam: '',
  opname1UkuranA: [...EMPTY_UKURAN],
  opname1UkuranB: [...EMPTY_UKURAN],
  opname1VolumeA: 0,
  opname1VolumeB: 0,
  opname1TotalVolume: 0,
  opname2Tanggal: '',
  opname2Jam: '',
  opname2UkuranA: [...EMPTY_UKURAN],
  opname2UkuranB: [...EMPTY_UKURAN],
  opname2VolumeA: 0,
  opname2VolumeB: 0,
  opname2TotalVolume: 0,
  pengeluaranZak: 0,
  semenCurahTerbongkar: 0,
  catatan: '',
  petugas: '',
};

export default function SiloOpnameModule() {
  const [data, setData] = useState<SiloOpname[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SiloOpname | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<SiloOpname>(KV_PREFIXES.siloOpname);
    setData(items);
    setLoading(false);
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter((item) => {
    const matchSearch = search
      ? item.kapal.toLowerCase().includes(search.toLowerCase()) ||
        item.petugas.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchSearch;
  });
  const sorted = [...filtered].sort((a, b) => `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`));
  const totalPages = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice((page - 1) * perPage, page * perPage);

  // ─── Update ukuran & recalculate volume ─────────────
  const updateUkuranA1 = (index: number, value: number) => {
    const newUkuran = [...form.opname1UkuranA] as UkuranTuple;
    newUkuran[index] = value;
    const volA = hitungVolume('A', newUkuran);
    setForm({ ...form, opname1UkuranA: newUkuran, opname1VolumeA: volA, opname1TotalVolume: volA + form.opname1VolumeB });
  };
  const updateUkuranB1 = (index: number, value: number) => {
    const newUkuran = [...form.opname1UkuranB] as UkuranTuple;
    newUkuran[index] = value;
    const volB = hitungVolume('B', newUkuran);
    setForm({ ...form, opname1UkuranB: newUkuran, opname1VolumeB: volB, opname1TotalVolume: form.opname1VolumeA + volB });
  };
  const updateUkuranA2 = (index: number, value: number) => {
    const newUkuran = [...form.opname2UkuranA] as UkuranTuple;
    newUkuran[index] = value;
    const volA = hitungVolume('A', newUkuran);
    setForm({ ...form, opname2UkuranA: newUkuran, opname2VolumeA: volA, opname2TotalVolume: volA + form.opname2VolumeB });
  };
  const updateUkuranB2 = (index: number, value: number) => {
    const newUkuran = [...form.opname2UkuranB] as UkuranTuple;
    newUkuran[index] = value;
    const volB = hitungVolume('B', newUkuran);
    setForm({ ...form, opname2UkuranB: newUkuran, opname2VolumeB: volB, opname2TotalVolume: form.opname2VolumeA + volB });
  };

  const handleSave = () => {
    if (!form.tanggal) return;
    // Calculate semen curah terbongkar
    const semenCurah = (form.opname2TotalVolume + form.pengeluaranZak) - form.opname1TotalVolume;
    const finalForm = { ...form, semenCurahTerbongkar: Math.round(semenCurah * 1000) / 1000 };
    if (editingItem) {
      saveData(KV_PREFIXES.siloOpname, { ...editingItem, ...finalForm });
    } else {
      saveData(KV_PREFIXES.siloOpname, { ...finalForm, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setDialogOpen(false); setEditingItem(null); setForm(EMPTY_FORM); loadData();
  };

  const handleDelete = (id: string) => { deleteData(KV_PREFIXES.siloOpname, id); setDeleteConfirm(null); loadData(); };
  const handleEdit = (item: SiloOpname) => {
    setEditingItem(item);
    setForm({
      tanggal: item.tanggal, jam: item.jam, kapal: item.kapal,
      opname1Tanggal: item.opname1Tanggal, opname1Jam: item.opname1Jam,
      opname1UkuranA: [...item.opname1UkuranA] as UkuranTuple,
      opname1UkuranB: [...item.opname1UkuranB] as UkuranTuple,
      opname1VolumeA: item.opname1VolumeA, opname1VolumeB: item.opname1VolumeB, opname1TotalVolume: item.opname1TotalVolume,
      opname2Tanggal: item.opname2Tanggal, opname2Jam: item.opname2Jam,
      opname2UkuranA: [...item.opname2UkuranA] as UkuranTuple,
      opname2UkuranB: [...item.opname2UkuranB] as UkuranTuple,
      opname2VolumeA: item.opname2VolumeA, opname2VolumeB: item.opname2VolumeB, opname2TotalVolume: item.opname2TotalVolume,
      pengeluaranZak: item.pengeluaranZak, semenCurahTerbongkar: item.semenCurahTerbongkar,
      catatan: item.catatan, petugas: item.petugas,
    });
    setDialogOpen(true);
  };

  // ─── Render Ukuran Input Row ────────────────────────
  const UkuranInputRow = ({ label, values, onChange }: { label: string; values: UkuranTuple; onChange: (i: number, v: number) => void }) => (
    <div>
      <label className="text-slate-500 text-xs mb-1 block">{label}</label>
      <div className="grid grid-cols-7 gap-1.5">
        {values.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-slate-400 text-[9px]">L{i + 1}</span>
            <input type="number" step="0.01" min="0" value={val || ''}
              onChange={(e) => onChange(i, parseFloat(e.target.value) || 0)}
              className="w-full px-1.5 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-slate-800 text-xs text-center focus:border-cyan-500/40 focus:outline-none" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Opname Silo</strong> — Berita acara opname stok silo sebelum dan sesudah pembongkaran semen curah dari kapal. Rekapitulasi penerimaan, pengeluaran, dan selisih opname.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Berita Acara Opname Silo</h1>
          <p className="text-slate-400 text-sm mt-1">Opname I (Sebelum Bongkar) &amp; Opname II (Sesudah Bongkar)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest as Record<string, unknown>), 'opname-silo-ywm')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/[0.12] text-slate-600 hover:bg-white/50 text-sm transition-all"><Download size={16} /> Ekspor</button>
          <button onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all"><Plus size={16} /> Input Opname</button>
        </div>
      </div>

      {/* Info Card */}
      <GlassCard variant="accent" className="p-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-cyan-600 flex-shrink-0 mt-0.5" />
          <div className="text-slate-500 text-xs space-y-1">
            <p className="font-medium text-slate-600">Format Berita Acara Opname Silo YWM</p>
            <p>Opname dilakukan 2 kali: <span className="text-cyan-600">Sebelum Bongkar</span> (Opname I) dan <span className="text-emerald-600">Sesudah Bongkar</span> (Opname II). Setiap opname mengukur kedalaman kekosongan di 7 lubang untuk Silo A dan Silo B.</p>
            <p>Semen Curah Terbongkar = (Vol. Opname II + Pengeluaran Zak) - Vol. Opname I</p>
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60">
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Tanggal</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Kapal</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Opname I (m³)</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Opname II (m³)</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Pengeluaran Zak</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Curah Terbongkar</th>
                <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs">Petugas</th>
                <th className="text-right px-3 py-3 text-slate-400 font-medium text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">Belum ada data opname</td></tr>
              ) : (
                paged.map((item) => (
                  <tr key={item.id} className="border-b border-white/60 hover:bg-white/[0.03] transition-colors">
                    <td className="px-3 py-2 text-slate-600 text-xs">{item.tanggal}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs flex items-center gap-1"><Ship size={12} className="text-cyan-600" />{item.kapal || '-'}</td>
                    <td className="px-3 py-2 text-slate-800 text-xs font-medium">{item.opname1TotalVolume.toLocaleString()}</td>
                    <td className="px-3 py-2 text-emerald-600 text-xs font-medium">{item.opname2TotalVolume.toLocaleString()}</td>
                    <td className="px-3 py-2 text-amber-600 text-xs">{item.pengeluaranZak} m/t</td>
                    <td className="px-3 py-2 text-cyan-600 text-xs font-bold">{item.semenCurahTerbongkar.toLocaleString()} m/t</td>
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
            <span className="text-slate-400 text-xs">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30">Sebelumnya</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30">Berikutnya</button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white/90 border-white/60 backdrop-blur-xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Berita Acara Opname Silo A &amp; B</DialogTitle>
            <DialogDescription className="text-slate-400">Input pengukuran kekosongan 7 lubang untuk Opname I &amp; II</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* General Info */}
            <div className="grid grid-cols-3 gap-3">
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
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Nama Kapal</label>
                <input value={form.kapal} onChange={(e) => setForm({ ...form, kapal: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="MV ..." />
              </div>
            </div>

            {/* ── Opname I (Sebelum Bongkar) ── */}
            <GlassCard className="p-4 space-y-3">
              <h3 className="text-cyan-600 font-semibold text-xs flex items-center gap-2"><Ship size={14} /> Opname I — Sebelum Bongkar</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-[10px] mb-0.5 block">Tanggal</label>
                  <input type="date" value={form.opname1Tanggal} onChange={(e) => setForm({ ...form, opname1Tanggal: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-slate-800 text-xs focus:border-cyan-500/40 focus:outline-none" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] mb-0.5 block">Jam</label>
                  <input type="time" value={form.opname1Jam} onChange={(e) => setForm({ ...form, opname1Jam: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-slate-800 text-xs focus:border-cyan-500/40 focus:outline-none" />
                </div>
              </div>
              <UkuranInputRow label="(a) Silo A — Kedalaman Kekosongan 1-7 (m)" values={form.opname1UkuranA} onChange={updateUkuranA1} />
              <div className="text-right text-cyan-600 text-xs font-medium">Vol. Silo A: {form.opname1VolumeA.toLocaleString()} m³</div>
              <UkuranInputRow label="(a) Silo B — Kedalaman Kekosongan 1-7 (m)" values={form.opname1UkuranB} onChange={updateUkuranB1} />
              <div className="text-right text-purple-600 text-xs font-medium">Vol. Silo B: {form.opname1VolumeB.toLocaleString()} m³</div>
              <div className="border-t border-white/60 pt-2 text-right">
                <span className="text-slate-500 text-xs">Total Opname I: </span>
                <span className="text-slate-800 font-bold text-sm">{form.opname1TotalVolume.toLocaleString()} m³</span>
              </div>
            </GlassCard>

            {/* ── Opname II (Sesudah Bongkar) ── */}
            <GlassCard className="p-4 space-y-3">
              <h3 className="text-emerald-600 font-semibold text-xs flex items-center gap-2"><Ship size={14} /> Opname II — Sesudah Bongkar</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-[10px] mb-0.5 block">Tanggal</label>
                  <input type="date" value={form.opname2Tanggal} onChange={(e) => setForm({ ...form, opname2Tanggal: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-slate-800 text-xs focus:border-cyan-500/40 focus:outline-none" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] mb-0.5 block">Jam</label>
                  <input type="time" value={form.opname2Jam} onChange={(e) => setForm({ ...form, opname2Jam: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-slate-800 text-xs focus:border-cyan-500/40 focus:outline-none" />
                </div>
              </div>
              <UkuranInputRow label="(a) Silo A — Kedalaman Kekosongan 1-7 (m)" values={form.opname2UkuranA} onChange={updateUkuranA2} />
              <div className="text-right text-cyan-600 text-xs font-medium">Vol. Silo A: {form.opname2VolumeA.toLocaleString()} m³</div>
              <UkuranInputRow label="(a) Silo B — Kedalaman Kekosongan 1-7 (m)" values={form.opname2UkuranB} onChange={updateUkuranB2} />
              <div className="text-right text-purple-600 text-xs font-medium">Vol. Silo B: {form.opname2VolumeB.toLocaleString()} m³</div>
              <div className="border-t border-white/60 pt-2 text-right">
                <span className="text-slate-500 text-xs">Total Opname II: </span>
                <span className="text-slate-800 font-bold text-sm">{form.opname2TotalVolume.toLocaleString()} m³</span>
              </div>
            </GlassCard>

            {/* ── Rekapitulasi ── */}
            <GlassCard variant="success" className="p-4 space-y-3">
              <h3 className="text-slate-800 font-semibold text-xs">Rekapitulasi</h3>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Pengeluaran sejak Opname I s/d II (m/t)</label>
                <input type="number" value={form.pengeluaranZak || ''} onChange={(e) => setForm({ ...form, pengeluaranZak: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" placeholder="0" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <p className="text-slate-400">Opname II + Pengeluaran</p>
                  <p className="text-slate-800 font-bold text-sm">{(form.opname2TotalVolume + form.pengeluaranZak).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Opname I</p>
                  <p className="text-slate-800 font-bold text-sm">{form.opname1TotalVolume.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Curah Terbongkar</p>
                  <p className="text-cyan-600 font-bold text-lg">{((form.opname2TotalVolume + form.pengeluaranZak) - form.opname1TotalVolume).toLocaleString()}</p>
                  <p className="text-slate-400 text-[9px]">m/t</p>
                </div>
              </div>
            </GlassCard>

            {/* Petugas & Catatan */}
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Petugas</label>
              <input value={form.petugas} onChange={(e) => setForm({ ...form, petugas: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Nama petugas" />
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Catatan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={2}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none resize-none" placeholder="Catatan tambahan (opsional)" />
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
        title="Hapus Data Opname?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />
      </>)}
    </div>
  );
}
