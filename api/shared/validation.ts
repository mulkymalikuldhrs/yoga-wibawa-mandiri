// ============================================================
// Shared validation for /api/db/data
// Field allowlists per table + sanitize/validate helpers
// ============================================================

const TABLE_FIELDS: Record<string, string[]> = {
  spare_parts: ['nama', 'kode', 'kategori', 'stok', 'stokMinimum', 'satuan', 'lokasi', 'harga', 'pemasok', 'catatan', 'id', 'created_at', 'updated_at'],
  production: ['tanggal', 'shift', 'mesin', 'target', 'aktual', 'satuan', 'kualitas', 'catatan', 'id', 'created_at', 'updated_at'],
  maintenance: ['judul', 'mesin', 'jenis', 'prioritas', 'status', 'tanggalMulai', 'tanggalSelesai', 'teknisi', 'estimasiBiaya', 'catatan', 'id', 'created_at', 'updated_at'],
  team_activity: ['namaKaryawan', 'divisi', 'aktivitas', 'status', 'jamMasuk', 'jamKeluar', 'tanggal', 'catatan', 'id', 'created_at', 'updated_at'],
  safety: ['judul', 'tanggal', 'lokasi', 'severity', 'status', 'pelapor', 'korban', 'deskripsi', 'tindakan', 'id', 'created_at', 'updated_at'],
  finance: ['tanggal', 'jenis', 'kategori', 'deskripsi', 'jumlah', 'metodePembayaran', 'referensi', 'catatan', 'id', 'created_at', 'updated_at'],
  hr: ['nama', 'nip', 'jabatan', 'divisi', 'tanggalMasuk', 'gajiPokok', 'status', 'noTelepon', 'email', 'alamat', 'id', 'created_at', 'updated_at'],
  notifications: ['title', 'type', 'category', 'message', 'isRead', 'id', 'created_at', 'updated_at'],
  chat_history: ['role', 'content', 'timestamp', 'id', 'created_at', 'updated_at'],
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

  // Basic type validation for known risky fields
  const numericFields = ['stok', 'stokMinimum', 'harga', 'target', 'aktual', 'estimasiBiaya', 'gajiPokok', 'jumlah'];
  for (const field of numericFields) {
    if (field in data && data[field] !== null && data[field] !== undefined) {
      const val = Number(data[field]);
      if (isNaN(val)) {
        return `Field "${field}" must be a number, got: ${data[field]}`;
      }
    }
  }

  const stringFields = ['nama', 'kode', 'judul', 'deskripsi', 'catatan', 'lokasi', 'pelapor', 'teknisi', 'pemasok'];
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
