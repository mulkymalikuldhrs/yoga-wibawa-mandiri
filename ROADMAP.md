# 🗺️ ROADMAP — PT Yoga Wibawa Mandiri AI Dashboard

> **Development Roadmap** — Peta jalan pengembangan dari website korporat hingga dashboard AI komprehensif
> **Versi:** 3.0.0 | **Terakhir Diperbarui:** 2026-03-05
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
│  Phase 1     │  Phase 2      │  Phase 3     │  Phase 4     │
│  Core + AI   │  Operational  │  Advanced    │  Analytics   │
│  + Auth      │  Modules      │  Modules     │  + Reports   │
└──────────────┴───────────────┴──────────────┴──────────────┘

Juli           Ags-Sept        Okt-Nov         Des
┌──────────────┬───────────────┬──────────────┬──────────────┐
│  Phase 5     │  Phase 6      │              │              │
│  Website     │  Mobile +     │              │              │
│  Upgrade     │  PWA          │              │              │
└──────────────┴───────────────┴──────────────┴──────────────┘
```

---

## Phase 1: Core Dashboard + AI Assistant + Auth

**Durasi:** 4 minggu (Minggu 1-4)
**Status:** 🚧 Dalam Pengembangan
**Prioritas:** 🔴 Critical

### Tujuan
Membangun fondasi dashboard dengan autentikasi Puter.js, AI Assistant, dan glassmorphic design system.

### Deliverables

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 1.1 | Setup Puter.js integration (`puter.js` SDK) | ⬜ Pending | 🔴 |
| 1.2 | Implementasi Puter Auth (login/logout/session) | ⬜ Pending | 🔴 |
| 1.3 | Buat RBAC system dengan KV Store | ⬜ Pending | 🔴 |
| 1.4 | Buat dashboard layout (sidebar + header + content) | ⬜ Pending | 🔴 |
| 1.5 | Implementasi glassmorphic design system (Tailwind config) | ⬜ Pending | 🔴 |
| 1.6 | Buat dashboard homepage dengan KPI overview cards | ⬜ Pending | 🔴 |
| 1.7 | Implementasi AI Assistant (chat interface) | ⬜ Pending | 🔴 |
| 1.8 | Integrasi Puter AI chat completions | ⬜ Pending | 🔴 |
| 1.9 | Implementasi voice input (STT via Puter AI) | ⬜ Pending | 🟠 |
| 1.10 | Implementasi text-to-speech (TTS via Puter AI) | ⬜ Pending | 🟡 |
| 1.11 | Buat auto timestamp system | ⬜ Pending | 🔴 |
| 1.12 | Setup KV Store service layer (CRUD abstractions) | ⬜ Pending | 🔴 |
| 1.13 | Implementasi Zustand stores untuk dashboard state | ⬜ Pending | 🟠 |
| 1.14 | Setup TanStack Query untuk data fetching/caching | ⬜ Pending | 🟠 |
| 1.15 | Buat navigation & routing dashboard | ⬜ Pending | 🔴 |

### Milestone
- ✅ User bisa login via Puter Auth
- ✅ Dashboard menampilkan KPI overview
- ✅ AI Assistant bisa menjawab pertanyaan tentang YWM
- ✅ Voice input berfungsi untuk AI Assistant
- ✅ Glassmorphic UI konsisten di semua halaman

---

## Phase 2: Operational Modules

**Durasi:** 6 minggu (Minggu 5-10)
**Status:** ⬜ Pending
**Prioritas:** 🔴 Critical

### Tujuan
Mengimplementasikan modul-modul operasional inti yang dibutuhkan untuk menjalankan operasional harian.

### 2.1 Spare Parts Inventory

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 2.1.1 | Halaman daftar spare part (data table + search + filter) | ⬜ Pending | 🔴 |
| 2.1.2 | Halaman detail spare part (info + riwayat + chart) | ⬜ Pending | 🟠 |
| 2.1.3 | Form tambah/edit spare part | ⬜ Pending | 🔴 |
| 2.1.4 | Reorder alert system (stok di bawah minimum) | ⬜ Pending | 🔴 |
| 2.1.5 | Part-mesin mapping visualization | ⬜ Pending | 🟡 |
| 2.1.6 | Laporan pemakaian spare part per periode | ⬜ Pending | 🟡 |

### 2.2 Team Activity

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 2.2.1 | Halaman manajemen tim & karyawan | ⬜ Pending | 🔴 |
| 2.2.2 | Pencatatan kegiatan harian (check-in/check-out) | ⬜ Pending | 🔴 |
| 2.2.3 | Timeline view kegiatan tim | ⬜ Pending | 🟠 |
| 2.2.4 | Laporan kinerja tim per periode | ⬜ Pending | 🟡 |
| 2.2.5 | Auto timestamp integration | ⬜ Pending | 🔴 |

### 2.3 Maintenance Schedule

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 2.3.1 | Work order list (filter by status, prioritas, mesin) | ⬜ Pending | 🔴 |
| 2.3.2 | Form buat WO (preventive/corrective/predictive) | ⬜ Pending | 🔴 |
| 2.3.3 | WO detail (timeline, spare part, biaya) | ⬜ Pending | 🟠 |
| 2.3.4 | Jadwal PM calendar view | ⬜ Pending | 🟠 |
| 2.3.5 | Laporan biaya maintenance per periode | ⬜ Pending | 🟡 |

### 2.4 Production Tracker

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 2.4.1 | Halaman produksi harian (input + chart + summary) | ⬜ Pending | 🔴 |
| 2.4.2 | Halaman penerimaan semen curah | ⬜ Pending | 🔴 |
| 2.4.3 | Halaman distribusi & tracking pengiriman | ⬜ Pending | 🟠 |
| 2.4.4 | Widget OEE (Overall Equipment Effectiveness) | ⬜ Pending | 🟠 |
| 2.4.5 | Laporan produksi mingguan/bulanan (exportable) | ⬜ Pending | 🟡 |

### Milestone
- ✅ Semua modul operasional inti berfungsi
- ✅ Data bisa di-CRUD dan tersimpan di KV Store
- ✅ Notifikasi otomatis untuk reorder point & WO
- ✅ Export data ke CSV/Excel

---

## Phase 3: Advanced Modules

**Durasi:** 6 minggu (Minggu 11-16)
**Status:** ⬜ Pending
**Prioritas:** 🟠 High

### Tujuan
Menambahkan modul-modul lanjutan untuk manajemen bisnis yang lebih komprehensif.

### 3.1 Finance & Accounting

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 3.1.1 | Dashboard keuangan (revenue, cost, margin) | ⬜ Pending | 🟠 |
| 3.1.2 | Pencatatan transaksi keuangan | ⬜ Pending | 🟠 |
| 3.1.3 | Budget monitoring vs actual | ⬜ Pending | 🟠 |
| 3.1.4 | Cost per zak analysis | ⬜ Pending | 🟡 |
| 3.1.5 | Laporan keuangan per periode | ⬜ Pending | 🟡 |

### 3.2 HR & Payroll

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 3.2.1 | Data karyawan management | ⬜ Pending | 🟠 |
| 3.2.2 | Absensi digital | ⬜ Pending | 🟠 |
| 3.2.3 | Pengajuan cuti & lembur | ⬜ Pending | 🟠 |
| 3.2.4 | Payroll calculation (basic) | ⬜ Pending | 🟡 |
| 3.2.5 | Laporan kehadiran per periode | ⬜ Pending | 🟡 |

### 3.3 Safety & HSE

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 3.3.1 | Insiden & near miss reporting form | ⬜ Pending | 🟠 |
| 3.3.2 | Inspeksi safety checklist | ⬜ Pending | 🟠 |
| 3.3.3 | Dashboard K3 metrics | ⬜ Pending | 🟠 |
| 3.3.4 | Corrective action tracking | ⬜ Pending | 🟡 |
| 3.3.5 | Laporan HSE per periode | ⬜ Pending | 🟡 |

### 3.4 Document & OCR

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 3.4.1 | Upload dokumen ke Puter FS | ⬜ Pending | 🟠 |
| 3.4.2 | OCR scanning via Puter AI | ⬜ Pending | 🟠 |
| 3.4.3 | Data extraction dari dokumen (AI-assisted) | ⬜ Pending | 🟡 |
| 3.4.4 | Document version control | ⬜ Pending | 🟡 |
| 3.4.5 | Document search & categorization | ⬜ Pending | 🟡 |

### Milestone
- ✅ Semua modul lanjutan berfungsi
- ✅ OCR bisa scan dan extract data dari dokumen
- ✅ Keuangan terintegrasi dengan produksi dan maintenance
- ✅ HSE reporting lengkap dengan corrective actions

---

## Phase 4: Analytics, Reports & Notifications

**Durasi:** 4 minggu (Minggu 17-20)
**Status:** ⬜ Pending
**Prioritas:** 🟡 Medium

### Tujuan
Membangun sistem analitik, pelaporan, dan notifikasi yang komprehensif.

### 4.1 Analytics Dashboard

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 4.1.1 | KPI dashboard dengan trend analysis | ⬜ Pending | 🟡 |
| 4.1.2 | Production analytics (OEE, yield, downtime) | ⬜ Pending | 🟡 |
| 4.1.3 | Financial analytics (margin, cost trends) | ⬜ Pending | 🟡 |
| 4.1.4 | Inventory analytics (turnover, aging) | ⬜ Pending | 🟡 |
| 4.1.5 | AI-powered forecasting (demand prediction) | ⬜ Pending | 🟢 |

### 4.2 Reports

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 4.2.1 | Report builder (customizable) | ⬜ Pending | 🟡 |
| 4.2.2 | Export ke PDF (jspdf) | ⬜ Pending | 🟡 |
| 4.2.3 | Export ke Excel (xlsx) | ⬜ Pending | 🟡 |
| 4.2.4 | Scheduled reports (daily/weekly/monthly) | ⬜ Pending | 🟢 |
| 4.2.5 | Report templates | ⬜ Pending | 🟢 |

### 4.3 Notifications

| # | Task | Status | Prioritas |
|---|------|--------|-----------|
| 4.3.1 | Notification center UI | ⬜ Pending | 🟡 |
| 4.3.2 | Real-time alerts (reorder, WO overdue, etc.) | ⬜ Pending | 🟡 |
| 4.3.3 | Notification preferences per user | ⬜ Pending | 🟢 |
| 4.3.4 | TTS notifications (voice alerts) | ⬜ Pending | 🟢 |
| 4.3.5 | WhatsApp integration (future) | ⬜ Pending | 🟢 |

### Milestone
- ✅ Dashboard analitik menampilkan insight dari semua modul
- ✅ Report bisa di-export dalam berbagai format
- ✅ Notifikasi real-time untuk event penting

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
| Phase 1: Core + AI + Auth | 4 minggu | 15 | 🚧 In Progress |
| Phase 2: Operational Modules | 6 minggu | 21 | ⬜ Pending |
| Phase 3: Advanced Modules | 6 minggu | 20 | ⬜ Pending |
| Phase 4: Analytics + Reports | 4 minggu | 15 | ⬜ Pending |
| Phase 5: Website Upgrade | 4 minggu | 9 | ⬜ Pending |
| Phase 6: Mobile + PWA | 4 minggu | 9 | ⬜ Pending |
| **TOTAL** | **28 minggu** | **89** | |

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
Phase 1 (Core + AI + Auth)
    │
    ├──► Phase 2 (Operational Modules)
    │       │
    │       ├──► Phase 3 (Advanced Modules)
    │       │       │
    │       │       └──► Phase 4 (Analytics + Reports)
    │       │
    │       └──► Phase 5 (Website Upgrade) [independent dari Phase 3]
    │
    └──► Phase 6 (Mobile + PWA) [bergantung pada Phase 2+ selesai]
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
