-- ============================================================
-- YWM Dashboard — Supabase Database Schema
-- PT. Yoga Wibawa Mandiri — Cement Bagging Company
-- Run this in Supabase SQL Editor
-- ============================================================

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
-- 2. PRODUCTION (Produksi)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS production (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  shift TEXT CHECK (shift IN ('pagi', 'siang', 'malam')),
  mesin TEXT,
  target INTEGER DEFAULT 0,
  aktual INTEGER DEFAULT 0,
  satuan TEXT DEFAULT 'ton',
  kualitas TEXT CHECK (kualitas IN ('A', 'B', 'C')) DEFAULT 'A',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. MAINTENANCE (Perawatan)
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
-- 4. TEAM ACTIVITY (Aktivitas Tim)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama_karyawan TEXT NOT NULL,
  divisi TEXT,
  aktivitas TEXT,
  status TEXT CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha', 'lembur')) DEFAULT 'hadir',
  jam_masuk TIME,
  jam_keluar TIME,
  tanggal DATE DEFAULT CURRENT_DATE,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 5. SAFETY / HSE (Keselamatan)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS safety (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  judul TEXT NOT NULL,
  tanggal DATE DEFAULT CURRENT_DATE,
  lokasi TEXT,
  severity TEXT CHECK (severity IN ('ringan', 'sedang', 'berat', 'fatal')) DEFAULT 'ringan',
  status TEXT CHECK (status IN ('dilaporkan', 'investigasi', 'selesai', 'ditutup')) DEFAULT 'dilaporkan',
  pelapor TEXT,
  korban TEXT,
  deskripsi TEXT,
  tindakan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 6. FINANCE (Keuangan)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  jenis TEXT CHECK (jenis IN ('pemasukan', 'pengeluaran')) DEFAULT 'pemasukan',
  kategori TEXT,
  deskripsi TEXT,
  jumlah NUMERIC(15,2) DEFAULT 0,
  metode_pembayaran TEXT DEFAULT 'transfer',
  referensi TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 7. HR / PAYROLL (SDM)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hr (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT NOT NULL,
  nip TEXT UNIQUE,
  jabatan TEXT,
  divisi TEXT,
  tanggal_masuk DATE,
  gaji_pokok NUMERIC(12,2) DEFAULT 0,
  status TEXT CHECK (status IN ('aktif', 'cuti', 'resign')) DEFAULT 'aktif',
  no_telepon TEXT,
  email TEXT,
  alamat TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 8. NOTIFICATIONS (Notifikasi)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  judul TEXT NOT NULL,
  pesan TEXT,
  tipe TEXT CHECK (tipe IN ('info', 'warning', 'error', 'success', 'ai')) DEFAULT 'info',
  modul TEXT,
  dibaca BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 9. CHAT HISTORY (Riwayat Chat AI)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE production ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

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
    EXECUTE format('CREATE POLICY "Allow public read on %s" ON %I FOR SELECT USING (true)', t, t);
    EXECUTE format('CREATE POLICY "Allow public insert on %s" ON %I FOR INSERT WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY "Allow public update on %s" ON %I FOR UPDATE USING (true)', t, t);
    EXECUTE format('CREATE POLICY "Allow public delete on %s" ON %I FOR DELETE USING (true)', t, t);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_spare_parts_kategori ON spare_parts(kategori);
CREATE INDEX IF NOT EXISTS idx_spare_parts_stok ON spare_parts(stok);
CREATE INDEX IF NOT EXISTS idx_production_tanggal ON production(tanggal);
CREATE INDEX IF NOT EXISTS idx_production_shift ON production(shift);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_prioritas ON maintenance(prioritas);
CREATE INDEX IF NOT EXISTS idx_team_activity_tanggal ON team_activity(tanggal);
CREATE INDEX IF NOT EXISTS idx_safety_severity ON safety(severity);
CREATE INDEX IF NOT EXISTS idx_finance_tanggal ON finance(tanggal);
CREATE INDEX IF NOT EXISTS idx_finance_jenis ON finance(jenis);
CREATE INDEX IF NOT EXISTS idx_hr_status ON hr(status);
CREATE INDEX IF NOT EXISTS idx_notifications_dibaca ON notifications(dibaca);
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);

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
    AND table_name != 'notifications' AND table_name != 'chat_history'
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
-- SEED DATA: Sample records for testing
-- ─────────────────────────────────────────────

-- Sample spare parts
INSERT INTO spare_parts (nama, kode, kategori, stok, stok_minimum, satuan, lokasi, harga, pemasok) VALUES
('Nozzle Packer A1', 'NP-A1', 'packer', 25, 10, 'pcs', 'Gudang A-1', 2500000, 'PT. Suku Cadang Nusantara'),
('Nozzle Packer B2', 'NP-B2', 'packer', 8, 10, 'pcs', 'Gudang A-2', 2500000, 'PT. Suku Cadang Nusantara'),
('Belt Conveyor 50m', 'BC-50', 'conveyor', 3, 2, 'roll', 'Gudang B-1', 15000000, 'PT. Beltindo'),
('Bearing SKF 6308', 'BR-6308', 'bearing', 15, 5, 'pcs', 'Gudang A-3', 850000, 'PT. Bearing Indonesia'),
('Filter Oli Genset', 'FO-GS', 'genset', 12, 5, 'pcs', 'Gudang C-1', 350000, 'CV. Filter Jaya'),
('Seal Hidrolik Packer', 'SH-PK', 'packer', 6, 8, 'pcs', 'Gudang A-1', 1200000, 'PT. Sealing Tech'),
('Roller Conveyor', 'RC-01', 'conveyor', 10, 4, 'pcs', 'Gudang B-2', 3500000, 'PT. Roller Indo'),
('Saklar Limit', 'SL-LM', 'electrical', 20, 8, 'pcs', 'Gudang C-2', 450000, 'PT. Electric Supply');

-- Sample production data (last 7 days)
INSERT INTO production (tanggal, shift, mesin, target, aktual, satuan, kualitas) VALUES
(CURRENT_DATE - 6, 'pagi', 'Packer A', 150, 145, 'ton', 'A'),
(CURRENT_DATE - 6, 'siang', 'Packer A', 150, 148, 'ton', 'A'),
(CURRENT_DATE - 6, 'malam', 'Packer B', 150, 140, 'ton', 'B'),
(CURRENT_DATE - 5, 'pagi', 'Packer A', 150, 152, 'ton', 'A'),
(CURRENT_DATE - 5, 'siang', 'Packer B', 150, 147, 'ton', 'A'),
(CURRENT_DATE - 5, 'malam', 'Packer A', 150, 138, 'ton', 'B'),
(CURRENT_DATE - 4, 'pagi', 'Packer B', 150, 150, 'ton', 'A'),
(CURRENT_DATE - 4, 'siang', 'Packer A', 150, 149, 'ton', 'A'),
(CURRENT_DATE - 4, 'malam', 'Packer B', 150, 142, 'ton', 'B'),
(CURRENT_DATE - 3, 'pagi', 'Packer A', 150, 155, 'ton', 'A'),
(CURRENT_DATE - 3, 'siang', 'Packer B', 150, 146, 'ton', 'A'),
(CURRENT_DATE - 3, 'malam', 'Packer A', 150, 135, 'ton', 'C'),
(CURRENT_DATE - 2, 'pagi', 'Packer B', 150, 148, 'ton', 'A'),
(CURRENT_DATE - 2, 'siang', 'Packer A', 150, 151, 'ton', 'A'),
(CURRENT_DATE - 2, 'malam', 'Packer B', 150, 144, 'ton', 'B'),
(CURRENT_DATE - 1, 'pagi', 'Packer A', 150, 153, 'ton', 'A'),
(CURRENT_DATE - 1, 'siang', 'Packer B', 150, 149, 'ton', 'A'),
(CURRENT_DATE - 1, 'malam', 'Packer A', 150, 141, 'ton', 'B'),
(CURRENT_DATE, 'pagi', 'Packer B', 150, 130, 'ton', 'B');

-- Sample maintenance
INSERT INTO maintenance (judul, mesin, jenis, prioritas, status, tanggal_mulai, teknisi, estimasi_biaya) VALUES
('Perawatan Rutin Packer A Nozzle 1', 'Packer A', 'preventif', 'sedang', 'terjadwal', CURRENT_DATE + 2, 'Ahmad Fauzi', 5000000),
('Ganti Belt Conveyor Utama', 'Conveyor', 'korektif', 'tinggi', 'berjalan', CURRENT_DATE - 1, 'Budi Santoso', 25000000),
('Perbaikan Seal Hidrolik Packer B', 'Packer B', 'darurat', 'kritis', 'berjalan', CURRENT_DATE, 'Rizky Pratama', 8000000),
('Kalibrasi Timbangan Packer', 'Packer A', 'preventif', 'rendah', 'terjadwal', CURRENT_DATE + 7, 'Dimas Arya', 3000000),
('Servis Genset Backup', 'Genset', 'preventif', 'sedang', 'terjadwal', CURRENT_DATE + 5, 'Eko Wahyudi', 7000000);

-- Sample team activity
INSERT INTO team_activity (nama_karyawan, divisi, aktivitas, status, jam_masuk, jam_keluar, tanggal) VALUES
('Ahmad Fauzi', 'Maintenance', 'Perawatan Packer A', 'hadir', '07:00', '15:00', CURRENT_DATE),
('Budi Santoso', 'Maintenance', 'Ganti Belt Conveyor', 'hadir', '07:00', '15:00', CURRENT_DATE),
('Rizky Pratama', 'Maintenance', 'Perbaikan Seal Hidrolik', 'lembur', '07:00', '19:00', CURRENT_DATE),
('Siti Nurhaliza', 'Produksi', 'Operasi Packer A Shift Pagi', 'hadir', '06:00', '14:00', CURRENT_DATE),
('Dewi Sartika', 'Produksi', 'Operasi Packer B Shift Pagi', 'hadir', '06:00', '14:00', CURRENT_DATE),
('Hendra Gunawan', 'Safety', 'Inspeksi Harian', 'hadir', '07:30', '16:00', CURRENT_DATE),
('Maya Putri', 'HR', 'Administrasi Karyawan', 'izin', NULL, NULL, CURRENT_DATE),
('Rudi Hartono', 'Produksi', 'Operator Conveyor', 'sakit', NULL, NULL, CURRENT_DATE);

-- Sample safety incidents
INSERT INTO safety (judul, tanggal, lokasi, severity, status, pelapor, korban, deskripsi, tindakan) VALUES
('Tumpahan Semen di Area Packer', CURRENT_DATE - 3, 'Area Packer A', 'ringan', 'selesai', 'Hendra Gunawan', '-', 'Tumpahan semen kurang lebih 50kg saat pengisian nozzle A2', 'Pembersihan segera, perbaikan nozzle'),
('Kecelakaan Ringan di Conveyor', CURRENT_DATE - 7, 'Area Conveyor', 'sedang', 'investigasi', 'Budi Santoso', 'Rudi Hartono', 'Jari terjepit roller conveyor saat pembersihan', 'P3K, istirahat 2 hari, evaluasi SOP'),
('Kebocoran Silo B Lubang 3', CURRENT_DATE - 1, 'Silo B', 'sedang', 'dilaporkan', 'Ahmad Fauzi', '-', 'Kebocoran semen dari lubang pengisian silo B nomor 3', 'Perbaikan terjadwal besok pagi');

-- Sample finance data
INSERT INTO finance (tanggal, jenis, kategori, deskripsi, jumlah, metode_pembayaran, referensi) VALUES
(CURRENT_DATE - 6, 'pemasukan', 'penjualan', 'Penjualan 450 ton semen 50kg', 337500000, 'transfer', 'INV-2025-001'),
(CURRENT_DATE - 5, 'pengeluaran', 'operasional', 'BBM Genset & Kendaraan', 15000000, 'transfer', 'EXP-2025-001'),
(CURRENT_DATE - 4, 'pengeluaran', 'gaji', 'Gaji karyawan bulan ini', 120000000, 'transfer', 'EXP-2025-002'),
(CURRENT_DATE - 3, 'pemasukan', 'penjualan', 'Penjualan 380 ton semen 40kg', 266000000, 'transfer', 'INV-2025-002'),
(CURRENT_DATE - 2, 'pengeluaran', 'suku_cadang', 'Pembelian Nozzle Packer', 25000000, 'transfer', 'EXP-2025-003'),
(CURRENT_DATE - 1, 'pemasukan', 'penjualan', 'Penjualan 420 ton semen 50kg', 315000000, 'transfer', 'INV-2025-003'),
(CURRENT_DATE, 'pengeluaran', 'perawatan', 'Biaya perbaikan seal hidrolik', 8000000, 'transfer', 'EXP-2025-004');

-- Sample HR
INSERT INTO hr (nama, nip, jabatan, divisi, tanggal_masuk, gaji_pokok, status, no_telepon, email) VALUES
('Ahmad Fauzi', 'YWM-001', 'Teknisi Senior', 'Maintenance', '2020-03-15', 8500000, 'aktif', '082345678901', 'ahmad.fauzi@ywm.co.id'),
('Budi Santoso', 'YWM-002', 'Teknisi', 'Maintenance', '2021-06-01', 7000000, 'aktif', '082345678902', 'budi.santoso@ywm.co.id'),
('Siti Nurhaliza', 'YWM-003', 'Operator Packer', 'Produksi', '2020-09-20', 6500000, 'aktif', '082345678903', 'siti.nurhaliza@ywm.co.id'),
('Hendra Gunawan', 'YWM-004', 'Officer HSE', 'Safety', '2022-01-10', 7500000, 'aktif', '082345678904', 'hendra.gunawan@ywm.co.id'),
('Maya Putri', 'YWM-005', 'Staff HR', 'HR', '2023-04-15', 6000000, 'aktif', '082345678905', 'maya.putri@ywm.co.id'),
('Rizky Pratama', 'YWM-006', 'Teknisi', 'Maintenance', '2022-08-01', 7000000, 'aktif', '082345678906', 'rizky.pratama@ywm.co.id'),
('Rudi Hartono', 'YWM-007', 'Operator Conveyor', 'Produksi', '2023-11-01', 5500000, 'aktif', '082345678907', 'rudi.hartono@ywm.co.id'),
('Dewi Sartika', 'YWM-008', 'Operator Packer', 'Produksi', '2021-12-15', 6500000, 'aktif', '082345678908', 'dewi.sartika@ywm.co.id');

-- Sample notifications
INSERT INTO notifications (judul, pesan, tipe, modul, dibaca) VALUES
('Stok Rendah: Seal Hidrolik Packer', 'Stok Seal Hidrolik Packer (SH-PK) hanya tersisa 6 pcs, di bawah batas minimum 8 pcs. Segera lakukan pemesanan ulang.', 'warning', 'spare-parts', FALSE),
('Perawatan Darurat Packer B', 'Perbaikan Seal Hidrolik Packer B berstatus darurat/kritis dan sedang berjalan. Pastikan pengawasan ketat.', 'error', 'maintenance', FALSE),
('Produksi Shift Malam Menurun', 'Produksi shift malam kemarin hanya 135 ton dari target 150 ton (90%). Perlu evaluasi penyebab.', 'warning', 'production', FALSE),
('Selamat Datang di YWM Dashboard', 'Dashboard AI YWM sudah aktif! Anda bisa bertanya, input data, dan menganalisis operasional langsung dari chat.', 'info', 'ai', FALSE);
