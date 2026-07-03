# TODO — YWM Dashboard
_Last updated: 2026-05-29_
_Developer: ⚡ Tim Teknik | Mulky Malikul Dhaher ⚡_

---

## Production Readiness Checklist

### Core Infrastructure
- [x] Vite + React + TypeScript setup
- [x] Supabase data layer implemented
- [x] Auto-create tables on first load
- [x] localStorage fallback for offline
- [x] AI agent connection verified (z-ai-web-dev-sdk)
- [x] Service Worker registered and functional
- [x] PWA manifest.json configured
- [x] Error Boundary for crash prevention

### Features — 14 Dashboard Modules
- [x] Overview (Ringkasan) module
- [x] Spare Parts (Suku Cadang) module
- [x] Team Activity (Tim & Aktivitas) module
- [x] Maintenance (Perawatan) module
- [x] Pispot (Pompa Gemik Bearing / Lubrikasi) module
- [x] Production (Produksi) module — re-added in v6.0.0
- [x] Silo Calculation (Kalkulasi Silo) module
- [x] Silo Opname (Opname Silo) module
- [x] Safety / HSE (Keselamatan) module — re-added in v6.0.0
- [x] Finance (Keuangan) module — re-added in v6.0.0
- [x] HR / Karyawan (SDM) module — re-added in v6.0.0
- [x] Documents (Dokumen) module
- [x] Analytics (Analitik) module
- [x] Notifications (Notifikasi) module

### AI Assistant
- [x] Chat with AI via z-ai-web-dev-sdk
- [x] Streaming responses (SSE)
- [x] Connection status indicator (online/offline)
- [x] Dashboard data context builder (reads live data)
- [x] Voice input (Web Speech API, bahasa Indonesia)
- [x] Data input via natural language
- [x] Quick actions (Ringkasan, Cek Stok, Jadwal, Produksi, Safety, Input Data)
- [x] Data input confirmation card
- [x] Fallback responses when AI offline
- [x] System prompt with YWM operational context
- [x] AI chatbot on/off toggle di FloatingChatBot (v6.0.0)
- [x] Dashboard context di AiAssistantPanel (v6.0.0)
- [x] Konfirmasi sebelum AI mengubah data (DataInputCard) (v6.0.0)
- [ ] OCR document scanning via AI
- [ ] Text-to-speech output

### Notification System
- [x] Popup toast notifications (bottom-right)
- [x] Auto-dismiss after 8 seconds
- [x] Pause on hover, reset on leave
- [x] Action buttons: Baca, Buka Modul, Balas AI, Tutup
- [x] Navigate to related module from popup
- [x] Reply to notification with AI response
- [x] Notification Center (Sheet/Drawer panel)
- [x] Search & filter notifications
- [x] Smart auto-notifications (low stock, overdue maintenance)
- [x] Supabase data check for smart notifications
- [x] Notification types: info, peringatan, bahaya, sukses
- [x] Progress bar showing auto-dismiss timer
- [x] Max 3 visible popups
- [x] Browser push notification dengan beep sound (v6.0.0)
- [x] Welcome notifications + smart auto-check (v6.0.0)
- [ ] Push notifications with VAPID key
- [x] WhatsApp integration for product catalog (+6285322624038) (v6.0.0)

### PWA
- [x] manifest.json with proper icons (192x192, 512x512)
- [x] Service Worker v2 with enhanced caching
- [x] Cache-first for static assets (stale-while-revalidate)
- [x] Network-first for API responses
- [x] Separate image cache
- [x] Pre-cache critical assets on install
- [x] Offline fallback page
- [x] Install prompt handling
- [x] Install PWA button component
- [x] Offline indicator in dashboard
- [x] Push notification infrastructure (service worker handlers)
- [x] Push subscription management functions
- [ ] VAPID key configuration for push
- [ ] Background sync for offline data

### Data Layer
- [x] Supabase-first data access
- [x] localStorage fallback
- [x] Dual-write (Supabase + localStorage)
- [x] Auto-sync localStorage → Supabase
- [x] Database status indicator
- [x] Connection check with caching (30s)
- [x] camelCase ↔ snake_case conversion
- [x] Table existence check and auto-creation

### UI/UX
- [x] Glassmorphic frosted glass design
- [x] Responsive layout (mobile + tablet + desktop)
- [x] Mobile bottom navigation
- [x] Desktop sidebar (collapsible)
- [x] Custom scrollbar styling
- [x] Animated transitions
- [x] Loading states and spinners
- [x] Error states with retry
- [x] Floating colored orbs background
- [ ] Dark mode toggle (next-themes)
- [ ] Framer Motion page transitions
- [ ] Touch-friendly 44px minimum targets

### Security
- [x] CORS headers on API endpoints
- [x] Content Security Policy meta tags
- [x] Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- [x] Input validation (Zod schemas in modules)
- [x] .env.example template (no real keys)
- [x] .gitignore for sensitive files
- [ ] Supabase RLS proper auth policies
- [ ] Authentication system (NextAuth.js or Supabase Auth)
- [ ] Rate limiting on API endpoints
- [ ] CSRF protection

### Documentation
- [x] CHANGELOG.md — Complete version history
- [x] README.md — Comprehensive project docs
- [x] TODO.md — Production readiness checklist
- [x] ARCHITECTURE.md — System architecture
- [x] SECURITY.md — Security considerations
- [x] .env.example — Environment variable template
- [x] .gitignore — Git ignore rules
- [x] PRD.md — Product Requirements Document
- [x] ROADMAP.md — Development roadmap
- [x] CONTRIBUTING.md — Contributing guide

### Deployment
- [x] Vercel deployment config (vercel.json)
- [x] Vercel serverless functions (api/)
- [x] Build optimization (manual chunks)
- [x] GitHub Actions CI/CD (planned)
- [ ] Staging environment
- [ ] Production monitoring
- [ ] Error tracking (Sentry or similar)

---

## Future Features (Backlog)

### High Priority
- [ ] Push notifications with VAPID key
- [ ] Supabase RLS proper auth policies
- [ ] DocumentsModule: real file upload (currently simulated)
- [ ] DocumentsModule: OCR functionality
- [ ] DocumentsModule: "Lihat" (View) button functionality

### Medium Priority
- [ ] Document OCR via AI
- [ ] Text-to-speech for notifications
- [ ] Report generation (PDF, Excel)
- [ ] Background sync for offline data
- [ ] Puppeteer browser testing

### Low Priority
- [ ] Logo YWM dari kop surat asli
- [ ] Dashboard color consistency with website brand
- [ ] Real product images for Semen Padang
- [ ] Digital Twin / IoT integration
- [ ] Predictive analytics (ML models)
- [ ] Multi-language support (EN/CN)
- [ ] Mobile app (React Native)

---

## Bug Tracker

### Known Issues
- [ ] None currently tracked

### Fixed in v6.0.0
- [x] Infinite AI init retry loop yang menyebabkan Vercel build timeout
- [x] Nomor telepon placeholder di Contact, Location, Footer → +6285322624038
- [x] Google Maps menampilkan lokasi palsu → sekarang Pelabuhan Krueng Geukueh
- [x] 50kg → 40kg di seluruh website
- [x] PWA manifest background_color gelap → terang (#f0f9ff)
- [x] ChatBot.tsx cn() import dari @/lib/utils
- [x] Notifikasi dummy → welcome notifications + smart auto-check
- [x] About page org chart → nama asli

### Fixed in v2.0.0
- [x] Notification popup auto-dismiss was 30s (now 8s)
- [x] No "Navigate to Module" button on popup notifications
- [x] Smart notifications only checked localStorage, not Supabase
- [x] `isSupabaseAvailable` was not exported from supabase-data.ts
- [x] AI chatbot couldn't read dashboard data
- [x] Service worker didn't pre-cache enough assets
- [x] No push notification infrastructure

---

_Timestamp: 2026-05-29_  
_Developer: ⚡ Tim Teknik | Mulky Malikul Dhaher ⚡_  
_WhatsApp: +6285322624038_  
_Email: mulkymalikuldhaher@email.com_
