-- ============================================================
-- YWM Migration 0001 - Init YWM schema di Supabase Dhaher Labs
-- Target project: jcdjwprehfgtaswqletb
-- Perbedaan dari schema.sql v8.0:
--   * TANPA policy anon publik (fail-closed)
--   * Policy CRUD penuh hanya untuk role `authenticated`
--   * Seed data disertakan untuk verifikasi visual awal
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS silo_calculation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  silo TEXT CHECK (silo IN ('A', 'B')) NOT NULL,
  tanggal DATE DEFAULT CURRENT_DATE,
  jam TEXT DEFAULT '00:00',
  ukuran JSONB DEFAULT '[]',
  jumlah NUMERIC(10,4) DEFAULT 0,
  tinggi_rata_rata NUMERIC(10,4) DEFAULT 0,
  t_silinder NUMERIC(10,4) DEFAULT 0,
  t_conis NUMERIC(10,4) DEFAULT 0,
  volume_silinder NUMERIC(12,3) DEFAULT 0,
  volume_conis NUMERIC(12,3) DEFAULT 0,
  volume_total NUMERIC(12,3) DEFAULT 0,
  kekosongan NUMERIC(12,3) DEFAULT 0,
  space_silo NUMERIC(12,3) DEFAULT 0,
  pengeluaran NUMERIC(10,3) DEFAULT 0,
  keterangan TEXT,
  petugas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS silo_opname (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  jam TEXT DEFAULT '00:00',
  kapal TEXT,
  opname1_tanggal DATE,
  opname1_jam TEXT,
  opname1_ukuran_a JSONB DEFAULT '[]',
  opname1_ukuran_b JSONB DEFAULT '[]',
  opname1_volume_a NUMERIC(12,3) DEFAULT 0,
  opname1_volume_b NUMERIC(12,3) DEFAULT 0,
  opname1_total_volume NUMERIC(12,3) DEFAULT 0,
  opname2_tanggal DATE,
  opname2_jam TEXT,
  opname2_ukuran_a JSONB DEFAULT '[]',
  opname2_ukuran_b JSONB DEFAULT '[]',
  opname2_volume_a NUMERIC(12,3) DEFAULT 0,
  opname2_volume_b NUMERIC(12,3) DEFAULT 0,
  opname2_total_volume NUMERIC(12,3) DEFAULT 0,
  pengeluaran_zak NUMERIC(10,3) DEFAULT 0,
  semen_curah_terbongkar NUMERIC(12,3) DEFAULT 0,
  catatan TEXT,
  petugas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  shift TEXT CHECK (shift IN ('pagi', 'siang', 'malam')) DEFAULT 'pagi',
  mesin TEXT,
  target INTEGER DEFAULT 0,
  aktual INTEGER DEFAULT 0,
  satuan TEXT DEFAULT 'zak',
  kualitas TEXT CHECK (kualitas IN ('A', 'B', 'C')) DEFAULT 'A',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  jenis TEXT CHECK (jenis IN ('pemasukan', 'pengeluaran')) DEFAULT 'pemasukan',
  kategori TEXT,
  deskripsi TEXT,
  jumlah NUMERIC(15,2) DEFAULT 0,
  metode_pembayaran TEXT,
  referensi TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_incident (
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

CREATE TABLE IF NOT EXISTS employee (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT NOT NULL,
  nip TEXT UNIQUE,
  jabatan TEXT,
  divisi TEXT,
  tanggal_masuk DATE,
  gaji_pokok NUMERIC(15,2) DEFAULT 0,
  status TEXT CHECK (status IN ('aktif', 'cuti', 'resign')) DEFAULT 'aktif',
  no_telepon TEXT,
  email TEXT,
  alamat TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS: enable di semua tabel ──
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE pispot ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_calculation ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_opname ENABLE ROW LEVEL SECURITY;
ALTER TABLE production ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incident ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;

-- ── Policies: authenticated = CRUD penuh; anon = TIDAK ADA (fail-closed) ──
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    AND table_name IN ('spare_parts','maintenance','team_activity','pispot',
      'documents','notifications','chat_history','silo_calculation',
      'silo_opname','production','finance','safety_incident','employee')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS authenticated_all ON %I', t);
    EXECUTE format('CREATE POLICY authenticated_all ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ── Indexes ──
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
CREATE INDEX IF NOT EXISTS idx_production_tanggal ON production(tanggal);
CREATE INDEX IF NOT EXISTS idx_production_shift ON production(shift);
CREATE INDEX IF NOT EXISTS idx_finance_tanggal ON finance(tanggal);
CREATE INDEX IF NOT EXISTS idx_finance_jenis ON finance(jenis);
CREATE INDEX IF NOT EXISTS idx_safety_incident_tanggal ON safety_incident(tanggal);
CREATE INDEX IF NOT EXISTS idx_safety_incident_severity ON safety_incident(severity);
CREATE INDEX IF NOT EXISTS idx_safety_incident_status ON safety_incident(status);
CREATE INDEX IF NOT EXISTS idx_employee_divisi ON employee(divisi);
CREATE INDEX IF NOT EXISTS idx_employee_status ON employee(status);

-- ── Trigger updated_at ──
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
    AND table_name IN ('spare_parts','maintenance','team_activity','pispot',
      'documents','notifications','chat_history','silo_calculation',
      'silo_opname','production','finance','safety_incident','employee')
  LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
      EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
    EXCEPTION WHEN others THEN NULL;
    END;
  END LOOP;
END $$;

-- ── Seed data (idempotent-guarded by kode UNIQUE / minimal rows check) ──
INSERT INTO spare_parts (nama, kode, kategori, stok, stok_minimum, satuan, lokasi, harga, pemasok, catatan)
SELECT * FROM (VALUES
  ('Bearing SKF 6205', 'BRG-001', 'Bearing', 15, 5, 'pcs', 'Gudang A-1', 350000::numeric, 'PT. Bearing Indonesia', 'Untuk Packer A & B'),
  ('Belt Conveyor 500mm', 'BLT-001', 'Conveyor', 3, 2, 'meter', 'Gudang B-2', 1200000::numeric, 'PT. Belt Solutions', 'Stok menipis'),
  ('Filter Oli Hydraulic', 'FLT-001', 'Filter', 8, 10, 'pcs', 'Gudang A-2', 275000::numeric, 'PT. Filter Mandiri', 'Stok di bawah minimum'),
  ('Seal Packer Nozzle', 'SLP-001', 'Seal', 24, 10, 'pcs', 'Gudang A-1', 85000::numeric, 'PT. Sealing Tech', 'Kompatibel nozzle A1-A4, B1-B4'),
  ('Motor Elektrik 7.5kW', 'MOT-001', 'Motor', 2, 1, 'unit', 'Gudang C-1', 8500000::numeric, 'PT. Indodaya Electric', 'Spare motor conveyor')
) AS v(nama, kode, kategori, stok, stok_minimum, satuan, lokasi, harga, pemasok, catatan)
WHERE NOT EXISTS (SELECT 1 FROM spare_parts WHERE kode IN ('BRG-001','BLT-001','FLT-001','SLP-001','MOT-001'));

INSERT INTO maintenance (judul, mesin, jenis, prioritas, status, tanggal_mulai, teknisi, estimasi_biaya, catatan)
SELECT * FROM (VALUES
  ('Ganti Bearing Packer A2', 'Packer A', 'korektif', 'tinggi', 'berjalan', CURRENT_DATE, 'Budi Santoso', 1500000::numeric, 'Bearing berbunyi abnormal'),
  ('Service Rutin Conveyor #3', 'Conveyor 3', 'preventif', 'sedang', 'terjadwal', CURRENT_DATE + 5, 'Eko Prasetyo', 2500000::numeric, 'Service berkala bulanan')
) AS v(judul, mesin, jenis, prioritas, status, tanggal_mulai, teknisi, estimasi_biaya, catatan)
WHERE NOT EXISTS (SELECT 1 FROM maintenance WHERE judul = 'Ganti Bearing Packer A2');

INSERT INTO notifications (judul, pesan, tipe, modul, dibaca, action_url)
SELECT * FROM (VALUES
  ('Stok Filter Oli di Bawah Minimum', 'Filter Oli Hydraulic (FLT-001) stok saat ini 8 pcs, minimum 10 pcs.', 'peringatan', 'spare-parts', FALSE, '/dashboard?module=spare-parts'),
  ('Work Order Kritis Aktif', 'Perbaikan Nozzle B3 Bocor sedang berjalan. Prioritas: KRITIS.', 'bahaya', 'maintenance', FALSE, '/dashboard?module=maintenance')
) AS v(judul, pesan, tipe, modul, dibaca, action_url)
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE judul = 'Stok Filter Oli di Bawah Minimum');
