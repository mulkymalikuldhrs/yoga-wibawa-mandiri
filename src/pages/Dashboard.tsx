// ============================================================
// Dashboard Page — YWM AI Dashboard
// PT. Yoga Wibawa Mandiri — Cement Packaging Company
// WHITE/RED theme, All text in Bahasa Indonesia
// Supabase DB integration with localStorage fallback
// Features: Analytics in Overview, Silo Viz, CRUD, Notifications, Opname, Pispot
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GlassCard, { GlassCardHeader, GlassCardContent } from '@/components/dashboard/GlassCard';
import { playNotificationBeep } from '@/lib/audio';
import {
  checkDbConnection,
  fetchAll,
  insert,
  update,
  remove,
  markNotificationRead,
  markAllNotificationsRead,
  type DbSparePart,
  type DbTeamActivity,
  type DbMaintenanceRecord,
  type DbSafetyIncident,
  type DbNotification,
  type DbSiloData,
  type DbOpnameRecord,
  type DbPispotRecord,
} from '@/lib/db';
import type {
  DashboardModule,
  SparePart,
  TeamActivity,
  MaintenanceRecord,
  SafetyIncident,
  Notification,
  OpnameRecord,
  PispotRecord,
  SiloData,
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
  ClipboardCheck,
  Factory,
  RefreshCw,
  Wifi,
  WifiOff,
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

// ── localStorage fallback helpers ──
const STORAGE_KEYS: Record<string, string> = {
  'spare-parts': 'ywm_data_spare-parts',
  'team-activity': 'ywm_data_team-activity',
  maintenance: 'ywm_data_maintenance',
  safety: 'ywm_data_safety',
  documents: 'ywm_data_documents',
  notifications: 'ywm_data_notifications',
  opname: 'ywm_data_opname',
  pispot: 'ywm_data_pispot',
  silo: 'ywm_data_silo',
};

function loadLocal<T>(module: string): T[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[module] || `ywm_data_${module}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal<T>(module: string, data: T[]) {
  localStorage.setItem(STORAGE_KEYS[module] || `ywm_data_${module}`, JSON.stringify(data));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function nowISO() {
  return new Date().toISOString();
}

// ── DB <-> Local field mappers ──
const mapSparePart = (db: DbSparePart): SparePart => ({
  id: db.id, nama: db.nama, kode: db.kode, kategori: db.kategori,
  stok: db.stok, stokMinimum: db.stok_minimum, satuan: db.satuan,
  lokasi: db.lokasi, harga: db.harga, pemasok: db.pemasok,
  catatan: db.catatan, createdAt: db.created_at, updatedAt: db.updated_at,
});

const mapTeamActivity = (db: DbTeamActivity): TeamActivity => ({
  id: db.id, namaKaryawan: db.nama_karyawan, divisi: db.divisi,
  aktivitas: db.aktivitas, status: db.status, jamMasuk: db.jam_masuk,
  jamKeluar: db.jam_keluar, tanggal: db.tanggal, catatan: db.catatan,
  createdAt: db.created_at, updatedAt: db.updated_at,
});

const mapMaintenance = (db: DbMaintenanceRecord): MaintenanceRecord => ({
  id: db.id, judul: db.judul, mesin: db.mesin, jenis: db.jenis,
  prioritas: db.prioritas, status: db.status, tanggalMulai: db.tanggal_mulai || '',
  tanggalSelesai: db.tanggal_selesai || '', teknisi: db.teknisi,
  estimasiBiaya: db.estimasi_biaya, catatan: db.catatan,
  createdAt: db.created_at, updatedAt: db.updated_at,
});

const mapSafety = (db: DbSafetyIncident): SafetyIncident => ({
  id: db.id, judul: db.judul, tanggal: db.tanggal, lokasi: db.lokasi,
  severity: db.severity, status: db.status, pelapor: db.pelapor,
  korban: db.korban, deskripsi: db.deskripsi, tindakan: db.tindakan,
  createdAt: db.created_at, updatedAt: db.updated_at,
});

const mapNotification = (db: DbNotification): Notification => ({
  id: db.id, judul: db.judul, pesan: db.pesan, tipe: db.tipe,
  dibaca: db.dibaca, modul: db.modul, link: db.link,
  createdAt: db.created_at, updatedAt: db.updated_at,
});

const mapOpname = (db: DbOpnameRecord): OpnameRecord => ({
  id: db.id, tanggal: db.tanggal, kategori: db.kategori,
  item: db.item, jumlah: db.jumlah, satuan: db.satuan,
  keterangan: db.keterangan, createdAt: db.created_at, updatedAt: db.updated_at,
});

const mapPispot = (db: DbPispotRecord): PispotRecord => ({
  id: db.id, tanggal: db.tanggal, shift: db.shift, packer: db.packer,
  nozzle: db.nozzle, produksiZak: db.produksi_zak, produksiTon: db.produksi_ton,
  catatan: db.catatan, createdAt: db.created_at, updatedAt: db.updated_at,
});

const mapSilo = (db: DbSiloData): SiloData => ({
  id: db.id, name: db.name, capacity: db.capacity, current: db.current,
  holes: db.holes, createdAt: db.created_at, updatedAt: db.updated_at,
});

// ── Chart data (fallback) ──
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
function SiloVisualization({ silos, onRefresh }: { silos: SiloData[]; onRefresh: () => void }) {
  const getSiloColor = (pct: number) => {
    if (pct > 60) return { fill: '#22c55e', text: 'text-emerald-600', label: 'Aman' };
    if (pct >= 30) return { fill: '#eab308', text: 'text-yellow-600', label: 'Sedang' };
    return { fill: '#ef4444', text: 'text-red-600', label: 'Rendah' };
  };

  const renderSilo = (silo: SiloData) => {
    const pct = Math.round((silo.current / silo.capacity) * 100);
    const color = getSiloColor(pct);
    const fillHeight = (pct / 100) * 120;

    return (
      <div key={silo.id} className="flex flex-col items-center gap-2">
        <h4 className="text-sm font-semibold text-[#212121]">{silo.name}</h4>
        <div className="relative w-24 h-32 rounded-b-lg border-2 border-gray-300 bg-gray-50 overflow-hidden"
          style={{ borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem' }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-b-lg"
            style={{ height: `${fillHeight}px`, backgroundColor: color.fill, opacity: 0.7 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-[#212121] drop-shadow-sm">{pct}%</span>
          </div>
        </div>
        <div className="flex gap-1.5 mt-1">
          {Array.from({ length: silo.holes }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-gray-300 border border-gray-400" />
          ))}
        </div>
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
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-1 rounded-lg hover:bg-gray-100 transition-colors" title="Refresh data silo">
            <RefreshCw size={14} className="text-gray-400" />
          </button>
          <Database size={16} className="text-gray-400" />
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="flex items-end justify-center gap-12 py-4">
          {silos.length > 0 ? silos.map(renderSilo) : (
            <div className="text-center text-gray-400 py-8">
              <Database size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Data silo belum tersedia</p>
              <p className="text-xs mt-1">Jalankan SQL schema di Supabase Dashboard</p>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Aman (&gt;60%)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><span>Sedang (30-60%)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span>Rendah (&lt;30%)</span></div>
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
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [loading, setLoading] = useState(true);

  // ── Data states ──
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [safety, setSafety] = useState<SafetyIncident[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [siloData, setSiloData] = useState<SiloData[]>([]);
  const [opnameRecords, setOpnameRecords] = useState<OpnameRecord[]>([]);
  const [pispotRecords, setPispotRecords] = useState<PispotRecord[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ── Edit states ──
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── Form states ──
  const [newSparePart, setNewSparePart] = useState({ nama: '', kode: '', kategori: '', stok: 0, stokMinimum: 0, satuan: 'pcs', lokasi: '', harga: 0, pemasok: '', catatan: '' });
  const [newTeam, setNewTeam] = useState({ namaKaryawan: '', divisi: '', aktivitas: '', status: 'hadir' as TeamActivity['status'], jamMasuk: '', jamKeluar: '', tanggal: new Date().toISOString().slice(0, 10), catatan: '' });
  const [newMaintenance, setNewMaintenance] = useState({ judul: '', mesin: '', jenis: 'preventif' as MaintenanceRecord['jenis'], prioritas: 'sedang' as MaintenanceRecord['prioritas'], status: 'terjadwal' as MaintenanceRecord['status'], tanggalMulai: new Date().toISOString().slice(0, 10), tanggalSelesai: '', teknisi: '', estimasiBiaya: 0, catatan: '' });
  const [newSafety, setNewSafety] = useState({ judul: '', tanggal: new Date().toISOString().slice(0, 10), lokasi: '', severity: 'ringan' as SafetyIncident['severity'], status: 'dilaporkan' as SafetyIncident['status'], pelapor: '', korban: '', deskripsi: '', tindakan: '' });
  const [newOpname, setNewOpname] = useState({ tanggal: new Date().toISOString().slice(0, 10), kategori: '', item: '', jumlah: 0, satuan: 'pcs', keterangan: '' });
  const [newPispot, setNewPispot] = useState({ tanggal: new Date().toISOString().slice(0, 10), shift: 'pagi' as PispotRecord['shift'], packer: 'A', nozzle: '', produksiZak: 0, produksiTon: 0, catatan: '' });

  // ── Notification permission ──
  const notifPermissionRef = useRef<NotificationPermission>('default');

  // ── Load data from DB or localStorage ──
  const loadAllData = useCallback(async () => {
    setLoading(true);
    const connected = await checkDbConnection();
    setDbStatus(connected ? 'connected' : 'disconnected');

    if (connected) {
      try {
        const [parts, team, maint, safe, notifs, silos, opnames, pispots] = await Promise.all([
          fetchAll<DbSparePart>('spare_parts'),
          fetchAll<DbTeamActivity>('team_activities'),
          fetchAll<DbMaintenanceRecord>('maintenance_records'),
          fetchAll<DbSafetyIncident>('safety_incidents'),
          fetchAll<DbNotification>('notifications'),
          fetchAll<DbSiloData>('silo_data'),
          fetchAll<DbOpnameRecord>('opname_records'),
          fetchAll<DbPispotRecord>('pispot_records'),
        ]);
        setSpareParts(parts.map(mapSparePart));
        setTeamActivity(team.map(mapTeamActivity));
        setMaintenance(maint.map(mapMaintenance));
        setSafety(safe.map(mapSafety));
        setNotifications(notifs.map(mapNotification));
        setSiloData(silos.map(mapSilo));
        setOpnameRecords(opnames.map(mapOpname));
        setPispotRecords(pispots.map(mapPispot));
      } catch (err) {
        console.warn('[Dashboard] DB load failed, using localStorage:', err);
        loadLocalData();
      }
    } else {
      loadLocalData();
    }
    setLoading(false);
  }, []);

  const loadLocalData = () => {
    setSpareParts(loadLocal<SparePart>('spare-parts'));
    setTeamActivity(loadLocal<TeamActivity>('team-activity'));
    setMaintenance(loadLocal<MaintenanceRecord>('maintenance'));
    setSafety(loadLocal<SafetyIncident>('safety'));
    setNotifications(loadLocal<Notification>('notifications'));
    setSiloData(loadLocal<SiloData>('silo'));
    setOpnameRecords(loadLocal<OpnameRecord>('opname'));
    setPispotRecords(loadLocal<PispotRecord>('pispot'));
  };

  useEffect(() => {
    loadAllData();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        notifPermissionRef.current = perm;
      });
    } else if ('Notification' in window) {
      notifPermissionRef.current = Notification.permission;
    }
  }, [loadAllData]);

  // ── Refresh on module change ──
  useEffect(() => {
    setSearchTerm('');
    setShowAddForm(false);
    setEditingId(null);
  }, [activeModule]);

  // ── CRUD helpers with DB + localStorage sync ──
  const dbInsert = useCallback(async (table: string, data: any) => {
    if (dbStatus === 'connected') {
      const result = await insert(table, data);
      if (result) return result;
    }
    // Fallback to localStorage
    const item = { ...data, id: genId(), createdAt: nowISO(), updatedAt: nowISO() };
    return item;
  }, [dbStatus]);

  const dbUpdate = useCallback(async (table: string, id: string, data: any) => {
    if (dbStatus === 'connected') {
      const result = await update(table, id, data);
      if (result) return result;
    }
    return { ...data, updatedAt: nowISO() };
  }, [dbStatus]);

  const dbRemove = useCallback(async (table: string, id: string) => {
    if (dbStatus === 'connected') {
      await remove(table, id);
    }
  }, [dbStatus]);

  // ── Browser notification ──
  const sendBrowserNotification = useCallback((judul: string, pesan: string) => {
    if ('Notification' in window && notifPermissionRef.current === 'granted') {
      try {
        const n = new Notification(judul, {
          body: pesan,
          icon: '/lovable-uploads/ywm-logo.png',
          tag: 'ywm-dashboard',
        });
        if (soundEnabled) playNotificationBeep();
        setTimeout(() => n.close(), 5000);
      } catch { /* fallback */ }
    } else if (soundEnabled) {
      playNotificationBeep();
    }
  }, [soundEnabled]);

  // ── Stats ──
  const stats = {
    totalSpareParts: spareParts.length,
    lowStockItems: spareParts.filter(p => p.stok <= p.stokMinimum).length,
    activeMaintenance: maintenance.filter(m => m.status === 'berjalan' || m.status === 'terjadwal').length,
    openIncidents: safety.filter(s => s.status !== 'ditutup' && s.status !== 'selesai').length,
    unreadNotifications: notifications.filter(n => !n.dibaca).length,
  };

  // ── Badge helpers ──
  const stockStatus = (stok: number, min: number) => {
    if (stok <= min * 0.5) return { color: 'bg-red-500', label: 'Kritis', textColor: 'text-red-600' };
    if (stok <= min) return { color: 'bg-yellow-500', label: 'Rendah', textColor: 'text-yellow-600' };
    return { color: 'bg-emerald-500', label: 'Aman', textColor: 'text-emerald-600' };
  };

  const priorityBadge = (p: string) => {
    switch (p) {
      case 'kritis': return 'bg-red-100 text-red-600 border-red-200';
      case 'tinggi': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'sedang': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'rendah': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const notifTypeBadge = (t: string) => {
    switch (t) {
      case 'bahaya': return 'bg-red-100 text-red-600';
      case 'peringatan': return 'bg-yellow-100 text-yellow-600';
      case 'sukses': return 'bg-emerald-100 text-emerald-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // ── Common classes ──
  const inputCls = 'w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-[#212121] text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all';
  const labelCls = 'text-gray-500 text-xs mb-1 block';
  const btnPrimaryCls = 'mt-4 px-4 py-2 rounded-xl bg-red-600 text-white border border-red-600 hover:bg-red-700 transition-all text-sm font-medium';
  const btnSecondaryCls = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all text-sm font-medium';

  // ══════════════════════════════════════════════════════════
  // OVERVIEW MODULE
  // ══════════════════════════════════════════════════════════
  const renderOverview = () => {
    const statCards = [
      { label: 'Total Suku Cadang', value: stats.totalSpareParts, icon: <Package size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+3', up: true },
      { label: 'Stok Rendah', value: stats.lowStockItems, icon: <AlertTriangle size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: '+1', up: false },
      { label: 'Perawatan Aktif', value: stats.activeMaintenance, icon: <Wrench size={20} />, color: 'text-orange-600', bg: 'bg-orange-50', trend: '0', up: true },
      { label: 'Insiden Terbuka', value: stats.openIncidents, icon: <ShieldCheck size={20} />, color: 'text-red-600', bg: 'bg-red-50', trend: '-1', up: true },
      { label: 'Notifikasi Baru', value: stats.unreadNotifications, icon: <Bell size={20} />, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+2', up: false },
    ];

    const attendanceData = [
      { status: 'Hadir', count: teamActivity.filter(t => t.status === 'hadir').length, color: '#22c55e' },
      { status: 'Izin', count: teamActivity.filter(t => t.status === 'izin').length, color: '#eab308' },
      { status: 'Sakit', count: teamActivity.filter(t => t.status === 'sakit').length, color: '#f97316' },
      { status: 'Alpha', count: teamActivity.filter(t => t.status === 'alpha').length, color: '#ef4444' },
      { status: 'Lembur', count: teamActivity.filter(t => t.status === 'lembur').length, color: '#a855f7' },
    ];

    // Calculate real production data from pispot records
    const todayPispot = pispotRecords.filter(p => p.tanggal === new Date().toISOString().slice(0, 10));
    const todayZakTotal = todayPispot.reduce((s, p) => s + p.produksiZak, 0);
    const todayTonTotal = todayPispot.reduce((s, p) => s + p.produksiTon, 0);

    return (
      <div className="p-6 space-y-6">
        {/* DB Status Banner */}
        {dbStatus === 'disconnected' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <WifiOff size={20} className="text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 font-medium text-sm">Mode Offline — Data disimpan lokal</p>
              <p className="text-yellow-600 text-xs mt-0.5">Jalankan SQL schema di Supabase Dashboard untuk mengaktifkan database. Lihat file <code className="bg-yellow-100 px-1 rounded">supabase-schema.sql</code></p>
            </div>
          </div>
        )}
        {dbStatus === 'connected' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <Wifi size={16} className="text-emerald-600" />
            <p className="text-emerald-700 text-xs font-medium">Database Terhubung — Data tersinkronisasi ke Supabase</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">Ringkasan Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">PT. Yoga Wibawa Mandiri — {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={loadAllData} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 text-sm transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <GlassCard key={card.label} glow className="p-4">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>{card.icon}</div>
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

        {/* Production Chart + Today's Production */}
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
              <h2 className="text-[#212121] font-semibold text-sm">Produksi Hari Ini</h2>
              <Factory size={16} className="text-red-600" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-gray-500 text-xs">Total Zak 40kg</p>
                  <p className="text-2xl font-bold text-[#212121]">{todayZakTotal.toLocaleString('id-ID')}</p>
                  <p className="text-gray-400 text-xs">{todayTonTotal.toFixed(1)} ton</p>
                </div>
                <div className="space-y-2">
                  {todayPispot.length > 0 ? todayPispot.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-[#212121]">Packer {p.packer} {p.nozzle}</p>
                        <p className="text-xs text-gray-400">Shift {p.shift}</p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">{p.produksiZak} zak</span>
                    </div>
                  )) : (
                    <p className="text-gray-400 text-sm text-center py-4">Belum ada data produksi hari ini</p>
                  )}
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* ═══ ANALYTICS SECTION ═══ */}
        <div>
          <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-red-600" />
            Analitik Menyeluruh
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      {STOCK_PIE.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
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
                      {attendanceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Silo Visualization */}
        <SiloVisualization silos={siloData} onRefresh={loadAllData} />

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
                  { label: 'Input Produksi', icon: <Factory size={16} />, mod: 'pispot' as DashboardModule },
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
                <div className="flex items-start gap-2"><MapPin size={14} className="text-red-600 mt-0.5 flex-shrink-0" /><span className="text-gray-600">Jl. Pelabuhan Umum, Kr. Geukuh, Aceh Utara</span></div>
                <div className="flex items-start gap-2"><Phone size={14} className="text-red-600 mt-0.5 flex-shrink-0" /><div><p className="text-gray-600">Pesan: +6285322624048</p><p className="text-gray-600">Kontak: +6285322624038</p></div></div>
                <div className="flex items-start gap-2"><Package size={14} className="text-red-600 mt-0.5 flex-shrink-0" /><span className="text-gray-600">Semen Padang PCC, Zak 40kg & Curah max 30 ton</span></div>
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

    const handleSave = async () => {
      if (!newSparePart.nama || !newSparePart.kode) return;
      if (editingId) {
        const result = await dbUpdate('spare_parts', editingId, {
          nama: newSparePart.nama, kode: newSparePart.kode, kategori: newSparePart.kategori,
          stok: newSparePart.stok, stok_minimum: newSparePart.stokMinimum, satuan: newSparePart.satuan,
          lokasi: newSparePart.lokasi, harga: newSparePart.harga, pemasok: newSparePart.pemasok, catatan: newSparePart.catatan,
        });
        setSpareParts(prev => prev.map(p => p.id === editingId ? { ...p, ...newSparePart, updatedAt: nowISO() } : p));
        saveLocal('spare-parts', spareParts.map(p => p.id === editingId ? { ...p, ...newSparePart, updatedAt: nowISO() } : p));
      } else {
        const result = await dbInsert('spare_parts', {
          nama: newSparePart.nama, kode: newSparePart.kode, kategori: newSparePart.kategori,
          stok: newSparePart.stok, stok_minimum: newSparePart.stokMinimum, satuan: newSparePart.satuan,
          lokasi: newSparePart.lokasi, harga: newSparePart.harga, pemasok: newSparePart.pemasok, catatan: newSparePart.catatan,
        });
        const newItem: SparePart = { id: result?.id || genId(), ...newSparePart, createdAt: nowISO(), updatedAt: nowISO() };
        setSpareParts(prev => [newItem, ...prev]);
        saveLocal('spare-parts', [newItem, ...spareParts]);
        sendBrowserNotification('Suku Cadang Baru', `${newSparePart.nama} (${newSparePart.kode}) berhasil ditambahkan`);
      }
      setEditingId(null);
      setNewSparePart({ nama: '', kode: '', kategori: '', stok: 0, stokMinimum: 0, satuan: 'pcs', lokasi: '', harga: 0, pemasok: '', catatan: '' });
      setShowAddForm(false);
    };

    const handleEdit = (part: SparePart) => {
      setEditingId(part.id);
      setNewSparePart({ nama: part.nama, kode: part.kode, kategori: part.kategori, stok: part.stok, stokMinimum: part.stokMinimum, satuan: part.satuan, lokasi: part.lokasi, harga: part.harga, pemasok: part.pemasok, catatan: part.catatan });
      setShowAddForm(true);
    };

    const handleDelete = async (id: string) => {
      await dbRemove('spare_parts', id);
      const updated = spareParts.filter(p => p.id !== id);
      setSpareParts(updated);
      saveLocal('spare-parts', updated);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-[#212121]">Suku Cadang</h1><p className="text-gray-400 text-sm">Inventaris suku cadang pabrik</p></div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) { setEditingId(null); setNewSparePart({ nama: '', kode: '', kategori: '', stok: 0, stokMinimum: 0, satuan: 'pcs', lokasi: '', harga: 0, pemasok: '', catatan: '' }); } }} className={btnSecondaryCls}>
            <Plus size={16} /> {editingId ? 'Batal Edit' : 'Tambah Suku Cadang'}
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari suku cadang..." className={`${inputCls} pl-10`} />
        </div>

        {showAddForm && (
          <GlassCard>
            <GlassCardHeader><h2 className="text-[#212121] font-semibold text-sm">{editingId ? 'Edit Suku Cadang' : 'Tambah Suku Cadang Baru'}</h2></GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Nama *</label><input value={newSparePart.nama} onChange={e => setNewSparePart(p => ({ ...p, nama: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Kode *</label><input value={newSparePart.kode} onChange={e => setNewSparePart(p => ({ ...p, kode: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Kategori</label><input value={newSparePart.kategori} onChange={e => setNewSparePart(p => ({ ...p, kategori: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Stok</label><input type="number" value={newSparePart.stok} onChange={e => setNewSparePart(p => ({ ...p, stok: +e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Stok Minimum</label><input type="number" value={newSparePart.stokMinimum} onChange={e => setNewSparePart(p => ({ ...p, stokMinimum: +e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Satuan</label><input value={newSparePart.satuan} onChange={e => setNewSparePart(p => ({ ...p, satuan: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Lokasi</label><input value={newSparePart.lokasi} onChange={e => setNewSparePart(p => ({ ...p, lokasi: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Harga</label><input type="number" value={newSparePart.harga} onChange={e => setNewSparePart(p => ({ ...p, harga: +e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Pemasok</label><input value={newSparePart.pemasok} onChange={e => setNewSparePart(p => ({ ...p, pemasok: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Catatan</label><input value={newSparePart.catatan} onChange={e => setNewSparePart(p => ({ ...p, catatan: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className={btnPrimaryCls}><Save size={14} className="mr-1" /> {editingId ? 'Simpan Perubahan' : 'Tambah'}</button>
                <button onClick={() => { setShowAddForm(false); setEditingId(null); setNewSparePart({ nama: '', kode: '', kategori: '', stok: 0, stokMinimum: 0, satuan: 'pcs', lokasi: '', harga: 0, pemasok: '', catatan: '' }); }} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">Batal</button>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3">
          {filtered.map(part => {
            const ss = stockStatus(part.stok, part.stokMinimum);
            return (
              <GlassCard key={part.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#212121] font-semibold text-sm">{part.nama}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50 text-gray-500">{part.kode}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${ss.color === 'bg-red-500' ? 'bg-red-50 text-red-600 border-red-200' : ss.color === 'bg-yellow-500' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{ss.label}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>{part.kategori}</span><span>Stok: {part.stok} {part.satuan}</span><span>Min: {part.stokMinimum}</span><span>{part.lokasi}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(part)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(part.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
          {filtered.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Tidak ada data suku cadang</p>}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // TEAM ACTIVITY MODULE
  // ══════════════════════════════════════════════════════════
  const renderTeamActivity = () => {
    const handleSave = async () => {
      if (!newTeam.namaKaryawan) return;
      if (editingId) {
        await dbUpdate('team_activities', editingId, { nama_karyawan: newTeam.namaKaryawan, divisi: newTeam.divisi, aktivitas: newTeam.aktivitas, status: newTeam.status, jam_masuk: newTeam.jamMasuk, jam_keluar: newTeam.jamKeluar, tanggal: newTeam.tanggal, catatan: newTeam.catatan });
        setTeamActivity(prev => prev.map(t => t.id === editingId ? { ...t, ...newTeam, updatedAt: nowISO() } : t));
      } else {
        const result = await dbInsert('team_activities', { nama_karyawan: newTeam.namaKaryawan, divisi: newTeam.divisi, aktivitas: newTeam.aktivitas, status: newTeam.status, jam_masuk: newTeam.jamMasuk, jam_keluar: newTeam.jamKeluar, tanggal: newTeam.tanggal, catatan: newTeam.catatan });
        const newItem: TeamActivity = { id: result?.id || genId(), ...newTeam, createdAt: nowISO(), updatedAt: nowISO() };
        setTeamActivity(prev => [newItem, ...prev]);
      }
      setEditingId(null); setNewTeam({ namaKaryawan: '', divisi: '', aktivitas: '', status: 'hadir', jamMasuk: '', jamKeluar: '', tanggal: new Date().toISOString().slice(0, 10), catatan: '' }); setShowAddForm(false);
    };

    const handleEdit = (t: TeamActivity) => { setEditingId(t.id); setNewTeam({ namaKaryawan: t.namaKaryawan, divisi: t.divisi, aktivitas: t.aktivitas, status: t.status, jamMasuk: t.jamMasuk, jamKeluar: t.jamKeluar, tanggal: t.tanggal, catatan: t.catatan }); setShowAddForm(true); };
    const handleDelete = async (id: string) => { await dbRemove('team_activities', id); setTeamActivity(prev => prev.filter(t => t.id !== id)); };

    const statusBadge = (s: string) => {
      switch (s) {
        case 'hadir': return 'bg-emerald-100 text-emerald-600';
        case 'izin': return 'bg-yellow-100 text-yellow-600';
        case 'sakit': return 'bg-orange-100 text-orange-600';
        case 'alpha': return 'bg-red-100 text-red-600';
        case 'lembur': return 'bg-purple-100 text-purple-600';
        default: return 'bg-gray-100 text-gray-600';
      }
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-[#212121]">Aktivitas Tim</h1><p className="text-gray-400 text-sm">Kehadiran dan aktivitas karyawan</p></div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) { setEditingId(null); } }} className={btnSecondaryCls}><Plus size={16} /> {editingId ? 'Batal Edit' : 'Tambah Aktivitas'}</button>
        </div>

        {showAddForm && (
          <GlassCard>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Nama Karyawan *</label><input value={newTeam.namaKaryawan} onChange={e => setNewTeam(t => ({ ...t, namaKaryawan: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Divisi</label><input value={newTeam.divisi} onChange={e => setNewTeam(t => ({ ...t, divisi: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Aktivitas</label><input value={newTeam.aktivitas} onChange={e => setNewTeam(t => ({ ...t, aktivitas: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Status</label><select value={newTeam.status} onChange={e => setNewTeam(t => ({ ...t, status: e.target.value as any }))} className={inputCls}><option value="hadir">Hadir</option><option value="izin">Izin</option><option value="sakit">Sakit</option><option value="alpha">Alpha</option><option value="lembur">Lembur</option></select></div>
                <div><label className={labelCls}>Jam Masuk</label><input type="time" value={newTeam.jamMasuk} onChange={e => setNewTeam(t => ({ ...t, jamMasuk: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Jam Keluar</label><input type="time" value={newTeam.jamKeluar} onChange={e => setNewTeam(t => ({ ...t, jamKeluar: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Tanggal</label><input type="date" value={newTeam.tanggal} onChange={e => setNewTeam(t => ({ ...t, tanggal: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Catatan</label><input value={newTeam.catatan} onChange={e => setNewTeam(t => ({ ...t, catatan: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className={btnPrimaryCls}><Save size={14} className="mr-1" /> {editingId ? 'Simpan' : 'Tambah'}</button>
                <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">Batal</button>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3">
          {teamActivity.map(t => (
            <GlassCard key={t.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm">{t.namaKaryawan.charAt(0)}</div>
                  <div>
                    <h3 className="text-[#212121] font-semibold text-sm">{t.namaKaryawan}</h3>
                    <div className="flex gap-3 text-xs text-gray-400"><span>{t.divisi}</span><span>{t.aktivitas}</span><span>{t.jamMasuk} - {t.jamKeluar}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(t.status)}`}>{t.status}</span>
                  <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // MAINTENANCE MODULE
  // ══════════════════════════════════════════════════════════
  const renderMaintenance = () => {
    const handleSave = async () => {
      if (!newMaintenance.judul) return;
      if (editingId) {
        await dbUpdate('maintenance_records', editingId, { judul: newMaintenance.judul, mesin: newMaintenance.mesin, jenis: newMaintenance.jenis, prioritas: newMaintenance.prioritas, status: newMaintenance.status, tanggal_mulai: newMaintenance.tanggalMulai, tanggal_selesai: newMaintenance.tanggalSelesai, teknisi: newMaintenance.teknisi, estimasi_biaya: newMaintenance.estimasiBiaya, catatan: newMaintenance.catatan });
        setMaintenance(prev => prev.map(m => m.id === editingId ? { ...m, ...newMaintenance, updatedAt: nowISO() } : m));
      } else {
        const result = await dbInsert('maintenance_records', { judul: newMaintenance.judul, mesin: newMaintenance.mesin, jenis: newMaintenance.jenis, prioritas: newMaintenance.prioritas, status: newMaintenance.status, tanggal_mulai: newMaintenance.tanggalMulai, tanggal_selesai: newMaintenance.tanggalSelesai, teknisi: newMaintenance.teknisi, estimasi_biaya: newMaintenance.estimasiBiaya, catatan: newMaintenance.catatan });
        const newItem: MaintenanceRecord = { id: result?.id || genId(), ...newMaintenance, createdAt: nowISO(), updatedAt: nowISO() };
        setMaintenance(prev => [newItem, ...prev]);
      }
      setEditingId(null); setNewMaintenance({ judul: '', mesin: '', jenis: 'preventif', prioritas: 'sedang', status: 'terjadwal', tanggalMulai: new Date().toISOString().slice(0, 10), tanggalSelesai: '', teknisi: '', estimasiBiaya: 0, catatan: '' }); setShowAddForm(false);
    };

    const handleEdit = (m: MaintenanceRecord) => { setEditingId(m.id); setNewMaintenance({ judul: m.judul, mesin: m.mesin, jenis: m.jenis, prioritas: m.prioritas, status: m.status, tanggalMulai: m.tanggalMulai, tanggalSelesai: m.tanggalSelesai, teknisi: m.teknisi, estimasiBiaya: m.estimasiBiaya, catatan: m.catatan }); setShowAddForm(true); };
    const handleDelete = async (id: string) => { await dbRemove('maintenance_records', id); setMaintenance(prev => prev.filter(m => m.id !== id)); };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-[#212121]">Perawatan</h1><p className="text-gray-400 text-sm">Work order dan jadwal perawatan</p></div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) setEditingId(null); }} className={btnSecondaryCls}><Plus size={16} /> {editingId ? 'Batal Edit' : 'Buat Work Order'}</button>
        </div>

        {showAddForm && (
          <GlassCard>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Judul *</label><input value={newMaintenance.judul} onChange={e => setNewMaintenance(m => ({ ...m, judul: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Mesin</label><input value={newMaintenance.mesin} onChange={e => setNewMaintenance(m => ({ ...m, mesin: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Jenis</label><select value={newMaintenance.jenis} onChange={e => setNewMaintenance(m => ({ ...m, jenis: e.target.value as any }))} className={inputCls}><option value="preventif">Preventif</option><option value="korektif">Korektif</option><option value="darurat">Darurat</option></select></div>
                <div><label className={labelCls}>Prioritas</label><select value={newMaintenance.prioritas} onChange={e => setNewMaintenance(m => ({ ...m, prioritas: e.target.value as any }))} className={inputCls}><option value="rendah">Rendah</option><option value="sedang">Sedang</option><option value="tinggi">Tinggi</option><option value="kritis">Kritis</option></select></div>
                <div><label className={labelCls}>Status</label><select value={newMaintenance.status} onChange={e => setNewMaintenance(m => ({ ...m, status: e.target.value as any }))} className={inputCls}><option value="terjadwal">Terjadwal</option><option value="berjalan">Berjalan</option><option value="selesai">Selesai</option><option value="dibatalkan">Dibatalkan</option></select></div>
                <div><label className={labelCls}>Teknisi</label><input value={newMaintenance.teknisi} onChange={e => setNewMaintenance(m => ({ ...m, teknisi: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Tanggal Mulai</label><input type="date" value={newMaintenance.tanggalMulai} onChange={e => setNewMaintenance(m => ({ ...m, tanggalMulai: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Estimasi Biaya</label><input type="number" value={newMaintenance.estimasiBiaya} onChange={e => setNewMaintenance(m => ({ ...m, estimasiBiaya: +e.target.value }))} className={inputCls} /></div>
                <div className="md:col-span-2"><label className={labelCls}>Catatan</label><input value={newMaintenance.catatan} onChange={e => setNewMaintenance(m => ({ ...m, catatan: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className={btnPrimaryCls}><Save size={14} className="mr-1" /> {editingId ? 'Simpan' : 'Buat'}</button>
                <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">Batal</button>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3">
          {maintenance.map(m => (
            <GlassCard key={m.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[#212121] font-semibold text-sm">{m.judul}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadge(m.prioritas)}`}>{m.prioritas}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400"><span>{m.mesin}</span><span>{m.jenis}</span><span>{m.teknisi}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'berjalan' ? 'bg-blue-100 text-blue-600' : m.status === 'selesai' ? 'bg-emerald-100 text-emerald-600' : m.status === 'terjadwal' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>{m.status}</span>
                  <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // SAFETY MODULE
  // ══════════════════════════════════════════════════════════
  const renderSafety = () => {
    const handleSave = async () => {
      if (!newSafety.judul) return;
      if (editingId) {
        await dbUpdate('safety_incidents', editingId, { judul: newSafety.judul, tanggal: newSafety.tanggal, lokasi: newSafety.lokasi, severity: newSafety.severity, status: newSafety.status, pelapor: newSafety.pelapor, korban: newSafety.korban, deskripsi: newSafety.deskripsi, tindakan: newSafety.tindakan });
        setSafety(prev => prev.map(s => s.id === editingId ? { ...s, ...newSafety, updatedAt: nowISO() } : s));
      } else {
        const result = await dbInsert('safety_incidents', { judul: newSafety.judul, tanggal: newSafety.tanggal, lokasi: newSafety.lokasi, severity: newSafety.severity, status: newSafety.status, pelapor: newSafety.pelapor, korban: newSafety.korban, deskripsi: newSafety.deskripsi, tindakan: newSafety.tindakan });
        const newItem: SafetyIncident = { id: result?.id || genId(), ...newSafety, createdAt: nowISO(), updatedAt: nowISO() };
        setSafety(prev => [newItem, ...prev]);
        sendBrowserNotification('Insiden Baru', newSafety.judul);
      }
      setEditingId(null); setNewSafety({ judul: '', tanggal: new Date().toISOString().slice(0, 10), lokasi: '', severity: 'ringan', status: 'dilaporkan', pelapor: '', korban: '', deskripsi: '', tindakan: '' }); setShowAddForm(false);
    };
    const handleEdit = (s: SafetyIncident) => { setEditingId(s.id); setNewSafety({ judul: s.judul, tanggal: s.tanggal, lokasi: s.lokasi, severity: s.severity, status: s.status, pelapor: s.pelapor, korban: s.korban, deskripsi: s.deskripsi, tindakan: s.tindakan }); setShowAddForm(true); };
    const handleDelete = async (id: string) => { await dbRemove('safety_incidents', id); setSafety(prev => prev.filter(s => s.id !== id)); };

    const sevBadge = (s: string) => { switch(s) { case 'fatal': case 'berat': return 'bg-red-100 text-red-600'; case 'sedang': return 'bg-orange-100 text-orange-600'; case 'ringan': return 'bg-yellow-100 text-yellow-600'; default: return 'bg-gray-100 text-gray-600'; } };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-[#212121]">Keselamatan (HSE)</h1><p className="text-gray-400 text-sm">Insiden dan inspeksi keselamatan</p></div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) setEditingId(null); }} className={btnSecondaryCls}><Plus size={16} /> {editingId ? 'Batal Edit' : 'Laporkan Insiden'}</button>
        </div>

        {showAddForm && (
          <GlassCard>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Judul *</label><input value={newSafety.judul} onChange={e => setNewSafety(s => ({ ...s, judul: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Tanggal</label><input type="date" value={newSafety.tanggal} onChange={e => setNewSafety(s => ({ ...s, tanggal: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Lokasi</label><input value={newSafety.lokasi} onChange={e => setNewSafety(s => ({ ...s, lokasi: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Severity</label><select value={newSafety.severity} onChange={e => setNewSafety(s => ({ ...s, severity: e.target.value as any }))} className={inputCls}><option value="ringan">Ringan</option><option value="sedang">Sedang</option><option value="berat">Berat</option><option value="fatal">Fatal</option></select></div>
                <div><label className={labelCls}>Status</label><select value={newSafety.status} onChange={e => setNewSafety(s => ({ ...s, status: e.target.value as any }))} className={inputCls}><option value="dilaporkan">Dilaporkan</option><option value="investigasi">Investigasi</option><option value="selesai">Selesai</option><option value="ditutup">Ditutup</option></select></div>
                <div><label className={labelCls}>Pelapor</label><input value={newSafety.pelapor} onChange={e => setNewSafety(s => ({ ...s, pelapor: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Deskripsi</label><input value={newSafety.deskripsi} onChange={e => setNewSafety(s => ({ ...s, deskripsi: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Tindakan</label><input value={newSafety.tindakan} onChange={e => setNewSafety(s => ({ ...s, tindakan: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className={btnPrimaryCls}><Save size={14} className="mr-1" /> {editingId ? 'Simpan' : 'Laporkan'}</button>
                <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">Batal</button>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3">
          {safety.map(s => (
            <GlassCard key={s.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[#212121] font-semibold text-sm">{s.judul}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${sevBadge(s.severity)}`}>{s.severity}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400"><span>{s.lokasi}</span><span>Pelapor: {s.pelapor}</span><span>{s.tanggal}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'selesai' || s.status === 'ditutup' ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-100 text-yellow-600'}`}>{s.status}</span>
                  <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // OPNAME MODULE (Stok Opname)
  // ══════════════════════════════════════════════════════════
  const renderOpname = () => {
    const handleSave = async () => {
      if (!newOpname.item) return;
      if (editingId) {
        await dbUpdate('opname_records', editingId, { tanggal: newOpname.tanggal, kategori: newOpname.kategori, item: newOpname.item, jumlah: newOpname.jumlah, satuan: newOpname.satuan, keterangan: newOpname.keterangan });
        setOpnameRecords(prev => prev.map(o => o.id === editingId ? { ...o, ...newOpname, updatedAt: nowISO() } : o));
      } else {
        const result = await dbInsert('opname_records', { tanggal: newOpname.tanggal, kategori: newOpname.kategori, item: newOpname.item, jumlah: newOpname.jumlah, satuan: newOpname.satuan, keterangan: newOpname.keterangan });
        const newItem: OpnameRecord = { id: result?.id || genId(), ...newOpname, createdAt: nowISO(), updatedAt: nowISO() };
        setOpnameRecords(prev => [newItem, ...prev]);
      }
      setEditingId(null); setNewOpname({ tanggal: new Date().toISOString().slice(0, 10), kategori: '', item: '', jumlah: 0, satuan: 'pcs', keterangan: '' }); setShowAddForm(false);
    };
    const handleEdit = (o: OpnameRecord) => { setEditingId(o.id); setNewOpname({ tanggal: o.tanggal, kategori: o.kategori, item: o.item, jumlah: o.jumlah, satuan: o.satuan, keterangan: o.keterangan }); setShowAddForm(true); };
    const handleDelete = async (id: string) => { await dbRemove('opname_records', id); setOpnameRecords(prev => prev.filter(o => o.id !== id)); };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-[#212121]">Stok Opname</h1><p className="text-gray-400 text-sm">Pencatatan stok opname berkala</p></div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) setEditingId(null); }} className={btnSecondaryCls}><Plus size={16} /> {editingId ? 'Batal Edit' : 'Tambah Opname'}</button>
        </div>

        {showAddForm && (
          <GlassCard>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Tanggal</label><input type="date" value={newOpname.tanggal} onChange={e => setNewOpname(o => ({ ...o, tanggal: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Kategori</label><input value={newOpname.kategori} onChange={e => setNewOpname(o => ({ ...o, kategori: e.target.value }))} className={inputCls} placeholder="Packer, Conveyor, dll" /></div>
                <div><label className={labelCls}>Item *</label><input value={newOpname.item} onChange={e => setNewOpname(o => ({ ...o, item: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Jumlah</label><input type="number" value={newOpname.jumlah} onChange={e => setNewOpname(o => ({ ...o, jumlah: +e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Satuan</label><input value={newOpname.satuan} onChange={e => setNewOpname(o => ({ ...o, satuan: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Keterangan</label><input value={newOpname.keterangan} onChange={e => setNewOpname(o => ({ ...o, keterangan: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className={btnPrimaryCls}><Save size={14} className="mr-1" /> {editingId ? 'Simpan' : 'Tambah'}</button>
                <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">Batal</button>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3">
          {opnameRecords.map(o => (
            <GlassCard key={o.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#212121] font-semibold text-sm">{o.item}</h3>
                  <div className="flex gap-3 text-xs text-gray-400"><span>{o.kategori}</span><span>{o.jumlah} {o.satuan}</span><span>{o.tanggal}</span></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(o)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(o.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </GlassCard>
          ))}
          {opnameRecords.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Belum ada data opname</p>}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // PISPOT MODULE (Produksi Packer)
  // ══════════════════════════════════════════════════════════
  const renderPispot = () => {
    const handleSave = async () => {
      if (newPispot.produksiZak === 0 && newPispot.produksiTon === 0) return;
      if (editingId) {
        await dbUpdate('pispot_records', editingId, { tanggal: newPispot.tanggal, shift: newPispot.shift, packer: newPispot.packer, nozzle: newPispot.nozzle, produksi_zak: newPispot.produksiZak, produksi_ton: newPispot.produksiTon, catatan: newPispot.catatan });
        setPispotRecords(prev => prev.map(p => p.id === editingId ? { ...p, ...newPispot, updatedAt: nowISO() } : p));
      } else {
        const result = await dbInsert('pispot_records', { tanggal: newPispot.tanggal, shift: newPispot.shift, packer: newPispot.packer, nozzle: newPispot.nozzle, produksi_zak: newPispot.produksiZak, produksi_ton: newPispot.produksiTon, catatan: newPispot.catatan });
        const newItem: PispotRecord = { id: result?.id || genId(), ...newPispot, createdAt: nowISO(), updatedAt: nowISO() };
        setPispotRecords(prev => [newItem, ...prev]);
      }
      setEditingId(null); setNewPispot({ tanggal: new Date().toISOString().slice(0, 10), shift: 'pagi', packer: 'A', nozzle: '', produksiZak: 0, produksiTon: 0, catatan: '' }); setShowAddForm(false);
    };
    const handleEdit = (p: PispotRecord) => { setEditingId(p.id); setNewPispot({ tanggal: p.tanggal, shift: p.shift, packer: p.packer, nozzle: p.nozzle, produksiZak: p.produksiZak, produksiTon: p.produksiTon, catatan: p.catatan }); setShowAddForm(true); };
    const handleDelete = async (id: string) => { await dbRemove('pispot_records', id); setPispotRecords(prev => prev.filter(p => p.id !== id)); };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-[#212121]">Produksi Packer</h1><p className="text-gray-400 text-sm">Pencatatan produksi harian per packer/nozzle</p></div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) setEditingId(null); }} className={btnSecondaryCls}><Plus size={16} /> {editingId ? 'Batal Edit' : 'Input Produksi'}</button>
        </div>

        {showAddForm && (
          <GlassCard>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Tanggal</label><input type="date" value={newPispot.tanggal} onChange={e => setNewPispot(p => ({ ...p, tanggal: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Shift</label><select value={newPispot.shift} onChange={e => setNewPispot(p => ({ ...p, shift: e.target.value as any }))} className={inputCls}><option value="pagi">Pagi</option><option value="siang">Siang</option><option value="malam">Malam</option></select></div>
                <div><label className={labelCls}>Packer</label><select value={newPispot.packer} onChange={e => setNewPispot(p => ({ ...p, packer: e.target.value }))} className={inputCls}><option value="A">Packer A</option><option value="B">Packer B</option></select></div>
                <div><label className={labelCls}>Nozzle</label><input value={newPispot.nozzle} onChange={e => setNewPispot(p => ({ ...p, nozzle: e.target.value }))} className={inputCls} placeholder="A1, A2, B1, dll" /></div>
                <div><label className={labelCls}>Produksi (Zak 40kg)</label><input type="number" value={newPispot.produksiZak} onChange={e => { const z = +e.target.value; setNewPispot(p => ({ ...p, produksiZak: z, produksiTon: z * 40 / 1000 })); }} className={inputCls} /></div>
                <div><label className={labelCls}>Produksi (Ton)</label><input type="number" step="0.1" value={newPispot.produksiTon} onChange={e => setNewPispot(p => ({ ...p, produksiTon: +e.target.value }))} className={inputCls} /></div>
                <div className="md:col-span-2"><label className={labelCls}>Catatan</label><input value={newPispot.catatan} onChange={e => setNewPispot(p => ({ ...p, catatan: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className={btnPrimaryCls}><Save size={14} className="mr-1" /> {editingId ? 'Simpan' : 'Input'}</button>
                <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">Batal</button>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="space-y-3">
          {pispotRecords.map(p => (
            <GlassCard key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[#212121] font-semibold text-sm">Packer {p.packer} — Nozzle {p.nozzle || '-'}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">Shift {p.shift}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400"><span>{p.tanggal}</span><span>{p.produksiZak} zak ({p.produksiTon} ton)</span></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </GlassCard>
          ))}
          {pispotRecords.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Belum ada data produksi packer</p>}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // DOCUMENTS MODULE (simplified)
  // ══════════════════════════════════════════════════════════
  const renderDocuments = () => (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-[#212121]">Dokumen & OCR</h1><p className="text-gray-400 text-sm">Penyimpanan dan pengelolaan dokumen</p></div>
      <GlassCard>
        <GlassCardContent>
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">Modul Dokumen & OCR akan tersedia setelah konfigurasi Supabase Storage.</p>
            <p className="text-gray-400 text-xs mt-2">Jalankan SQL schema di Supabase Dashboard untuk mengaktifkan fitur ini.</p>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // NOTIFICATIONS MODULE
  // ══════════════════════════════════════════════════════════
  const renderNotifications = () => {
    const handleMarkRead = async (id: string) => {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
    };

    const handleMarkAllRead = async () => {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, dibaca: true })));
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-[#212121]">Notifikasi</h1><p className="text-gray-400 text-sm">{stats.unreadNotifications} belum dibaca</p></div>
          <div className="flex gap-2">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${soundEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} {soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
            </button>
            {stats.unreadNotifications > 0 && (
              <button onClick={handleMarkAllRead} className={btnSecondaryCls}><CheckCircle2 size={14} /> Tandai Semua Dibaca</button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map(n => (
            <GlassCard key={n.id} className={`p-4 ${!n.dibaca ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm font-semibold ${!n.dibaca ? 'text-[#212121]' : 'text-gray-500'}`}>{n.judul}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${notifTypeBadge(n.tipe)}`}>{n.tipe}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{n.pesan}</p>
                  <p className="text-gray-300 text-xs mt-1">{new Date(n.createdAt).toLocaleString('id-ID')}</p>
                </div>
                {!n.dibaca && (
                  <button onClick={() => handleMarkRead(n.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600" title="Tandai dibaca"><CheckCircle2 size={14} /></button>
                )}
              </div>
            </GlassCard>
          ))}
          {notifications.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Tidak ada notifikasi</p>}
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
      case 'opname': return renderOpname();
      case 'pispot': return renderPispot();
      case 'documents': return renderDocuments();
      case 'notifications': return renderNotifications();
      default: return renderOverview();
    }
  };

  return (
    <DashboardLayout
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      dbStatus={dbStatus}
      unreadNotifs={stats.unreadNotifications}
    >
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Memuat data dashboard...</p>
          </div>
        </div>
      ) : renderModule()}
    </DashboardLayout>
  );
}
