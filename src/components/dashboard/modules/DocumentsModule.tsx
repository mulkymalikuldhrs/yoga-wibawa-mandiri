// ============================================================
// DocumentsModule — Dokumen & OCR
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, saveData, deleteData, generateId } from '@/lib/supabase-data';
import { KV_PREFIXES, type Document } from '@/types/dashboard';
import {
  Plus, Search, FileText, Upload, File, FileCheck, FileWarning, Trash2, Eye, ScanLine,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import DeleteConfirmDialog from '@/components/dashboard/DeleteConfirmDialog';

const JENIS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  kontrak: { color: 'text-blue-600', bg: 'bg-blue-100/80', label: 'Kontrak', icon: <FileCheck size={14} /> },
  laporan: { color: 'text-emerald-600', bg: 'bg-emerald-100/80', label: 'Laporan', icon: <FileText size={14} /> },
  manual: { color: 'text-purple-600', bg: 'bg-purple-100/80', label: 'Manual', icon: <File size={14} /> },
  sertifikat: { color: 'text-amber-600', bg: 'bg-amber-100/80', label: 'Sertifikat', icon: <FileCheck size={14} /> },
  lainnya: { color: 'text-slate-500', bg: 'bg-white/40', label: 'Lainnya', icon: <FileWarning size={14} /> },
};

const EMPTY_FORM: Omit<Document, 'id' | 'createdAt' | 'updatedAt'> = {
  nama: '', jenis: 'manual', kategori: '', ukuran: 0, url: '#', ocrText: '',
  diunggahOleh: '', catatan: '',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function DocumentsModule() {
  const [data, setData] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Document | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    const items = await getData<Document>(KV_PREFIXES.document);
    setData(items);
    setLoading(false);
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter((item) => {
    const matchSearch = search ? item.nama.toLowerCase().includes(search.toLowerCase()) || item.kategori.toLowerCase().includes(search.toLowerCase()) : true;
    const matchJenis = filterJenis ? item.jenis === filterJenis : true;
    return matchSearch && matchJenis;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalDocs = data.length;
  const totalSize = data.reduce((s, d) => s + d.ukuran, 0);

  const handleSave = () => {
    if (!form.nama) return;
    if (editingItem) {
      saveData(KV_PREFIXES.document, { ...editingItem, ...form });
    } else {
      saveData(KV_PREFIXES.document, { ...form, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setDialogOpen(false); setEditingItem(null); setForm(EMPTY_FORM); loadData();
  };

  const handleDelete = (id: string) => { deleteData(KV_PREFIXES.document, id); setDeleteConfirm(null); loadData(); };
  const handleEdit = (item: Document) => {
    setEditingItem(item);
    setForm({ nama: item.nama, jenis: item.jenis, kategori: item.kategori, ukuran: item.ukuran, url: item.url, ocrText: item.ocrText, diunggahOleh: item.diunggahOleh, catatan: item.catatan });
    setDialogOpen(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // In a real app, handle file upload here
    setForm({ ...EMPTY_FORM, nama: 'Dokumen Baru', ukuran: 1024000, diunggahOleh: 'User' });
    setDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Dokumen & OCR</strong> — Pengelolaan dokumen perusahaan dengan kemampuan OCR. Unggah kontrak, manual, laporan, dan sertifikat untuk penyimpanan dan pencarian digital.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dokumen & OCR</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola dokumen perusahaan dengan OCR</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm hover:opacity-90 transition-all"><Plus size={16} /> Unggah</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100/80 flex items-center justify-center"><FileText size={18} className="text-cyan-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{totalDocs}</p><p className="text-slate-400 text-xs">Total Dokumen</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 flex items-center justify-center"><File size={18} className="text-purple-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{formatFileSize(totalSize)}</p><p className="text-slate-400 text-xs">Total Ukuran</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center"><FileCheck size={18} className="text-emerald-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{data.filter((d) => d.jenis === 'kontrak').length}</p><p className="text-slate-400 text-xs">Kontrak</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center"><ScanLine size={18} className="text-amber-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{data.filter((d) => d.ocrText).length}</p><p className="text-slate-400 text-xs">Dengan OCR</p></div>
          </div>
        </GlassCard>
      </div>

      {/* Upload Area */}
      <GlassCard
        className={cn('p-8 border-2 border-dashed transition-all cursor-pointer', dragOver ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/60 hover:border-slate-200/50')}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setDialogOpen(true); }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center">
            <Upload size={24} className="text-slate-400" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Seret & lepas dokumen di sini</p>
            <p className="text-slate-400 text-xs mt-1">atau klik untuk memilih file — PDF, DOC, XLS, JPG</p>
          </div>
        </div>
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari nama dokumen atau kategori..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" />
          </div>
          <select value={filterJenis} onChange={(e) => { setFilterJenis(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none min-w-[150px]">
            <option value="" className="bg-white/90">Semua Jenis</option>
            {Object.entries(JENIS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-white/90">{v.label}</option>)}
          </select>
        </div>
      </GlassCard>

      {/* Document List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {paged.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">Tidak ada dokumen</div>
        ) : (
          paged.map((item) => {
            const jc = JENIS_CONFIG[item.jenis] || JENIS_CONFIG.lainnya;
            return (
              <GlassCard key={item.id} className="p-4 hover:bg-white/50 transition-all group">
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', jc.bg, jc.color)}>
                    {jc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-800 font-medium text-sm truncate">{item.nama}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', jc.bg, jc.color)}>{jc.label}</span>
                      <span className="text-slate-400 text-[10px]">{formatFileSize(item.ukuran)}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1.5">Diunggah oleh: {item.diunggahOleh}</p>
                    {item.kategori && <p className="text-slate-800/20 text-[10px]">Kategori: {item.kategori}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/60">
                  <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/40 text-slate-400 text-xs hover:bg-white/50 hover:text-slate-500 transition-all">
                    <Eye size={12} /> Lihat
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/40 text-slate-400 text-xs hover:bg-white/50 hover:text-cyan-600 transition-all">
                    <ScanLine size={12} /> OCR
                  </button>
                  <button onClick={() => handleEdit(item)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/40 text-slate-400 text-xs hover:bg-white/50 hover:text-amber-600 transition-all">
                    Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(item.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/40 text-slate-400 text-xs hover:bg-white/50 hover:text-red-600 transition-all ml-auto">
                    <Trash2 size={12} />
                  </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30">Sebelumnya</button>
          <span className="text-slate-400 text-xs">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-white/40 text-slate-500 text-xs hover:bg-white/50 disabled:opacity-30">Berikutnya</button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white/90 border-white/60 backdrop-blur-xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">{editingItem ? 'Edit Dokumen' : 'Unggah Dokumen'}</DialogTitle>
            <DialogDescription className="text-slate-400">{editingItem ? 'Perbarui data dokumen' : 'Isi informasi dokumen'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Nama Dokumen *</label>
              <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Nama dokumen" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Jenis</label>
                <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as Document['jenis'] })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
                  {Object.entries(JENIS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-white/90">{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Kategori</label>
                <input value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="SOP, Penjualan, dll" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Diunggah Oleh</label>
                <input value={form.diunggahOleh} onChange={(e) => setForm({ ...form, diunggahOleh: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none" placeholder="Nama" />
              </div>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Ukuran (bytes)</label>
                <input type="number" value={form.ukuran} onChange={(e) => setForm({ ...form, ukuran: Number(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm focus:border-cyan-500/40 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Catatan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={2} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1 block">Teks OCR (opsional)</label>
              <textarea value={form.ocrText} onChange={(e) => setForm({ ...form, ocrText: e.target.value })} rows={3} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none resize-none" placeholder="Hasil OCR akan muncul di sini..." />
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
        title="Hapus Dokumen?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />
      </>)}
    </div>
  );
}
