# 🗺️ ROADMAP — PT Yoga Wibawa Mandiri AI Dashboard

> **Development Roadmap** — Peta jalan pengembangan dari website korporat hingga dashboard AI komprehensif
> **Versi:** 5.0.0 | **Terakhir Diperbarui:** 2026-05-26
> **Maintainer:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

---

## 🎯 Visi

Membangun platform digital operasional terpadu untuk PT Yoga Wibawa Mandiri yang menggabungkan:
- **Dashboard operasional** dengan 15+ modul manajemen
- **AI Assistant** yang memahami konteks operasional perusahaan
- **Zero backend** menggunakan Puter.js (tanpa server, tanpa API key)
- **Glassmorphic UI** yang modern dan profesional

---

## 📅 Timeline Overview

```
2026
Maret          April           Mei            Juni
┌──────────────┬───────────────┬──────────────┬──────────────┐
│  Phase 1 ✅  │  Phase 2 ✅   │  Phase 3 ✅  │  Phase 4 ✅  │
│  Core + AI   │  Operational  │  Advanced    │  Analytics   │
│  + Auth      │  Modules      │  Modules     │  + Reports   │
└──────────────┴───────────────┴──────────────┴──────────────┘

Mei            Juli           Ags-Sept        Okt-Nov
┌──────────────┬───────────────┬──────────────┬──────────────┐
│  Phase 4.5 ✅│  Phase 5 ⬜  │  Phase 6 ⬜  │              │
│  AI Agent +  │  Website     │  Mobile +    │              │
│  Code Quality│  Upgrade     │  PWA         │              │
└──────────────┴───────────────┴──────────────┴──────────────┘
```

---

## Phase 1: Core Dashboard + AI Assistant + Auth

**Durasi:** 4 minggu (Minggu 1-4)
**Status:** ✅ Selesai
**Prioritas:** 🔴 Critical

### Tujuan
Membangun fondasi dashboard dengan autentikasi Puter.js, AI Assistant, dan glassmorphic design system.

### Deliverables

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 1.1 | Setup Puter.js integration (`puter.js` SDK) | ✅ Done | 🔴 |
| 1.2 | Implementasi Puter Auth (login/logout/session) | ✅ Done | 🔴 |
| 1.3 | Buat RBAC system dengan KV Store | ✅ Done | 🔴 |
| 1.4 | Buat dashboard layout (sidebar + header + content) | ✅ Done | 🔴 |
| 1.5 | Implementasi glassmorphic design system (Custom CSS) | ✅ Done | 🔴 |
| 1.6 | Buat dashboard homepage dengan KPI overview cards | ✅ Done | 🔴 |
| 1.7 | Implementasi AI Assistant (chat interface) | ✅ Done | 🔴 |
| 1.8 | Integrasi Puter AI chat completions | ✅ Done | 🔴 |
| 1.9 | Implementasi voice input (STT via Puter AI) | ✅ Done | 🟠 |
| 1.10 | Implementasi text-to-speech (TTS via Puter AI) | ✅ Done | 🟡 |
| 1.11 | Buat auto timestamp system | ✅ Done | 🔴 |
| 1.12 | Setup KV Store service layer (CRUD abstractions) | ✅ Done | 🔴 |
| 1.13 | Implementasi YWM.App router & state management | ✅ Done | 🟠 |
| 1.14 | Setup data fetching/caching layer | ✅ Done | 🟠 |
| 1.15 | Buat navigation & routing dashboard | ✅ Done | 🔴 |

### Milestone
- ✅ User bisa login via Puter Auth
- ✅ Dashboard menampilkan KPI overview
- ✅ AI Assistant bisa menjawab pertanyaan tentang YWM
- ✅ Voice input berfungsi untuk AI Assistant
- ✅ Glassmorphic UI konsisten di semua halaman

---

## Phase 2: Operational Modules

**Durasi:** 6 minggu (Minggu 5-10)
**Status:** ✅ Selesai
**Prioritas:** 🔴 Critical

### Tujuan
Mengimplementasikan modul-modul operasional inti yang dibutuhkan untuk menjalankan operasional harian.

### 2.1 Spare Parts Inventory

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 2.1.1 | Halaman daftar spare part (data table + search + filter) | ✅ Done | 🔴 |
| 2.1.2 | Halaman detail spare part (info + riwayat + chart) | ✅ Done | 🟠 |
| 2.1.3 | Form tambah/edit spare part | ✅ Done | 🔴 |
| 2.1.4 | Reorder alert system (stok di bawah minimum) | ✅ Done | 🔴 |
| 2.1.5 | Part-mesin mapping visualization | ✅ Done | 🟡 |
| 2.1.6 | Laporan pemakaian spare part per periode | ✅ Done | 🟡 |

### 2.2 Team Activity

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 2.2.1 | Halaman manajemen tim & karyawan | ✅ Done | 🔴 |
| 2.2.2 | Pencatatan kegiatan harian (check-in/check-out) | ✅ Done | 🔴 |
| 2.2.3 | Timeline view kegiatan tim | ✅ Done | 🟠 |
| 2.2.4 | Laporan kinerja tim per periode | ✅ Done | 🟡 |
| 2.2.5 | Auto timestamp integration | ✅ Done | 🔴 |

### 2.3 Maintenance Schedule

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 2.3.1 | Work order list (filter by status, prioritas, mesin) | ✅ Done | 🔴 |
| 2.3.2 | Form buat WO (preventive/corrective/predictive) | ✅ Done | 🔴 |
| 2.3.3 | WO detail (timeline, spare part, biaya) | ✅ Done | 🟠 |
| 2.3.4 | Jadwal PM calendar view | ✅ Done | 🟠 |
| 2.3.5 | Laporan biaya maintenance per periode | ✅ Done | 🟡 |

### 2.4 Production Tracker

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 2.4.1 | Halaman produksi harian (input + chart + summary) | ✅ Done | 🔴 |
| 2.4.2 | Halaman penerimaan semen curah | ✅ Done | 🔴 |
| 2.4.3 | Halaman distribusi & tracking pengiriman | ✅ Done | 🟠 |
| 2.4.4 | Widget OEE (Overall Equipment Effectiveness) | ✅ Done | 🟠 |
| 2.4.5 | Laporan produksi mingguan/bulanan (exportable) | ✅ Done | 🟡 |

### Milestone
- ✅ Semua modul operasional inti berfungsi
- ✅ Data bisa di-CRUD dan tersimpan di KV Store
- ✅ Notifikasi otomatis untuk reorder point & WO
- ✅ Export data ke CSV/Excel

---

## Phase 3: Advanced Modules

**Durasi:** 6 minggu (Minggu 11-16)
**Status:** ✅ Selesai
**Prioritas:** 🟠 High

### Tujuan
Menambahkan modul-modul lanjutan untuk manajemen bisnis yang lebih komprehensif.

### 3.1 Finance & Accounting

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 3.1.1 | Dashboard keuangan (revenue, cost, margin) | ✅ Done | 🟠 |
| 3.1.2 | Pencatatan transaksi keuangan | ✅ Done | 🟠 |
| 3.1.3 | Budget monitoring vs actual | ✅ Done | 🟠 |
| 3.1.4 | Cost per zak analysis | ✅ Done | 🟡 |
| 3.1.5 | Laporan keuangan per periode | ✅ Done | 🟡 |

### 3.2 HR & Payroll

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 3.2.1 | Data karyawan management | ✅ Done | 🟠 |
| 3.2.2 | Absensi digital | ✅ Done | 🟠 |
| 3.2.3 | Pengajuan cuti & lembur | ✅ Done | 🟠 |
| 3.2.4 | Payroll calculation (basic) | ✅ Done | 🟡 |
| 3.2.5 | Laporan kehadiran per periode | ✅ Done | 🟡 |

### 3.3 Safety & HSE

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 3.3.1 | Insiden & near miss reporting form | ✅ Done | 🟠 |
| 3.3.2 | Inspeksi safety checklist | ✅ Done | 🟠 |
| 3.3.3 | Dashboard K3 metrics | ✅ Done | 🟠 |
| 3.3.4 | Corrective action tracking | ✅ Done | 🟡 |
| 3.3.5 | Laporan HSE per periode | ✅ Done | 🟡 |

### 3.4 Document & OCR

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 3.4.1 | Upload dokumen ke Puter FS | ✅ Done | 🟠 |
| 3.4.2 | OCR scanning via Puter AI | ✅ Done | 🟠 |
| 3.4.3 | Data extraction dari dokumen (AI-assisted) | ✅ Done | 🟡 |
| 3.4.4 | Document version control | ✅ Done | 🟡 |
| 3.4.5 | Document search & categorization | ✅ Done | 🟡 |

### Milestone
- ✅ Semua modul lanjutan berfungsi
- ✅ OCR bisa scan dan extract data dari dokumen
- ✅ Keuangan terintegrasi dengan produksi dan maintenance
- ✅ HSE reporting lengkap dengan corrective actions

---

## Phase 4: Analytics, Reports & Notifications

**Durasi:** 4 minggu (Minggu 17-20)
**Status:** ✅ Selesai
**Prioritas:** 🟡 Medium

### Tujuan
Membangun sistem analitik, pelaporan, dan notifikasi yang komprehensif.

### 4.1 Analytics Dashboard

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 4.1.1 | KPI dashboard dengan trend analysis | ✅ Done | 🟡 |
| 4.1.2 | Production analytics (OEE, yield, downtime) | ✅ Done | 🟡 |
| 4.1.3 | Financial analytics (margin, cost trends) | ✅ Done | 🟡 |
| 4.1.4 | Inventory analytics (turnover, aging) | ✅ Done | 🟡 |
| 4.1.5 | AI-powered forecasting (demand prediction) | ✅ Done | 🟢 |

### 4.2 Reports

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 4.2.1 | Report builder (customizable) | ✅ Done | 🟡 |
| 4.2.2 | Export ke PDF (jspdf) | ✅ Done | 🟡 |
| 4.2.3 | Export ke Excel (xlsx) | ✅ Done | 🟡 |
| 4.2.4 | Scheduled reports (daily/weekly/monthly) | ✅ Done | 🟢 |
| 4.2.5 | Report templates | ✅ Done | 🟢 |

### 4.3 Notifications

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 4.3.1 | Notification center UI | ✅ Done | 🟡 |
| 4.3.2 | Real-time alerts (reorder, WO overdue, etc.) | ✅ Done | 🟡 |
| 4.3.3 | Notification preferences per user | ✅ Done | 🟢 |
| 4.3.4 | TTS notifications (voice alerts) | ✅ Done | 🟢 |
| 4.3.5 | WhatsApp integration (future) | ✅ Done | 🟢 |

### Milestone
- ✅ Dashboard analitik menampilkan insight dari semua modul
- ✅ Report bisa di-export dalam berbagai format
- ✅ Notifikasi real-time untuk event penting

---

## Phase 4.5: AI Agent & Code Quality

**Durasi:** 1 minggu
**Status:** ✅ Selesai
**Prioritas:** 🟠 High

### Tujuan
Mengimplementasikan sistem AI Agent otonom dan meningkatkan kualitas kode secara keseluruhan.

### 4.5.1 AI Agent System

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 4.5.1.1 | Agent action detection pipeline (keyword match → AI parse → execute) | ✅ Done | 🔴 |
| 4.5.1.2 | 10 agent actions (add_sparepart, create_workorder, log_production, dll.) | ✅ Done | 🔴 |
| 4.5.1.3 | 4 autonomous workflows (reorder alert, WO overdue, production deviation, daily summary) | ✅ Done | 🟠 |
| 4.5.1.4 | Proactive monitoring system (threshold-based alerting) | ✅ Done | 🟠 |
| 4.5.1.5 | Audit trail untuk semua agent actions | ✅ Done | 🟡 |

### 4.5.2 Code Quality & Documentation

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 4.5.2.1 | PRD.md (Product Requirements Document) | ✅ Done | 🟠 |
| 4.5.2.2 | ESLint setup & configuration | ✅ Done | 🟡 |
| 4.5.2.3 | Code quality improvements & refactoring | ✅ Done | 🟡 |

### Milestone
- ✅ AI Agent bisa mendeteksi dan mengeksekusi aksi dari input natural language
- ✅ 4 workflow otonom berjalan secara proaktif
- ✅ Semua aksi agent tercatat di audit trail
- ✅ PRD.md dan ESLint terkonfigurasi

---

## Phase 5: Website Upgrade + Integration

**Durasi:** 4 minggu (Minggu 21-24)
**Status:** ⬜ Pending
**Prioritas:** 🟡 Medium

### Tujuan
Meningkatkan website korporat dan mengintegrasikannya dengan dashboard.

### 5.1 Website Redesign

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 5.1.1 | Redesign homepage dengan glassmorphic style | ⬜ Pending | 🟡 |
| 5.1.2 | Tambah live production counter (from KV Store) | ⬜ Pending | 🟡 |
| 5.1.3 | Public dashboard (KPI ringkasan untuk publik) | ⬜ Pending | 🟡 |
| 5.1.4 | Smooth page transitions (Framer Motion) | ⬜ Pending | 🟢 |
| 5.1.5 | Dark mode support | ⬜ Pending | 🟢 |

### 5.2 Integration

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 5.2.1 | Single sign-on (Puter Auth) antara website & dashboard | ⬜ Pending | 🟡 |
| 5.2.2 | Shared navigation (website → dashboard) | ⬜ Pending | 🟡 |
| 5.2.3 | AI chatbot di website (powered by Puter AI) | ⬜ Pending | 🟡 |
| 5.2.4 | SEO optimization | ⬜ Pending | 🟢 |

### Milestone
- ✅ Website dan dashboard terintegrasi seamlessly
- ✅ Publik bisa melihat KPI ringkasan
- ✅ AI chatbot aktif di website

---

## Phase 6: Mobile Optimization + PWA

**Durasi:** 4 minggu (Minggu 25-28)
**Status:** ⬜ Pending
**Prioritas:** 🟢 Low

### Tujuan
Mengoptimalkan pengalaman mobile dan mengkonversi ke PWA.

### 6.1 Mobile Optimization

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 6.1.1 | Responsive dashboard layout untuk mobile | ⬜ Pending | 🟡 |
| 6.1.2 | Touch-friendly interactions | ⬜ Pending | 🟡 |
| 6.1.3 | Mobile-optimized data tables | ⬜ Pending | 🟡 |
| 6.1.4 | Bottom navigation untuk mobile | ⬜ Pending | 🟢 |

### 6.2 PWA

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 6.2.1 | Service worker setup | ⬜ Pending | 🟢 |
| 6.2.2 | Manifest.json configuration | ⬜ Pending | 🟢 |
| 6.2.3 | Offline mode (cached KV data) | ⬜ Pending | 🟢 |
| 6.2.4 | Push notifications | ⬜ Pending | 🟢 |
| 6.2.5 | Install prompt | ⬜ Pending | 🟢 |

### Milestone
- ✅ Dashboard bisa diakses dengan nyaman di mobile
- ✅ PWA bisa di-install di homescreen
- ✅ Mode offline untuk fungsi dasar

---

## 📊 Progress Summary

| Phase | Durasi | Total Task | Status |
|-------|--------|-----------|--------|
| Phase 1: Core + AI + Auth | 4 minggu | 15 | ✅ Selesai |
| Phase 2: Operational Modules | 6 minggu | 21 | ✅ Selesai |
| Phase 3: Advanced Modules | 6 minggu | 20 | ✅ Selesai |
| Phase 4: Analytics + Reports | 4 minggu | 15 | ✅ Selesai |
| Phase 4.5: AI Agent & Code Quality | 1 minggu | 8 | ✅ Selesai |
| Phase 5: Website Upgrade | 4 minggu | 9 | ⬜ Pending |
| Phase 6: Mobile + PWA | 4 minggu | 9 | ⬜ Pending |
| **TOTAL** | **29 minggu** | **97** | |

---

## 🏷️ Prioritas Definisi

| Label | Arti | SLA |
|-------|------|-----|
| 🔴 Critical | Blocker, harus selesai sebelum lanjut ke phase berikutnya | 1 hari |
| 🟠 High | Fitur utama, penting untuk launch phase | 1 minggu |
| 🟡 Medium | Fitur pendukung, bisa ditunda ke sprint berikutnya | 2 minggu |
| 🟢 Low | Nice-to-have, prioritas rendah | 1 bulan |

---

## 🔄 Dependency Graph

```
Phase 1 (Core + AI + Auth) ✅
    │
    ├──► Phase 2 (Operational Modules) ✅
    │       │
    │       ├──► Phase 3 (Advanced Modules) ✅
    │       │       │
    │       │       └──► Phase 4 (Analytics + Reports) ✅
    │       │               │
    │       │               └──► Phase 4.5 (AI Agent & Code Quality) ✅
    │       │
    │       └──► Phase 5 (Website Upgrade) ⬜ [independent dari Phase 3]
    │
    └──► Phase 6 (Mobile + PWA) ⬜ [bergantung pada Phase 2+ selesai]
```

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Adoption | > 80% staf menggunakan dashboard harian | KV Store activity logs |
| Data Completeness | > 90% data operasional tercatat | Module coverage audit |
| AI Usage | > 50% user menggunakan AI Assistant mingguan | Chat session logs |
| Performance | Lighthouse score > 90 | Lighthouse audit |
| User Satisfaction | > 4.0/5.0 rating | User survey |

---

🤝 Contributing | Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

⚠️ Education Purpose Only | Risiko apapun tidak kita tanggung

📄 MIT License — Copyright © Mulky Malikul Dhaher
