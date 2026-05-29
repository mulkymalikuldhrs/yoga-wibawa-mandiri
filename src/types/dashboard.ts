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

// --- Pispot (Pompa Gemik Bearing / Lubrikasi / Pelumasan) ---
// Checklist siklus bulanan untuk pelumasan dan perawatan bearing/pompa
export interface PispotRecord extends WithId, Timestamped {
  namaPeralatan: string;        // Nama peralatan (pompa, bearing, dll)
  kodePeralatan: string;        // Kode inventaris peralatan
  lokasi: string;               // Lokasi peralatan di pabrik
  jenisPelumas: string;         // Jenis pelumas/gemuk yang digunakan
  spesifikasi: string;          // Spesifikasi pelumas (viskositas, NLGI grade, dll)
  volume: string;               // Volume/jumlah pelumas yang dibutuhkan
  periode: string;              // Periode siklus (bulanan, 2-mingguan, dll)
  bulan: string;                // Bulan pelaksanaan (format: YYYY-MM)
  tanggalPelaksanaan: string;   // Tanggal pelaksanaan pelumasan
  petugas: string;              // Nama petugas pelaksana
  status: 'terjadwal' | 'selesai' | 'terlewat';  // Status pelaksanaan
  kondisi: 'baik' | 'perlu_perhatian' | 'rusak';  // Kondisi peralatan setelah dicek
  catatan: string;              // Catatan tambahan
  tindakLanjut: string;         // Tindak lanjut yang diperlukan
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

// --- Silo Configuration ---
// Berdasarkan formula asli YWM (Berita Acara Opname Silo A & B)
// Silo berbentuk silinder + conis (kerucut bawah)
export const SILO_CONFIG = {
  A: {
    name: 'Silo A',
    jumlahLubang: 7,
    tinggiSilinder: 18, // meter — tinggi bagian silinder (0-18m)
    tinggiTotal: 22.6, // meter — tinggi total silo A
    areaSilinder: 145.42, // m² — luas penampang silinder
    areaConis: 48.47, // m² — luas penampang conis dasar
    tConisMax: 4.6, // meter — tinggi conis saat tinggi rata-rata ≤ 18m
    tConisFormula: 22.6, // meter — konstanta conis saat >18m: 22.6 - (c)
    beratJenis: 1.0, // ton/m³ (semen curah PCC)
  },
  B: {
    name: 'Silo B',
    jumlahLubang: 7,
    tinggiSilinder: 18, // meter
    tinggiTotal: 20.9, // meter — tinggi total silo B
    areaSilinder: 145.42, // m²
    areaConis: 48.47, // m²
    tConisMax: 2.9, // meter — tinggi conis saat tinggi rata-rata ≤ 18m
    tConisFormula: 20.9, // meter — konstanta conis saat >18m: 20.9 - (c)
    beratJenis: 1.0, // ton/m³
  },
} as const;

export type SiloId = 'A' | 'B';

// --- Silo Calculation (Kalkulasi Kekosongan) ---
// Berdasarkan formula "Kalkulasi Kekosongan" dari file XLSX YWM
// Setiap lubang diukur KEDALAMAN KEKOSONGAN (meter dari atas permukaan semen)
export interface SiloCalculation extends WithId, Timestamped {
  silo: SiloId;
  tanggal: string;
  jam: string;
  // (a) Pengukuran 1-7: kedalaman kekosongan di tiap lubang (meter)
  ukuran: [number, number, number, number, number, number, number]; // 7 lubang
  // (b) Jumlah 1-7
  jumlah: number;
  // (c) Tinggi Rata-Rata = Jumlah / 7
  tinggiRataRata: number;
  // (d) t Silinder = 18 - (c) [jika >18m = 0]
  tSilinder: number;
  // (e) t Conis
  tConis: number;
  // Volume Silinder = 145.42 × tSilinder
  volumeSilinder: number;
  // Volume Conis = 48.47 × tConis
  volumeConis: number;
  // Total Volume = volumeSilinder + volumeConis (m³)
  volumeTotal: number;
  // Kekosongan (m³)
  kekosongan: number;
  // Space Silo setelah dikurangi pengeluaran
  spaceSilo: number;
  // Pengeluaran (truck + curah, ton)
  pengeluaran: number;
  keterangan: string;
  petugas: string;
}

// --- Silo Opname (Berita Acara Opname) ---
// Berdasarkan "Berita Acara Opname Silo A & B" dari file XLSX YWM
export interface SiloOpname extends WithId, Timestamped {
  tanggal: string;
  jam: string;
  kapal: string; // nama kapal pengirim semen curah
  // --- Opname I (Sebelum Bongkar) ---
  opname1Tanggal: string;
  opname1Jam: string;
  opname1UkuranA: [number, number, number, number, number, number, number]; // 7 lubang Silo A
  opname1UkuranB: [number, number, number, number, number, number, number]; // 7 lubang Silo B
  opname1VolumeA: number; // m³
  opname1VolumeB: number; // m³
  opname1TotalVolume: number; // m³ total
  // --- Opname II (Sesudah Bongkar) ---
  opname2Tanggal: string;
  opname2Jam: string;
  opname2UkuranA: [number, number, number, number, number, number, number];
  opname2UkuranB: [number, number, number, number, number, number, number];
  opname2VolumeA: number;
  opname2VolumeB: number;
  opname2TotalVolume: number;
  // --- Rekapitulasi ---
  pengeluaranZak: number; // ton semen dizakkan sejak opname I s/d II
  semenCurahTerbongkar: number; // m/t semen curah terbongkar dari kapal
  catatan: string;
  petugas: string;
}

// --- Production (Produksi) ---
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

// --- Finance (Keuangan) ---
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

// --- Safety/HSE ---
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

// --- Employee (Karyawan) ---
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

// --- Dashboard Module Enum ---
export type DashboardModule =
  | 'overview'
  | 'spare-parts'
  | 'team-activity'
  | 'maintenance'
  | 'pispot'
  | 'silo-calculation'
  | 'silo-opname'
  | 'documents'
  | 'analytics'
  | 'notifications'
  | 'production'
  | 'finance'
  | 'safety'
  | 'hr';

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
  pispot: 'ywm_pispot_',
  document: 'ywm_doc_',
  notification: 'ywm_notif_',
  chatHistory: 'ywm_chat_',
  dashboardConfig: 'ywm_config_',
  siloCalculation: 'ywm_silo_calc_',
  siloOpname: 'ywm_silo_opname_',
  production: 'ywm_prod_',
  finance: 'ywm_fin_',
  safety: 'ywm_safety_',
  employee: 'ywm_emp_',
} as const;

// --- Dashboard Stats ---
export interface DashboardStats {
  totalSpareParts: number;
  lowStockItems: number;
  activeMaintenance: number;
  pispotTerjadwal: number;
  pispotTerlewat: number;
  unreadNotifications: number;
  siloALevel: number; // persentase
  siloBLevel: number; // persentase
}
