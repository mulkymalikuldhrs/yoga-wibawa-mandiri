// ============================================================
// OverviewModule — Comprehensive dashboard home with ALL
// module summaries, silo gauges, alerts, and quick actions
// ============================================================

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, formatRupiah } from '@/lib/supabase-data';
import {
  KV_PREFIXES,
  type SparePart,
  type MaintenanceRecord,
  type PispotRecord,
  type Notification,
  type SiloCalculation,
  type ProductionRecord,
  type FinanceRecord,
  type SafetyIncident,
  type TeamActivity,
  SILO_CONFIG,
  type DashboardModule,
} from '@/types/dashboard';
import { useDashboardContext } from '@/contexts/DashboardContext';
import {
  Package,
  AlertTriangle,
  Wrench,
  Droplets,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  FileWarning,
  Cylinder,
  Factory,
  DollarSign,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
  sublabel?: string;
  trend?: { value: number; up: boolean };
  onClick?: () => void;
}

function StatCard({ icon, iconBg, iconColor, value, label, sublabel, trend, onClick }: StatCardProps) {
  return (
    <GlassCard
      className={cn('p-4 md:p-5', onClick && 'cursor-pointer hover:shadow-md transition-shadow')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trend.up ? 'text-emerald-500' : 'text-red-500')}>
            {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.up ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xl md:text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-slate-400 text-xs mt-0.5">{label}</p>
        {sublabel && <p className="text-slate-300 text-[10px] mt-0.5">{sublabel}</p>}
      </div>
    </GlassCard>
  );
}

// Silo gauge component
function SiloGauge({ label, percentage, tonnage, color }: { label: string; percentage: number; tonnage: number; color: string }) {
  const circumference = 2 * Math.PI * 50;
  const filled = circumference * (percentage / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="12" />
        <circle
          cx="60" cy="60" r="50" fill="none"
          stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="60" y="54" textAnchor="middle" fill="#1e293b" fontSize="20" fontWeight="bold">{percentage}%</text>
        <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="11">{tonnage} ton</text>
      </svg>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}

export default function OverviewModule() {
  const { onModuleChange: navigateToModule } = useDashboardContext();

  const [stats, setStats] = useState({
    // Produksi
    targetHariIni: 0,
    aktualHariIni: 0,
    // Spare Parts
    totalSpareParts: 0,
    lowStockItems: 0,
    // Maintenance
    activeMaintenance: 0,
    scheduledMaintenance: 0,
    criticalMaintenance: 0,
    // Pispot
    pispotTerjadwal: 0,
    pispotTerlewat: 0,
    // Silo
    siloALevel: 0,
    siloBLevel: 0,
    siloATon: 0,
    siloBTon: 0,
    siloATrend: undefined as { value: number; up: boolean } | undefined,
    siloBTrend: undefined as { value: number; up: boolean } | undefined,
    // Finance
    incomeThisMonth: 0,
    expenseThisMonth: 0,
    // Team
    hadirHariIni: 0,
    izinHariIni: 0,
    sakitHariIni: 0,
    alphaHariIni: 0,
    // Safety
    activeIncidents: 0,
    // Notifications
    unreadNotifications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [pispotChart, setPispotChart] = useState<Array<{ name: string; terjadwal: number; selesai: number; terlewat: number }>>([]);
  const [recentActivities, setRecentActivities] = useState<Array<{ id: string; text: string; time: string; type: string }>>([]);
  const [alerts, setAlerts] = useState<Array<{ id: string; text: string; severity: 'danger' | 'warning' | 'info' }>>([]);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);

      const [
        spareParts, maintenance, pispot, notifications, siloCalcs,
        production, finance, safety, team,
      ] = await Promise.all([
        getData<SparePart>(KV_PREFIXES.sparePart),
        getData<MaintenanceRecord>(KV_PREFIXES.maintenance),
        getData<PispotRecord>(KV_PREFIXES.pispot),
        getData<Notification>(KV_PREFIXES.notification),
        getData<SiloCalculation>(KV_PREFIXES.siloCalculation),
        getData<ProductionRecord>(KV_PREFIXES.production),
        getData<FinanceRecord>(KV_PREFIXES.finance),
        getData<SafetyIncident>(KV_PREFIXES.safety),
        getData<TeamActivity>(KV_PREFIXES.teamActivity),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      const currentMonth = new Date().toISOString().slice(0, 7);

      // ── Production ──
      const todayProd = production.filter((p) => p.tanggal === today);
      const targetHariIni = todayProd.reduce((s, p) => s + p.target, 0);
      const aktualHariIni = todayProd.reduce((s, p) => s + p.aktual, 0);

      // ── Spare Parts ──
      const lowStock = spareParts.filter((p) => p.stok <= p.stokMinimum);

      // ── Maintenance ──
      const activeMaint = maintenance.filter((m) => m.status === 'berjalan' || m.status === 'terjadwal');
      const scheduledMaint = maintenance.filter((m) => m.status === 'terjadwal');
      const criticalMaint = maintenance.filter((m) => m.prioritas === 'kritis' && m.status !== 'selesai' && m.status !== 'dibatalkan');

      // ── Pispot ──
      const pispotThisMonth = pispot.filter((p) => p.bulan === currentMonth);
      const pispotTerjadwal = pispotThisMonth.filter((p) => p.status === 'terjadwal').length;
      const pispotTerlewat = pispotThisMonth.filter((p) => p.status === 'terlewat').length;
      const pispotPerluPerhatian = pispotThisMonth.filter((p) => p.kondisi === 'perlu_perhatian' || p.kondisi === 'rusak').length;

      // ── Silo ──
      const latestSiloA = siloCalcs.filter((d) => d.silo === 'A').sort((a, b) => `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`))[0];
      const latestSiloB = siloCalcs.filter((d) => d.silo === 'B').sort((a, b) => `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`))[0];
      const siloAMaxVol = SILO_CONFIG.A.areaSilinder * SILO_CONFIG.A.tinggiSilinder + SILO_CONFIG.A.areaConis * SILO_CONFIG.A.tConisMax;
      const siloBMaxVol = SILO_CONFIG.B.areaSilinder * SILO_CONFIG.B.tinggiSilinder + SILO_CONFIG.B.areaConis * SILO_CONFIG.B.tConisMax;
      const siloAPct = latestSiloA ? Math.min(100, Math.round((latestSiloA.volumeTotal / siloAMaxVol) * 100)) : 0;
      const siloBPct = latestSiloB ? Math.min(100, Math.round((latestSiloB.volumeTotal / siloBMaxVol) * 100)) : 0;
      const siloATon = latestSiloA ? Math.round(latestSiloA.volumeTotal * SILO_CONFIG.A.beratJenis) : 0;
      const siloBTon = latestSiloB ? Math.round(latestSiloB.volumeTotal * SILO_CONFIG.B.beratJenis) : 0;

      // ── Silo Trends (actual % change of kekosongan between latest two entries) ──
      const siloASorted = siloCalcs.filter((d) => d.silo === 'A').sort((a, b) => `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`));
      const siloBSorted = siloCalcs.filter((d) => d.silo === 'B').sort((a, b) => `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`));

      function computeSiloTrend(sorted: SiloCalculation[]): { value: number; up: boolean } | undefined {
        if (sorted.length < 2) return undefined; // need at least 2 data points
        const latest = sorted[0];
        const previous = sorted[1];
        if (previous.kekosongan === 0) return undefined; // avoid division by zero
        const pctChange = ((latest.kekosongan - previous.kekosongan) / previous.kekosongan) * 100;
        const rounded = Math.round(Math.abs(pctChange) * 10) / 10; // one decimal
        if (rounded === 0) return undefined; // no meaningful change
        // kekosongan increased → silo emptier → level down (up: false)
        // kekosongan decreased → silo fuller → level up (up: true)
        return { value: rounded, up: pctChange < 0 };
      }

      const siloATrend = computeSiloTrend(siloASorted);
      const siloBTrend = computeSiloTrend(siloBSorted);

      // ── Finance ──
      const financeThisMonth = finance.filter((f) => f.tanggal.slice(0, 7) === currentMonth);
      const incomeThisMonth = financeThisMonth.filter((f) => f.jenis === 'pemasukan').reduce((s, f) => s + f.jumlah, 0);
      const expenseThisMonth = financeThisMonth.filter((f) => f.jenis === 'pengeluaran').reduce((s, f) => s + f.jumlah, 0);

      // ── Team ──
      const todayTeam = team.filter((t) => t.tanggal === today);
      const hadirHariIni = todayTeam.filter((t) => t.status === 'hadir').length;
      const izinHariIni = todayTeam.filter((t) => t.status === 'izin').length;
      const sakitHariIni = todayTeam.filter((t) => t.status === 'sakit').length;
      const alphaHariIni = todayTeam.filter((t) => t.status === 'alpha').length;

      // ── Safety ──
      const activeIncidents = safety.filter((s) => s.status === 'dilaporkan' || s.status === 'investigasi').length;

      // ── Notifications ──
      const unreadNotifs = notifications.filter((n) => !n.dibaca);

      setStats({
        targetHariIni,
        aktualHariIni,
        totalSpareParts: spareParts.length,
        lowStockItems: lowStock.length,
        activeMaintenance: activeMaint.length,
        scheduledMaintenance: scheduledMaint.length,
        criticalMaintenance: criticalMaint.length,
        pispotTerjadwal,
        pispotTerlewat,
        siloALevel: siloAPct,
        siloBLevel: siloBPct,
        siloATon,
        siloBTon,
        siloATrend,
        siloBTrend,
        incomeThisMonth,
        expenseThisMonth,
        hadirHariIni,
        izinHariIni,
        sakitHariIni,
        alphaHariIni,
        activeIncidents,
        unreadNotifications: unreadNotifs.length,
      });

      // Pispot chart data — last 3 months
      const pispotChartData: Array<{ name: string; terjadwal: number; selesai: number; terlewat: number }> = [];
      for (let m = 2; m >= 0; m--) {
        const date = new Date();
        date.setMonth(date.getMonth() - m);
        const monthStr = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        const monthRecords = pispot.filter((p) => p.bulan === monthStr);
        pispotChartData.push({
          name: monthName,
          terjadwal: monthRecords.filter((p) => p.status === 'terjadwal').length,
          selesai: monthRecords.filter((p) => p.status === 'selesai').length,
          terlewat: monthRecords.filter((p) => p.status === 'terlewat').length,
        });
      }
      setPispotChart(pispotChartData);

      // Recent activities (from multiple modules)
      const activities: Array<{ id: string; text: string; time: string; type: string }> = [];
      maintenance.slice(-3).reverse().forEach((m) => {
        activities.push({
          id: m.id,
          text: `Perawatan: ${m.judul} — ${m.status}`,
          time: m.tanggalMulai,
          type: m.status === 'berjalan' ? 'warning' : 'info',
        });
      });
      production.slice(-3).reverse().forEach((p) => {
        activities.push({
          id: p.id,
          text: `Produksi ${p.mesin}: ${p.aktual}/${p.target} ${p.satuan} (Shift ${p.shift})`,
          time: p.tanggal,
          type: p.aktual >= p.target ? 'success' : 'warning',
        });
      });
      pispotThisMonth.filter((p) => p.status === 'terlewat').slice(0, 2).forEach((p) => {
        activities.push({
          id: p.id,
          text: `Pispot: Pelumasan ${p.namaPeralatan} terlewat`,
          time: p.tanggalPelaksanaan,
          type: 'danger',
        });
      });
      safety.filter((s) => s.status === 'dilaporkan' || s.status === 'investigasi').slice(0, 2).forEach((s) => {
        activities.push({
          id: s.id,
          text: `Safety: ${s.judul} (${s.severity})`,
          time: s.tanggal,
          type: s.severity === 'berat' || s.severity === 'fatal' ? 'danger' : 'warning',
        });
      });
      finance.slice(-2).reverse().forEach((f) => {
        activities.push({
          id: f.id,
          text: `${f.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}: ${formatRupiah(f.jumlah)} — ${f.kategori}`,
          time: f.tanggal,
          type: f.jenis === 'pemasukan' ? 'success' : 'info',
        });
      });
      setRecentActivities(activities);

      // Alerts
      const alertItems: Array<{ id: string; text: string; severity: 'danger' | 'warning' | 'info' }> = [];
      lowStock.forEach((p) => {
        alertItems.push({
          id: p.id,
          text: `${p.nama} — stok ${p.stok} ${p.satuan} (minimum ${p.stokMinimum})`,
          severity: p.stok < p.stokMinimum / 2 ? 'danger' : 'warning',
        });
      });
      criticalMaint.forEach((m) => {
        alertItems.push({
          id: m.id,
          text: `WO Kritis: ${m.judul}`,
          severity: 'danger' as const,
        });
      });
      pispotThisMonth.filter((p) => p.status === 'terlewat').forEach((p) => {
        alertItems.push({
          id: p.id,
          text: `Pelumasan terlewat: ${p.namaPeralatan} (${p.kodePeralatan})`,
          severity: p.kondisi === 'rusak' ? 'danger' : 'warning',
        });
      });
      if (pispotPerluPerhatian > 0) {
        alertItems.push({
          id: 'pispot-attention',
          text: `${pispotPerluPerhatian} peralatan memerlukan perhatian setelah pelumasan`,
          severity: 'warning',
        });
      }
      if (activeIncidents > 0) {
        alertItems.push({
          id: 'safety-active',
          text: `${activeIncidents} insiden keselamatan masih aktif`,
          severity: activeIncidents > 2 ? 'danger' : 'warning',
        });
      }
      if (siloAPct < 20) {
        alertItems.push({ id: 'silo-a-low', text: `Silo A level rendah: ${siloAPct}%`, severity: 'danger' });
      }
      if (siloBPct < 20) {
        alertItems.push({ id: 'silo-b-low', text: `Silo B level rendah: ${siloBPct}%`, severity: 'danger' });
      }
      setAlerts(alertItems);
      setLoading(false);
    }

    fetchAllData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-white/90 border border-slate-200/60 rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/[0.05]">
          <p className="text-slate-500 mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 relative z-10">
      {/* Feature Description Banner */}
      <div className="mb-2 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50 backdrop-blur-sm">
        <p className="text-cyan-700 text-sm">
          <strong>Ringkasan Dashboard</strong> — Menampilkan statistik utama operasional PT. Yoga Wibawa Mandiri termasuk produksi, suku cadang, perawatan, pelumasan (Pispot), keuangan, kehadiran, keselamatan, dan level silo secara real-time.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Ringkasan Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Selamat datang di YWM Dashboard — PT. Yoga Wibawa Mandiri</p>
        </div>
        <div className="text-slate-400 text-xs">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* ── KPI Cards: Produksi + Spare Parts + Maintenance + Pispot ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<Factory size={20} />}
          iconBg="bg-emerald-100/80"
          iconColor="text-emerald-600"
          value={`${stats.aktualHariIni}/${stats.targetHariIni}`}
          label="Produksi Hari Ini"
          sublabel="Aktual / Target"
          onClick={() => navigateToModule('production')}
        />
        <StatCard
          icon={<Package size={20} />}
          iconBg="bg-cyan-100/80"
          iconColor="text-cyan-600"
          value={stats.totalSpareParts}
          label="Total Suku Cadang"
          sublabel={`${stats.lowStockItems} stok rendah`}
          onClick={() => navigateToModule('spare-parts')}
        />
        <StatCard
          icon={<Wrench size={20} />}
          iconBg="bg-amber-100/80"
          iconColor="text-amber-600"
          value={stats.activeMaintenance}
          label="Perawatan Aktif"
          sublabel={`${stats.criticalMaintenance} kritis · ${stats.scheduledMaintenance} terjadwal`}
          onClick={() => navigateToModule('maintenance')}
        />
        <StatCard
          icon={<Droplets size={20} />}
          iconBg="bg-teal-100/80"
          iconColor="text-teal-600"
          value={`${stats.pispotTerjadwal}/${stats.pispotTerlewat}`}
          label="Pispot Bulan Ini"
          sublabel="Terjadwal / Terlewat"
          onClick={() => navigateToModule('pispot')}
        />
      </div>

      {/* ── KPI Cards: Silo + Finance + Team + Safety ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<Cylinder size={20} />}
          iconBg="bg-cyan-100/80"
          iconColor="text-cyan-600"
          value={`${stats.siloALevel}%`}
          label="Silo A — Level"
          sublabel={`${stats.siloATon} ton`}
          trend={stats.siloATrend}
          onClick={() => navigateToModule('silo-calculation')}
        />
        <StatCard
          icon={<Cylinder size={20} />}
          iconBg="bg-purple-100/80"
          iconColor="text-purple-600"
          value={`${stats.siloBLevel}%`}
          label="Silo B — Level"
          sublabel={`${stats.siloBTon} ton`}
          trend={stats.siloBTrend}
          onClick={() => navigateToModule('silo-calculation')}
        />
        <StatCard
          icon={<DollarSign size={20} />}
          iconBg="bg-emerald-100/80"
          iconColor="text-emerald-600"
          value={formatRupiah(stats.incomeThisMonth - stats.expenseThisMonth)}
          label="Saldo Bulan Ini"
          sublabel={`${formatRupiah(stats.incomeThisMonth)} masuk · ${formatRupiah(stats.expenseThisMonth)} keluar`}
          trend={{ value: stats.incomeThisMonth > stats.expenseThisMonth ? 5 : -5, up: stats.incomeThisMonth > stats.expenseThisMonth }}
          onClick={() => navigateToModule('finance')}
        />
        <StatCard
          icon={<Users size={20} />}
          iconBg="bg-teal-100/80"
          iconColor="text-teal-600"
          value={`${stats.hadirHariIni}`}
          label="Karyawan Hadir"
          sublabel={`${stats.izinHariIni} izin · ${stats.sakitHariIni} sakit · ${stats.alphaHariIni} alpha`}
          onClick={() => navigateToModule('team-activity')}
        />
      </div>

      {/* ── Safety KPI row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<ShieldAlert size={20} />}
          iconBg="bg-red-100/80"
          iconColor="text-red-600"
          value={stats.activeIncidents}
          label="Insiden Keselamatan Aktif"
          onClick={() => navigateToModule('safety')}
        />
        <StatCard
          icon={<Bell size={20} />}
          iconBg="bg-orange-100/80"
          iconColor="text-orange-600"
          value={stats.unreadNotifications}
          label="Notifikasi Belum Dibaca"
          onClick={() => navigateToModule('notifications')}
        />
        <StatCard
          icon={<Droplets size={20} />}
          iconBg="bg-red-100/80"
          iconColor="text-red-600"
          value={stats.pispotTerlewat}
          label="Pispot Terlewat"
          onClick={() => navigateToModule('pispot')}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          iconBg="bg-amber-100/80"
          iconColor="text-amber-600"
          value={stats.lowStockItems}
          label="Stok Rendah"
          onClick={() => navigateToModule('spare-parts')}
        />
      </div>

      {/* ── Ringkasan Silo Section ── */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
            <Cylinder size={16} className="text-cyan-500" />
            Ringkasan Silo
          </h2>
          <button
            onClick={() => navigateToModule('silo-calculation')}
            className="flex items-center gap-1 text-cyan-600 text-xs hover:text-cyan-700 transition-colors"
          >
            Lihat Detail <ArrowRight size={12} />
          </button>
        </div>
        <div className="flex items-center justify-around">
          <SiloGauge
            label="Silo A"
            percentage={stats.siloALevel}
            tonnage={stats.siloATon}
            color={stats.siloALevel > 60 ? '#10b981' : stats.siloALevel > 30 ? '#f59e0b' : '#ef4444'}
          />
          <div className="hidden sm:flex flex-col items-center gap-1 text-slate-300">
            <div className="w-px h-16 bg-slate-200" />
          </div>
          <SiloGauge
            label="Silo B"
            percentage={stats.siloBLevel}
            tonnage={stats.siloBTon}
            color={stats.siloBLevel > 60 ? '#8b5cf6' : stats.siloBLevel > 30 ? '#f59e0b' : '#ef4444'}
          />
        </div>
      </GlassCard>

      {/* ── Charts & Alerts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pispot Chart */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Pispot — 3 Bulan Terakhir</h2>
            <span className="text-slate-400 text-xs">Status Pelumasan per Bulan</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pispotChart} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="selesai" name="Selesai" fill="rgba(16,185,129,0.7)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terjadwal" name="Terjadwal" fill="rgba(6,182,212,0.7)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terlewat" name="Terlewat" fill="rgba(248,113,113,0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Alerts */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Peringatan</h2>
            <FileWarning size={16} className="text-amber-500" />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {alerts.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">Tidak ada peringatan</p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-2 p-2.5 rounded-xl text-xs',
                    alert.severity === 'danger'
                      ? 'bg-red-50/80 border border-red-200/50'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50/80 border border-amber-200/50'
                      : 'bg-cyan-50/80 border border-cyan-200/50'
                  )}
                >
                  <AlertTriangle
                    size={14}
                    className={cn(
                      'flex-shrink-0 mt-0.5',
                      alert.severity === 'danger' ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-cyan-500'
                    )}
                  />
                  <span className="text-slate-600">{alert.text}</span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* ── Recent Activities & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activities */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Aktivitas Terbaru</h2>
            <Activity size={16} className="text-cyan-500" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {recentActivities.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">Belum ada aktivitas</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/40 border border-white/60">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      act.type === 'danger' ? 'bg-red-100/80' : act.type === 'warning' ? 'bg-amber-100/80' : act.type === 'success' ? 'bg-emerald-100/80' : 'bg-cyan-100/80'
                    )}
                  >
                    {act.type === 'danger' ? (
                      <XCircle size={14} className="text-red-500" />
                    ) : act.type === 'warning' ? (
                      <Clock size={14} className="text-amber-500" />
                    ) : act.type === 'success' ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <CheckCircle2 size={14} className="text-cyan-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-600 text-xs truncate">{act.text}</p>
                    <p className="text-slate-400 text-[10px]">{act.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Quick Actions — now wired up */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Aksi Cepat</h2>
            <Zap size={16} className="text-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Suku Cadang', icon: <Package size={16} />, color: 'text-cyan-600 bg-cyan-50/80 border-cyan-200/50', module: 'spare-parts' as DashboardModule },
              { label: 'Input Pispot', icon: <Droplets size={16} />, color: 'text-teal-600 bg-teal-50/80 border-teal-200/50', module: 'pispot' as DashboardModule },
              { label: 'Perawatan', icon: <Wrench size={16} />, color: 'text-amber-600 bg-amber-50/80 border-amber-200/50', module: 'maintenance' as DashboardModule },
              { label: 'Produksi', icon: <Factory size={16} />, color: 'text-emerald-600 bg-emerald-50/80 border-emerald-200/50', module: 'production' as DashboardModule },
              { label: 'Keuangan', icon: <DollarSign size={16} />, color: 'text-emerald-600 bg-emerald-50/80 border-emerald-200/50', module: 'finance' as DashboardModule },
              { label: 'Keselamatan', icon: <ShieldAlert size={16} />, color: 'text-red-600 bg-red-50/80 border-red-200/50', module: 'safety' as DashboardModule },
              { label: 'Kehadiran', icon: <Users size={16} />, color: 'text-teal-600 bg-teal-50/80 border-teal-200/50', module: 'team-activity' as DashboardModule },
              { label: 'Analitik', icon: <TrendingUp size={16} />, color: 'text-violet-600 bg-violet-50/80 border-violet-200/50', module: 'analytics' as DashboardModule },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigateToModule(action.module)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border text-xs transition-all',
                  'hover:scale-[1.02] hover:bg-white/60 hover:shadow-sm',
                  action.color
                )}
              >
                {action.icon}
                <span className="text-slate-600 text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
      </>)}
    </div>
  );
}
