/**
 * ============================================================
 * AI Config — Konfigurasi dan Prompt untuk YWM AI Assistant
 * ============================================================
 * 
 * Modul ini menyimpan semua konfigurasi AI, system prompt,
 * dan template prompt spesifik per modul untuk dashboard
 * PT Yoga Wibawa Mandiri.
 * 
 * Digunakan oleh: ai-assistant.js, smart-input.js, 
 *                 ocr-handler.js, report-generator.js
 * 
 * @version 1.0.0
 * @author YWM Development Team
 */

// ============================================================
// SYSTEM PROMPT UTAMA
// ============================================================

/**
 * System prompt utama untuk AI Assistant YWM
 * Memberikan konteks lengkap tentang perusahaan dan operasional
 */
const YWM_SYSTEM_PROMPT = `Kamu adalah AI Assistant untuk PT Yoga Wibawa Mandiri (YWM), perusahaan pengantongan Semen Padang yang berlokasi di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh, Indonesia.

Kamu membantu mengelola:
- Inventaris spare part mesin pengantongan semen
- Kegiatan tim dan absensi
- Jadwal maintenance mesin dan fasilitas
- Tracking produksi harian
- Keselamatan kerja (HSE)
- Keuangan operasional
- Data karyawan

Selalu respon dalam Bahasa Indonesia. Berikan jawaban yang praktis dan actionable.

Informasi Perusahaan:
- Nama: PT Yoga Wibawa Mandiri (YWM)
- Lokasi: Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh
- Bisnis: Pengantongan Semen Padang
- Mesin Utama: Mesin packing semen (rotary packer, conveyor belt, dll)
- Produk: Semen Padang dalam kemasan zak (40kg/50kg)
- Shift Kerja: Pagi, Siang, Malam

Modul Dashboard yang Tersedia:
1. Spare Parts — Inventaris spare part (bearing, belt, seal, dll)
2. Tim — Manajemen tim dan kegiatan harian
3. Maintenance — Work order dan jadwal maintenance
4. Produksi — Tracking produksi harian (zak/tonase)
5. Keuangan — Transaksi keuangan operasional
6. HSE — Keselamatan dan kesehatan kerja
7. HR — Data karyawan dan absensi
8. Purchasing — Pembelian dan supplier
9. Distribusi — Pengiriman dan distribusi

Ketika user memberikan input data, parse dan arahkan ke modul yang tepat.
Gunakan format yang konsisten dan terstruktur.`;

// ============================================================
// PROMPT SPESIFIK PER MODUL — Smart Input Parsing
// ============================================================

/**
 * Template prompt untuk parsing input natural language
 * ke data terstruktur per modul
 */
const MODULE_PROMPTS = {
  'spare-parts': `Kamu adalah parser data spare part untuk PT Yoga Wibawa Mandiri.

Parse input bahasa natural menjadi JSON terstruktur untuk modul spare parts.

Contoh input dan output:

Input: "Bearing 6205 masuk 20 unit dari supplier PT Sinar, gudang A2"
Output: {
  "module": "spare-parts",
  "action": "masuk",
  "data": {
    "nama_part": "Bearing 6205",
    "jumlah": 20,
    "satuan": "unit",
    "supplier": "PT Sinar",
    "lokasi_penyimpanan": "Gudang A2",
    "tipe_transaksi": "masuk"
  }
}

Input: "Stok bearing 6205 keluar 5 buat WO-2026-0042"
Output: {
  "module": "spare-parts",
  "action": "keluar",
  "data": {
    "nama_part": "Bearing 6205",
    "jumlah": 5,
    "tipe_transaksi": "keluar",
    "referensi": "WO-2026-0042"
  }
}

Input: "V-belt B65 habis, perlu order 10 ke supplier langganan"
Output: {
  "module": "spare-parts",
  "action": "order",
  "data": {
    "nama_part": "V-belt B65",
    "status_stok": "habis",
    "jumlah_order": 10,
    "tipe_transaksi": "pemesanan"
  }
}

Kategori spare part yang valid: mekanikal, elektrikal, hidrolik, pneumatik, consumable, safety
Satuan yang valid: Pcs, Set, m, L, Unit

WAJIB output dalam format JSON saja, tanpa penjelasan tambahan.`,

  'team': `Kamu adalah parser data kegiatan tim untuk PT Yoga Wibawa Mandiri.

Parse input bahasa natural menjadi JSON terstruktur untuk modul kegiatan tim.

Contoh input dan output:

Input: "Tim maintenance shift pagi sudah selesai cek conveyor belt line 3"
Output: {
  "module": "team",
  "action": "log",
  "data": {
    "tim": "maintenance",
    "shift": "pagi",
    "kegiatan": "Cek conveyor belt line 3",
    "status": "selesai",
    "kategori_kegiatan": "inspection"
  }
}

Input: "Pak Budi lembur sampai jam 22 untuk perbaikan mesin packer"
Output: {
  "module": "team",
  "action": "log",
  "data": {
    "pic": "Budi",
    "kegiatan": "Perbaikan mesin packer",
    "jam_selesai": "22:00",
    "kategori": "maintenance",
    "lembur": true
  }
}

Input: "Tim produksi shift malam produksi 5000 zak, ada downtime 30 menit karena belt slip"
Output: {
  "module": "team",
  "action": "log",
  "data": {
    "tim": "produksi",
    "shift": "malam",
    "kegiatan": "Produksi 5000 zak",
    "hasil_kerja": "5000 zak",
    "kendala": "Belt slip",
    "downtime_menit": 30
  }
}

Shift yang valid: pagi, siang, malam
Kategori kegiatan yang valid: operasi, maintenance, inspection, meeting, training

WAJIB output dalam format JSON saja, tanpa penjelasan tambahan.`,

  'maintenance': `Kamu adalah parser data maintenance untuk PT Yoga Wibawa Mandiri.

Parse input bahasa natural menjadi JSON terstruktur untuk modul maintenance.

Contoh input dan output:

Input: "Jadwal maintenance pompa hydraulic minggu depan"
Output: {
  "module": "maintenance",
  "action": "jadwal",
  "data": {
    "item": "Pompa hydraulic",
    "jadwal": "minggu depan",
    "tipe_maintenance": "preventive",
    "status": "dijadwalkan",
    "prioritas": "medium"
  }
}

Input: "Mesin packer 2 mogok, perlu perbaikan darurat"
Output: {
  "module": "maintenance",
  "action": "buat_wo",
  "data": {
    "mesin": "Mesin packer 2",
    "deskripsi_masalah": "Mogok",
    "tipe_maintenance": "emergency",
    "prioritas": "critical",
    "status": "dibuat"
  }
}

Input: "WO-2026-0042 sudah selesai, ganti seal dan bearing, biaya material 2.5 juta"
Output: {
  "module": "maintenance",
  "action": "update_wo",
  "data": {
    "nomor_wo": "WO-2026-0042",
    "status": "selesai",
    "hasil_kerja": "Ganti seal dan bearing",
    "biaya_material": 2500000
  }
}

Tipe maintenance yang valid: preventive, corrective, predictive, emergency
Prioritas yang valid: critical, high, medium, low
Status WO yang valid: dibuat, dijadwalkan, berlangsung, selesai

WAJIB output dalam format JSON saja, tanpa penjelasan tambahan.`,

  'produksi': `Kamu adalah parser data produksi untuk PT Yoga Wibawa Mandiri.

Parse input bahasa natural menjadi JSON terstruktur untuk modul produksi.

Contoh input dan output:

Input: "Produksi shift pagi 5200 zak, target 5500, ada downtime 20 menit"
Output: {
  "module": "produksi",
  "action": "input",
  "data": {
    "shift": "pagi",
    "realisasi_zak": 5200,
    "target_zak": 5500,
    "downtime_menit": 20
  }
}

Input: "Hari ini total produksi 15000 zak, 750 ton, 3 shift beroperasi"
Output: {
  "module": "produksi",
  "action": "input",
  "data": {
    "realisasi_zak": 15000,
    "realisasi_tonase": 750,
    "shift_beroperasi": 3
  }
}

Shift yang valid: pagi, siang, malam

WAJIB output dalam format JSON saja, tanpa penjelasan tambahan.`,

  'keuangan': `Kamu adalah parser data keuangan untuk PT Yoga Wibawa Mandiri.

Parse input bahasa natural menjadi JSON terstruktur untuk modul keuangan.

Contoh input dan output:

Input: "Bayar listrik bulan ini 15 juta, sudah transfer"
Output: {
  "module": "keuangan",
  "action": "input",
  "data": {
    "kategori": "operasional",
    "sub_kategori": "listrik",
    "jumlah": 15000000,
    "keterangan": "Bayar listrik bulan ini",
    "tipe": "pengeluaran",
    "status": "lunas"
  }
}

Input: "Terima pembayaran dari PT Bangun Jaya 50 juta untuk PO-2026-0123"
Output: {
  "module": "keuangan",
  "action": "input",
  "data": {
    "kategori": "pendapatan",
    "jumlah": 50000000,
    "keterangan": "Pembayaran dari PT Bangun Jaya",
    "referensi": "PO-2026-0123",
    "tipe": "pemasukan",
    "status": "lunas"
  }
}

Tipe transaksi yang valid: pemasukan, pengeluaran
Kategori yang valid: operasional, pendapatan, maintenance, gaji, lainnya

WAJIB output dalam format JSON saja, tanpa penjelasan tambahan.`,

  'hse': `Kamu adalah parser data HSE (Keselamatan dan Kesehatan Kerja) untuk PT Yoga Wibawa Mandiri.

Parse input bahasa natural menjadi JSON terstruktur untuk modul HSE.

Contoh input dan output:

Input: "Ada insiden terpeleset di area conveyor, tidak ada cedera, sudah ditangani"
Output: {
  "module": "hse",
  "action": "lapor",
  "data": {
    "tipe": "near_miss",
    "lokasi": "Area conveyor",
    "deskripsi": "Terpeleset di area conveyor",
    "cedera": false,
    "status": "sudah ditangani",
    "severity": "low"
  }
}

Input: "Inspeksi APAR area gudang sudah selesai, semua lengkap"
Output: {
  "module": "hse",
  "action": "inspeksi",
  "data": {
    "tipe_inspeksi": "APAR",
    "area": "Gudang",
    "hasil": "Lengkap",
    "status": "selesai"
  }
}

Tipe insiden: insiden, near_miss, bahaya
Severity: critical, high, medium, low

WAJIB output dalam format JSON saja, tanpa penjelasan tambahan.`,

  'hr': `Kamu adalah parser data HR untuk PT Yoga Wibawa Mandiri.

Parse input bahasa natural menjadi JSON terstruktur untuk modul HR.

Contoh input dan output:

Input: "Pak Andi cuti 3 hari mulai tanggal 10 Maret"
Output: {
  "module": "hr",
  "action": "cuti",
  "data": {
    "nama": "Andi",
    "tipe": "cuti",
    "durasi_hari": 3,
    "tanggal_mulai": "10 Maret",
    "status": "diajukan"
  }
}

Input: "Karyawan baru Ahmad masuk divisi maintenance, posisi teknisi"
Output: {
  "module": "hr",
  "action": "karyawan_baru",
  "data": {
    "nama": "Ahmad",
    "divisi": "maintenance",
    "jabatan": "teknisi",
    "status_kepegawaian": "baru"
  }
}

WAJIB output dalam format JSON saja, tanpa penjelasan tambahan.`,

  'purchasing': `Kamu adalah parser data pembelian untuk PT Yoga Wibawa Mandiri.

Parse input bahasa natural menjadi JSON terstruktur untuk modul purchasing.

Contoh input dan output:

Input: "Order bearing 6205 dari PT Sinar Jaya, 50 pcs, harga 150rb per pcs"
Output: {
  "module": "purchasing",
  "action": "buat_po",
  "data": {
    "item": "Bearing 6205",
    "supplier": "PT Sinar Jaya",
    "jumlah": 50,
    "satuan": "pcs",
    "harga_satuan": 150000,
    "total": 7500000,
    "status": "dibuat"
  }
}

Input: "PO dari PT Sinar sudah datang, barang diterima lengkap"
Output: {
  "module": "purchasing",
  "action": "terima",
  "data": {
    "supplier": "PT Sinar",
    "status_penerimaan": "lengkap",
    "status": "diterima"
  }
}

Status PO: dibuat, dikirim, diterima, selesai, dibatalkan

WAJIB output dalam format JSON saja, tanpa penjelasan tambahan.`,

  'distribusi': `Kamu adalah parser data distribusi untuk PT Yoga Wibawa Mandiri.

Parse input bahasa natural menjadi JSON terstruktur untuk modul distribusi.

Contoh input dan output:

Input: "Truk B 1234 AB loading 500 zak untuk PT Bangun Jaya, ke Lhokseumawe"
Output: {
  "module": "distribusi",
  "action": "dispatch",
  "data": {
    "no_kendaraan": "B 1234 AB",
    "jumlah_zak": 500,
    "pelanggan": "PT Bangun Jaya",
    "tujuan": "Lhokseumawe",
    "status": "loading"
  }
}

Input: "Truk B 5678 CD sudah sampai di tujuan, barang diterima lengkap"
Output: {
  "module": "distribusi",
  "action": "update",
  "data": {
    "no_kendaraan": "B 5678 CD",
    "status": "terkirim",
    "penerimaan": "lengkap"
  }
}

Status distribusi: loading, on_the_way, terkirim, dibatalkan

WAJIB output dalam format JSON saja, tanpa penjelasan tambahan.`
};

// ============================================================
// PROMPT UNTUK DETEKSI MODUL OTOMATIS
// ============================================================

/**
 * Prompt untuk mendeteksi modul mana yang paling sesuai
 * dengan input natural language yang diberikan user
 */
const MODULE_DETECTION_PROMPT = `Kamu adalah classifier input untuk dashboard PT Yoga Wibawa Mandiri.

Tugas: Tentukan modul mana yang paling sesuai untuk input berikut.

Modul yang tersedia:
- spare-parts: Semua hal tentang spare part, stok, bearing, belt, seal, gasket, komponen mesin, gudang
- team: Kegiatan tim, shift, absensi, laporan kerja, kegiatan harian
- maintenance: Maintenance, perbaikan, work order, jadwal PM, kerusakan mesin
- produksi: Produksi, output zak/ton, target, downtime, OEE
- keuangan: Keuangan, pembayaran, pemasukan, pengeluaran, invoice, budget
- hse: HSE, keselamatan, insiden, near miss, inspeksi safety, APAR
- hr: HR, karyawan, cuti, lembur, rekrutmen, jabatan
- purchasing: Pembelian, order, supplier, PO, procurement
- distribusi: Distribusi, pengiriman, truk, loading, pelanggan

Output HANYA nama modul, tanpa penjelasan. Contoh: "spare-parts"`;

// ============================================================
// PROMPT UNTUK OCR / PARSING DOKUMEN
// ============================================================

/**
 * Prompt untuk parsing hasil OCR dokumen (invoice, receipt, dll)
 */
const OCR_PARSE_PROMPT = `Kamu adalah parser dokumen untuk PT Yoga Wibawa Mandiri.

Tugas: Parse teks dari OCR dokumen menjadi data terstruktur.

Jenis dokumen yang mungkin:
1. Invoice/Tagihan dari supplier
2. Receipt/Kwitansi pembayaran
3. Delivery Note/Surat Jalan
4. Laporan teknis

Untuk setiap dokumen, ekstrak:
- Jenis dokumen (invoice/receipt/delivery_note/report)
- Tanggal dokumen
- Nomor referensi (nomor invoice/PO/SJ)
- Nama supplier/pengirim
- Daftar item (nama, jumlah, satuan, harga satuan, total)
- Total keseluruhan
- Catatan tambahan

Output dalam format JSON terstruktur. Jika field tidak ditemukan, isi null.

Contoh output:
{
  "jenis_dokumen": "invoice",
  "tanggal": "2026-03-15",
  "nomor_referensi": "INV-2026-0042",
  "supplier": "PT Sinar Jaya",
  "items": [
    {
      "nama": "Bearing SKF 6205",
      "jumlah": 20,
      "satuan": "pcs",
      "harga_satuan": 150000,
      "total": 3000000
    }
  ],
  "total_keseluruhan": 3000000,
  "catatan": null
}`;

// ============================================================
// PROMPT UNTUK GENERATE LAPORAN
// ============================================================

/**
 * Template prompt untuk generate laporan per modul
 */
const REPORT_PROMPTS = {
  'spare-parts': `Buat laporan inventaris spare part untuk PT Yoga Wibawa Mandiri berdasarkan data berikut.

Laporan harus mencakup:
1. Ringkasan Stok: Total item, total nilai stok, item dengan stok rendah
2. Peringatan Stok Rendah: Item di bawah reorder point atau stok minimum
3. Analisis Pemakaian: Item paling sering dipakai, tren pemakaian
4. Rekomendasi: Item yang perlu di-order, estimasi kebutuhan
5. Ringkasan Transaksi: Masuk/keluar bulan ini

Format laporan profesional dalam Bahasa Indonesia.`,

  'team': `Buat laporan kegiatan tim untuk PT Yoga Wibawa Mandiri berdasarkan data berikut.

Laporan harus mencakup:
1. Ringkasan Kegiatan: Jumlah kegiatan per tim, per shift
2. Kinerja Tim: Target vs realisasi, kendala utama
3. Kehadiran: Tingkat kehadiran per tim, karyawan absen
4. Rekomendasi: Area perbaikan, pelatihan yang dibutuhkan

Format laporan profesional dalam Bahasa Indonesia.`,

  'maintenance': `Buat laporan maintenance untuk PT Yoga Wibawa Mandiri berdasarkan data berikut.

Laporan harus mencakup:
1. Ringkasan WO: Total WO per status, per tipe, per prioritas
2. Jadwal Mendatang: WO yang dijadwalkan minggu/bulan depan
3. WO Terlambat: WO yang melewati jadwal
4. Analisis Biaya: Total biaya maintenance, per tipe, per mesin
5. Rekomendasi: Optimasi jadwal PM, pengadaan spare part

Format laporan profesional dalam Bahasa Indonesia.`,

  'produksi': `Buat laporan produksi untuk PT Yoga Wibawa Mandiri berdasarkan data berikut.

Laporan harus mencakup:
1. Ringkasan Produksi: Total zak dan tonase, per shift, per hari
2. Target vs Realisasi: Pencapaian target, persentase yield
3. Analisis Downtime: Penyebab downtime utama, durasi
4. Efisiensi: OEE per mesin, per shift
5. Rekomendasi: Cara meningkatkan output, mengurangi downtime

Format laporan profesional dalam Bahasa Indonesia.`,

  'keuangan': `Buat laporan keuangan untuk PT Yoga Wibawa Mandiri berdasarkan data berikut.

Laporan harus mencakup:
1. Ringkasan Cashflow: Pemasukan vs pengeluaran
2. Kategori Pengeluaran: Breakdown per kategori
3. Pemasukan: Sumber pemasukan utama
4. Rasio Keuangan: Operating ratio, margin
5. Rekomendasi: Penghematan, optimasi budget

Format laporan profesional dalam Bahasa Indonesia.`,

  'hse': `Buat laporan HSE untuk PT Yoga Wibawa Mandiri berdasarkan data berikut.

Laporan harus mencakup:
1. Ringkasan Insiden: Jumlah insiden per tipe, per severity
2. Near Miss: Daftar near miss dan corrective action
3. Inspeksi: Hasil inspeksi safety, area yang perlu perbaikan
4. Kepatuhan: Status kepatuhan regulasi K3
5. Rekomendasi: Program safety improvement, training

Format laporan profesional dalam Bahasa Indonesia.`,

  'hr': `Buat laporan HR untuk PT Yoga Wibawa Mandiri berdasarkan data berikut.

Laporan harus mencakup:
1. Ringkasan Karyawan: Jumlah per divisi, per status
2. Kehadiran: Tingkat kehadiran, keterlambatan, absensi
3. Cuti & Lembur: Pengajuan cuti, jam lembur
4. Komposisi: Per divisi, per level kompetensi
5. Rekomendasi: Rekrutmen, training, rotasi

Format laporan profesional dalam Bahasa Indonesia.`,

  'purchasing': `Buat laporan purchasing untuk PT Yoga Wibawa Mandiri berdasarkan data berikut.

Laporan harus mencakup:
1. Ringkasan PO: Jumlah PO per status, per supplier
2. Analisis Supplier: Supplier teraktif, rating kinerja
3. Pengeluaran: Total pembelian per kategori
4. Lead Time: Rata-rata lead time per supplier
5. Rekomendasi: Konsolidasi supplier, negosiasi harga

Format laporan profesional dalam Bahasa Indonesia.`,

  'distribusi': `Buat laporan distribusi untuk PT Yoga Wibawa Mandiri berdasarkan data berikut.

Laporan harus mencakup:
1. Ringkasan Distribusi: Jumlah pengiriman, zak terkirim
2. Pelanggan: Pelanggan teraktif, volume per pelanggan
3. Analisis Rute: Efisiensi pengiriman per tujuan
4. Status Pengiriman: On-time vs terlambat
5. Rekomendasi: Optimalisasi rute, penjadwalan

Format laporan profesional dalam Bahasa Indonesia.`
};

// ============================================================
// KONFIGURASI MODEL AI
// ============================================================

/**
 * Konfigurasi model AI yang tersedia di Puter.js
 * dengan pengaturan per use case untuk optimasi biaya
 */
const AI_MODELS = {
  // Model utama — murah dan cepat untuk tugas rutin
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    id: 'gpt-4o-mini',
    description: 'Model default, cepat dan ekonomis untuk tugas rutin',
    defaultTemp: 0.3,
    maxTokens: 2048,
    useCases: ['parsing', 'classification', 'simple_qa', 'routine_tasks'],
    costLevel: 'low'
  },
  // Model menengah — untuk tugas yang butuh reasoning lebih
  'claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    id: 'claude-3.5-sonnet',
    description: 'Model menengah, baik untuk analisis dan penulisan',
    defaultTemp: 0.5,
    maxTokens: 4096,
    useCases: ['report_generation', 'analysis', 'complex_parsing', 'writing'],
    costLevel: 'medium'
  },
  // Model Google — alternatif untuk tugas multimodal
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    id: 'gemini-2.5-flash',
    description: 'Model Google, cepat dengan konteks panjang',
    defaultTemp: 0.4,
    maxTokens: 4096,
    useCases: ['ocr_parsing', 'document_analysis', 'multimodal'],
    costLevel: 'low'
  },
  // Model DeepSeek — untuk coding dan reasoning kompleks
  'deepseek-chat': {
    name: 'DeepSeek Chat',
    id: 'deepseek-chat',
    description: 'Model DeepSeek, unggul di reasoning dan coding',
    defaultTemp: 0.3,
    maxTokens: 4096,
    useCases: ['complex_reasoning', 'coding', 'technical_analysis'],
    costLevel: 'low'
  }
};

/**
 * Mapping use case ke model yang optimal
 * Digunakan untuk otomatis memilih model terbaik per tugas
 */
const MODEL_SELECTION_RULES = {
  // Tugas rutin → model murah
  'smart_input_parsing': 'gpt-4o-mini',
  'module_detection': 'gpt-4o-mini',
  'simple_chat': 'gpt-4o-mini',
  'quick_action': 'gpt-4o-mini',
  
  // Tugas menengah → model dengan reasoning lebih
  'report_generation': 'claude-3.5-sonnet',
  'data_analysis': 'claude-3.5-sonnet',
  'complex_qa': 'claude-3.5-sonnet',
  
  // OCR dan dokumen → model multimodal
  'ocr_parsing': 'gemini-2.5-flash',
  'document_analysis': 'gemini-2.5-flash',
  
  // Reasoning kompleks → deepseek
  'complex_reasoning': 'deepseek-chat',
  'technical_analysis': 'deepseek-chat'
};

// ============================================================
// KONFIGURASI RESPONSE CACHING
// ============================================================

/**
 * Konfigurasi caching untuk mengurangi API call
 * Cache disimpan di puter.kv
 */
const CACHE_CONFIG = {
  enabled: true,
  ttlSeconds: 3600, // 1 jam default
  keyPrefix: 'ywm_ai_cache_',
  // Cache per tipe request
  rules: {
    'module_detection': { ttl: 1800, enabled: true },   // 30 menit
    'smart_input_parsing': { ttl: 0, enabled: false },   // Tidak di-cache (input unik)
    'simple_chat': { ttl: 0, enabled: false },            // Tidak di-cache (konteks unik)
    'report_generation': { ttl: 7200, enabled: true },    // 2 jam (data jarang berubah)
    'ocr_parsing': { ttl: 86400, enabled: true }          // 24 jam (dokumen tidak berubah)
  }
};

// ============================================================
// KONFIGURASI VOICE INPUT
// ============================================================

/**
 * Konfigurasi untuk voice input / speech-to-text
 */
const VOICE_CONFIG = {
  language: 'id-ID',          // Bahasa Indonesia
  maxDurationMs: 60000,       // Maksimal 60 detik
  mimeType: 'audio/webm',     // Format audio default
  fallbackMimeType: 'audio/mp4', // Fallback untuk Safari
  visualFeedback: true,       // Tampilkan indikator recording
  autoProcess: true,          // Auto proses setelah berhenti rekam
  silenceThreshold: 2000      // 2 detik diam → auto stop (ms)
};

// ============================================================
// KONFIGURASI OCR
// ============================================================

/**
 * Konfigurasi untuk OCR / document processing
 */
const OCR_CONFIG = {
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxFileSizeMB: 10,
  storagePath: '/ywm-documents/',
  kvKeyPrefix: 'ywm_ocr_',
  autoSaveToModule: true,      // Auto-save parsed data ke modul terkait
  cameraSupport: true,         // Support kamera untuk mobile
  classificationEnabled: true  // Klasifikasi otomatis jenis dokumen
};

// ============================================================
// KONFIGURASI CHAT / ASSISTANT
// ============================================================

/**
 * Konfigurasi untuk chat assistant
 */
const CHAT_CONFIG = {
  historyKey: 'ywm_chat_history',
  maxHistoryMessages: 100,     // Maksimal pesan yang disimpan
  streamingEnabled: true,      // Streaming responses
  defaultModel: 'gpt-4o-mini',
  systemPrompt: YWM_SYSTEM_PROMPT,
  quickActions: [
    {
      id: 'stok_hari_ini',
      label: '📦 Stok Hari Ini',
      prompt: 'Berikan ringkasan stok spare part hari ini, termasuk item yang stoknya rendah'
    },
    {
      id: 'maintenance_mendatang',
      label: '🔧 Maintenance Mendatang',
      prompt: 'Apa saja jadwal maintenance dalam 7 hari ke depan?'
    },
    {
      id: 'produksi_hari_ini',
      label: '📊 Produksi Hari Ini',
      prompt: 'Bagaimana produksi hari ini? Bandingkan dengan target'
    },
    {
      id: 'laporan_hse',
      label: '⚠️ Laporan HSE',
      prompt: 'Berikan ringkasan insiden dan near miss bulan ini'
    },
    {
      id: 'tim_aktif',
      label: '👥 Tim Aktif',
      prompt: 'Tim mana saja yang sedang beroperasi hari ini dan kegiatan apa yang sedang dilakukan?'
    },
    {
      id: 'keuangan_bulan_ini',
      label: '💰 Keuangan Bulan Ini',
      prompt: 'Berikan ringkasan cashflow bulan ini, pemasukan vs pengeluaran'
    },
    {
      id: 'distribusi_pending',
      label: '🚛 Distribusi Pending',
      prompt: 'Ada berapa pengiriman yang masih pending atau terlambat?'
    },
    {
      id: 'rekomendasi_ai',
      label: '🤖 Rekomendasi AI',
      prompt: 'Berdasarkan data terkini, berikan rekomendasi untuk meningkatkan efisiensi operasional'
    }
  ]
};

// ============================================================
// KONFIGURASI REPORT GENERATOR
// ============================================================

/**
 * Konfigurasi untuk report generator
 */
const REPORT_CONFIG = {
  types: [
    { id: 'stok_spare_parts', label: 'Stok Spare Parts', module: 'spare-parts', icon: '📦' },
    { id: 'kegiatan_tim', label: 'Kegiatan Tim', module: 'team', icon: '👥' },
    { id: 'maintenance', label: 'Maintenance', module: 'maintenance', icon: '🔧' },
    { id: 'produksi', label: 'Produksi', module: 'produksi', icon: '📊' },
    { id: 'keuangan', label: 'Keuangan', module: 'keuangan', icon: '💰' },
    { id: 'safety', label: 'Safety & HSE', module: 'hse', icon: '⚠️' },
    { id: 'hr', label: 'HR & Karyawan', module: 'hr', icon: '🧑‍💼' },
    { id: 'purchasing', label: 'Purchasing', module: 'purchasing', icon: '🛒' },
    { id: 'distribusi', label: 'Distribusi', module: 'distribusi', icon: '🚛' }
  ],
  periods: [
    { id: 'harian', label: 'Harian' },
    { id: 'mingguan', label: 'Mingguan' },
    { id: 'bulanan', label: 'Bulanan' }
  ],
  exportFormats: ['text', 'json'],
  saveToFS: true,
  fsPath: '/ywm-reports/',
  modelForReport: 'claude-3.5-sonnet'  // Model yang lebih baik untuk laporan
};

// ============================================================
// ERROR HANDLING & FALLBACK
// ============================================================

/**
 * Strategi fallback ketika AI call gagal
 */
const FALLBACK_STRATEGY = {
  maxRetries: 2,
  retryDelayMs: 1000,
  // Fallback model chain — coba model berikutnya jika gagal
  modelFallbackChain: ['gpt-4o-mini', 'gemini-2.5-flash', 'claude-3.5-sonnet', 'deepseek-chat'],
  // Pesan error yang user-friendly
  errorMessages: {
    'rate_limit': 'AI sedang sibuk. Silakan coba lagi dalam beberapa saat.',
    'timeout': 'Permintaan AI memakan waktu terlalu lama. Silakan coba lagi.',
    'network': 'Koneksi bermasalah. Periksa jaringan internet Anda.',
    'invalid_response': 'AI memberikan respons yang tidak valid. Silakan coba lagi.',
    'generic': 'Terjadi kesalahan pada AI. Silakan coba lagi.'
  }
};

// ============================================================
// KEY PATTERNS UNTUK PUTER.KV
// ============================================================

/**
 * Key patterns untuk penyimpanan data di puter.kv
 */
const KV_KEYS = {
  chatHistory: 'ywm_chat_history',
  smartInputCache: 'ywm_smart_input_',
  ocrResult: 'ywm_ocr_',
  reportCache: 'ywm_report_',
  aiCache: 'ywm_ai_cache_',
  voiceTranscript: 'ywm_voice_',
  moduleData: {
    'spare-parts': 'ywm_spare_parts',
    'team': 'ywm_team_activities',
    'maintenance': 'ywm_work_orders',
    'produksi': 'ywm_produksi',
    'keuangan': 'ywm_keuangan',
    'hse': 'ywm_hse',
    'hr': 'ywm_hr',
    'purchasing': 'ywm_purchasing',
    'distribusi': 'ywm_distribusi'
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Mendapatkan model AI yang optimal untuk use case tertentu
 * @param {string} useCase - Use case identifier
 * @returns {string} Model ID yang optimal
 */
function getOptimalModel(useCase) {
  return MODEL_SELECTION_RULES[useCase] || CHAT_CONFIG.defaultModel;
}

/**
 * Mendapatkan konfigurasi temperature untuk model dan use case
 * @param {string} modelId - ID model AI
 * @param {string} useCase - Use case identifier
 * @returns {number} Temperature value
 */
function getTemperature(modelId, useCase) {
  const model = AI_MODELS[modelId];
  if (!model) return 0.3;
  
  // Override temperature untuk use case tertentu
  if (useCase === 'creative_writing') return 0.7;
  if (useCase === 'parsing' || useCase === 'classification') return 0.1;
  
  return model.defaultTemp;
}

/**
 * Mendapatkan cache TTL untuk use case tertentu
 * @param {string} useCase - Use case identifier
 * @returns {number} TTL dalam detik, 0 jika tidak di-cache
 */
function getCacheTTL(useCase) {
  if (!CACHE_CONFIG.enabled) return 0;
  const rule = CACHE_CONFIG.rules[useCase];
  if (!rule || !rule.enabled) return 0;
  return rule.ttl;
}

/**
 * Membuat cache key untuk puter.kv
 * @param {string} useCase - Use case identifier
 * @param {string} input - Input yang di-hash sebagai bagian key
 * @returns {string} Cache key
 */
function makeCacheKey(useCase, input) {
  // Simple hash dari input untuk membuat key unik
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${CACHE_CONFIG.keyPrefix}${useCase}_${Math.abs(hash).toString(36)}`;
}

/**
 * Mendapatkan pesan error yang user-friendly
 * @param {string} errorType - Tipe error
 * @returns {string} Pesan error dalam Bahasa Indonesia
 */
function getErrorMessage(errorType) {
  return FALLBACK_STRATEGY.errorMessages[errorType] || 
         FALLBACK_STRATEGY.errorMessages.generic;
}

/**
 * Mendapatkan prompt untuk modul tertentu
 * @param {string} moduleId - ID modul
 * @returns {string} Prompt untuk modul tersebut
 */
function getModulePrompt(moduleId) {
  return MODULE_PROMPTS[moduleId] || MODULE_PROMPTS['spare-parts'];
}

/**
 * Mendapatkan prompt laporan untuk modul tertentu
 * @param {string} moduleId - ID modul
 * @returns {string} Prompt laporan untuk modul tersebut
 */
function getReportPrompt(moduleId) {
  return REPORT_PROMPTS[moduleId] || REPORT_PROMPTS['spare-parts'];
}

/**
 * Mencoba AI call dengan fallback ke model berikutnya
 * @param {Function} aiCallFn - Fungsi AI call yang mengembalikan promise
 * @param {string} preferredModel - Model pilihan utama
 * @returns {Promise<any>} Hasil AI call
 */
async function callWithFallback(aiCallFn, preferredModel) {
  const models = FALLBACK_STRATEGY.modelFallbackChain;
  
  // Mulai dari preferred model jika ada di chain
  const startIdx = models.indexOf(preferredModel);
  const orderedModels = startIdx >= 0 
    ? [...models.slice(startIdx), ...models.slice(0, startIdx)]
    : models;

  let lastError = null;
  
  for (const model of orderedModels) {
    for (let attempt = 0; attempt <= FALLBACK_STRATEGY.maxRetries; attempt++) {
      try {
        const result = await aiCallFn(model);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`[AI Config] Model ${model} gagal (attempt ${attempt + 1}):`, error.message);
        
        // Jika rate limit, langsung coba model berikutnya
        if (error.message?.includes('rate') || error.message?.includes('429')) {
          break;
        }
        
        // Delay sebelum retry
        if (attempt < FALLBACK_STRATEGY.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, FALLBACK_STRATEGY.retryDelayMs * (attempt + 1))
          );
        }
      }
    }
  }
  
  throw lastError || new Error('Semua model AI gagal');
}

// ============================================================
// EXPORTS
// ============================================================

// Export semua konfigurasi dan fungsi
window.YWMAIConfig = {
  // Konfigurasi
  YWM_SYSTEM_PROMPT,
  MODULE_PROMPTS,
  MODULE_DETECTION_PROMPT,
  OCR_PARSE_PROMPT,
  REPORT_PROMPTS,
  AI_MODELS,
  MODEL_SELECTION_RULES,
  CACHE_CONFIG,
  VOICE_CONFIG,
  OCR_CONFIG,
  CHAT_CONFIG,
  REPORT_CONFIG,
  FALLBACK_STRATEGY,
  KV_KEYS,
  
  // Fungsi utility
  getOptimalModel,
  getTemperature,
  getCacheTTL,
  makeCacheKey,
  getErrorMessage,
  getModulePrompt,
  getReportPrompt,
  callWithFallback
};
