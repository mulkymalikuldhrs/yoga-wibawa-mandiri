-- ============================================================
-- YWM AI Dashboard — Supabase Database Schema
-- PT. Yoga Wibawa Mandiri
-- RUN THIS IN: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════════
-- SPARE PARTS (Suku Cadang)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spare_parts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT NOT NULL,
  kode TEXT NOT NULL,
  kategori TEXT DEFAULT '',
  stok INTEGER DEFAULT 0,
  stok_minimum INTEGER DEFAULT 0,
  satuan TEXT DEFAULT 'pcs',
  lokasi TEXT DEFAULT '',
  harga NUMERIC DEFAULT 0,
  pemasok TEXT DEFAULT '',
  catatan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- TEAM ACTIVITIES (Aktivitas Tim)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS team_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama_karyawan TEXT NOT NULL,
  divisi TEXT DEFAULT '',
  aktivitas TEXT DEFAULT '',
  status TEXT DEFAULT 'hadir' CHECK (status IN ('hadir','izin','sakit','alpha','lembur')),
  jam_masuk TEXT DEFAULT '',
  jam_keluar TEXT DEFAULT '',
  tanggal DATE DEFAULT CURRENT_DATE,
  catatan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- MAINTENANCE RECORDS (Perawatan)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  judul TEXT NOT NULL,
  mesin TEXT DEFAULT '',
  jenis TEXT DEFAULT 'preventif' CHECK (jenis IN ('preventif','korektif','darurat')),
  prioritas TEXT DEFAULT 'sedang' CHECK (prioritas IN ('rendah','sedang','tinggi','kritis')),
  status TEXT DEFAULT 'terjadwal' CHECK (status IN ('terjadwal','berjalan','selesai','dibatalkan')),
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  teknisi TEXT DEFAULT '',
  estimasi_biaya NUMERIC DEFAULT 0,
  catatan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- SAFETY INCIDENTS (Keselamatan / HSE)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  judul TEXT NOT NULL,
  tanggal DATE DEFAULT CURRENT_DATE,
  lokasi TEXT DEFAULT '',
  severity TEXT DEFAULT 'ringan' CHECK (severity IN ('ringan','sedang','berat','fatal')),
  status TEXT DEFAULT 'dilaporkan' CHECK (status IN ('dilaporkan','investigasi','selesai','ditutup')),
  pelapor TEXT DEFAULT '',
  korban TEXT DEFAULT '',
  deskripsi TEXT DEFAULT '',
  tindakan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- DOCUMENTS (Dokumen & OCR)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT NOT NULL,
  jenis TEXT DEFAULT 'laporan' CHECK (jenis IN ('kontrak','laporan','manual','sertifikat','lainnya')),
  kategori TEXT DEFAULT '',
  ukuran INTEGER DEFAULT 0,
  url TEXT DEFAULT '',
  ocr_text TEXT DEFAULT '',
  diunggah_oleh TEXT DEFAULT '',
  catatan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- NOTIFICATIONS (Notifikasi)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  judul TEXT NOT NULL,
  pesan TEXT DEFAULT '',
  tipe TEXT DEFAULT 'info' CHECK (tipe IN ('info','peringatan','bahaya','sukses')),
  dibaca BOOLEAN DEFAULT FALSE,
  modul TEXT DEFAULT '',
  link TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- SILO DATA (Data Silo)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS silo_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Silo A',
  capacity NUMERIC DEFAULT 500,
  current NUMERIC DEFAULT 0,
  holes INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- OPNAME RECORDS (Stok Opname)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS opname_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  kategori TEXT DEFAULT '',
  item TEXT NOT NULL,
  jumlah NUMERIC DEFAULT 0,
  satuan TEXT DEFAULT 'pcs',
  keterangan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- PISPOT RECORDS (Produksi Packer)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pispot_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  shift TEXT DEFAULT 'pagi' CHECK (shift IN ('pagi','siang','malam')),
  packer TEXT DEFAULT 'A',
  nozzle TEXT DEFAULT '',
  produksi_zak INTEGER DEFAULT 0,
  produksi_ton NUMERIC DEFAULT 0,
  catatan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- CHAT MESSAGES (Riwayat Chatbot)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  session_id TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- PRODUCTION DATA (Data Produksi Bulanan)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS production_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bulan TEXT NOT NULL,
  zak INTEGER DEFAULT 0,
  curah INTEGER DEFAULT 0,
  tahun INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- ENABLE ROW LEVEL SECURITY + POLICIES
-- ══════════════════════════════════════════════════════════
DO $$
DECLARE
  t TEXT;
  policy_exists INTEGER;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN ('spare_parts','team_activities','maintenance_records','safety_incidents','documents','notifications','silo_data','opname_records','pispot_records','chat_messages','production_data')
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    SELECT COUNT(*) INTO policy_exists FROM pg_policies WHERE tablename = t AND policyname = 'Allow all for anon';
    IF policy_exists = 0 THEN
      EXECUTE format('CREATE POLICY "Allow all for anon" ON %I FOR ALL USING (true) WITH CHECK (true);', t);
    END IF;
    SELECT COUNT(*) INTO policy_exists FROM pg_policies WHERE tablename = t AND policyname = 'Allow all for authenticated';
    IF policy_exists = 0 THEN
      EXECUTE format('CREATE POLICY "Allow all for authenticated" ON %I FOR ALL USING (true) WITH CHECK (true);', t);
    END IF;
  END LOOP;
END $$;

-- ══════════════════════════════════════════════════════════
-- SEED INITIAL DATA
-- ══════════════════════════════════════════════════════════

-- Silo data
INSERT INTO silo_data (name, capacity, current, holes) 
SELECT 'Silo A', 500, 350, 7 WHERE NOT EXISTS (SELECT 1 FROM silo_data WHERE name = 'Silo A');
INSERT INTO silo_data (name, capacity, current, holes) 
SELECT 'Silo B', 500, 180, 7 WHERE NOT EXISTS (SELECT 1 FROM silo_data WHERE name = 'Silo B');

-- Sample spare parts
INSERT INTO spare_parts (nama, kode, kategori, stok, stok_minimum, satuan, lokasi, harga, pemasok, catatan)
SELECT * FROM (VALUES
  ('Nozzle Packer A1', 'NP-A1', 'Packer', 12, 5, 'pcs', 'Gudang A', 1500000, 'PT. Semen Indo', 'Nozzle utama packer A1'),
  ('Belt Conveyor 500mm', 'BC-500', 'Conveyor', 3, 2, 'roll', 'Gudang B', 8500000, 'PT. Belt Indo', 'Belt conveyor utama'),
  ('Bearing SKF 6308', 'BR-6308', 'Bearing', 8, 4, 'pcs', 'Gudang A', 450000, 'PT. Bearing Jaya', 'Bearing untuk motor conveyor'),
  ('Seal Hydraulic 50mm', 'SH-50', 'Seal', 2, 3, 'pcs', 'Gudang A', 280000, 'PT. Seal Tech', 'Seal hidrolik silo'),
  ('Filter Udara Kompressor', 'FU-K01', 'Filter', 1, 3, 'pcs', 'Gudang C', 750000, 'PT. Filter Indo', 'Filter udara kompressor utama'),
  ('V-Belt B-68', 'VB-68', 'Belt', 15, 5, 'pcs', 'Gudang A', 125000, 'PT. Belt Indo', 'V-belt untuk motor packer')
) AS v(nama, kode, kategori, stok, stok_minimum, satuan, lokasi, harga, pemasok, catatan)
WHERE NOT EXISTS (SELECT 1 FROM spare_parts LIMIT 1);

-- Sample team activities
INSERT INTO team_activities (nama_karyawan, divisi, aktivitas, status, jam_masuk, jam_keluar, tanggal, catatan)
SELECT * FROM (VALUES
  ('Ahmad Fauzi', 'Produksi', 'Operasi Packer A', 'hadir', '07:00', '15:00', CURRENT_DATE, ''),
  ('Budi Santoso', 'Maintenance', 'Perawatan Conveyor', 'hadir', '07:00', '15:00', CURRENT_DATE, ''),
  ('Citra Dewi', 'Quality Control', 'Inspeksi Kualitas', 'hadir', '07:00', '15:00', CURRENT_DATE, ''),
  ('Dedi Kurniawan', 'Produksi', 'Operasi Packer B', 'izin', '-', '-', CURRENT_DATE, 'Izin keperluan keluarga'),
  ('Eka Putra', 'Gudang', 'Loading & Unloading', 'lembur', '07:00', '19:00', CURRENT_DATE, 'Lembur loading curah')
) AS v(nama_karyawan, divisi, aktivitas, status, jam_masuk, jam_keluar, tanggal, catatan)
WHERE NOT EXISTS (SELECT 1 FROM team_activities LIMIT 1);

-- Sample maintenance
INSERT INTO maintenance_records (judul, mesin, jenis, prioritas, status, tanggal_mulai, tanggal_selesai, teknisi, estimasi_biaya, catatan)
SELECT * FROM (VALUES
  ('Perawatan Rutin Packer A', 'Packer A', 'preventif', 'sedang', 'berjalan', CURRENT_DATE, NULL::date, 'Budi Santoso', 2500000, 'Ganti nozzle & seal'),
  ('Perbaikan Belt Conveyor #3', 'Conveyor #3', 'korektif', 'tinggi', 'terjadwal', CURRENT_DATE + INTERVAL '1 day', NULL::date, 'Rizki Hidayat', 5000000, 'Belt slip & misalignment'),
  ('Overhaul Kompressor Utama', 'Kompressor #1', 'preventif', 'kritis', 'terjadwal', CURRENT_DATE + INTERVAL '3 days', NULL::date, 'Team Maintenance', 15000000, 'Overhaul berkala 6 bulan')
) AS v(judul, mesin, jenis, prioritas, status, tanggal_mulai, tanggal_selesai, teknisi, estimasi_biaya, catatan)
WHERE NOT EXISTS (SELECT 1 FROM maintenance_records LIMIT 1);

-- Sample safety incidents
INSERT INTO safety_incidents (judul, tanggal, lokasi, severity, status, pelapor, korban, deskripsi, tindakan)
SELECT * FROM (VALUES
  ('Tumpahan Semen di Area Loading', CURRENT_DATE, 'Area Loading Curah', 'ringan', 'selesai', 'Eka Putra', '-', 'Tumpahan semen curah akibat overflow silo', 'Pembersihan segera & perbaikan sensor level'),
  ('Kecelakaan Ringan di Conveyor', CURRENT_DATE - INTERVAL '1 day', 'Conveyor Belt #2', 'sedang', 'investigasi', 'Ahmad Fauzi', 'Hendra Wijaya', 'Jari terjepit roller conveyor', 'P3K & investigasi sedang berjalan')
) AS v(judul, tanggal, lokasi, severity, status, pelapor, korban, deskripsi, tindakan)
WHERE NOT EXISTS (SELECT 1 FROM safety_incidents LIMIT 1);

-- Sample notifications
INSERT INTO notifications (judul, pesan, tipe, dibaca, modul, link)
SELECT * FROM (VALUES
  ('Stok Filter Udara Rendah', 'Filter Udara Kompressor (FU-K01) stok hanya 1 pcs, minimum 3 pcs', 'peringatan', FALSE, 'spare-parts', '/dashboard'),
  ('Work Order Overdue', 'Perbaikan Belt Conveyor #3 sudah melewati jadwal', 'bahaya', FALSE, 'maintenance', '/dashboard'),
  ('Perawatan Selesai', 'Perawatan rutin Packer A telah selesai', 'sukses', TRUE, 'maintenance', '/dashboard'),
  ('Karyawan Izin', 'Dedi Kurniawan izin hari ini', 'info', TRUE, 'team-activity', '/dashboard')
) AS v(judul, pesan, tipe, dibaca, modul, link)
WHERE NOT EXISTS (SELECT 1 FROM notifications LIMIT 1);

-- Production data for charts
INSERT INTO production_data (bulan, zak, curah, tahun)
SELECT * FROM (VALUES
  ('Jan', 4200, 1800, 2024),
  ('Feb', 3800, 2100, 2024),
  ('Mar', 4500, 1700, 2024),
  ('Apr', 4100, 2000, 2024),
  ('Mei', 4600, 2200, 2024),
  ('Jun', 3900, 1900, 2024),
  ('Jul', 4800, 2300, 2024),
  ('Agu', 4400, 2100, 2024),
  ('Sep', 4700, 2000, 2024),
  ('Okt', 4300, 1800, 2024),
  ('Nov', 4100, 2100, 2024),
  ('Des', 4500, 2400, 2024)
) AS v(bulan, zak, curah, tahun)
WHERE NOT EXISTS (SELECT 1 FROM production_data LIMIT 1);

-- ══════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_spare_parts_kode ON spare_parts(kode);
CREATE INDEX IF NOT EXISTS idx_spare_parts_kategori ON spare_parts(kategori);
CREATE INDEX IF NOT EXISTS idx_team_activities_tanggal ON team_activities(tanggal);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_safety_severity ON safety_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_notifications_dibaca ON notifications(dibaca);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_production_data_tahun ON production_data(tahun);
CREATE INDEX IF NOT EXISTS idx_pispot_tanggal ON pispot_records(tanggal);
CREATE INDEX IF NOT EXISTS idx_opname_tanggal ON opname_records(tanggal);

-- Updated_at trigger
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
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN ('spare_parts','team_activities','maintenance_records','safety_incidents','documents','notifications','silo_data','opname_records','pispot_records','production_data')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I;', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();', t);
  END LOOP;
END $$;
