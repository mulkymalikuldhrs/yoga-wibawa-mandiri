// ============================================================
// Shared validation for /api/db/data
// Field allowlists per table (snake_case matching Supabase schema)
// + sanitize/validate helpers
// Updated: Fixed field names to match actual Supabase columns
// ============================================================

const TABLE_FIELDS: Record<string, string[]> = {
  spare_parts: ['id', 'nama', 'kode', 'kategori', 'stok', 'stok_minimum', 'satuan', 'lokasi', 'harga', 'pemasok', 'catatan', 'created_at', 'updated_at'],
  production: ['id', 'tanggal', 'shift', 'mesin', 'target', 'aktual', 'satuan', 'kualitas', 'catatan', 'created_at', 'updated_at'],
  maintenance: ['id', 'judul', 'mesin', 'jenis', 'prioritas', 'status', 'tanggal_mulai', 'tanggal_selesai', 'teknisi', 'estimasi_biaya', 'catatan', 'created_at', 'updated_at'],
  team_activity: ['id', 'nama_karyawan', 'divisi', 'aktivitas', 'status', 'jam_masuk', 'jam_keluar', 'tanggal', 'catatan', 'created_at', 'updated_at'],
  safety_incident: ['id', 'judul', 'tanggal', 'lokasi', 'severity', 'status', 'pelapor', 'korban', 'deskripsi', 'tindakan', 'created_at', 'updated_at'],
  finance: ['id', 'tanggal', 'jenis', 'kategori', 'deskripsi', 'jumlah', 'metode_pembayaran', 'referensi', 'catatan', 'created_at', 'updated_at'],
  employee: ['id', 'nama', 'nip', 'jabatan', 'divisi', 'tanggal_masuk', 'gaji_pokok', 'status', 'no_telepon', 'email', 'alamat', 'created_at', 'updated_at'],
  notifications: ['id', 'judul', 'pesan', 'tipe', 'dibaca', 'modul', 'action_url', 'created_at', 'updated_at'],
  chat_history: ['id', 'session_id', 'role', 'content', 'tokens_used', 'created_at', 'updated_at'],
  pispot: ['id', 'nama_peralatan', 'kode_peralatan', 'lokasi', 'jenis_pelumas', 'spesifikasi', 'volume', 'periode', 'bulan', 'tanggal_pelaksanaan', 'petugas', 'status', 'kondisi', 'catatan', 'tindak_lanjut', 'created_at', 'updated_at'],
  documents: ['id', 'nama', 'jenis', 'kategori', 'ukuran', 'url', 'ocr_text', 'diunggah_oleh', 'catatan', 'created_at', 'updated_at'],
  silo_calculation: ['id', 'silo', 'tanggal', 'jam', 'ukuran', 'jumlah', 'tinggi_rata_rata', 't_silinder', 't_conis', 'volume_silinder', 'volume_conis', 'volume_total', 'kekosongan', 'space_silo', 'pengeluaran', 'keterangan', 'petugas', 'created_at', 'updated_at'],
  silo_opname: ['id', 'tanggal', 'jam', 'kapal', 'opname1_tanggal', 'opname1_jam', 'opname1_ukuran_a', 'opname1_ukuran_b', 'opname1_volume_a', 'opname1_volume_b', 'opname1_total_volume', 'opname2_tanggal', 'opname2_jam', 'opname2_ukuran_a', 'opname2_ukuran_b', 'opname2_volume_a', 'opname2_volume_b', 'opname2_total_volume', 'pengeluaran_zak', 'semen_curah_terbongkar', 'catatan', 'petugas', 'created_at', 'updated_at'],
};

const MAX_DATA_SIZE_BYTES = 100 * 1024; // 100KB max payload per record

/**
 * Strip any fields not in the allowlist for the given table.
 * Returns empty object if table is unknown.
 */
export function sanitizeData(table: string, data: Record<string, unknown>): Record<string, unknown> {
  const allowedFields = TABLE_FIELDS[table];
  if (!allowedFields) return {};

  const sanitized: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}

/**
 * Validate data size and basic type constraints.
 * Returns an error message or null if valid.
 */
export function validateData(data: Record<string, unknown>): string | null {
  // Size check
  const size = JSON.stringify(data).length;
  if (size > MAX_DATA_SIZE_BYTES) {
    return `Data too large: ${size} bytes (max ${MAX_DATA_SIZE_BYTES})`;
  }

  // Basic type validation for known numeric fields (snake_case matching DB)
  const numericFields = ['stok', 'stok_minimum', 'harga', 'target', 'aktual', 'estimasi_biaya', 'gaji_pokok', 'jumlah', 'ukuran', 'pengeluaran_zak', 'semen_curah_terbongkar'];
  for (const field of numericFields) {
    if (field in data && data[field] !== null && data[field] !== undefined) {
      const val = Number(data[field]);
      if (isNaN(val)) {
        return `Field "${field}" must be a number, got: ${data[field]}`;
      }
    }
  }

  // Basic type validation for known string fields (snake_case matching DB)
  const stringFields = ['nama', 'kode', 'judul', 'deskripsi', 'catatan', 'lokasi', 'pelapor', 'teknisi', 'pemasok', 'pesan', 'tindakan', 'keterangan', 'petugas', 'kapal'];
  for (const field of stringFields) {
    if (field in data && data[field] !== null && data[field] !== undefined) {
      if (typeof data[field] !== 'string') {
        return `Field "${field}" must be a string, got: ${typeof data[field]}`;
      }
      // Limit string length
      if ((data[field] as string).length > 5000) {
        return `Field "${field}" exceeds maximum length of 5000 characters`;
      }
    }
  }

  return null;
}
