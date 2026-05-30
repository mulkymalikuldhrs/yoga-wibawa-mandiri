/**
 * ============================================================
 * AI Config — Konfigurasi dan Prompt untuk YWM AI Assistant & Agent
 * ============================================================
 * 
 * Modul ini menyimpan semua konfigurasi AI, system prompt,
 * dan template prompt spesifik per modul untuk dashboard
 * PT Yoga Wibawa Mandiri.
 * 
 * v2.0.0 — Ditambahkan: Konfigurasi AI Agent, definisi aksi,
 *           workflow otonom, monitoring, dan proactive alerts.
 * 
 * Digunakan oleh: ai-assistant.js, smart-input.js, 
 *                 ocr-handler.js, report-generator.js
 * 
 * @version 2.0.0
 * @author YWM Development Team
 */

// ============================================================
// SYSTEM PROMPT UTAMA
// ============================================================

/**
 * System prompt utama untuk AI Assistant YWM
 * Memberikan konteks lengkap tentang perusahaan dan operasional
 */
const YWM_SYSTEM_PROMPT = `Kamu adalah AI Assistant & Agent untuk PT Yoga Wibawa Mandiri (YWM), perusahaan pengantongan Semen Padang yang berlokasi di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh, Indonesia.

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
Gunakan format yang konsisten dan terstruktur.

KEMAMPUAN AGENT:
Kamu juga bisa MENJALANKAN AKSI secara langsung, bukan hanya menjawab pertanyaan:
- Membuat Work Order baru untuk maintenance
- Menambahkan spare part ke inventaris
- Mencatat kegiatan tim
- Mengecek stok dan memberikan peringatan
- Membuat Purchase Order untuk pembelian
- Menjalankan workflow otomatis

Jika user meminta sesuatu yang memerlukan aksi, respons dengan format JSON aksi:
\`\`\`action
{"action": "create_wo", "params": {...}}
\`\`\`

Atau jika user hanya bertanya, jawab biasa dalam bahasa Indonesia.`;

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
// PROMPT UNTUK AI AGENT — Action Parsing
// ============================================================

/**
 * Prompt untuk parsing natural language menjadi aksi agent yang bisa dieksekusi
 * Digunakan saat agentMode aktif dan user meminta sesuatu yang memerlukan aksi
 */
const AGENT_ACTION_PARSE_PROMPT = `Kamu adalah AI Agent untuk dashboard PT Yoga Wibawa Mandiri.

Tugas: Parse permintaan user menjadi aksi yang bisa dieksekusi oleh sistem.

Aksi yang tersedia:
1. create_wo — Membuat Work Order baru
   Params: { mesin, judul, deskripsi, tipe("Preventive"|"Corrective"|"Predictive"|"Emergency"), prioritas("Low"|"Medium"|"High"|"Critical"), assigned_to, due_date }

2. update_wo — Update status Work Order
   Params: { wo_number, status("Open"|"In Progress"|"Completed"|"Cancelled"), completion_notes, actual_cost }

3. add_spare_part — Menambahkan spare part baru ke inventaris
   Params: { nama_item, kategori("Bearing"|"Belt"|"Seal"|"Filter"|"Elektrikal"|"Mekanikal"|"Lainnya"), stok, min_stok, satuan("Pcs"|"Set"|"Unit"|"m"|"L"|"kg"|"Roll"|"Box"), lokasi_gudang, harga_satuan, part_mesin, catatan }

4. check_stock — Cek stok spare part
   Params: { nama_item } (opsional, jika kosong cek semua yang stok rendah)

5. log_team_activity — Catat kegiatan tim
   Params: { karyawan, kegiatan, kategori("Produksi"|"Maintenance"|"Inspeksi"|"Meeting"|"Lainnya"), lembur, catatan }

6. create_po — Buat Purchase Order
   Params: { item, supplier, jumlah, satuan, harga_satuan }

7. check_overdue_wo — Cek Work Order yang overdue
   Params: {} (tanpa parameter, cek semua)

8. generate_report — Generate laporan
   Params: { module, period("harian"|"mingguan"|"bulanan") }

9. check_production_anomaly — Cek anomali produksi
   Params: {} (tanpa parameter)

10. run_workflow — Jalankan workflow otomatis
    Params: { workflow_id, params }

Contoh:
User: "Buat WO untuk packer 2, corrective, prioritas tinggi"
Output: {"action": "create_wo", "params": {"mesin": "Packer 2", "judul": "Corrective maintenance Packer 2", "tipe": "Corrective", "prioritas": "High"}}

User: "Cek stok bearing"
Output: {"action": "check_stock", "params": {"nama_item": "bearing"}}

User: "Stok spare part yang rendah apa saja?"
Output: {"action": "check_stock", "params": {}}

User: "Ada WO yang overdue?"
Output: {"action": "check_overdue_wo", "params": {}}

Jika permintaan TIDAK memerlukan aksi (hanya pertanyaan biasa), output:
{"action": "chat", "params": {}}

WAJIB output JSON saja, tanpa penjelasan tambahan.`;

// ============================================================
// PROMPT UNTUK AI AGENT — Workflow Orchestration
// ============================================================

/**
 * Prompt untuk AI Agent dalam merencanakan dan mengeksekusi workflow
 * Workflow adalah rantai aksi yang dijalankan secara berurutan
 */
const AGENT_WORKFLOW_PROMPT = `Kamu adalah workflow orchestrator untuk AI Agent PT Yoga Wibawa Mandiri.

Tugas: Berdasarkan kondisi yang diberikan, tentukan rantai aksi yang perlu dijalankan.

Workflow yang tersedia:

1. "low_stock_auto_order" — Ketika stok spare part rendah, otomatis buat PO
   Trigger: Stok item ≤ min_stok
   Steps:
   a. check_stock → identifikasi item rendah
   b. create_po → buat PO untuk item tersebut

2. "overdue_wo_escalation" — Ketika ada WO overdue, eskalasi dan buat WO darurat
   Trigger: Ada WO yang melewati due_date
   Steps:
   a. check_overdue_wo → identifikasi WO overdue
   b. create_wo → buat WO emergency untuk yang critical

3. "production_anomaly_alert" — Ketika ada anomali produksi, alert dan buat WO
   Trigger: Produksi di bawah 80% target
   Steps:
   a. check_production_anomaly → identifikasi anomali
   b. create_wo → buat WO corrective jika ada mesin bermasalah
   c. log_team_activity → catat insiden

4. "daily_checkup" — Cek harian rutin
   Steps:
   a. check_stock → cek stok rendah
   b. check_overdue_wo → cek WO overdue
   c. check_production_anomaly → cek anomali produksi

Berikan output dalam format JSON:
{
  "workflow_id": "nama_workflow",
  "steps": [
    {"action": "check_stock", "params": {...}},
    {"action": "create_po", "params": {...}}
  ],
  "alert_if": "kondisi yang memerlukan perhatian user"
}

WAJIB output JSON saja.`;

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
  'agent_action_parsing': 'gpt-4o-mini',
  'agent_check': 'gpt-4o-mini',
  
  // Tugas menengah → model dengan reasoning lebih
  'report_generation': 'claude-3.5-sonnet',
  'data_analysis': 'claude-3.5-sonnet',
  'complex_qa': 'claude-3.5-sonnet',
  'workflow_orchestration': 'claude-3.5-sonnet',
  
  // OCR dan dokumen → model multimodal
  'ocr_parsing': 'gemini-2.5-flash',
  'document_analysis': 'gemini-2.5-flash',
  
  // Reasoning kompleks → deepseek
  'complex_reasoning': 'deepseek-chat',
  'technical_analysis': 'deepseek-chat'
};

// ============================================================
// KONFIGURASI AI AGENT
// ============================================================

/**
 * Konfigurasi untuk AI Agent — mode otonom, monitoring, dan aksi
 */
const AGENT_CONFIG = {
  // Flag untuk mengaktifkan/menonaktifkan mode agent
  agentMode: true,
  
  // Interval pengecekan berkala (ms) — default 5 menit
  checkIntervalMs: 5 * 60 * 1000,
  
  // Apakah scheduled checks aktif
  scheduledChecksEnabled: true,
  
  // Apakah proactive alerts aktif
  proactiveAlertsEnabled: true,
  
  // Maksimal aksi otonom per siklus check (batasi agar tidak berlebihan)
  maxAutonomousActionsPerCycle: 3,
  
  // Apakah agent boleh mengeksekusi aksi tanpa konfirmasi user
  autoExecuteEnabled: false,
  
  // Aksi yang diizinkan tanpa konfirmasi (jika autoExecuteEnabled = false, 
  // aksi READ_ONLY tidak perlu konfirmasi)
  readOnlyActions: ['check_stock', 'check_overdue_wo', 'check_production_anomaly', 'generate_report'],
  
  // Aksi yang memerlukan konfirmasi user sebelum dieksekusi
  confirmationRequiredActions: ['create_wo', 'update_wo', 'add_spare_part', 'create_po', 'log_team_activity', 'run_workflow'],
  
  // Threshold untuk alert
  thresholds: {
    // Stok dianggap rendah jika ≤ min_stok
    lowStockEnabled: true,
    // WO dianggap overdue jika melewati due_date
    overdueWOEnabled: true,
    // Produksi dianggap anomali jika di bawah persentase target
    productionAnomalyThreshold: 0.80, // 80% target
    productionAnomalyEnabled: true
  },
  
  // KV key untuk menyimpan state agent
  stateKey: 'ywm_agent_state',
  alertsKey: 'ywm_agent_alerts',
  auditKey: 'ywm_agent_audit'
};

/**
 * Definisi aksi yang bisa dieksekusi oleh AI Agent
 * Setiap aksi memiliki: id, label, module, handler, params
 */
const AGENT_ACTIONS = {
  create_wo: {
    id: 'create_wo',
    label: 'Buat Work Order',
    description: 'Membuat Work Order baru di modul maintenance',
    module: 'maintenance',
    category: 'write',
    riskLevel: 'medium', // low, medium, high
    params: {
      mesin: { type: 'string', required: true, label: 'Mesin', options: ['Packer 1', 'Packer 2', 'Packer 3', 'Conveyor Utama', 'Conveyor Loading', 'Compressor', 'Dust Collector', 'Silo 1', 'Silo 2', 'Silo 3', 'Generator', 'Panel Listrik', 'Forklift 1', 'Forklift 2', 'Lainnya'] },
      judul: { type: 'string', required: true, label: 'Judul WO' },
      deskripsi: { type: 'string', required: false, label: 'Deskripsi Masalah' },
      tipe: { type: 'string', required: true, label: 'Tipe', options: ['Preventive', 'Corrective', 'Predictive', 'Emergency'] },
      prioritas: { type: 'string', required: true, label: 'Prioritas', options: ['Low', 'Medium', 'High', 'Critical'] },
      assigned_to: { type: 'string', required: false, label: 'Ditugaskan ke' },
      due_date: { type: 'date', required: false, label: 'Due Date' }
    }
  },
  
  update_wo: {
    id: 'update_wo',
    label: 'Update Work Order',
    description: 'Update status Work Order',
    module: 'maintenance',
    category: 'write',
    riskLevel: 'medium',
    params: {
      wo_number: { type: 'string', required: true, label: 'Nomor WO' },
      status: { type: 'string', required: true, label: 'Status', options: ['Open', 'In Progress', 'Completed', 'Cancelled'] },
      completion_notes: { type: 'string', required: false, label: 'Catatan Penyelesaian' },
      actual_cost: { type: 'number', required: false, label: 'Biaya Aktual' }
    }
  },
  
  add_spare_part: {
    id: 'add_spare_part',
    label: 'Tambah Spare Part',
    description: 'Menambahkan spare part baru ke inventaris',
    module: 'spareparts',
    category: 'write',
    riskLevel: 'low',
    params: {
      nama_item: { type: 'string', required: true, label: 'Nama Item' },
      kategori: { type: 'string', required: true, label: 'Kategori', options: ['Bearing', 'Belt', 'Seal', 'Filter', 'Elektrikal', 'Mekanikal', 'Lainnya'] },
      stok: { type: 'number', required: true, label: 'Stok' },
      min_stok: { type: 'number', required: false, label: 'Min Stok' },
      satuan: { type: 'string', required: false, label: 'Satuan', options: ['Pcs', 'Set', 'Unit', 'm', 'L', 'kg', 'Roll', 'Box'] },
      lokasi_gudang: { type: 'string', required: false, label: 'Lokasi Gudang' },
      harga_satuan: { type: 'number', required: false, label: 'Harga Satuan' },
      part_mesin: { type: 'string', required: false, label: 'Part Mesin' },
      catatan: { type: 'string', required: false, label: 'Catatan' }
    }
  },
  
  check_stock: {
    id: 'check_stock',
    label: 'Cek Stok',
    description: 'Cek stok spare part, termasuk yang rendah',
    module: 'spareparts',
    category: 'read',
    riskLevel: 'low',
    params: {
      nama_item: { type: 'string', required: false, label: 'Nama Item (kosongkan untuk cek semua yang rendah)' }
    }
  },
  
  log_team_activity: {
    id: 'log_team_activity',
    label: 'Catat Kegiatan Tim',
    description: 'Mencatat kegiatan tim harian',
    module: 'team',
    category: 'write',
    riskLevel: 'low',
    params: {
      karyawan: { type: 'string', required: true, label: 'Nama Karyawan' },
      kegiatan: { type: 'string', required: true, label: 'Deskripsi Kegiatan' },
      kategori: { type: 'string', required: true, label: 'Kategori', options: ['Produksi', 'Maintenance', 'Inspeksi', 'Meeting', 'Lainnya'] },
      lembur: { type: 'boolean', required: false, label: 'Lembur' },
      catatan: { type: 'string', required: false, label: 'Catatan' }
    }
  },
  
  create_po: {
    id: 'create_po',
    label: 'Buat Purchase Order',
    description: 'Membuat Purchase Order untuk pembelian',
    module: 'purchasing',
    category: 'write',
    riskLevel: 'high',
    params: {
      item: { type: 'string', required: true, label: 'Nama Item' },
      supplier: { type: 'string', required: true, label: 'Supplier' },
      jumlah: { type: 'number', required: true, label: 'Jumlah' },
      satuan: { type: 'string', required: false, label: 'Satuan' },
      harga_satuan: { type: 'number', required: false, label: 'Harga Satuan' }
    }
  },
  
  check_overdue_wo: {
    id: 'check_overdue_wo',
    label: 'Cek WO Overdue',
    description: 'Cek Work Order yang sudah melewati due date',
    module: 'maintenance',
    category: 'read',
    riskLevel: 'low',
    params: {}
  },
  
  generate_report: {
    id: 'generate_report',
    label: 'Generate Laporan',
    description: 'Generate laporan untuk modul tertentu',
    module: 'reports',
    category: 'read',
    riskLevel: 'low',
    params: {
      module: { type: 'string', required: true, label: 'Modul', options: ['spare-parts', 'team', 'maintenance', 'produksi', 'keuangan', 'hse', 'hr', 'purchasing', 'distribusi'] },
      period: { type: 'string', required: false, label: 'Periode', options: ['harian', 'mingguan', 'bulanan'] }
    }
  },
  
  check_production_anomaly: {
    id: 'check_production_anomaly',
    label: 'Cek Anomali Produksi',
    description: 'Cek apakah ada anomali produksi (output di bawah target)',
    module: 'production',
    category: 'read',
    riskLevel: 'low',
    params: {}
  },
  
  run_workflow: {
    id: 'run_workflow',
    label: 'Jalankan Workflow',
    description: 'Jalankan workflow otomatis (rantai aksi)',
    module: 'agent',
    category: 'workflow',
    riskLevel: 'high',
    params: {
      workflow_id: { type: 'string', required: true, label: 'ID Workflow', options: ['low_stock_auto_order', 'overdue_wo_escalation', 'production_anomaly_alert', 'daily_checkup'] },
      params: { type: 'object', required: false, label: 'Parameter Tambahan' }
    }
  }
};

/**
 * Definisi workflow yang bisa dijalankan oleh AI Agent
 * Workflow adalah rantai aksi yang dijalankan berurutan
 */
const AGENT_WORKFLOWS = {
  low_stock_auto_order: {
    id: 'low_stock_auto_order',
    label: 'Auto-Order Stok Rendah',
    description: 'Otomatis buat Purchase Order untuk spare part yang stoknya rendah',
    trigger: 'low_stock',
    steps: [
      { action: 'check_stock', params: {}, description: 'Cek item dengan stok rendah' },
      { action: 'create_po', params: {}, description: 'Buat PO untuk item rendah', usePreviousResult: true }
    ],
    requiresConfirmation: true
  },
  
  overdue_wo_escalation: {
    id: 'overdue_wo_escalation',
    label: 'Eskalasi WO Overdue',
    description: 'Eskalasi dan buat WO darurat untuk WO yang overdue',
    trigger: 'overdue_wo',
    steps: [
      { action: 'check_overdue_wo', params: {}, description: 'Identifikasi WO overdue' },
      { action: 'create_wo', params: { tipe: 'Emergency', prioritas: 'Critical' }, description: 'Buat WO emergency', usePreviousResult: true }
    ],
    requiresConfirmation: true
  },
  
  production_anomaly_alert: {
    id: 'production_anomaly_alert',
    label: 'Alert Anomali Produksi',
    description: 'Alert dan buat WO jika ada anomali produksi',
    trigger: 'production_anomaly',
    steps: [
      { action: 'check_production_anomaly', params: {}, description: 'Cek anomali produksi' },
      { action: 'create_wo', params: { tipe: 'Corrective' }, description: 'Buat WO corrective jika ada masalah mesin', usePreviousResult: true },
      { action: 'log_team_activity', params: { kategori: 'Maintenance' }, description: 'Catat insiden', usePreviousResult: true }
    ],
    requiresConfirmation: true
  },
  
  daily_checkup: {
    id: 'daily_checkup',
    label: 'Cek Harian Rutin',
    description: 'Pengecekan rutin harian: stok, WO overdue, anomali produksi',
    trigger: 'scheduled',
    steps: [
      { action: 'check_stock', params: {}, description: 'Cek stok spare part rendah' },
      { action: 'check_overdue_wo', params: {}, description: 'Cek WO overdue' },
      { action: 'check_production_anomaly', params: {}, description: 'Cek anomali produksi' }
    ],
    requiresConfirmation: false // Read-only checks don't need confirmation
  }
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
    'ocr_parsing': { ttl: 86400, enabled: true },         // 24 jam (dokumen tidak berubah)
    'agent_action_parsing': { ttl: 0, enabled: false },   // Tidak di-cache (konteks unik)
    'agent_check': { ttl: 300, enabled: true }             // 5 menit (data bisa berubah)
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
    },
    // --- NEW: Agent Quick Actions ---
    {
      id: 'agent_daily_check',
      label: '🔍 Cek Harian Agent',
      prompt: 'Jalankan pengecekan harian: cek stok rendah, WO overdue, dan anomali produksi'
    },
    {
      id: 'agent_overdue_wo',
      label: '🚨 WO Overdue',
      prompt: 'Cek apakah ada Work Order yang sudah melewati due date'
    },
    {
      id: 'agent_low_stock',
      label: '📉 Stok Rendah',
      prompt: 'Cek spare part mana saja yang stoknya rendah atau habis'
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
    'generic': 'Terjadi kesalahan pada AI. Silakan coba lagi.',
    'action_failed': 'Aksi gagal dijalankan. Silakan coba lagi atau lakukan manual.',
    'module_not_available': 'Modul yang diperlukan tidak tersedia saat ini.',
    'confirmation_required': 'Aksi ini memerlukan konfirmasi Anda sebelum dijalankan.'
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
  },
  // NEW: Agent-specific keys
  agentState: 'ywm_agent_state',
  agentAlerts: 'ywm_agent_alerts',
  agentAudit: 'ywm_agent_audit'
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
  if (useCase === 'agent_action_parsing') return 0.1;
  
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

/**
 * Mendapatkan definisi aksi agent berdasarkan ID
 * @param {string} actionId - ID aksi
 * @returns {Object|null} Definisi aksi
 */
function getAgentAction(actionId) {
  return AGENT_ACTIONS[actionId] || null;
}

/**
 * Mendapatkan definisi workflow berdasarkan ID
 * @param {string} workflowId - ID workflow
 * @returns {Object|null} Definisi workflow
 */
function getAgentWorkflow(workflowId) {
  return AGENT_WORKFLOWS[workflowId] || null;
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
  
  // NEW: Agent configuration
  AGENT_CONFIG,
  AGENT_ACTIONS,
  AGENT_WORKFLOWS,
  AGENT_ACTION_PARSE_PROMPT,
  AGENT_WORKFLOW_PROMPT,
  
  // Fungsi utility
  getOptimalModel,
  getTemperature,
  getCacheTTL,
  makeCacheKey,
  getErrorMessage,
  getModulePrompt,
  getReportPrompt,
  callWithFallback,
  
  // NEW: Agent utility functions
  getAgentAction,
  getAgentWorkflow
};
