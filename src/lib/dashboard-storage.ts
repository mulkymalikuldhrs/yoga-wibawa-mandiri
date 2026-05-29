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

  // Production sample data
  const productionRecords = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const shifts: Array<'pagi' | 'siang' | 'malam'> = ['pagi', 'siang', 'malam'];
    shifts.forEach((shift) => {
      const target = 170;
      const variance = Math.floor(Math.random() * 30) - 10;
      const aktual = target + variance;
      productionRecords.push({
        id: generateId(),
        tanggal: dateStr,
        shift,
        mesin: shift === 'malam' ? 'Packer B' : 'Packer A',
        target,
        aktual,
        satuan: 'ton',
        kualitas: variance > -5 ? 'A' : variance > -10 ? 'B' : 'C',
        catatan: variance < -5 ? 'Produksi di bawah target' : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }
  productionRecords.forEach((item) => saveData(KV_PREFIXES.production, item));

  // Safety sample data
  const safetyIncidents = [
    { id: generateId(), judul: 'Tumpahan Semen di Area Packer', tanggal: '2026-02-25', lokasi: 'Area Packer A', severity: 'ringan' as const, status: 'selesai' as const, pelapor: 'Ahmad Fauzi', korban: '-', deskripsi: 'Tumpahan semen dari nozzle, area segera dibersihkan', tindakan: 'Perbaikan nozzle, penambahan splash guard', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Kecelakaan Terpeleset di Conveyor', tanggal: '2026-02-20', lokasi: 'Conveyor 2', severity: 'sedang' as const, status: 'investigasi' as const, pelapor: 'Gunawan Wibowo', korban: 'Rizki Ananda', deskripsi: 'Karyawan terpeleset di area conveyor yang basah', tindakan: 'Pemasangan anti-slip, investigasi ongoing', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Hearing Loss Ringan Operator', tanggal: '2026-02-15', lokasi: 'Area Silo', severity: 'sedang' as const, status: 'dilaporkan' as const, pelapor: 'Fitri Handayani', korban: 'Hendra Wijaya', deskripsi: 'Keluhan pendengaran berkurang setelah bekerja tanpa earplug', tindakan: 'Pemeriksaan ke dokter, sosialisasi APD', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  safetyIncidents.forEach((item) => saveData(KV_PREFIXES.safety, item));

  // Finance sample data
  const financeRecords = [
    { id: generateId(), tanggal: '2026-02-28', jenis: 'pemasukan' as const, kategori: 'Penjualan', deskripsi: 'Penjualan semen 50kg x 8000 karung', jumlah: 680000000, metodePembayaran: 'Transfer Bank', referensi: 'INV-2026-0228', catatan: 'Pembayaran dari PT Bangun Jaya', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), tanggal: '2026-02-28', jenis: 'pengeluaran' as const, kategori: 'Pembelian Material', deskripsi: 'Pembelian suku cadang bearing dan seal', jumlah: 5250000, metodePembayaran: 'Transfer Bank', referensi: 'PO-2026-0089', catatan: 'Pembelian dari PT Bearing Indonesia', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), tanggal: '2026-02-27', jenis: 'pengeluaran' as const, kategori: 'Gaji', deskripsi: 'Gaji karyawan bulan Februari 2026', jumlah: 285000000, metodePembayaran: 'Transfer Bank', referensi: 'PAY-2026-02', catatan: 'Total gaji 35 karyawan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), tanggal: '2026-02-27', jenis: 'pengeluaran' as const, kategori: 'Utilitas', deskripsi: 'Tagihan listrik bulan Februari', jumlah: 45000000, metodePembayaran: 'Auto Debit', referensi: 'PLN-2026-02', catatan: 'Konsumsi listrik pabrik', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), tanggal: '2026-02-25', jenis: 'pemasukan' as const, kategori: 'Penjualan', deskripsi: 'Penjualan semen 40kg x 5000 karung', jumlah: 350000000, metodePembayaran: 'Transfer Bank', referensi: 'INV-2026-0225', catatan: 'Pembayaran dari CV Mitra Konstruksi', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), tanggal: '2026-02-24', jenis: 'pengeluaran' as const, kategori: 'Transportasi', deskripsi: 'Biaya pengiriman semen ke Aceh Utara', jumlah: 15000000, metodePembayaran: 'Tunai', referensi: 'SHP-2026-0224', catatan: '5 truk pengiriman', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  financeRecords.forEach((item) => saveData(KV_PREFIXES.finance, item));

  // HR/Employee sample data
  const employees = [
    { id: generateId(), nama: 'Ahmad Fauzi', nip: 'YWM-001', jabatan: 'Operator Senior', divisi: 'Produksi', tanggalMasuk: '2020-03-15', gajiPokok: 5500000, status: 'aktif' as const, noTelepon: '0823-4567-8901', email: 'ahmad.fauzi@ywm.co.id', alamat: 'Lhokseumawe', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Budi Santoso', nip: 'YWM-002', jabatan: 'Teknisi Maintenance', divisi: 'Perawatan', tanggalMasuk: '2019-07-01', gajiPokok: 6000000, status: 'aktif' as const, noTelepon: '0823-5678-9012', email: 'budi.santoso@ywm.co.id', alamat: 'Lhokseumawe', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Citra Dewi', nip: 'YWM-003', jabatan: 'Staff Administrasi', divisi: 'Keuangan', tanggalMasuk: '2021-01-10', gajiPokok: 4500000, status: 'aktif' as const, noTelepon: '0823-6789-0123', email: 'citra.dewi@ywm.co.id', alamat: 'Banda Aceh', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Dian Purnama', nip: 'YWM-004', jabatan: 'Operator Packer', divisi: 'Produksi', tanggalMasuk: '2022-05-20', gajiPokok: 5000000, status: 'aktif' as const, noTelepon: '0823-7890-1234', email: 'dian.purnama@ywm.co.id', alamat: 'Lhokseumawe', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Eko Prasetyo', nip: 'YWM-005', jabatan: 'Kepala Teknisi', divisi: 'Perawatan', tanggalMasuk: '2018-02-01', gajiPokok: 8500000, status: 'aktif' as const, noTelepon: '0823-8901-2345', email: 'eko.prasetyo@ywm.co.id', alamat: 'Lhokseumawe', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Fitri Handayani', nip: 'YWM-006', jabatan: 'HR Manager', divisi: 'SDM', tanggalMasuk: '2019-09-15', gajiPokok: 9000000, status: 'aktif' as const, noTelepon: '0823-9012-3456', email: 'fitri.handayani@ywm.co.id', alamat: 'Banda Aceh', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Gunawan Wibowo', nip: 'YWM-007', jabatan: 'Operator Conveyor', divisi: 'Produksi', tanggalMasuk: '2023-03-01', gajiPokok: 4800000, status: 'aktif' as const, noTelepon: '0823-0123-4567', email: 'gunawan.wibowo@ywm.co.id', alamat: 'Lhokseumawe', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), nama: 'Hendra Wijaya', nip: 'YWM-008', jabatan: 'Operator Silo', divisi: 'Produksi', tanggalMasuk: '2021-08-10', gajiPokok: 5200000, status: 'cuti' as const, noTelepon: '0823-1234-5678', email: 'hendra.wijaya@ywm.co.id', alamat: 'Aceh Utara', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  employees.forEach((item) => saveData(KV_PREFIXES.employee, item));

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
    { id: generateId(), judul: 'Produksi Shift Pagi Di Atas Target', pesan: 'Selamat! Produksi shift pagi hari ini mencapai 178 ton (target 170 ton). Efisiensi 104.7%.', tipe: 'sukses' as const, dibaca: true, modul: 'production', link: '/dashboard?module=production', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Karyawan Alpha Hari Ini', pesan: 'Gunawan Wibowo (Operator Conveyor) tidak hadir tanpa keterangan hari ini.', tipe: 'peringatan' as const, dibaca: false, modul: 'team-activity', link: '/dashboard?module=team-activity', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Insiden Keselamatan Dalam Investigasi', pesan: 'Kecelakaan terpeleset di Conveyor 2 masih dalam tahap investigasi. Pastikan area aman.', tipe: 'bahaya' as const, dibaca: false, modul: 'safety', link: '/dashboard?module=safety', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), judul: 'Jadwal Perawatan Conveyor #3', pesan: 'Service rutin Conveyor #3 dijadwalkan pada 5 Maret 2026. Estimasi biaya Rp 2.500.000.', tipe: 'info' as const, dibaca: true, modul: 'maintenance', link: '/dashboard?module=maintenance', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  notifications.forEach((item) => saveData(KV_PREFIXES.notification, item));
}
