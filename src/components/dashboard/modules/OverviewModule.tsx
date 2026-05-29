// ============================================================
// OverviewModule — Dashboard home with stats, charts, alerts
// Bright glassmorphic frosted theme
// ============================================================

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData } from '@/lib/supabase-data';
import { KV_PREFIXES, type SparePart, type MaintenanceRecord, type PispotRecord, type Notification, type SiloCalculation } from '@/types/dashboard';
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
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
  trend?: { value: number; up: boolean };
}

function StatCard({ icon, iconBg, iconColor, value, label, trend }: StatCardProps) {
  return (
    <GlassCard className="p-4 md:p-5">
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
      </div>
    </GlassCard>
  );
}

export default function OverviewModule() {
  const [stats, setStats] = useState({
    totalSpareParts: 0,
    lowStockItems: 0,
    activeMaintenance: 0,
    pispotTerjadwal: 0,
    pispotTerlewat: 0,
    unreadNotifications: 0,
    siloALevel: 0,
    siloBLevel: 0,
  });

  const [loading, setLoading] = useState(true);
  const [pispotChart, setPispotChart] = useState<Array<{ name: string; terjadwal: number; selesai: number; terlewat: number }>>([]);
  const [recentActivities, setRecentActivities] = useState<Array<{ id: string; text: string; time: string; type: string }>>([]);
  const [alerts, setAlerts] = useState<Array<{ id: string; text: string; severity: 'danger' | 'warning' | 'info' }>>([]);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      const spareParts = await getData<SparePart>(KV_PREFIXES.sparePart);
      const maintenance = await getData<MaintenanceRecord>(KV_PREFIXES.maintenance);
      const pispot = await getData<PispotRecord>(KV_PREFIXES.pispot);
      const notifications = await getData<Notification>(KV_PREFIXES.notification);

    const lowStock = spareParts.filter((p) => p.stok <= p.stokMinimum);
    const activeMaint = maintenance.filter((m) => m.status === 'berjalan' || m.status === 'terjadwal');
    const unreadNotifs = notifications.filter((n) => !n.dibaca);

    // Pispot stats
    const currentMonth = new Date().toISOString().slice(0, 7);
    const pispotThisMonth = pispot.filter((p) => p.bulan === currentMonth);
    const pispotTerjadwal = pispotThisMonth.filter((p) => p.status === 'terjadwal').length;
    const pispotTerlewat = pispotThisMonth.filter((p) => p.status === 'terlewat').length;
    const pispotSelesai = pispotThisMonth.filter((p) => p.status === 'selesai').length;
    const pispotPerluPerhatian = pispotThisMonth.filter((p) => p.kondisi === 'perlu_perhatian' || p.kondisi === 'rusak').length;

    // Silo levels
    const siloCalcs = await getData<SiloCalculation>(KV_PREFIXES.siloCalculation);
    const latestSiloA = siloCalcs.filter((d) => d.silo === 'A').sort((a, b) => `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`))[0];
    const latestSiloB = siloCalcs.filter((d) => d.silo === 'B').sort((a, b) => `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`))[0];
    // Calculate percentage from volume
    const maxVol = 145.42 * 18 + 48.47 * 4.6; // ~2839.25 m³
    const siloAPct = latestSiloA ? Math.round((latestSiloA.volumeTotal / maxVol) * 100) : 0;
    const siloBPct = latestSiloB ? Math.round((latestSiloB.volumeTotal / (145.42 * 18 + 48.47 * 2.9)) * 100) : 0;

    setStats({
      totalSpareParts: spareParts.length,
      lowStockItems: lowStock.length,
      activeMaintenance: activeMaint.length,
      pispotTerjadwal,
      pispotTerlewat,
      unreadNotifications: unreadNotifs.length,
      siloALevel: siloAPct,
      siloBLevel: siloBPct,
    });

    // Pispot chart data — last 3 months by status
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

    // Recent activities
    const activities: Array<{ id: string; text: string; time: string; type: string }> = [];
    maintenance.slice(-3).reverse().forEach((m) => {
      activities.push({
        id: m.id,
        text: `Perawatan: ${m.judul} — ${m.status}`,
        time: m.tanggalMulai,
        type: m.status === 'berjalan' ? 'warning' : 'info',
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
    activeMaint.filter((m) => m.prioritas === 'kritis').forEach((m) => {
      alertItems.push({
        id: m.id,
        text: `WO Kritis: ${m.judul}`,
        severity: 'danger',
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
          <strong>Ringkasan Dashboard</strong> — Menampilkan statistik utama operasional PT. Yoga Wibawa Mandiri termasuk stok suku cadang, perawatan, pelumasan (Pispot), dan level silo secara real-time.
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<Package size={20} />}
          iconBg="bg-cyan-100/80"
          iconColor="text-cyan-600"
          value={stats.totalSpareParts}
          label="Total Suku Cadang"
          trend={{ value: 5, up: true }}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          iconBg="bg-amber-100/80"
          iconColor="text-amber-600"
          value={stats.lowStockItems}
          label="Stok Rendah"
          trend={{ value: 12, up: false }}
        />
        <StatCard
          icon={<Wrench size={20} />}
          iconBg="bg-blue-100/80"
          iconColor="text-blue-600"
          value={stats.activeMaintenance}
          label="Perawatan Aktif"
          trend={{ value: 8, up: true }}
        />
        <StatCard
          icon={<Droplets size={20} />}
          iconBg="bg-teal-100/80"
          iconColor="text-teal-600"
          value={stats.pispotTerjadwal}
          label="Pispot Terjadwal"
          trend={{ value: 3, up: true }}
        />
        <StatCard
          icon={<Droplets size={20} />}
          iconBg="bg-red-100/80"
          iconColor="text-red-600"
          value={stats.pispotTerlewat}
          label="Pispot Terlewat"
          trend={{ value: 0, up: false }}
        />
        <StatCard
          icon={<Bell size={20} />}
          iconBg="bg-orange-100/80"
          iconColor="text-orange-600"
          value={stats.unreadNotifications}
          label="Notifikasi Belum Dibaca"
          trend={{ value: 0, up: false }}
        />
        <StatCard
          icon={<Cylinder size={20} />}
          iconBg="bg-cyan-100/80"
          iconColor="text-cyan-600"
          value={`${stats.siloALevel}%`}
          label="Silo A — Level"
          trend={{ value: stats.siloALevel >= 60 ? -5 : 8, up: stats.siloALevel >= 60 ? false : true }}
        />
        <StatCard
          icon={<Cylinder size={20} />}
          iconBg="bg-purple-100/80"
          iconColor="text-purple-600"
          value={`${stats.siloBLevel}%`}
          label="Silo B — Level"
          trend={{ value: stats.siloBLevel >= 60 ? -3 : 10, up: stats.siloBLevel >= 60 ? false : true }}
        />
      </div>

      {/* Charts & Alerts Row */}
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

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activities */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Aktivitas Terbaru</h2>
            <Activity size={16} className="text-cyan-500" />
          </div>
          <div className="space-y-2">
            {recentActivities.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">Belum ada aktivitas</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/40 border border-white/60">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      act.type === 'danger' ? 'bg-red-100/80' : act.type === 'warning' ? 'bg-amber-100/80' : 'bg-cyan-100/80'
                    )}
                  >
                    {act.type === 'danger' ? (
                      <XCircle size={14} className="text-red-500" />
                    ) : act.type === 'warning' ? (
                      <Clock size={14} className="text-amber-500" />
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

        {/* Quick Actions */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Aksi Cepat</h2>
            <Zap size={16} className="text-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tambah Suku Cadang', icon: <Package size={16} />, color: 'text-cyan-600 bg-cyan-50/80 border-cyan-200/50' },
              { label: 'Input Pispot', icon: <Droplets size={16} />, color: 'text-teal-600 bg-teal-50/80 border-teal-200/50' },
              { label: 'Buat WO Perawatan', icon: <Wrench size={16} />, color: 'text-blue-600 bg-blue-50/80 border-blue-200/50' },
              { label: 'Lihat Analitik', icon: <TrendingUp size={16} />, color: 'text-amber-600 bg-amber-50/80 border-amber-200/50' },
            ].map((action) => (
              <button
                key={action.label}
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
