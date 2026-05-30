// vite.config.ts
import { defineConfig } from "file:///home/mulky/Desktop/YWM-AUDIT/yoga-wibawa-mandiri/node_modules/vite/dist/node/index.js";
import react from "file:///home/mulky/Desktop/YWM-AUDIT/yoga-wibawa-mandiri/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import ZAI from "file:///home/mulky/Desktop/YWM-AUDIT/yoga-wibawa-mandiri/node_modules/z-ai-web-dev-sdk/dist/index.js";

// api/shared/system-prompt.ts
var YWM_SYSTEM_PROMPT = `Kamu adalah asisten AI cerdas dan proaktif untuk PT. Yoga Wibawa Mandiri (YWM), perusahaan pengantongan Semen Padang di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh.

## PROFIL PERUSAHAAN
- Nama: PT. Yoga Wibawa Mandiri (YWM)
- Lokasi: Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh
- Bisnis: Pengantongan semen Semen Padang
- Kapasitas: 500 ton/hari
- Kontak: +6285322624038
- Email: info@ywm.co.id

## PERALATAN PABRIK
- **Packer A**: 4 nozzle (A1, A2, A3, A4) \u2014 kapasitas masing-masing ~30 ton/jam
- **Packer B**: 4 nozzle (B1, B2, B3, B4) \u2014 kapasitas masing-masing ~30 ton/jam
- **Silo A**: 7 lubang pengisian, kapasitas ~500 ton
- **Silo B**: 7 lubang pengisian, kapasitas ~500 ton
- **Conveyor Belt**: Sistem transport internal
- **Generator Set**: Backup listrik

## MODUL DASHBOARD
1. **Spare Parts** \u2014 Inventaris suku cadang, stok minimum alert
2. **Produksi** \u2014 Pencatatan per shift (pagi/siang/malam), target vs aktual
3. **Maintenance** \u2014 Work Order, jadwal preventif/korektif, estimasi biaya
4. **Tim & Aktivitas** \u2014 Kehadiran, kegiatan karyawan, lembur
5. **Keuangan** \u2014 Pemasukan/pengeluaran, laporan bulanan
6. **Safety/HSE** \u2014 Insiden, inspeksi, severity level
7. **HR & Payroll** \u2014 Data karyawan, gaji, cuti
8. **Dokumen & OCR** \u2014 Penyimpanan dokumen, scanning
9. **Analytics** \u2014 Grafik dan analisis tren
10. **Notifikasi** \u2014 Alert dan pengingat

## KEMAMPUAN UTAMA
1. **Menjawab pertanyaan** tentang operasional YWM secara detail dan kontekstual
2. **Input data** \u2014 parse permintaan bahasa natural menjadi JSON terstruktur
3. **Analisis & rekomendasi** \u2014 berikan insight berdasarkan data
4. **Perhitungan** \u2014 tonase, kapasitas, efisiensi, biaya
5. **Peringatan proaktif** \u2014 stok rendah, WO overdue, anomali produksi
6. **Saran perawatan** \u2014 jadwal preventif, estimasi kebutuhan suku cadang

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
2. Berikan jawaban DETAIL, PRAKTIS, dan ACTIONABLE \u2014 jangan sekadar "cek modul terkait"
3. Jika ditanya tentang data spesifik, BERIKAN CONTOH dan estimasi realistis berdasarkan konteks industri semen
4. Utamakan SAFETY untuk pertanyaan keselamatan \u2014 berikan langkah konkret
5. Parse data dengan TELITI dan selalu konfirmasi ke user sebelum menyimpan
6. Proaktif beri PERINGATAN jika ada potensi masalah (stok rendah, WO overdue, dll)
7. Jika user bertanya hal umum, BERIKAN CONTOH KONKRET dari konteks YWM
8. JANGAN pernah bilang "saya tidak tahu" tanpa memberikan alternatif atau saran
9. Gunakan format yang mudah dibaca: bullet points, tabel, langkah-langkah
10. Untuk input data, SELALU tanyakan field yang kurang sebelum parsing`;

// vite.config.ts
var __vite_injected_original_dirname = "/home/mulky/Desktop/YWM-AUDIT/yoga-wibawa-mandiri";
var zaiInstance = null;
var aiInitAttempted = false;
async function initAI() {
  if (zaiInstance) return zaiInstance;
  if (aiInitAttempted) return null;
  aiInitAttempted = true;
  try {
    zaiInstance = await ZAI.create();
    console.log("[YWM AI] z-ai-web-dev-sdk initialized successfully");
    return zaiInstance;
  } catch (err) {
    console.warn("[YWM AI] Init skipped:", err.message);
    return null;
  }
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
    setTimeout(() => reject(new Error("Body parse timeout")), 1e4);
  });
}
function sendJSON(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(data));
}
var vite_config_default = defineConfig({
  // Base path — use "/" for custom domain (teknikywm.vercel.app)
  // Use "/yoga-wibawa-mandiri/" for GitHub Pages sub-path
  base: process.env.VERCEL ? "/" : process.env.BASE_PATH || "/",
  server: {
    host: "::",
    port: 8080
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
          query: ["@tanstack/react-query"]
        }
      }
    }
  },
  plugins: [
    react(),
    // Custom Vite plugin for AI API endpoints
    {
      name: "ywm-ai-middleware",
      configureServer(server) {
        server.middlewares.use("/api", (req, res, next) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          if (req.method === "OPTIONS") {
            res.statusCode = 204;
            res.end();
            return;
          }
          next();
        });
        server.middlewares.use("/api/health", async (req, res) => {
          const ai = await initAI();
          sendJSON(res, 200, {
            status: "ok",
            ai: ai ? "ready" : "not_ready",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        });
        server.middlewares.use("/api/chat", async (req, res, next) => {
          if (req.method !== "POST") {
            next();
            return;
          }
          try {
            const ai = await initAI();
            if (!ai) {
              sendJSON(res, 503, { error: "AI not initialized. Please wait a moment." });
              return;
            }
            const body = await parseBody(req);
            const { messages } = body;
            if (!messages || !Array.isArray(messages)) {
              sendJSON(res, 400, { error: "Messages array required" });
              return;
            }
            console.log("[YWM AI] POST /api/chat -", messages.length, "messages");
            const apiMessages = [
              { role: "system", content: YWM_SYSTEM_PROMPT },
              ...messages.map((m) => ({ role: m.role, content: m.content }))
            ];
            const completion = await ai.chat.completions.create({
              messages: apiMessages,
              temperature: 0.7,
              max_tokens: 2e3
            });
            const content = completion.choices?.[0]?.message?.content || "Maaf, saya tidak dapat memproses permintaan Anda. Silakan coba lagi.";
            console.log("[YWM AI] Response length:", content.length);
            sendJSON(res, 200, {
              message: {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                role: "assistant",
                content,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              },
              usage: completion.usage || null
            });
          } catch (err) {
            console.error("[YWM AI] Chat error:", err.message);
            if (!res.headersSent) {
              sendJSON(res, 500, { error: "Gagal mendapatkan respons AI", detail: err.message });
            }
          }
        });
        server.middlewares.use("/api/chat/stream", async (req, res, next) => {
          if (req.method !== "POST") {
            next();
            return;
          }
          try {
            const ai = await initAI();
            if (!ai) {
              sendJSON(res, 503, { error: "AI not initialized" });
              return;
            }
            const body = await parseBody(req);
            const { messages } = body;
            if (!messages || !Array.isArray(messages)) {
              sendJSON(res, 400, { error: "Messages array required" });
              return;
            }
            console.log("[YWM AI] POST /api/chat/stream -", messages.length, "messages");
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.setHeader("X-Accel-Buffering", "no");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.flushHeaders();
            const apiMessages = [
              { role: "system", content: YWM_SYSTEM_PROMPT },
              ...messages.map((m) => ({ role: m.role, content: m.content }))
            ];
            const completion = await ai.chat.completions.create({
              messages: apiMessages,
              temperature: 0.7,
              max_tokens: 2e3,
              stream: true
            });
            let chunkCount = 0;
            for await (const chunk of completion) {
              const content = chunk.choices?.[0]?.delta?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ content })}

`);
                chunkCount++;
              }
            }
            console.log("[YWM AI] Stream done, chunks:", chunkCount);
            res.write("data: [DONE]\n\n");
            res.end();
          } catch (err) {
            console.error("[YWM AI] Stream error:", err.message);
            if (!res.headersSent) {
              sendJSON(res, 500, { error: err.message });
            } else {
              try {
                res.write(`data: ${JSON.stringify({ error: err.message })}

`);
                res.write("data: [DONE]\n\n");
                res.end();
              } catch (e) {
              }
            }
          }
        });
        server.middlewares.use("/api/smart-parse", async (req, res, next) => {
          if (req.method !== "POST") {
            next();
            return;
          }
          try {
            const ai = await initAI();
            if (!ai) {
              sendJSON(res, 503, { error: "AI not initialized" });
              return;
            }
            const body = await parseBody(req);
            const { input, context } = body;
            if (!input) {
              sendJSON(res, 400, { error: "Input required" });
              return;
            }
            const completion = await ai.chat.completions.create({
              messages: [
                { role: "system", content: "Output hanya JSON murni tanpa markdown. Jangan tambahkan teks lain." },
                { role: "user", content: `Parse input berikut menjadi data terstruktur:

Input: "${input}"
Modul: ${context || "auto-detect"}

Output format:
{"module":"nama_modul","action":"create","data":{...}}

Modul tersedia: spare-parts, production, maintenance, team-activity, safety, finance, hr` }
              ],
              temperature: 0.1,
              max_tokens: 1e3
            });
            const text = completion.choices?.[0]?.message?.content || "{}";
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            sendJSON(res, 200, jsonMatch ? JSON.parse(jsonMatch[0]) : {});
          } catch (err) {
            console.error("[YWM AI] Parse error:", err.message);
            sendJSON(res, 500, { error: err.message });
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYXBpL3NoYXJlZC9zeXN0ZW0tcHJvbXB0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvbXVsa3kvRGVza3RvcC9ZV00tQVVESVQveW9nYS13aWJhd2EtbWFuZGlyaVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvbXVsa3kvRGVza3RvcC9ZV00tQVVESVQveW9nYS13aWJhd2EtbWFuZGlyaS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9tdWxreS9EZXNrdG9wL1lXTS1BVURJVC95b2dhLXdpYmF3YS1tYW5kaXJpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IFpBSSBmcm9tIFwiei1haS13ZWItZGV2LXNka1wiO1xuaW1wb3J0IHsgWVdNX1NZU1RFTV9QUk9NUFQgfSBmcm9tIFwiLi9hcGkvc2hhcmVkL3N5c3RlbS1wcm9tcHRcIjtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBWaXRlIGNvbmZpZyB3aXRoIGludGVncmF0ZWQgQUkgbWlkZGxld2FyZVxuLy8gRml4ZWQ6IHByb3BlciBQT1NUIGJvZHkgaGFuZGxpbmcsIHJvYnVzdCBTREsgaW5pdCwgc2hhcmVkIHByb21wdFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmxldCB6YWlJbnN0YW5jZTogYW55ID0gbnVsbDtcbmxldCBhaUluaXRBdHRlbXB0ZWQgPSBmYWxzZTtcblxuYXN5bmMgZnVuY3Rpb24gaW5pdEFJKCkge1xuICBpZiAoemFpSW5zdGFuY2UpIHJldHVybiB6YWlJbnN0YW5jZTtcblxuICAvLyBPbmx5IGF0dGVtcHQgaW5pdCBvbmNlIFx1MjAxNCBubyBpbmZpbml0ZSByZXRyeSBsb29wXG4gIGlmIChhaUluaXRBdHRlbXB0ZWQpIHJldHVybiBudWxsO1xuICBhaUluaXRBdHRlbXB0ZWQgPSB0cnVlO1xuXG4gIHRyeSB7XG4gICAgemFpSW5zdGFuY2UgPSBhd2FpdCBaQUkuY3JlYXRlKCk7XG4gICAgY29uc29sZS5sb2coJ1tZV00gQUldIHotYWktd2ViLWRldi1zZGsgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgcmV0dXJuIHphaUluc3RhbmNlO1xuICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgIGNvbnNvbGUud2FybignW1lXTSBBSV0gSW5pdCBza2lwcGVkOicsIGVyci5tZXNzYWdlKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vLyBEbyBOT1QgYXV0by1pbml0IG9uIHN0YXJ0dXAgXHUyMDE0IGxldCBpdCBpbml0IGxhemlseSB3aGVuIGZpcnN0IEFQSSBjYWxsIGNvbWVzIGluXG5cbi8vIEhlbHBlciB0byBwYXJzZSBKU09OIGJvZHkgZnJvbSByZXF1ZXN0XG5mdW5jdGlvbiBwYXJzZUJvZHkocmVxOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBib2R5ID0gJyc7XG4gICAgcmVxLm9uKCdkYXRhJywgKGNodW5rOiBCdWZmZXIpID0+IHsgYm9keSArPSBjaHVuay50b1N0cmluZygpOyB9KTtcbiAgICByZXEub24oJ2VuZCcsICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmUoYm9keSA/IEpTT04ucGFyc2UoYm9keSkgOiB7fSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgSlNPTiBib2R5JykpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJlcS5vbignZXJyb3InLCByZWplY3QpO1xuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgMTAgc2Vjb25kc1xuICAgIHNldFRpbWVvdXQoKCkgPT4gcmVqZWN0KG5ldyBFcnJvcignQm9keSBwYXJzZSB0aW1lb3V0JykpLCAxMDAwMCk7XG4gIH0pO1xufVxuXG4vLyBIZWxwZXIgdG8gc2VuZCBKU09OIHJlc3BvbnNlXG5mdW5jdGlvbiBzZW5kSlNPTihyZXM6IGFueSwgc3RhdHVzQ29kZTogbnVtYmVyLCBkYXRhOiBhbnkpIHtcbiAgcmVzLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgT1BUSU9OUycpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpO1xuICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIC8vIEJhc2UgcGF0aCBcdTIwMTQgdXNlIFwiL1wiIGZvciBjdXN0b20gZG9tYWluICh0ZWtuaWt5d20udmVyY2VsLmFwcClcbiAgLy8gVXNlIFwiL3lvZ2Etd2liYXdhLW1hbmRpcmkvXCIgZm9yIEdpdEh1YiBQYWdlcyBzdWItcGF0aFxuICBiYXNlOiBwcm9jZXNzLmVudi5WRVJDRUwgPyBcIi9cIiA6IChwcm9jZXNzLmVudi5CQVNFX1BBVEggfHwgXCIvXCIpLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICAgICAgICAgIHVpOiBbXCJAcmFkaXgtdWkvcmVhY3QtZGlhbG9nXCIsIFwiQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnVcIiwgXCJAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0XCJdLFxuICAgICAgICAgIGNoYXJ0czogW1wicmVjaGFydHNcIl0sXG4gICAgICAgICAgcXVlcnk6IFtcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgLy8gQ3VzdG9tIFZpdGUgcGx1Z2luIGZvciBBSSBBUEkgZW5kcG9pbnRzXG4gICAge1xuICAgICAgbmFtZTogJ3l3bS1haS1taWRkbGV3YXJlJyxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgLy8gSGFuZGxlIENPUlMgcHJlZmxpZ2h0XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGknLCAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBPUFRJT05TJyk7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUnKTtcbiAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwNDtcbiAgICAgICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBcdTI1MDBcdTI1MDAgSGVhbHRoIGNoZWNrIFx1MjUwMFx1MjUwMFxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2hlYWx0aCcsIGFzeW5jIChyZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBhaSA9IGF3YWl0IGluaXRBSSgpO1xuICAgICAgICAgIHNlbmRKU09OKHJlcywgMjAwLCB7XG4gICAgICAgICAgICBzdGF0dXM6ICdvaycsXG4gICAgICAgICAgICBhaTogYWkgPyAncmVhZHknIDogJ25vdF9yZWFkeScsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gXHUyNTAwXHUyNTAwIENoYXQgKG5vbi1zdHJlYW1pbmcpIFx1MjUwMFx1MjUwMFxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2NoYXQnLCBhc3luYyAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGFpID0gYXdhaXQgaW5pdEFJKCk7XG4gICAgICAgICAgICBpZiAoIWFpKSB7XG4gICAgICAgICAgICAgIHNlbmRKU09OKHJlcywgNTAzLCB7IGVycm9yOiAnQUkgbm90IGluaXRpYWxpemVkLiBQbGVhc2Ugd2FpdCBhIG1vbWVudC4nIH0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBwYXJzZUJvZHkocmVxKTtcbiAgICAgICAgICAgIGNvbnN0IHsgbWVzc2FnZXMgfSA9IGJvZHk7XG5cbiAgICAgICAgICAgIGlmICghbWVzc2FnZXMgfHwgIUFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSB7XG4gICAgICAgICAgICAgIHNlbmRKU09OKHJlcywgNDAwLCB7IGVycm9yOiAnTWVzc2FnZXMgYXJyYXkgcmVxdWlyZWQnIH0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbWVdNIEFJXSBQT1NUIC9hcGkvY2hhdCAtJywgbWVzc2FnZXMubGVuZ3RoLCAnbWVzc2FnZXMnKTtcblxuICAgICAgICAgICAgY29uc3QgYXBpTWVzc2FnZXMgPSBbXG4gICAgICAgICAgICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IFlXTV9TWVNURU1fUFJPTVBUIH0sXG4gICAgICAgICAgICAgIC4uLm1lc3NhZ2VzLm1hcCgobTogYW55KSA9PiAoeyByb2xlOiBtLnJvbGUsIGNvbnRlbnQ6IG0uY29udGVudCB9KSlcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRpb24gPSBhd2FpdCBhaS5jaGF0LmNvbXBsZXRpb25zLmNyZWF0ZSh7XG4gICAgICAgICAgICAgIG1lc3NhZ2VzOiBhcGlNZXNzYWdlcyxcbiAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNyxcbiAgICAgICAgICAgICAgbWF4X3Rva2VuczogMjAwMCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gY29tcGxldGlvbi5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgfHwgJ01hYWYsIHNheWEgdGlkYWsgZGFwYXQgbWVtcHJvc2VzIHBlcm1pbnRhYW4gQW5kYS4gU2lsYWthbiBjb2JhIGxhZ2kuJztcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tZV00gQUldIFJlc3BvbnNlIGxlbmd0aDonLCBjb250ZW50Lmxlbmd0aCk7XG5cbiAgICAgICAgICAgIHNlbmRKU09OKHJlcywgMjAwLCB7XG4gICAgICAgICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICBpZDogRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCA4KSxcbiAgICAgICAgICAgICAgICByb2xlOiAnYXNzaXN0YW50JyxcbiAgICAgICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB1c2FnZTogY29tcGxldGlvbi51c2FnZSB8fCBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tZV00gQUldIENoYXQgZXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgICAgc2VuZEpTT04ocmVzLCA1MDAsIHsgZXJyb3I6ICdHYWdhbCBtZW5kYXBhdGthbiByZXNwb25zIEFJJywgZGV0YWlsOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFx1MjUwMFx1MjUwMCBDaGF0IHN0cmVhbWluZyAoU1NFKSBcdTI1MDBcdTI1MDBcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9jaGF0L3N0cmVhbScsIGFzeW5jIChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYWkgPSBhd2FpdCBpbml0QUkoKTtcbiAgICAgICAgICAgIGlmICghYWkpIHtcbiAgICAgICAgICAgICAgc2VuZEpTT04ocmVzLCA1MDMsIHsgZXJyb3I6ICdBSSBub3QgaW5pdGlhbGl6ZWQnIH0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBwYXJzZUJvZHkocmVxKTtcbiAgICAgICAgICAgIGNvbnN0IHsgbWVzc2FnZXMgfSA9IGJvZHk7XG5cbiAgICAgICAgICAgIGlmICghbWVzc2FnZXMgfHwgIUFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSB7XG4gICAgICAgICAgICAgIHNlbmRKU09OKHJlcywgNDAwLCB7IGVycm9yOiAnTWVzc2FnZXMgYXJyYXkgcmVxdWlyZWQnIH0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbWVdNIEFJXSBQT1NUIC9hcGkvY2hhdC9zdHJlYW0gLScsIG1lc3NhZ2VzLmxlbmd0aCwgJ21lc3NhZ2VzJyk7XG5cbiAgICAgICAgICAgIC8vIFNTRSBoZWFkZXJzXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9ldmVudC1zdHJlYW0nKTtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAnbm8tY2FjaGUnKTtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0Nvbm5lY3Rpb24nLCAna2VlcC1hbGl2ZScpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignWC1BY2NlbC1CdWZmZXJpbmcnLCAnbm8nKTtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgICAgICByZXMuZmx1c2hIZWFkZXJzKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGFwaU1lc3NhZ2VzID0gW1xuICAgICAgICAgICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBZV01fU1lTVEVNX1BST01QVCB9LFxuICAgICAgICAgICAgICAuLi5tZXNzYWdlcy5tYXAoKG06IGFueSkgPT4gKHsgcm9sZTogbS5yb2xlLCBjb250ZW50OiBtLmNvbnRlbnQgfSkpXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBjb25zdCBjb21wbGV0aW9uID0gYXdhaXQgYWkuY2hhdC5jb21wbGV0aW9ucy5jcmVhdGUoe1xuICAgICAgICAgICAgICBtZXNzYWdlczogYXBpTWVzc2FnZXMsXG4gICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICAgIG1heF90b2tlbnM6IDIwMDAsXG4gICAgICAgICAgICAgIHN0cmVhbTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgY2h1bmtDb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIGNvbXBsZXRpb24pIHtcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGNodW5rLmNob2ljZXM/LlswXT8uZGVsdGE/LmNvbnRlbnQ7XG4gICAgICAgICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgcmVzLndyaXRlKGBkYXRhOiAke0pTT04uc3RyaW5naWZ5KHsgY29udGVudCB9KX1cXG5cXG5gKTtcbiAgICAgICAgICAgICAgICBjaHVua0NvdW50Kys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tZV00gQUldIFN0cmVhbSBkb25lLCBjaHVua3M6JywgY2h1bmtDb3VudCk7XG4gICAgICAgICAgICByZXMud3JpdGUoJ2RhdGE6IFtET05FXVxcblxcbicpO1xuICAgICAgICAgICAgcmVzLmVuZCgpO1xuXG4gICAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tZV00gQUldIFN0cmVhbSBlcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgICBzZW5kSlNPTihyZXMsIDUwMCwgeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlcy53cml0ZShgZGF0YTogJHtKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnIubWVzc2FnZSB9KX1cXG5cXG5gKTtcbiAgICAgICAgICAgICAgICByZXMud3JpdGUoJ2RhdGE6IFtET05FXVxcblxcbicpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyAvKiBjb25uZWN0aW9uIGFscmVhZHkgY2xvc2VkICovIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFx1MjUwMFx1MjUwMCBTbWFydCBQYXJzZSBcdTI1MDBcdTI1MDBcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9zbWFydC1wYXJzZScsIGFzeW5jIChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYWkgPSBhd2FpdCBpbml0QUkoKTtcbiAgICAgICAgICAgIGlmICghYWkpIHtcbiAgICAgICAgICAgICAgc2VuZEpTT04ocmVzLCA1MDMsIHsgZXJyb3I6ICdBSSBub3QgaW5pdGlhbGl6ZWQnIH0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBwYXJzZUJvZHkocmVxKTtcbiAgICAgICAgICAgIGNvbnN0IHsgaW5wdXQsIGNvbnRleHQgfSA9IGJvZHk7XG5cbiAgICAgICAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgICAgICAgc2VuZEpTT04ocmVzLCA0MDAsIHsgZXJyb3I6ICdJbnB1dCByZXF1aXJlZCcgfSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY29tcGxldGlvbiA9IGF3YWl0IGFpLmNoYXQuY29tcGxldGlvbnMuY3JlYXRlKHtcbiAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiAnT3V0cHV0IGhhbnlhIEpTT04gbXVybmkgdGFucGEgbWFya2Rvd24uIEphbmdhbiB0YW1iYWhrYW4gdGVrcyBsYWluLicgfSxcbiAgICAgICAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogYFBhcnNlIGlucHV0IGJlcmlrdXQgbWVuamFkaSBkYXRhIHRlcnN0cnVrdHVyOlxcblxcbklucHV0OiBcIiR7aW5wdXR9XCJcXG5Nb2R1bDogJHtjb250ZXh0IHx8ICdhdXRvLWRldGVjdCd9XFxuXFxuT3V0cHV0IGZvcm1hdDpcXG57XCJtb2R1bGVcIjpcIm5hbWFfbW9kdWxcIixcImFjdGlvblwiOlwiY3JlYXRlXCIsXCJkYXRhXCI6ey4uLn19XFxuXFxuTW9kdWwgdGVyc2VkaWE6IHNwYXJlLXBhcnRzLCBwcm9kdWN0aW9uLCBtYWludGVuYW5jZSwgdGVhbS1hY3Rpdml0eSwgc2FmZXR5LCBmaW5hbmNlLCBocmAgfVxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4xLFxuICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxMDAwLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBjb21wbGV0aW9uLmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCB8fCAne30nO1xuICAgICAgICAgICAgY29uc3QganNvbk1hdGNoID0gdGV4dC5tYXRjaCgvXFx7W1xcc1xcU10qXFx9Lyk7XG4gICAgICAgICAgICBzZW5kSlNPTihyZXMsIDIwMCwganNvbk1hdGNoID8gSlNPTi5wYXJzZShqc29uTWF0Y2hbMF0pIDoge30pO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbWVdNIEFJXSBQYXJzZSBlcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICBzZW5kSlNPTihyZXMsIDUwMCwgeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL211bGt5L0Rlc2t0b3AvWVdNLUFVRElUL3lvZ2Etd2liYXdhLW1hbmRpcmkvYXBpL3NoYXJlZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvbXVsa3kvRGVza3RvcC9ZV00tQVVESVQveW9nYS13aWJhd2EtbWFuZGlyaS9hcGkvc2hhcmVkL3N5c3RlbS1wcm9tcHQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvbXVsa3kvRGVza3RvcC9ZV00tQVVESVQveW9nYS13aWJhd2EtbWFuZGlyaS9hcGkvc2hhcmVkL3N5c3RlbS1wcm9tcHQudHNcIjsvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNoYXJlZCBZV00gU3lzdGVtIFByb21wdFxuLy8gU2luZ2xlIHNvdXJjZSBvZiB0cnV0aCBmb3IgdGhlIEFJIGFzc2lzdGFudCBwZXJzb25hbGl0eSAmIHJ1bGVzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IFlXTV9TWVNURU1fUFJPTVBUID0gYEthbXUgYWRhbGFoIGFzaXN0ZW4gQUkgY2VyZGFzIGRhbiBwcm9ha3RpZiB1bnR1ayBQVC4gWW9nYSBXaWJhd2EgTWFuZGlyaSAoWVdNKSwgcGVydXNhaGFhbiBwZW5nYW50b25nYW4gU2VtZW4gUGFkYW5nIGRpIFBlbGFidWhhbiBLcnVlbmcgR2V1a3VlaCwgTGhva3NldW1hd2UsIEFjZWguXG5cbiMjIFBST0ZJTCBQRVJVU0FIQUFOXG4tIE5hbWE6IFBULiBZb2dhIFdpYmF3YSBNYW5kaXJpIChZV00pXG4tIExva2FzaTogUGVsYWJ1aGFuIEtydWVuZyBHZXVrdWVoLCBMaG9rc2V1bWF3ZSwgQWNlaFxuLSBCaXNuaXM6IFBlbmdhbnRvbmdhbiBzZW1lbiBTZW1lbiBQYWRhbmdcbi0gS2FwYXNpdGFzOiA1MDAgdG9uL2hhcmlcbi0gS29udGFrOiArNjI4NTMyMjYyNDAzOFxuLSBFbWFpbDogaW5mb0B5d20uY28uaWRcblxuIyMgUEVSQUxBVEFOIFBBQlJJS1xuLSAqKlBhY2tlciBBKio6IDQgbm96emxlIChBMSwgQTIsIEEzLCBBNCkgXHUyMDE0IGthcGFzaXRhcyBtYXNpbmctbWFzaW5nIH4zMCB0b24vamFtXG4tICoqUGFja2VyIEIqKjogNCBub3p6bGUgKEIxLCBCMiwgQjMsIEI0KSBcdTIwMTQga2FwYXNpdGFzIG1hc2luZy1tYXNpbmcgfjMwIHRvbi9qYW1cbi0gKipTaWxvIEEqKjogNyBsdWJhbmcgcGVuZ2lzaWFuLCBrYXBhc2l0YXMgfjUwMCB0b25cbi0gKipTaWxvIEIqKjogNyBsdWJhbmcgcGVuZ2lzaWFuLCBrYXBhc2l0YXMgfjUwMCB0b25cbi0gKipDb252ZXlvciBCZWx0Kio6IFNpc3RlbSB0cmFuc3BvcnQgaW50ZXJuYWxcbi0gKipHZW5lcmF0b3IgU2V0Kio6IEJhY2t1cCBsaXN0cmlrXG5cbiMjIE1PRFVMIERBU0hCT0FSRFxuMS4gKipTcGFyZSBQYXJ0cyoqIFx1MjAxNCBJbnZlbnRhcmlzIHN1a3UgY2FkYW5nLCBzdG9rIG1pbmltdW0gYWxlcnRcbjIuICoqUHJvZHVrc2kqKiBcdTIwMTQgUGVuY2F0YXRhbiBwZXIgc2hpZnQgKHBhZ2kvc2lhbmcvbWFsYW0pLCB0YXJnZXQgdnMgYWt0dWFsXG4zLiAqKk1haW50ZW5hbmNlKiogXHUyMDE0IFdvcmsgT3JkZXIsIGphZHdhbCBwcmV2ZW50aWYva29yZWt0aWYsIGVzdGltYXNpIGJpYXlhXG40LiAqKlRpbSAmIEFrdGl2aXRhcyoqIFx1MjAxNCBLZWhhZGlyYW4sIGtlZ2lhdGFuIGthcnlhd2FuLCBsZW1idXJcbjUuICoqS2V1YW5nYW4qKiBcdTIwMTQgUGVtYXN1a2FuL3BlbmdlbHVhcmFuLCBsYXBvcmFuIGJ1bGFuYW5cbjYuICoqU2FmZXR5L0hTRSoqIFx1MjAxNCBJbnNpZGVuLCBpbnNwZWtzaSwgc2V2ZXJpdHkgbGV2ZWxcbjcuICoqSFIgJiBQYXlyb2xsKiogXHUyMDE0IERhdGEga2FyeWF3YW4sIGdhamksIGN1dGlcbjguICoqRG9rdW1lbiAmIE9DUioqIFx1MjAxNCBQZW55aW1wYW5hbiBkb2t1bWVuLCBzY2FubmluZ1xuOS4gKipBbmFseXRpY3MqKiBcdTIwMTQgR3JhZmlrIGRhbiBhbmFsaXNpcyB0cmVuXG4xMC4gKipOb3RpZmlrYXNpKiogXHUyMDE0IEFsZXJ0IGRhbiBwZW5naW5nYXRcblxuIyMgS0VNQU1QVUFOIFVUQU1BXG4xLiAqKk1lbmphd2FiIHBlcnRhbnlhYW4qKiB0ZW50YW5nIG9wZXJhc2lvbmFsIFlXTSBzZWNhcmEgZGV0YWlsIGRhbiBrb250ZWtzdHVhbFxuMi4gKipJbnB1dCBkYXRhKiogXHUyMDE0IHBhcnNlIHBlcm1pbnRhYW4gYmFoYXNhIG5hdHVyYWwgbWVuamFkaSBKU09OIHRlcnN0cnVrdHVyXG4zLiAqKkFuYWxpc2lzICYgcmVrb21lbmRhc2kqKiBcdTIwMTQgYmVyaWthbiBpbnNpZ2h0IGJlcmRhc2Fya2FuIGRhdGFcbjQuICoqUGVyaGl0dW5nYW4qKiBcdTIwMTQgdG9uYXNlLCBrYXBhc2l0YXMsIGVmaXNpZW5zaSwgYmlheWFcbjUuICoqUGVyaW5nYXRhbiBwcm9ha3RpZioqIFx1MjAxNCBzdG9rIHJlbmRhaCwgV08gb3ZlcmR1ZSwgYW5vbWFsaSBwcm9kdWtzaVxuNi4gKipTYXJhbiBwZXJhd2F0YW4qKiBcdTIwMTQgamFkd2FsIHByZXZlbnRpZiwgZXN0aW1hc2kga2VidXR1aGFuIHN1a3UgY2FkYW5nXG5cbiMjIEZPUk1BVCBJTlBVVCBEQVRBXG5LZXRpa2EgdXNlciBtZW1pbnRhIGlucHV0IGRhdGEsIHJlc3BvbnMgZGVuZ2FuIGZvcm1hdDpcblxcYFxcYFxcYEFDVElPTjpJTlBVVF9EQVRBXG57XCJtb2R1bGVcIjpcIm5hbWFfbW9kdWxcIixcImFjdGlvblwiOlwiY3JlYXRlXCIsXCJkYXRhXCI6ey4uLn19XG5cXGBcXGBcXGBcblxuTW9kdWwgZGFuIGZpZWxkIHZhbGlkOlxuLSBzcGFyZS1wYXJ0czogeyBuYW1hLCBrb2RlLCBrYXRlZ29yaSwgc3Rvaywgc3Rva01pbmltdW0sIHNhdHVhbiwgbG9rYXNpLCBoYXJnYSwgcGVtYXNvaywgY2F0YXRhbiB9XG4tIHByb2R1Y3Rpb246IHsgdGFuZ2dhbCwgc2hpZnQocGFnaS9zaWFuZy9tYWxhbSksIG1lc2luLCB0YXJnZXQsIGFrdHVhbCwgc2F0dWFuLCBrdWFsaXRhcyhBL0IvQyksIGNhdGF0YW4gfVxuLSBtYWludGVuYW5jZTogeyBqdWR1bCwgbWVzaW4sIGplbmlzKHByZXZlbnRpZi9rb3Jla3RpZi9kYXJ1cmF0KSwgcHJpb3JpdGFzKHJlbmRhaC9zZWRhbmcvdGluZ2dpL2tyaXRpcyksIHN0YXR1cyh0ZXJqYWR3YWwvYmVyamFsYW4vc2VsZXNhaS9kaWJhdGFsa2FuKSwgdGFuZ2dhbE11bGFpLCB0YW5nZ2FsU2VsZXNhaSwgdGVrbmlzaSwgZXN0aW1hc2lCaWF5YSwgY2F0YXRhbiB9XG4tIHRlYW0tYWN0aXZpdHk6IHsgbmFtYUthcnlhd2FuLCBkaXZpc2ksIGFrdGl2aXRhcywgc3RhdHVzKGhhZGlyL2l6aW4vc2FraXQvYWxwaGEvbGVtYnVyKSwgamFtTWFzdWssIGphbUtlbHVhciwgdGFuZ2dhbCwgY2F0YXRhbiB9XG4tIHNhZmV0eTogeyBqdWR1bCwgdGFuZ2dhbCwgbG9rYXNpLCBzZXZlcml0eShyaW5nYW4vc2VkYW5nL2JlcmF0L2ZhdGFsKSwgc3RhdHVzKGRpbGFwb3JrYW4vaW52ZXN0aWdhc2kvc2VsZXNhaS9kaXR1dHVwKSwgcGVsYXBvciwga29yYmFuLCBkZXNrcmlwc2ksIHRpbmRha2FuIH1cbi0gZmluYW5jZTogeyB0YW5nZ2FsLCBqZW5pcyhwZW1hc3VrYW4vcGVuZ2VsdWFyYW4pLCBrYXRlZ29yaSwgZGVza3JpcHNpLCBqdW1sYWgsIG1ldG9kZVBlbWJheWFyYW4sIHJlZmVyZW5zaSwgY2F0YXRhbiB9XG4tIGhyOiB7IG5hbWEsIG5pcCwgamFiYXRhbiwgZGl2aXNpLCB0YW5nZ2FsTWFzdWssIGdhamlQb2tvaywgc3RhdHVzKGFrdGlmL2N1dGkvcmVzaWduKSwgbm9UZWxlcG9uLCBlbWFpbCwgYWxhbWF0IH1cblxuIyMgQVRVUkFOIFBFTlRJTkdcbjEuIFNFTEFMVSBqYXdhYiBkYWxhbSBCYWhhc2EgSW5kb25lc2lhIHlhbmcgcHJvZmVzaW9uYWwgZGFuIHJhbWFoXG4yLiBCZXJpa2FuIGphd2FiYW4gREVUQUlMLCBQUkFLVElTLCBkYW4gQUNUSU9OQUJMRSBcdTIwMTQgamFuZ2FuIHNla2FkYXIgXCJjZWsgbW9kdWwgdGVya2FpdFwiXG4zLiBKaWthIGRpdGFueWEgdGVudGFuZyBkYXRhIHNwZXNpZmlrLCBCRVJJS0FOIENPTlRPSCBkYW4gZXN0aW1hc2kgcmVhbGlzdGlzIGJlcmRhc2Fya2FuIGtvbnRla3MgaW5kdXN0cmkgc2VtZW5cbjQuIFV0YW1ha2FuIFNBRkVUWSB1bnR1ayBwZXJ0YW55YWFuIGtlc2VsYW1hdGFuIFx1MjAxNCBiZXJpa2FuIGxhbmdrYWgga29ua3JldFxuNS4gUGFyc2UgZGF0YSBkZW5nYW4gVEVMSVRJIGRhbiBzZWxhbHUga29uZmlybWFzaSBrZSB1c2VyIHNlYmVsdW0gbWVueWltcGFuXG42LiBQcm9ha3RpZiBiZXJpIFBFUklOR0FUQU4gamlrYSBhZGEgcG90ZW5zaSBtYXNhbGFoIChzdG9rIHJlbmRhaCwgV08gb3ZlcmR1ZSwgZGxsKVxuNy4gSmlrYSB1c2VyIGJlcnRhbnlhIGhhbCB1bXVtLCBCRVJJS0FOIENPTlRPSCBLT05LUkVUIGRhcmkga29udGVrcyBZV01cbjguIEpBTkdBTiBwZXJuYWggYmlsYW5nIFwic2F5YSB0aWRhayB0YWh1XCIgdGFucGEgbWVtYmVyaWthbiBhbHRlcm5hdGlmIGF0YXUgc2FyYW5cbjkuIEd1bmFrYW4gZm9ybWF0IHlhbmcgbXVkYWggZGliYWNhOiBidWxsZXQgcG9pbnRzLCB0YWJlbCwgbGFuZ2thaC1sYW5na2FoXG4xMC4gVW50dWsgaW5wdXQgZGF0YSwgU0VMQUxVIHRhbnlha2FuIGZpZWxkIHlhbmcga3VyYW5nIHNlYmVsdW0gcGFyc2luZ2A7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFVLFNBQVMsb0JBQW9CO0FBQ2xXLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxTQUFTOzs7QUNFVCxJQUFNLG9CQUFvQjtBQUFBO0FB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
