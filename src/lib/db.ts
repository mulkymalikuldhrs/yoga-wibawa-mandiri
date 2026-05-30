// ============================================================
// Database Service Layer — YWM AI Dashboard
// All CRUD operations for Supabase tables
// With localStorage fallback when DB is unavailable
// ============================================================

import { supabase, supabaseAdmin, TABLES } from './supabase';

// ── Types ──
export interface DbSparePart {
  id: string;
  nama: string;
  kode: string;
  kategori: string;
  stok: number;
  stok_minimum: number;
  satuan: string;
  lokasi: string;
  harga: number;
  pemasok: string;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export interface DbTeamActivity {
  id: string;
  nama_karyawan: string;
  divisi: string;
  aktivitas: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha' | 'lembur';
  jam_masuk: string;
  jam_keluar: string;
  tanggal: string;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export interface DbMaintenanceRecord {
  id: string;
  judul: string;
  mesin: string;
  jenis: 'preventif' | 'korektif' | 'darurat';
  prioritas: 'rendah' | 'sedang' | 'tinggi' | 'kritis';
  status: 'terjadwal' | 'berjalan' | 'selesai' | 'dibatalkan';
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  teknisi: string;
  estimasi_biaya: number;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export interface DbSafetyIncident {
  id: string;
  judul: string;
  tanggal: string;
  lokasi: string;
  severity: 'ringan' | 'sedang' | 'berat' | 'fatal';
  status: 'dilaporkan' | 'investigasi' | 'selesai' | 'ditutup';
  pelapor: string;
  korban: string;
  deskripsi: string;
  tindakan: string;
  created_at: string;
  updated_at: string;
}

export interface DbDocument {
  id: string;
  nama: string;
  jenis: 'kontrak' | 'laporan' | 'manual' | 'sertifikat' | 'lainnya';
  kategori: string;
  ukuran: number;
  url: string;
  ocr_text: string;
  diunggah_oleh: string;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export interface DbNotification {
  id: string;
  judul: string;
  pesan: string;
  tipe: 'info' | 'peringatan' | 'bahaya' | 'sukses';
  dibaca: boolean;
  modul: string;
  link: string;
  created_at: string;
  updated_at: string;
}

export interface DbSiloData {
  id: string;
  name: string;
  capacity: number;
  current: number;
  holes: number;
  created_at: string;
  updated_at: string;
}

export interface DbOpnameRecord {
  id: string;
  tanggal: string;
  kategori: string;
  item: string;
  jumlah: number;
  satuan: string;
  keterangan: string;
  created_at: string;
  updated_at: string;
}

export interface DbOpnameSiloRecord {
  id: string;
  tanggal: string;
  tipe: 'sebelum_bongkar' | 'sesudah_bongkar';
  silo_a_h: number[];
  silo_b_h: number[];
  silo_a_avg_height: number;
  silo_b_avg_height: number;
  total_empty_space: number;
  pengeluaran: number;
  cement_from_ship: number;
  nama_kapal: string;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export interface DbDischargeOperation {
  id: string;
  tanggal: string;
  mulai_pembongkaran: string;
  rate_bongkar_min: number;
  rate_bongkar_max: number;
  sisa_muatan: number;
  estimasi_waktu_min: number;
  estimasi_waktu_max: number;
  estimasi_selesai_min: string;
  estimasi_selesai_max: string;
  cargo_discharge_pcc: number;
  total_cargo_discharge_pcc: number;
  balance_cargo_pcc: number;
  total_cargo_balance: number;
  pengeluaran_truck: number;
  pengeluaran_curah: number;
  discharge_started_silo_a: string;
  discharge_started_silo_b: string;
  kekosongan_silo_a: Record<string, unknown>;
  kekosongan_silo_b: Record<string, unknown>;
  nama_kapal: string;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export interface DbPispotRecord {
  id: string;
  tanggal: string;
  shift: 'pagi' | 'siang' | 'malam';
  packer: string;
  nozzle: string;
  produksi_zak: number;
  produksi_ton: number;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export interface DbPispotGrease {
  id: string;
  tanggal: string;
  packer: string;
  jenis_grease: string;
  jumlah: number;
  satuan: string;
  interval_jam: number;
  jam_pelumasan: string;
  teknisi: string;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export interface DbProductionData {
  id: string;
  bulan: string;
  zak: number;
  curah: number;
  tahun: number;
  created_at: string;
  updated_at: string;
}

export interface DbChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  session_id: string;
  created_at: string;
}

// ── Connection status ──
let dbConnected = false;

export async function checkDbConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from(TABLES.SILO_DATA).select('id').limit(1);
    dbConnected = !error;
    return dbConnected;
  } catch {
    dbConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return dbConnected;
}

// ── Generic CRUD operations ──
export async function fetchAll<T>(table: string): Promise<T[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as T[]) || [];
  } catch (err) {
    console.warn(`[DB] fetchAll ${table} failed:`, err);
    return [];
  }
}

export async function fetchById<T>(table: string, id: string): Promise<T | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as T;
  } catch (err) {
    console.warn(`[DB] fetchById ${table} failed:`, err);
    return null;
  }
}

export async function insert<T>(table: string, record: Partial<T>): Promise<T | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .insert(record as any)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  } catch (err) {
    console.warn(`[DB] insert ${table} failed:`, err);
    return null;
  }
}

export async function update<T>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  } catch (err) {
    console.warn(`[DB] update ${table} failed:`, err);
    return null;
  }
}

export async function remove(table: string, id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn(`[DB] remove ${table} failed:`, err);
    return false;
  }
}

export async function count(table: string, filter?: Record<string, any>): Promise<number> {
  try {
    let query = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { count: c, error } = query;
    if (error) throw error;
    return c || 0;
  } catch (err) {
    console.warn(`[DB] count ${table} failed:`, err);
    return 0;
  }
}

// ── Specific queries ──
export async function getUnreadNotifications(): Promise<DbNotification[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLES.NOTIFICATIONS)
      .select('*')
      .eq('dibaca', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as DbNotification[]) || [];
  } catch {
    return [];
  }
}

export async function getLowStockParts(): Promise<DbSparePart[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SPARE_PARTS)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data as DbSparePart[]) || []).filter(p => p.stok <= p.stok_minimum);
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from(TABLES.NOTIFICATIONS)
      .update({ dibaca: true, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from(TABLES.NOTIFICATIONS)
      .update({ dibaca: true, updated_at: new Date().toISOString() })
      .eq('dibaca', false);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function getSiloData(): Promise<DbSiloData[]> {
  return fetchAll<DbSiloData>(TABLES.SILO_DATA);
}

export async function updateSiloLevel(id: string, current: number): Promise<DbSiloData | null> {
  return update<DbSiloData>(TABLES.SILO_DATA, id, { current } as any);
}

export async function getProductionData(year?: number): Promise<DbProductionData[]> {
  try {
    let query = supabaseAdmin
      .from(TABLES.PRODUCTION_DATA)
      .select('*')
      .order('created_at', { ascending: true });
    if (year) {
      query = query.eq('tahun', year);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as DbProductionData[]) || [];
  } catch {
    return [];
  }
}

export async function saveChatMessage(role: 'user' | 'assistant' | 'system', content: string, sessionId: string = 'default'): Promise<DbChatMessage | null> {
  return insert<DbChatMessage>(TABLES.CHAT_MESSAGES, {
    role,
    content,
    session_id: sessionId,
  } as any);
}

export async function getChatHistory(sessionId: string = 'default', limit: number = 50): Promise<DbChatMessage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLES.CHAT_MESSAGES)
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data as DbChatMessage[]) || [];
  } catch {
    return [];
  }
}

// ── Dashboard stats ──
export async function getDashboardStats() {
  const [
    totalSpareParts,
    sparePartsList,
    activeMaintenance,
    openIncidents,
    unreadNotifs,
    siloData,
    teamToday,
  ] = await Promise.all([
    count(TABLES.SPARE_PARTS),
    fetchAll<DbSparePart>(TABLES.SPARE_PARTS),
    count(TABLES.MAINTENANCE_RECORDS, { status: 'berjalan' }),
    count(TABLES.SAFETY_INCIDENTS),
    count(TABLES.NOTIFICATIONS, { dibaca: false }),
    getSiloData(),
    fetchAll<DbTeamActivity>(TABLES.TEAM_ACTIVITIES),
  ]);

  const scheduledMaintenance = await count(TABLES.MAINTENANCE_RECORDS, { status: 'terjadwal' });

  const lowStockItems = sparePartsList.filter(p => p.stok <= p.stok_minimum).length;
  const openSafetyIncidents = (await fetchAll<DbSafetyIncident>(TABLES.SAFETY_INCIDENTS))
    .filter(s => s.status !== 'ditutup' && s.status !== 'selesai').length;

  return {
    totalSpareParts,
    lowStockItems,
    activeMaintenance: activeMaintenance + scheduledMaintenance,
    openIncidents: openSafetyIncidents,
    unreadNotifications: unreadNotifs,
    siloData,
    teamToday: teamToday,
  };
}

// ── AI Data Access ──
export async function aiQueryData(module: string, filters?: Record<string, any>): Promise<any[]> {
  const tableMap: Record<string, string> = {
    'spare-parts': TABLES.SPARE_PARTS,
    'team-activity': TABLES.TEAM_ACTIVITIES,
    'maintenance': TABLES.MAINTENANCE_RECORDS,
    'safety': TABLES.SAFETY_INCIDENTS,
    'documents': TABLES.DOCUMENTS,
    'notifications': TABLES.NOTIFICATIONS,
    'silo': TABLES.SILO_DATA,
    'opname': TABLES.OPNAME_RECORDS,
    'opname-silo': 'opname_silo_records',
    'pispot': TABLES.PISPOT_RECORDS,
    'pispot-grease': 'pispot_grease',
    'production': TABLES.PRODUCTION_DATA,
    'discharge': 'discharge_operations',
  };

  const table = tableMap[module];
  if (!table) return [];

  try {
    let query = supabaseAdmin.from(table).select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn(`[DB] aiQueryData ${module} failed:`, err);
    return [];
  }
}

export async function aiInsertData(module: string, data: Record<string, any>): Promise<any> {
  const tableMap: Record<string, string> = {
    'spare-parts': TABLES.SPARE_PARTS,
    'team-activity': TABLES.TEAM_ACTIVITIES,
    'maintenance': TABLES.MAINTENANCE_RECORDS,
    'safety': TABLES.SAFETY_INCIDENTS,
    'documents': TABLES.DOCUMENTS,
    'notifications': TABLES.NOTIFICATIONS,
    'silo': TABLES.SILO_DATA,
    'opname': TABLES.OPNAME_RECORDS,
    'opname-silo': 'opname_silo_records',
    'pispot': TABLES.PISPOT_RECORDS,
    'pispot-grease': 'pispot_grease',
    'discharge': 'discharge_operations',
  };

  const table = tableMap[module];
  if (!table) return null;

  return insert(table, data);
}

export async function aiUpdateData(module: string, id: string, data: Record<string, any>): Promise<any> {
  const tableMap: Record<string, string> = {
    'spare-parts': TABLES.SPARE_PARTS,
    'team-activity': TABLES.TEAM_ACTIVITIES,
    'maintenance': TABLES.MAINTENANCE_RECORDS,
    'safety': TABLES.SAFETY_INCIDENTS,
    'documents': TABLES.DOCUMENTS,
    'notifications': TABLES.NOTIFICATIONS,
    'silo': TABLES.SILO_DATA,
    'opname': TABLES.OPNAME_RECORDS,
    'opname-silo': 'opname_silo_records',
    'pispot': TABLES.PISPOT_RECORDS,
    'pispot-grease': 'pispot_grease',
    'discharge': 'discharge_operations',
  };

  const table = tableMap[module];
  if (!table) return null;

  return update(table, id, data);
}
