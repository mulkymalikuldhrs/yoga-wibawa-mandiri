// ============================================================
// Supabase-First Data Layer — PT Yoga Wibawa Mandiri
// Replaces localStorage-first approach with Supabase-first + localStorage fallback
// Provides the same interface as dashboard-storage.ts for seamless migration
// ============================================================

import { KV_PREFIXES } from '@/types/dashboard';
import {
  supabase,
  TABLES,
  camelToSnake,
  snakeToCamel,
  type TableName,
} from '@/lib/supabase';

// ── Re-export utility functions from dashboard-storage ──
export {
  generateId,
  formatRupiah,
  formatTanggal,
  formatTanggalShort,
  exportToCSV,
} from '@/lib/dashboard-storage';

// ── KV_PREFIXES → Supabase table name mapping ──
const PREFIX_TO_TABLE: Record<string, TableName | null> = {
  [KV_PREFIXES.sparePart]: 'spare_parts',
  [KV_PREFIXES.teamActivity]: 'team_activity',
  [KV_PREFIXES.maintenance]: 'maintenance',
  [KV_PREFIXES.pispot]: 'pispot',
  [KV_PREFIXES.document]: 'documents',
  [KV_PREFIXES.notification]: 'notifications',
  [KV_PREFIXES.chatHistory]: 'chat_history',
  [KV_PREFIXES.siloCalculation]: 'silo_calculation',
  [KV_PREFIXES.siloOpname]: 'silo_opname',
  [KV_PREFIXES.production]: 'production',
  [KV_PREFIXES.finance]: 'finance',
  [KV_PREFIXES.safety]: 'safety_incident',
  [KV_PREFIXES.employee]: 'employee',
  // dashboardConfig has no Supabase table — localStorage only
  [KV_PREFIXES.dashboardConfig]: null,
};

// ── Column mapping: camelCase → snake_case for each table ──
const COLUMN_MAPS: Record<TableName, Record<string, string>> = {
  spare_parts: {
    nama: 'nama',
    kode: 'kode',
    kategori: 'kategori',
    stok: 'stok',
    stokMinimum: 'stok_minimum',
    satuan: 'satuan',
    lokasi: 'lokasi',
    harga: 'harga',
    pemasok: 'pemasok',
    catatan: 'catatan',
  },
  team_activity: {
    namaKaryawan: 'nama_karyawan',
    divisi: 'divisi',
    aktivitas: 'aktivitas',
    status: 'status',
    jamMasuk: 'jam_masuk',
    jamKeluar: 'jam_keluar',
    tanggal: 'tanggal',
    catatan: 'catatan',
  },
  maintenance: {
    judul: 'judul',
    mesin: 'mesin',
    jenis: 'jenis',
    prioritas: 'prioritas',
    status: 'status',
    tanggalMulai: 'tanggal_mulai',
    tanggalSelesai: 'tanggal_selesai',
    teknisi: 'teknisi',
    estimasiBiaya: 'estimasi_biaya',
    catatan: 'catatan',
  },
  pispot: {
    namaPeralatan: 'nama_peralatan',
    kodePeralatan: 'kode_peralatan',
    lokasi: 'lokasi',
    jenisPelumas: 'jenis_pelumas',
    spesifikasi: 'spesifikasi',
    volume: 'volume',
    periode: 'periode',
    bulan: 'bulan',
    tanggalPelaksanaan: 'tanggal_pelaksanaan',
    petugas: 'petugas',
    status: 'status',
    kondisi: 'kondisi',
    catatan: 'catatan',
    tindakLanjut: 'tindak_lanjut',
  },
  documents: {
    nama: 'nama',
    jenis: 'jenis',
    kategori: 'kategori',
    ukuran: 'ukuran',
    url: 'url',
    ocrText: 'ocr_text',
    diunggahOleh: 'diunggah_oleh',
    catatan: 'catatan',
  },
  notifications: {
    judul: 'judul',
    pesan: 'pesan',
    tipe: 'tipe',
    dibaca: 'dibaca',
    modul: 'modul',
    link: 'action_url',
  },
  chat_history: {
    sessionId: 'session_id',
    role: 'role',
    content: 'content',
    tokensUsed: 'tokens_used',
  },
  silo_calculation: {
    silo: 'silo',
    tanggal: 'tanggal',
    jam: 'jam',
    ukuran: 'ukuran',
    jumlah: 'jumlah',
    tinggiRataRata: 'tinggi_rata_rata',
    tSilinder: 't_silinder',
    tConis: 't_conis',
    volumeSilinder: 'volume_silinder',
    volumeConis: 'volume_conis',
    volumeTotal: 'volume_total',
    kekosongan: 'kekosongan',
    spaceSilo: 'space_silo',
    pengeluaran: 'pengeluaran',
    keterangan: 'keterangan',
    petugas: 'petugas',
  },
  silo_opname: {
    tanggal: 'tanggal',
    jam: 'jam',
    kapal: 'kapal',
    opname1Tanggal: 'opname1_tanggal',
    opname1Jam: 'opname1_jam',
    opname1UkuranA: 'opname1_ukuran_a',
    opname1UkuranB: 'opname1_ukuran_b',
    opname1VolumeA: 'opname1_volume_a',
    opname1VolumeB: 'opname1_volume_b',
    opname1TotalVolume: 'opname1_total_volume',
    opname2Tanggal: 'opname2_tanggal',
    opname2Jam: 'opname2_jam',
    opname2UkuranA: 'opname2_ukuran_a',
    opname2UkuranB: 'opname2_ukuran_b',
    opname2VolumeA: 'opname2_volume_a',
    opname2VolumeB: 'opname2_volume_b',
    opname2TotalVolume: 'opname2_total_volume',
    pengeluaranZak: 'pengeluaran_zak',
    semenCurahTerbongkar: 'semen_curah_terbongkar',
    catatan: 'catatan',
    petugas: 'petugas',
  },
  production: {
    tanggal: 'tanggal',
    shift: 'shift',
    mesin: 'mesin',
    target: 'target',
    aktual: 'aktual',
    satuan: 'satuan',
    kualitas: 'kualitas',
    catatan: 'catatan',
  },
  finance: {
    tanggal: 'tanggal',
    jenis: 'jenis',
    kategori: 'kategori',
    deskripsi: 'deskripsi',
    jumlah: 'jumlah',
    metodePembayaran: 'metode_pembayaran',
    referensi: 'referensi',
    catatan: 'catatan',
  },
  safety_incident: {
    judul: 'judul',
    tanggal: 'tanggal',
    lokasi: 'lokasi',
    severity: 'severity',
    status: 'status',
    pelapor: 'pelapor',
    korban: 'korban',
    deskripsi: 'deskripsi',
    tindakan: 'tindakan',
  },
  employee: {
    nama: 'nama',
    nip: 'nip',
    jabatan: 'jabatan',
    divisi: 'divisi',
    tanggalMasuk: 'tanggal_masuk',
    gajiPokok: 'gaji_pokok',
    status: 'status',
    noTelepon: 'no_telepon',
    email: 'email',
    alamat: 'alamat',
  },
};

// ── Inverse column maps (snake_case → camelCase) for reading ──
const INVERSE_COLUMN_MAPS: Record<TableName, Record<string, string>> = {} as Record<TableName, Record<string, string>>;
for (const table of Object.keys(COLUMN_MAPS) as TableName[]) {
  INVERSE_COLUMN_MAPS[table] = {};
  for (const [camel, snake] of Object.entries(COLUMN_MAPS[table])) {
    INVERSE_COLUMN_MAPS[table][snake] = camel;
  }
}

// ── Supabase connection state cache ──
let _supabaseAvailable: boolean | null = null;
let _lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30_000; // 30 seconds

/**
 * Check if Supabase is currently available (cached for 30s)
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (_supabaseAvailable !== null && (now - _lastConnectionCheck) < CONNECTION_CHECK_INTERVAL) {
    return _supabaseAvailable;
  }

  try {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !key) {
      _supabaseAvailable = false;
      _lastConnectionCheck = now;
      return false;
    }

    const { error } = await supabase.from('spare_parts').select('id').limit(1);
    _supabaseAvailable = !error;
    _lastConnectionCheck = now;
    return _supabaseAvailable;
  } catch {
    _supabaseAvailable = false;
    _lastConnectionCheck = now;
    return false;
  }
}

// ── localStorage helpers (kept from dashboard-storage.ts) ──

function getLocalData<T extends { id: string }>(prefix: string): T[] {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    return keys.map((k) => {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    }).filter(Boolean) as T[];
  } catch {
    return [];
  }
}

function saveLocalData<T extends { id: string }>(prefix: string, data: T): void {
  const key = `${prefix}${data.id}`;
  localStorage.setItem(key, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
}

function deleteLocalData(prefix: string, id: string): void {
  const key = `${prefix}${id}`;
  localStorage.removeItem(key);
}

// ── camelCase ↔ snake_case conversion for objects ──

/**
 * Convert a camelCase object to snake_case for a specific table
 * Handles JSONB fields (arrays) by keeping them as-is (Supabase stores JSONB natively)
 */
function toSnakeCase<T extends Record<string, unknown>>(
  table: TableName,
  data: T
): Record<string, unknown> {
  const columnMap = COLUMN_MAPS[table];
  const result: Record<string, unknown> = {};

  // Always include id
  if ('id' in data) {
    result.id = data.id;
  }

  for (const [key, value] of Object.entries(data)) {
    if (key === 'id') continue; // already handled
    if (key === 'createdAt') { result.created_at = value; continue; }
    if (key === 'updatedAt') { result.updated_at = value; continue; }

    const snakeKey = columnMap[key];
    if (snakeKey) {
      // JSONB fields: arrays stay as-is, Supabase handles serialization
      result[snakeKey] = value;
    } else {
      // Fallback: use automatic camelToSnake conversion
      result[camelToSnake(key)] = value;
    }
  }

  return result;
}

/**
 * Convert a snake_case Supabase row to camelCase for TypeScript types
 */
function toCamelCase<T extends Record<string, unknown>>(
  table: TableName,
  row: Record<string, unknown>
): T {
  const inverseMap = INVERSE_COLUMN_MAPS[table];
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    if (key === 'id') { result.id = value; continue; }
    if (key === 'created_at') { result.createdAt = value; continue; }
    if (key === 'updated_at') { result.updatedAt = value; continue; }

    const camelKey = inverseMap[key];
    if (camelKey) {
      result[camelKey] = value;
    } else {
      // Fallback: use automatic snakeToCamel conversion
      result[snakeToCamel(key)] = value;
    }
  }

  return result as T;
}

// ── PUBLIC API — same signatures as dashboard-storage.ts ──

/**
 * Get all data for a given KV prefix.
 * Tries Supabase first, falls back to localStorage if unavailable.
 *
 * @param prefix - The KV_PREFIXES key (e.g., KV_PREFIXES.sparePart)
 * @returns Array of typed records
 */
export async function getData<T extends { id: string }>(prefix: string): Promise<T[]> {
  const tableName = PREFIX_TO_TABLE[prefix];

  // No Supabase table for this prefix — localStorage only
  if (tableName === null || tableName === undefined) {
    return getLocalData<T>(prefix);
  }

  // Try Supabase first
  const available = await isSupabaseAvailable();
  if (available) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((row) => toCamelCase<T>(tableName, row));
      }
      if (import.meta.env.DEV) console.warn(`[YWM Data] Supabase fetch failed for ${tableName}, falling back to localStorage:`, error?.message);
    } catch (err) {
      if (import.meta.env.DEV) console.warn(`[YWM Data] Supabase error for ${tableName}, falling back to localStorage:`, err);
    }
  }

  // Fallback to localStorage
  return getLocalData<T>(prefix);
}

/**
 * Synchronous version of getData for components that need immediate data.
 * Returns localStorage data immediately. If Supabase is available, also
 * triggers a background fetch that the component can pick up on re-render.
 *
 * @param prefix - The KV_PREFIXES key
 * @returns Array of typed records from localStorage
 */
export function getDataSync<T extends { id: string }>(prefix: string): T[] {
  return getLocalData<T>(prefix);
}

/**
 * Save data to both Supabase AND localStorage (dual-write for resilience).
 * If Supabase fails, data is still saved to localStorage.
 *
 * @param prefix - The KV_PREFIXES key
 * @param data - The record to save (must include id)
 */
export async function saveData<T extends { id: string }>(prefix: string, data: T): Promise<void> {
  // Always save to localStorage first (fast, reliable)
  saveLocalData(prefix, data);

  const tableName = PREFIX_TO_TABLE[prefix];
  if (tableName === null || tableName === undefined) return;

  // Try to also save to Supabase
  const available = await isSupabaseAvailable();
  if (!available) return;

  try {
    const snakeData = toSnakeCase(tableName, data as Record<string, unknown>);

    // Check if record exists
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', data.id)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing record
      const { error } = await supabase
        .from(tableName)
        .update({ ...snakeData, updated_at: new Date().toISOString() })
        .eq('id', data.id);
      if (error) {
        if (import.meta.env.DEV) console.warn(`[YWM Data] Supabase update failed for ${tableName}:`, error.message);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from(tableName)
        .insert({ ...snakeData, updated_at: new Date().toISOString() });
      if (error) {
        if (import.meta.env.DEV) console.warn(`[YWM Data] Supabase insert failed for ${tableName}:`, error.message);
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn(`[YWM Data] Supabase save error for ${tableName}:`, err);
  }
}

/**
 * Delete data from both Supabase and localStorage.
 *
 * @param prefix - The KV_PREFIXES key
 * @param id - The record ID to delete
 */
export async function deleteData(prefix: string, id: string): Promise<void> {
  // Always delete from localStorage
  deleteLocalData(prefix, id);

  const tableName = PREFIX_TO_TABLE[prefix];
  if (tableName === null || tableName === undefined) return;

  // Try to also delete from Supabase
  const available = await isSupabaseAvailable();
  if (!available) return;

  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      if (import.meta.env.DEV) console.warn(`[YWM Data] Supabase delete failed for ${tableName}:`, error.message);
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn(`[YWM Data] Supabase delete error for ${tableName}:`, err);
  }
}

// ── Migration: localStorage → Supabase ──

/**
 * Sync all existing localStorage data to Supabase.
 * For each KV prefix, reads localStorage records and upserts them
 * into the corresponding Supabase table.
 *
 * @returns Summary of migrated records per table
 */
export async function syncLocalToSupabase(): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  const available = await isSupabaseAvailable();
  if (!available) {
    if (import.meta.env.DEV) console.warn('[YWM Sync] Supabase not available, skipping sync');
    return results;
  }

  for (const [prefix, tableName] of Object.entries(PREFIX_TO_TABLE)) {
    if (!tableName) continue; // skip localStorage-only prefixes

    const localData = getLocalData<Record<string, unknown>>(prefix);
    if (localData.length === 0) continue;

    let migrated = 0;
    for (const item of localData) {
      try {
        const snakeData = toSnakeCase(tableName, item);
        const { error } = await supabase
          .from(tableName)
          .upsert(snakeData, { onConflict: 'id' });

        if (!error) {
          migrated++;
        } else {
          if (import.meta.env.DEV) console.warn(`[YWM Sync] Failed to upsert record ${item.id} to ${tableName}:`, error.message);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn(`[YWM Sync] Error syncing record ${item.id} to ${tableName}:`, err);
      }
    }

    results[tableName] = migrated;
  }

  if (import.meta.env.DEV) console.info('[YWM Sync] Migration complete:', results);
  return results;
}

// ── Database Status ──

export interface DatabaseStatus {
  /** Whether Supabase is connected */
  connected: boolean;
  /** Which tables exist in Supabase */
  tables: string[];
  /** Timestamp of last successful connection check */
  lastSync: string | null;
  /** Error message if connection failed */
  error?: string;
}

/**
 * Check the current database connection status and which tables exist.
 *
 * @returns DatabaseStatus object with connection info
 */
export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return {
      connected: false,
      tables: [],
      lastSync: null,
      error: 'Missing Supabase environment variables',
    };
  }

  try {
    const existingTables: string[] = [];
    const allTables = Object.values(TABLES);

    for (const tableName of allTables) {
      const { error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      if (!error || error.code !== '42P01') {
        existingTables.push(tableName);
      }
    }

    _supabaseAvailable = true;
    _lastConnectionCheck = Date.now();

    return {
      connected: true,
      tables: existingTables,
      lastSync: new Date().toISOString(),
    };
  } catch (err: unknown) {
    _supabaseAvailable = false;
    _lastConnectionCheck = Date.now();

    return {
      connected: false,
      tables: [],
      lastSync: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ── Force refresh connection state ──

/**
 * Force a re-check of Supabase availability.
 * Resets the cached connection state so next getData/saveData call
 * will perform a fresh connection check.
 */
export function invalidateConnectionCache(): void {
  _supabaseAvailable = null;
  _lastConnectionCheck = 0;
}
