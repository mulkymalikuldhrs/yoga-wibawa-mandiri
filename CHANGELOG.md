# CHANGELOG — YWM Dashboard

## v8.0.0 — 2026-05-30 — Multi-Agent Audit & Massive Upgrade
### Perubahan Utama
- **Database Foundation:** Migrasi dari localStorage → Supabase dual-write (13 tables)
  - spare_parts, maintenance, team_activity, pispot, documents
  - notifications, chat_history, silo_calculation, silo_opname
  - production, finance, safety_incident, employee
- **Schema & RLS:** Semua tabel dengan trigger updated_at + Row Level Security
- **Seed Data:** Sample data untuk semua modul
- **Service Key:** Dual-key support (anon + service_role)

### AI & Chatbot
- `buildDashboardContext()`: Real-time dashboard data fetching untuk AI context
- `parseDataInputAction()`: Parse natural language → structured JSON
- `DataInputCard`: Konfirmasi UI sebelum data tersimpan
- **ChatBot.tsx** (public): Sekarang include dashboard context + database-aware
- **AiAssistantPanel.tsx**: Speech recognition, streaming response, DB-aware
- Voice input (id-ID)

### Halaman Baru
- **Products.tsx:** E-commerce style — PCC Zak 40kg (250/750) + Bulk/Curah (max 30 ton)
  - WhatsApp order langsung ke +6285322624048
  - Konsultasi via WhatsApp
- **Contact.tsx:** Floating WhatsApp button, contact form
- **Services.tsx:** Improved content with YWM branding

### Desain UI
- **Glassmorphic Theme:** App.css — frosted glass, gradient backgrounds
- **Consistent color scheme:** Navy (#1e3a5f), Gold (#e8c24a), Light blue (#a0c4e8)
- **SVG Logos:** logo.svg, favicon.svg, icon.svg — factory + branding
- **Layout:** Fixed header height, Products nav link

### Silo Calculation
- Accurate formulas from Excel files:
  - tSilinder = ukuran × 0.5 (konversi 7-lubang)
  - tConis = 7.7 - tSilinder
  - VolumeSilinder = π × r² × tSilinder
  - VolumeConis = 1/3 × π × r² × tConis
  - Kekosongan = VolumeTotal - volume_all_holes
- Unit-tested pure functions

### Produk
- PCC Zak 40kg (2 pilihan: 250 zak / 750 zak)
- Bulk/Curah (input manual, max 30 ton)
- WhatsApp auto-link untuk pemesanan

### Technical
- Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- `@vitejs/plugin-react-swc` → diganti ke fresh install fix Bus error
- .env.local dengan Supabase credentials
- API routes: /api/chat, /api/chat/stream, /api/db/data, /api/db/status
- CRUD operations via `/api/db/data` (GET/POST/PUT/DELETE)
- PWA: manifest.json, service worker, offline.html

### Yang Perlu Disetel Manual
1. **Vercel:** Set environment variables:
   - `VITE_SUPABASE_URL=https://aymvpyehihbgmllcgilq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=sb_publishable_yUsl4e5WRhQnqgXocx88hw_VX3ecjde`
   - `SUPABASE_SERVICE_ROLE_KEY=<isi dari Supabase Dashboard>`
2. **Logo:** Ganti `public/logo.svg` jika ingin logo resmi
3. **PWA Icons:** Generate icon-192x192.png dan icon-512x512.png

### Files Changed
```
M src/App.css                — Glassmorphic theme
M src/App.tsx                — Products route
M src/components/ChatBot.tsx  — DB context integration
M src/components/Footer.tsx   — Products link
M src/components/Header.tsx   — Products nav
M src/components/dashboard/AiAssistantPanel.tsx — DB-aware AI
M src/components/dashboard/modules/SiloCalculationModule.tsx — Excel-based formulas
M src/pages/Contact.tsx       — WhatsApp + form
M src/pages/Products.tsx      — NEW e-commerce page
M src/pages/Services.tsx      — Improved branding
A public/logo.svg             — YWM SVG logo
A public/favicon.svg          — Favicon
A public/icon.svg             — PWA icon
A COMPREHENSIVE_AUDIT.md      — Full codebase audit
A MASSIVE_TODO.md             — 8-phase execution plan
A CHANGELOG.md                — This file
```

### Catatan
- Semua modul dashboard SUDAH terhubung ke Supabase via `@/lib/supabase-data.ts`
- Dual-write: localStorage + Supabase (resilient)
- Public chatbot (ChatBot.tsx) sekarang DB-aware
- Lihat `MASSIVE_TODO.md` untuk Phase 2-8 yang belum dikerjakan
