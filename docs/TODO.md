# 📋 TODO — PT Yoga Wibawa Mandiri Digital Transformation

> **Master Task List** — Semua pekerjaan untuk upgrade website + dashboard teknis komprehensif
> **Last Updated:** 2026-05-25
> **Maintainer:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

---

## 🎯 Overview

Proyek ini mencakup 2 track utama:
1. **Website Upgrade** — Perbaikan dan peningkatan website korporat yang sudah ada
2. **Dashboard Teknis** — Sistem dashboard operasional komprehensif yang terintegrasi dengan website

Semua kode berada dalam satu monorepo ini.

---

## 📊 Progress Summary

| Track | Total Tasks | Done | In Progress | Pending |
|-------|-------------|------|-------------|---------|
| Phase 0: Planning & Docs | 8 | 6 | 2 | 0 |
| Phase 1: Foundation | 12 | 0 | 0 | 12 |
| Phase 2: Website Upgrade | 10 | 0 | 0 | 10 |
| Phase 3: Dashboard Core | 15 | 0 | 0 | 15 |
| Phase 4: Dashboard Modules | 20 | 0 | 0 | 20 |
| Phase 5: Integration & AI | 10 | 0 | 0 | 10 |
| Phase 6: Testing & Deploy | 8 | 0 | 0 | 8 |
| **TOTAL** | **83** | **6** | **2** | **75** |

---

## Phase 0: Planning & Documentation

- [x] Analisis repo YWM yang sudah ada
- [x] Identifikasi stack teknologi saat ini (Vite + React + TS + Shadcn/UI)
- [x] Buat blueprint data komprehensif (25 bab)
- [x] Siapkan TODO.md master task list
- [ ] Siapkan ARCHITECTURE.md
- [ ] Siapkan semua *.md pendukung (changelog, contributing, dll.)
- [x] Identifikasi pilar-pilar dashboard (12 pilar)
- [x] Definisikan struktur data per modul

---

## Phase 1: Foundation & Infrastructure

### 1.1 Project Restructuring
- [ ] Migrasi ke monorepo structure (apps/website + apps/dashboard + packages/shared)
- [ ] Setup Turborepo / pnpm workspace
- [ ] Konfigurasi shared UI components antara website & dashboard
- [ ] Setup environment variables (.env.local, .env.production)
- [ ] Konfigurasi CI/CD pipeline (GitHub Actions)

### 1.2 Backend Setup
- [ ] Setup Supabase project untuk dashboard data
- [ ] Buat database schema (25 tabel dari blueprint data)
- [ ] Setup Row Level Security (RLS) policies
- [ ] Konfigurasi Supabase Auth (email + role-based)
- [ ] Buat migration files untuk semua tabel
- [ ] Setup Supabase Realtime subscriptions
- [ ] Konfigurasi Supabase Storage (dokumen, foto)

---

## Phase 2: Website Upgrade

### 2.1 UI/UX Improvements
- [ ] Redesign homepage dengan section baru (live production counter, distribusi map)
- [ ] Tambah halaman "Dashboard Publik" — ringkasan KPI yang bisa dilihat publik
- [ ] Optimasi mobile responsiveness
- [ ] Tambah dark mode support
- [ ] Implementasi smooth page transitions (framer-motion)

### 2.2 Content & Features
- [ ] Tambah halaman karir / job listings
- [ ] Integrasi live weather widget (area pelabuhan)
- [ ] Tambah FAQ section dengan search
- [ ] Perbaiki galeri dengan lightbox & filter kategori
- [ ] Tambah halaman "Sertifikasi & Compliance" publik

---

## Phase 3: Dashboard Core

### 3.1 Dashboard Shell
- [ ] Buat layout dashboard (sidebar + header + content area)
- [ ] Implementasi routing dashboard (/dashboard/*)
- [ ] Buat auth guard & redirect logic
- [ ] Implementasi role-based navigation menu
- [ ] Buat dashboard homepage dengan KPI overview cards

### 3.2 Real-Time Operations Dashboard
- [ ] Widget: Produksi hari ini (zak/ton) — live counter
- [ ] Widget: Status mesin (running/standby/maintenance)
- [ ] Widget: Stok silo level (bar chart real-time)
- [ ] Widget: Kendaraan antri & distribusi status
- [ ] Widget: Downtime tracker
- [ ] Widget: Energy consumption meter
- [ ] Implementasi auto-refresh dengan Supabase Realtime

### 3.3 Core UI Components
- [ ] Data table component (sortable, filterable, paginated, exportable)
- [ ] Chart wrapper (recharts integration — line, bar, pie, area)
- [ ] KPI card component (trend indicator, sparkline)
- [ ] Status badge component (mesin, WO, distribusi, dll.)
- [ ] Date range picker component
- [ ] Filter panel component (multi-select, search)
- [ ] Export button (CSV, PDF, Excel)

---

## Phase 4: Dashboard Modules

### 4.1 Inventaris Spare Part
- [ ] Halaman daftar spare part (data table + search + filter kategori)
- [ ] Halaman detail spare part (info + riwayat transaksi + chart pemakaian)
- [ ] Form tambah/edit spare part
- [ ] Alert system: stok di bawah reorder point
- [ ] Laporan pemakaian spare part per periode

### 4.2 Produksi & Operasional
- [ ] Halaman produksi harian (input + chart + summary)
- [ ] Halaman penerimaan semen curah
- [ ] Halaman distribusi & tracking pengiriman
- [ ] Widget OEE (Overall Equipment Effectiveness)
- [ ] Laporan produksi mingguan/bulanan (exportable)

### 4.3 Kegiatan Tim
- [ ] Halaman manajemen tim & karyawan
- [ ] Pencatatan kegiatan harian (check-in/check-out)
- [ ] Timeline view kegiatan tim
- [ ] Laporan kinerja tim per periode
- [ ] Integrasi auto timestamp (server-side)

### 4.4 Maintenance Management
- [ ] Work order list (filter by status, prioritas, mesin)
- [ ] Form buat WO (preventive/corrective/predictive)
- [ ] WO detail (timeline, spare part digunakan, biaya)
- [ ] Jadwal preventive maintenance calendar view
- [ ] Laporan biaya maintenance per periode

### 4.5 Quality Control
- [ ] Form input hasil QC per batch
- [ ] Chart kekuatan tekan (1d/3d/7d/28d) trend
- [ ] Chart berat zak distribution
- [ ] Alert jika parameter di luar spesifikasi
- [ ] Laporan QC exportable

### 4.6 Inventaris & Gudang
- [ ] Stok opname digital (barcode scanning)
- [ ] Barang masuk/keluar form
- [ ] Stock level monitoring (silo + finished goods)
- [ ] Lokasi rak visual map
- [ ] Laporan inventaris per periode

### 4.7 Safety & HSE
- [ ] Insiden & near miss reporting form
- [ ] Inspeksi safety checklist
- [ ] Dashboard K3 metrics
- [ ] Corrective action tracking
- [ ] Laporan HSE per periode

### 4.8 HR & Payroll
- [ ] Absensi digital (biometric integration ready)
- [ ] Pengajuan cuti & lembur
- [ ] Data karyawan management
- [ ] Payroll calculation (basic)
- [ ] Laporan kehadiran per periode

---

## Phase 5: AI & Advanced Integration

### 5.1 AI Customer Service
- [ ] Integrasi chatbot dengan knowledge base dari data dashboard
- [ ] WhatsApp Business API integration
- [ ] Auto-respon berdasarkan data real-time (stok, harga, jadwal)
- [ ] Escalation ke agen manusia

### 5.2 Predictive Analytics
- [ ] Model prediksi permintaan semen per wilayah
- [ ] Model predictive maintenance (kerusakan mesin)
- [ ] Model prediksi kebutuhan spare part
- [ ] Visualisasi hasil prediksi di dashboard

### 5.3 IoT & Digital Twin
- [ ] MQTT broker setup untuk sensor data
- [ ] Sensor data ingestion pipeline
- [ ] Real-time sensor monitoring dashboard
- [ ] Alert berdasarkan threshold sensor

### 5.4 ESG & Sustainability
- [ ] Dashboard emisi debu & batas izin
- [ ] Energy consumption tracking
- [ ] Carbon footprint calculator
- [ ] ESG report generator

---

## Phase 6: Testing & Deployment

### 6.1 Testing
- [ ] Unit tests (Vitest) untuk semua utilitas & hooks
- [ ] Integration tests untuk API calls
- [ ] E2E tests (Playwright) untuk flow kritis
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (WCAG 2.1 AA)

### 6.2 Deployment
- [ ] Setup Vercel/Netlify deployment (website)
- [ ] Setup Vercel deployment (dashboard)
- [ ] Konfigurasi custom domain
- [ ] SSL certificate
- [ ] Monitoring & error tracking (Sentry)
- [ ] Backup database automation

---

## 🏷️ Priority Labels

| Label | Arti | SLA |
|-------|------|-----|
| 🔴 Critical | Blocker, harus selesai sebelum lanjut | 1 hari |
| 🟠 High | Fitur utama, penting untuk launch | 1 minggu |
| 🟡 Medium | Fitur pendukung, bisa ditunda | 2 minggu |
| 🟢 Low | Nice-to-have, prioritas rendah | 1 bulan |

---

## 📅 Timeline

| Phase | Start | End | Durasi |
|-------|-------|-----|--------|
| Phase 0: Planning | 2026-05-25 | 2026-05-28 | 3 hari |
| Phase 1: Foundation | 2026-05-29 | 2026-06-15 | 18 hari |
| Phase 2: Website Upgrade | 2026-06-16 | 2026-07-05 | 20 hari |
| Phase 3: Dashboard Core | 2026-07-06 | 2026-08-05 | 30 hari |
| Phase 4: Dashboard Modules | 2026-08-06 | 2026-10-05 | 60 hari |
| Phase 5: AI & Integration | 2026-10-06 | 2026-11-20 | 45 hari |
| Phase 6: Testing & Deploy | 2026-11-21 | 2026-12-10 | 20 hari |

---

## 🤝 Contributing

Kontribusi welcome! Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan.

## 📬 Contact

**Mulky Malikul Dhaher** | mulkymalikuldhaher@email.com

## ⚠️ Disclaimer

For **Education Purpose** only. **Risiko apapun tidak kita tanggung.**
