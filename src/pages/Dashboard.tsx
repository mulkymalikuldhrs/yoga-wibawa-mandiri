// ============================================================
// Dashboard Page — YWM AI Dashboard
// PT. Yoga Wibawa Mandiri — Cement Packaging Company
// All text in Bahasa Indonesia
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GlassCard, { GlassCardHeader, GlassCardContent } from '@/components/dashboard/GlassCard';
import { playNotificationBeep } from '@/lib/audio';
import type {
  DashboardModule,
  SparePart,
  TeamActivity,
  MaintenanceRecord,
  SafetyIncident,
  Document,
  Notification,
} from '@/types/dashboard';
import {
  Package,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Bell,
  TrendingUp,
  Users,
  Plus,
  Search,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BarChart3,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  ChevronRight,
  MapPin,
  Phone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// ── localStorage helpers ──
const STORAGE_KEYS: Record<string, string> = {
  'spare-parts': 'ywm_data_spare-parts',
  'team-activity': 'ywm_data_team-activity',
  maintenance: 'ywm_data_maintenance',
  safety: 'ywm_data_safety',
  documents: 'ywm_data_documents',
  notifications: 'ywm_data_notifications',
};

function loadData<T>(module: string): T[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[module] || `ywm_data_${module}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveData<T>(module: string, data: T[]) {
  localStorage.setItem(STORAGE_KEYS[module] || `ywm_data_${module}`, JSON.stringify(data));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function nowISO() {
  return new Date().toISOString();
}

// ── Seed sample data if empty ──
function seedIfNeeded() {
  // Spare Parts
  if (loadData<SparePart>('spare-parts').length === 0) {
    const parts: SparePart[] = [
      { id: genId(), nama: 'Nozzle Packer A1', kode: 'NP-A1', kategori: 'Packer', stok: 12, stokMinimum: 5, satuan: 'pcs', lokasi: 'Gudang A', harga: 1500000, pemasok: 'PT. Semen Indo', catatan: 'Nozzle utama packer A1', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), nama: 'Belt Conveyor 500mm', kode: 'BC-500', kategori: 'Conveyor', stok: 3, stokMinimum: 2, satuan: 'roll', lokasi: 'Gudang B', harga: 8500000, pemasok: 'PT. Belt Indo', catatan: 'Belt conveyor utama', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), nama: 'Bearing SKF 6308', kode: 'BR-6308', kategori: 'Bearing', stok: 8, stokMinimum: 4, satuan: 'pcs', lokasi: 'Gudang A', harga: 450000, pemasok: 'PT. Bearing Jaya', catatan: 'Bearing untuk motor conveyor', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), nama: 'Seal Hydraulic 50mm', kode: 'SH-50', kategori: 'Seal', stok: 2, stokMinimum: 3, satuan: 'pcs', lokasi: 'Gudang A', harga: 280000, pemasok: 'PT. Seal Tech', catatan: 'Seal hidrolik silo', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), nama: 'Filter Udara Kompressor', kode: 'FU-K01', kategori: 'Filter', stok: 1, stokMinimum: 3, satuan: 'pcs', lokasi: 'Gudang C', harga: 750000, pemasok: 'PT. Filter Indo', catatan: 'Filter udara kompressor utama', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), nama: 'V-Belt B-68', kode: 'VB-68', kategori: 'Belt', stok: 15, stokMinimum: 5, satuan: 'pcs', lokasi: 'Gudang A', harga: 125000, pemasok: 'PT. Belt Indo', catatan: 'V-belt untuk motor packer', createdAt: nowISO(), updatedAt: nowISO() },
    ];
    saveData('spare-parts', parts);
  }

  // Team Activity
  if (loadData<TeamActivity>('team-activity').length === 0) {
    const team: TeamActivity[] = [
      { id: genId(), namaKaryawan: 'Ahmad Fauzi', divisi: 'Produksi', aktivitas: 'Operasi Packer A', status: 'hadir', jamMasuk: '07:00', jamKeluar: '15:00', tanggal: new Date().toISOString().slice(0, 10), catatan: '', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), namaKaryawan: 'Budi Santoso', divisi: 'Maintenance', aktivitas: 'Perawatan Conveyor', status: 'hadir', jamMasuk: '07:00', jamKeluar: '15:00', tanggal: new Date().toISOString().slice(0, 10), catatan: '', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), namaKaryawan: 'Citra Dewi', divisi: 'Quality Control', aktivitas: 'Inspeksi Kualitas', status: 'hadir', jamMasuk: '07:00', jamKeluar: '15:00', tanggal: new Date().toISOString().slice(0, 10), catatan: '', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), namaKaryawan: 'Dedi Kurniawan', divisi: 'Produksi', aktivitas: 'Operasi Packer B', status: 'izin', jamMasuk: '-', jamKeluar: '-', tanggal: new Date().toISOString().slice(0, 10), catatan: 'Izin keperluan keluarga', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), namaKaryawan: 'Eka Putra', divisi: 'Gudang', aktivitas: 'Loading & Unloading', status: 'lembur', jamMasuk: '07:00', jamKeluar: '19:00', tanggal: new Date().toISOString().slice(0, 10), catatan: 'Lembur loading curah', createdAt: nowISO(), updatedAt: nowISO() },
    ];
    saveData('team-activity', team);
  }

  // Maintenance
  if (loadData<MaintenanceRecord>('maintenance').length === 0) {
    const maint: MaintenanceRecord[] = [
      { id: genId(), judul: 'Perawatan Rutin Packer A', mesin: 'Packer A', jenis: 'preventif', prioritas: 'sedang', status: 'berjalan', tanggalMulai: new Date().toISOString().slice(0, 10), tanggalSelesai: '', teknisi: 'Budi Santoso', estimasiBiaya: 2500000, catatan: 'Ganti nozzle & seal', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), judul: 'Perbaikan Belt Conveyor #3', mesin: 'Conveyor #3', jenis: 'korektif', prioritas: 'tinggi', status: 'terjadwal', tanggalMulai: new Date(Date.now() + 86400000).toISOString().slice(0, 10), tanggalSelesai: '', teknisi: 'Rizki Hidayat', estimasiBiaya: 5000000, catatan: 'Belt slip & misalignment', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), judul: 'Overhaul Kompressor Utama', mesin: 'Kompressor #1', jenis: 'preventif', prioritas: 'kritis', status: 'terjadwal', tanggalMulai: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), tanggalSelesai: '', teknisi: 'Team Maintenance', estimasiBiaya: 15000000, catatan: 'Overhaul berkala 6 bulan', createdAt: nowISO(), updatedAt: nowISO() },
    ];
    saveData('maintenance', maint);
  }

  // Safety
  if (loadData<SafetyIncident>('safety').length === 0) {
    const safety: SafetyIncident[] = [
      { id: genId(), judul: 'Tumpahan Semen di Area Loading', tanggal: new Date().toISOString().slice(0, 10), lokasi: 'Area Loading Curah', severity: 'ringan', status: 'selesai', pelapor: 'Eka Putra', korban: '-', deskripsi: 'Tumpahan semen curah akibat overflow silo', tindakan: 'Pembersihan segera & perbaikan sensor level', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), judul: 'Kecelakaan Ringan di Conveyor', tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10), lokasi: 'Conveyor Belt #2', severity: 'sedang', status: 'investigasi', pelapor: 'Ahmad Fauzi', korban: 'Hendra Wijaya', deskripsi: 'Jari terjepit roller conveyor', tindakan: 'P3K & investigasi sedang berjalan', createdAt: nowISO(), updatedAt: nowISO() },
    ];
    saveData('safety', safety);
  }

  // Notifications
  if (loadData<Notification>('notifications').length === 0) {
    const notifs: Notification[] = [
      { id: genId(), judul: 'Stok Filter Udara Rendah', pesan: 'Filter Udara Kompressor (FU-K01) stok hanya 1 pcs, minimum 3 pcs', tipe: 'peringatan', dibaca: false, modul: 'spare-parts', link: '/dashboard', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), judul: 'Work Order Overdue', pesan: 'Perbaikan Belt Conveyor #3 sudah melewati jadwal', tipe: 'bahaya', dibaca: false, modul: 'maintenance', link: '/dashboard', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), judul: 'Perawatan Selesai', pesan: 'Perawatan rutin Packer A telah selesai', tipe: 'sukses', dibaca: true, modul: 'maintenance', link: '/dashboard', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), judul: 'Karyawan Izin', pesan: 'Dedi Kurniawan izin hari ini', tipe: 'info', dibaca: true, modul: 'team-activity', link: '/dashboard', createdAt: nowISO(), updatedAt: nowISO() },
    ];
    saveData('notifications', notifs);
  }
}

// ── Chart data ──
const PRODUCTION_DATA = [
  { bulan: 'Jan', zak: 4200, curah: 1800 },
  { bulan: 'Feb', zak: 3800, curah: 2100 },
  { bulan: 'Mar', zak: 4500, curah: 1700 },
  { bulan: 'Apr', zak: 4100, curah: 2000 },
  { bulan: 'Mei', zak: 4600, curah: 2200 },
  { bulan: 'Jun', zak: 3900, curah: 1900 },
  { bulan: 'Jul', zak: 4800, curah: 2300 },
  { bulan: 'Agu', zak: 4400, curah: 2100 },
  { bulan: 'Sep', zak: 4700, curah: 2000 },
  { bulan: 'Okt', zak: 4300, curah: 1800 },
  { bulan: 'Nov', zak: 4100, curah: 2100 },
  { bulan: 'Des', zak: 4500, curah: 2400 },
];

const MAINTENANCE_TREND = [
  { bulan: 'Jan', preventif: 8, korektif: 3, darurat: 1 },
  { bulan: 'Feb', preventif: 7, korektif: 5, darurat: 2 },
  { bulan: 'Mar', preventif: 9, korektif: 2, darurat: 0 },
  { bulan: 'Apr', preventif: 6, korektif: 4, darurat: 1 },
  { bulan: 'Mei', preventif: 10, korektif: 3, darurat: 1 },
  { bulan: 'Jun', preventif: 8, korektif: 2, darurat: 0 },
];

const STOCK_PIE = [
  { name: 'Aman', value: 45, color: '#22c55e' },
  { name: 'Peringatan', value: 15, color: '#eab308' },
  { name: 'Kritis', value: 8, color: '#ef4444' },
];

const CHART_COLORS = {
  red: '#C62828',
  amber: '#f59e0b',
  emerald: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
};

// ── Custom tooltip ──
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value?.toLocaleString('id-ID')}
        </p>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// DASHBOARD PAGE COMPONENT
// ══════════════════════════════════════════════════════════

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<DashboardModule>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // ── Data states ──
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [safety, setSafety] = useState<SafetyIncident[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ── Add form states ──
  const [newSparePart, setNewSparePart] = useState({ nama: '', kode: '', kategori: '', stok: 0, stokMinimum: 0, satuan: 'pcs', lokasi: '', harga: 0, pemasok: '', catatan: '' });
  const [newTeam, setNewTeam] = useState({ namaKaryawan: '', divisi: '', aktivitas: '', status: 'hadir' as TeamActivity['status'], jamMasuk: '', jamKeluar: '', tanggal: new Date().toISOString().slice(0, 10), catatan: '' });
  const [newMaintenance, setNewMaintenance] = useState({ judul: '', mesin: '', jenis: 'preventif' as MaintenanceRecord['jenis'], prioritas: 'sedang' as MaintenanceRecord['prioritas'], status: 'terjadwal' as MaintenanceRecord['status'], tanggalMulai: new Date().toISOString().slice(0, 10), tanggalSelesai: '', teknisi: '', estimasiBiaya: 0, catatan: '' });
  const [newSafety, setNewSafety] = useState({ judul: '', tanggal: new Date().toISOString().slice(0, 10), lokasi: '', severity: 'ringan' as SafetyIncident['severity'], status: 'dilaporkan' as SafetyIncident['status'], pelapor: '', korban: '', deskripsi: '', tindakan: '' });
  const [newDocument, setNewDocument] = useState({ nama: '', jenis: 'laporan' as Document['jenis'], kategori: '', catatan: '' });
  const [newNotification, setNewNotification] = useState({ judul: '', pesan: '', tipe: 'info' as Notification['tipe'], modul: 'overview' });

  // ── Seed & load data ──
  useEffect(() => {
    seedIfNeeded();
    setSpareParts(loadData<SparePart>('spare-parts'));
    setTeamActivity(loadData<TeamActivity>('team-activity'));
    setMaintenance(loadData<MaintenanceRecord>('maintenance'));
    setSafety(loadData<SafetyIncident>('safety'));
    setDocuments(loadData<Document>('documents'));
    setNotifications(loadData<Notification>('notifications'));
  }, []);

  // ── Refresh data on module change ──
  useEffect(() => {
    setSearchTerm('');
    setShowAddForm(false);
    setSpareParts(loadData<SparePart>('spare-parts'));
    setTeamActivity(loadData<TeamActivity>('team-activity'));
    setMaintenance(loadData<MaintenanceRecord>('maintenance'));
    setSafety(loadData<SafetyIncident>('safety'));
    setDocuments(loadData<Document>('documents'));
    setNotifications(loadData<Notification>('notifications'));
  }, [activeModule]);

  // ── CRUD helpers ──
  const addItem = useCallback(<T,>(module: string, setter: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
    const current = loadData<T>(module);
    const withId = { ...item, id: genId(), createdAt: nowISO(), updatedAt: nowISO() } as T;
    const updated = [withId, ...current];
    saveData(module, updated);
    setter(updated);
    setShowAddForm(false);
  }, []);

  const deleteItem = useCallback(<T extends { id: string }>(module: string, setter: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
    const current = loadData<T>(module);
    const updated = current.filter(i => i.id !== id);
    saveData(module, updated);
    setter(updated);
  }, []);

  // ── Stats computation ──
  const stats = {
    totalSpareParts: spareParts.length,
    lowStockItems: spareParts.filter(p => p.stok <= p.stokMinimum).length,
    activeMaintenance: maintenance.filter(m => m.status === 'berjalan' || m.status === 'terjadwal').length,
    openIncidents: safety.filter(s => s.status !== 'ditutup' && s.status !== 'selesai').length,
    unreadNotifications: notifications.filter(n => !n.dibaca).length,
  };

  // ── Stock status indicator ──
  const stockStatus = (stok: number, min: number) => {
    if (stok <= min * 0.5) return { color: 'bg-red-500', label: 'Kritis', textColor: 'text-red-400' };
    if (stok <= min) return { color: 'bg-yellow-500', label: 'Rendah', textColor: 'text-yellow-400' };
    return { color: 'bg-emerald-500', label: 'Aman', textColor: 'text-emerald-400' };
  };

  // ── Priority badge ──
  const priorityBadge = (p: string) => {
    switch (p) {
      case 'kritis': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'tinggi': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'sedang': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rendah': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  // ── Severity badge ──
  const severityBadge = (s: string) => {
    switch (s) {
      case 'fatal': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'berat': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'sedang': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'ringan': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  // ── Notification type badge ──
  const notifTypeBadge = (t: string) => {
    switch (t) {
      case 'bahaya': return 'bg-red-500/20 text-red-400';
      case 'peringatan': return 'bg-yellow-500/20 text-yellow-400';
      case 'sukses': return 'bg-emerald-500/20 text-emerald-400';
      case 'info': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  // ══════════════════════════════════════════════════════════
  // OVERVIEW MODULE
  // ══════════════════════════════════════════════════════════
  const renderOverview = () => {
    const statCards = [
      { label: 'Total Suku Cadang', value: stats.totalSpareParts, icon: <Package size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+3', up: true },
      { label: 'Stok Rendah', value: stats.lowStockItems, icon: <AlertTriangle size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', trend: '+1', up: false },
      { label: 'Perawatan Aktif', value: stats.activeMaintenance, icon: <Wrench size={20} />, color: 'text-orange-400', bg: 'bg-orange-500/10', trend: '0', up: true },
      { label: 'Insiden Terbuka', value: stats.openIncidents, icon: <ShieldCheck size={20} />, color: 'text-red-400', bg: 'bg-red-500/10', trend: '-1', up: true },
      { label: 'Notifikasi Baru', value: stats.unreadNotifications, icon: <Bell size={20} />, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '+2', up: false },
    ];

    const recentActivity = [
      { time: '10:30', desc: 'Perawatan Packer A dimulai', type: 'maintenance' },
      { time: '09:15', desc: 'Dedi Kurniawan izin hari ini', type: 'team' },
      { time: '08:45', desc: 'Stok Filter Udara di bawah minimum', type: 'alert' },
      { time: '08:00', desc: 'Shift pagi dimulai — 5 karyawan hadir', type: 'info' },
      { time: '07:30', desc: 'Inspeksi harian conveyor selesai', type: 'safety' },
    ];

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Ringkasan Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">PT. Yoga Wibawa Mandiri — {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <GlassCard key={card.label} glow className="p-4">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.trend}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{card.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Production Chart */}
          <GlassCard className="lg:col-span-2">
            <GlassCardHeader>
              <h2 className="text-white font-semibold text-sm">Produksi Bulanan (ton)</h2>
              <span className="text-white/30 text-xs">2024</span>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PRODUCTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="bulan" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="zak" name="Zak 40kg" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="curah" name="Curah" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-white font-semibold text-sm">Aktivitas Terbaru</h2>
              <Activity size={16} className="text-white/30" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-white/80 text-sm">{act.desc}</p>
                      <p className="text-white/30 text-xs mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Quick Actions & Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-white font-semibold text-sm">Aksi Cepat</h2>
              <Zap size={16} className="text-yellow-400" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tambah Suku Cadang', icon: <Package size={16} />, mod: 'spare-parts' as DashboardModule },
                  { label: 'Buat Work Order', icon: <Wrench size={16} />, mod: 'maintenance' as DashboardModule },
                  { label: 'Laporkan Insiden', icon: <ShieldCheck size={16} />, mod: 'safety' as DashboardModule },
                  { label: 'Lihat Notifikasi', icon: <Bell size={16} />, mod: 'notifications' as DashboardModule },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => { setActiveModule(action.mod); setShowAddForm(true); }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm"
                  >
                    <span className="text-red-400">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Company Info */}
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-white font-semibold text-sm">Informasi Perusahaan</h2>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white/60">Jl. Pelabuhan Umum, Kr. Geukuh, Aceh Utara</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/60">Pesan: +6285322624048</p>
                    <p className="text-white/60">Kontak: +6285322624038</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white/60">Semen Padang PCC, Zak 40kg & Curah max 30 ton</span>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // SPARE PARTS MODULE
  // ══════════════════════════════════════════════════════════
  const renderSpareParts = () => {
    const filtered = spareParts.filter(p =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kategori.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Suku Cadang</h1>
            <p className="text-white/40 text-sm">Inventaris suku cadang pabrik</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium"
          >
            <Plus size={16} /> Tambah Suku Cadang
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Cari suku cadang..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/30 focus:bg-white/[0.07] transition-all"
          />
        </div>

        {/* Add Form */}
        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-400 font-semibold text-sm">Tambah Suku Cadang Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Nama', key: 'nama', type: 'text' },
                  { label: 'Kode', key: 'kode', type: 'text' },
                  { label: 'Kategori', key: 'kategori', type: 'text' },
                  { label: 'Stok', key: 'stok', type: 'number' },
                  { label: 'Stok Minimum', key: 'stokMinimum', type: 'number' },
                  { label: 'Satuan', key: 'satuan', type: 'text' },
                  { label: 'Lokasi', key: 'lokasi', type: 'text' },
                  { label: 'Harga', key: 'harga', type: 'number' },
                  { label: 'Pemasok', key: 'pemasok', type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-white/40 text-xs mb-1 block">{field.label}</label>
                    <input
                      type={field.type}
                      value={(newSparePart as any)[field.key]}
                      onChange={e => setNewSparePart(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-white/40 text-xs mb-1 block">Catatan</label>
                <input
                  type="text"
                  value={newSparePart.catatan}
                  onChange={e => setNewSparePart(prev => ({ ...prev, catatan: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all"
                />
              </div>
              <button
                onClick={() => {
                  if (!newSparePart.nama || !newSparePart.kode) return;
                  addItem('spare-parts', setSpareParts, newSparePart);
                  setNewSparePart({ nama: '', kode: '', kategori: '', stok: 0, stokMinimum: 0, satuan: 'pcs', lokasi: '', harga: 0, pemasok: '', catatan: '' });
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium"
              >
                Simpan
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* List */}
        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Package size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Belum ada data suku cadang</p>
            </GlassCard>
          ) : (
            filtered.map(part => {
              const status = stockStatus(part.stok, part.stokMinimum);
              return (
                <GlassCard key={part.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
                      <div>
                        <h3 className="text-white font-medium text-sm">{part.nama}</h3>
                        <p className="text-white/40 text-xs">{part.kode} • {part.kategori} • {part.lokasi}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white font-semibold text-sm">{part.stok} {part.satuan}</p>
                        <p className={`text-xs ${status.textColor}`}>{status.label} (min: {part.stokMinimum})</p>
                      </div>
                      <button
                        onClick={() => deleteItem('spare-parts', setSpareParts, part.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // TEAM ACTIVITY MODULE
  // ══════════════════════════════════════════════════════════
  const renderTeamActivity = () => {
    const filtered = teamActivity.filter(t =>
      t.namaKaryawan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.divisi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColor: Record<string, string> = {
      hadir: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      izin: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      sakit: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      alpha: 'bg-red-500/20 text-red-400 border-red-500/30',
      lembur: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Aktivitas Tim</h1>
            <p className="text-white/40 text-sm">Kehadiran & aktivitas karyawan</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium"
          >
            <Plus size={16} /> Tambah Aktivitas
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Cari karyawan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/30 transition-all"
          />
        </div>

        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-400 font-semibold text-sm">Tambah Aktivitas Karyawan</h2>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Nama Karyawan</label>
                  <input type="text" value={newTeam.namaKaryawan} onChange={e => setNewTeam(p => ({ ...p, namaKaryawan: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Divisi</label>
                  <input type="text" value={newTeam.divisi} onChange={e => setNewTeam(p => ({ ...p, divisi: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Aktivitas</label>
                  <input type="text" value={newTeam.aktivitas} onChange={e => setNewTeam(p => ({ ...p, aktivitas: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Status</label>
                  <select value={newTeam.status} onChange={e => setNewTeam(p => ({ ...p, status: e.target.value as TeamActivity['status'] }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all">
                    <option value="hadir">Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="alpha">Alpha</option>
                    <option value="lembur">Lembur</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Jam Masuk</label>
                  <input type="time" value={newTeam.jamMasuk} onChange={e => setNewTeam(p => ({ ...p, jamMasuk: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Jam Keluar</label>
                  <input type="time" value={newTeam.jamKeluar} onChange={e => setNewTeam(p => ({ ...p, jamKeluar: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" />
                </div>
              </div>
              <button onClick={() => { if (!newTeam.namaKaryawan) return; addItem('team-activity', setTeamActivity, newTeam); setNewTeam({ namaKaryawan: '', divisi: '', aktivitas: '', status: 'hadir', jamMasuk: '', jamKeluar: '', tanggal: new Date().toISOString().slice(0, 10), catatan: '' }); }} className="mt-4 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
                Simpan
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Users size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Belum ada data aktivitas tim</p>
            </GlassCard>
          ) : (
            filtered.map(member => (
              <GlassCard key={member.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 font-semibold text-sm">
                      {member.namaKaryawan.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{member.namaKaryawan}</h3>
                      <p className="text-white/40 text-xs">{member.divisi} • {member.aktivitas}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor[member.status] || 'bg-white/10 text-white/60'}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                    <span className="text-white/30 text-xs">{member.jamMasuk}—{member.jamKeluar}</span>
                    <button onClick={() => deleteItem('team-activity', setTeamActivity, member.id)} className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // MAINTENANCE MODULE
  // ══════════════════════════════════════════════════════════
  const renderMaintenance = () => {
    const filtered = maintenance.filter(m =>
      m.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mesin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusLabel: Record<string, { color: string; icon: React.ReactNode }> = {
      terjadwal: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Clock size={12} /> },
      berjalan: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Activity size={12} /> },
      selesai: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <CheckCircle2 size={12} /> },
      dibatalkan: { color: 'bg-white/10 text-white/40 border-white/20', icon: <X size={12} /> },
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Perawatan</h1>
            <p className="text-white/40 text-sm">Work order & jadwal perawatan mesin</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
            <Plus size={16} /> Buat Work Order
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Cari work order..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/30 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-400 font-semibold text-sm">Buat Work Order Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label className="text-white/40 text-xs mb-1 block">Judul</label><input type="text" value={newMaintenance.judul} onChange={e => setNewMaintenance(p => ({ ...p, judul: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Mesin</label><input type="text" value={newMaintenance.mesin} onChange={e => setNewMaintenance(p => ({ ...p, mesin: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Jenis</label><select value={newMaintenance.jenis} onChange={e => setNewMaintenance(p => ({ ...p, jenis: e.target.value as MaintenanceRecord['jenis'] }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all"><option value="preventif">Preventif</option><option value="korektif">Korektif</option><option value="darurat">Darurat</option></select></div>
                <div><label className="text-white/40 text-xs mb-1 block">Prioritas</label><select value={newMaintenance.prioritas} onChange={e => setNewMaintenance(p => ({ ...p, prioritas: e.target.value as MaintenanceRecord['prioritas'] }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all"><option value="rendah">Rendah</option><option value="sedang">Sedang</option><option value="tinggi">Tinggi</option><option value="kritis">Kritis</option></select></div>
                <div><label className="text-white/40 text-xs mb-1 block">Teknisi</label><input type="text" value={newMaintenance.teknisi} onChange={e => setNewMaintenance(p => ({ ...p, teknisi: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Estimasi Biaya (Rp)</label><input type="number" value={newMaintenance.estimasiBiaya} onChange={e => setNewMaintenance(p => ({ ...p, estimasiBiaya: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Tanggal Mulai</label><input type="date" value={newMaintenance.tanggalMulai} onChange={e => setNewMaintenance(p => ({ ...p, tanggalMulai: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
              </div>
              <div className="mt-3"><label className="text-white/40 text-xs mb-1 block">Catatan</label><input type="text" value={newMaintenance.catatan} onChange={e => setNewMaintenance(p => ({ ...p, catatan: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
              <button onClick={() => { if (!newMaintenance.judul) return; addItem('maintenance', setMaintenance, newMaintenance); setNewMaintenance({ judul: '', mesin: '', jenis: 'preventif', prioritas: 'sedang', status: 'terjadwal', tanggalMulai: new Date().toISOString().slice(0, 10), tanggalSelesai: '', teknisi: '', estimasiBiaya: 0, catatan: '' }); }} className="mt-4 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
                Simpan
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Wrench size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Belum ada work order</p>
            </GlassCard>
          ) : (
            filtered.map(wo => {
              const sl = statusLabel[wo.status] || statusLabel.terjadwal;
              return (
                <GlassCard key={wo.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityBadge(wo.prioritas)}`}>
                        {wo.prioritas.charAt(0).toUpperCase() + wo.prioritas.slice(1)}
                      </span>
                      <div>
                        <h3 className="text-white font-medium text-sm">{wo.judul}</h3>
                        <p className="text-white/40 text-xs">{wo.mesin} • {wo.jenis} • {wo.teknisi}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sl.color}`}>
                        {sl.icon} {wo.status.charAt(0).toUpperCase() + wo.status.slice(1)}
                      </span>
                      <span className="text-white/30 text-xs">Rp {wo.estimasiBiaya.toLocaleString('id-ID')}</span>
                      <button onClick={() => deleteItem('maintenance', setMaintenance, wo.id)} className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // SAFETY / HSE MODULE
  // ══════════════════════════════════════════════════════════
  const renderSafety = () => {
    const filtered = safety.filter(s =>
      s.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Keselamatan (HSE)</h1>
            <p className="text-white/40 text-sm">Insiden & pelaporan keselamatan kerja</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
            <Plus size={16} /> Laporkan Insiden
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Cari insiden..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/30 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="danger">
            <GlassCardHeader>
              <h2 className="text-red-400 font-semibold text-sm">Laporkan Insiden Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label className="text-white/40 text-xs mb-1 block">Judul</label><input type="text" value={newSafety.judul} onChange={e => setNewSafety(p => ({ ...p, judul: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Lokasi</label><input type="text" value={newSafety.lokasi} onChange={e => setNewSafety(p => ({ ...p, lokasi: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Tingkat Keparahan</label><select value={newSafety.severity} onChange={e => setNewSafety(p => ({ ...p, severity: e.target.value as SafetyIncident['severity'] }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all"><option value="ringan">Ringan</option><option value="sedang">Sedang</option><option value="berat">Berat</option><option value="fatal">Fatal</option></select></div>
                <div><label className="text-white/40 text-xs mb-1 block">Pelapor</label><input type="text" value={newSafety.pelapor} onChange={e => setNewSafety(p => ({ ...p, pelapor: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Korban</label><input type="text" value={newSafety.korban} onChange={e => setNewSafety(p => ({ ...p, korban: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Tanggal</label><input type="date" value={newSafety.tanggal} onChange={e => setNewSafety(p => ({ ...p, tanggal: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
              </div>
              <div className="mt-3"><label className="text-white/40 text-xs mb-1 block">Deskripsi</label><textarea value={newSafety.deskripsi} onChange={e => setNewSafety(p => ({ ...p, deskripsi: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all resize-none" /></div>
              <div className="mt-3"><label className="text-white/40 text-xs mb-1 block">Tindakan</label><input type="text" value={newSafety.tindakan} onChange={e => setNewSafety(p => ({ ...p, tindakan: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
              <button onClick={() => { if (!newSafety.judul) return; addItem('safety', setSafety, newSafety); setNewSafety({ judul: '', tanggal: new Date().toISOString().slice(0, 10), lokasi: '', severity: 'ringan', status: 'dilaporkan', pelapor: '', korban: '', deskripsi: '', tindakan: '' }); }} className="mt-4 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
                Simpan
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <ShieldCheck size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Belum ada laporan insiden</p>
            </GlassCard>
          ) : (
            filtered.map(inc => (
              <GlassCard key={inc.id} variant={inc.severity === 'berat' || inc.severity === 'fatal' ? 'danger' : 'default'} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${severityBadge(inc.severity)}`}>
                      {inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1)}
                    </span>
                    <div>
                      <h3 className="text-white font-medium text-sm">{inc.judul}</h3>
                      <p className="text-white/40 text-xs">{inc.lokasi} • {inc.tanggal} • Pelapor: {inc.pelapor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/60">
                      {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
                    </span>
                    <button onClick={() => deleteItem('safety', setSafety, inc.id)} className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {inc.deskripsi && (
                  <p className="text-white/50 text-xs mt-2 ml-16">{inc.deskripsi}</p>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // DOCUMENTS & OCR MODULE
  // ══════════════════════════════════════════════════════════
  const renderDocuments = () => {
    const filtered = documents.filter(d =>
      d.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.kategori.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const jenisIcon: Record<string, React.ReactNode> = {
      kontrak: <FileText size={16} className="text-blue-400" />,
      laporan: <BarChart3 size={16} className="text-emerald-400" />,
      manual: <FileText size={16} className="text-purple-400" />,
      sertifikat: <CheckCircle2 size={16} className="text-yellow-400" />,
      lainnya: <FileText size={16} className="text-white/40" />,
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Dokumen & OCR</h1>
            <p className="text-white/40 text-sm">Penyimpanan & pengelolaan dokumen</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
            <Upload size={16} /> Unggah Dokumen
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Cari dokumen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/30 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-400 font-semibold text-sm">Unggah Dokumen Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label className="text-white/40 text-xs mb-1 block">Nama Dokumen</label><input type="text" value={newDocument.nama} onChange={e => setNewDocument(p => ({ ...p, nama: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Jenis</label><select value={newDocument.jenis} onChange={e => setNewDocument(p => ({ ...p, jenis: e.target.value as Document['jenis'] }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all"><option value="kontrak">Kontrak</option><option value="laporan">Laporan</option><option value="manual">Manual</option><option value="sertifikat">Sertifikat</option><option value="lainnya">Lainnya</option></select></div>
                <div><label className="text-white/40 text-xs mb-1 block">Kategori</label><input type="text" value={newDocument.kategori} onChange={e => setNewDocument(p => ({ ...p, kategori: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
              </div>
              <div className="mt-3"><label className="text-white/40 text-xs mb-1 block">Catatan</label><input type="text" value={newDocument.catatan} onChange={e => setNewDocument(p => ({ ...p, catatan: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
              <button onClick={() => {
                if (!newDocument.nama) return;
                const doc = { ...newDocument, ukuran: 0, url: '', ocrText: '', diunggahOleh: 'Admin' };
                addItem('documents', setDocuments, doc);
                setNewDocument({ nama: '', jenis: 'laporan', kategori: '', catatan: '' });
              }} className="mt-4 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
                Simpan
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <FileText size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Belum ada dokumen</p>
            </GlassCard>
          ) : (
            filtered.map(doc => (
              <GlassCard key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                      {jenisIcon[doc.jenis] || jenisIcon.lainnya}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{doc.nama}</h3>
                      <p className="text-white/40 text-xs">{doc.jenis} • {doc.kategori || 'Tanpa kategori'} • {doc.diunggahOleh || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-xs">{new Date(doc.createdAt).toLocaleDateString('id-ID')}</span>
                    <button onClick={() => deleteItem('documents', setDocuments, doc.id)} className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // ANALYTICS MODULE
  // ══════════════════════════════════════════════════════════
  const renderAnalytics = () => {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analitik</h1>
          <p className="text-white/40 text-sm">Grafik & analisis data operasional</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Trend */}
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-white font-semibold text-sm">Tren Produksi Bulanan</h2>
              <TrendingUp size={16} className="text-emerald-400" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PRODUCTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="bulan" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="zak" name="Zak 40kg" stroke={CHART_COLORS.red} fill={CHART_COLORS.red} fillOpacity={0.1} />
                    <Area type="monotone" dataKey="curah" name="Curah" stroke={CHART_COLORS.amber} fill={CHART_COLORS.amber} fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Maintenance Trend */}
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-white font-semibold text-sm">Tren Perawatan</h2>
              <Wrench size={16} className="text-orange-400" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MAINTENANCE_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="bulan" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="preventif" name="Preventif" stroke={CHART_COLORS.emerald} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="korektif" name="Korektif" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="darurat" name="Darurat" stroke={CHART_COLORS.red} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Stock Levels Pie */}
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-white font-semibold text-sm">Level Stok Suku Cadang</h2>
              <Package size={16} className="text-blue-400" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={STOCK_PIE} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {STOCK_PIE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {STOCK_PIE.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white/50 text-xs">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Production by Machine */}
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-white font-semibold text-sm">Produksi per Mesin</h2>
              <BarChart3 size={16} className="text-purple-400" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { mesin: 'Packer A', ton: 2450 },
                    { mesin: 'Packer B', ton: 2300 },
                    { mesin: 'Silo A', ton: 1800 },
                    { mesin: 'Silo B', ton: 1650 },
                  ]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} />
                    <YAxis dataKey="mesin" type="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} width={70} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="ton" name="Ton" fill={CHART_COLORS.red} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Summary Stats */}
        <GlassCard>
          <GlassCardHeader>
            <h2 className="text-white font-semibold text-sm">Ringkasan Bulan Ini</h2>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Produksi', value: '6,500 ton', sub: 'Zak: 4,400 | Curah: 2,100' },
                { label: 'Efisiensi Packer', value: '87.3%', sub: '+2.1% dari bulan lalu' },
                { label: 'Downtime', value: '14 jam', sub: '-3 jam dari bulan lalu' },
                { label: 'Biaya Maintenance', value: 'Rp 22.5 Jt', sub: '-5% dari anggaran' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs">{stat.label}</p>
                  <p className="text-white font-bold text-lg mt-1">{stat.value}</p>
                  <p className="text-white/30 text-xs mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // NOTIFICATIONS MODULE
  // ══════════════════════════════════════════════════════════
  const renderNotifications = () => {
    const filtered = notifications.filter(n =>
      n.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.pesan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const markAsRead = (id: string) => {
      const updated = notifications.map(n => n.id === id ? { ...n, dibaca: true } : n);
      saveData('notifications', updated);
      setNotifications(updated);
    };

    const markAllAsRead = () => {
      const updated = notifications.map(n => ({ ...n, dibaca: true }));
      saveData('notifications', updated);
      setNotifications(updated);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifikasi</h1>
            <p className="text-white/40 text-sm">{stats.unreadNotifications} belum dibaca</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-all text-sm"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
            </button>
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-all text-sm"
            >
              <CheckCircle2 size={16} /> Tandai Semua Dibaca
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium"
            >
              <Plus size={16} /> Buat Notifikasi
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Cari notifikasi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/30 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-400 font-semibold text-sm">Buat Notifikasi Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label className="text-white/40 text-xs mb-1 block">Judul</label><input type="text" value={newNotification.judul} onChange={e => setNewNotification(p => ({ ...p, judul: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all" /></div>
                <div><label className="text-white/40 text-xs mb-1 block">Tipe</label><select value={newNotification.tipe} onChange={e => setNewNotification(p => ({ ...p, tipe: e.target.value as Notification['tipe'] }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all"><option value="info">Info</option><option value="peringatan">Peringatan</option><option value="bahaya">Bahaya</option><option value="sukses">Sukses</option></select></div>
                <div><label className="text-white/40 text-xs mb-1 block">Modul</label><select value={newNotification.modul} onChange={e => setNewNotification(p => ({ ...p, modul: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all"><option value="overview">Ringkasan</option><option value="spare-parts">Suku Cadang</option><option value="maintenance">Perawatan</option><option value="safety">Keselamatan</option><option value="team-activity">Tim</option></select></div>
              </div>
              <div className="mt-3"><label className="text-white/40 text-xs mb-1 block">Pesan</label><textarea value={newNotification.pesan} onChange={e => setNewNotification(p => ({ ...p, pesan: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/30 transition-all resize-none" /></div>
              <button onClick={() => {
                if (!newNotification.judul) return;
                const notif = { ...newNotification, dibaca: false, link: '/dashboard' };
                addItem('notifications', setNotifications, notif);
                setNewNotification({ judul: '', pesan: '', tipe: 'info', modul: 'overview' });
                if (soundEnabled) playNotificationBeep();
              }} className="mt-4 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
                Simpan & Beritahu
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Bell size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Tidak ada notifikasi</p>
            </GlassCard>
          ) : (
            filtered.map(notif => (
              <GlassCard
                key={notif.id}
                variant={notif.tipe === 'bahaya' ? 'danger' : notif.tipe === 'sukses' ? 'success' : 'default'}
                className={`p-4 cursor-pointer transition-all ${!notif.dibaca ? 'border-red-500/20 bg-white/[0.07]' : ''}`}
                onClick={() => { markAsRead(notif.id); if (notif.modul !== 'notifications') setActiveModule(notif.modul as DashboardModule); }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {!notif.dibaca && <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${notifTypeBadge(notif.tipe)}`}>
                      {notif.tipe.charAt(0).toUpperCase() + notif.tipe.slice(1)}
                    </span>
                    <div>
                      <h3 className={`text-sm font-medium ${notif.dibaca ? 'text-white/60' : 'text-white'}`}>{notif.judul}</h3>
                      <p className="text-white/40 text-xs mt-0.5">{notif.pesan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-xs">{new Date(notif.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={e => { e.stopPropagation(); if (soundEnabled) playNotificationBeep(); }}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Putar suara"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteItem('notifications', setNotifications, notif.id); }}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // MODULE ROUTER
  // ══════════════════════════════════════════════════════════
  const renderModule = () => {
    switch (activeModule) {
      case 'overview': return renderOverview();
      case 'spare-parts': return renderSpareParts();
      case 'team-activity': return renderTeamActivity();
      case 'maintenance': return renderMaintenance();
      case 'safety': return renderSafety();
      case 'documents': return renderDocuments();
      case 'analytics': return renderAnalytics();
      case 'notifications': return renderNotifications();
      default: return renderOverview();
    }
  };

  return (
    <DashboardLayout
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      {renderModule()}
    </DashboardLayout>
  );
}
