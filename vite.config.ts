import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import ZAI from "z-ai-web-dev-sdk";

// ============================================================
// Vite config with integrated AI middleware
// No separate server needed — AI runs inside Vite dev server
// ============================================================

let zaiInstance = null;

async function initAI() {
  if (!zaiInstance) {
    try {
      zaiInstance = await ZAI.create();
      console.log('[YWM AI] z-ai-web-dev-sdk initialized');
    } catch (err) {
      console.error('[YWM AI] Init failed:', err.message);
    }
  }
  return zaiInstance;
}

// Initialize on startup
initAI();

const YWM_SYSTEM_PROMPT = `Kamu adalah asisten AI cerdas untuk PT. Yoga Wibawa Mandiri (YWM), perusahaan pengantongan Semen Padang di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh.

## PROFIL PERUSAHAAN
- Nama: PT. Yoga Wibawa Mandiri (YWM)
- Lokasi: Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh
- Bisnis: Pengantongan semen Semen Padang
- Kapasitas: 500 ton/hari
- Kontak: +62 823-0443-3145
- Email: info@ywm.co.id

## PERALATAN PABRIK
- Packer A: 4 nozzle (A1, A2, A3, A4)
- Packer B: 4 nozzle (B1, B2, B3, B4)
- Silo A: 7 lubang pengisian, kapasitas ~500 ton
- Silo B: 7 lubang pengisian, kapasitas ~500 ton
- Conveyor Belt: Sistem transport internal
- Generator Set: Backup listrik

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
- maintenance: { judul, mesin, jenis(preventif/korektif/darurat), prioritas(rendah/sedang/tinggi/kritis), status, tanggalMulai, tanggalSelesai, teknisi, estimasiBiaya, catatan }
- team-activity: { namaKaryawan, divisi, aktivitas, status(hadir/izin/sakit/alpha/lembur), jamMasuk, jamKeluar, tanggal, catatan }
- safety: { judul, tanggal, lokasi, severity, status, pelapor, korban, deskripsi, tindakan }
- finance: { tanggal, jenis(pemasukan/pengeluaran), kategori, deskripsi, jumlah, metodePembayaran, referensi, catatan }
- hr: { nama, nip, jabatan, divisi, tanggalMasuk, gajiPokok, status, noTelepon, email, alamat }

## ATURAN
1. Jawab dalam Bahasa Indonesia profesional dan ramah
2. Berikan jawaban praktis dan actionable
3. Jika tidak yakin data spesifik, sarankan cek modul terkait
4. Utamakan safety untuk pertanyaan keselamatan
5. Parse data dengan teliti dan konfirmasi ke user
6. Proaktif beri peringatan jika ada potensi masalah`;

// https://vitejs.dev/config/
export default defineConfig({
  base: "/yoga-wibawa-mandiri/",
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
        // Health check
        server.middlewares.use('/api/health', async (req, res) => {
          const ai = await initAI();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            status: 'ok', 
            ai: ai ? 'ready' : 'not_ready', 
            timestamp: new Date().toISOString() 
          }));
        });

        // Chat endpoint
        server.middlewares.use('/api/chat', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method not allowed');
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const ai = await initAI();
              if (!ai) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'AI not initialized' }));
                return;
              }

              const { messages } = JSON.parse(body);
              if (!messages || !Array.isArray(messages)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Messages array required' }));
                return;
              }

              const apiMessages = [
                { role: 'system', content: YWM_SYSTEM_PROMPT },
                ...messages.map(m => ({ role: m.role, content: m.content }))
              ];

              const completion = await ai.chat.completions.create({
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 2000,
              });

              const content = completion.choices?.[0]?.message?.content || 'Maaf, tidak ada respons dari AI.';

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                message: {
                  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                  role: 'assistant',
                  content,
                  timestamp: new Date().toISOString(),
                },
                usage: completion.usage || null,
              }));

            } catch (err) {
              console.error('[YWM AI] Chat error:', err.message);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Gagal mendapatkan respons AI', detail: err.message }));
            }
          });
        });

        // Chat streaming endpoint
        server.middlewares.use('/api/chat/stream', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method not allowed');
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const ai = await initAI();
              if (!ai) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'AI not initialized' }));
                return;
              }

              const { messages } = JSON.parse(body);
              if (!messages || !Array.isArray(messages)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Messages array required' }));
                return;
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

              const completion = await ai.chat.completions.create({
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 2000,
                stream: true,
              });

              for await (const chunk of completion) {
                const content = chunk.choices?.[0]?.delta?.content;
                if (content) {
                  res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
              }

              res.write('data: [DONE]\n\n');
              res.end();

            } catch (err) {
              console.error('[YWM AI] Stream error:', err.message);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              } else {
                try {
                  res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
                  res.write('data: [DONE]\n\n');
                  res.end();
                } catch (e) { /* ignore */ }
              }
            }
          });
        });

        // Smart parse endpoint
        server.middlewares.use('/api/smart-parse', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method not allowed');
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const ai = await initAI();
              if (!ai) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'AI not initialized' }));
                return;
              }

              const { input, context } = JSON.parse(body);
              if (!input) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Input required' }));
                return;
              }

              const completion = await ai.chat.completions.create({
                messages: [
                  { role: 'system', content: 'Output hanya JSON murni tanpa markdown.' },
                  { role: 'user', content: `Parse: "${input}"\nModul: ${context || 'auto-detect'}\nFormat: {"module":"","action":"create","data":{}}` }
                ],
                temperature: 0.1,
                max_tokens: 1000,
              });

              const text = completion.choices?.[0]?.message?.content || '{}';
              const jsonMatch = text.match(/\{[\s\S]*\}/);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(jsonMatch ? JSON.parse(jsonMatch[0]) : {}));
            } catch (err) {
              console.error('[YWM AI] Parse error:', err.message);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
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
