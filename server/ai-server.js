// ============================================================
// YWM AI Backend Server — Express + z-ai-web-dev-sdk
// Robust version with proper error handling and keep-alive
// ============================================================

import express from 'express';
import cors from 'cors';
import ZAI from 'z-ai-web-dev-sdk';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Keep-alive & timeout settings
app.use((req, res, next) => {
  res.setTimeout(120000); // 2 minute timeout for AI responses
  next();
});

// ── AI Instance ──
let zai = null;

async function initAI() {
  try {
    zai = await ZAI.create();
    console.log('[YWM AI] z-ai-web-dev-sdk initialized successfully');
  } catch (err) {
    console.error('[YWM AI] Failed to initialize:', err.message);
    // Retry after 5 seconds
    console.log('[YWM AI] Retrying in 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    return initAI();
  }
}

// ── YWM System Prompt ──
const YWM_SYSTEM_PROMPT = `Kamu adalah asisten AI cerdas untuk PT. Yoga Wibawa Mandiri (YWM), perusahaan pengantongan Semen Padang di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh.

## PROFIL PERUSAHAAN
- Nama: PT. Yoga Wibawa Mandiri (YWM)
- Lokasi: Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh
- Bisnis: Pengantongan semen Semen Padang
- Kapasitas: 500 ton/hari
- Kontak: +62 823-0443-3145
- Email: info@ywm.co.id

## PERALATAN PABRIK
- **Packer A**: 4 nozzle (A1, A2, A3, A4)
- **Packer B**: 4 nozzle (B1, B2, B3, B4)
- **Silo A**: 7 lubang pengisian, kapasitas ~500 ton
- **Silo B**: 7 lubang pengisian, kapasitas ~500 ton
- **Conveyor Belt**: Sistem transport internal
- **Generator Set**: Backup listrik

## MODUL DASHBOARD
1. Spare Parts — Inventaris suku cadang
2. Produksi — Pencatatan per shift
3. Maintenance — Work Order, jadwal
4. Tim & Aktivitas — Kehadiran, kegiatan
5. Quality Control — Inspeksi kualitas
6. Keuangan — Pemasukan/pengeluaran
7. HR & Payroll — Data karyawan
8. Purchasing — Purchase Order
9. Safety/HSE — Insiden, inspeksi
10. Dokumen & OCR — Penyimpanan dokumen
11. Analytics — Grafik dan analisis
12. Notifikasi — Alert dan pengingat

## KEMAMPUAN
1. Menjawab pertanyaan tentang operasional YWM
2. Input data — parse permintaan menjadi JSON terstruktur
3. Analisis dan rekomendasi
4. Perhitungan tonase, kapasitas, efisiensi

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

## ATURAN
1. Jawab dalam Bahasa Indonesia profesional dan ramah
2. Berikan jawaban praktis dan actionable
3. Jika tidak yakin data spesifik, sarankan cek modul terkait
4. Utamakan safety untuk pertanyaan keselamatan
5. Parse data dengan teliti dan konfirmasi ke user
6. Proaktif beri peringatan jika ada potensi masalah`;

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ai: zai ? 'ready' : 'not_ready', timestamp: new Date().toISOString() });
});

// ── Chat (non-streaming) ──
app.post('/api/chat', async (req, res) => {
  console.log('[YWM AI] POST /api/chat');
  try {
    if (!zai) {
      return res.status(503).json({ error: 'AI not initialized' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const apiMessages = [
      { role: 'system', content: YWM_SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    console.log('[YWM AI] Calling AI with', apiMessages.length, 'messages');

    const completion = await zai.chat.completions.create({
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices?.[0]?.message?.content || 'Maaf, tidak ada respons dari AI.';
    console.log('[YWM AI] Response length:', content.length);

    res.json({
      message: {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      },
      usage: completion.usage || null,
    });

  } catch (err) {
    console.error('[YWM AI] Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Gagal mendapatkan respons AI', detail: err.message });
    }
  }
});

// ── Chat (streaming via SSE) ──
app.post('/api/chat/stream', async (req, res) => {
  console.log('[YWM AI] POST /api/chat/stream');
  try {
    if (!zai) {
      return res.status(503).json({ error: 'AI not initialized' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const apiMessages = [
      { role: 'system', content: YWM_SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    console.log('[YWM AI] Streaming with', apiMessages.length, 'messages');

    const completion = await zai.chat.completions.create({
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    let chunkCount = 0;
    for await (const chunk of completion) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
        chunkCount++;
      }
    }

    console.log('[YWM AI] Stream done, chunks:', chunkCount);
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('[YWM AI] Stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Gagal streaming AI', detail: err.message });
    } else {
      try {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (e) {
        // Connection already closed
      }
    }
  }
});

// ── Smart Parse ──
app.post('/api/smart-parse', async (req, res) => {
  try {
    if (!zai) {
      return res.status(503).json({ error: 'AI not initialized' });
    }

    const { input, context } = req.body;
    if (!input) {
      return res.status(400).json({ error: 'Input required' });
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Output hanya JSON murni tanpa markdown.' },
        { role: 'user', content: `Parse: "${input}"\nModul: ${context || 'auto-detect'}\nFormat: {"module":"","action":"create","data":{}}` }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const text = completion.choices?.[0]?.message?.content || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    res.json(jsonMatch ? JSON.parse(jsonMatch[0]) : {});
  } catch (err) {
    console.error('[YWM AI] Parse error:', err.message);
    res.status(500).json({ error: 'Gagal parse', detail: err.message });
  }
});

// ── Process error handling ──
process.on('uncaughtException', (err) => {
  console.error('[YWM AI] Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('[YWM AI] Unhandled Rejection:', err);
});

// ── Start ──
console.log('[YWM AI] Initializing...');
initAI().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[YWM AI Server] Running on http://0.0.0.0:${PORT}`);
    console.log('[YWM AI] Endpoints:');
    console.log(`  GET  /api/health`);
    console.log(`  POST /api/chat`);
    console.log(`  POST /api/chat/stream`);
    console.log(`  POST /api/smart-parse`);
  });

  server.timeout = 120000;
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 125000;
});
