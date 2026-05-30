# COMPREHENSIVE AUDIT — YWM Dashboard
**PT Yoga Wibawa Mandiri — Digital Platform**
Repo: github.com/mulkymalikuldhrs/yoga-wibawa-mandiri
Date: 2026-05-30
Auditor: Hermes Agent (Multi-Agent Execution)

---

## 1. TECH STACK SUMMARY

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | React 18 + TypeScript + Vite | ✅ |
| UI | Tailwind CSS + shadcn/ui + Radix | ✅ |
| State | React Context + TanStack Query | ✅ |
| Database | Supabase (PostgreSQL) | ⚠️ .env not configured |
| Local Storage | localStorage (current primary) | ⚠️ Needs migration |
| AI | z-ai-web-dev-sdk (Vercel Serverless) | ⚠️ Not connected to DB |
| PWA | Service Worker + Manifest | ⚠️ Basic, needs polish |
| CI/CD | GitHub Actions + Vercel | ✅ |
| Auth | Supabase Auth (anon key only) | ⚠️ No real auth |

## 2. CODEBASE METRICS

- Total files: ~200 (95 tsx, 25 ts, 19 md, 9 json)
- Dashboard modules: 11 (SpareParts, Maintenance, TeamActivity, Pispot, SiloOpname, SiloCalc, Analytics, Overview, Notifications, Production, Finance)
- API routes: 5 (chat, chat/stream, db/data, db/status, health, smart-parse)
- Lines per major module: 275-818 lines each

## 3. CURRENT STATE — ISSUE MAPPING

### 3.1 Logo & Branding ❌
- **public/lovable-uploads/**: Contains random placeholder images (logo PT Semen Padang hitam, random PNGs)
- Logo tidak sesuai dengan branding YWM
- `icon-192.png` dan `icon-512.png` mungkin placeholder

### 3.2 Notifications ❌
- **NotificationCenter.tsx** (567 lines): UI exists but data from localStorage
- **NotificationProvider.tsx**: Context provider with dummy data
- **NotificationPopup.tsx**: Popup component
- **NotificationsModule.tsx** (275 lines): Dashboard module
- **No real push notifications**: Service worker has push handler but no VAPID keys configured
- No integration with device push (Web Push API)

### 3.3 Database Integration ❌
- **supabase-data.ts** (18K chars): Has CRUD functions but localStorage is still PRIMARY
- **db-init.ts** (8K chars): Migration layer exists but tables may not be created
- **dashboard-storage.ts** (25K chars): localStorage-first approach
- **supabase.ts** (11K chars): Client + helper functions
- Data input forms DO NOT save to Supabase — they use localStorage via `saveData()`
- **schema.sql**: 12 tables defined (spare_parts, maintenance, team_activity, pispot, documents, notifications, chat_history, silo_calculation, silo_opname, production, finance, safety_incident)

### 3.4 CRUD Operations ❌
- UI elements for add/edit/delete exist in modules but connect to localStorage
- No Supabase CRUD actually wired to form submissions
- Edit/update dialogs not connected to database

### 3.5 AI Integration ❌
- **ywm-ai.ts** (10K chars): AI service calls Vercel API
- **api/chat.ts**: Uses z-ai-web-dev-sdk for LLM
- **FloatingChatBot.tsx** (818 lines): Chat UI with toggle
- **system-prompt.ts**: Has dashboard data context builder
- **Not connected to database for CRUD operations**
- AI can't read/write to Supabase
- No tool/function calling for database operations

### 3.6 Dashboard Design ⚠️
- App.css still has default Vite boilerplate (#root max-width: 1280px, logo-spin animation)
- Glassmorphic components exist (GlassCard.tsx) but may not be consistent
- Color scheme: ywm-red (#C62828), ywm-dark (#212121), ywm-light (#FFFFFF)
- Dashboard may not match website design language

### 3.7 Website Pages ⚠️
- Pages: Index, About, Services, Gallery, Location, Contact
- Likely basic templates that need content upgrade

### 3.8 Data Input Modules ❌
- **SparePartsModule.tsx** (402 lines): Form UI, localStorage only
- **MaintenanceModule.tsx** (324 lines): Form UI, localStorage only
- **TeamActivityModule.tsx** (332 lines): Form UI, localStorage only
- **PispotModule.tsx** (530 lines): Form UI, localStorage only
- **SiloOpnameModule.tsx** (399 lines): Form UI, localStorage only
- **SiloCalculationModule.tsx** (617 lines): Form UI, localStorage only
- **None connected to Supabase**

### 3.9 Analytics ❌
- **AnalyticsModule.tsx** (585 lines): Contains charts + graphs
- **OverviewModule.tsx** (686 lines): Summary/dashboard home
- Analytics is in Overview/Ringkasan module, not in sidebar
- Should show ALL data types (spare parts stock, silo levels, maintenance, pispot)

### 3.10 Web Push Notifications ❌
- Service worker has `push` event listener but no VAPID key
- No browser notification permission flow
- NotificationCenter uses in-app toasts, not device notifications

### 3.11 Chatbot ❌
- FloatingChatBot.tsx has UI with toggle ON/OFF
- Uses basic LLM via z-ai-web-dev-sdk
- Can't read/write database
- No natural language understanding for YWM-specific queries
- No confirmation flow for edit operations
- No document context from uploaded files

### 3.12 Product Specifications ❌
- Mentions 50kg in some places — should be 40kg (zak) + bulk/curah
- No e-commerce product page for Semen Padang products

### 3.13 Typography & Visual ❌
- Font colors may need improvement
- Copywriting needs professional polish
- Photos may not be relevant (Semen Padang imagery needed)

### 3.14 Contact / WhatsApp ❌
- No WhatsApp integration
- Phone number should be +6285322624048
- Product inquiries should go to WhatsApp

### 3.15 Summary / Ringkasan ❌
- Should show ALL data: spare parts stock, silo levels, maintenance schedule, pispot status, team activity
- Currently shows partial/simulated data

### 3.16 Visualization ❌
- Silo visualization needed (graphical silo with fill level)
- Spare parts object visualization
- Charts for all metrics

### 3.17 PWA ❌
- Service worker exists but may not work properly
- manifest.json exists
- Install prompt may not work
- Multi-device support untested

### 3.18 Silo Formulas ❌
- Excel files (*.xlsx) from KDE Connect have actual formulas
- SiloCalculationModule may have incorrect formulas
- Discharge loading calculations may be wrong
- Need to verify against the Excel files

### 3.19 Document AI ❌
- Documents, blueprints, manuals, PDFs, DOCX files should be readable by AI
- AI should provide troubleshooting, early detection, maintenance guidance
- No document ingestion pipeline

### 3.20 Testing ❌
- test-browser.mjs exists (uses Puppeteer?)
- No comprehensive test suite
- No end-to-end tests
- CI/CD may not have test steps

---

## 4. DATABASE SCHEMA (Required Tables)

Tables needed in Supabase:
1. spare_parts — Inventory suku cadang
2. maintenance — Perawatan mesin
3. team_activity — Aktivitas tim
4. pispot — Pelumasan bearing/pompa
5. documents — Dokumen/file
6. notifications — Notifikasi
7. chat_history — Riwayat chat AI
8. silo_calculation — Kalkulasi kekosongan silo
9. silo_opname — Opname silo
10. production — Produksi
11. finance — Keuangan
12. safety_incident — Insiden keselamatan
13. employee — Karyawan
14. products — Produk e-commerce (NEW)
15. orders — Pesanan (NEW)

## 5. SEVERITY MATRIX

| Issue | Severity | Effort | Priority |
|-------|----------|--------|----------|
| Data not saved to Supabase | CRITICAL | Large | P0 |
| No CRUD operations | CRITICAL | Large | P0 |
| Logo/branding wrong | HIGH | Small | P1 |
| Dashboard design inconsistent | HIGH | Medium | P1 |
| Silo formulas incorrect | HIGH | Medium | P1 |
| Analytics incomplete | HIGH | Medium | P1 |
| Chatbot not connected to DB | HIGH | Large | P1 |
| Notifications dummy | MEDIUM | Medium | P2 |
| No WhatsApp integration | MEDIUM | Small | P2 |
| PWA polish | MEDIUM | Medium | P2 |
| Website content upgrade | MEDIUM | Large | P2 |
| Product page (40kg/bulk) | MEDIUM | Medium | P2 |
| Document AI | LOW | Large | P3 |
| Testing | LOW | Large | P3 |
