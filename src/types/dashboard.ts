// ============================================================
// TypeScript Types for YWM Dashboard
// ============================================================

// --- Base ---
export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface WithId {
  id: string;
}

// --- Spare Parts ---
export interface SparePart extends WithId, Timestamped {
  nama: string;
  kode: string;
  kategori: string;
  stok: number;
  stokMinimum: number;
  satuan: string;
  lokasi: string;
  harga: number;
  pemasok: string;
  catatan: string;
}

// --- Team Activity ---
export interface TeamActivity extends WithId, Timestamped {
  namaKaryawan: string;
  divisi: string;
  aktivitas: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha' | 'lembur';
  jamMasuk: string;
  jamKeluar: string;
  tanggal: string;
  catatan: string;
}

// --- Maintenance ---
export interface MaintenanceRecord extends WithId, Timestamped {
  judul: string;
  mesin: string;
  jenis: 'preventif' | 'korektif' | 'darurat';
  prioritas: 'rendah' | 'sedang' | 'tinggi' | 'kritis';
  status: 'terjadwal' | 'berjalan' | 'selesai' | 'dibatalkan';
  tanggalMulai: string;
  tanggalSelesai: string;
  teknisi: string;
  estimasiBiaya: number;
  catatan: string;
}

// --- Production ---
export interface ProductionRecord extends WithId, Timestamped {
  tanggal: string;
  shift: 'pagi' | 'siang' | 'malam';
  mesin: string;
  target: number;
  aktual: number;
  satuan: string;
  kualitas: 'A' | 'B' | 'C';
  catatan: string;
}

// --- Safety / HSE ---
export interface SafetyIncident extends WithId, Timestamped {
  judul: string;
  tanggal: string;
  lokasi: string;
  severity: 'ringan' | 'sedang' | 'berat' | 'fatal';
  status: 'dilaporkan' | 'investigasi' | 'selesai' | 'ditutup';
  pelapor: string;
  korban: string;
  deskripsi: string;
  tindakan: string;
}

// --- Finance ---
export interface FinanceRecord extends WithId, Timestamped {
  tanggal: string;
  jenis: 'pemasukan' | 'pengeluaran';
  kategori: string;
  deskripsi: string;
  jumlah: number;
  metodePembayaran: string;
  referensi: string;
  catatan: string;
}

// --- HR / Employee ---
export interface Employee extends WithId, Timestamped {
  nama: string;
  nip: string;
  jabatan: string;
  divisi: string;
  tanggalMasuk: string;
  gajiPokok: number;
  status: 'aktif' | 'cuti' | 'resign';
  noTelepon: string;
  email: string;
  alamat: string;
}

// --- Document ---
export interface Document extends WithId, Timestamped {
  nama: string;
  jenis: 'kontrak' | 'laporan' | 'manual' | 'sertifikat' | 'lainnya';
  kategori: string;
  ukuran: number;
  url: string;
  ocrText: string;
  diunggahOleh: string;
  catatan: string;
}

// --- AI ---
export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  message: AiMessage;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// --- Notification ---
export interface Notification extends WithId, Timestamped {
  judul: string;
  pesan: string;
  tipe: 'info' | 'peringatan' | 'bahaya' | 'sukses';
  dibaca: boolean;
  modul: string;
  link: string;
}

// --- Dashboard Module Enum ---
export type DashboardModule =
  | 'overview'
  | 'spare-parts'
  | 'team-activity'
  | 'maintenance'
  | 'production'
  | 'safety'
  | 'finance'
  | 'hr'
  | 'documents'
  | 'analytics'
  | 'notifications';

export interface DashboardModuleInfo {
  id: DashboardModule;
  label: string;
  icon: string;
  description: string;
}

// --- KV Key Patterns ---
export const KV_PREFIXES = {
  sparePart: 'ywm_spare_',
  teamActivity: 'ywm_team_',
  maintenance: 'ywm_maint_',
  production: 'ywm_prod_',
  safety: 'ywm_safety_',
  finance: 'ywm_finance_',
  employee: 'ywm_hr_',
  document: 'ywm_doc_',
  notification: 'ywm_notif_',
  chatHistory: 'ywm_chat_',
  dashboardConfig: 'ywm_config_',
} as const;

// --- Dashboard Stats ---
export interface DashboardStats {
  totalSpareParts: number;
  lowStockItems: number;
  activeMaintenance: number;
  todayProduction: number;
  openIncidents: number;
  monthlyRevenue: number;
  activeEmployees: number;
  unreadNotifications: number;
}
