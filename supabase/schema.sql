-- ============================================================
-- YWM Dashboard — Supabase Database Schema
-- PT. Yoga Wibawa Mandiri — Cement Bagging Company
-- Run this in Supabase SQL Editor
-- ============================================================
-- Updated to match TypeScript types in src/types/dashboard.ts
-- Column names use snake_case, mapped to camelCase in the app layer

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. SPARE PARTS (Suku Cadang)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spare_parts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT NOT NULL,
  kode TEXT UNIQUE,
  kategori TEXT DEFAULT 'umum',
  stok INTEGER DEFAULT 0,
  stok_minimum INTEGER DEFAULT 10,
  satuan TEXT DEFAULT 'pcs',
  lokasi TEXT,
  harga NUMERIC(12,2) DEFAULT 0,
  pemasok TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. MAINTENANCE (Perawatan)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  judul TEXT NOT NULL,
  mesin TEXT,
  jenis TEXT CHECK (jenis IN ('preventif', 'korektif', 'darurat')) DEFAULT 'preventif',
  prioritas TEXT CHECK (prioritas IN ('rendah', 'sedang', 'tinggi', 'kritis')) DEFAULT 'sedang',
  status TEXT CHECK (status IN ('terjadwal', 'berjalan', 'selesai', 'dibatalkan')) DEFAULT 'terjadwal',
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  teknisi TEXT,
  estimasi_biaya NUMERIC(12,2) DEFAULT 0,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. TEAM ACTIVITY (Aktivitas Tim)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama_karyawan TEXT NOT NULL,
  divisi TEXT,
  aktivitas TEXT,
  status TEXT CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha', 'lembur')) DEFAULT 'hadir',
  jam_masuk TEXT,
  jam_keluar TEXT,
  tanggal DATE DEFAULT CURRENT_DATE,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. PISPOT (Pompa Gemik Bearing / Lubrikasi / Pelumasan)
-- Checklist siklus bulanan untuk pelumasan dan perawatan bearing/pompa
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pispot (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama_peralatan TEXT NOT NULL,
  kode_peralatan TEXT,
  lokasi TEXT,
  jenis_pelumas TEXT,
  spesifikasi TEXT,
  volume TEXT,
  periode TEXT DEFAULT 'bulanan',
  bulan TEXT NOT NULL,
  tanggal_pelaksanaan DATE,
  petugas TEXT,
  status TEXT CHECK (status IN ('terjadwal', 'selesai', 'terlewat')) DEFAULT 'terjadwal',
  kondisi TEXT CHECK (kondisi IN ('baik', 'perlu_perhatian', 'rusak')) DEFAULT 'baik',
  catatan TEXT,
  tindak_lanjut TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 5. DOCUMENTS (Dokumen)
-- Matches Document TypeScript interface
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT NOT NULL,
  jenis TEXT CHECK (jenis IN ('kontrak', 'laporan', 'manual', 'sertifikat', 'lainnya')) DEFAULT 'lainnya',
  kategori TEXT,
  ukuran BIGINT DEFAULT 0,
  url TEXT,
  ocr_text TEXT,
  diunggah_oleh TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 6. NOTIFICATIONS (Notifikasi)
-- Updated tipe values to match TypeScript: 'info' | 'peringatan' | 'bahaya' | 'sukses'
-- Added link column (maps to action_url in DB)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  judul TEXT NOT NULL,
  pesan TEXT,
  tipe TEXT CHECK (tipe IN ('info', 'peringatan', 'bahaya', 'sukses')) DEFAULT 'info',
  dibaca BOOLEAN DEFAULT FALSE,
  modul TEXT,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 7. CHAT HISTORY (Riwayat Chat AI)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 8. SILO CALCULATION (Kalkulasi Kekosongan Silo)
-- Matches SiloCalculation TypeScript interface
-- Based on YWM's "Kalkulasi Kekosongan" formula
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS silo_calculation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  silo TEXT CHECK (silo IN ('A', 'B')) NOT NULL,
  tanggal DATE DEFAULT CURRENT_DATE,
  jam TEXT DEFAULT '00:00',
  ukuran JSONB DEFAULT '[]',            -- 7 lubang: array of depth measurements (meters)
  jumlah NUMERIC(10,4) DEFAULT 0,       -- (b) Jumlah 1-7
  tinggi_rata_rata NUMERIC(10,4) DEFAULT 0, -- (c) Tinggi Rata-Rata
  t_silinder NUMERIC(10,4) DEFAULT 0,   -- (d) t Silinder
  t_conis NUMERIC(10,4) DEFAULT 0,      -- (e) t Conis
  volume_silinder NUMERIC(12,3) DEFAULT 0, -- Volume Silinder
  volume_conis NUMERIC(12,3) DEFAULT 0, -- Volume Conis
  volume_total NUMERIC(12,3) DEFAULT 0, -- Total Volume
  kekosongan NUMERIC(12,3) DEFAULT 0,   -- Kekosongan (m³)
  space_silo NUMERIC(12,3) DEFAULT 0,   -- Space Silo setelah dikurangi pengeluaran
  pengeluaran NUMERIC(10,3) DEFAULT 0,  -- Pengeluaran (ton)
  keterangan TEXT,
  petugas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 9. SILO OPNAME (Berita Acara Opname)
-- Matches SiloOpname TypeScript interface
-- Based on YWM's "Berita Acara Opname Silo A & B"
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS silo_opname (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  jam TEXT DEFAULT '00:00',
  kapal TEXT,                            -- nama kapal pengirim semen curah
  -- --- Opname I (Sebelum Bongkar) ---
  opname1_tanggal DATE,
  opname1_jam TEXT,
  opname1_ukuran_a JSONB DEFAULT '[]',   -- 7 lubang Silo A
  opname1_ukuran_b JSONB DEFAULT '[]',   -- 7 lubang Silo B
  opname1_volume_a NUMERIC(12,3) DEFAULT 0,
  opname1_volume_b NUMERIC(12,3) DEFAULT 0,
  opname1_total_volume NUMERIC(12,3) DEFAULT 0,
  -- --- Opname II (Sesudah Bongkar) ---
  opname2_tanggal DATE,
  opname2_jam TEXT,
  opname2_ukuran_a JSONB DEFAULT '[]',   -- 7 lubang Silo A
  opname2_ukuran_b JSONB DEFAULT '[]',   -- 7 lubang Silo B
  opname2_volume_a NUMERIC(12,3) DEFAULT 0,
  opname2_volume_b NUMERIC(12,3) DEFAULT 0,
  opname2_total_volume NUMERIC(12,3) DEFAULT 0,
  -- --- Rekapitulasi ---
  pengeluaran_zak NUMERIC(10,3) DEFAULT 0,        -- ton semen dizakkan
  semen_curah_terbongkar NUMERIC(12,3) DEFAULT 0,  -- m/t semen curah terbongkar dari kapal
  catatan TEXT,
  petugas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE pispot ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_calculation ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_opname ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- PUBLIC POLICIES (for now — internal app)
-- Allow all reads and writes with anon key
-- TODO: Add proper auth for production
-- ─────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    BEGIN
      EXECUTE format('CREATE POLICY "Allow public read on %s" ON %I FOR SELECT USING (true)', t, t);
    EXCEPTION WHEN others THEN NULL;
    END;
    BEGIN
      EXECUTE format('CREATE POLICY "Allow public insert on %s" ON %I FOR INSERT WITH CHECK (true)', t, t);
    EXCEPTION WHEN others THEN NULL;
    END;
    BEGIN
      EXECUTE format('CREATE POLICY "Allow public update on %s" ON %I FOR UPDATE USING (true)', t, t);
    EXCEPTION WHEN others THEN NULL;
    END;
    BEGIN
      EXECUTE format('CREATE POLICY "Allow public delete on %s" ON %I FOR DELETE USING (true)', t, t);
    EXCEPTION WHEN others THEN NULL;
    END;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_spare_parts_kategori ON spare_parts(kategori);
CREATE INDEX IF NOT EXISTS idx_spare_parts_stok ON spare_parts(stok);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_prioritas ON maintenance(prioritas);
CREATE INDEX IF NOT EXISTS idx_team_activity_tanggal ON team_activity(tanggal);
CREATE INDEX IF NOT EXISTS idx_pispot_bulan ON pispot(bulan);
CREATE INDEX IF NOT EXISTS idx_pispot_status ON pispot(status);
CREATE INDEX IF NOT EXISTS idx_pispot_lokasi ON pispot(lokasi);
CREATE INDEX IF NOT EXISTS idx_documents_jenis ON documents(jenis);
CREATE INDEX IF NOT EXISTS idx_notifications_dibaca ON notifications(dibaca);
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_silo_calculation_silo ON silo_calculation(silo);
CREATE INDEX IF NOT EXISTS idx_silo_calculation_tanggal ON silo_calculation(tanggal);
CREATE INDEX IF NOT EXISTS idx_silo_opname_tanggal ON silo_opname(tanggal);
CREATE INDEX IF NOT EXISTS idx_silo_opname_kapal ON silo_opname(kapal);

-- ─────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    BEGIN
      EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
    EXCEPTION WHEN others THEN
      -- trigger already exists
      NULL;
    END;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- SEED DATA: Realistic YWM records
-- ─────────────────────────────────────────────

-- Sample spare parts
INSERT INTO spare_parts (nama, kode, kategori, stok, stok_minimum, satuan, lokasi, harga, pemasok, catatan) VALUES
('Bearing SKF 6205', 'BRG-001', 'Bearing', 15, 5, 'pcs', 'Gudang A-1', 350000, 'PT. Bearing Indonesia', 'Untuk Packer A & B'),
('Belt Conveyor 500mm', 'BLT-001', 'Conveyor', 3, 2, 'meter', 'Gudang B-2', 1200000, 'PT. Belt Solutions', 'Stok menipis'),
('Filter Oli Hydraulic', 'FLT-001', 'Filter', 8, 10, 'pcs', 'Gudang A-2', 275000, 'PT. Filter Mandiri', 'Stok di bawah minimum'),
('Seal Packer Nozzle', 'SLP-001', 'Seal', 24, 10, 'pcs', 'Gudang A-1', 85000, 'PT. Sealing Tech', 'Kompatibel nozzle A1-A4, B1-B4'),
('Motor Elektrik 7.5kW', 'MOT-001', 'Motor', 2, 1, 'unit', 'Gudang C-1', 8500000, 'PT. Indodaya Electric', 'Spare motor conveyor'),
('Roller Conveyor Ø89', 'RLR-001', 'Conveyor', 1, 3, 'pcs', 'Gudang B-1', 450000, 'PT. Belt Solutions', 'Stok di bawah minimum'),
('Gearbox Reducer 1:40', 'GRB-001', 'Gearbox', 1, 1, 'unit', 'Gudang C-2', 15000000, 'PT. Nordion Gear', 'Untuk Packer A'),
('V-Belt B-68', 'VBL-001', 'Belt', 12, 6, 'pcs', 'Gudang A-3', 120000, 'PT. Belt Solutions', 'V-belt untuk motor packer');

-- Sample maintenance
INSERT INTO maintenance (judul, mesin, jenis, prioritas, status, tanggal_mulai, tanggal_selesai, teknisi, estimasi_biaya, catatan) VALUES
('Ganti Bearing Packer A2', 'Packer A', 'korektif', 'tinggi', 'berjalan', CURRENT_DATE, NULL, 'Budi Santoso', 1500000, 'Bearing berbunyi abnormal'),
('Service Rutin Conveyor #3', 'Conveyor 3', 'preventif', 'sedang', 'terjadwal', CURRENT_DATE + 5, NULL, 'Eko Prasetyo', 2500000, 'Service berkala bulanan'),
('Perbaikan Nozzle B3 Bocor', 'Packer B', 'darurat', 'kritis', 'berjalan', CURRENT_DATE, NULL, 'Budi Santoso', 800000, 'Nozzle bocor, semen tumpah'),
('Kalibrasi Timbangan Packer', 'Packer A', 'preventif', 'sedang', 'selesai', CURRENT_DATE - 2, CURRENT_DATE - 2, 'Eko Prasetyo', 500000, 'Kalibrasi selesai, akurasi ±0.2%'),
('Ganti Oli Gearbox Packer B', 'Packer B', 'preventif', 'rendah', 'terjadwal', CURRENT_DATE + 10, NULL, 'Budi Santoso', 1200000, 'Penggantian oli berkala 6 bulan');

-- Sample team activity
INSERT INTO team_activity (nama_karyawan, divisi, aktivitas, status, jam_masuk, jam_keluar, tanggal, catatan) VALUES
('Ahmad Fauzi', 'Produksi', 'Operator Packer A', 'hadir', '07:00', '15:00', CURRENT_DATE, ''),
('Budi Santoso', 'Perawatan', 'Teknisi Maintenance', 'hadir', '07:00', '15:00', CURRENT_DATE, ''),
('Citra Dewi', 'Keuangan', 'Staff Administrasi', 'hadir', '08:00', '16:00', CURRENT_DATE, ''),
('Dian Purnama', 'Produksi', 'Operator Packer B', 'lembur', '07:00', '19:00', CURRENT_DATE, 'Lembur shift malam'),
('Eko Prasetyo', 'Perawatan', 'Kepala Teknisi', 'izin', '-', '-', CURRENT_DATE, 'Keperluan keluarga'),
('Fitri Handayani', 'SDM', 'HR Manager', 'sakit', '-', '-', CURRENT_DATE, 'Sakit demam'),
('Gunawan Wibowo', 'Produksi', 'Operator Conveyor', 'alpha', '-', '-', CURRENT_DATE, 'Tidak ada kabar');

-- Sample Pispot data
INSERT INTO pispot (nama_peralatan, kode_peralatan, lokasi, jenis_pelumas, spesifikasi, volume, periode, bulan, tanggal_pelaksanaan, petugas, status, kondisi, catatan, tindak_lanjut) VALUES
('Bearing Packer A - Nozzle 1', 'BRG-PA1', 'Packer A', 'Lithium Grease EP2', 'NLGI Grade 2, -20°C s/d 130°C', '50 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE - 25, 'Budi Santoso', 'selesai', 'baik', 'Pelumasan rutin bulanan', ''),
('Bearing Packer A - Nozzle 2', 'BRG-PA2', 'Packer A', 'Lithium Grease EP2', 'NLGI Grade 2, -20°C s/d 130°C', '50 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE - 25, 'Budi Santoso', 'selesai', 'baik', '', ''),
('Bearing Packer A - Nozzle 3', 'BRG-PA3', 'Packer A', 'Lithium Grease EP2', 'NLGI Grade 2, -20°C s/d 130°C', '50 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE + 5, 'Eko Prasetyo', 'terjadwal', 'baik', '', ''),
('Bearing Packer A - Nozzle 4', 'BRG-PA4', 'Packer A', 'Lithium Grease EP2', 'NLGI Grade 2, -20°C s/d 130°C', '50 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE + 5, 'Eko Prasetyo', 'terjadwal', 'baik', '', ''),
('Bearing Packer B - Nozzle 1', 'BRG-PB1', 'Packer B', 'Lithium Grease EP2', 'NLGI Grade 2, -20°C s/d 130°C', '50 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE - 20, 'Ahmad Fauzi', 'selesai', 'perlu_perhatian', 'Sedikit berisik, perlu pemantauan', 'Cek ulang minggu depan'),
('Bearing Packer B - Nozzle 2', 'BRG-PB2', 'Packer B', 'Lithium Grease EP2', 'NLGI Grade 2, -20°C s/d 130°C', '50 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE - 20, 'Ahmad Fauzi', 'selesai', 'baik', '', ''),
('Bearing Packer B - Nozzle 3', 'BRG-PB3', 'Packer B', 'Lithium Grease EP2', 'NLGI Grade 2, -20°C s/d 130°C', '50 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE + 8, 'Budi Santoso', 'terjadwal', 'baik', '', ''),
('Bearing Packer B - Nozzle 4', 'BRG-PB4', 'Packer B', 'Lithium Grease EP2', 'NLGI Grade 2, -20°C s/d 130°C', '50 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE + 8, 'Budi Santoso', 'terjadwal', 'baik', '', ''),
('Bearing Conveyor Utama', 'BRG-CV01', 'Conveyor Utama', 'Lithium Grease EP3', 'NLGI Grade 3, -10°C s/d 150°C', '100 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE - 27, 'Eko Prasetyo', 'selesai', 'baik', '', ''),
('Bearing Conveyor Return', 'BRG-CV02', 'Conveyor Return', 'Lithium Grease EP3', 'NLGI Grade 3, -10°C s/d 150°C', '100 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE - 27, 'Eko Prasetyo', 'selesai', 'baik', '', ''),
('Pompa Hidrolik Packer A', 'PMP-HYD-PA', 'Packer A', 'Hydraulic Oil HLP 46', 'ISO VG 46, -15°C s/d 80°C', '5 liter', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE + 2, 'Ahmad Fauzi', 'terjadwal', 'baik', 'Cek level oli', ''),
('Pompa Hidrolik Packer B', 'PMP-HYD-PB', 'Packer B', 'Hydraulic Oil HLP 46', 'ISO VG 46, -15°C s/d 80°C', '5 liter', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE + 2, 'Ahmad Fauzi', 'terlewat', 'perlu_perhatian', 'Pelumasan terlewat, ada kebocoran minor', 'Segera lakukan pelumasan dan cek kebocoran'),
('Gearbox Reducer Packer A', 'GRB-PA', 'Packer A', 'Gear Oil GL-5 85W-90', 'API GL-5, SAE 85W-90', '2 liter', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE + 12, 'Budi Santoso', 'terjadwal', 'baik', 'Cek kualitas oli', ''),
('Motor Conveyor Drive', 'MOT-CV-DRV', 'Conveyor Drive', 'Lithium Grease EP2', 'NLGI Grade 2', '30 gram', 'bulanan', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_DATE - 22, 'Eko Prasetyo', 'selesai', 'baik', '', '');

-- Sample documents
INSERT INTO documents (nama, jenis, kategori, ukuran, url, ocr_text, diunggah_oleh, catatan) VALUES
('SOP Pengantongan Semen', 'manual', 'SOP', 2500000, '#', '', 'Eko Prasetyo', 'SOP terbaru revisi 2026'),
('Kontrak Penjualan PT Bangun Jaya', 'kontrak', 'Penjualan', 1500000, '#', '', 'Citra Dewi', 'Kontrak 1 tahun'),
('Laporan Keuangan Februari 2026', 'laporan', 'Keuangan', 3200000, '#', '', 'Citra Dewi', 'Laporan bulanan'),
('Sertifikat ISO 9001:2015', 'sertifikat', 'Sertifikasi', 800000, '#', '', 'Fitri Handayani', 'Berlaku s/d 2027');

-- Sample notifications (using updated tipe values)
INSERT INTO notifications (judul, pesan, tipe, modul, dibaca, action_url) VALUES
('Stok Filter Oli di Bawah Minimum', 'Filter Oli Hydraulic (FLT-001) stok saat ini 8 pcs, minimum 10 pcs. Segera lakukan pemesanan ulang.', 'peringatan', 'spare-parts', FALSE, '/dashboard?module=spare-parts'),
('Work Order Kritis Aktif', 'Perbaikan Nozzle B3 Bocor sedang berjalan. Prioritas: KRITIS. Teknisi: Budi Santoso.', 'bahaya', 'maintenance', FALSE, '/dashboard?module=maintenance'),
('Pelumasan Pompa Hidrolik Packer B Terlewat', 'Pelumasan Pompa Hidrolik Packer B (PMP-HYD-PB) bulan ini terlewat. Segera lakukan pelumasan.', 'bahaya', 'pispot', FALSE, '/dashboard?module=pispot'),
('Karyawan Alpha Hari Ini', 'Gunawan Wibowo (Operator Conveyor) tidak hadir tanpa keterangan hari ini.', 'peringatan', 'team-activity', FALSE, '/dashboard?module=team-activity'),
('Jadwal Perawatan Conveyor #3', 'Service rutin Conveyor #3 dijadwalkan. Estimasi biaya Rp 2.500.000.', 'info', 'maintenance', TRUE, '/dashboard?module=maintenance');

-- Sample silo calculation data
INSERT INTO silo_calculation (silo, tanggal, jam, ukuran, jumlah, tinggi_rata_rata, t_silinder, t_conis, volume_silinder, volume_conis, volume_total, kekosongan, space_silo, pengeluaran, keterangan, petugas) VALUES
('A', CURRENT_DATE, '07:30', '[5.1, 5.55, 7.0, 7.0, 6.6, 5.65, 5.0]', 41.9, 5.9857, 12.0143, 4.6, 1747.117, 222.962, 1970.079, 505.575, 505.575, 0, 'Sebelum bongkar', 'Hendra Wijaya'),
('B', CURRENT_DATE, '07:30', '[7.7, 9.2, 10.8, 11.6, 11.35, 9.75, 7.75]', 68.15, 9.7357, 8.2643, 2.9, 1201.792, 140.563, 1342.355, 1049.178, 1049.178, 0, 'Sebelum bongkar', 'Hendra Wijaya'),
('A', CURRENT_DATE, '15:00', '[1.9, 1.75, 2.1, 2.2, 2.0, 1.9, 1.9]', 13.75, 1.9643, 16.0357, 4.6, 2331.914, 222.962, 2554.876, 0, -100, 100, 'Sesudah bongkar', 'Ahmad Fauzi'),
('B', CURRENT_DATE, '15:00', '[1.65, 1.7, 1.75, 1.9, 1.85, 1.75, 1.6]', 12.2, 1.7429, 16.2571, 2.9, 2364.114, 140.563, 2504.677, 0, -50, 50, 'Sesudah bongkar', 'Dian Purnama');

-- Sample silo opname data
INSERT INTO silo_opname (tanggal, jam, kapal, opname1_tanggal, opname1_jam, opname1_ukuran_a, opname1_ukuran_b, opname1_volume_a, opname1_volume_b, opname1_total_volume, opname2_tanggal, opname2_jam, opname2_ukuran_a, opname2_ukuran_b, opname2_volume_a, opname2_volume_b, opname2_total_volume, pengeluaran_zak, semen_curah_terbongkar, catatan, petugas) VALUES
(CURRENT_DATE, '15:00', 'MV MADELIN FIRST', CURRENT_DATE, '01:00', '[5.1, 5.55, 7.0, 7.0, 6.6, 5.65, 5.0]', '[7.7, 9.2, 10.8, 11.6, 11.35, 9.75, 7.75]', 1970.079, 1342.355, 3312.434, CURRENT_DATE, '15:00', '[1.9, 1.75, 2.1, 2.2, 2.0, 1.9, 1.9]', '[1.65, 1.7, 1.75, 1.9, 1.85, 1.75, 1.6]', 2554.876, 2504.677, 5059.553, 230, 1977.119, 'Pembongkaran semen curah dari kapal', 'Hendra Wijaya');
