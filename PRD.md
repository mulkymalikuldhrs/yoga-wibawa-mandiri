# 📋 PRD — Product Requirements Document
# PT Yoga Wibawa Mandiri (YWM) Digital Platform

> **Versi:** 5.0.0 | **Terakhir Diperbarui:** 2026-03-05
> **Penulis:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com
> **Lisensi:** MIT License

---

## 1. Ringkasan Produk

PT Yoga Wibawa Mandiri (YWM) Digital Platform adalah platform digital operasional terpadu yang dirancang khusus untuk kebutuhan perusahaan pengantongan Semen Padang di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh, Indonesia. Platform ini mengintegrasikan dashboard operasional berbasis AI, website korporat, dan AI Agent otonom dalam satu ekosistem yang berjalan sepenuhnya tanpa server backend tradisional — mengandalkan Puter.js Cloud OS sebagai infrastruktur utama.

Visi dari produk ini adalah mentransformasi operasional perusahaan pengantongan semen dari pencatatan manual berbasis kertas dan spreadsheet menjadi sistem digital terpadu yang cerdas, real-time, dan proaktif. Dengan AI Agent yang mampu mengeksekusi aksi (bukan hanya berdialog), platform ini melampaui konsep dashboard pasif dan menjadi asisten operasional yang sesungguhnya dapat mengambil keputusan dan menjalankan tugas secara mandiri dengan pengawasan manusia.

Target pengguna utama adalah seluruh lini operasional PT YWM, mulai dari manajemen puncak yang membutuhkan gambaran strategis, supervisor yang mengawasi operasional harian, hingga operator dan teknisi di lapangan yang membutuhkan akses cepat terhadap data dan instruksi kerja. Platform ini dirancang agar bisa diakses dari perangkat apa pun dengan browser — tanpa perlu instalasi, tanpa konfigurasi server, dan tanpa biaya infrastruktur berkelanjutan.

Dengan arsitektur zero server, zero backend, dan zero API key, platform ini membuktikan bahwa solusi enterprise-grade tidak memerlukan infrastruktur yang mahal dan kompleks. Puter.js menyediakan seluruh kebutuhan backend — mulai dari database key-value, penyimpanan file cloud, autentikasi pengguna, hingga akses ke berbagai model AI terkemuka — semua diakses langsung dari sisi klien melalui CDN.

---

## 2. Latar Belakang & Masalah

PT Yoga Wibawa Mandiri beroperasi sebagai perusahaan pengantongan semen (cement bagging) untuk Semen Padang di wilayah Aceh Utara. Lokasi strategis di Pelabuhan Krueng Geukueh memungkinkan penerimaan semen curah melalui kapal, yang kemudian disimpan dalam silo dan dikemas ke dalam zak 40kg dan 50kg menggunakan mesin rotary packer. Proses ini melibatkan rantai operasional yang kompleks: penerimaan curah, penyimpanan silo, pengantongan, quality control, dan distribusi ke pelanggan.

Permasalahan utama yang dihadapi perusahaan adalah ketergantungan pada pencatatan manual dan spreadsheet untuk mengelola operasional harian. Data spare part tersebar di berbagai file Excel yang tidak terpusat, menyebabkan kesulitan dalam melacak ketersediaan komponen kritis dan sering terlambat dalam pemesanan ulang. Work order maintenance masih menggunakan formulir kertas yang rawat hilang dan sulit dilacak progresnya. Pencatatan produksi harian dilakukan secara manual, membuat analisis tren dan identifikasi anomali menjadi sangat lambat dan reaktif.

Dari sisi keamanan kerja, insiden dan near miss sering tidak tercatat dengan baik karena prosedur pelaporan yang rumit. Data keuangan operasional tidak terintegrasi dengan data produksi dan maintenance, sehingga analisis cost per zak dan profit margin harus dilakukan secara manual yang memakan waktu berhari-hari. Koordinasi antar tim — produksi, maintenance, quality, dan logistik — bergantung pada komunikasi verbal dan WhatsApp group yang tidak terstruktur.

Perusahaan juga menghadapi tantangan sumber daya manusia di lokasi Lhokseumawe, dimana ketersediaan tenaga IT profesional terbatas. Implementasi sistem ERP tradisional yang memerlukan server on-premise, database administrator, dan tim IT yang besar bukan merupakan opsi yang realistis. Dibutuhkan solusi yang bisa dioperasikan tanpa infrastruktur server, tanpa konfigurasi teknis yang rumit, namun tetap menyediakan kapabilitas enterprise yang lengkap.

Platform YWM Digital hadir untuk menjawab semua permasalahan tersebut dengan pendekatan revolusioner: memanfaatkan Puter.js sebagai cloud operating system yang menyediakan seluruh kebutuhan infrastruktur secara gratis dan tanpa konfigurasi. AI Agent yang terintegrasi bukan hanya memfasilitasi input data melalui bahasa natural, tetapi juga secara proaktif memantau kondisi operasional dan mengambil tindakan preventif — mengubah paradigma dari reaktif menjadi proaktif.

---

## 3. Tujuan Produk

Tujuan utama dari YWM Digital Platform adalah menyediakan sistem operasional digital yang komprehensif, cerdas, dan nol biaya infrastruktur untuk PT Yoga Wibawa Mandiri. Berikut adalah tujuan terukur beserta Key Performance Indicators (KPI) yang menjadi target pencapaian produk:

**Tujuan Operasional:**
- Menggantikan seluruh pencatatan manual dan spreadsheet dengan sistem digital terpusat yang menyediakan data real-time di 15 modul operasional. Target: minimal 90% data operasional harian tercatat secara digital dalam 3 bulan pertama setelah deployment.
- Mengurangi waktu respon terhadap masalah operasional (kerusakan mesin, stok rendah, insiden HSE) dari rata-rata 4 jam menjadi di bawah 30 menit melalui sistem notifikasi proaktif dan AI Agent monitoring.
- Meningkatkan akurasi data inventaris spare part dari estimasi 70% (karena pencatatan manual yang terlambat) menjadi di atas 98% melalui pencatatan real-time dan smart input berbasis AI.

**Tujuan Efisiensi:**
- Menurunkan downtime mesin sebesar 20% melalui predictive maintenance yang dijalankan AI Agent dan perencanaan preventive maintenance yang terjadwal otomatis. KPI: rata-rata downtime bulanan turun dari 40 jam menjadi di bawah 32 jam.
- Mengoptimalkan tingkat persediaan spare part sehingga mengurangi kejadian stok habis (stockout) dari rata-rata 5 kejadian per bulan menjadi maksimal 1 kejadian per bulan, sekaligus mengurangi modal kerja yang terikat di persediaan berlebih.
- Mempercepat proses pembuatan laporan operasional dari rata-rata 2 hari kerja menjadi kurang dari 5 menit melalui auto-generated reports dengan AI summary.

**Tujuan Adopsi:**
- Mencapai tingkat adopsi pengguna di atas 80% dari seluruh staf operasional dalam 2 bulan pertama, diukur dari frekuensi login dan interaksi harian dengan dashboard.
- Memastikan minimal 50% pengguna aktif memanfaatkan AI Assistant secara mingguan untuk membantu tugas operasional mereka, menunjukkan bahwa fitur AI memberikan nilai nyata.
- Mempertahankan tingkat kepuasan pengguna di atas 4.0 dari skala 5.0 berdasarkan survei berkala, yang menunjukkan bahwa platform benar-benar mempermudah pekerjaan pengguna.

**Tujuan Teknis:**
- Mencapai Lighthouse performance score di atas 90 untuk halaman dashboard utama, memastikan pengalaman pengguna yang responsif bahkan di koneksi internet yang lambat.
- Menjaga uptime platform di atas 99.5% dengan memanfaatkan GitHub Pages CDN dan Puter.js yang memiliki infrastruktur global.
- Memastikan semua data sensitif terlindungi dengan mekanisme RBAC, audit trail, dan sandboxed data storage, dengan target zero data breach selama operasional.

---

## 4. Profil Pengguna

Platform YWM Digital melayani berbagai peran dalam organisasi yang masing-masing memiliki kebutuhan, alur kerja, dan level akses yang berbeda. Berikut adalah persona pengguna utama beserta kebutuhan spesifik mereka:

### 4.1 Manager Operasional

Manager operasional bertanggung jawab atas keseluruhan performa pabrik pengantongan. Mereka membutuhkan gambaran makro (bird's eye view) dari seluruh operasional dalam satu layar — mulai dari produksi harian, biaya operasional, hingga status keamanan. Manager jarang melakukan input data langsung, namun sangat bergantung pada dashboard ringkasan, laporan periodik, dan alert kritis. Mereka mengakses dashboard terutama di awal shift untuk review performa dan di akhir hari untuk evaluasi. Kebutuhan utama: KPI overview dashboard, laporan otomatis (harian/mingguan/bulanan), analisis tren, dan notifikasi untuk event kritis seperti stok habis atau insiden HSE.

### 4.2 Supervisor Shift

Supervisor shift mengawasi operasional harian di lapangan dan menjadi penghubung antara manajemen dan tim operasional. Mereka membutuhkan akses cepat ke data real-time untuk pengambilan keputusan mendadak — seperti mengecek ketersediaan spare part saat mesin bermasalah, atau melihat progres work order yang sedang berjalan. Supervisor juga memerlukan kemampuan untuk membuat work order, mencatat kegiatan tim, dan mengapprove permintaan. Mereka sering mengakses dashboard dari perangkat mobile di area pabrik. Kebutuhan utama: quick action buttons, smart input, notifikasi real-time, dan kemampuan CRUD di modul maintenance, produksi, dan tim.

### 4.3 Operator Mesin

Operator mesin berinteraksi langsung dengan mesin packing setiap hari. Mereka membutuhkan antarmuka yang sederhana dan cepat untuk mencatat data produksi per shift, melaporkan downtime, dan melihat instruksi kerja. Operator mungkin tidak terbiasa dengan sistem digital yang kompleks, sehingga smart input berbasis suara dan bahasa natural menjadi fitur kritis — mereka cukup berbicara "produksi shift pagi 5200 zak, downtime 20 menit" dan sistem otomatis memparse dan menyimpan data. Kebutuhan utama: voice input, form input sederhana, instruksi kerja yang jelas, dan notifikasi ketika ada masalah pada mesin.

### 4.4 Teknisi Maintenance

Teknisi maintenance bertanggung jawab atas perbaikan dan perawatan mesin. Mereka membutuhkan akses ke work order yang ditugaskan, daftar spare part yang tersedia, diagram mesin, dan riwayat perbaikan. Teknisi sering bekerja di bawah tekanan waktu terutama untuk breakdown mendadak, sehingga kemampuan AI Agent untuk otomatis membuat WO dan mengecek ketersediaan spare part sangat bernilai. Kebutuhan utama: work order management, spare part lookup, riwayat maintenance per mesin, dan panduan perbaikan dari AI.

### 4.5 Staf HR & Payroll

Staf HR mengelola data karyawan, absensi, cuti, lembur, dan penggajian. Mereka membutuhkan modul khusus yang mengintegrasikan data kehadiran dengan payroll calculation. Fitur pengajuan cuti digital dan persetujuan berjenjang menggantikan formulir kertas. Kebutuhan utama: manajemen data karyawan, absensi digital, pengajuan cuti/lembur, payroll calculation, dan laporan kehadiran.

### 4.6 Staf Keuangan

Staf keuangan mencatat dan memantau arus kas operasional. Mereka membutuhkan integrasi data dari modul produksi (untuk menghitung cost per zak), maintenance (untuk biaya perbaikan), dan purchasing (untuk hutang supplier). Dashboard keuangan harus menampilkan cashflow real-time, budget vs actual, dan margin analysis. Kebutuhan utama: pencatatan transaksi, budget monitoring, cost per zak analysis, laporan keuangan, dan integrasi data lintas modul.

### 4.7 Safety Officer (Petugas K3)

Safety officer bertanggung jawab atas keselamatan dan kesehatan kerja. Mereka membutuhkan sistem pelaporan insiden yang mudah diakses (termasuk oleh operator di lapangan), inspeksi safety checklist berkala, dan dashboard K3 yang menampilkan metrik keamanan. Fitur pelaporan insiden melalui smart input sangat penting agar insiden dan near miss segera tercatat tanpa prosedur birokrasi yang menghambat. Kebutuhan utama: insiden reporting, inspeksi checklist, K3 dashboard, corrective action tracking, dan laporan HSE.

---

## 5. Arsitektur Sistem

Arsitektur YWM Digital Platform dibangun di atas prinsip zero server, zero backend, dan zero API key — sebuah pendekatan yang revolusioner untuk aplikasi enterprise. Seluruh kebutuhan infrastruktur disediakan oleh Puter.js, sebuah cloud operating system yang bisa diakses langsung dari browser melalui CDN tanpa instalasi atau konfigurasi.

**Komponen Arsitektur Utama:**

| Komponen | Teknologi | Fungsi |
|----------|-----------|--------|
| Frontend Dashboard | Vanilla HTML + CSS + JS | Dashboard operasional 15 modul |
| Frontend Website | React 18.3 + TypeScript 5.5 + Vite 5.4 | Website korporat publik |
| UI Framework | Tailwind CSS + Shadcn/UI | Sistem komponen website |
| Database | Puter KV Store | Penyimpanan data key-value terstruktur |
| File Storage | Puter FS | Cloud storage untuk dokumen dan gambar |
| Autentikasi | Puter Auth | Manajemen pengguna dan sesi |
| AI Engine | Puter AI (GPT-4o-mini, Claude 3.5 Sonnet, Gemini 2.5 Flash, DeepSeek Chat) | Chat, parsing, OCR, TTS, STT |
| Hosting | GitHub Pages | Deployment statis dengan CDN global |

**Alur Data:**
Pengguna membuka dashboard di browser → Puter.js SDK dimuat dari CDN → Autentikasi via Puter Auth → Data dibaca/tulis ke Puter KV Store dengan key terstruktur → File diunggah/diunduh dari Puter FS → AI dipanggil untuk chat, parsing, OCR, dan aksi agent → Semua operasi berjalan di sisi klien tanpa server perantara.

Keunggulan arsitektur ini adalah kesederhanaan deployment dan nol biaya operasional. Tidak ada server yang perlu di-maintain, tidak ada database yang perlu di-backup secara manual, dan tidak ada API key yang bisa bocor. Seluruh data tersimpan di sandbox Puter.js yang terisolasi per aplikasi. Model user-pays memastikan bahwa biaya AI operation ditanggung langsung oleh pengguna ke Puter, bukan oleh pengembang aplikasi — menghilangkan kebutuhan billing system.

Arsitektur ini juga mendukung offline capability parsial: setelah data dimuat ke browser, pengguna bisa tetap melihat data meskipun koneksi terputus sementara. Sinkronisasi otomatis terjadi ketika koneksi pulih. Untuk performa, caching dilakukan di tingkat browser dan KV Store, mengurangi jumlah API call yang tidak perlu.

---

## 6. Fitur Utama

Platform YWM Digital menyediakan 15 modul operasional yang mencakup seluruh aspek operasional perusahaan pengantongan semen. Setiap modul dirancang untuk berdiri sendiri namun saling terintegrasi melalui data layer dan AI Agent.

### 6.1 Beranda (Home)

Beranda adalah pusat komando yang menyajikan gambaran menyeluruh operasional dalam satu layar. Modul ini menampilkan KPI overview cards (produksi hari ini, stok kritis, WO aktif, insiden HSE), quick action buttons untuk tugas-tugas umum, alert panel yang merangkum notifikasi penting, dan welcome banner dengan informasi shift aktif. Beranda juga menampilkan ringkasan grafik produksi 7 hari terakhir dan progress maintenance yang sedang berjalan. Semua data di beranda di-refresh secara berkala untuk memastikan informasi terkini.

### 6.2 Spare Parts

Modul Spare Parts mengelola seluruh inventaris komponen mesin — dari bearing, belt, seal, hingga komponen elektrikal dan consumable. Fitur utama meliputi: data table dengan search dan filter multi-kriteria, form tambah/edit spare part dengan validasi, sistem reorder alert otomatis ketika stok di bawah minimum, visualisasi part-mesin mapping yang menunjukkan hubungan spare part dengan mesin, dan riwayat transaksi masuk/keluar per item. Smart input memungkinkan pencatatan cepat seperti "Bearing 6205 masuk 20 unit dari PT Sinar" yang otomatis diparse oleh AI.

### 6.3 Produksi

Modul Produksi mencatat dan memantau output harian pabrik pengantongan. Setiap shift (pagi, siang, malam) memiliki form input terpisah untuk mencatat target zak, realisasi zak, tonase, downtime, dan penyebab downtime. Modul ini juga menghitung OEE (Overall Equipment Effectiveness) secara otomatis, menampilkan penerimaan semen curah dari kapal ke silo, dan menyediakan shift summary yang membandingkan performa antar shift. Grafik tren produksi harian dan mingguan membantu mengidentifikasi pola dan anomali.

### 6.4 Maintenance

Modul Maintenance mengelola seluruh siklus hidup work order — dari pembuatan, penjadwalan, pelaksanaan, hingga penyelesaian. Mendukung empat tipe maintenance: preventive (terjadwal), corrective (perbaikan), predictive (berbasis AI), dan emergency (darurat). Fitur meliputi: WO list dengan filter status/prioritas/mesin, form pembuatan WO dengan smart input, timeline view per WO, kalender jadwal PM, dan analisis biaya maintenance per periode. AI Agent secara proaktif memantau WO yang overdue dan bisa membuat WO darurat secara otonom.

### 6.5 Tim & Aktivitas

Modul Tim mencatat kegiatan harian setiap tim dan karyawan. Fitur check-in/check-out memungkinkan pencatatan waktu kerja yang akurat, timeline view menampilkan aktivitas kronologis, dan laporan kinerja tim per periode memberikan insight tentang produktivitas. Supervisor bisa melihat tim mana yang sedang aktif, kegiatan apa yang sedang dilakukan, dan apakah ada karyawan yang lembur. Auto timestamp memastikan semua pencatatan memiliki waktu yang akurat dan tidak bisa dimanipulasi.

### 6.6 Quality Control

Modul QC mengelola pengujian kualitas semen per batch, memastikan kepatuhan terhadap standar SNI. Fitur meliputi: pencatatan hasil uji kuat tekan, setting time, dan fineness per batch; SNI compliance dashboard yang menunjukkan persentase batch yang memenuhi standar; trend analysis untuk mengidentifikasi penurunan kualitas; dan alert otomatis ketika hasil pengujian di bawah threshold. Data QC terintegrasi dengan modul Produksi untuk traceability batch ke shift dan mesin.

### 6.7 Safety / HSE

Modul Safety dan HSE (Health, Safety, Environment) menyediakan sistem pelaporan insiden yang mudah diakses, inspeksi safety checklist berkala, dan dashboard K3 (Keselamatan dan Kesehatan Kerja). Fitur meliputi: insiden dan near miss reporting melalui smart input, inspeksi checklist untuk APAR, APD, dan area kerja, corrective action tracking untuk setiap insiden, dan metrik K3 seperti TRIR (Total Recordable Incident Rate) dan lost time injury frequency. Modul ini sangat penting untuk kepatuhan regulasi dan budaya keselamatan perusahaan.

### 6.8 Keuangan

Modul Keuangan mencatat dan menganalisis arus kas operasional perusahaan. Fitur meliputi: pencatatan transaksi (pemasukan dan pengeluaran), cashflow dashboard real-time, budget monitoring vs actual, cost per zak analysis yang mengintegrasikan data produksi dan biaya, dan laporan keuangan per periode. Kategori pengeluaran meliputi operasional, maintenance, gaji, dan lainnya. Dashboard menampilkan rasio keuangan kunci seperti operating ratio dan margin.

### 6.9 HR & Payroll

Modul HR mengelola siklus hidup karyawan dari rekrutmen hingga pengunduran diri. Fitur meliputi: database karyawan dengan informasi lengkap (NIK, jabatan, divisi, kompetensi), absensi digital yang terintegrasi dengan modul Tim, pengajuan cuti dan lembur dengan approval berjenjang, payroll calculation dasar, dan laporan kehadiran per periode. Setiap karyawan memiliki profil yang mencatat skills, sertifikasi, dan riwayat kegiatan.

### 6.10 Purchasing

Modul Purchasing mengelola proses pembelian dari pembuatan Purchase Order hingga penerimaan barang. Fitur meliputi: pembuatan PO dengan nomor auto-generated, supplier directory dengan informasi kontak dan rating, tracking status PO (dibuat, dikirim, diterima, selesai), dan analisis supplier performance. AI Agent bisa otomatis membuat PO ketika mendeteksi stok spare part rendah melalui workflow low_stock_auto_order.

### 6.11 Dokumen & OCR

Modul Dokumen menyediakan pengelolaan dokumen digital dengan kemampuan OCR berbasis AI. Pengguna bisa mengunggah dokumen (invoice, surat jalan, laporan teknis) ke Puter FS, kemudian AI melakukan OCR dan mengekstrak data terstruktur secara otomatis. Fitur meliputi: upload dokumen ke cloud storage, OCR scanning via Puter AI, data extraction yang mengkonversi teks hasil OCR menjadi data terstruktur (nama supplier, items, harga), document version control, dan search dokumen berdasarkan konten.

### 6.12 Laporan

Modul Laporan menghasilkan laporan otomatis dari data di seluruh modul lainnya. AI membuat ringkasan naratif dan rekomendasi untuk setiap laporan. Fitur meliputi: report builder yang bisa dikustomisasi, auto-generated daily/weekly/monthly reports, AI summary yang menyoroti insight penting, export ke PDF dan Excel, dan report templates untuk format laporan standar perusahaan. Setiap laporan bisa di-generate oleh AI Agent melalui perintah suara atau teks.

### 6.13 Notifikasi

Modul Notifikasi mengelola sistem alert real-time untuk event penting di seluruh platform. Notifikasi di-generate secara otomatis ketika: stok spare part di bawah minimum, WO melewati due date, produksi di bawah target, ada insiden HSE baru, atau ada PO yang perlu di-approve. Fitur meliputi: notification center dengan filter dan mark-as-read, TTS (text-to-speech) notifications untuk alert kritis, notification preferences per user, dan riwayat notifikasi yang bisa dicari. AI Agent juga mengirimkan proactive alerts berdasarkan hasil scheduled monitoring.

### 6.14 Analytics

Modul Analytics menyajikan analisis mendalam dan prediksi berbasis AI untuk seluruh aspek operasional. Fitur meliputi: KPI trend analysis dengan grafik interaktif, production analytics (OEE, yield, downtime analysis), financial analytics (margin, cost trends), inventory analytics (turnover rate, aging analysis), dan AI-powered forecasting untuk prediksi demand dan kebutuhan spare part. Dashboard analytics menggunakan CSS charts yang ringan dan responsif, tidak bergantung pada library chart eksternal.

### 6.15 Pengaturan

Modul Pengaturan mengelola konfigurasi platform, manajemen pengguna, dan data management. Fitur meliputi: app configuration (tema, bahasa, preferensi tampilan), user management dengan RBAC (8 level peran dari superadmin hingga viewer), data backup dan restore melalui KV Store export/import, dan audit log viewer yang menampilkan riwayat semua perubahan data. Hanya superadmin dan admin yang bisa mengakses modul ini.

---

## 7. AI Agent System

AI Agent merupakan fitur pembeda utama dari YWM Digital Platform. Berbeda dari chatbot konvensional yang hanya memberikan jawaban tekstual, AI Agent YWM adalah asisten otonom yang mampu mendeteksi maksud pengguna, merencanakan aksi, mengeksekusi perintah, dan memantau kondisi operasional secara proaktif. Agent ini bukan hanya responsif terhadap input pengguna, tetapi juga menjalankan monitoring berkala di latar belakang dan mengirimkan alert ketika mendeteksi anomali.

### 7.1 Kemampuan Aksi (Action Capabilities)

AI Agent mendukung 10 jenis aksi yang bisa dieksekusi, dibagi menjadi tiga kategori:

**Aksi Read-Only (tanpa konfirmasi user):**
- `check_stock` — Mengecek ketersediaan spare part dan mengidentifikasi item dengan stok rendah
- `check_overdue_wo` — Mendeteksi Work Order yang sudah melewati due date
- `check_production_anomaly` — Membandingkan output produksi aktual dengan target dan mengidentifikasi anomali
- `generate_report` — Menghasilkan laporan untuk modul dan periode tertentu

**Aksi Write (memerlukan konfirmasi user):**
- `create_wo` — Membuat Work Order baru di modul maintenance
- `update_wo` — Mengubah status dan informasi Work Order yang sudah ada
- `add_spare_part` — Menambahkan item spare part baru ke inventaris
- `create_po` — Membuat Purchase Order untuk pembelian
- `log_team_activity` — Mencatat kegiatan tim harian

**Aksi Workflow (rantai aksi berurutan):**
- `run_workflow` — Menjalankan workflow otomatis yang terdiri dari beberapa aksi berurutan

### 7.2 Workflow Otonom

Empat workflow telah didefinisikan untuk mengotomasi skenario operasional yang umum:

**Low Stock Auto Order:** Ketika AI Agent mendeteksi stok spare part di bawah minimum, workflow ini secara otomatis mengecek item yang rendah dan membuat Purchase Order untuk pemesanan ulang. Workflow ini memerlukan konfirmasi user sebelum PO dibuat, namun proses identifikasi item berjalan otomatis.

**Overdue WO Escalation:** Ketika ada Work Order yang melewati due date, workflow ini mengidentifikasi WO yang terlambat, mengevaluasi prioritasnya, dan membuat WO emergency untuk yang bersifat kritis. Eskalasi ini memastikan tidak ada masalah maintenance yang terabaikan.

**Production Anomaly Alert:** Ketika output produksi turun di bawah 80% target, workflow ini mengidentifikasi anomali, membuat WO corrective jika ada mesin yang bermasalah, dan mencatat kegiatan insiden. Workflow ini menghubungkan data produksi dengan maintenance secara otomatis.

**Daily Checkup:** Workflow harian yang menjalankan tiga pengecekan read-only secara berurutan: cek stok rendah, cek WO overdue, dan cek anomali produksi. Workflow ini berjalan otomatis setiap 5 menit tanpa memerlukan konfirmasi karena hanya membaca data.

### 7.3 Natural Language Parsing

AI Agent menggunakan pendekatan dua lapis untuk memparse perintah bahasa natural menjadi aksi yang bisa dieksekusi. Lapis pertama adalah keyword-based parsing yang berjalan secara lokal tanpa API call — mendeteksi kata kunci seperti "buat WO", "cek stok", atau "tambah spare part". Lapis kedua menggunakan AI (GPT-4o-mini) untuk parsing yang lebih kompleks ketika keyword matching tidak cukup — misalnya "mesin packer 2 mogok, perlu perbaikan darurat" yang memerlukan pemahaman konteks.

Setiap modul memiliki prompt parser khusus yang mengajarkan AI cara mengkonversi bahasa natural menjadi JSON terstruktur untuk modul tersebut. Misalnya, input "Bearing 6205 masuk 20 unit dari supplier PT Sinar, gudang A2" diparse menjadi `{"module": "spare-parts", "action": "masuk", "data": {"nama_part": "Bearing 6205", "jumlah": 20, "supplier": "PT Sinar", "lokasi_penyimpanan": "Gudang A2"}}`.

### 7.4 Proactive Monitoring

AI Agent menjalankan scheduled monitoring di latar belakang dengan interval 5 menit. Setiap siklus monitoring menjalankan tiga pengecekan: stok rendah, WO overdue, dan anomali produksi. Ketika ditemukan kondisi yang memerlukan perhatian, agent mengirimkan proactive alert ke notification center dan menampilkannya di panel AI. Alert mencakup deskripsi masalah, severity level, dan saran tindakan yang bisa langsung dieksekusi dengan satu klik.

Audit trail mencatat setiap aksi yang dijalankan oleh AI Agent, termasuk aksi yang memerlukan konfirmasi dan yang ditolak oleh user. Mekanisme ini memastikan transparansi dan akuntabilitas — setiap tindakan otonom bisa dilacak dan diaudit. Pengguna bisa mengaktifkan atau menonaktifkan agent mode melalui toggle di panel AI, memberikan kendali penuh atas tingkat otonomi agent.

### 7.5 Model Selection

AI Agent menggunakan strategi model selection yang optimal berdasarkan jenis tugas. Untuk tugas rutin seperti parsing dan klasifikasi, digunakan GPT-4o-mini yang cepat dan ekonomis. Untuk analisis mendalam dan pembuatan laporan, digunakan Claude 3.5 Sonnet yang memiliki kemampuan reasoning lebih baik. Untuk OCR dan analisis dokumen, digunakan Gemini 2.5 Flash yang mendukung multimodal input. Untuk reasoning teknis yang kompleks, digunakan DeepSeek Chat. Strategi ini memastikan keseimbangan antara kualitas output dan efisiensi biaya.

---

## 8. Desain & UX

YWM Digital Platform menggunakan design system Glassmorphic Frosted Glass — estetika visual yang menggabungkan transparansi, blur, dan gradien untuk menciptakan tampilan modern dan profesional. Design system ini diterapkan secara konsisten di seluruh komponen dashboard dan website.

**Prinsip Desain Utama:**

Glassmorphic UI menggunakan `backdrop-filter: blur()` untuk menciptakan efek kaca buram pada kartu dan panel. Latar belakang menggunakan gradien gelap (dark-first design) dengan aksen warna emerald-cyan yang memberikan kesan teknologi dan industri. Setiap elemen interaktif memberikan feedback visual melalui hover effects, transisi halus, dan glow accents.

**Komponen Utama:**

| Komponen | Spesifikasi |
|----------|-------------|
| Card | `background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px` |
| Sidebar | Semi-transparan dengan blur, menu items dengan hover glow effect |
| AI Panel | Slide-in panel dari kanan dengan backdrop blur |
| Form Input | Dark glass input fields dengan label floating |
| Buttons | Gradient buttons (emerald → cyan) dengan hover glow |
| Status Bar | Fixed bottom bar dengan informasi sistem |

**Responsive Design:**
Dashboard menggunakan CSS Grid dan Flexbox yang responsif. Pada layar desktop (>1024px), sidebar dan content ditampilkan berdampingan. Pada tablet (768-1024px), sidebar bisa di-collapse. Pada mobile (<768px), sidebar menjadi hamburger menu dan content mengisi seluruh lebar layar. Semua tabel data menggunakan horizontal scroll pada layar kecil, dan quick action buttons diperbesar untuk touch-friendly interaction.

**Aksesibilitas:**
Platform menerapkan prinsip aksesibilitas dasar: kontras warna yang memadai pada dark theme, focus indicators untuk navigasi keyboard, semantic HTML structure, dan aria labels pada komponen interaktif. Voice input melalui AI Assistant juga berfungsi sebagai fitur aksesibilitas bagi pengguna yang kesulitan mengetik.

---

## 9. Data Model

Data pada YWM Digital Platform disimpan menggunakan Puter KV Store dengan pola key-value terstruktur. Setiap key menggunakan prefix hierarkis yang memudahkan pencarian dan pengelompokan data per modul. Berikut adalah pola key dan struktur data untuk setiap modul:

### 9.1 Pola Key Umum

```
ywm:{module}:{entity}:{id}        — Data entitas individual
ywm:{module}:index:all             — Daftar ID semua entitas dalam modul
ywm:{module}:config:{key}          — Konfigurasi modul
ywm:{module}:stats:{period}        — Statistik agregat per periode
```

### 9.2 Struktur Data Per Modul

**Spare Parts:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:sparepart:item:{kode}` | `ywm:sparepart:item:SP-001` | `{kode, nama_item, kategori, stok, min_stok, satuan, harga_satuan, lokasi_gudang, part_mesin, usage_history[], ...}` |
| `ywm:sparepart:index:all` | — | `["SP-001", "SP-002", ...]` |
| `ywm:sparepart:trx:{id}` | — | `{tipe: "masuk"/"keluar", item_kode, jumlah, referensi, timestamp}` |

**Production:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:production:daily:{date}` | `ywm:production:daily:2026-03-05` | `{date, shifts: {pagi: {target, realisasi, downtime}, ...}, total_zak, total_tonase}` |
| `ywm:production:curah:{date}` | — | `{tanggal, sumber, tonase, silo_tujuan, no_kapal}` |
| `ywm:production:oee:{date}` | — | `{availability, performance, quality, oee_score}` |

**Maintenance:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:maintenance:wo:{nomor}` | `ywm:maintenance:wo:WO-2026-0042` | `{wo_number, judul, mesin, tipe, prioritas, status, timeline[], spare_parts_used[], ...}` |
| `ywm:maintenance:index:all` | — | `["WO-2026-0042", ...]` |

**Team:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:team:activity:{date}` | `ywm:team:activity:2026-03-05` | `{date, activities: [{id, karyawan, kegiatan, kategori, timestamp}]}` |
| `ywm:team:member:{nik}` | — | `{nik, nama, divisi, jabatan, tim_id, skills[]}` |

**Finance:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:finance:trx:{id}` | — | `{tipe, kategori, jumlah, keterangan, referensi, timestamp}` |
| `ywm:finance:monthly:{month}` | — | `{pemasukan_total, pengeluaran_total, transaksi: []}` |

**HSE:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:hse:incident:{id}` | — | `{tipe, lokasi, deskripsi, severity, status, corrective_actions[]}` |
| `ywm:hse:inspection:{id}` | — | `{tipe_inspeksi, area, hasil, tanggal, inspector}` |

**HR:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:hr:employee:{nik}` | — | `{nik, nama_lengkap, jabatan, divisi, status, tanggal_bergabung}` |
| `ywm:hr:attendance:{date}` | — | `{date, records: [{nik, check_in, check_out, status}]}` |
| `ywm:hr:leave:{id}` | — | `{nik, tipe_cuti, tanggal_mulai, durasi, status_approval}` |

**Purchasing:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:purchasing:po:{nomor}` | `ywm:purchasing:po:PO-2026-0001` | `{po_number, item, supplier, jumlah, harga_satuan, total, status}` |
| `ywm:purchasing:supplier:{id}` | — | `{nama, kontak, rating, items_supplied[]}` |

**Documents:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:doc:file:{id}` | — | `{judul, jenis, path_fs, ocr_result, extracted_data, versions[]}` |

**AI Agent:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:agent:state` | — | `{lastCheckTime, actionHistory[], pendingActions[]}` |
| `ywm:agent:alerts` | — | `[{id, type, message, severity, timestamp}]` |
| `ywm:agent:audit` | — | `[{action, params, success, timestamp, userId}]` |
| `ywm_chat_history` | — | `{messages: [{role, content, timestamp, ...}]}` |

**Settings:**
| Key Pattern | Contoh | Isi |
|-------------|--------|-----|
| `ywm:settings:config` | — | `{theme, language, notifications_enabled, ...}` |
| `ywm:settings:users:{username}` | — | `{username, role, permissions[], last_login}` |

---

## 10. Keamanan

Model keamanan YWM Digital Platform dirancang dengan pendekatan defense-in-depth, meskipun berjalan di atas arsitektur tanpa server tradisional. Berikut adalah lapisan-lapisan keamanan yang diterapkan:

### 10.1 Role-Based Access Control (RBAC)

Platform mengimplementasikan 8 level peran dengan permission yang semakin terbatas pada level yang lebih rendah:

| Level | Peran | Akses |
|-------|-------|-------|
| 1 | Superadmin | Akses penuh ke seluruh sistem, termasuk pengaturan dan manajemen user |
| 2 | Admin | Mengelola user, konfigurasi, dan semua data |
| 3 | Manager | Melihat semua data, approve WO/PO/cuti |
| 4 | Supervisor | Mengelola tim, approve permintaan di level shift |
| 5 | Operator | Input produksi, QC, kegiatan harian |
| 6 | Teknisi | Work order, spare part usage |
| 7 | Finance | Akses modul keuangan dan purchasing |
| 8 | Viewer | Dashboard read-only |

RBAC disimpan di Puter KV Store dengan key `ywm:settings:users:{username}`. Setiap modul memeriksa role pengguna sebelum mengizinkan akses — pengguna dengan role yang tidak sesuai tidak akan melihat menu dan data yang tidak relevan dengan perannya.

### 10.2 Audit Trail

Setiap operasi tulis (create, update, delete) pada data dicatat secara otomatis di audit trail. Catatan mencakup: siapa yang melakukan aksi (username dari Puter Auth), kapan (timestamp immutable), apa yang berubah (old value dan new value), dan dari perangkat mana (user agent). Audit trail ini tersimpan di KV Store dan bisa dilihat oleh superadmin melalui modul Pengaturan. AI Agent juga mencatat semua aksinya di audit log terpisah (`ywm:agent:audit`), memastikan transparansi lengkap atas tindakan otonom.

### 10.3 Sandboxed Data

Data aplikasi tersimpan di Puter KV Store yang terisolasi per aplikasi — setiap instance aplikasi Puter memiliki namespace data yang terpisah. Tidak ada cara bagi satu aplikasi untuk mengakses data aplikasi lain. Model user-pays untuk operasi AI juga berarti bahwa tidak ada shared credential atau API key yang bisa bocor — setiap pengguna mengakses AI service dengan identitas Puter mereka sendiri.

### 10.4 Keamanan Input

Semua input pengguna divalidasi sebelum disimpan ke KV Store. Smart input yang diparse oleh AI juga melalui validasi kedua sebelum disimpan. XSS prevention diterapkan dengan sanitasi output yang di-render ke DOM. Karena tidak ada SQL database yang terlibat, risiko SQL injection tidak ada — KV Store menyimpan dan mengambil value berdasarkan key secara langsung tanpa query parsing.

### 10.5 Autentikasi

Puter Auth menyediakan autentikasi bawaan tanpa perlu mengelola password atau session secara manual. Sesi pengguna dikelola oleh Puter.js SDK dan token disimpan secara aman di browser. Logout menghapus sesi sepenuhnya. Karena autentikasi ditangani oleh Puter, risiko kebocoran credential melalui aplikasi diminimalkan — aplikasi tidak pernah menyentuh password pengguna.

---

## 11. Deployment

YWM Digital Platform menggunakan strategi deployment yang sangat sederhana berkat arsitektur zero server. Seluruh aplikasi terdiri dari file statis (HTML, CSS, JS) yang bisa di-host di layanan static hosting manapun.

### 11.1 GitHub Pages (Utama)

Deployment utama dilakukan ke GitHub Pages di URL `https://mulkymalikuldhrs.github.io/yoga-wibawa-mandiri/`. Proses deployment otomatis melalui GitHub Actions: setiap push ke branch `main` memicu workflow yang meng-build website React (Vite build) dan men-deploy seluruh direktori ke GitHub Pages. Dashboard vanilla HTML/CSS/JS bisa dilayani langsung tanpa build step — cukup buka `dashboard/index.html`.

**Struktur deployment:**
```
yoga-wibawa-mandiri/
├── index.html              ← Website korporat (React SPA)
├── assets/                  ← Built assets (JS, CSS)
├── dashboard/
│   ├── index.html          ← Dashboard utama
│   ├── css/                ← Stylesheets
│   ├── js/                 ← JavaScript modules
│   └── assets/             ← Favicon, images
└── public/                  ← Static files
```

### 11.2 Keunggulan Deployment Strategy

- **Zero configuration:** Tidak perlu setup server, database, atau environment variables
- **Zero cost:** GitHub Pages gratis, Puter.js gratis untuk penggunaan dasar
- **Global CDN:** GitHub Pages menggunakan CDN global untuk kecepatan akses di seluruh dunia
- **Version control:** Setiap deployment tercatat di Git history, rollback bisa dilakukan kapan saja
- **HTTPS default:** GitHub Pages menyediakan SSL certificate secara otomatis

### 11.3 Environment

| Environment | URL | Kegunaan |
|-------------|-----|----------|
| Production | `https://mulkymalikuldhrs.github.io/yoga-wibawa-mandiri/` | Aplikasi utama |
| Development | `http://localhost:3000` (npx serve) | Pengembangan lokal |
| Dashboard Only | `file:///path/to/dashboard/index.html` | Dashboard tanpa server |

---

## 12. Roadmap

Pengembangan YWM Digital Platform direncanakan dalam 6 fase yang berurutan, dari fondasi hingga fitur lanjutan. Setiap fase memiliki deliverable yang jelas dan milestone yang terukur.

### Fase 1: Core Dashboard + AI Assistant + Auth (4 minggu)

Fase ini membangun fondasi platform: integrasi Puter.js, sistem autentikasi, AI Assistant dasar, dan glassmorphic design system. Target akhir: pengguna bisa login, melihat dashboard dengan KPI overview, dan berinteraksi dengan AI Assistant melalui chat dan voice input.

### Fase 2: Operational Modules (6 minggu)

Implementasi modul-modul operasional inti: Spare Parts, Team Activity, Maintenance, dan Production. Target akhir: semua data operasional harian bisa dicatat secara digital dan tersimpan di KV Store, notifikasi otomatis untuk reorder point dan WO overdue berfungsi, dan export data ke CSV/Excel tersedia.

### Fase 3: Advanced Modules (6 minggu)

Penambahan modul lanjutan: Finance, HR/Payroll, Safety/HSE, dan Document/OCR. Target akhir: OCR bisa scan dan extract data dari dokumen, keuangan terintegrasi dengan produksi dan maintenance, HSE reporting lengkap dengan corrective actions, dan payroll calculation dasar berfungsi.

### Fase 4: Analytics, Reports & Notifications (4 minggu)

Pembangunan sistem analitik, pelaporan, dan notifikasi komprehensif. Target akhir: dashboard analitik menampilkan insight dari semua modul, laporan bisa di-export dalam berbagai format (PDF, Excel), dan notifikasi real-time untuk event penting.

### Fase 5: Website Upgrade + Integration (4 minggu)

Peningkatan website korporat dan integrasi dengan dashboard. Target akhir: website dan dashboard terintegrasi seamlessly dengan single sign-on, publik bisa melihat KPI ringkasan di website, AI chatbot aktif di website, dan dark mode support.

### Fase 6: Mobile Optimization + PWA (4 minggu)

Optimalisasi pengalaman mobile dan konversi ke Progressive Web App. Target akhir: dashboard bisa diakses dengan nyaman di mobile, PWA bisa di-install di homescreen, mode offline untuk fungsi dasar, dan push notifications berfungsi.

**Tambahan di luar roadmap saat ini (future consideration):**
- IoT Integration — Koneksi ke sensor mesin untuk monitoring real-time
- WhatsApp Business API — Notifikasi dan interaksi melalui WhatsApp
- Digital Twin — Representasi virtual mesin dan fasilitas
- ESG Dashboard — Pelaporan sustainability dan environmental compliance

---

## 13. Metrik Keberhasilan

Keberhasilan YWM Digital Platform diukur melalui kombinasi metrik adopsi, efisiensi operasional, dan kualitas teknis. Metrik-metrik ini dipantau secara berkala dan menjadi dasar untuk iterasi dan perbaikan produk.

### 13.1 Metrik Adopsi Pengguna

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| User Adoption Rate | > 80% staf menggunakan dashboard harian | KV Store activity logs (login frequency) |
| Daily Active Users (DAU) | > 70% dari total pengguna terdaftar | Unique logins per day |
| AI Usage Rate | > 50% user menggunakan AI Assistant mingguan | Chat session count per user |
| Smart Input Usage | > 30% input data menggunakan voice/smart input | Smart input trigger count vs manual form |
| Feature Coverage | > 80% modul diakses minimal sekali per minggu per user | Module access logs |

### 13.2 Metrik Efisiensi Operasional

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| Response Time (insiden → aksi) | < 30 menit | Timestamp antara insiden/report dan tindakan pertama |
| Downtime Mesin | Turun 20% dari baseline | Total downtime hours per bulan |
| Stockout Events | Maksimal 1 per bulan | Count of stok = 0 events |
| Data Completeness | > 90% data operasional tercatat digital | Module coverage audit |
| Report Generation Time | < 5 menit | Waktu dari request sampai laporan selesai |
| WO Overdue Rate | < 10% dari total WO | Percentage of WO melewati due date |

### 13.3 Metrik Teknis

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| Lighthouse Score | > 90 | Lighthouse audit bulanan |
| First Contentful Paint | < 1.5 detik | Lighthouse / Web Vitals |
| Largest Contentful Paint | < 2.5 detik | Lighthouse / Web Vitals |
| Cumulative Layout Shift | < 0.1 | Lighthouse / Web Vitals |
| Platform Uptime | > 99.5% | GitHub Pages status + Puter.js status |
| Zero Data Breach | 0 insiden | Audit keamanan berkala |

### 13.4 Metrik Kepuasan

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| User Satisfaction Score | > 4.0 / 5.0 | Survei pengguna triwulanan |
| NPS (Net Promoter Score) | > 30 | Survei pengguna triwulanan |
| Support Ticket Rate | < 5 per bulan | Count of bug reports / help requests |

---

## 14. Risiko & Mitigasi

Setiap proyek teknologi memiliki risiko yang perlu diidentifikasi dan dimitigasi sejak awal. Berikut adalah risiko-risiko utama yang diantisipasi beserta strategi mitigasinya:

### 14.1 Risiko Teknis

**Ketergantungan pada Puter.js (Single Point of Failure)**
Jika Puter.js mengalami downtime atau mengubah API secara breaking, seluruh platform akan terdampak. Mitigasi: arsitektur modular yang memisahkan data layer dari UI layer, sehingga jika diperlukan migrasi ke backend lain (misalnya Supabase atau Firebase), hanya data layer yang perlu diubah tanpa mengubah UI. Selain itu, caching lokal di browser memungkinkan akses data terbatas meskipun Puter.js sedang tidak bisa diakses.

**Keterbatasan KV Store untuk Query Kompleks**
KV Store tidak mendukung query relasional seperti SQL, sehingga operasi seperti join antar entitas atau filter multi-kriteria harus dilakukan di sisi klien. Mitigasi: penggunaan index keys (`ywm:{module}:index:all`) yang menyimpan daftar ID untuk iterasi, dan pre-computed aggregation keys (`ywm:{module}:stats:{period}`) yang menyimpan hasil perhitungan sehingga tidak perlu query ulang. Untuk dataset besar, pagination dan lazy loading diterapkan.

**Performa AI pada Koneksi Lambat**
Operasi AI memerlukan koneksi internet yang stabil, dan streaming response bisa terputus pada koneksi yang lambat. Mitigasi: fallback ke non-streaming response ketika koneksi lambat, timeout yang wajar dengan retry mechanism, dan keyword-based parsing sebagai fallback lokal ketika AI tidak bisa diakses. Cache juga diterapkan untuk mengurangi API call yang berulang.

### 14.2 Risiko Operasional

**Rendahnya Adopsi Pengguna**
Pengguna mungkin resisten terhadap perubahan dari sistem manual ke digital, terutama operator dan teknisi yang kurang terbiasa dengan teknologi. Mitigasi: desain UI yang intuitif dengan smart input dan voice command yang menyederhanakan input data, training sessions bertahap untuk setiap peran, dan quick action buttons yang mengurangi jumlah klik untuk tugas umum. Pendekatan "start small, grow fast" — mulai dari modul yang paling sering digunakan (produksi dan spare parts) sebelum memperkenalkan modul lainnya.

**Kualitas Data**
Data yang dimasukkan secara manual (bahkan melalui smart input) bisa mengandung kesalahan. Mitigasi: validasi input di setiap form dan smart input parser, AI yang memvalidasi konsistensi data sebelum menyimpan, dan audit trail yang memungkinkan identifikasi dan koreksi data yang salah.

### 14.3 Risiko Keamanan

**Akses Tidak Sah**
Meskipun Puter Auth menyediakan autentikasi yang aman, ada risiko bahwa pengguna dengan role rendah mencoba mengakses data yang tidak seharusnya. Mitigasi: RBAC diterapkan di setiap modul dengan pengecekan ganda (UI-level dan data-level), dan audit trail mencatat setiap percobaan akses yang tidak sah.

**Kehilangan Data**
Data tersimpan di Puter KV Store yang dikelola pihak ketiga, sehingga ada risiko kehilangan data jika terjadi kegagalan infrastruktur. Mitigasi: fitur backup/export di modul Pengaturan yang memungkinkan admin mengekspor seluruh data ke file JSON, dan rencana backup berkala (mingguan) yang disimpan di lokasi terpisah (Puter FS atau local storage).

### 14.4 Risiko Bisnis

**Skalabilitas**
Seiring bertambahnya data, performa KV Store bisa menurun karena semakin banyak key yang harus di-scan. Mitigasi: pola key yang terstruktur dengan prefix membatasi scope scan, pre-computed aggregation mengurangi kebutuhan query real-time, dan arsitektur mendukung migrasi ke database relasional jika diperlukan di masa depan.

**Biaya AI Operation**
Model user-pays di Puter.js berarti pengguna menanggung biaya AI operation langsung ke Puter. Jika penggunaan AI sangat tinggi, biaya bisa menjadi kendala. Mitigasi: model selection strategy yang menggunakan model paling ekonomis untuk setiap tugas, caching untuk mengurangi API call berulang, dan opsi untuk menonaktifkan fitur AI tertentu jika tidak diperlukan.

---

## 15. Lampiran

### Informasi Kontribusi

Proyek ini bersifat open source di bawah lisensi MIT. Kontribusi dari komunitas sangat diterima dan dihargai. Untuk panduan berkontribusi, silakan merujuk ke file [CONTRIBUTING.md](CONTRIBUTING.md) yang tersedia di repositori. Setiap kontributor diharapkan mengikuti code of conduct yang tertera di [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

### Disclaimer

Seluruh konten, kode, dan dokumentasi dalam proyek ini ditujukan **hanya untuk tujuan pendidikan dan penelitian**. Penulis dan kontributor tidak bertanggung jawab atas risiko atau kerugian apa pun yang timbul dari penggunaan perangkat lunak atau informasi yang disediakan. Platform ini bukan merupakan sistem produksi yang certified untuk operasional industri — penggunaan di lingkungan produksi sepenuhnya menjadi tanggung jawab pengguna.

### Teknologi & Referensi

| Teknologi | Versi | Referensi |
|-----------|-------|-----------|
| Puter.js | Latest | https://puter.com |
| React | 18.3 | https://react.dev |
| TypeScript | 5.5 | https://typescriptlang.org |
| Vite | 5.4 | https://vitejs.dev |
| Tailwind CSS | 3.4+ | https://tailwindcss.com |
| Shadcn/UI | Latest | https://ui.shadcn.com |

### Dokumentasi Terkait

| Dokumen | Deskripsi |
|---------|-----------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arsitektur sistem lengkap |
| [DATA_BLUEPRINT.md](docs/DATA_BLUEPRINT.md) | Struktur data dan relasi |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | Referensi API dan KV Store |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Panduan deployment |
| [ROADMAP.md](ROADMAP.md) | Roadmap pengembangan |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat versi |
| [TODO.md](docs/TODO.md) | Daftar tugas master |

🤝 Contributing | Mulky Malikul Dhaher | mulkymalikuldhaher@email.com | Education Purpose | Risiko apapun tidak kita tanggung | MIT License
