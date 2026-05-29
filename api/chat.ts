// ============================================================
// Vercel Serverless Function — /api/chat
// AI chat endpoint using z-ai-web-dev-sdk
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Keep AI instance warm across invocations
let zaiInstance: any = null;

async function getAI() {
  if (zaiInstance) return zaiInstance;
  try {
    zaiInstance = await ZAI.create();
    console.log('[YWM AI Vercel] z-ai-web-dev-sdk initialized');
    return zaiInstance;
  } catch (err: any) {
    console.error('[YWM AI Vercel] Init failed:', err.message);
    return null;
  }
}

const YWM_SYSTEM_PROMPT = `Kamu adalah asisten AI cerdas dan proaktif untuk PT. Yoga Wibawa Mandiri (YWM), perusahaan pengantongan Semen Padang di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh.

## PROFIL PERUSAHAAN
- Nama: PT. Yoga Wibawa Mandiri (YWM)
- Lokasi: Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh
- Bisnis: Pengantongan semen Semen Padang
- Kapasitas: 500 ton/hari
- Kontak: +62 823-0443-3145
- Email: info@ywm.co.id

## PERALATAN PABRIK
- **Packer A**: 4 nozzle (A1, A2, A3, A4) — kapasitas masing-masing ~30 ton/jam
- **Packer B**: 4 nozzle (B1, B2, B3, B4) — kapasitas masing-masing ~30 ton/jam
- **Silo A**: 7 lubang pengisian, kapasitas ~500 ton
- **Silo B**: 7 lubang pengisian, kapasitas ~500 ton
- **Conveyor Belt**: Sistem transport internal
- **Generator Set**: Backup listrik

## MODUL DASHBOARD
1. **Spare Parts** — Inventaris suku cadang, stok minimum alert
2. **Produksi** — Pencatatan per shift (pagi/siang/malam), target vs aktual
3. **Maintenance** — Work Order, jadwal preventif/korektif, estimasi biaya
4. **Tim & Aktivitas** — Kehadiran, kegiatan karyawan, lembur
5. **Keuangan** — Pemasukan/pengeluaran, laporan bulanan
6. **Safety/HSE** — Insiden, inspeksi, severity level
7. **HR & Payroll** — Data karyawan, gaji, cuti
8. **Dokumen & OCR** — Penyimpanan dokumen, scanning
9. **Analytics** — Grafik dan analisis tren
10. **Notifikasi** — Alert dan pengingat

## KEMAMPUAN UTAMA
1. **Menjawab pertanyaan** tentang operasional YWM secara detail dan kontekstual
2. **Input data** — parse permintaan bahasa natural menjadi JSON terstruktur
3. **Analisis & rekomendasi** — berikan insight berdasarkan data
4. **Perhitungan** — tonase, kapasitas, efisiensi, biaya
5. **Peringatan proaktif** — stok rendah, WO overdue, anomali produksi
6. **Saran perawatan** — jadwal preventif, estimasi kebutuhan suku cadang

## FORMAT INPUT DATA
Ketika user meminta input data, respons dengan format:
\`\`\`ACTION:INPUT_DATA
{"module":"nama_modul","action":"create","data":{...}}
\`\`\`

Modul dan field valid:
- spare-parts: { nama, kode, kategori, stok, stokMinimum, satuan, lokasi, harga, pemasok, catatan }
- production: { tanggal, shift(pagi/siang/malam), mesin, target, aktual, satuan, kualitas(A/B/C), catatan }
- maintenance: { judul, mesin, jenis(preventif/korektif/darurat), prioritas(rendah/sedang/tinggi/kritis), status(terjadwal/berjalan/selesai/dibatalkan), tanggalMulai, tanggalSelesai, teknisi, estimasiBiaya, catatan }
- team-activity: { namaKaryawan, divisi, aktivitas, status(hadir/izin/sakit/alpha/lembur), jamMasuk, jamKeluar, tanggal, catatan }
- safety: { judul, tanggal, lokasi, severity(ringan/sedang/berat/fatal), status(dilaporkan/investigasi/selesai/ditutup), pelapor, korban, deskripsi, tindakan }
- finance: { tanggal, jenis(pemasukan/pengeluaran), kategori, deskripsi, jumlah, metodePembayaran, referensi, catatan }
- hr: { nama, nip, jabatan, divisi, tanggalMasuk, gajiPokok, status(aktif/cuti/resign), noTelepon, email, alamat }

## ATURAN PENTING
1. SELALU jawab dalam Bahasa Indonesia yang profesional dan ramah
2. Berikan jawaban DETAIL, PRAKTIS, dan ACTIONABLE — jangan sekadar "cek modul terkait"
3. Jika ditanya tentang data spesifik, BERIKAN CONTOH dan estimasi realistis berdasarkan konteks industri semen
4. Utamakan SAFETY untuk pertanyaan keselamatan — berikan langkah konkret
5. Parse data dengan TELITI dan selalu konfirmasi ke user sebelum menyimpan
6. Proaktif beri PERINGATAN jika ada potensi masalah (stok rendah, WO overdue, dll)
7. Jika user bertanya hal umum, BERIKAN CONTOH KONKRET dari konteks YWM
8. JANGAN pernah bilang "saya tidak tahu" tanpa memberikan alternatif atau saran
9. Gunakan format yang mudah dibaca: bullet points, tabel, langkah-langkah
10. Untuk input data, SELALU tanyakan field yang kurang sebelum parsing`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = await getAI();
    if (!ai) {
      return res.status(503).json({ error: 'AI not initialized' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    console.log('[YWM AI Vercel] POST /api/chat -', messages.length, 'messages');

    const apiMessages = [
      { role: 'system', content: YWM_SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const completion = await ai.chat.completions.create({
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda. Silakan coba lagi.';

    console.log('[YWM AI Vercel] Response length:', content.length);

    return res.status(200).json({
      message: {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      },
      usage: completion.usage || null,
    });
  } catch (err: any) {
    console.error('[YWM AI Vercel] Chat error:', err.message);
    return res.status(500).json({ error: 'Gagal mendapatkan respons AI', detail: err.message });
  }
}
