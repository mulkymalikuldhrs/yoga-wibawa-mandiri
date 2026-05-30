// ============================================================
// TypeScript Types for YWM Dashboard v2
// PT. Yoga Wibawa Mandiri — Cement Packaging Company
// With Silo Calculation, Discharge, and Grease tracking
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

// --- Opname (Stok Opname Umum) ---
export interface OpnameRecord extends WithId, Timestamped {
  tanggal: string;
  kategori: string;
  item: string;
  jumlah: number;
  satuan: string;
  keterangan: string;
}

// --- Opname Silo (Detailed Silo Measurements) ---
export interface OpnameSiloRecord extends WithId, Timestamped {
  tanggal: string;
  tipe: 'sebelum_bongkar' | 'sesudah_bongkar';
  siloAH: number[]; // 7 measurements
  siloBH: number[]; // 7 measurements
  siloAAvgHeight: number;
  siloBAvgHeight: number;
  totalEmptySpace: number; // MT
  pengeluaran: number; // MT
  cementFromShip: number; // MT
  namaKapal: string;
  catatan: string;
}

// --- Discharge Operation ---
export interface DischargeOperation extends WithId, Timestamped {
  tanggal: string;
  mulaiPembongkaran: string; // HH:MM
  rateBongkarMin: number; // tons/jam
  rateBongkarMax: number; // tons/jam
  sisaMuatan: number; // MT
  estimasiWaktuMin: number; // jam
  estimasiWaktuMax: number; // jam
  estimasiSelesaiMin: string; // HH:MM
  estimasiSelesaiMax: string; // HH:MM
  cargoDischargePCC: number; // MT
  totalCargoDischargePCC: number; // MT
  balanceCargoPCC: number; // MT
  totalCargoBalance: number; // MT
  pengeluaranTruck: number; // MT
  pengeluaranCurah: number; // MT
  dischargeStartedSiloA: string; // HH:MM
  dischargeStartedSiloB: string; // HH:MM
  kekosonganSiloA: Record<string, unknown>;
  kekosonganSiloB: Record<string, unknown>;
  namaKapal: string;
  catatan: string;
}

// --- Pispot (Produksi Packer) ---
export interface PispotRecord extends WithId, Timestamped {
  tanggal: string;
  shift: 'pagi' | 'siang' | 'malam';
  packer: string;
  nozzle: string;
  produksiZak: number;
  produksiTon: number;
  catatan: string;
}

// --- Pispot Grease (Pelumasan) ---
export interface PispotGrease extends WithId, Timestamped {
  tanggal: string;
  packer: string;
  jenisGrease: string;
  jumlah: number; // kg or liter
  satuan: string;
  intervalJam: number;
  jamPelumasan: string; // HH:MM
  teknisi: string;
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

// --- Silo Data ---
export interface SiloData extends WithId {
  name: string;
  capacity: number;
  current: number;
  holes: number;
  createdAt: string;
  updatedAt: string;
}

// --- Dashboard Module Enum ---
export type DashboardModule =
  | 'overview'
  | 'spare-parts'
  | 'team-activity'
  | 'maintenance'
  | 'safety'
  | 'documents'
  | 'opname'
  | 'pispot'
  | 'silo-calculation'
  | 'discharge'
  | 'pispot-grease'
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
  safety: 'ywm_safety_',
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
  openIncidents: number;
  unreadNotifications: number;
}
