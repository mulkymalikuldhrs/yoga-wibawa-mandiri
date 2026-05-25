# 🏗️ ARSITEKTUR SISTEM — PT Yoga Wibawa Mandiri AI Dashboard

> **Dokumen Arsitektur Sistem** — Arsitektur lengkap dashboard operasional berbasis Puter.js
> **Versi:** 5.0.0 | **Terakhir Diperbarui:** 2026-05-26
> **Arsitek:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

---

## 1. Ringkasan Sistem

PT YWM AI Dashboard adalah platform operasional komprehensif yang dibangun di atas **Puter.js** — cloud OS yang menyediakan AI, database, storage, dan autentikasi tanpa server dan tanpa API key. Arsitektur ini mengeliminasi kebutuhan backend tradisional (Supabase, Firebase, dll.) dan menggantinya sepenuhnya dengan layanan Puter.js yang berjalan di browser.

### Prinsip Desain Utama

| Prinsip | Penjelasan |
|---------|-----------|
| **Zero Server** | Tidak ada backend server yang perlu di-deploy, dikelola, atau dibayar |
| **Zero API Key** | Semua layanan AI dan cloud berjalan tanpa API key |
| **User-Pays Model** | Pengguna membayar langsung ke Puter untuk penggunaan AI/storage |
| **Sandboxed Data** | Data terisolasi per aplikasi di KV Store Puter |
| **Glassmorphic UI** | Desain frosted glass yang modern dan elegan |
| **Offline-Ready** | Core functionality tetap berjalan tanpa koneksi internet |

---

## 2. Arsitektur High-Level

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PT YWM AI Dashboard Platform                      │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Frontend (Browser)                          │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │  │
│  │  │  Vanilla     │  │  Puter.js    │  │  Custom Glassmorphic │ │  │
│  │  │  HTML/CSS/JS │  │  SDK         │  │  CSS                  │ │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘ │  │
│  │         │                  │                      │            │  │
│  │         └──────────────────┼──────────────────────┘            │  │
│  │                            │                                   │  │
│  │  ┌─────────────────────────▼─────────────────────────────────┐│  │
│  │  │              Dashboard Modules (15+ Modul)                ││  │
│  │  │                                                           ││  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    ││  │
│  │  │  │ Spare    │ │ Team     │ │ Auto     │ │ Maintain-│    ││  │
│  │  │  │ Parts    │ │ Activity │ │ Timestamp│ │ ance     │    ││  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    ││  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    ││  │
│  │  │  │ Produc-  │ │ Quality  │ │ Safety/  │ │ Finance  │    ││  │
│  │  │  │ tion     │ │ Control  │ │ HSE      │ │          │    ││  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    ││  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    ││  │
│  │  │  │ HR/      │ │ Document │ │ Analy-   │ │ Notifi-  │    ││  │
│  │  │  │ Payroll  │ │ & OCR    │ │ tics     │ │ cations  │    ││  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    ││  │
│  │  └───────────────────────────────────────────────────────────┘│  │
│  │                                                               │  │
│  │  ┌───────────────────────────────────────────────────────────┐│  │
│  │  │              AI Assistant (Puter AI)                      ││  │
│  │  │  ┌────────┐ ┌──────┐ ┌─────┐ ┌──────────┐ ┌──────────┐ ││  │
│  │  │  │ Chat   │ │ OCR  │ │ TTS │ │ STT      │ │ Image    │ ││  │
│  │  │  │ Compl. │ │      │ │     │ │ (Voice)  │ │ Gen      │ ││  │
│  │  │  └────────┘ └──────┘ └─────┘ └──────────┘ └──────────┘ ││  │
│  │  └───────────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Puter.js Cloud OS                          │  │
│  │                                                               │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌───────────────────────┐ │  │
│  │  │ Puter KV    │ │ Puter FS     │ │ Puter Auth            │ │  │
│  │  │ Store       │ │ (Cloud       │ │ (Autentikasi          │ │  │
│  │  │ (Database)  │ │  Storage)    │ │  User)                │ │  │
│  │  └──────┬──────┘ └──────┬───────┘ └───────────┬───────────┘ │  │
│  │         │               │                      │             │  │
│  │  ┌──────▼───────────────▼──────────────────────▼───────────┐ │  │
│  │  │              Puter AI (GPT-4o-mini, Claude, dll.)       │ │  │
│  │  │  - Chat Completions    - OCR (Image to Text)            │ │  │
│  │  │  - Text to Speech     - Speech to Text                  │ │  │
│  │  │  - Image Generation   - Embeddings                      │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Struktur Proyek

```
yoga-wibawa-mandiri/
├── src/
│   ├── main.tsx                          # Entry point
│   ├── App.tsx                           # Root app dengan routing
│   ├── App.css                           # Global styles
│   ├── index.css                         # Design system (Tailwind + glassmorphic)
│   ├── vite-env.d.ts                     # Vite types
│   │
│   ├── components/
│   │   ├── ui/                           # Shadcn/UI components (50+ komponen)
│   │   ├── Header.tsx                    # Website header
│   │   ├── Footer.tsx                    # Website footer
│   │   ├── Layout.tsx                    # Layout wrapper
│   │   ├── LoadingSpinner.tsx            # Loading state
│   │   ├── EmailSetupGuide.tsx           # Email guide
│   │   ├── ChatBot.tsx                   # AI Chatbot component
│   │   ├── ScrollToTop.tsx               # Scroll utility
│   │   │
│   │   └── dashboard/                    # Dashboard components
│   │       ├── layout/                   # DashboardLayout, Sidebar, Header
│   │       ├── widgets/                  # KPI cards, charts, status
│   │       ├── forms/                    # Input forms per modul
│   │       ├── shared/                   # Reusable dashboard components
│   │       └── ai/                       # AI assistant components
│   │
│   ├── pages/
│   │   ├── Index.tsx                     # Homepage
│   │   ├── About.tsx                     # Tentang perusahaan
│   │   ├── Services.tsx                  # Layanan
│   │   ├── Gallery.tsx                   # Galeri
│   │   ├── Location.tsx                  # Lokasi
│   │   ├── Contact.tsx                   # Kontak
│   │   ├── NotFound.tsx                  # 404
│   │   │
│   │   └── dashboard/                    # Dashboard pages
│   │       ├── DashboardHome.tsx         # Dashboard overview
│   │       ├── SpareParts.tsx            # Inventaris spare part
│   │       ├── TeamActivity.tsx          # Kegiatan tim
│   │       ├── Production.tsx            # Produksi & operasional
│   │       ├── Maintenance.tsx           # Maintenance management
│   │       ├── QualityControl.tsx        # Quality control
│   │       ├── SafetyHSE.tsx             # Safety & HSE
│   │       ├── Finance.tsx               # Finance & accounting
│   │       ├── HRPayroll.tsx             # HR & payroll
│   │       ├── DocumentOCR.tsx           # Document & OCR
│   │       ├── Analytics.tsx             # Analytics & reports
│   │       ├── Notifications.tsx         # Notifications center
│   │       └── Settings.tsx              # Pengaturan
│   │
│   ├── services/
│   │   ├── emailService.ts               # Email service
│   │   ├── puterService.ts               # Puter.js integration service
│   │   ├── kvService.ts                  # KV Store operations
│   │   ├── fsService.ts                  # File System operations
│   │   ├── aiService.ts                  # AI operations (chat, OCR, TTS, STT)
│   │   └── authService.ts                # Auth operations
│   │
│   ├── hooks/
│   │   ├── use-toast.ts                  # Toast notifications
│   │   ├── use-mobile.tsx                # Mobile detection
│   │   ├── useAutoTimestamp.ts           # Auto timestamp hook
│   │   ├── useKVStore.ts                 # KV Store hook
│   │   ├── usePuterAI.ts                 # AI operations hook
│   │   └── usePuterAuth.ts               # Auth hook
│   │
│   ├── lib/
│   │   └── utils.ts                      # Utility functions
│   │
│   └── types/
│       ├── dashboard.ts                  # Dashboard type definitions
│       ├── sparePart.ts                  # Spare part types
│       ├── production.ts                 # Production types
│       ├── maintenance.ts                # Maintenance types
│       ├── team.ts                       # Team types
│       └── puter.ts                      # Puter.js type definitions
│
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   ├── robots.txt
│   └── lovable-uploads/                  # Uploaded images
│
├── docs/                                 # Documentation
│   ├── ARCHITECTURE.md                   # Arsitektur sistem (file ini)
│   ├── DATA_BLUEPRINT.md                 # Database schema
│   ├── API_REFERENCE.md                  # API reference
│   ├── DEPLOYMENT.md                     # Deployment guide
│   ├── DASHBOARD.md                      # Dashboard documentation
│   └── PUTER_INTEGRATION.md              # Puter.js integration guide
│
├── ARCHITECTURE.md                       # Root architecture doc
├── ROADMAP.md                            # Development roadmap
├── TODO.md                               # Master task list
├── CHANGELOG.md                          # Version history
├── CONTRIBUTING.md                       # Contributing guide
├── SECURITY.md                           # Security policy
├── CODE_OF_CONDUCT.md                    # Code of conduct
├── README.md                             # Project README
├── LICENSE                               # MIT License
├── package.json                          # Dependencies
├── vite.config.ts                        # Vite configuration
├── tailwind.config.ts                    # Tailwind configuration
├── tsconfig.json                         # TypeScript configuration
├── components.json                       # Shadcn/UI configuration
├── postcss.config.js                     # PostCSS configuration
└── eslint.config.js                      # ESLint configuration
│
├── dashboard/                            # Dashboard (Vanilla HTML + CSS + JS + Puter.js)
│   ├── index.html                        # Dashboard shell (sidebar + header + AI panel)
│   ├── css/
│   │   ├── glassmorphic.css              # Design system (frosted glass, colors, variables)
│   │   ├── dashboard-layout.css          # Main layout grid
│   │   ├── sidebar.css                   # Sidebar navigation styles
│   │   ├── cards.css                     # Card component styles
│   │   ├── ai-panel.css                  # AI assistant panel styles
│   │   └── responsive.css                # Mobile responsive breakpoints
│   ├── js/
│   │   ├── puter-init.js                 # Puter.js initialization & auth
│   │   ├── ai-config.js                  # AI prompts, model config, agent config
│   │   ├── ai-assistant.js               # AI chat + autonomous agent system
│   │   ├── voice-handler.js              # Speech-to-text input
│   │   ├── ocr-handler.js                # Document OCR processing
│   │   ├── smart-input.js                # Natural language data input parsing
│   │   ├── report-generator.js           # Auto report generation
│   │   ├── utils/
│   │   │   ├── formatters.js             # Number/date/currency formatters
│   │   │   └── validators.js             # Input validation utilities
│   │   └── modules/
│   │       ├── app.js                    # Core: YWM.App (router), YWM.UI (toast/modal), YWM.Data (KV CRUD)
│   │       ├── home.js                   # KPI overview, quick actions
│   │       ├── spareparts.js             # Inventory management
│   │       ├── production.js             # Production tracking
│   │       ├── maintenance.js            # Work orders
│   │       ├── team.js                   # Team activity
│   │       ├── quality.js                # QC batch testing
│   │       ├── safety.js                 # HSE incidents
│   │       ├── finance.js                # Transaction tracking
│   │       ├── hr.js                     # Employee management
│   │       ├── purchasing.js             # Purchase orders
│   │       ├── documents.js              # Document OCR
│   │       ├── reports.js                # Report generation
│   │       ├── notifications.js          # Alert system
│   │       ├── analytics.js              # KPI analytics
│   │       └── settings.js               # App configuration
│   └── assets/
│       └── favicon.svg
```

---

## 4. Technology Stack

### 4.1 Frontend

| Layer | Teknologi | Versi | Keterangan |
|-------|-----------|-------|------------|
| Framework | React | 18.3+ | UI library |
| Bahasa | TypeScript | 5.5+ | Type safety |
| Build Tool | Vite | 5.4+ | Fast HMR & build |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS |
| UI Library | Shadcn/UI | latest | Accessible components (50+) |
| Charts | Recharts | 2.12+ | Data visualization |
| Routing | React Router | 6.x | Client-side routing |
| State | Zustand | 4.x | Lightweight state management |
| Server State | TanStack Query | 5.x | Async state management |
| Forms | React Hook Form + Zod | latest | Form handling + validation |
| Date | date-fns | 3.x | Date manipulation |
| Icons | Lucide React | latest | Icon library |
| Animation | Framer Motion | 11.x | Page transitions & micro-animations |
| Tables | TanStack Table | 8.x | Headless data tables |
| Export | xlsx + jspdf | latest | CSV/Excel/PDF export |

### 4.2 Cloud Backend (Puter.js)

| Layanan | Fungsi | Keterangan |
|---------|--------|------------|
| **Puter KV Store** | Database | Key-value store dengan structured prefixes |
| **Puter FS** | Cloud Storage | Dokumen, foto, lampiran, exports |
| **Puter Auth** | Autentikasi | User login, session management |
| **Puter AI** | AI Services | Chat, OCR, TTS, STT, Image Generation |
| **Puter Hosting** | Deployment | Static site hosting (opsional) |

### 4.3 Perbandingan: Supabase vs Puter.js

| Aspek | Supabase (Sebelumnya) | Puter.js (Sekarang) |
|-------|----------------------|---------------------|
| Database | PostgreSQL (relasional) | KV Store (key-value) |
| Auth | Supabase Auth + JWT | Puter Auth (built-in) |
| Storage | Supabase Storage | Puter FS |
| Realtime | WebSocket subscriptions | Polling + event-driven |
| AI | Tidak ada (perlu service terpisah) | Built-in (GPT-4o-mini, Claude, dll.) |
| Server | Perlu backend/triggers | Zero server |
| API Key | Perlu API key | Zero API key |
| Biaya | Berlangganan bulanan | User-pays model |
| Kompleksitas | Tinggi (RLS, migrations, triggers) | Rendah (langsung di frontend) |
| OCR | Perlu service terpisah | Built-in via Puter AI |
| TTS/STT | Perlu service terpisah | Built-in via Puter AI |

---

## 5. Puter.js Integration Architecture

### 5.1 Puter KV Store — Database

KV Store menggunakan pattern **structured prefixes** untuk mengorganisir data layaknya tabel database:

```
Key Pattern: {app}:{module}:{entity}:{id}

Contoh:
ywm:sparepart:item:sp-001          → JSON data spare part
ywm:sparepart:index:all            → JSON array semua spare part IDs
ywm:production:daily:2026-03-05    → JSON data produksi harian
ywm:production:shift:pagi:2026-03-05 → JSON data produksi per shift
ywm:maintenance:wo:WO-2026-0001    → JSON data work order
ywm:team:activity:2026-03-05       → JSON data kegiatan tim
ywm:qc:batch:B-2026-0305-001      → JSON data quality control
ywm:hse:incident:INC-2026-001     → JSON data insiden HSE
ywm:hr:employee:EMP-001           → JSON data karyawan
ywm:finance:transaction:TRX-001   → JSON data transaksi keuangan
ywm:doc:meta:DOC-001              → JSON metadata dokumen
ywm:notification:user:user1       → JSON array notifikasi user
ywm:analytics:daily:2026-03-05    → JSON data analitik harian
ywm:settings:app                  → JSON pengaturan aplikasi
ywm:audit:log:2026-03-05          → JSON audit trail harian
```

### 5.2 Puter FS — Cloud Storage

```
File Structure di Puter FS:

/ywm-dashboard/
├── documents/
│   ├── invoices/           → Faktur & invoice
│   ├── reports/            → Laporan (PDF, Excel)
│   ├── certificates/       → Sertifikasi & compliance
│   └── contracts/          → Kontrak & perjanjian
├── images/
│   ├── photos/             → Foto kegiatan & dokumentasi
│   ├── qc-samples/         → Foto sample QC
│   ├── hse-evidence/       → Foto bukti insiden HSE
│   └── equipment/          → Foto mesin & peralatan
├── exports/
│   ├── daily/              → Export laporan harian
│   ├── weekly/             → Export laporan mingguan
│   └── monthly/            → Export laporan bulanan
└── backups/
    └── kv-dumps/           → Backup data KV Store
```

### 5.3 Puter Auth — Autentikasi

```
Auth Flow:

1. User membuka dashboard → Cek Puter.getUser()
2. Belum login → Tampilkan halaman login Puter
3. User login via Puter Auth → Dapatkan user session
4. Aplikasi membaca user info (username, email, UUID)
5. Cek role user dari KV Store: ywm:auth:role:{username}
6. Role menentukan navigasi & akses modul
7. Semua operasi KV/FS menggunakan session user yang login
```

### 5.4 Puter AI — Layanan AI

```
AI Services Architecture:

┌─────────────────────────────────────────────┐
│              Puter AI Gateway                │
│                                             │
│  ┌─────────────┐  ┌──────────────────────┐ │
│  │ Chat        │  │ Vision / OCR          │ │
│  │ Completions │  │ (Image → Text)        │ │
│  │             │  │                       │ │
│  │ Models:     │  │ Use Cases:            │ │
│  │ - GPT-4o-   │  │ - Scan dokumen        │ │
│  │   mini      │  │ - Baca label barang   │ │
│  │ - Claude    │  │ - Identifikasi mesin   │ │
│  │ - Gemini    │  │ - Quality inspection   │ │
│  └─────────────┘  └──────────────────────┘ │
│                                             │
│  ┌─────────────┐  ┌──────────────────────┐ │
│  │ Text to     │  │ Speech to Text       │ │
│  │ Speech      │  │ (Voice → Text)       │ │
│  │             │  │                       │ │
│  │ Use Cases:  │  │ Use Cases:            │ │
│  │ - Notifikasi│  │ - Input via suara     │ │
│  │ - Alert     │  │ - Catatan laporan     │ │
│  │ - Laporan   │  │ - Command dashboard   │ │
│  └─────────────┘  └──────────────────────┘ │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ Image Generation                        ││
│  │                                         ││
│  │ Use Cases:                              ││
│  │ - Generate report covers                ││
│  │ - Visual documentation                  ││
│  │ - Marketing materials                   ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## 6. Dashboard Modules — 15+ Modul

### 6.1 Modul dan Fungsionalitas

| # | Modul | KV Prefix | Fungsi Utama | Prioritas |
|---|-------|-----------|-------------|-----------|
| 1 | **Spare Parts Inventory** | `ywm:sparepart:` | Manajemen stok spare part, reorder alert, part-mesin mapping | 🔴 Critical |
| 2 | **Team Activity** | `ywm:team:` | Pencatatan kegiatan tim, performance metrics, check-in/out | 🔴 Critical |
| 3 | **Auto Timestamp** | `ywm:audit:` | Timestamp otomatis server-side, audit trail universal | 🔴 Critical |
| 4 | **Production Tracker** | `ywm:production:` | Tracking produksi harian, curah receiving, distribusi | 🔴 Critical |
| 5 | **Maintenance Schedule** | `ywm:maintenance:` | Work orders, preventive/corrective/predictive maintenance | 🟠 High |
| 6 | **Quality Control** | `ywm:qc:` | Batch testing, SNI compliance, trend analysis | 🟠 High |
| 7 | **Safety/HSE** | `ywm:hse:` | Insiden reporting, safety inspection, K3 metrics | 🟠 High |
| 8 | **Finance** | `ywm:finance:` | Transaksi keuangan, cost tracking, budget monitoring | 🟠 High |
| 9 | **HR/Payroll** | `ywm:hr:` | Absensi, cuti, payroll, data karyawan | 🟠 High |
| 10 | **Document & OCR** | `ywm:doc:` | Upload dokumen, OCR scanning, version control | 🟠 High |
| 11 | **Analytics** | `ywm:analytics:` | Dashboard KPI, trend analysis, forecasting | 🟡 Medium |
| 12 | **Notifications** | `ywm:notification:` | Alert system, reminders, escalation | 🟡 Medium |
| 13 | **AI Assistant** | `ywm:ai:` | Chatbot, voice input, smart suggestions | 🟡 Medium |
| 14 | **Settings** | `ywm:settings:` | Konfigurasi aplikasi, user management, roles | 🟡 Medium |
| 15 | **Public Dashboard** | — | KPI publik yang bisa dilihat tanpa login | 🟢 Low |

### 6.2 Data Flow per Modul

```
┌──────────────────────────────────────────────────────────────────┐
│                    Data Flow — Spare Parts                        │
│                                                                  │
│  User Input (Form)                                               │
│       │                                                          │
│       ▼                                                          │
│  Validasi (Zod Schema)                                           │
│       │                                                          │
│       ▼                                                          │
│  puter.kv.set('ywm:sparepart:item:SP-001', JSON.stringify(data))│
│       │                                                          │
│       ├── Update index: ywm:sparepart:index:all                  │
│       ├── Cek reorder point → Buat notifikasi jika stok rendah  │
│       └── Log audit: ywm:audit:log:2026-03-05                   │
│                                                                  │
│  Baca Data:                                                      │
│  puter.kv.get('ywm:sparepart:item:SP-001')                      │
│       → JSON.parse() → Render di UI                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Data Flow — Production                         │
│                                                                  │
│  Operator Input (Produksi Harian)                                │
│       │                                                          │
│       ▼                                                          │
│  Validasi (Zod Schema)                                           │
│       │                                                          │
│       ▼                                                          │
│  puter.kv.set('ywm:production:daily:2026-03-05', JSON)          │
│       │                                                          │
│       ├── Update shift data: ywm:production:shift:pagi:...       │
│       ├── Update analytics: ywm:analytics:daily:2026-03-05       │
│       ├── Cek target vs realisasi → Alert jika deviasi           │
│       └── Log audit: ywm:audit:log:2026-03-05                   │
│                                                                  │
│  Dashboard Widget:                                               │
│  puter.kv.get('ywm:production:daily:2026-03-05')                │
│       → JSON.parse() → KPI Card / Chart                          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Data Flow — AI Assistant                       │
│                                                                  │
│  User Message (Text / Voice)                                     │
│       │                                                          │
│       ▼                                                          │
│  Speech to Text (jika voice)                                     │
│       │  puter.ai.txt2speech() / puter.ai.speech2txt()          │
│       ▼                                                          │
│  Context Builder                                                 │
│       │  ├── Ambil data relevan dari KV Store                    │
│       │  ├── Bangun system prompt dengan konteks YWM             │
│       │  └── Include data operasional terkini                    │
│       ▼                                                          │
│  Chat Completion                                                 │
│       │  puter.ai.chat(prompt, {model: 'gpt-4o-mini'})          │
│       ▼                                                          │
│  Response Processing                                             │
│       ├── Render di chat UI                                      │
│       ├── Text to Speech (opsional)                              │
│       └── Simpan riwayat: ywm:ai:chat:{sessionId}               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Data Flow — Document & OCR                     │
│                                                                  │
│  Upload Dokumen                                                  │
│       │                                                          │
│       ▼                                                          │
│  puter.fs.upload(file, '/ywm-dashboard/documents/invoices/')     │
│       │                                                          │
│       ▼                                                          │
│  OCR Processing                                                  │
│       │  puter.ai.ocr(imageData)                                 │
│       ▼                                                          │
│  Data Extraction                                                 │
│       │  AI chat completion untuk extract field dari OCR text    │
│       ▼                                                          │
│  Simpan Metadata                                                 │
│       │  puter.kv.set('ywm:doc:meta:DOC-001', JSON)             │
│       └── Simpan hasil OCR: ywm:doc:ocr:DOC-001                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6.3 Arsitektur AI Agent

AI Agent adalah sistem otonom yang mampu mendeteksi aksi dari input pengguna, mengeksekusi operasi di dashboard secara otomatis, dan menjalankan pemantauan proaktif terhadap data operasional.

### 6.3.1 Pipeline Deteksi Aksi Agent

```
┌──────────────────────────────────────────────────────────────────┐
│                AI Agent Action Detection Pipeline                 │
│                                                                  │
│  Input Pengguna (Teks / Suara)                                   │
│       │                                                          │
│       ▼                                                          │
│  1. Keyword Match                                                │
│     ├── Pencarian kata kunci di input pengguna                   │
│     ├── Contoh: "tambah spare part", "buat work order"           │
│     └── Jika match → lanjut ke tahap 2                          │
│                                                                  │
│  2. AI Parse                                                     │
│     ├── Kirim input ke Puter AI (GPT-4o-mini)                    │
│     ├── AI mengekstrak parameter dari input natural language     │
│     ├── AI mengidentifikasi aksi yang diminta                    │
│     └── Mengembalikan JSON: { action, params }                   │
│                                                                  │
│  3. Execute                                                      │
│     ├── Validasi parameter sesuai schema aksi                    │
│     ├── Eksekusi aksi via YWM.Data (KV CRUD)                    │
│     ├── Update UI secara real-time                               │
│     └── Log audit trail untuk setiap aksi                        │
│                                                                  │
│  4. Confirm                                                      │
│     ├── Tampilkan hasil aksi ke pengguna                         │
│     └── Konfirmasi sukses/gagal dengan toast notification        │
└──────────────────────────────────────────────────────────────────┘
```

### 6.3.2 Daftar Aksi Agent (10 Aksi)

| # | Aksi | Keyword Pemicu | Parameter | KV Prefix Terpengaruh |
|---|------|---------------|-----------|----------------------|
| 1 | **add_sparepart** | "tambah spare part", "stok baru" | `{ nama, kode, stok, min_stok, kategori, lokasi }` | `ywm:sparepart:` |
| 2 | **create_workorder** | "buat work order", "maintenance baru" | `{ judul, mesin, tipe, prioritas, deskripsi }` | `ywm:maintenance:` |
| 3 | **log_production** | "catat produksi", "input produksi" | `{ tanggal, shift, produk, jumlah, target }` | `ywm:production:` |
| 4 | **report_incident** | "lapor insiden", "kecelakaan", "near miss" | `{ tanggal, lokasi, severity, deskripsi, corrective }` | `ywm:hse:` |
| 5 | **add_transaction** | "tambah transaksi", "catat keuangan" | `{ tipe, jumlah, kategori, deskripsi, tanggal }` | `ywm:finance:` |
| 6 | **add_employee** | "tambah karyawan", "data karyawan baru" | `{ nama, nik, jabatan, departemen, mulai_kerja }` | `ywm:hr:` |
| 7 | **create_purchase_order** | "buat PO", "purchase order" | `{ supplier, items: [{kode, nama, qty}], catatan }` | `ywm:purchasing:` |
| 8 | **qc_batch_test** | "uji batch", "quality check" | `{ batch_id, produk, parameter, hasil, status }` | `ywm:qc:` |
| 9 | **generate_report** | "buat laporan", "generate report" | `{ tipe, periode, modul, format }` | `ywm:doc:` / `ywm:analytics:` |
| 10 | **update_settings** | "ubah pengaturan", "update config" | `{ key, value }` | `ywm:settings:` |

### 6.3.3 Workflow Otonom (4 Workflow)

| # | Workflow | Trigger | Langkah Eksekusi |
|---|----------|---------|-------------------|
| 1 | **Reorder Alert** | Stok spare part ≤ minimum | ① Baca stok terkini → ② Buat notifikasi → ③ Buat draft PO → ④ Kirim alert ke manager |
| 2 | **WO Overdue Monitor** | Work order melewati deadline | ① Scan WO aktif → ② Identifikasi yang overdue → ③ Eskalasi ke supervisor → ④ Update status WO |
| 3 | **Production Deviation** | Realisasi produksi < 90% target | ① Baca data produksi harian → ② Bandingkan dengan target → ③ Buat laporan deviasi → ④ Notifikasi manager produksi |
| 4 | **Daily Summary** | Setiap akhir hari (18:00) | ① Agregasi data semua modul → ② Buat ringkasan harian → ③ Simpan ke KV → ④ Kirim notifikasi ringkasan |

### 6.3.4 Sistem Pemantauan Proaktif

```
┌──────────────────────────────────────────────────────────────────┐
│              Proactive Monitoring System                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Monitoring Loop (setiap 5 menit)                        │    │
│  │                                                          │    │
│  │  1. Baca KPI terkini dari KV Store                      │    │
│  │  2. Evaluasi threshold per modul:                        │    │
│  │     ├── Spare part: stok < min_stok?                     │    │
│  │     ├── Maintenance: WO overdue?                         │    │
│  │     ├── Production: deviasi dari target?                 │    │
│  │     ├── HSE: insiden baru/tidak tertutup?                │    │
│  │     └── Finance: budget overrun?                         │    │
│  │  3. Jika threshold terpicu → jalankan workflow otonom    │    │
│  │  4. Log hasil pemantauan ke audit trail                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Threshold Configuration (disimpan di ywm:settings:monitoring):  │
│  {                                                               │
│    "sparepart_reorder_pct": 20,   // % stok vs min             │
│    "wo_overdue_hours": 24,        // jam setelah deadline       │
│    "production_deviation_pct": 10, // % deviasi dari target     │
│    "hse_unresolved_hours": 48,    // jam insiden belum resolved │
│    "finance_budget_pct": 90       // % penggunaan budget        │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
```

### 6.3.5 Audit Trail untuk Aksi Agent

Setiap aksi yang dilakukan oleh AI Agent dicatat di audit trail:

```
Key Pattern: ywm:audit:agent:{timestamp}

Contoh data audit:
{
  "timestamp": "2026-05-26T10:30:00.000Z",
  "action": "add_sparepart",
  "trigger": "user_input",           // user_input | proactive | workflow
  "user_input": "tambah spare part bearing 6205 stok 50",
  "parsed_params": {
    "nama": "Bearing 6205",
    "kode": "SP-BRG-6205",
    "stok": 50,
    "min_stok": 10,
    "kategori": "Bearing",
    "lokasi": "Gudang A-3"
  },
  "result": "success",               // success | failed | partial
  "affected_keys": [
    "ywm:sparepart:item:SP-BRG-6205",
    "ywm:sparepart:index:all"
  ],
  "execution_time_ms": 245,
  "user": "admin",
  "session_id": "sess_abc123"
}
```

---

## 7. Glassmorphic Frosted UI Design System

### 7.1 Prinsip Desain

```
┌─────────────────────────────────────────────────────────────┐
│              Glassmorphic Design Principles                  │
│                                                             │
│  1. FROSTED GLASS                                           │
│     - Semi-transparent backgrounds (rgba)                   │
│     - Backdrop blur (blur-xl)                               │
│     - Subtle border (border-white/20)                       │
│                                                             │
│  2. DEPTH & LAYERS                                          │
│     - Multiple elevation levels                             │
│     - Layered cards with z-index                            │
│     - Shadow progression                                    │
│                                                             │
│  3. GRADIENT ACCENTS                                        │
│     - Subtle gradient backgrounds                           │
│     - Gradient borders                                      │
│     - Gradient text for emphasis                            │
│                                                             │
│  4. MICRO-INTERACTIONS                                      │
│     - Hover blur changes                                    │
│     - Scale transforms                                      │
│     - Smooth transitions                                    │
│                                                             │
│  5. DARK-FIRST                                              │
│     - Primary: dark mode                                    │
│     - Light mode: adjusted glassmorphism                    │
│     - Consistent in both themes                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Tailwind CSS Classes

```css
/* Glassmorphic Card */
.glass-card {
  @apply bg-white/10 backdrop-blur-xl border border-white/20 
         rounded-2xl shadow-lg;
}

/* Glassmorphic Sidebar */
.glass-sidebar {
  @apply bg-black/20 backdrop-blur-2xl border-r border-white/10;
}

/* Glassmorphic Input */
.glass-input {
  @apply bg-white/5 backdrop-blur-sm border border-white/10 
         rounded-lg focus:border-white/30 focus:ring-1 
         focus:ring-white/20;
}

/* Gradient Accent */
.gradient-accent {
  @apply bg-gradient-to-r from-emerald-400 to-cyan-400;
}

/* Animated Gradient Background */
.animated-bg {
  @apply bg-gradient-to-br from-slate-900 via-purple-900 
         to-slate-900 animate-gradient;
}
```

### 7.3 Color Palette

| Role | Dark Mode | Light Mode | Usage |
|------|-----------|------------|-------|
| Background Base | `slate-900` | `gray-50` | Page background |
| Glass Card BG | `white/10` | `white/70` | Card surfaces |
| Glass Border | `white/20` | `gray-200` | Card borders |
| Primary Text | `white` | `slate-900` | Headings |
| Secondary Text | `slate-300` | `slate-600` | Body text |
| Accent | `emerald-400` | `emerald-600` | CTAs, highlights |
| Danger | `red-400` | `red-600` | Errors, warnings |
| Success | `green-400` | `green-600` | Confirmations |

---

## 8. Security Model

### 8.1 Keamanan Berlapis

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Architecture                         │
│                                                                 │
│  Layer 1: Puter Platform Security                               │
│  ├── Sandboxed KV Store (data terisolasi per app instance)      │
│  ├── Sandboxed FS (file terisolasi per user/app)                │
│  ├── Puter Auth (managed authentication)                        │
│  └── HTTPS/TLS (semua komunikasi terenkripsi)                   │
│                                                                 │
│  Layer 2: Application Security                                  │
│  ├── Role-based access control (RBAC)                           │
│  ├── Module-level permissions                                   │
│  ├── Input validation (Zod schemas)                             │
│  └── XSS prevention (React built-in + CSP)                      │
│                                                                 │
│  Layer 3: Data Security                                         │
│  ├── Immutable auto timestamps                                  │
│  ├── Audit trail logging                                        │
│  ├── Data validation sebelum KV write                           │
│  └── Regular KV backups ke Puter FS                             │
│                                                                 │
│  Layer 4: User-Pays Model                                       │
│  ├── AI operations dibayar user langsung ke Puter               │
│  ├── Rate limiting natural (biaya AI per request)               │
│  ├── No shared API keys (menghilangkan risiko key leak)         │
│  └── Transparency (user tahu biaya setiap operasi)              │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Role-Based Access Control (RBAC)

```
┌───────────────────────────────────────────────────┐
│                  RBAC Hierarchy                    │
│                                                   │
│  superadmin ─────┐                                │
│       │          │  Full system access             │
│       ▼          │                                 │
│  admin ──────────┤  Manage users, config, all data│
│       │          │                                 │
│       ▼          │                                 │
│  manager ────────┤  View all, approve WO/PO/leave │
│       │          │                                 │
│       ├── supervisor ──► Manage team, approve req  │
│       │                                          │
│       ├── operator ─────► Input produksi, QC      │
│       │                                          │
│       ├── teknisi ──────► Work orders, spare part │
│       │                                          │
│       ├── sales ────────► CRM, orders, customers  │
│       │                                          │
│       └── viewer ───────► Read-only dashboard     │
│                                                   │
│  Roles disimpan di: ywm:auth:role:{username}      │
│  Permissions: ywm:auth:perms:{username}           │
└───────────────────────────────────────────────────┘
```

### 8.3 Auto Timestamp Implementation

Karena tidak ada database server-side, auto timestamp diimplementasikan di level aplikasi dengan validasi:

```typescript
interface AutoTimestamp {
  created_at: string;    // ISO 8601, set saat pertama kali dibuat
  updated_at: string;    // ISO 8601, update setiap perubahan
  created_by: string;    // Puter user UUID
  updated_by: string;    // Puter user UUID
}

// Auto timestamp hook
function useAutoTimestamp() {
  const user = puter.auth.getUser();
  
  const createTimestamp = (): AutoTimestamp => ({
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: user.uuid,
    updated_by: user.uuid,
  });
  
  const updateTimestamp = (existing: AutoTimestamp): AutoTimestamp => ({
    ...existing,
    updated_at: new Date().toISOString(),
    updated_by: user.uuid,
  });
  
  return { createTimestamp, updateTimestamp };
}
```

---

## 9. Performance & Optimization

### 9.1 KV Store Optimization

| Strategi | Implementasi |
|----------|-------------|
| **Key Indexing** | Simpan index keys (`ywm:sparepart:index:all`) untuk query cepat |
| **Batch Operations** | Baca multiple keys sekaligus menggunakan `kv.list()` |
| **Data Pagination** | Paginasi di frontend dari index keys |
| **Caching** | TanStack Query cache (5 menit default) + Zustand store |
| **Lazy Loading** | Load data modul hanya saat diakses |
| **Debounced Writes** | Debounce KV writes untuk operasi berfrekuensi tinggi |

### 9.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.0s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| KV Store Read | < 200ms | Custom metric |
| KV Store Write | < 300ms | Custom metric |
| AI Chat Response | < 3s (first token) | Custom metric |
| OCR Processing | < 5s per page | Custom metric |
| Dashboard Widget Load | < 2s | Custom metric |

---

## 10. Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   Deployment Options                          │
│                                                              │
│  Opsi 1: Vercel/Netlify (Recommended)                       │
│  ├── Build: vite build                                       │
│  ├── Deploy: Static site hosting                             │
│  ├── Domain: ywm.co.id / dashboard.ywm.co.id                │
│  └── SSL: Automatic                                         │
│                                                              │
│  Opsi 2: Puter Hosting                                      │
│  ├── Deploy langsung dari Puter                              │
│  ├── Integrated dengan Puter ecosystem                       │
│  └── Domain: ywm.puter.site                                 │
│                                                              │
│  Opsi 3: GitHub Pages                                       │
│  ├── Free hosting                                            │
│  ├── GitHub Actions CI/CD                                    │
│  └── Domain: mulkymalikuldhrs.github.io/yoga-wibawa-mandiri  │
│                                                              │
│  Environment:                                                │
│  - Tidak ada .env yang diperlukan!                           │
│  - Puter.js berjalan tanpa API key                           │
│  - Semua konfigurasi di KV Store                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Data Migration — Supabase ke Puter.js

### 11.1 Migration Strategy

```
Fase 1: Dual Write
├── Data baru ditulis ke Puter KV Store
├── Supabase tetap berjalan untuk read-only
└── Script migrasi baca dari Supabase → tulis ke KV Store

Fase 2: KV-First
├── Semua operasi CRUD menggunakan Puter KV Store
├── Supabase hanya untuk backup
└── Verifikasi data konsisten

Fase 3: Full Puter.js
├── Supabase decommissioned
├── Semua data di Puter KV Store + FS
└── Backup periodik ke Puter FS
```

### 11.2 Key Mapping

```
Supabase Table          → KV Store Key Pattern
─────────────────────────────────────────────────
spare_parts             → ywm:sparepart:item:{kode_part}
mesin                   → ywm:machine:item:{kode_mesin}
tim                     → ywm:team:group:{tim_id}
karyawan                → ywm:hr:employee:{nik}
kegiatan_harian         → ywm:team:activity:{date}:{id}
produksi                → ywm:production:daily:{date}
work_orders             → ywm:maintenance:wo:{nomor_wo}
qc_records              → ywm:qc:batch:{batch_id}
insiden_hse             → ywm:hse:incident:{inc_id}
audit_trail             → ywm:audit:log:{date}
dokumen                 → ywm:doc:meta:{doc_id}
transaksi_keuangan      → ywm:finance:transaction:{trx_id}
```

---

🤝 Contributing | Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

⚠️ Education Purpose Only | Risiko apapun tidak kita tanggung

📄 MIT License — Copyright © Mulky Malikul Dhaher
