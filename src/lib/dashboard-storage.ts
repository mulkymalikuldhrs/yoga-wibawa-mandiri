// ============================================================
// Dashboard Storage — localStorage helper functions
// ============================================================

import { KV_PREFIXES } from '@/types/dashboard';

export function getData<T extends { id: string }>(prefix: string): T[] {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    return keys.map((k) => {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    }).filter(Boolean) as T[];
  } catch {
    return [];
  }
}

export function saveData<T extends { id: string }>(prefix: string, data: T): void {
  const key = `${prefix}${data.id}`;
  localStorage.setItem(key, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
}

export function deleteData(prefix: string, id: string): void {
  const key = `${prefix}${id}`;
  localStorage.removeItem(key);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggal(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatTanggalShort(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = String(val ?? '');
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',')
    ),
  ];
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Initialize sample data if localStorage is empty
export function initializeSampleData(): void {
  const prefixes = Object.values(KV_PREFIXES);
  const hasData = prefixes.some((p) =>
    Object.keys(localStorage).some((k) => k.startsWith(p))
  );
  if (hasData) return;

  // Spare Parts sample data
  const spareParts = [
    { id: generateId(), nama: 'Bearing SKF 6205', kode: 'BRG-001', kategori: 'Bearing', stok: 15, stokMinimum: 5, satuan: 'pcs', lokasi: 'Gudang A-1', harga: 350000, pemasok: 'PT. Bearing Indonesia', catatan: 'Untuk Packer A & B', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Belt Conveyor 500mm', kode: 'BLT-001', kategori: 'Conveyor', stok: 3, stokMinimum: 2, satuan: 'meter', lokasi: 'Gudang B-2', harga: 1200000, pemasok: 'PT. Belt Solutions', catatan: 'Stok menipis', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Filter Oli Hydraulic', kode: 'FLT-001', kategori: 'Filter', stok: 8, stokMinimum: 10, satuan: 'pcs', lokasi: 'Gudang A-2', harga: 275000, pemasok: 'PT. Filter Mandiri', catatan: 'STOK DI BAWAH MINIMUM', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Seal Packer Nozzle', kode: 'SLP-001', kategori: 'Seal', stok: 24, stokMinimum: 10, satuan: 'pcs', lokasi: 'Gudang A-1', harga: 85000, pemasok: 'PT. Sealing Tech', catatan: 'Kompatibel nozzle A1-A4, B1-B4', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Motor Elektrik 7.5kW', kode: 'MOT-001', kategori: 'Motor', stok: 2, stokMinimum: 1, satuan: 'unit', lokasi: 'Gudang C-1', harga: 8500000, pemasok: 'PT. Indodaya Electric', catatan: 'Spare motor conveyor', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Roller Conveyor Ø89', kode: 'RLR-001', kategori: 'Conveyor', stok: 1, stokMinimum: 3, satuan: 'pcs', lokasi: 'Gudang B-1', harga: 450000, pemasok: 'PT. Belt Solutions', catatan: 'STOK DI BAWAH MINIMUM', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Gearbox Reducer 1:40', kode: 'GRB-001', kategori: 'Gearbox', stok: 1, stokMinimum: 1, satuan: 'unit', lokasi: 'Gudang C-2', harga: 15000000, pemasok: 'PT. Nordion Gear', catatan: 'Untuk Packer A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'V-Belt B-68', kode: 'VBL-001', kategori: 'Belt', stok: 12, stokMinimum: 6, satuan: 'pcs', lokasi: 'Gudang A-3', harga: 120000, pemasok: 'PT. Belt Solutions', catatan: 'V-belt untuk motor packer', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  spareParts.forEach((item) => saveData(KV_PREFIXES.sparePart, item));

  // Team Activity sample data
  const today = new Date().toISOString().split('T')[0];
  const teamActivities = [
    { id: generateId(), namaKaryawan: 'Ahmad Fauzi', divisi: 'Produksi', aktivitas: 'Operator Packer A', status: 'hadir' as const, jamMasuk: '07:00', jamKeluar: '15:00', tanggal: today, catatan: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaKaryawan: 'Budi Santoso', divisi: 'Perawatan', aktivitas: 'Teknisi Maintenance', status: 'hadir' as const, jamMasuk: '07:00', jamKeluar: '15:00', tanggal: today, catatan: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaKaryawan: 'Citra Dewi', divisi: 'Keuangan', aktivitas: 'Staff Administrasi', status: 'hadir' as const, jamMasuk: '08:00', jamKeluar: '16:00', tanggal: today, catatan: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaKaryawan: 'Dian Purnama', divisi: 'Produksi', aktivitas: 'Operator Packer B', status: 'lembur' as const, jamMasuk: '07:00', jamKeluar: '19:00', tanggal: today, catatan: 'Lembur shift malam', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaKaryawan: 'Eko Prasetyo', divisi: 'Perawatan', aktivitas: 'Kepala Teknisi', status: 'izin' as const, jamMasuk: '-', jamKeluar: '-', tanggal: today, catatan: 'Keperluan keluarga', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaKaryawan: 'Fitri Handayani', divisi: 'SDM', aktivitas: 'HR Manager', status: 'sakit' as const, jamMasuk: '-', jamKeluar: '-', tanggal: today, catatan: 'Sakit demam', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaKaryawan: 'Gunawan Wibowo', divisi: 'Produksi', aktivitas: 'Operator Conveyor', status: 'alpha' as const, jamMasuk: '-', jamKeluar: '-', tanggal: today, catatan: 'Tidak ada kabar', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  teamActivities.forEach((item) => saveData(KV_PREFIXES.teamActivity, item));

  // Maintenance sample data
  const maintenanceRecords = [
    { id: generateId(), judul: 'Ganti Bearing Packer A2', mesin: 'Packer A', jenis: 'korektif' as const, prioritas: 'tinggi' as const, status: 'berjalan' as const, tanggalMulai: today, tanggalSelesai: '', teknisi: 'Budi Santoso', estimasiBiaya: 1500000, catatan: 'Bearing berbunyi abnormal', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Service Rutin Conveyor #3', mesin: 'Conveyor 3', jenis: 'preventif' as const, prioritas: 'sedang' as const, status: 'terjadwal' as const, tanggalMulai: '2026-03-05', tanggalSelesai: '', teknisi: 'Eko Prasetyo', estimasiBiaya: 2500000, catatan: 'Service berkala bulanan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Perbaikan Nozzle B3 Bocor', mesin: 'Packer B', jenis: 'darurat' as const, prioritas: 'kritis' as const, status: 'berjalan' as const, tanggalMulai: today, tanggalSelesai: '', teknisi: 'Budi Santoso', estimasiBiaya: 800000, catatan: 'Nozzle bocor, semen tumpah', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Kalibrasi Timbangan Packer', mesin: 'Packer A', jenis: 'preventif' as const, prioritas: 'sedang' as const, status: 'selesai' as const, tanggalMulai: '2026-02-28', tanggalSelesai: '2026-02-28', teknisi: 'Eko Prasetyo', estimasiBiaya: 500000, catatan: 'Kalibrasi selesai, akurasi ±0.2%', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Ganti Oli Gearbox Packer B', mesin: 'Packer B', jenis: 'preventif' as const, prioritas: 'rendah' as const, status: 'terjadwal' as const, tanggalMulai: '2026-03-10', tanggalSelesai: '', teknisi: 'Budi Santoso', estimasiBiaya: 1200000, catatan: 'Penggantian oli berkala 6 bulan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  maintenanceRecords.forEach((item) => saveData(KV_PREFIXES.maintenance, item));

  // Pispot sample data (Pompa Gemik Bearing / Lubrikasi / Pelumasan)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const pispotRecords = [
    { id: generateId(), namaPeralatan: 'Bearing Packer A - Nozzle 1', kodePeralatan: 'BRG-PA1', lokasi: 'Packer A', jenisPelumas: 'Lithium Grease EP2', spesifikasi: 'NLGI Grade 2, -20°C s/d 130°C', volume: '50 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-05`, petugas: 'Budi Santoso', status: 'selesai' as const, kondisi: 'baik' as const, catatan: 'Pelumasan rutin bulanan', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Bearing Packer A - Nozzle 2', kodePeralatan: 'BRG-PA2', lokasi: 'Packer A', jenisPelumas: 'Lithium Grease EP2', spesifikasi: 'NLGI Grade 2, -20°C s/d 130°C', volume: '50 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-05`, petugas: 'Budi Santoso', status: 'selesai' as const, kondisi: 'baik' as const, catatan: '', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Bearing Packer A - Nozzle 3', kodePeralatan: 'BRG-PA3', lokasi: 'Packer A', jenisPelumas: 'Lithium Grease EP2', spesifikasi: 'NLGI Grade 2, -20°C s/d 130°C', volume: '50 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-12`, petugas: 'Eko Prasetyo', status: 'terjadwal' as const, kondisi: 'baik' as const, catatan: '', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Bearing Packer A - Nozzle 4', kodePeralatan: 'BRG-PA4', lokasi: 'Packer A', jenisPelumas: 'Lithium Grease EP2', spesifikasi: 'NLGI Grade 2, -20°C s/d 130°C', volume: '50 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-12`, petugas: 'Eko Prasetyo', status: 'terjadwal' as const, kondisi: 'baik' as const, catatan: '', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Bearing Packer B - Nozzle 1', kodePeralatan: 'BRG-PB1', lokasi: 'Packer B', jenisPelumas: 'Lithium Grease EP2', spesifikasi: 'NLGI Grade 2, -20°C s/d 130°C', volume: '50 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-07`, petugas: 'Ahmad Fauzi', status: 'selesai' as const, kondisi: 'perlu_perhatian' as const, catatan: 'Sedikit berisik, perlu pemantauan', tindakLanjut: 'Cek ulang minggu depan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Bearing Packer B - Nozzle 2', kodePeralatan: 'BRG-PB2', lokasi: 'Packer B', jenisPelumas: 'Lithium Grease EP2', spesifikasi: 'NLGI Grade 2, -20°C s/d 130°C', volume: '50 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-07`, petugas: 'Ahmad Fauzi', status: 'selesai' as const, kondisi: 'baik' as const, catatan: '', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Bearing Packer B - Nozzle 3', kodePeralatan: 'BRG-PB3', lokasi: 'Packer B', jenisPelumas: 'Lithium Grease EP2', spesifikasi: 'NLGI Grade 2, -20°C s/d 130°C', volume: '50 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-15`, petugas: 'Budi Santoso', status: 'terjadwal' as const, kondisi: 'baik' as const, catatan: '', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Bearing Packer B - Nozzle 4', kodePeralatan: 'BRG-PB4', lokasi: 'Packer B', jenisPelumas: 'Lithium Grease EP2', spesifikasi: 'NLGI Grade 2, -20°C s/d 130°C', volume: '50 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-15`, petugas: 'Budi Santoso', status: 'terjadwal' as const, kondisi: 'baik' as const, catatan: '', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Bearing Conveyor Utama', kodePeralatan: 'BRG-CV01', lokasi: 'Conveyor Utama', jenisPelumas: 'Lithium Grease EP3', spesifikasi: 'NLGI Grade 3, -10°C s/d 150°C', volume: '100 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-03`, petugas: 'Eko Prasetyo', status: 'selesai' as const, kondisi: 'baik' as const, catatan: '', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Bearing Conveyor Return', kodePeralatan: 'BRG-CV02', lokasi: 'Conveyor Return', jenisPelumas: 'Lithium Grease EP3', spesifikasi: 'NLGI Grade 3, -10°C s/d 150°C', volume: '100 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-03`, petugas: 'Eko Prasetyo', status: 'selesai' as const, kondisi: 'baik' as const, catatan: '', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Pompa Hidrolik Packer A', kodePeralatan: 'PMP-HYD-PA', lokasi: 'Packer A', jenisPelumas: 'Hydraulic Oil HLP 46', spesifikasi: 'ISO VG 46, -15°C s/d 80°C', volume: '5 liter', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-10`, petugas: 'Ahmad Fauzi', status: 'terjadwal' as const, kondisi: 'baik' as const, catatan: 'Cek level oli', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Pompa Hidrolik Packer B', kodePeralatan: 'PMP-HYD-PB', lokasi: 'Packer B', jenisPelumas: 'Hydraulic Oil HLP 46', spesifikasi: 'ISO VG 46, -15°C s/d 80°C', volume: '5 liter', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-10`, petugas: 'Ahmad Fauzi', status: 'terlewat' as const, kondisi: 'perlu_perhatian' as const, catatan: 'Pelumasan terlewat, ada kebocoran minor', tindakLanjut: 'Segera lakukan pelumasan dan cek kebocoran', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Gearbox Reducer Packer A', kodePeralatan: 'GRB-PA', lokasi: 'Packer A', jenisPelumas: 'Gear Oil GL-5 85W-90', spesifikasi: 'API GL-5, SAE 85W-90', volume: '2 liter', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-20`, petugas: 'Budi Santoso', status: 'terjadwal' as const, kondisi: 'baik' as const, catatan: 'Cek kualitas oli', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), namaPeralatan: 'Motor Conveyor Drive', kodePeralatan: 'MOT-CV-DRV', lokasi: 'Conveyor Drive', jenisPelumas: 'Lithium Grease EP2', spesifikasi: 'NLGI Grade 2', volume: '30 gram', periode: 'bulanan', bulan: currentMonth, tanggalPelaksanaan: `${currentMonth}-08`, petugas: 'Eko Prasetyo', status: 'selesai' as const, kondisi: 'baik' as const, catatan: '', tindakLanjut: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  pispotRecords.forEach((item) => saveData(KV_PREFIXES.pispot, item));

  // Document sample data
  const documents = [
    { id: generateId(), nama: 'SOP Pengantongan Semen', jenis: 'manual' as const, kategori: 'SOP', ukuran: 2500000, url: '#', ocrText: '', diunggahOleh: 'Eko Prasetyo', catatan: 'SOP terbaru revisi 2026', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Kontrak Penjualan PT Bangun Jaya', jenis: 'kontrak' as const, kategori: 'Penjualan', ukuran: 1500000, url: '#', ocrText: '', diunggahOleh: 'Citra Dewi', catatan: 'Kontrak 1 tahun', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Laporan Keuangan Februari 2026', jenis: 'laporan' as const, kategori: 'Keuangan', ukuran: 3200000, url: '#', ocrText: '', diunggahOleh: 'Citra Dewi', catatan: 'Laporan bulanan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Sertifikat ISO 9001:2015', jenis: 'sertifikat' as const, kategori: 'Sertifikasi', ukuran: 800000, url: '#', ocrText: '', diunggahOleh: 'Fitri Handayani', catatan: 'Berlaku s/d 2027', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  documents.forEach((item) => saveData(KV_PREFIXES.document, item));

  // Notification sample data
  const notifications = [
    { id: generateId(), judul: 'Stok Filter Oli di Bawah Minimum', pesan: 'Filter Oli Hydraulic (FLT-001) stok saat ini 8 pcs, minimum 10 pcs. Segera lakukan pemesanan ulang.', tipe: 'peringatan' as const, dibaca: false, modul: 'spare-parts', link: '/dashboard?module=spare-parts', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Work Order Kritis Aktif', pesan: 'Perbaikan Nozzle B3 Bocor sedang berjalan. Prioritas: KRITIS. Teknisi: Budi Santoso.', tipe: 'bahaya' as const, dibaca: false, modul: 'maintenance', link: '/dashboard?module=maintenance', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Pelumasan Pompa Hidrolik Packer B Terlewat', pesan: 'Pelumasan Pompa Hidrolik Packer B (PMP-HYD-PB) bulan ini terlewat. Segera lakukan pelumasan.', tipe: 'bahaya' as const, dibaca: false, modul: 'pispot', link: '/dashboard?module=pispot', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Karyawan Alpha Hari Ini', pesan: 'Gunawan Wibowo (Operator Conveyor) tidak hadir tanpa keterangan hari ini.', tipe: 'peringatan' as const, dibaca: false, modul: 'team-activity', link: '/dashboard?module=team-activity', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Jadwal Perawatan Conveyor #3', pesan: 'Service rutin Conveyor #3 dijadwalkan. Estimasi biaya Rp 2.500.000.', tipe: 'info' as const, dibaca: true, modul: 'maintenance', link: '/dashboard?module=maintenance', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  notifications.forEach((item) => saveData(KV_PREFIXES.notification, item));

  // Silo Calculation sample data (Kalkulasi Kekosongan)
  const siloCalcData: Array<Omit<import('@/types/dashboard').SiloCalculation, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      silo: 'A', tanggal: today, jam: '07:30',
      ukuran: [5.1, 5.55, 7.0, 7.0, 6.6, 5.65, 5.0],
      jumlah: 41.9, tinggiRataRata: 5.9857, tSilinder: 12.0143, tConis: 4.6,
      volumeSilinder: 1747.117, volumeConis: 222.962, volumeTotal: 1970.079,
      kekosongan: 505.575, spaceSilo: 505.575, pengeluaran: 0,
      keterangan: 'Sebelum bongkar', petugas: 'Hendra Wijaya',
    },
    {
      silo: 'B', tanggal: today, jam: '07:30',
      ukuran: [7.7, 9.2, 10.8, 11.6, 11.35, 9.75, 7.75],
      jumlah: 68.15, tinggiRataRata: 9.7357, tSilinder: 8.2643, tConis: 2.9,
      volumeSilinder: 1201.792, volumeConis: 140.563, volumeTotal: 1342.355,
      kekosongan: 1049.178, spaceSilo: 1049.178, pengeluaran: 0,
      keterangan: 'Sebelum bongkar', petugas: 'Hendra Wijaya',
    },
    {
      silo: 'A', tanggal: today, jam: '15:00',
      ukuran: [1.9, 1.75, 2.1, 2.2, 2.0, 1.9, 1.9],
      jumlah: 13.75, tinggiRataRata: 1.9643, tSilinder: 16.0357, tConis: 4.6,
      volumeSilinder: 2331.914, volumeConis: 222.962, volumeTotal: 2554.876,
      kekosongan: 0, spaceSilo: -100, pengeluaran: 100,
      keterangan: 'Sesudah bongkar', petugas: 'Ahmad Fauzi',
    },
    {
      silo: 'B', tanggal: today, jam: '15:00',
      ukuran: [1.65, 1.7, 1.75, 1.9, 1.85, 1.75, 1.6],
      jumlah: 12.2, tinggiRataRata: 1.7429, tSilinder: 16.2571, tConis: 2.9,
      volumeSilinder: 2364.114, volumeConis: 140.563, volumeTotal: 2504.677,
      kekosongan: 0, spaceSilo: -50, pengeluaran: 50,
      keterangan: 'Sesudah bongkar', petugas: 'Dian Purnama',
    },
  ];
  siloCalcData.forEach((item) => {
    saveData(KV_PREFIXES.siloCalculation, { ...item, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });

  // Silo Opname sample data (Berita Acara Opname)
  const siloOpnameData: Array<Omit<import('@/types/dashboard').SiloOpname, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      tanggal: today, jam: '15:00', kapal: 'MV MADELIN FIRST',
      opname1Tanggal: today, opname1Jam: '01:00',
      opname1UkuranA: [5.1, 5.55, 7.0, 7.0, 6.6, 5.65, 5.0],
      opname1UkuranB: [7.7, 9.2, 10.8, 11.6, 11.35, 9.75, 7.75],
      opname1VolumeA: 1970.079, opname1VolumeB: 1342.355, opname1TotalVolume: 3312.434,
      opname2Tanggal: today, opname2Jam: '15:00',
      opname2UkuranA: [1.9, 1.75, 2.1, 2.2, 2.0, 1.9, 1.9],
      opname2UkuranB: [1.65, 1.7, 1.75, 1.9, 1.85, 1.75, 1.6],
      opname2VolumeA: 2554.876, opname2VolumeB: 2504.677, opname2TotalVolume: 5059.553,
      pengeluaranZak: 230, semenCurahTerbongkar: 1977.119,
      catatan: 'Pembongkaran semen curah dari kapal', petugas: 'Hendra Wijaya',
    },
  ];
  siloOpnameData.forEach((item) => {
    saveData(KV_PREFIXES.siloOpname, { ...item, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });
}
