# 🏗️ YWM Dashboard — PT. Yoga Wibawa Mandiri

[![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen)](CHANGELOG.md)
[![AI Powered](https://img.shields.io/badge/AI-Powered%20by%20z--ai-blue)](https://z-ai.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-orange)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)]()
[![React](https://img.shields.io/badge/React-18.3-61dafb)]()

> **Terakhir Diperbarui:** 2026-05-29  
> **Developer:** Tim Teknik | Mulky Malikul Dhaher

---

## 🇮🇩 Tentang Proyek

**YWM Dashboard** adalah platform digital komprehensif untuk **PT. Yoga Wibawa Mandiri**, perusahaan pengantongan Semen Padang yang berlokasi di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh. Dashboard ini mencakup 13 modul operasional dengan AI Assistant terintegrasi, sistem notifikasi cerdas, dan dukungan PWA (Progressive Web App).

### Profil Perusahaan

| Info | Detail |
|------|--------|
| **Nama** | PT. Yoga Wibawa Mandiri (YWM) |
| **Lokasi** | Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh |
| **Bisnis** | Pengantongan semen Semen Padang |
| **Kapasitas** | 500 ton/hari |
| **Kontak** | +62 823-0443-3145 |
| **Email** | info@ywm.co.id |

### Komponen Platform

| Komponen | Deskripsi | Status |
|----------|-----------|--------|
| **Website Korporat** | Website publik (profil, layanan, galeri, kontak) | ✅ Aktif |
| **AI Dashboard** | Dashboard operasional 13 modul dengan AI | ✅ Aktif |
| **AI Chatbot** | Asisten AI yang bisa baca data dashboard & input data | ✅ Aktif |
| **Notifikasi Cerdas** | Popup toast + center + auto-alert dari data | ✅ Aktif |
| **PWA** | Installable, offline-ready, push notification ready | ✅ Aktif |

---

## 📋 Fitur Dashboard — 13 Modul

| # | Modul | Deskripsi | KV Prefix |
|---|-------|-----------|----------|
| 1 | **Ringkasan** | KPI overview, quick actions, alert summary | — |
| 2 | **Suku Cadang** | Inventaris spare part, stok minimum alert, pemasok | `ywm_spare_` |
| 3 | **Tim & Aktivitas** | Kehadiran, kegiatan karyawan, lembur, absensi | `ywm_team_` |
| 4 | **Perawatan** | Work Order, jadwal preventif/korektif, estimasi biaya | `ywm_maint_` |
| 5 | **Produksi** | Pencatatan per shift (pagi/siang/malam), target vs aktual | `ywm_prod_` |
| 6 | **Kalkulasi Silo** | Perhitungan kekosongan silo A & B, volume, tonase | `ywm_silo_calc_` |
| 7 | **Opname Silo** | Berita acara opname silo (sebelum/sesudah bongkar) | `ywm_silo_opname_` |
| 8 | **Keselamatan** | Insiden, inspeksi, severity level, K3 | `ywm_safety_` |
| 9 | **Keuangan** | Pemasukan/pengeluaran, laporan bulanan, budget | `ywm_finance_` |
| 10 | **SDM** | Data karyawan, gaji, cuti, status aktif | `ywm_hr_` |
| 11 | **Dokumen** | Penyimpanan dokumen, kategorisasi | `ywm_doc_` |
| 12 | **Analitik** | Grafik dan analisis tren operasional | — |
| 13 | **Notifikasi** | Alert dan pengingat, popup toast, AI reply | `ywm_notif_` |

---

## 🤖 AI Assistant Features

| Fitur | Deskripsi |
|-------|-----------|
| **Chat Cerdas** | AI yang memahami konteks operasional YWM (peralatan, modul, proses) |
| **Baca Data Dashboard** | AI membaca data real-time (stok, produksi, maintenance, dll.) untuk menjawab pertanyaan spesifik |
| **Input Data via Bahasa Natural** | Cukup ketik "tambah spare part bearing 6205 stok 50", AI akan parse dan simpan |
| **Voice Input** | Input suara menggunakan Web Speech API (bahasa Indonesia) |
| **Streaming Response** | Respons AI ditampilkan secara real-time (SSE streaming) |
| **Peringatan Proaktif** | AI otomatis memperingatkan stok rendah, WO overdue, anomali produksi |
| **Quick Actions** | Tombol aksi cepat: Ringkasan Hari Ini, Cek Stok Rendah, Jadwal Perawatan, dll. |

---

## 🔔 Sistem Notifikasi

| Fitur | Deskripsi |
|-------|-----------|
| **Popup Toast** | Notifikasi muncul di kanan bawah (di atas tombol chatbot) |
| **Auto-dismiss 8 detik** | Popup otomatis hilang setelah 8 detik, pause saat di-hover |
| **Tombol Aksi** | Baca, Buka Modul, Balas AI, Tutup |
| **Balas AI** | Kirim balasan ke notifikasi, AI akan memproses dan menjawab |
| **Notifikasi Cerdas** | Auto-check stok rendah & WO overdue setiap 60 detik |
| **Supabase + localStorage** | Cek data dari Supabase dulu, fallback ke localStorage |
| **Tipe Notifikasi** | Info (cyan), Peringatan (amber), Bahaya (red), Sukses (emerald) |

---

## 📱 PWA Features

| Fitur | Deskripsi |
|-------|-----------|
| **Installable** | Tombol "Instal Aplikasi" muncul di mobile & desktop |
| **Offline Support** | Service worker cache static assets, API responses, dan HTML |
| **Push Notification Ready** | Infrastruktur push notification siap (perlu VAPID key server-side) |
| **Cache Strategy** | Cache-first untuk static, network-first untuk API, separate image cache |
| **Auto Update** | Service worker otomatis update dan refresh saat versi baru tersedia |

---

## 🛠️ Tech Stack

### Frontend

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| React | 18.3+ | UI library |
| TypeScript | 5.5+ | Type safety |
| Vite | 5.4+ | Build tool & dev server |
| Tailwind CSS | 3.4+ | Utility-first styling |
| Shadcn/UI | latest | 50+ komponen UI aksesibel |
| Recharts | 2.12+ | Data visualization |
| React Router | 6.x | Client-side routing |
| TanStack Query | 5.x | Async state management |
| Lucide React | latest | Icon library |
| z-ai-web-dev-sdk | latest | AI backend (z-ai) |

### Backend & Data

| Teknologi | Keterangan |
|-----------|------------|
| Vite Middleware | AI API endpoints (chat, stream, health, smart-parse) |
| Vercel Serverless | Fungsi serverless untuk production |
| Supabase | Database PostgreSQL (primary) |
| localStorage | Fallback offline data |
| Service Worker | PWA caching & push notifications |

### AI

| Komponen | Keterangan |
|----------|------------|
| z-ai-web-dev-sdk | AI SDK untuk chat completions (streaming & non-streaming) |
| Web Speech API | Voice input (Speech-to-Text bahasa Indonesia) |
| System Prompt | Prompt YWM-specific dengan konteks operasional |

---

## 🚀 Instalasi & Setup

### Prasyarat

- Node.js 18+ dan npm/bun
- Akun Supabase (opsional, bisa pakai localStorage)
- Vercel account (untuk deployment)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/mulkymalikuldhrs/yoga-wibawa-mandiri.git
cd yoga-wibawa-mandiri

# 2. Install dependencies
npm install

# 3. Salin file environment variables
cp .env.example .env.local

# 4. Edit .env.local dengan credentials Anda
# (lihat bagian Environment Variables di bawah)

# 5. Jalankan development server
npm run dev

# 6. Build untuk production
npm run build

# 7. Preview production build
npm run preview
```

### Environment Variables

Buat file `.env.local` berdasarkan `.env.example`:

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `VITE_SUPABASE_URL` | URL proyek Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon key Supabase | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID | `service_xxxxx` |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID | `template_xxxxx` |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key | `xxxxxxxxxxxx` |

> **Tanpa Supabase:** Dashboard tetap berfungsi penuh menggunakan localStorage. Data disimpan di browser secara lokal.

---

## 🗄️ Database Setup (Supabase)

### 1. Buat Proyek Supabase

1. Buka [supabase.com](https://supabase.com)
2. Buat proyek baru
3. Salin URL dan anon key ke `.env.local`

### 2. Buat Tabel

Jalankan SQL berikut di SQL Editor Supabase:

```sql
-- Lihat file supabase/schema.sql untuk schema lengkap
-- Tabel utama: spare_parts, production, maintenance, team_activity,
-- safety, finance, hr, documents, notifications, chat_history,
-- silo_calculation, silo_opname
```

### 3. Konfigurasi RLS

Aktifkan Row Level Security pada setiap tabel. Untuk pengembangan awal, gunakan policy:

```sql
CREATE POLICY "Allow all for anon" ON spare_parts FOR ALL USING (true);
```

---

## 🚢 Deployment (Vercel)

### 1. Push ke GitHub

```bash
git add .
git commit -m "feat: YWM Dashboard v2.0.0"
git push origin main
```

### 2. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Import repository dari GitHub
3. Set environment variables di Vercel dashboard
4. Deploy

### 3. Konfigurasi Domain

- Domain default: `your-project.vercel.app`
- Custom domain: Tambahkan di Vercel dashboard

---

## 📲 PWA Installation Guide

### Desktop (Chrome/Edge)

1. Buka dashboard di browser
2. Klik ikon install di address bar
3. Atau klik tombol "Instal Aplikasi" di dashboard
4. Klik "Install"

### Mobile (Android)

1. Buka dashboard di Chrome
2. Klik menu (⋮) → "Add to Home screen"
3. Atau klik banner install yang muncul
4. Aplikasi muncul di home screen

### Mobile (iOS Safari)

1. Buka dashboard di Safari
2. Klik tombol Share → "Add to Home Screen"
3. Klik "Add"
4. Aplikasi muncul di home screen

---

## 📖 Usage Guide

### Modul Suku Cadang

1. Klik "Suku Cadang" di sidebar
2. Lihat daftar semua spare part
3. Tambah spare part baru via form atau AI ("tambah spare part bearing 6205 stok 50")
4. Stok rendah otomatis muncul notifikasi

### Modul Produksi

1. Klik "Produksi" di sidebar
2. Input produksi per shift (pagi/siang/malam)
3. Bandingkan target vs aktual
4. AI bisa menjawab "Bagaimana produksi hari ini?"

### Modul Perawatan

1. Klik "Perawatan" di sidebar
2. Buat Work Order baru (preventif/korektif/darurat)
3. WO overdue otomatis muncul notifikasi bahaya
4. AI bisa menjawab "Jadwal perawatan minggu ini?"

### AI Chatbot

1. Klik tombol chat (kanan bawah, warna cyan)
2. Ketik pertanyaan dalam bahasa Indonesia
3. Atau gunakan tombol Quick Action
4. Untuk input data: ketik dalam bahasa natural
5. Untuk voice: klik tombol mikrofon

---

## 📡 API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/health` | GET | Health check (AI + database status) |
| `/api/chat` | POST | Chat non-streaming (messages array) |
| `/api/chat/stream` | POST | Chat streaming SSE (messages array) |
| `/api/smart-parse` | POST | Parse natural language to structured data |

### Example: Chat Request

```json
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "Berapa stok bearing saat ini?" }
  ]
}
```

### Example: Streaming Response

```
POST /api/chat/stream
Content-Type: text/event-stream

data: {"content":"Berdasarkan"}
data: {"content":" data"}
data: {"content":" dashboard..."}
data: [DONE]
```

---

## 📚 Documentation

| Dokumen | Deskripsi |
|---------|-----------|
| [CHANGELOG.md](CHANGELOG.md) | Riwayat versi lengkap |
| [TODO.md](TODO.md) | Production readiness checklist |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arsitektur sistem & data flow |
| [SECURITY.md](SECURITY.md) | Kebijakan keamanan |
| [PRD.md](PRD.md) | Product Requirements Document |
| [ROADMAP.md](ROADMAP.md) | Development roadmap |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Panduan kontribusi |

---

## ⚠️ Disclaimer

**For Education Purpose Only.** All content, code, and documentation provided in this repository are intended solely for educational and research purposes. The authors and contributors assume no responsibility or liability for any losses, damages, or consequences arising from the use of this software.

**Hanya untuk Tujuan Pendidikan.** Semua konten, kode, dan dokumentasi dalam repositori ini hanya ditujukan untuk tujuan pendidikan dan penelitian. Penulis dan kontributor tidak bertanggung jawab atas risiko atau kerugian apa pun.

---

## 🤝 Contributing

Kontribusi dipersilakan! Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan.

---

## 📬 Contact

**Tim Teknik | Mulky Malikul Dhaher**  
Email: mulkymalikuldhaher@email.com  
GitHub: [https://github.com/mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)

---

## 📄 License

MIT License — Copyright © 2026 Mulky Malikul Dhaher. All rights reserved.
