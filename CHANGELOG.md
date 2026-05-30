# Changelog — YWM Dashboard (PT. Yoga Wibawa Mandiri)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [7.0.0] - 2026-05-30 — Comprehensive Audit & Major Fix Release

> **Timestamp:** 2026-05-30T12:00:00+07:00
> **Developer:** Tim Teknik | Mulky Malikul Dhaher

### 🔴 CRITICAL FIXES
- **WhatsApp number corrected**: `6285322624038` → `6285322624048` across 5 files, 17 occurrences (Services, Location, Contact, Footer, ChatBot)
- **DashboardContext Provider duplication removed**: Was wrapped twice (Dashboard.tsx + DashboardLayout.tsx), causing unnecessary re-renders
- **AI context now reads from Supabase**: `buildDashboardContext()` was reading only localStorage — now uses `getData()` from `supabase-data.ts` which tries Supabase first, with localStorage fallback. Added production and silo data to context.
- **Silo Conis Volume Formula fixed**: The partial conis formula `areaConis * tConis / tConisMax * tConisMax` was mathematically redundant (division and multiplication cancel out). Fixed to `areaConis * tConis * (tConis / tConisMax)` for proper proportional scaling. Applied to both SiloCalculationModule and SiloOpnameModule.
- **Negative Space Silo clamped**: `spaceSilo` could go negative, now clamped to minimum 0 with "over-capacity" warning indicator.

### 🟠 SIGNIFICANT IMPROVEMENTS
- **Glassmorphic design on public website**: All 6 public pages (Index, About, Services, Gallery, Location, Contact) now use frosted glass cards, glassmorphic backgrounds with floating orbs, consistent with dashboard design
- **Documents Module — real file upload**: Drag-and-drop and file input now actually read files (name, size, type), create object URLs for viewing. "Lihat" button opens document in new tab. "OCR" button shows "coming soon" toast. File type icons added (PDF=red, Excel=green, Word=blue, Image=pink).
- **Notification system overhaul**: 
  - 24-hour deduplication (same title+module won't duplicate within 24h)
  - Beep sound using Web Audio API (200ms, 800Hz sine wave)
  - Mute/unmute toggle in Notification Center
  - Push notification style popups (top-right, spring animation)
  - Suppressed beeps during initial page load
- **Google Maps embed fixed**: Real Pelabuhan Krueng Geukueh coordinates (5.1871, 97.1354)
- **Clickable phone numbers**: All phone numbers now use `<a href="tel:">` and `<a href="https://wa.me/">` links
- **Semen Padang logo in Header/Footer**: Logo image added next to "Mitra Resmi Semen Padang" badge
- **OverviewModule silo trends**: Replaced hardcoded `-5/+8` fake values with real calculated trends from historical silo data (compares last two entries per silo)

### 🟡 NEW FEATURES
- **Products page** (`/produk`): Dedicated e-commerce-style Semen Padang product catalog
  - PCC Zak 40kg with 2 options: 250 zak (10 ton) and 750 zak (30 ton)
  - Bulk/Curah with manual input (1-30 ton) and truck icon
  - WhatsApp order buttons with pre-filled messages to +6285322624048
  - Konsultasi section for inquiries
- **PWA improvements**:
  - Enhanced service worker v3 with navigation preload, network timeout, offline.html fallback
  - Better manifest.json with shortcuts, screenshots, proper icon sizing
  - iOS Safari install instructions in InstallPWAButton
  - Success state after installation
  - Dedicated offline page with branded design

### 🟢 MINOR FIXES
- ISO stat on homepage: "ISO" → "ISO 9001:2015"
- Gallery CTA: `<a href>` → `<Link to>` for SPA navigation
- About page org structure: "HY" → "HMY", "IW" → "WM"
- Footer contacts now clickable (tel:, mailto:, wa.me links)

### Changed
- `buildDashboardContext()` is now async (returns `Promise<string>`)
- All callers (FloatingChatBot, AiAssistantPanel) updated with `await`
- Document interface: added `tipeFile: string` field
- SiloCalculation interface: added `isOverCapacity: boolean` field
- Notification `addNotification()` returns `Notification | null` (null if deduplicated)

---

## [6.0.0] - 2026-05-29

### BREAKING CHANGES
- Semua kemasan sekarang 40kg (bukan 50kg)
- Nomor telepon/WhatsApp diubah ke +6285322624038

### Added
- 4 modul baru di dashboard: Produksi, Keuangan, Safety/HSE, HR/Karyawan
- 4 tabel Supabase baru: production, finance, safety_incident, employee
- Katalog produk Semen Padang (PCC Zak 40kg + Bulk/Curah) di halaman Services
- Pesan via WhatsApp (+6285322624038) dari katalog produk
- Browser push notification dengan beep sound
- AI chatbot on/off toggle di FloatingChatBot
- Konfirmasi sebelum AI mengubah data (DataInputCard)
- Dashboard context di AiAssistantPanel
- Navigasi untuk 4 modul baru di sidebar dan mobile nav

### Fixed
- Infinite AI init retry loop yang menyebabkan Vercel build timeout
- Nomor telepon placeholder di Contact, Location, Footer
- Google Maps menampilkan lokasi palsu → sekarang Pelabuhan Krueng Geukueh
- 50kg → 40kg di seluruh website
- PWA manifest background_color gelap → terang (#f0f9ff)
- ChatBot.tsx cn() import dari @/lib/utils
- Notifikasi dummy → welcome notifications + smart auto-check
- About page org chart → nama asli

### Removed
- Puter.js SDK dari index.html (tidak lagi digunakan)
- Dead social media links di Footer
- Semen Padang black logo file yang tidak terpakai

### Developer Credit
- Tim Teknik | Mulky Malikul Dhaher

---

## [2.1.0] - 2026-05-29 — Module Restructure: Pispot Module + Module Removal

> **Timestamp:** 2026-05-29T18:00:00+07:00
> **Developer:** Tim Teknik | Mulky Malikul Dhaher

### Added

- **Pispot Module (Pompa Gemik Bearing / Lubrikasi / Pelumasan)** — Checklist siklus bulanan untuk pelumasan dan perawatan bearing, pompa, dan komponen mekanis
  - `PispotModule.tsx` — Full CRUD module with monthly calendar view, status summary cards, data table, add/edit dialog
  - `PispotRecord` TypeScript interface with fields: namaPeralatan, kodePeralatan, lokasi, jenisPelumas, spesifikasi, volume, periode, bulan, tanggalPelaksanaan, petugas, status, kondisi, catatan, tindakLanjut
  - `pispot` table in Supabase schema with RLS, indexes, and seed data
  - 14 sample Pispot records covering Packer A/B bearings, conveyor bearings, hydraulic pumps, gearbox, and motor drive
  - Added to sidebar navigation, mobile nav, dashboard routing, and overview module
  - Status tracking: terjadwal (scheduled), selesai (completed), terlewat (overdue)
  - Condition tracking: baik (good), perlu_perhatian (needs attention), rusak (damaged)

### Removed

- **Produksi Module** — Removed per user request
- **Keselamatan (HSE) Module** — Removed per user request
- **Keuangan Module** — Removed per user request
- **SDM/Payroll Module** — Removed per user request
- Corresponding TypeScript interfaces: ProductionRecord, SafetyIncident, FinanceRecord, Employee
- Corresponding Supabase tables: production, safety, finance, hr
- Corresponding KV_PREFIXES entries, sidebar items, mobile nav items, dashboard routes

### Changed

- **DashboardModule type** — Updated to: 'overview' | 'spare-parts' | 'team-activity' | 'maintenance' | 'silo-calculation' | 'silo-opname' | 'pispot' | 'documents' | 'analytics' | 'notifications'
- **OverviewModule** — Replaced production/safety/finance/HR stat cards with Pispot stat cards (terjadwal/terlewat counts), replaced production chart with Pispot monthly chart
- **AnalyticsModule** — Replaced production/safety/finance/HR analytics with Pispot-focused analytics (monthly trend, status distribution, location chart)
- **NotificationProvider** — Updated smart notifications to check Pispot overdue records, removed production/safety/finance/HR notification checks
- **DashboardSidebar** — Updated navigation to show 10 modules (was 13), added Droplets icon for Pispot
- **ywm-ai.ts** — Updated `buildDashboardContext()` to include Pispot data instead of removed modules
- **supabase-data.ts** — Updated TABLE_MAP to remove 4 tables and add Pispot column mapping

---

## [2.0.0] - 2026-05-29 — Major Upgrade: AI, Notifications, PWA, Documentation

> **Timestamp:** 2026-05-29T12:00:00+07:00
> **Developer:** Tim Teknik | Mulky Malikul Dhaher

### Added

- **AI Dashboard Context Builder** — AI chatbot now reads live dashboard data (stok, produksi, maintenance, keuangan, dll.) and uses it to answer questions with real data
  - `buildDashboardContext()` function in `ywm-ai.ts` reads all dashboard modules from localStorage
  - FloatingChatBot and AiAssistantPanel now inject dashboard context as system message
  - AI can provide specific numbers, percentages, and alerts based on actual data
- **Notification Popup "Navigate to Module" button** — Users can now click "Buka" on popup notifications to navigate directly to the related dashboard module
- **Push Notification Infrastructure** — Complete infrastructure for push notifications:
  - `sw.js` now handles `push` events and `notificationclick` events
  - `pwa.ts` includes `requestPushPermission()`, `subscribeToPush()`, `getPushSubscription()`, `unsubscribeFromPush()`
  - Push subscription change handler in service worker
  - VAPID key support ready for server-side configuration
- **Enhanced Service Worker v2** — Improved caching strategies:
  - Separate image cache (`ywm-images-v2`)
  - Stale-while-revalidate pattern for static assets
  - Pre-caches critical assets on install (manifest, icons, index.html)
  - Background cache updates without blocking requests
  - On-demand caching via `CACHE_URL` message type
- **Smart Notifications with Supabase** — Auto-notification checks now try Supabase data first, falling back to localStorage:
  - Low stock alerts check Supabase spare_parts table
  - Overdue maintenance alerts check Supabase maintenance table
  - Exported `isSupabaseAvailable()` from `supabase-data.ts`
- **Complete Documentation Suite** — Production-quality documentation:
  - `CHANGELOG.md` — Complete version history with timestamps
  - `README.md` — Comprehensive project documentation
  - `TODO.md` — Production readiness checklist with checkboxes
  - `ARCHITECTURE.md` — System architecture with data flow diagrams
  - `SECURITY.md` — Security considerations and policies
  - `.env.example` — Environment variable template
  - `.gitignore` — Proper gitignore configuration

### Changed

- **Notification popup auto-dismiss** — Changed from 30 seconds to **8 seconds** as per UX requirements
- **Notification popup positioning** — Moved to `bottom-24 right-4` on mobile, `bottom-28 right-6` on desktop (above chatbot button)
- **Notification popup reset timer** — Timer resets to 8 seconds (not 30) when mouse leaves the popup
- **Service Worker cache versioning** — Upgraded from `v1` to `v2` for all cache names to force cache refresh
- **README.md** — Complete rewrite with bilingual content, tech stack, installation guide, and developer credit

### Fixed

- **NotificationPopup missing navigate button** — Added "Buka" (Open) action button to popup cards that navigates to the related module and dismisses the popup
- **Supabase data not checked for smart notifications** — Smart notification system now queries Supabase first before falling back to localStorage
- **`isSupabaseAvailable` not exported** — Function was private, now exported for use in NotificationProvider
- **Service worker didn't cache enough assets** — Now pre-caches manifest.json, icons, and index.html on install
- **Push notifications not supported** — Added complete push notification handling in service worker and PWA utility functions

### Security

- **`.env.example` created** — Template for environment variables (no real keys exposed)
- **`.gitignore` created** — Prevents committing sensitive files (node_modules, .env, logs)

---

## [5.1.0] - 2026-05-26 — Production Readiness & Security Hardening

> **Timestamp:** 2026-05-26T10:00:00+07:00

### Added

- **React Error Boundary** — Global error boundary preventing white screen crashes
- **React.lazy code splitting** — All 7 routes lazy-loaded for faster initial bundle
- **GitHub Actions CI/CD** — Auto-deploy workflow on push to main (lint + build + deploy)
- **Content Security Policy (CSP)** — Meta tags for XSS/clickjacking/injection prevention
- **Security headers** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- **Open Graph meta tags** — Social media sharing support
- **TypeScript strict mode** — Enabled strict, strictNullChecks, noUnusedLocals, noUnusedParameters
- **Build optimization** — Manual chunks for vendor, ui, charts, query (reduced initial load)

### Fixed

- **CRITICAL: Root index.html** — Was redirect page, not Vite SPA entry (root cause of GitHub Pages blank)
- **CRITICAL: Vite base path** — Added `/yoga-wibawa-mandiri/` for correct GitHub Pages deployment
- **CRITICAL: BrowserRouter basename** — Added for correct routing under GitHub Pages subpath
- **PII leak in Contact.tsx** — Removed console.log with user data
- **PII leak in emailService.ts** — Removed console.log with email response data
- **Deprecated onKeyPress** — Changed to onKeyDown in ChatBot.tsx
- **use-toast.ts dependency array bug** — Fixed `[state]` to `[]` preventing infinite re-renders
- **Unused imports** — Removed CheckCircle, AlertCircle, Users, LogOut, X, PanelRightOpen
- **Image lazy loading** — Added `loading="lazy"` to all content images
- **Footer copyright year** — Changed from hardcoded 2024 to dynamic

---

## [5.0.0] - 2026-05-26 — AI Agent Upgrade & Code Quality

> **Timestamp:** 2026-05-26T08:00:00+07:00

### Added

- **AI Agent System v2.0** — Upgraded AI from chatbot to autonomous agent
  - Action detection: AI parses natural language into executable actions
  - 10 agent actions with confirmation flow
  - 4 autonomous workflows with proactive monitoring
  - Smart notifications for critical events
  - Audit trail for all agent actions
  - Fallback keyword parsing when AI unavailable
- **Comprehensive PRD.md** — Full Product Requirements Document
- **ESLint integration** — Fixed all TypeScript/React lint errors (0 errors, 9 warnings)

---

## [4.0.0] - 2026-05-25 — Complete Dashboard Build

> **Timestamp:** 2026-05-25T14:00:00+07:00

### Added

- **Complete Dashboard Application** — 15 modules fully built
- **25,800+ lines of code** across 31 dashboard files
- **Zero dependencies** — Pure HTML + CSS + JS for dashboard
- **Glassmorphic Design System** — Complete frosted glass CSS with animations
- **Puter.js Integration** — KV Store, FS, Auth, AI all functional
- **AI-Powered Smart Input** — Voice/text input with AI parsing
- **Auto Timestamp & Audit Trail** — Every data mutation logged
- **RBAC System** — 8 roles from superadmin to viewer

---

## [3.0.0] - 2026-03-05 — Puter.js AI Dashboard

> **Timestamp:** 2026-03-05T10:00:00+07:00

### Added

- **Puter.js Backend** — Migrated from Supabase to Puter.js cloud OS
- **Glassmorphic Frosted UI Design System** — Modern frosted glass design
- **15+ Dashboard Modules** — All operational modules built
- **AI Assistant** — Integrated chatbot with YWM context
- **Architecture Documentation** — Complete Puter.js architecture docs

---

## [2.0.0] - 2026-02-25 — Digital Transformation Phase

> **Timestamp:** 2026-02-25T10:00:00+07:00

### Added

- **Architecture Document** — Full system architecture
- **Data Blueprint** — 17 core tables with field definitions
- **TODO Master Task List** — 83 tasks across 6 phases
- **Deployment Guide** — Vercel + Supabase configuration
- **12 Dashboard Pilar Definitions** — Complete feature specification
- **RBAC System** — 9 roles with permission matrix
- **Auto Timestamp Architecture** — Server-side immutable timestamps
- **Security Architecture** — 5-layer security model

---

## [1.0.0] - 2026-02-20 — Initial Release

> **Timestamp:** 2026-02-20T10:00:00+07:00

### Added

- Full-stack CMS with React 18 and TypeScript
- Supabase backend integration
- Responsive design with Tailwind CSS
- Shadcn/UI component library
- Interactive maps and gallery
- Contact management system

---

🤝 **Developer:** Tim Teknik | Mulky Malikul Dhaher
⚠️ Education Purpose Only | Risiko apapun tidak kita tanggung
📄 MIT License — Copyright © 2026 Mulky Malikul Dhaher
