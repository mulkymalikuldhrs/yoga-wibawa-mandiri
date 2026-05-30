// ============================================================
// Dashboard Page — YWM AI Dashboard
// PT. Yoga Wibawa Mandiri — Cement Packaging Company
// WHITE/RED theme, All text in Bahasa Indonesia
// Features: Analytics in Overview, Silo Viz, Edit CRUD, PWA, Notifications
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Pencil,
  Save,
  XCircle,
  Database,
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

  if (loadData<MaintenanceRecord>('maintenance').length === 0) {
    const maint: MaintenanceRecord[] = [
      { id: genId(), judul: 'Perawatan Rutin Packer A', mesin: 'Packer A', jenis: 'preventif', prioritas: 'sedang', status: 'berjalan', tanggalMulai: new Date().toISOString().slice(0, 10), tanggalSelesai: '', teknisi: 'Budi Santoso', estimasiBiaya: 2500000, catatan: 'Ganti nozzle & seal', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), judul: 'Perbaikan Belt Conveyor #3', mesin: 'Conveyor #3', jenis: 'korektif', prioritas: 'tinggi', status: 'terjadwal', tanggalMulai: new Date(Date.now() + 86400000).toISOString().slice(0, 10), tanggalSelesai: '', teknisi: 'Rizki Hidayat', estimasiBiaya: 5000000, catatan: 'Belt slip & misalignment', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), judul: 'Overhaul Kompressor Utama', mesin: 'Kompressor #1', jenis: 'preventif', prioritas: 'kritis', status: 'terjadwal', tanggalMulai: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), tanggalSelesai: '', teknisi: 'Team Maintenance', estimasiBiaya: 15000000, catatan: 'Overhaul berkala 6 bulan', createdAt: nowISO(), updatedAt: nowISO() },
    ];
    saveData('maintenance', maint);
  }

  if (loadData<SafetyIncident>('safety').length === 0) {
    const safety: SafetyIncident[] = [
      { id: genId(), judul: 'Tumpahan Semen di Area Loading', tanggal: new Date().toISOString().slice(0, 10), lokasi: 'Area Loading Curah', severity: 'ringan', status: 'selesai', pelapor: 'Eka Putra', korban: '-', deskripsi: 'Tumpahan semen curah akibat overflow silo', tindakan: 'Pembersihan segera & perbaikan sensor level', createdAt: nowISO(), updatedAt: nowISO() },
      { id: genId(), judul: 'Kecelakaan Ringan di Conveyor', tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10), lokasi: 'Conveyor Belt #2', severity: 'sedang', status: 'investigasi', pelapor: 'Ahmad Fauzi', korban: 'Hendra Wijaya', deskripsi: 'Jari terjepit roller conveyor', tindakan: 'P3K & investigasi sedang berjalan', createdAt: nowISO(), updatedAt: nowISO() },
    ];
    saveData('safety', safety);
  }

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

// ── Custom tooltip (light theme) ──
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value?.toLocaleString('id-ID')}
        </p>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SILO VISUALIZATION COMPONENT
// ══════════════════════════════════════════════════════════
function SiloVisualization() {
  const siloA = { name: 'Silo A', capacity: 500, current: 350, holes: 7 };
  const siloB = { name: 'Silo B', capacity: 500, current: 180, holes: 7 };

  const getSiloColor = (pct: number) => {
    if (pct > 60) return { fill: '#22c55e', bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Aman' };
    if (pct >= 30) return { fill: '#eab308', bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Sedang' };
    return { fill: '#ef4444', bg: 'bg-red-500', text: 'text-red-600', label: 'Rendah' };
  };

  const renderSilo = (silo: typeof siloA) => {
    const pct = Math.round((silo.current / silo.capacity) * 100);
    const color = getSiloColor(pct);
    const fillHeight = (pct / 100) * 120; // max 120px

    return (
      <div className="flex flex-col items-center gap-2">
        <h4 className="text-sm font-semibold text-[#212121]">{silo.name}</h4>
        {/* Silo body */}
        <div className="relative w-24 h-32 rounded-t-3xl rounded-b-lg border-2 border-gray-300 bg-gray-50 overflow-hidden"
          style={{ borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem' }}
        >
          {/* Fill level */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-b-lg"
            style={{
              height: `${fillHeight}px`,
              backgroundColor: color.fill,
              opacity: 0.7,
            }}
          />
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-[#212121] drop-shadow-sm">{pct}%</span>
          </div>
        </div>
        {/* Filling holes */}
        <div className="flex gap-1.5 mt-1">
          {Array.from({ length: silo.holes }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-gray-300 border border-gray-400" />
          ))}
        </div>
        {/* Info */}
        <div className="text-center mt-1">
          <p className="text-sm font-semibold text-[#212121]">{silo.current}/{silo.capacity} ton</p>
          <span className={`text-xs font-medium ${color.text}`}>{color.label}</span>
        </div>
      </div>
    );
  };

  return (
    <GlassCard>
      <GlassCardHeader>
        <h2 className="text-[#212121] font-semibold text-sm">Level Silo</h2>
        <Database size={16} className="text-gray-400" />
      </GlassCardHeader>
      <GlassCardContent>
        <div className="flex items-end justify-center gap-12 py-4">
          {renderSilo(siloA)}
          {renderSilo(siloB)}
        </div>
        <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Aman (&gt;60%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>Sedang (30-60%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Rendah (&lt;30%)</span>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
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

  // ── Edit states ──
  const [editingSparePartId, setEditingSparePartId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<string | null>(null);
  const [editingSafetyId, setEditingSafetyId] = useState<string | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);

  // ── Add/Edit form states ──
  const [newSparePart, setNewSparePart] = useState({ nama: '', kode: '', kategori: '', stok: 0, stokMinimum: 0, satuan: 'pcs', lokasi: '', harga: 0, pemasok: '', catatan: '' });
  const [newTeam, setNewTeam] = useState({ namaKaryawan: '', divisi: '', aktivitas: '', status: 'hadir' as TeamActivity['status'], jamMasuk: '', jamKeluar: '', tanggal: new Date().toISOString().slice(0, 10), catatan: '' });
  const [newMaintenance, setNewMaintenance] = useState({ judul: '', mesin: '', jenis: 'preventif' as MaintenanceRecord['jenis'], prioritas: 'sedang' as MaintenanceRecord['prioritas'], status: 'terjadwal' as MaintenanceRecord['status'], tanggalMulai: new Date().toISOString().slice(0, 10), tanggalSelesai: '', teknisi: '', estimasiBiaya: 0, catatan: '' });
  const [newSafety, setNewSafety] = useState({ judul: '', tanggal: new Date().toISOString().slice(0, 10), lokasi: '', severity: 'ringan' as SafetyIncident['severity'], status: 'dilaporkan' as SafetyIncident['status'], pelapor: '', korban: '', deskripsi: '', tindakan: '' });
  const [newDocument, setNewDocument] = useState({ nama: '', jenis: 'laporan' as Document['jenis'], kategori: '', catatan: '' });
  const [newNotification, setNewNotification] = useState({ judul: '', pesan: '', tipe: 'info' as Notification['tipe'], modul: 'overview' });

  // ── Notification permission ──
  const notifPermissionRef = useRef<NotificationPermission>('default');

  // ── Seed & load data ──
  useEffect(() => {
    seedIfNeeded();
    setSpareParts(loadData<SparePart>('spare-parts'));
    setTeamActivity(loadData<TeamActivity>('team-activity'));
    setMaintenance(loadData<MaintenanceRecord>('maintenance'));
    setSafety(loadData<SafetyIncident>('safety'));
    setDocuments(loadData<Document>('documents'));
    setNotifications(loadData<Notification>('notifications'));

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        notifPermissionRef.current = perm;
      });
    } else if ('Notification' in window) {
      notifPermissionRef.current = Notification.permission;
    }
  }, []);

  // ── Refresh data on module change ──
  useEffect(() => {
    setSearchTerm('');
    setShowAddForm(false);
    setEditingSparePartId(null);
    setEditingTeamId(null);
    setEditingMaintenanceId(null);
    setEditingSafetyId(null);
    setEditingDocumentId(null);
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

  const updateItem = useCallback(<T extends { id: string }>(module: string, setter: React.Dispatch<React.SetStateAction<T[]>>, id: string, updates: Partial<T>) => {
    const current = loadData<T>(module);
    const updated = current.map(i => i.id === id ? { ...i, ...updates, updatedAt: nowISO() } as T : i);
    saveData(module, updated);
    setter(updated);
  }, []);

  const deleteItem = useCallback(<T extends { id: string }>(module: string, setter: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
    const current = loadData<T>(module);
    const updated = current.filter(i => i.id !== id);
    saveData(module, updated);
    setter(updated);
  }, []);

  // ── Browser notification helper ──
  const sendBrowserNotification = useCallback((judul: string, pesan: string) => {
    if ('Notification' in window && notifPermissionRef.current === 'granted') {
      try {
        const n = new Notification(judul, {
          body: pesan,
          icon: '/lovable-uploads/ywm-logo.png',
          tag: 'ywm-dashboard',
        });
        setTimeout(() => n.close(), 5000);
      } catch {
        // Fallback for environments where Notification constructor fails
      }
    }
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
    if (stok <= min * 0.5) return { color: 'bg-red-500', label: 'Kritis', textColor: 'text-red-600' };
    if (stok <= min) return { color: 'bg-yellow-500', label: 'Rendah', textColor: 'text-yellow-600' };
    return { color: 'bg-emerald-500', label: 'Aman', textColor: 'text-emerald-600' };
  };

  // ── Priority badge ──
  const priorityBadge = (p: string) => {
    switch (p) {
      case 'kritis': return 'bg-red-100 text-red-600 border-red-200';
      case 'tinggi': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'sedang': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'rendah': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // ── Severity badge ──
  const severityBadge = (s: string) => {
    switch (s) {
      case 'fatal': return 'bg-red-100 text-red-600 border-red-200';
      case 'berat': return 'bg-red-100 text-red-600 border-red-200';
      case 'sedang': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'ringan': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // ── Notification type badge ──
  const notifTypeBadge = (t: string) => {
    switch (t) {
      case 'bahaya': return 'bg-red-100 text-red-600';
      case 'peringatan': return 'bg-yellow-100 text-yellow-600';
      case 'sukses': return 'bg-emerald-100 text-emerald-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // ── Common input classes ──
  const inputCls = 'w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-[#212121] text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all';
  const labelCls = 'text-gray-500 text-xs mb-1 block';
  const btnPrimaryCls = 'mt-4 px-4 py-2 rounded-xl bg-red-600 text-white border border-red-600 hover:bg-red-700 transition-all text-sm font-medium';
  const btnSecondaryCls = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all text-sm font-medium';

  // ══════════════════════════════════════════════════════════
  // OVERVIEW MODULE (with integrated analytics + silo)
  // ══════════════════════════════════════════════════════════
  const renderOverview = () => {
    const statCards = [
      { label: 'Total Suku Cadang', value: stats.totalSpareParts, icon: <Package size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+3', up: true },
      { label: 'Stok Rendah', value: stats.lowStockItems, icon: <AlertTriangle size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: '+1', up: false },
      { label: 'Perawatan Aktif', value: stats.activeMaintenance, icon: <Wrench size={20} />, color: 'text-orange-600', bg: 'bg-orange-50', trend: '0', up: true },
      { label: 'Insiden Terbuka', value: stats.openIncidents, icon: <ShieldCheck size={20} />, color: 'text-red-600', bg: 'bg-red-50', trend: '-1', up: true },
      { label: 'Notifikasi Baru', value: stats.unreadNotifications, icon: <Bell size={20} />, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+2', up: false },
    ];

    const recentActivity = [
      { time: '10:30', desc: 'Perawatan Packer A dimulai', type: 'maintenance' },
      { time: '09:15', desc: 'Dedi Kurniawan izin hari ini', type: 'team' },
      { time: '08:45', desc: 'Stok Filter Udara di bawah minimum', type: 'alert' },
      { time: '08:00', desc: 'Shift pagi dimulai — 5 karyawan hadir', type: 'info' },
      { time: '07:30', desc: 'Inspeksi harian conveyor selesai', type: 'safety' },
    ];

    // Attendance summary
    const attendanceData = [
      { status: 'Hadir', count: teamActivity.filter(t => t.status === 'hadir').length, color: '#22c55e' },
      { status: 'Izin', count: teamActivity.filter(t => t.status === 'izin').length, color: '#eab308' },
      { status: 'Sakit', count: teamActivity.filter(t => t.status === 'sakit').length, color: '#f97316' },
      { status: 'Alpha', count: teamActivity.filter(t => t.status === 'alpha').length, color: '#ef4444' },
      { status: 'Lembur', count: teamActivity.filter(t => t.status === 'lembur').length, color: '#a855f7' },
    ];

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Ringkasan Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">PT. Yoga Wibawa Mandiri — {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <GlassCard key={card.label} glow className="p-4">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${card.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.trend}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-[#212121]">{card.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{card.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Production Chart + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2">
            <GlassCardHeader>
              <h2 className="text-[#212121] font-semibold text-sm">Produksi Bulanan (ton)</h2>
              <span className="text-gray-400 text-xs">2024</span>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PRODUCTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="bulan" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="zak" name="Zak 40kg" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="curah" name="Curah" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-[#212121] font-semibold text-sm">Aktivitas Terbaru</h2>
              <Activity size={16} className="text-gray-400" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar-light">
                {recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 text-sm">{act.desc}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* ═══ ANALYTICS SECTION (moved from sidebar) ═══ */}
        <div>
          <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-red-600" />
            Analitik Menyeluruh
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Trend */}
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-[#212121] font-semibold text-sm">Tren Produksi Bulanan</h2>
              <TrendingUp size={16} className="text-emerald-600" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PRODUCTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="bulan" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
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
              <h2 className="text-[#212121] font-semibold text-sm">Tren Perawatan</h2>
              <Wrench size={16} className="text-orange-600" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MAINTENANCE_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="bulan" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
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
              <h2 className="text-[#212121] font-semibold text-sm">Level Stok Suku Cadang</h2>
              <Package size={16} className="text-blue-600" />
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
                    <span className="text-gray-500 text-xs">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Team Attendance */}
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-[#212121] font-semibold text-sm">Kehadiran Tim Hari Ini</h2>
              <Users size={16} className="text-purple-600" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="status" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Jumlah" radius={[4, 4, 0, 0]}>
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Silo Visualization */}
        <SiloVisualization />

        {/* Summary Stats */}
        <GlassCard>
          <GlassCardHeader>
            <h2 className="text-[#212121] font-semibold text-sm">Ringkasan Bulan Ini</h2>
            <BarChart3 size={16} className="text-red-600" />
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Produksi', value: '6,500 ton', sub: 'Zak: 4,400 | Curah: 2,100' },
                { label: 'Efisiensi Packer', value: '87.3%', sub: '+2.1% dari bulan lalu' },
                { label: 'Downtime', value: '14 jam', sub: '-3 jam dari bulan lalu' },
                { label: 'Biaya Maintenance', value: 'Rp 22.5 Jt', sub: '-5% dari anggaran' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                  <p className="text-[#212121] font-bold text-lg mt-1">{stat.value}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Quick Actions & Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-[#212121] font-semibold text-sm">Aksi Cepat</h2>
              <Zap size={16} className="text-yellow-500" />
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
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all text-sm"
                  >
                    <span className="text-red-600">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-[#212121] font-semibold text-sm">Informasi Perusahaan</h2>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Jl. Pelabuhan Umum, Kr. Geukuh, Aceh Utara</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">Pesan: +6285322624048</p>
                    <p className="text-gray-600">Kontak: +6285322624038</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Semen Padang PCC, Zak 40kg & Curah max 30 ton</span>
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

    const startEdit = (part: SparePart) => {
      setEditingSparePartId(part.id);
      setNewSparePart({ nama: part.nama, kode: part.kode, kategori: part.kategori, stok: part.stok, stokMinimum: part.stokMinimum, satuan: part.satuan, lokasi: part.lokasi, harga: part.harga, pemasok: part.pemasok, catatan: part.catatan });
      setShowAddForm(true);
    };

    const cancelEdit = () => {
      setEditingSparePartId(null);
      setNewSparePart({ nama: '', kode: '', kategori: '', stok: 0, stokMinimum: 0, satuan: 'pcs', lokasi: '', harga: 0, pemasok: '', catatan: '' });
      setShowAddForm(false);
    };

    const handleSave = () => {
      if (!newSparePart.nama || !newSparePart.kode) return;
      if (editingSparePartId) {
        updateItem('spare-parts', setSpareParts, editingSparePartId, newSparePart);
        setEditingSparePartId(null);
      } else {
        addItem('spare-parts', setSpareParts, newSparePart);
      }
      setNewSparePart({ nama: '', kode: '', kategori: '', stok: 0, stokMinimum: 0, satuan: 'pcs', lokasi: '', harga: 0, pemasok: '', catatan: '' });
      setShowAddForm(false);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">Suku Cadang</h1>
            <p className="text-gray-400 text-sm">Inventaris suku cadang pabrik</p>
          </div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) cancelEdit(); }} className={btnSecondaryCls}>
            <Plus size={16} /> {editingSparePartId ? 'Batal Edit' : 'Tambah Suku Cadang'}
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari suku cadang..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#212121] text-sm placeholder:text-gray-300 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-600 font-semibold text-sm">{editingSparePartId ? 'Edit Suku Cadang' : 'Tambah Suku Cadang Baru'}</h2>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
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
                    <label className={labelCls}>{field.label}</label>
                    <input type={field.type} value={(newSparePart as any)[field.key]} onChange={e => setNewSparePart(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))} className={inputCls} />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className={labelCls}>Catatan</label>
                <input type="text" value={newSparePart.catatan} onChange={e => setNewSparePart(prev => ({ ...prev, catatan: e.target.value }))} className={inputCls} />
              </div>
              <button onClick={handleSave} className={btnPrimaryCls}>
                <Save size={14} className="inline mr-1" /> {editingSparePartId ? 'Perbarui' : 'Simpan'}
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar-light">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Package size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Belum ada data suku cadang</p>
            </GlassCard>
          ) : (
            filtered.map(part => {
              const status = stockStatus(part.stok, part.stokMinimum);
              return (
                <GlassCard key={part.id} className={`p-4 ${editingSparePartId === part.id ? 'border-red-300 bg-red-50/30' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
                      <div>
                        <h3 className="text-[#212121] font-medium text-sm">{part.nama}</h3>
                        <p className="text-gray-400 text-xs">{part.kode} • {part.kategori} • {part.lokasi}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[#212121] font-semibold text-sm">{part.stok} {part.satuan}</p>
                        <p className={`text-xs ${status.textColor}`}>{status.label} (min: {part.stokMinimum})</p>
                      </div>
                      <button onClick={() => startEdit(part)} className="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteItem('spare-parts', setSpareParts, part.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
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
      hadir: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      izin: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      sakit: 'bg-orange-100 text-orange-600 border-orange-200',
      alpha: 'bg-red-100 text-red-600 border-red-200',
      lembur: 'bg-purple-100 text-purple-600 border-purple-200',
    };

    const startEdit = (member: TeamActivity) => {
      setEditingTeamId(member.id);
      setNewTeam({ namaKaryawan: member.namaKaryawan, divisi: member.divisi, aktivitas: member.aktivitas, status: member.status, jamMasuk: member.jamMasuk, jamKeluar: member.jamKeluar, tanggal: member.tanggal, catatan: member.catatan });
      setShowAddForm(true);
    };

    const cancelEdit = () => {
      setEditingTeamId(null);
      setNewTeam({ namaKaryawan: '', divisi: '', aktivitas: '', status: 'hadir', jamMasuk: '', jamKeluar: '', tanggal: new Date().toISOString().slice(0, 10), catatan: '' });
      setShowAddForm(false);
    };

    const handleSave = () => {
      if (!newTeam.namaKaryawan) return;
      if (editingTeamId) {
        updateItem('team-activity', setTeamActivity, editingTeamId, newTeam);
        setEditingTeamId(null);
      } else {
        addItem('team-activity', setTeamActivity, newTeam);
      }
      setNewTeam({ namaKaryawan: '', divisi: '', aktivitas: '', status: 'hadir', jamMasuk: '', jamKeluar: '', tanggal: new Date().toISOString().slice(0, 10), catatan: '' });
      setShowAddForm(false);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">Aktivitas Tim</h1>
            <p className="text-gray-400 text-sm">Kehadiran & aktivitas karyawan</p>
          </div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) cancelEdit(); }} className={btnSecondaryCls}>
            <Plus size={16} /> {editingTeamId ? 'Batal Edit' : 'Tambah Aktivitas'}
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari karyawan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#212121] text-sm placeholder:text-gray-300 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-600 font-semibold text-sm">{editingTeamId ? 'Edit Aktivitas Karyawan' : 'Tambah Aktivitas Karyawan'}</h2>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label className={labelCls}>Nama Karyawan</label><input type="text" value={newTeam.namaKaryawan} onChange={e => setNewTeam(p => ({ ...p, namaKaryawan: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Divisi</label><input type="text" value={newTeam.divisi} onChange={e => setNewTeam(p => ({ ...p, divisi: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Aktivitas</label><input type="text" value={newTeam.aktivitas} onChange={e => setNewTeam(p => ({ ...p, aktivitas: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Status</label><select value={newTeam.status} onChange={e => setNewTeam(p => ({ ...p, status: e.target.value as TeamActivity['status'] }))} className={inputCls}><option value="hadir">Hadir</option><option value="izin">Izin</option><option value="sakit">Sakit</option><option value="alpha">Alpha</option><option value="lembur">Lembur</option></select></div>
                <div><label className={labelCls}>Jam Masuk</label><input type="time" value={newTeam.jamMasuk} onChange={e => setNewTeam(p => ({ ...p, jamMasuk: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Jam Keluar</label><input type="time" value={newTeam.jamKeluar} onChange={e => setNewTeam(p => ({ ...p, jamKeluar: e.target.value }))} className={inputCls} /></div>
              </div>
              <button onClick={handleSave} className={btnPrimaryCls}>
                <Save size={14} className="inline mr-1" /> {editingTeamId ? 'Perbarui' : 'Simpan'}
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar-light">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Users size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Belum ada data aktivitas tim</p>
            </GlassCard>
          ) : (
            filtered.map(member => (
              <GlassCard key={member.id} className={`p-4 ${editingTeamId === member.id ? 'border-red-300 bg-red-50/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-semibold text-sm">
                      {member.namaKaryawan.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-[#212121] font-medium text-sm">{member.namaKaryawan}</h3>
                      <p className="text-gray-400 text-xs">{member.divisi} • {member.aktivitas}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor[member.status] || 'bg-gray-100 text-gray-600'}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                    <span className="text-gray-400 text-xs">{member.jamMasuk}—{member.jamKeluar}</span>
                    <button onClick={() => startEdit(member)} className="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteItem('team-activity', setTeamActivity, member.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
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
      terjadwal: { color: 'bg-blue-100 text-blue-600 border-blue-200', icon: <Clock size={12} /> },
      berjalan: { color: 'bg-yellow-100 text-yellow-600 border-yellow-200', icon: <Activity size={12} /> },
      selesai: { color: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: <CheckCircle2 size={12} /> },
      dibatalkan: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: <X size={12} /> },
    };

    const startEdit = (wo: MaintenanceRecord) => {
      setEditingMaintenanceId(wo.id);
      setNewMaintenance({ judul: wo.judul, mesin: wo.mesin, jenis: wo.jenis, prioritas: wo.prioritas, status: wo.status, tanggalMulai: wo.tanggalMulai, tanggalSelesai: wo.tanggalSelesai, teknisi: wo.teknisi, estimasiBiaya: wo.estimasiBiaya, catatan: wo.catatan });
      setShowAddForm(true);
    };

    const cancelEdit = () => {
      setEditingMaintenanceId(null);
      setNewMaintenance({ judul: '', mesin: '', jenis: 'preventif', prioritas: 'sedang', status: 'terjadwal', tanggalMulai: new Date().toISOString().slice(0, 10), tanggalSelesai: '', teknisi: '', estimasiBiaya: 0, catatan: '' });
      setShowAddForm(false);
    };

    const handleSave = () => {
      if (!newMaintenance.judul) return;
      if (editingMaintenanceId) {
        updateItem('maintenance', setMaintenance, editingMaintenanceId, newMaintenance);
        setEditingMaintenanceId(null);
      } else {
        addItem('maintenance', setMaintenance, newMaintenance);
      }
      setNewMaintenance({ judul: '', mesin: '', jenis: 'preventif', prioritas: 'sedang', status: 'terjadwal', tanggalMulai: new Date().toISOString().slice(0, 10), tanggalSelesai: '', teknisi: '', estimasiBiaya: 0, catatan: '' });
      setShowAddForm(false);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">Perawatan</h1>
            <p className="text-gray-400 text-sm">Work order & jadwal perawatan mesin</p>
          </div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) cancelEdit(); }} className={btnSecondaryCls}>
            <Plus size={16} /> {editingMaintenanceId ? 'Batal Edit' : 'Buat Work Order'}
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari work order..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#212121] text-sm placeholder:text-gray-300 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-600 font-semibold text-sm">{editingMaintenanceId ? 'Edit Work Order' : 'Buat Work Order Baru'}</h2>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label className={labelCls}>Judul</label><input type="text" value={newMaintenance.judul} onChange={e => setNewMaintenance(p => ({ ...p, judul: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Mesin</label><input type="text" value={newMaintenance.mesin} onChange={e => setNewMaintenance(p => ({ ...p, mesin: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Jenis</label><select value={newMaintenance.jenis} onChange={e => setNewMaintenance(p => ({ ...p, jenis: e.target.value as MaintenanceRecord['jenis'] }))} className={inputCls}><option value="preventif">Preventif</option><option value="korektif">Korektif</option><option value="darurat">Darurat</option></select></div>
                <div><label className={labelCls}>Prioritas</label><select value={newMaintenance.prioritas} onChange={e => setNewMaintenance(p => ({ ...p, prioritas: e.target.value as MaintenanceRecord['prioritas'] }))} className={inputCls}><option value="rendah">Rendah</option><option value="sedang">Sedang</option><option value="tinggi">Tinggi</option><option value="kritis">Kritis</option></select></div>
                <div><label className={labelCls}>Teknisi</label><input type="text" value={newMaintenance.teknisi} onChange={e => setNewMaintenance(p => ({ ...p, teknisi: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Estimasi Biaya (Rp)</label><input type="number" value={newMaintenance.estimasiBiaya} onChange={e => setNewMaintenance(p => ({ ...p, estimasiBiaya: Number(e.target.value) }))} className={inputCls} /></div>
                <div><label className={labelCls}>Tanggal Mulai</label><input type="date" value={newMaintenance.tanggalMulai} onChange={e => setNewMaintenance(p => ({ ...p, tanggalMulai: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="mt-3"><label className={labelCls}>Catatan</label><input type="text" value={newMaintenance.catatan} onChange={e => setNewMaintenance(p => ({ ...p, catatan: e.target.value }))} className={inputCls} /></div>
              <button onClick={handleSave} className={btnPrimaryCls}>
                <Save size={14} className="inline mr-1" /> {editingMaintenanceId ? 'Perbarui' : 'Simpan'}
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar-light">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Wrench size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Belum ada work order</p>
            </GlassCard>
          ) : (
            filtered.map(wo => {
              const sl = statusLabel[wo.status] || statusLabel.terjadwal;
              return (
                <GlassCard key={wo.id} className={`p-4 ${editingMaintenanceId === wo.id ? 'border-red-300 bg-red-50/30' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityBadge(wo.prioritas)}`}>
                        {wo.prioritas.charAt(0).toUpperCase() + wo.prioritas.slice(1)}
                      </span>
                      <div>
                        <h3 className="text-[#212121] font-medium text-sm">{wo.judul}</h3>
                        <p className="text-gray-400 text-xs">{wo.mesin} • {wo.jenis} • {wo.teknisi}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sl.color}`}>
                        {sl.icon} {wo.status.charAt(0).toUpperCase() + wo.status.slice(1)}
                      </span>
                      <span className="text-gray-400 text-xs">Rp {wo.estimasiBiaya.toLocaleString('id-ID')}</span>
                      <button onClick={() => startEdit(wo)} className="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteItem('maintenance', setMaintenance, wo.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
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

    const startEdit = (inc: SafetyIncident) => {
      setEditingSafetyId(inc.id);
      setNewSafety({ judul: inc.judul, tanggal: inc.tanggal, lokasi: inc.lokasi, severity: inc.severity, status: inc.status, pelapor: inc.pelapor, korban: inc.korban, deskripsi: inc.deskripsi, tindakan: inc.tindakan });
      setShowAddForm(true);
    };

    const cancelEdit = () => {
      setEditingSafetyId(null);
      setNewSafety({ judul: '', tanggal: new Date().toISOString().slice(0, 10), lokasi: '', severity: 'ringan', status: 'dilaporkan', pelapor: '', korban: '', deskripsi: '', tindakan: '' });
      setShowAddForm(false);
    };

    const handleSave = () => {
      if (!newSafety.judul) return;
      if (editingSafetyId) {
        updateItem('safety', setSafety, editingSafetyId, newSafety);
        setEditingSafetyId(null);
      } else {
        addItem('safety', setSafety, newSafety);
      }
      setNewSafety({ judul: '', tanggal: new Date().toISOString().slice(0, 10), lokasi: '', severity: 'ringan', status: 'dilaporkan', pelapor: '', korban: '', deskripsi: '', tindakan: '' });
      setShowAddForm(false);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">Keselamatan (HSE)</h1>
            <p className="text-gray-400 text-sm">Insiden & pelaporan keselamatan kerja</p>
          </div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) cancelEdit(); }} className={btnSecondaryCls}>
            <Plus size={16} /> {editingSafetyId ? 'Batal Edit' : 'Laporkan Insiden'}
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari insiden..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#212121] text-sm placeholder:text-gray-300 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="danger">
            <GlassCardHeader>
              <h2 className="text-red-600 font-semibold text-sm">{editingSafetyId ? 'Edit Insiden' : 'Laporkan Insiden Baru'}</h2>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label className={labelCls}>Judul</label><input type="text" value={newSafety.judul} onChange={e => setNewSafety(p => ({ ...p, judul: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Lokasi</label><input type="text" value={newSafety.lokasi} onChange={e => setNewSafety(p => ({ ...p, lokasi: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Tingkat Keparahan</label><select value={newSafety.severity} onChange={e => setNewSafety(p => ({ ...p, severity: e.target.value as SafetyIncident['severity'] }))} className={inputCls}><option value="ringan">Ringan</option><option value="sedang">Sedang</option><option value="berat">Berat</option><option value="fatal">Fatal</option></select></div>
                <div><label className={labelCls}>Pelapor</label><input type="text" value={newSafety.pelapor} onChange={e => setNewSafety(p => ({ ...p, pelapor: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Korban</label><input type="text" value={newSafety.korban} onChange={e => setNewSafety(p => ({ ...p, korban: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Tanggal</label><input type="date" value={newSafety.tanggal} onChange={e => setNewSafety(p => ({ ...p, tanggal: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="mt-3"><label className={labelCls}>Deskripsi</label><textarea value={newSafety.deskripsi} onChange={e => setNewSafety(p => ({ ...p, deskripsi: e.target.value }))} rows={2} className={`${inputCls} resize-none`} /></div>
              <div className="mt-3"><label className={labelCls}>Tindakan</label><input type="text" value={newSafety.tindakan} onChange={e => setNewSafety(p => ({ ...p, tindakan: e.target.value }))} className={inputCls} /></div>
              <button onClick={handleSave} className={btnPrimaryCls}>
                <Save size={14} className="inline mr-1" /> {editingSafetyId ? 'Perbarui' : 'Simpan'}
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar-light">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <ShieldCheck size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Belum ada laporan insiden</p>
            </GlassCard>
          ) : (
            filtered.map(inc => (
              <GlassCard key={inc.id} variant={inc.severity === 'berat' || inc.severity === 'fatal' ? 'danger' : 'default'} className={`p-4 ${editingSafetyId === inc.id ? 'border-red-300' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${severityBadge(inc.severity)}`}>
                      {inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1)}
                    </span>
                    <div>
                      <h3 className="text-[#212121] font-medium text-sm">{inc.judul}</h3>
                      <p className="text-gray-400 text-xs">{inc.lokasi} • {inc.tanggal} • Pelapor: {inc.pelapor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600">
                      {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
                    </span>
                    <button onClick={() => startEdit(inc)} className="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteItem('safety', setSafety, inc.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {inc.deskripsi && (
                  <p className="text-gray-500 text-xs mt-2 ml-16">{inc.deskripsi}</p>
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
      kontrak: <FileText size={16} className="text-blue-600" />,
      laporan: <BarChart3 size={16} className="text-emerald-600" />,
      manual: <FileText size={16} className="text-purple-600" />,
      sertifikat: <CheckCircle2 size={16} className="text-yellow-600" />,
      lainnya: <FileText size={16} className="text-gray-400" />,
    };

    const startEdit = (doc: Document) => {
      setEditingDocumentId(doc.id);
      setNewDocument({ nama: doc.nama, jenis: doc.jenis, kategori: doc.kategori, catatan: doc.catatan });
      setShowAddForm(true);
    };

    const cancelEdit = () => {
      setEditingDocumentId(null);
      setNewDocument({ nama: '', jenis: 'laporan', kategori: '', catatan: '' });
      setShowAddForm(false);
    };

    const handleSave = () => {
      if (!newDocument.nama) return;
      if (editingDocumentId) {
        updateItem('documents', setDocuments, editingDocumentId, newDocument);
        setEditingDocumentId(null);
      } else {
        const doc = { ...newDocument, ukuran: 0, url: '', ocrText: '', diunggahOleh: 'Admin' };
        addItem('documents', setDocuments, doc);
      }
      setNewDocument({ nama: '', jenis: 'laporan', kategori: '', catatan: '' });
      setShowAddForm(false);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">Dokumen & OCR</h1>
            <p className="text-gray-400 text-sm">Penyimpanan & pengelolaan dokumen</p>
          </div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) cancelEdit(); }} className={btnSecondaryCls}>
            <Upload size={16} /> {editingDocumentId ? 'Batal Edit' : 'Unggah Dokumen'}
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari dokumen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#212121] text-sm placeholder:text-gray-300 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-600 font-semibold text-sm">{editingDocumentId ? 'Edit Dokumen' : 'Unggah Dokumen Baru'}</h2>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label className={labelCls}>Nama Dokumen</label><input type="text" value={newDocument.nama} onChange={e => setNewDocument(p => ({ ...p, nama: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Jenis</label><select value={newDocument.jenis} onChange={e => setNewDocument(p => ({ ...p, jenis: e.target.value as Document['jenis'] }))} className={inputCls}><option value="kontrak">Kontrak</option><option value="laporan">Laporan</option><option value="manual">Manual</option><option value="sertifikat">Sertifikat</option><option value="lainnya">Lainnya</option></select></div>
                <div><label className={labelCls}>Kategori</label><input type="text" value={newDocument.kategori} onChange={e => setNewDocument(p => ({ ...p, kategori: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="mt-3"><label className={labelCls}>Catatan</label><input type="text" value={newDocument.catatan} onChange={e => setNewDocument(p => ({ ...p, catatan: e.target.value }))} className={inputCls} /></div>
              <button onClick={handleSave} className={btnPrimaryCls}>
                <Save size={14} className="inline mr-1" /> {editingDocumentId ? 'Perbarui' : 'Simpan'}
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar-light">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <FileText size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Belum ada dokumen</p>
            </GlassCard>
          ) : (
            filtered.map(doc => (
              <GlassCard key={doc.id} className={`p-4 ${editingDocumentId === doc.id ? 'border-red-300 bg-red-50/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                      {jenisIcon[doc.jenis] || jenisIcon.lainnya}
                    </div>
                    <div>
                      <h3 className="text-[#212121] font-medium text-sm">{doc.nama}</h3>
                      <p className="text-gray-400 text-xs">{doc.jenis} • {doc.kategori || 'Tanpa kategori'} • {doc.diunggahOleh || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{new Date(doc.createdAt).toLocaleDateString('id-ID')}</span>
                    <button onClick={() => startEdit(doc)} className="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteItem('documents', setDocuments, doc.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
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
  // NOTIFICATIONS MODULE (with browser notification + beep)
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

    const handleCreateNotification = () => {
      if (!newNotification.judul) return;
      const notif = { ...newNotification, dibaca: false, link: '/dashboard' };
      addItem('notifications', setNotifications, notif);

      // Play beep sound
      if (soundEnabled) playNotificationBeep();

      // Show browser notification
      sendBrowserNotification(newNotification.judul, newNotification.pesan);

      setNewNotification({ judul: '', pesan: '', tipe: 'info', modul: 'overview' });
    };

    // Request notification permission button
    const requestNotifPermission = () => {
      if ('Notification' in window) {
        Notification.requestPermission().then((perm) => {
          notifPermissionRef.current = perm;
        });
      }
    };

    const notifPermissionGranted = typeof window !== 'undefined' && 'Notification' in window && notifPermissionRef.current === 'granted';

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">Notifikasi</h1>
            <p className="text-gray-400 text-sm">{stats.unreadNotifications} belum dibaca</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {!notifPermissionGranted && (
              <button
                onClick={requestNotifPermission}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-all text-sm"
              >
                <AlertCircle size={16} /> Aktifkan Notifikasi Perangkat
              </button>
            )}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-sm"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
            </button>
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-sm"
            >
              <CheckCircle2 size={16} /> Tandai Semua Dibaca
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={btnSecondaryCls}
            >
              <Plus size={16} /> Buat Notifikasi
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari notifikasi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#212121] text-sm placeholder:text-gray-300 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all" />
        </div>

        {showAddForm && (
          <GlassCard variant="accent">
            <GlassCardHeader>
              <h2 className="text-red-600 font-semibold text-sm">Buat Notifikasi Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label className={labelCls}>Judul</label><input type="text" value={newNotification.judul} onChange={e => setNewNotification(p => ({ ...p, judul: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Tipe</label><select value={newNotification.tipe} onChange={e => setNewNotification(p => ({ ...p, tipe: e.target.value as Notification['tipe'] }))} className={inputCls}><option value="info">Info</option><option value="peringatan">Peringatan</option><option value="bahaya">Bahaya</option><option value="sukses">Sukses</option></select></div>
                <div><label className={labelCls}>Modul</label><select value={newNotification.modul} onChange={e => setNewNotification(p => ({ ...p, modul: e.target.value }))} className={inputCls}><option value="overview">Ringkasan</option><option value="spare-parts">Suku Cadang</option><option value="maintenance">Perawatan</option><option value="safety">Keselamatan</option><option value="team-activity">Tim</option></select></div>
              </div>
              <div className="mt-3"><label className={labelCls}>Pesan</label><textarea value={newNotification.pesan} onChange={e => setNewNotification(p => ({ ...p, pesan: e.target.value }))} rows={2} className={`${inputCls} resize-none`} /></div>
              <button onClick={handleCreateNotification} className={btnPrimaryCls}>
                <Bell size={14} className="inline mr-1" /> Simpan & Beritahu
              </button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar-light">
          {filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Bell size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Tidak ada notifikasi</p>
            </GlassCard>
          ) : (
            filtered.map(notif => (
              <GlassCard
                key={notif.id}
                variant={notif.tipe === 'bahaya' ? 'danger' : notif.tipe === 'sukses' ? 'success' : 'default'}
                className={`p-4 cursor-pointer transition-all ${!notif.dibaca ? 'border-red-200 bg-red-50/30' : ''}`}
                onClick={() => { markAsRead(notif.id); if (notif.modul !== 'notifications') setActiveModule(notif.modul as DashboardModule); }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {!notif.dibaca && <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${notifTypeBadge(notif.tipe)}`}>
                      {notif.tipe.charAt(0).toUpperCase() + notif.tipe.slice(1)}
                    </span>
                    <div>
                      <h3 className={`text-sm font-medium ${notif.dibaca ? 'text-gray-500' : 'text-[#212121]'}`}>{notif.judul}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">{notif.pesan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{new Date(notif.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={e => { e.stopPropagation(); if (soundEnabled) playNotificationBeep(); sendBrowserNotification(notif.judul, notif.pesan); }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Putar suara & notifikasi"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteItem('notifications', setNotifications, notif.id); }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Hapus"
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
