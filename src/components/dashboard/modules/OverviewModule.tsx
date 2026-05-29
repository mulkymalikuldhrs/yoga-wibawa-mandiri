// ============================================================
// OverviewModule — Dashboard home with stats, charts, alerts
// ============================================================

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, formatRupiah } from '@/lib/dashboard-storage';
import { KV_PREFIXES, type SparePart, type MaintenanceRecord, type ProductionRecord, type SafetyIncident, type Employee, type Notification } from '@/types/dashboard';
import {
  Package,
  AlertTriangle,
  Wrench,
  Factory,
  ShieldAlert,
  Wallet,
  Users,
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
          <div className={cn('flex items-center gap-1 text-xs font-medium', trend.up ? 'text-emerald-400' : 'text-red-400')}>
            {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.up ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xl md:text-2xl font-bold text-white">{value}</p>
        <p className="text-white/40 text-xs mt-0.5">{label}</p>
      </div>
    </GlassCard>
  );
}

export default function OverviewModule() {
  const [stats, setStats] = useState({
    totalSpareParts: 0,
    lowStockItems: 0,
    activeMaintenance: 0,
    todayProduction: 0,
    openIncidents: 0,
    monthlyRevenue: 0,
    activeEmployees: 0,
    unreadNotifications: 0,
  });

  const [productionChart, setProductionChart] = useState<Array<{ name: string; target: number; aktual: number }>>([]);
  const [recentActivities, setRecentActivities] = useState<Array<{ id: string; text: string; time: string; type: string }>>([]);
  const [alerts, setAlerts] = useState<Array<{ id: string; text: string; severity: 'danger' | 'warning' | 'info' }>>([]);

  useEffect(() => {
    const spareParts = getData<SparePart>(KV_PREFIXES.sparePart);
    const maintenance = getData<MaintenanceRecord>(KV_PREFIXES.maintenance);
    const production = getData<ProductionRecord>(KV_PREFIXES.production);
    const safety = getData<SafetyIncident>(KV_PREFIXES.safety);
    const employees = getData<Employee>(KV_PREFIXES.employee);
    const notifications = getData<Notification>(KV_PREFIXES.notification);

    const lowStock = spareParts.filter((p) => p.stok <= p.stokMinimum);
    const activeMaint = maintenance.filter((m) => m.status === 'berjalan' || m.status === 'terjadwal');
    const openInc = safety.filter((s) => s.status !== 'ditutup' && s.status !== 'selesai');
    const activeEmp = employees.filter((e) => e.status === 'aktif');
    const unreadNotifs = notifications.filter((n) => !n.dibaca);

    // Today's production
    const today = new Date().toISOString().split('T')[0];
    const todayProd = production.filter((p) => p.tanggal === today);
    const totalTodayProd = todayProd.reduce((sum, p) => sum + p.aktual, 0);

    // Monthly revenue (simplified)
    const financeData = getData<{ jumlah: number; jenis: string; tanggal: string }>(KV_PREFIXES.finance);
    const currentMonth = new Date().getMonth();
    const monthlyRev = financeData
      .filter((f) => f.jenis === 'pemasukan' && new Date(f.tanggal).getMonth() === currentMonth)
      .reduce((sum, f) => sum + f.jumlah, 0);

    setStats({
      totalSpareParts: spareParts.length,
      lowStockItems: lowStock.length,
      activeMaintenance: activeMaint.length,
      todayProduction: totalTodayProd,
      openIncidents: openInc.length,
      monthlyRevenue: monthlyRev,
      activeEmployees: activeEmp.length,
      unreadNotifications: unreadNotifs.length,
    });

    // Production chart data (last 7 days by shift)
    const chartData: Array<{ name: string; target: number; aktual: number }> = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      const dayProds = production.filter((p) => p.tanggal === dateStr);
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const dayName = dayNames[date.getDay()];
      const totalTarget = dayProds.reduce((s, p) => s + p.target, 0);
      const totalAktual = dayProds.reduce((s, p) => s + p.aktual, 0);
      chartData.push({ name: dayName, target: totalTarget, aktual: totalAktual });
    }
    setProductionChart(chartData);

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
    safety.slice(-2).reverse().forEach((s) => {
      activities.push({
        id: s.id,
        text: `Insiden: ${s.judul} — ${s.severity}`,
        time: s.tanggal,
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
    openInc.forEach((s) => {
      alertItems.push({
        id: s.id,
        text: `Insiden ${s.severity}: ${s.judul}`,
        severity: s.severity === 'fatal' || s.severity === 'berat' ? 'danger' : 'warning',
      });
    });
    setAlerts(alertItems);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-[#0f0c29]/90 border border-white/10 rounded-lg px-3 py-2 text-xs">
          <p className="text-white/70 mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {entry.value} ton
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ringkasan Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Selamat datang di YWM Dashboard — PT. Yoga Wibawa Mandiri</p>
        </div>
        <div className="text-white/40 text-xs">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<Package size={20} />}
          iconBg="bg-cyan-500/20"
          iconColor="text-cyan-400"
          value={stats.totalSpareParts}
          label="Total Suku Cadang"
          trend={{ value: 5, up: true }}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          iconBg="bg-amber-500/20"
          iconColor="text-amber-400"
          value={stats.lowStockItems}
          label="Stok Rendah"
          trend={{ value: 12, up: false }}
        />
        <StatCard
          icon={<Wrench size={20} />}
          iconBg="bg-blue-500/20"
          iconColor="text-blue-400"
          value={stats.activeMaintenance}
          label="Perawatan Aktif"
          trend={{ value: 8, up: true }}
        />
        <StatCard
          icon={<Factory size={20} />}
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          value={`${stats.todayProduction} ton`}
          label="Produksi Hari Ini"
          trend={{ value: 4.7, up: true }}
        />
        <StatCard
          icon={<ShieldAlert size={20} />}
          iconBg="bg-red-500/20"
          iconColor="text-red-400"
          value={stats.openIncidents}
          label="Insiden Terbuka"
          trend={{ value: 15, up: false }}
        />
        <StatCard
          icon={<Wallet size={20} />}
          iconBg="bg-purple-500/20"
          iconColor="text-purple-400"
          value={stats.monthlyRevenue > 0 ? `${(stats.monthlyRevenue / 1000000000).toFixed(1)}M` : '0'}
          label="Pendapatan Bulan Ini"
          trend={{ value: 3.2, up: true }}
        />
        <StatCard
          icon={<Users size={20} />}
          iconBg="bg-teal-500/20"
          iconColor="text-teal-400"
          value={stats.activeEmployees}
          label="Karyawan Aktif"
          trend={{ value: 2, up: true }}
        />
        <StatCard
          icon={<Bell size={20} />}
          iconBg="bg-orange-500/20"
          iconColor="text-orange-400"
          value={stats.unreadNotifications}
          label="Notifikasi Belum Dibaca"
          trend={{ value: 0, up: false }}
        />
      </div>

      {/* Charts & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Production Chart */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Produksi 7 Hari Terakhir</h2>
            <span className="text-white/30 text-xs">Target vs Aktual (ton)</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionChart} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="target" name="Target" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aktual" name="Aktual" fill="rgba(0,212,255,0.6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Alerts */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Peringatan</h2>
            <FileWarning size={16} className="text-amber-400" />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {alerts.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-4">Tidak ada peringatan</p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-2 p-2.5 rounded-xl text-xs',
                    alert.severity === 'danger'
                      ? 'bg-red-500/10 border border-red-500/20'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border border-amber-500/20'
                      : 'bg-cyan-500/10 border border-cyan-500/20'
                  )}
                >
                  <AlertTriangle
                    size={14}
                    className={cn(
                      'flex-shrink-0 mt-0.5',
                      alert.severity === 'danger' ? 'text-red-400' : alert.severity === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                    )}
                  />
                  <span className="text-white/70">{alert.text}</span>
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
            <h2 className="text-white font-semibold text-sm">Aktivitas Terbaru</h2>
            <Activity size={16} className="text-cyan-400" />
          </div>
          <div className="space-y-2">
            {recentActivities.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-4">Belum ada aktivitas</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      act.type === 'danger' ? 'bg-red-500/20' : act.type === 'warning' ? 'bg-amber-500/20' : 'bg-cyan-500/20'
                    )}
                  >
                    {act.type === 'danger' ? (
                      <XCircle size={14} className="text-red-400" />
                    ) : act.type === 'warning' ? (
                      <Clock size={14} className="text-amber-400" />
                    ) : (
                      <CheckCircle2 size={14} className="text-cyan-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs truncate">{act.text}</p>
                    <p className="text-white/30 text-[10px]">{act.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Aksi Cepat</h2>
            <Zap size={16} className="text-cyan-400" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tambah Suku Cadang', icon: <Package size={16} />, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
              { label: 'Input Produksi', icon: <Factory size={16} />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Buat WO Perawatan', icon: <Wrench size={16} />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { label: 'Lapor Insiden', icon: <ShieldAlert size={16} />, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
              { label: 'Catat Keuangan', icon: <Wallet size={16} />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
              { label: 'Lihat Analitik', icon: <TrendingUp size={16} />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            ].map((action) => (
              <button
                key={action.label}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border text-xs transition-all',
                  'hover:scale-[1.02] hover:bg-white/5',
                  action.color
                )}
              >
                {action.icon}
                <span className="text-white/60 text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
