# 📊 DATA BLUEPRINT — PT Yoga Wibawa Mandiri

> **Comprehensive Data Structure Reference** — 12 Pilar Operasional
> **Version:** 2.0.0 | **Last Updated:** 2026-05-25
> **Reference:** Lihat dokumen lengkap di `/download/PT_YWM_Master_Blueprint_Data.docx`

---

## Quick Reference — 12 Pilar Dashboard

| # | Pilar | Tabel Utama | Prioritas |
|---|-------|------------|-----------|
| 1 | Inventaris Spare Part | `spare_parts`, `transaksi_spare_part`, `mesin_spare_part_mapping` | 🔴 Critical |
| 2 | Kegiatan Tim | `tim`, `karyawan`, `kegiatan_harian`, `laporan_kinerja` | 🔴 Critical |
| 3 | Auto Timestamp & Audit Trail | `audit_trail` (trigger-based, universal) | 🔴 Critical |
| 4 | Produksi & Operasional | `produksi`, `penerimaan_curah`, `distribusi` | 🔴 Critical |
| 5 | Maintenance Management | `work_orders`, `spare_part_usage` | 🟠 High |
| 6 | Quality Control | `qc_records` | 🟠 High |
| 7 | Smart AI Customer Service | `interaksi_cs`, `pelanggan` | 🟡 Medium |
| 8 | Real-Time Operations Dashboard | Agregasi dari semua tabel + `sensors` | 🔴 Critical |
| 9 | Predictive Analytics | Output model ML (disimpan di `predictions`) | 🟡 Medium |
| 10 | Digital Twin & IoT | `sensors`, `sensor_readings` | 🟡 Medium |
| 11 | ESG & Sustainability | `env_records` | 🟢 Low |
| 12 | Smart Marketing & CRM | `pelanggan`, `orders`, `interaksi_cs` | 🟡 Medium |
| 13 | Document Management | `dokumen`, `document_versions` | 🟠 High |
| 14 | HR & Payroll | `absensi`, `cuti`, `payroll` | 🟠 High |
| 15 | Safety & HSE | `insiden_hse`, `inspeksi_safety` | 🟠 High |
| 16 | Purchasing & Procurement | `purchase_orders`, `suppliers` | 🟠 High |
| 17 | Financial & Accounting | `transaksi_keuangan` | 🟡 Medium |

---

## Universal Timestamp Fields

Setiap tabel WAJIB memiliki field berikut:

| Field | Type | Default | Keterangan |
|-------|------|---------|------------|
| `id` | UUID | `gen_random_uuid()` | Primary key |
| `created_at` | TIMESTAMPTZ | `NOW()` | Immutable, server-generated |
| `updated_at` | TIMESTAMPTZ | `NOW()` | Auto-update via trigger |
| `created_by` | UUID | `auth.uid()` | User yang membuat |
| `updated_by` | UUID | `auth.uid()` | User yang terakhir update |

---

## Core Table Definitions

### spare_parts

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK, default gen_random_uuid() | ID unik |
| kode_part | TEXT | NOT NULL, UNIQUE | Kode part pabrikan |
| nama_part | TEXT | NOT NULL | Nama spare part |
| kategori | TEXT | CHECK IN ('mekanikal','elektrikal','hidrolik','pneumatik','consumable','safety') | Kategori |
| sub_kategori | TEXT | | Detail kategori |
| merk | TEXT | | Merk pabrikan |
| spesifikasi | JSONB | | Detail teknis |
| satuan | TEXT | NOT NULL | Pcs/Set/m/L/Unit |
| stok_saat_ini | INTEGER | DEFAULT 0 | Stok tersedia |
| stok_minimum | INTEGER | DEFAULT 0 | Reorder threshold |
| stok_maksimum | INTEGER | | Kapasitas simpan |
| reorder_point | INTEGER | | Titik pemesanan ulang |
| lead_time_hari | INTEGER | DEFAULT 0 | Waktu tunggu (hari) |
| harga_satuan | DECIMAL(15,2) | DEFAULT 0 | Harga beli (Rp) |
| lokasi_penyimpanan | TEXT | | Kode rak/gudang |
| supplier_utama | UUID | FK → suppliers.id | Supplier utama |
| kondisi | TEXT | DEFAULT 'baru' | Baru/Bekas/Refurbished |
| + universal fields | | | |

### mesin

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | ID unik |
| kode_mesin | TEXT | NOT NULL, UNIQUE | Kode mesin |
| nama_mesin | TEXT | NOT NULL | Nama mesin |
| tipe_mesin | TEXT | | Model/tipe |
| merk_mesin | TEXT | | Pabrikan |
| lokasi | TEXT | | Area pemasangan |
| tanggal_commissioning | DATE | | Tanggal mulai operasi |
| kapasitas | TEXT | | Kapasitas desain |
| status_operasi | TEXT | DEFAULT 'beroperasi' | Beroperasi/Standby/Maintenance/Rusak |
| jam_operasi_kumulatif | DECIMAL | DEFAULT 0 | Total jam operasi |
| jadwal_pm | JSONB | | Jadwal preventive maintenance |
| + universal fields | | | |

### tim

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | ID unik |
| nama_tim | TEXT | NOT NULL | Nama tim |
| divisi | TEXT | NOT NULL | Produksi/Maintenance/Quality/Logistik/Admin |
| leader_id | UUID | FK → karyawan.id | Leader tim |
| area_operasi | TEXT | | Area tugas |
| shift | TEXT | | Pagi/Siang/Malam/Rotasi |
| jam_mulai_shift | TIME | | Jam mulai |
| jam_selesai_shift | TIME | | Jam selesai |
| target_harian | JSONB | | Target harian |
| status_tim | TEXT | DEFAULT 'aktif' | Aktif/Standby/Off-duty |
| + universal fields | | | |

### karyawan

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | ID unik |
| nik | TEXT | NOT NULL, UNIQUE | Nomor Induk Karyawan |
| nama_lengkap | TEXT | NOT NULL | Nama lengkap |
| jabatan | TEXT | | Jabatan/posisi |
| tim_id | UUID | FK → tim.id | Tim |
| divisi | TEXT | | Divisi |
| level_kompetensi | TEXT | | Junior/Senior/Expert/Supervisor/Manager |
| skills | TEXT[] | | Daftar keahlian |
| sertifikasi | JSONB[] | | Daftar sertifikasi |
| tanggal_bergabung | DATE | | Tanggal mulai bekerja |
| status_kepegawaian | TEXT | DEFAULT 'tetap' | Tetap/Kontrak/Magang |
| + universal fields | | | |

### kegiatan_harian

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | ID unik |
| tim_id | UUID | FK → tim.id | Tim pelaksana |
| pic_id | UUID | FK → karyawan.id | Penanggung jawab |
| tanggal | DATE | NOT NULL | Tanggal kegiatan |
| jam_mulai | TIMESTAMPTZ | | Waktu mulai (auto) |
| jam_selesai | TIMESTAMPTZ | | Waktu selesai (auto) |
| durasi_menit | INTEGER | GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (jam_selesai - jam_mulai))/60) | Otomatis dihitung |
| kategori_kegiatan | TEXT | NOT NULL | Operasi/Maintenance/Inspection/Meeting/Training |
| sub_kategori | TEXT | | Detail kegiatan |
| area | TEXT | | Lokasi |
| deskripsi | TEXT | | Deskripsi kegiatan |
| status | TEXT | DEFAULT 'dijadwalkan' | Dijadwalkan/Berlangsung/Selesai/Dibatalkan |
| hasil_kerja | TEXT | | Output kegiatan |
| kendala | TEXT | | Kendala |
| tindak_lanjut | TEXT | | Tindak lanjut |
| mesin_terkait | UUID[] | | Mesin terkait |
| dokumentasi | TEXT[] | | URL foto/dokumen |
| + universal fields | | | |

### produksi

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | ID unik |
| tanggal | DATE | NOT NULL | Tanggal produksi |
| shift | TEXT | NOT NULL | Pagi/Siang/Malam |
| tim_id | UUID | FK → tim.id | Tim produksi |
| mesin_id | UUID | FK → mesin.id | Mesin packing |
| target_zak | INTEGER | DEFAULT 0 | Target per shift |
| realisasi_zak | INTEGER | DEFAULT 0 | Realisasi |
| target_tonase | DECIMAL(10,2) | DEFAULT 0 | Target tonase |
| realisasi_tonase | DECIMAL(10,2) | DEFAULT 0 | Realisasi tonase |
| jam_mulai | TIMESTAMPTZ | | Waktu mulai (auto) |
| jam_selesai | TIMESTAMPTZ | | Waktu selesai (auto) |
| downtime_menit | INTEGER | DEFAULT 0 | Total downtime |
| penyebab_downtime | TEXT | | Kode penyebab |
| rejection_zak | INTEGER | DEFAULT 0 | Zak ditolak QC |
| yield_persentase | DECIMAL(5,2) | GENERATED ALWAYS AS (CASE WHEN target_zak > 0 THEN (realisasi_zak::DECIMAL/target_zak::DECIMAL)*100 ELSE 0 END) STORED | Otomatis dihitung |
| silo_asal | TEXT | | Silo sumber |
| nomor_batch | TEXT | | Nomor batch |
| + universal fields | | | |

### work_orders

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | ID unik |
| nomor_wo | TEXT | NOT NULL, UNIQUE | Nomor WO (auto-gen) |
| tipe_maintenance | TEXT | NOT NULL | Preventive/Corrective/Predictive/Emergency |
| prioritas | TEXT | DEFAULT 'medium' | Critical/High/Medium/Low |
| mesin_id | UUID | FK → mesin.id | Mesin terkait |
| deskripsi_masalah | TEXT | | Deskripsi |
| pic_teknisi | UUID | FK → karyawan.id | Teknisi |
| tanggal_jadwal | DATE | | Jadwal pelaksanaan |
| waktu_mulai_aktual | TIMESTAMPTZ | | Mulai aktual (auto) |
| waktu_selesai_aktual | TIMESTAMPTZ | | Selesai aktual (auto) |
| durasi_menit | INTEGER | GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (waktu_selesai_aktual - waktu_mulai_aktual))/60) STORED | Otomatis dihitung |
| spare_part_digunakan | JSONB[] | | [{part_id, qty, harga}] |
| biaya_jasa | DECIMAL(15,2) | DEFAULT 0 | Biaya jasa |
| biaya_material | DECIMAL(15,2) | DEFAULT 0 | Biaya material |
| total_biaya | DECIMAL(15,2) | GENERATED ALWAYS AS (biaya_jasa + biaya_material) STORED | Otomatis dihitung |
| status | TEXT | DEFAULT 'dibuat' | Dibuat/Dijadwalkan/Berlangsung/Selesai |
| hasil_kerja | TEXT | | Hasil pengerjaan |
| rekomendasi | TEXT | | Rekomendasi |
| + universal fields | | | |

### audit_trail

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | ID unik |
| tabel | TEXT | NOT NULL | Nama tabel sumber |
| record_id | UUID | NOT NULL | ID record yang berubah |
| aksi | TEXT | NOT NULL | INSERT/UPDATE/DELETE/APPROVE/REJECT |
| field_yang_berubah | TEXT | | Nama field yang berubah |
| nilai_lama | JSONB | | Value sebelum |
| nilai_baru | JSONB | | Value sesudah |
| user_id | UUID | | User yang melakukan (auth.uid()) |
| ip_address | INET | | IP address client |
| user_agent | TEXT | | Browser/device info |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Waktu perubahan |

---

## Relasi Antar Tabel

```
mesin ◄──M:N──► spare_parts         (mesin_spare_part_mapping)
mesin ◄──1:N──► work_orders
mesin ◄──1:N──► sensors
work_orders ◄──1:N──► transaksi_spare_part
tim ◄──1:N──► karyawan
karyawan ◄──1:N──► kegiatan_harian
produksi ◄──1:N──► distribusi
pelanggan ◄──1:N──► distribusi
suppliers ◄──1:N──► purchase_orders
karyawan ◄──1:N──► absensi
karyawan ◄──1:N──► work_orders (sebagai pic_teknisi)
```

---

## ⚠️ Disclaimer

For **Education Purpose** only. **Risiko apapun tidak kita tanggung.**

## 📬 Contact

**Mulky Malikul Dhaher** | mulkymalikuldhaher@email.com
