import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import ZAI from "z-ai-web-dev-sdk";

// ============================================================
// Vite config with integrated AI middleware
// Fixed: proper POST body handling, robust SDK init, enhanced prompt
// ============================================================

let zaiInstance: any = null;
let aiInitAttempted = false;

async function initAI() {
  if (zaiInstance) return zaiInstance;

  // Only attempt init once — no infinite retry loop
  if (aiInitAttempted) return null;
  aiInitAttempted = true;

  try {
    zaiInstance = await ZAI.create();
    console.log('[YWM AI] z-ai-web-dev-sdk initialized successfully');
    return zaiInstance;
  } catch (err: any) {
    console.warn('[YWM AI] Init skipped:', err.message);
    return null;
  }
}

// Do NOT auto-init on startup — let it init lazily when first API call comes in

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

// Helper to parse JSON body from request
function parseBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Body parse timeout')), 10000);
  });
}

// Helper to send JSON response
function sendJSON(res: any, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

// https://vitejs.dev/config/
export default defineConfig({
  // Base path — use "/" for custom domain (teknikywm.vercel.app)
  // Use "/yoga-wibawa-mandiri/" for GitHub Pages sub-path
  base: process.env.VERCEL ? "/" : (process.env.BASE_PATH || "/"),
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"],
          charts: ["recharts"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
  plugins: [
    react(),
    // Custom Vite plugin for AI API endpoints
    {
      name: 'ywm-ai-middleware',
      configureServer(server) {
        // Handle CORS preflight
        server.middlewares.use('/api', (req: any, res: any, next: any) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }
          next();
        });

        // ── Health check ──
        server.middlewares.use('/api/health', async (req: any, res: any) => {
          const ai = await initAI();
          sendJSON(res, 200, {
            status: 'ok',
            ai: ai ? 'ready' : 'not_ready',
            timestamp: new Date().toISOString(),
          });
        });

        // ── Chat (non-streaming) ──
        server.middlewares.use('/api/chat', async (req: any, res: any, next: any) => {
          if (req.method !== 'POST') {
            next();
            return;
          }

          try {
            const ai = await initAI();
            if (!ai) {
              sendJSON(res, 503, { error: 'AI not initialized. Please wait a moment.' });
              return;
            }

            const body = await parseBody(req);
            const { messages } = body;

            if (!messages || !Array.isArray(messages)) {
              sendJSON(res, 400, { error: 'Messages array required' });
              return;
            }

            console.log('[YWM AI] POST /api/chat -', messages.length, 'messages');

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

            console.log('[YWM AI] Response length:', content.length);

            sendJSON(res, 200, {
              message: {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                role: 'assistant',
                content,
                timestamp: new Date().toISOString(),
              },
              usage: completion.usage || null,
            });
          } catch (err: any) {
            console.error('[YWM AI] Chat error:', err.message);
            if (!res.headersSent) {
              sendJSON(res, 500, { error: 'Gagal mendapatkan respons AI', detail: err.message });
            }
          }
        });

        // ── Chat streaming (SSE) ──
        server.middlewares.use('/api/chat/stream', async (req: any, res: any, next: any) => {
          if (req.method !== 'POST') {
            next();
            return;
          }

          try {
            const ai = await initAI();
            if (!ai) {
              sendJSON(res, 503, { error: 'AI not initialized' });
              return;
            }

            const body = await parseBody(req);
            const { messages } = body;

            if (!messages || !Array.isArray(messages)) {
              sendJSON(res, 400, { error: 'Messages array required' });
              return;
            }

            console.log('[YWM AI] POST /api/chat/stream -', messages.length, 'messages');

            // SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.flushHeaders();

            const apiMessages = [
              { role: 'system', content: YWM_SYSTEM_PROMPT },
              ...messages.map((m: any) => ({ role: m.role, content: m.content }))
            ];

            const completion = await ai.chat.completions.create({
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

          } catch (err: any) {
            console.error('[YWM AI] Stream error:', err.message);
            if (!res.headersSent) {
              sendJSON(res, 500, { error: err.message });
            } else {
              try {
                res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
              } catch (e) { /* connection already closed */ }
            }
          }
        });

        // ── Smart Parse ──
        server.middlewares.use('/api/smart-parse', async (req: any, res: any, next: any) => {
          if (req.method !== 'POST') {
            next();
            return;
          }

          try {
            const ai = await initAI();
            if (!ai) {
              sendJSON(res, 503, { error: 'AI not initialized' });
              return;
            }

            const body = await parseBody(req);
            const { input, context } = body;

            if (!input) {
              sendJSON(res, 400, { error: 'Input required' });
              return;
            }

            const completion = await ai.chat.completions.create({
              messages: [
                { role: 'system', content: 'Output hanya JSON murni tanpa markdown. Jangan tambahkan teks lain.' },
                { role: 'user', content: `Parse input berikut menjadi data terstruktur:\n\nInput: "${input}"\nModul: ${context || 'auto-detect'}\n\nOutput format:\n{"module":"nama_modul","action":"create","data":{...}}\n\nModul tersedia: spare-parts, production, maintenance, team-activity, safety, finance, hr` }
              ],
              temperature: 0.1,
              max_tokens: 1000,
            });

            const text = completion.choices?.[0]?.message?.content || '{}';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            sendJSON(res, 200, jsonMatch ? JSON.parse(jsonMatch[0]) : {});
          } catch (err: any) {
            console.error('[YWM AI] Parse error:', err.message);
            sendJSON(res, 500, { error: err.message });
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
