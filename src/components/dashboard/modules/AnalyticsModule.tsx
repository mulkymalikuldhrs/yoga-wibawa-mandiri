// ============================================================
// AnalyticsModule — Analitik dengan berbagai chart
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, formatRupiah } from '@/lib/dashboard-storage';
import { KV_PREFIXES, type ProductionRecord, type MaintenanceRecord, type SafetyIncident, type FinanceRecord } from '@/types/dashboard';
import {
  BarChart3, Calendar,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-[#0f0c29]/90 border border-white/10 rounded-lg px-3 py-2 text-xs">
        <p className="text-white/70 mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? formatRupiah(entry.value) : entry.value}
            {entry.name === 'Efisiensi' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsModule() {
  const [dateRange, setDateRange] = useState('7');
  const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceRecord[]>([]);
  const [safetyData, setSafetyData] = useState<SafetyIncident[]>([]);
  const [financeData, setFinanceData] = useState<FinanceRecord[]>([]);

  const loadData = useCallback(() => {
    setProductionData(getData<ProductionRecord>(KV_PREFIXES.production));
    setMaintenanceData(getData<MaintenanceRecord>(KV_PREFIXES.maintenance));
    setSafetyData(getData<SafetyIncident>(KV_PREFIXES.safety));
    setFinanceData(getData<FinanceRecord>(KV_PREFIXES.finance));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const days = parseInt(dateRange);

  // Production trends
  const prodTrend: Array<{ name: string; aktual: number; target: number; efisiensi: number }> = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const dayProds = productionData.filter((p) => p.tanggal === dateStr);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const totalTarget = dayProds.reduce((s, p) => s + p.target, 0);
    const totalAktual = dayProds.reduce((s, p) => s + p.aktual, 0);
    prodTrend.push({
      name: dayNames[date.getDay()] + ' ' + date.getDate(),
      aktual: totalAktual,
      target: totalTarget,
      efisiensi: totalTarget > 0 ? Math.round((totalAktual / totalTarget) * 100) : 0,
    });
  }

  // Maintenance cost by machine
  const maintByMachine: Record<string, number> = {};
  maintenanceData.forEach((m) => {
    maintByMachine[m.mesin] = (maintByMachine[m.mesin] || 0) + m.estimasiBiaya;
  });
  const maintCostData = Object.entries(maintByMachine).map(([name, biaya]) => ({
    name,
    biaya: Math.round(biaya / 1000000),
  }));

  // Safety incidents trend
  const safetyTrend: Array<{ name: string; count: number }> = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const dayIncidents = safetyData.filter((s) => s.tanggal === dateStr);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    safetyTrend.push({
      name: dayNames[date.getDay()] + ' ' + date.getDate(),
      count: dayIncidents.length,
    });
  }

  // Finance summary by month
  const financeByMonth: Record<string, { pemasukan: number; pengeluaran: number }> = {};
  financeData.forEach((f) => {
    const month = f.tanggal.substring(0, 7);
    if (!financeByMonth[month]) financeByMonth[month] = { pemasukan: 0, pengeluaran: 0 };
    if (f.jenis === 'pemasukan') financeByMonth[month].pemasukan += f.jumlah;
    else financeByMonth[month].pengeluaran += f.jumlah;
  });
  const financeChartData = Object.entries(financeByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({
      name: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      pemasukan: Math.round(vals.pemasukan / 1000000),
      pengeluaran: Math.round(vals.pengeluaran / 1000000),
    }));

  // Summary stats
  const totalProduction = productionData.reduce((s, p) => s + p.aktual, 0);
  const avgEfficiency = productionData.length > 0
    ? Math.round(productionData.reduce((s, p) => s + (p.target > 0 ? (p.aktual / p.target) * 100 : 0), 0) / productionData.length)
    : 0;
  const totalMaintCost = maintenanceData.reduce((s, m) => s + m.estimasiBiaya, 0);
  const totalIncidents = safetyData.length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Analitik</h1>
          <p className="text-white/40 text-sm mt-1">Visualisasi data dan tren operasional</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-white/30" />
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none appearance-none">
            <option value="7" className="bg-[#0f0c29]">7 Hari</option>
            <option value="14" className="bg-[#0f0c29]">14 Hari</option>
            <option value="30" className="bg-[#0f0c29]">30 Hari</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center"><BarChart3 size={18} className="text-cyan-400" /></div>
            <div><p className="text-xl font-bold text-white">{totalProduction} ton</p><p className="text-white/40 text-xs">Total Produksi</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center"><BarChart3 size={18} className="text-emerald-400" /></div>
            <div><p className="text-xl font-bold text-white">{avgEfficiency}%</p><p className="text-white/40 text-xs">Rata-rata Efisiensi</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center"><BarChart3 size={18} className="text-amber-400" /></div>
            <div><p className="text-lg font-bold text-white">{formatRupiah(totalMaintCost)}</p><p className="text-white/40 text-xs">Total Biaya Perawatan</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center"><BarChart3 size={18} className="text-red-400" /></div>
            <div><p className="text-xl font-bold text-white">{totalIncidents}</p><p className="text-white/40 text-xs">Total Insiden</p></div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Production Trends */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Tren Produksi</h2>
            <span className="text-white/30 text-xs">Ton/hari</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="aktual" name="Aktual" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Efficiency Trend */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Efisiensi Produksi</h2>
            <span className="text-white/30 text-xs">% efisiensi</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[80, 120]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="efisiensi" name="Efisiensi" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Maintenance Cost by Machine */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Biaya Perawatan per Mesin</h2>
            <span className="text-white/30 text-xs">Juta Rupiah</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintCostData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="biaya" name="Biaya" fill="rgba(139,92,246,0.6)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Safety Incidents Trend */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Tren Insiden Keselamatan</h2>
            <span className="text-white/30 text-xs">Jumlah insiden</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safetyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Insiden" fill="rgba(248,113,113,0.6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Finance Summary */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Ringkasan Keuangan Bulanan</h2>
            <span className="text-white/30 text-xs">Juta Rupiah</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pemasukan" name="Pemasukan" fill="rgba(52,211,153,0.6)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran" fill="rgba(248,113,113,0.6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
