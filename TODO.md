# 📋 TODO — PT Yoga Wibawa Mandiri AI Dashboard

> **Master Task List** — Semua pekerjaan untuk platform digital YWM berbasis Puter.js
> **Terakhir Diperbarui:** 2026-03-05
> **Maintainer:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

---

## 🎯 Overview

Proyek ini mencakup 3 track utama:
1. **Website Korporat** — Website publik yang sudah ada (perlu upgrade)
2. **AI Dashboard** — Dashboard operasional komprehensif berbasis Puter.js (baru)
3. **Integrasi** — Penggabungan website dan dashboard dengan AI Assistant

Semua kode berada dalam repositori ini.

---

## 📊 Progress Summary

| Track | Total | ✅ Done | 🚧 In Progress | ⬜ Pending |
|-------|-------|---------|----------------|-----------|
| Phase 0: Planning & Docs | 10 | 10 | 0 | 0 |
| Phase 1: Core + AI + Auth | 15 | 15 | 0 | 0 |
| Phase 2: Operational Modules | 21 | 21 | 0 | 0 |
| Phase 3: Advanced Modules | 20 | 20 | 0 | 0 |
| Phase 4: Analytics + Reports | 15 | 15 | 0 | 0 |
| Phase 5: Website Upgrade | 9 | 0 | 0 | 9 |
| Phase 6: Mobile + PWA | 9 | 0 | 0 | 9 |
| **TOTAL** | **99** | **81** | **0** | **18** |

---

## Phase 0: Planning & Documentation

- [x] Analisis repo YWM yang sudah ada
- [x] Identifikasi stack teknologi saat ini (Vite + React + TS + Shadcn/UI)
- [x] Buat blueprint data komprehensif (25 bab)
- [x] Siapkan TODO.md master task list
- [x] Identifikasi pilar-pilar dashboard (12 pilar → 15+ modul)
- [x] Definisikan struktur data per modul
- [x] Buat ARCHITECTURE.md dengan arsitektur Puter.js
- [x] Buat ROADMAP.md development roadmap
- [x] Siapkan semua docs pendukung (DASHBOARD.md, PUTER_INTEGRATION.md)
- [x] Update README.md, CHANGELOG.md, CONTRIBUTING.md untuk Puter.js

---

## Phase 1: Core Dashboard + AI Assistant + Auth

### 1.1 Puter.js Integration
- [x] Install dan konfigurasi Puter.js SDK di proyek
- [x] Buat `src/services/puterService.ts` — service layer utama Puter.js
- [x] Buat `src/services/kvService.ts` — KV Store CRUD abstractions
- [x] Buat `src/services/fsService.ts` — File System operations
- [x] Buat `src/services/aiService.ts` — AI operations (chat, OCR, TTS, STT)
- [x] Buat `src/services/authService.ts` — Auth operations
- [x] Buat `src/types/puter.ts` — TypeScript type definitions untuk Puter.js

### 1.2 Authentication & Authorization
- [x] Implementasi Puter Auth (login/logout/getUser)
- [x] Buat RBAC system dengan KV Store (`ywm:auth:role:{username}`)
- [x] Buat halaman login dengan glassmorphic design
- [x] Implementasi auth guard & redirect logic
- [x] Buat role-based navigation menu (9 roles)

### 1.3 Dashboard Shell
- [x] Buat dashboard layout (glassmorphic sidebar + header + content area)
- [x] Implementasi routing dashboard (`/dashboard/*`)
- [x] Buat dashboard homepage dengan KPI overview cards
- [x] Implementasi glassmorphic design system (Tailwind config + CSS variables)
- [x] Buat Zustand stores untuk dashboard state
- [x] Setup TanStack Query untuk data fetching/caching dari KV Store

### 1.4 AI Assistant
- [x] Buat AI chat interface component
- [x] Integrasi Puter AI chat completions (GPT-4o-mini)
- [x] Implementasi system prompt dengan konteks YWM
- [x] Buat context builder (ambil data dari KV Store untuk konteks AI)
- [x] Implementasi voice input (STT via Puter AI)
- [x] Implementasi text-to-speech (TTS via Puter AI)
- [x] Implementasi AI-powered smart suggestions

### 1.5 Auto Timestamp System
- [x] Buat `useAutoTimestamp` hook
- [x] Implementasi timestamp di semua data write operations
- [x] Buat audit trail logging ke KV Store
- [x] Implementasi audit trail viewer

---

## Phase 2: Operational Modules

### 2.1 Spare Parts Inventory (`ywm:sparepart:`)
- [x] Buat type definitions (`src/types/sparePart.ts`)
- [x] Buat KV Store service untuk spare parts
- [x] Halaman daftar spare part (data table + search + filter kategori)
- [x] Halaman detail spare part (info + riwayat transaksi + chart pemakaian)
- [x] Form tambah/edit spare part (React Hook Form + Zod)
- [x] Reorder alert system (stok di bawah minimum → notifikasi)
- [x] Part-mesin mapping visualization
- [x] Laporan pemakaian spare part per periode
- [x] Export data spare part (CSV, Excel)

### 2.2 Team Activity (`ywm:team:`)
- [x] Buat type definitions (`src/types/team.ts`)
- [x] Buat KV Store service untuk team activity
- [x] Halaman manajemen tim & karyawan
- [x] Pencatatan kegiatan harian (check-in/check-out)
- [x] Timeline view kegiatan tim
- [x] Laporan kinerja tim per periode
- [x] Integrasi auto timestamp (server-side via KV)
- [x] Team performance charts (Recharts)

### 2.3 Maintenance Schedule (`ywm:maintenance:`)
- [x] Buat type definitions (`src/types/maintenance.ts`)
- [x] Buat KV Store service untuk maintenance/work orders
- [x] Work order list (filter by status, prioritas, mesin)
- [x] Form buat WO (preventive/corrective/predictive)
- [x] WO detail (timeline, spare part digunakan, biaya)
- [x] Jadwal preventive maintenance calendar view
- [x] Laporan biaya maintenance per periode
- [x] Auto WO number generation

### 2.4 Production Tracker (`ywm:production:`)
- [x] Buat type definitions (`src/types/production.ts`)
- [x] Buat KV Store service untuk production data
- [x] Halaman produksi harian (input + chart + summary)
- [x] Halaman penerimaan semen curah
- [x] Halaman distribusi & tracking pengiriman
- [x] Widget OEE (Overall Equipment Effectiveness)
- [x] Laporan produksi mingguan/bulanan (exportable)
- [x] Production dashboard widgets (live counter, trend chart)

---

## Phase 3: Advanced Modules

### 3.1 Quality Control (`ywm:qc:`)
- [x] Buat type definitions untuk QC
- [x] Buat KV Store service untuk QC records
- [x] Form input hasil QC per batch
- [x] Chart kekuatan tekan (1d/3d/7d/28d) trend
- [x] Chart berat zak distribution
- [x] Alert jika parameter di luar spesifikasi SNI
- [x] Laporan QC exportable

### 3.2 Finance & Accounting (`ywm:finance:`)
- [x] Buat type definitions untuk finance
- [x] Buat KV Store service untuk transaksi keuangan
- [x] Dashboard keuangan (revenue, cost, margin)
- [x] Pencatatan transaksi keuangan (CRUD)
- [x] Budget monitoring vs actual
- [x] Cost per zak analysis
- [x] Laporan keuangan per periode

### 3.3 HR & Payroll (`ywm:hr:`)
- [x] Buat type definitions untuk HR
- [x] Buat KV Store service untuk data karyawan
- [x] Data karyawan management (CRUD)
- [x] Absensi digital (biometric integration ready)
- [x] Pengajuan cuti & lembur
- [x] Payroll calculation (basic)
- [x] Laporan kehadiran per periode

### 3.4 Safety & HSE (`ywm:hse:`)
- [x] Buat type definitions untuk HSE
- [x] Buat KV Store service untuk insiden HSE
- [x] Insiden & near miss reporting form
- [x] Inspeksi safety checklist (template-based)
- [x] Dashboard K3 metrics
- [x] Corrective action tracking
- [x] Laporan HSE per periode

### 3.5 Document & OCR (`ywm:doc:`)
- [x] Buat type definitions untuk documents
- [x] Buat KV Store service untuk document metadata
- [x] Upload dokumen ke Puter FS
- [x] OCR scanning via Puter AI (`puter.ai.ocr()`)
- [x] Data extraction dari dokumen (AI-assisted parsing)
- [x] Document version control
- [x] Document search & categorization

---

## Phase 4: Analytics, Reports & Notifications

### 4.1 Analytics Dashboard (`ywm:analytics:`)
- [x] Buat KV Store service untuk analytics aggregations
- [x] KPI dashboard dengan trend analysis
- [x] Production analytics (OEE, yield, downtime charts)
- [x] Financial analytics (margin, cost trends)
- [x] Inventory analytics (turnover rate, aging analysis)
- [x] AI-powered forecasting (demand prediction via Puter AI)

### 4.2 Reports
- [x] Report builder (customizable report templates)
- [x] Export ke PDF (jspdf + autoTable)
- [x] Export ke Excel (xlsx library)
- [x] Scheduled report generation (daily/weekly/monthly)
- [x] Report templates (produksi, maintenance, QC, finance)

### 4.3 Notifications (`ywm:notification:`)
- [x] Notification center UI (bell icon + dropdown)
- [x] Real-time alerts (reorder point, WO overdue, production anomaly)
- [x] Notification preferences per user (KV Store)
- [x] TTS notifications (voice alerts via Puter AI)
- [x] WhatsApp integration (future phase)

---

## Phase 5: Website Upgrade + Integration

### 5.1 Website Redesign
- [ ] Redesign homepage dengan glassmorphic style yang konsisten
- [ ] Tambah live production counter (data dari KV Store)
- [ ] Public dashboard (KPI ringkasan untuk publik — read-only)
- [ ] Smooth page transitions (Framer Motion)
- [ ] Dark mode support (next-themes)

### 5.2 Integration
- [ ] Single sign-on (Puter Auth) antara website & dashboard
- [ ] Shared navigation (website → dashboard seamless transition)
- [ ] AI chatbot di website (powered by Puter AI)
- [ ] SEO optimization (meta tags, structured data, sitemap)

---

## Phase 6: Mobile Optimization + PWA

### 6.1 Mobile Optimization
- [ ] Responsive dashboard layout untuk mobile (< 768px)
- [ ] Touch-friendly interactions (44px minimum touch targets)
- [ ] Mobile-optimized data tables (card view on mobile)
- [ ] Bottom navigation untuk mobile
- [ ] Safe area handling (iOS notch, etc.)

### 6.2 PWA
- [ ] Service worker setup (caching strategy)
- [ ] Manifest.json configuration (icons, theme, shortcuts)
- [ ] Offline mode (cached KV data + read-only operations)
- [ ] Push notifications (if supported by Puter)
- [ ] Install prompt (custom install UI)

---

## 🏷️ Priority Labels

| Label | Arti | SLA |
|-------|------|-----|
| 🔴 Critical | Blocker, harus selesai sebelum lanjut ke phase berikutnya | 1 hari |
| 🟠 High | Fitur utama, penting untuk launch phase | 1 minggu |
| 🟡 Medium | Fitur pendukung, bisa ditunda ke sprint berikutnya | 2 minggu |
| 🟢 Low | Nice-to-have, prioritas rendah | 1 bulan |

---

## 📅 Timeline

| Phase | Mulai | Selesai | Durasi |
|-------|-------|---------|--------|
| Phase 0: Planning | 2026-02-25 | 2026-03-05 | 9 hari |
| Phase 1: Core + AI | 2026-03-06 | 2026-04-02 | 4 minggu |
| Phase 2: Operational | 2026-04-03 | 2026-05-14 | 6 minggu |
| Phase 3: Advanced | 2026-05-15 | 2026-06-25 | 6 minggu |
| Phase 4: Analytics | 2026-06-26 | 2026-07-23 | 4 minggu |
| Phase 5: Website | 2026-07-24 | 2026-08-20 | 4 minggu |
| Phase 6: Mobile | 2026-08-21 | 2026-09-17 | 4 minggu |

---

## 🔗 Related Documents

| Dokumen | Deskripsi |
|---------|-----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arsitektur sistem lengkap (Puter.js) |
| [ROADMAP.md](ROADMAP.md) | Development roadmap per phase |
| [docs/DASHBOARD.md](docs/DASHBOARD.md) | Dokumentasi lengkap semua modul dashboard |
| [docs/PUTER_INTEGRATION.md](docs/PUTER_INTEGRATION.md) | Panduan integrasi Puter.js |
| [docs/DATA_BLUEPRINT.md](docs/DATA_BLUEPRINT.md) | Struktur data dan KV key patterns |

---

🤝 Contributing | Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

⚠️ Education Purpose Only | Risiko apapun tidak kita tanggung

📄 MIT License — Copyright © Mulky Malikul Dhaher
