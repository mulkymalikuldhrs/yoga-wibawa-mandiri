// ============================================================
// SparePartsModule — Inventaris Suku Cadang
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, generateId, formatRupiah, exportToCSV } from '@/lib/supabase-data';
import { KV_PREFIXES, type SparePart } from '@/types/dashboard';
import {
  Plus,
  Download,
  Search,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Warehouse,
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

const KATEGORI_OPTIONS = ['Bearing', 'Belt', 'Conveyor', 'Filter', 'Seal', 'Motor', 'Gearbox', 'Lainnya'];
const SATUAN_OPTIONS = ['pcs', 'unit', 'meter', 'liter', 'kg', 'set'];

const EMPTY_FORM: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'> = {
  nama: '',
  kode: '',
  kategori: 'Bearing',
  stok: 0,
  stokMinimum: 5,
  satuan: 'pcs',
  lokasi: '',
  harga: 0,
  pemasok: '',
  catatan: '',
};

export default function SparePartsModule() {
  const [data, setData] = useState<SparePart[]>([]);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SparePart | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<SparePart>(KV_PREFIXES.sparePart);
    setData(items);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered data
  const filtered = data.filter((item) => {
    const matchSearch = search
      ? item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.kode.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchKategori = filterKategori ? item.kategori === filterKategori : true;
    return matchSearch && matchKategori;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const lowStockCount = data.filter((i) => i.stok <= i.stokMinimum).length;
  const totalValue = data.reduce((s, i) => s + i.stok * i.harga, 0);

  const handleSave = () => {
    if (!form.nama || !form.kode) return;
    if (editingItem) {
      saveData(KV_PREFIXES.sparePart, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.sparePart, {
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
    deleteData(KV_PREFIXES.sparePart, id);
    setDeleteConfirm(null);
    loadData();
  };

  const handleEdit = (item: SparePart) => {
    setEditingItem(item);
    setForm({
      nama: item.nama,
      kode: item.kode,
      kategori: item.kategori,
      stok: item.stok,
      stokMinimum: item.stokMinimum,
      satuan: item.satuan,
      lokasi: item.lokasi,
      harga: item.harga,
      pemasok: item.pemasok,
      catatan: item.catatan,
    });
    setDialogOpen(true);
  };

  const handleExport = () => {
    exportToCSV(
      filtered.map(({ id, createdAt, updatedAt, ...rest }) => rest),
      'suku-cadang-ywm'
    );
  };

  const getStockColor = (stok: number, min: number) => {
    if (stok <= min * 0.5) return 'text-red-600';
    if (stok <= min) return 'text-red-600';
    if (stok <= min * 1.5) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getStockBg = (stok: number, min: number) => {
    if (stok <= min * 0.5) return 'bg-red-100/80';
    if (stok <= min) return 'bg-red-100/80';
    if (stok <= min * 1.5) return 'bg-amber-100/80';
    return 'bg-emerald-100/80';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Suku Cadang</strong> — Kelola inventaris suku cadang mesin dan peralatan pabrik. Pantau stok minimum, lokasi penyimpanan, dan informasi pemasok untuk menjaga ketersediaan operasional.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Inventaris Suku Cadang</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola stok suku cadang pabrik pengantongan semen</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100/80 flex items-center justify-center">
              <Package size={18} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{data.length}</p>
              <p className="text-slate-400 text-xs">Total Item</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100/80 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{lowStockCount}</p>
              <p className="text-slate-400 text-xs">Stok Rendah</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center">
              <Warehouse size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{formatRupiah(totalValue)}</p>
              <p className="text-slate-400 text-xs">Nilai Inventaris</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 flex items-center justify-center">
              <Package size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{new Set(data.map(d => d.kategori)).size}</p>
              <p className="text-slate-400 text-xs">Kategori</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau kode..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none transition-all"
            />
          </div>
          <select
            value={filterKategori}
            onChange={(e) => { setFilterKategori(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[150px]"
          >
            <option value="" className="bg-white/90">Semua Kategori</option>
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k} value={k} className="bg-white/90">{k}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/60">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Kode</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Nama</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Kategori</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Stok</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Min</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Satuan</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Lokasi</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Harga</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Pemasok</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400">Tidak ada data</td>
                </tr>
              ) : (
                paged.map((item) => (
                  <tr key={item.id} className="border-b border-white/60 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-cyan-600 font-mono text-xs">{item.kode}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{item.nama}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-white/40 text-slate-500 text-xs">{item.kategori}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStockBg(item.stok, item.stokMinimum), getStockColor(item.stok, item.stokMinimum))}>
                        {item.stok}
                        {item.stok <= item.stokMinimum && ' ⚠'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.stokMinimum}</td>
                    <td className="px-4 py-3 text-slate-500">{item.satuan}</td>
                    <td className="px-4 py-3 text-slate-500">{item.lokasi}</td>
                    <td className="px-4 py-3 text-slate-600">{formatRupiah(item.harga)}</td>
                    <td className="px-4 py-3 text-slate-500">{item.pemasok}</td>
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
                ))
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
            <DialogTitle className="text-slate-800">{editingItem ? 'Edit Suku Cadang' : 'Tambah Suku Cadang'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingItem ? 'Perbarui data suku cadang' : 'Isi data suku cadang baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Kode *</label>
                <input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="BRG-001" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Kategori</label>
                <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {KATEGORI_OPTIONS.map((k) => <option key={k} value={k} className="bg-white/90">{k}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Nama Suku Cadang *</label>
              <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Bearing SKF 6205" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Stok</label>
                <input type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Stok Minimum</label>
                <input type="number" value={form.stokMinimum} onChange={(e) => setForm({ ...form, stokMinimum: Number(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Satuan</label>
                <select value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {SATUAN_OPTIONS.map((s) => <option key={s} value={s} className="bg-white/90">{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Lokasi</label>
              <input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Gudang A-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Harga (Rp)</label>
                <input type="number" value={form.harga} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Pemasok</label>
                <input value={form.pemasok} onChange={(e) => setForm({ ...form, pemasok: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="PT. ..." />
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
        title="Hapus Suku Cadang?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />
      </>)}
    </div>
  );
}
