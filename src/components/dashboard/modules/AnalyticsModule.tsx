// ============================================================
// AnalyticsModule — Analitik dengan berbagai chart
// Updated: Removed production, safety, finance; added Pispot
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import GlassCard from '@/components/dashboard/GlassCard';
import { getData, formatRupiah } from '@/lib/supabase-data';
import { KV_PREFIXES, type PispotRecord, type MaintenanceRecord } from '@/types/dashboard';
import {
  BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-white/90 border border-white/60 rounded-lg px-3 py-2 text-xs">
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

const PIE_COLORS = ['#10b981', '#06b6d4', '#f87171', '#f59e0b'];

export default function AnalyticsModule() {
  const [pispotData, setPispotData] = useState<PispotRecord[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const pispot = await getData<PispotRecord>(KV_PREFIXES.pispot);
    const maint = await getData<MaintenanceRecord>(KV_PREFIXES.maintenance);
    setPispotData(pispot);
    setMaintenanceData(maint);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Pispot status breakdown
  const pispotStatusData = [
    { name: 'Selesai', value: pispotData.filter((p) => p.status === 'selesai').length },
    { name: 'Terjadwal', value: pispotData.filter((p) => p.status === 'terjadwal').length },
    { name: 'Terlewat', value: pispotData.filter((p) => p.status === 'terlewat').length },
  ].filter((d) => d.value > 0);

  // Pispot by location
  const pispotByLocation: Record<string, number> = {};
  pispotData.forEach((p) => {
    pispotByLocation[p.lokasi] = (pispotByLocation[p.lokasi] || 0) + 1;
  });
  const pispotLocationData = Object.entries(pispotByLocation).map(([name, count]) => ({
    name,
    jumlah: count,
  }));

  // Maintenance cost by machine
  const maintByMachine: Record<string, number> = {};
  maintenanceData.forEach((m) => {
    maintByMachine[m.mesin] = (maintByMachine[m.mesin] || 0) + m.estimasiBiaya;
  });
  const maintCostData = Object.entries(maintByMachine).map(([name, biaya]) => ({
    name,
    biaya: Math.round(biaya / 1000000),
  }));

  // Pispot by month (last 6 months)
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

  // Summary stats
  const totalMaintCost = maintenanceData.reduce((s, m) => s + m.estimasiBiaya, 0);
  const pispotCompletionRate = pispotData.length > 0
    ? Math.round((pispotData.filter((p) => p.status === 'selesai').length / pispotData.length) * 100)
    : 0;
  const overduePispot = pispotData.filter((p) => p.status === 'terlewat').length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Feature Description */}
      <div className="mb-4 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/50">
        <p className="text-cyan-700 text-sm">
          <strong>Analitik</strong> — Analisis data operasional lintas modul. Visualisasi tren pelumasan (Pispot), biaya perawatan, kondisi peralatan, dan metrik kunci lainnya untuk pengambilan keputusan.
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
          <p className="text-slate-400 text-sm mt-1">Visualisasi data dan tren operasional</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100/80 flex items-center justify-center"><BarChart3 size={18} className="text-teal-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{pispotCompletionRate}%</p><p className="text-slate-400 text-xs">Ketuntasan Pispot</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100/80 flex items-center justify-center"><BarChart3 size={18} className="text-red-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{overduePispot}</p><p className="text-slate-400 text-xs">Pelumasan Terlewat</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center"><BarChart3 size={18} className="text-amber-600" /></div>
            <div><p className="text-lg font-bold text-slate-800">{formatRupiah(totalMaintCost)}</p><p className="text-slate-400 text-xs">Total Biaya Perawatan</p></div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100/80 flex items-center justify-center"><BarChart3 size={18} className="text-cyan-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{pispotData.length}</p><p className="text-slate-400 text-xs">Total Record Pispot</p></div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pispot Monthly Trend */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Tren Pelumasan Bulanan</h2>
            <span className="text-slate-400 text-xs">Status per bulan</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pispotMonthData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="selesai" name="Selesai" fill="rgba(16,185,129,0.7)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terjadwal" name="Terjadwal" fill="rgba(6,182,212,0.7)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terlewat" name="Terlewat" fill="rgba(248,113,113,0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pispot Status Pie */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Distribusi Status Pispot</h2>
            <span className="text-slate-400 text-xs">Keseluruhan</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {pispotStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pispotStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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

        {/* Maintenance Cost by Machine */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Biaya Perawatan per Mesin</h2>
            <span className="text-slate-400 text-xs">Juta Rupiah</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintCostData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="biaya" name="Biaya" fill="rgba(139,92,246,0.6)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pispot by Location */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold text-sm">Pispot per Lokasi</h2>
            <span className="text-slate-400 text-xs">Jumlah item</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pispotLocationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="jumlah" name="Jumlah" fill="rgba(6,182,212,0.6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
      </>)}
    </div>
  );
}
