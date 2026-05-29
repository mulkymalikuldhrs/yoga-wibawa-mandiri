// ============================================================
// AnalyticsModule — Comprehensive cross-module analytics
// Shows ALL modules: Production, Spare Parts, Finance,
// Team, Safety, Silo, Pispot, Maintenance
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, formatRupiah } from '@/lib/supabase-data';
import {
  KV_PREFIXES,
  type ProductionRecord,
  type FinanceRecord,
  type SafetyIncident,
  type SparePart,
  type MaintenanceRecord,
  type PispotRecord,
  type SiloCalculation,
  type TeamActivity,
  SILO_CONFIG,
} from '@/types/dashboard';
import {
  Package,
  Wrench,
  Cylinder,
  Users,
  Factory,
  ShieldAlert,
  DollarSign,
  Droplets,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-white/90 border border-white/60 rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/[0.05]">
        <p className="text-slate-600 mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? formatRupiah(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#10b981', '#06b6d4', '#f87171', '#f59e0b', '#8b5cf6', '#ec4899'];

// Silo gauge component
function SiloGauge({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  const circumference = 2 * Math.PI * 40;
  const filled = circumference * (percentage / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="50" y="46" textAnchor="middle" className="text-lg font-bold" fill="#1e293b" fontSize="16">{percentage}%</text>
        <text x="50" y="60" textAnchor="middle" fill="#94a3b8" fontSize="9">{label}</text>
      </svg>
    </div>
  );
}

export default function AnalyticsModule() {
  const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
  const [sparePartData, setSparePartData] = useState<SparePart[]>([]);
  const [financeData, setFinanceData] = useState<FinanceRecord[]>([]);
  const [teamData, setTeamData] = useState<TeamActivity[]>([]);
  const [safetyData, setSafetyData] = useState<SafetyIncident[]>([]);
  const [pispotData, setPispotData] = useState<PispotRecord[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceRecord[]>([]);
  const [siloData, setSiloData] = useState<SiloCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [
      production, spareParts, finance, team, safety, pispot, maintenance, silo,
    ] = await Promise.all([
      getData<ProductionRecord>(KV_PREFIXES.production),
      getData<SparePart>(KV_PREFIXES.sparePart),
      getData<FinanceRecord>(KV_PREFIXES.finance),
      getData<TeamActivity>(KV_PREFIXES.teamActivity),
      getData<SafetyIncident>(KV_PREFIXES.safety),
      getData<PispotRecord>(KV_PREFIXES.pispot),
      getData<MaintenanceRecord>(KV_PREFIXES.maintenance),
      getData<SiloCalculation>(KV_PREFIXES.siloCalculation),
    ]);
    setProductionData(production);
    setSparePartData(spareParts);
    setFinanceData(finance);
    setTeamData(team);
    setSafetyData(safety);
    setPispotData(pispot);
    setMaintenanceData(maintenance);
    setSiloData(silo);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── KPI calculations ──

  // Production: today's totals
  const today = new Date().toISOString().slice(0, 10);
  const todayProduction = productionData.filter((p) => p.tanggal === today);
  const totalProduksiHariIni = todayProduction.reduce((s, p) => s + p.aktual, 0);

  // Spare Parts
  const lowStockItems = sparePartData.filter((p) => p.stok <= p.stokMinimum);
  const safeStockItems = sparePartData.length - lowStockItems.length;

  // Maintenance active
  const activeMaintenance = maintenanceData.filter((m) => m.status === 'berjalan' || m.status === 'terjadwal');

  // Silo levels
  const latestSiloA = siloData.filter((d) => d.silo === 'A').sort((a, b) => `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`))[0];
  const latestSiloB = siloData.filter((d) => d.silo === 'B').sort((a, b) => `${b.tanggal}${b.jam}`.localeCompare(`${a.tanggal}${a.jam}`))[0];
  const siloAMaxVol = SILO_CONFIG.A.areaSilinder * SILO_CONFIG.A.tinggiSilinder + SILO_CONFIG.A.areaConis * SILO_CONFIG.A.tConisMax;
  const siloBMaxVol = SILO_CONFIG.B.areaSilinder * SILO_CONFIG.B.tinggiSilinder + SILO_CONFIG.B.areaConis * SILO_CONFIG.B.tConisMax;
  const siloAPct = latestSiloA ? Math.min(100, Math.round((latestSiloA.volumeTotal / siloAMaxVol) * 100)) : 0;
  const siloBPct = latestSiloB ? Math.min(100, Math.round((latestSiloB.volumeTotal / siloBMaxVol) * 100)) : 0;
  const siloATon = latestSiloA ? Math.round(latestSiloA.volumeTotal * SILO_CONFIG.A.beratJenis) : 0;
  const siloBTon = latestSiloB ? Math.round(latestSiloB.volumeTotal * SILO_CONFIG.B.beratJenis) : 0;

  // Team attendance today
  const todayTeam = teamData.filter((t) => t.tanggal === today);
  const hadirHariIni = todayTeam.filter((t) => t.status === 'hadir').length;

  // ── Chart data ──

  // 1. Production: Daily target vs aktual (last 7 days)
  const prodByDay: Record<string, { target: number; aktual: number }> = {};
  productionData.forEach((p) => {
    if (!prodByDay[p.tanggal]) prodByDay[p.tanggal] = { target: 0, aktual: 0 };
    prodByDay[p.tanggal].target += p.target;
    prodByDay[p.tanggal].aktual += p.aktual;
  });
  const productionChartData = Object.entries(prodByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, vals]) => ({
      name: new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      Target: vals.target,
      Aktual: vals.aktual,
    }));

  // 2. Spare Parts: Stock level chart (top 10 by stock)
  const sparePartsChartData = [...sparePartData]
    .sort((a, b) => b.stok - a.stok)
    .slice(0, 10)
    .map((p) => ({
      name: p.nama.length > 12 ? p.nama.slice(0, 12) + '…' : p.nama,
      Stok: p.stok,
      Min: p.stokMinimum,
    }));

  // Low stock alerts for display
  const lowStockAlerts = lowStockItems.slice(0, 5).map((p) => ({
    nama: p.nama,
    stok: p.stok,
    minimum: p.stokMinimum,
    satuan: p.satuan,
  }));

  // 3. Finance: Income vs Expense by month
  const financeByMonth: Record<string, { pemasukan: number; pengeluaran: number }> = {};
  financeData.forEach((f) => {
    const month = f.tanggal.slice(0, 7);
    if (!financeByMonth[month]) financeByMonth[month] = { pemasukan: 0, pengeluaran: 0 };
    if (f.jenis === 'pemasukan') financeByMonth[month].pemasukan += f.jumlah;
    else financeByMonth[month].pengeluaran += f.jumlah;
  });
  const financeChartData = Object.entries(financeByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, vals]) => ({
      name: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      Pemasukan: Math.round(vals.pemasukan / 1000000),
      Pengeluaran: Math.round(vals.pengeluaran / 1000000),
    }));

  // 4. Team: Attendance breakdown
  const attendanceBreakdown = [
    { name: 'Hadir', value: todayTeam.filter((t) => t.status === 'hadir').length },
    { name: 'Izin', value: todayTeam.filter((t) => t.status === 'izin').length },
    { name: 'Sakit', value: todayTeam.filter((t) => t.status === 'sakit').length },
    { name: 'Alpha', value: todayTeam.filter((t) => t.status === 'alpha').length },
  ].filter((d) => d.value > 0);

  // 5. Safety: Incident severity distribution
  const severityData = [
    { name: 'Ringan', value: safetyData.filter((s) => s.severity === 'ringan').length },
    { name: 'Sedang', value: safetyData.filter((s) => s.severity === 'sedang').length },
    { name: 'Berat', value: safetyData.filter((s) => s.severity === 'berat').length },
    { name: 'Fatal', value: safetyData.filter((s) => s.severity === 'fatal').length },
  ].filter((d) => d.value > 0);

  // 6. Pispot status breakdown (kept from original)
  const pispotStatusData = [
    { name: 'Selesai', value: pispotData.filter((p) => p.status === 'selesai').length },
    { name: 'Terjadwal', value: pispotData.filter((p) => p.status === 'terjadwal').length },
    { name: 'Terlewat', value: pispotData.filter((p) => p.status === 'terlewat').length },
  ].filter((d) => d.value > 0);

  // 7. Pispot by month
  const pispotByMonth: Record<string, { selesai: number; terjadwal: number; terlewat: number }> = {};
  pispotData.forEach((p) => {
    const month = p.bulan;
    if (!pispotByMonth[month]) pispotByMonth[month] = { selesai: 0, terjadwal: 0, terlewat: 0 };
    if (p.status === 'selesai') pispotByMonth[month].selesai++;
    else if (p.status === 'terjadwal') pispotByMonth[month].terjadwal++;
    else if (p.status === 'terlewat') pispotByMonth[month].terlewat++;
  });
  const pispotMonthData = Object.entries(pispotByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, vals]) => ({
      name: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      ...vals,
    }));

  // 8. Maintenance cost by machine
  const maintByMachine: Record<string, number> = {};
  maintenanceData.forEach((m) => {
    maintByMachine[m.mesin] = (maintByMachine[m.mesin] || 0) + m.estimasiBiaya;
  });
  const maintCostData = Object.entries(maintByMachine).map(([name, biaya]) => ({
    name,
    biaya: Math.round(biaya / 1000000),
  }));

  // Pispot summary
  const pispotCompletionRate = pispotData.length > 0
    ? Math.round((pispotData.filter((p) => p.status === 'selesai').length / pispotData.length) * 100)
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Analitik</strong> — Analisis komprehensif data operasional lintas modul. Visualisasi produksi, suku cadang, keuangan, kehadiran, keselamatan, silo, pelumasan, dan perawatan untuk pengambilan keputusan.
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Analitik</h1>
          <p className="text-slate-400 text-sm mt-1">Visualisasi data dan tren operasional — Semua Modul</p>
        </div>
      </div>

      {/* ── KPI Summary Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <GlassCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center"><Factory size={16} className="text-emerald-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{totalProduksiHariIni}</p><p className="text-slate-400 text-[10px]">Produksi Hari Ini</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100/80 flex items-center justify-center"><Package size={16} className="text-cyan-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{safeStockItems}/{lowStockItems.length}</p><p className="text-slate-400 text-[10px]">Stok Aman / Rendah</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center"><Wrench size={16} className="text-amber-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{activeMaintenance.length}</p><p className="text-slate-400 text-[10px]">Maintenance Aktif</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100/80 flex items-center justify-center"><Cylinder size={16} className="text-cyan-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{siloAPct}%</p><p className="text-slate-400 text-[10px]">Silo A Fill</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100/80 flex items-center justify-center"><Cylinder size={16} className="text-purple-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{siloBPct}%</p><p className="text-slate-400 text-[10px]">Silo B Fill</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100/80 flex items-center justify-center"><Users size={16} className="text-teal-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{hadirHariIni}</p><p className="text-slate-400 text-[10px]">Karyawan Hadir</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100/80 flex items-center justify-center"><Droplets size={16} className="text-teal-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{pispotCompletionRate}%</p><p className="text-slate-400 text-[10px]">Ketuntasan Pispot</p></div>
          </div>
        </GlassCard>
      </div>

      {/* ── Row 1: Production + Silo Gauges ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Production: Target vs Aktual */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
              <Factory size={16} className="text-emerald-500" />
              Produksi — Target vs Aktual
            </h2>
            <span className="text-slate-400 text-xs">7 hari terakhir</span>
          </div>
          <div className="h-64">
            {productionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionChartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Target" name="Target" fill="rgba(6,182,212,0.6)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Aktual" name="Aktual" fill="rgba(16,185,129,0.7)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">Belum ada data produksi</div>
            )}
          </div>
        </GlassCard>

        {/* Silo Gauge Section */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
              <Cylinder size={16} className="text-cyan-500" />
              Level Silo Saat Ini
            </h2>
            <span className="text-slate-400 text-xs">Real-time</span>
          </div>
          <div className="flex items-center justify-around h-64">
            <SiloGauge label={`Silo A (${siloATon} ton)`} percentage={siloAPct} color={siloAPct > 60 ? '#10b981' : siloAPct > 30 ? '#f59e0b' : '#ef4444'} />
            <SiloGauge label={`Silo B (${siloBTon} ton)`} percentage={siloBPct} color={siloBPct > 60 ? '#8b5cf6' : siloBPct > 30 ? '#f59e0b' : '#ef4444'} />
          </div>
        </GlassCard>
      </div>

      {/* ── Row 2: Finance + Spare Parts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Finance: Income vs Expense Trend */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" />
              Keuangan — Pemasukan vs Pengeluaran
            </h2>
            <span className="text-slate-400 text-xs">Juta Rupiah</span>
          </div>
          <div className="h-64">
            {financeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Pemasukan" name="Pemasukan" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                  <Line type="monotone" dataKey="Pengeluaran" name="Pengeluaran" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">Belum ada data keuangan</div>
            )}
          </div>
        </GlassCard>

        {/* Spare Parts: Stock Levels */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
              <Package size={16} className="text-cyan-500" />
              Stok Suku Cadang (Top 10)
            </h2>
            <span className="text-slate-400 text-xs">Stok vs Minimum</span>
          </div>
          <div className="h-48">
            {sparePartsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sparePartsChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis type="number" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Stok" name="Stok" fill="rgba(6,182,212,0.6)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Min" name="Min" fill="rgba(248,113,113,0.5)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">Belum ada data suku cadang</div>
            )}
          </div>
          {/* Low stock alerts */}
          {lowStockAlerts.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-medium text-amber-600 flex items-center gap-1"><AlertTriangle size={12} /> Stok Rendah:</p>
              {lowStockAlerts.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] bg-amber-50/60 rounded-lg px-2 py-1 border border-amber-200/40">
                  <span className="text-slate-600 truncate">{item.nama}</span>
                  <span className="text-amber-600 font-medium flex-shrink-0">{item.stok}/{item.minimum} {item.satuan}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── Row 3: Team Attendance + Safety ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Team: Attendance Pie */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
              <Users size={16} className="text-teal-500" />
              Kehadiran Karyawan Hari Ini
            </h2>
            <span className="text-slate-400 text-xs">{todayTeam.length} total</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {attendanceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendanceBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {attendanceBreakdown.map((_, index) => (
                      <Cell key={`cell-att-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-xs">Belum ada data kehadiran hari ini</p>
            )}
          </div>
        </GlassCard>

        {/* Safety: Incident Severity */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-500" />
              Distribusi Insiden Keselamatan
            </h2>
            <span className="text-slate-400 text-xs">{safetyData.length} total insiden</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {severityData.map((_, index) => (
                      <Cell key={`cell-sev-${index}`} fill={['#10b981', '#f59e0b', '#f87171', '#7f1d1d'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-xs">Belum ada data insiden</p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ── Row 4: Pispot + Maintenance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pispot Monthly Trend */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
              <Droplets size={16} className="text-teal-500" />
              Tren Pelumasan Bulanan
            </h2>
            <span className="text-slate-400 text-xs">Status per bulan</span>
          </div>
          <div className="h-64">
            {pispotMonthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pispotMonthData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="selesai" name="Selesai" fill="rgba(16,185,129,0.7)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="terjadwal" name="Terjadwal" fill="rgba(6,182,212,0.7)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="terlewat" name="Terlewat" fill="rgba(248,113,113,0.7)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">Belum ada data pispot</div>
            )}
          </div>
        </GlassCard>

        {/* Pispot Status Pie + Maintenance Cost */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
                <Droplets size={16} className="text-teal-500" />
                Distribusi Status Pispot
              </h2>
              <span className="text-slate-400 text-xs">Keseluruhan</span>
            </div>
            <div className="h-48 flex items-center justify-center">
              {pispotStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pispotStatusData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pispotStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 text-xs">Belum ada data</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
                <Wrench size={16} className="text-amber-500" />
                Biaya Perawatan per Mesin
              </h2>
              <span className="text-slate-400 text-xs">Juta Rupiah</span>
            </div>
            <div className="h-48">
              {maintCostData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintCostData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis type="number" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="biaya" name="Biaya" fill="rgba(139,92,246,0.6)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">Belum ada data perawatan</div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
      </>)}
    </div>
  );
}
