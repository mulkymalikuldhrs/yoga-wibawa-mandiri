# 🏗️ ARCHITECTURE — PT Yoga Wibawa Mandiri Digital Platform

> **System Architecture Document** — Comprehensive technical architecture for website + dashboard
> **Version:** 5.1.0 | **Last Updated:** 2026-05-26
> **Architect:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

---

## 1. System Overview

PT YWM Digital Platform terdiri dari 2 aplikasi utama dalam satu repository:

1. **Corporate Website** — Website publik untuk profil perusahaan, layanan, galeri, dan kontak (React + TypeScript + Vite)
2. **Technical Dashboard** — Sistem operasional komprehensif untuk manajemen produksi, inventaris, tim, maintenance, dll. (Vanilla HTML + CSS + JS + Puter.js)

Kedua aplikasi berbagi Puter.js sebagai backend — tidak ada server tradisional yang diperlukan.

```
┌─────────────────────────────────────────────────────────┐
│                    PT YWM Digital Platform               │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────────────┐   │
│  │  Corporate        │    │  Technical Dashboard      │   │
│  │  Website          │    │  (Vanilla JS + Puter.js)  │   │
│  │  (React + Vite)   │    │                            │   │
│  │                   │    │  15 Modules:               │   │
│  │  / (Home)         │    │  - Spare Parts Inventory  │   │
│  │  /tentang         │    │  - Team Activity           │   │
│  │  /layanan         │    │  - Production Tracker      │   │
│  │  /galeri          │    │  - Maintenance Schedule    │   │
│  │  /lokasi          │    │  - Quality Control         │   │
│  │  /kontak          │    │  - Safety / HSE            │   │
│  │                   │    │  - Finance                 │   │
│  │  AI ChatBot       │    │  - HR / Payroll            │   │
│  │  (Puter.js AI)    │    │  - Purchasing              │   │
│  │                   │    │  - Document & OCR          │   │
│  └────────┬──────────┘    │  - Analytics               │   │
│           │               │  - Notifications           │   │
│           │               │  - Settings                │   │
│           │               │  - AI Assistant (Agent)     │   │
│           │               └──────────┬─────────────────┘   │
│           │                          │                      │
│           └──────────┬───────────────┘                      │
│                      │                                      │
│              ┌───────▼───────┐                              │
│              │  Puter.js     │                              │
│              │  Cloud OS     │                              │
│              │               │                              │
│              │  - KV Store   │                              │
│              │  - FS Storage │                              │
│              │  - Auth       │                              │
│              │  - AI Engine  │                              │
│              └───────────────┘                              │
│                                                           │
│  Deployment: GitHub Pages (zero server, zero cost)        │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

```
yoga-wibawa-mandiri/
├── src/                              # Corporate Website (React + TypeScript + Vite)
│   ├── main.tsx                      # Entry point
│   ├── App.tsx                       # Root app with routing + Error Boundary
│   ├── index.css                     # Design system (Tailwind + glassmorphic)
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn/UI components
│   │   ├── Header.tsx                # Website header
│   │   ├── Footer.tsx                # Website footer
│   │   ├── Layout.tsx                # Layout wrapper
│   │   ├── LoadingSpinner.tsx        # Loading state
│   │   ├── ErrorBoundary.tsx         # React error boundary
│   │   ├── ChatBot.tsx               # AI Chatbot component
│   │   ├── ScrollToTop.tsx           # Scroll utility
│   │   └── dashboard/                # Dashboard components
│   │       ├── DashboardLayout.tsx   # Dashboard layout with sidebar + AI panel
│   │       ├── DashboardSidebar.tsx  # Frosted glass navigation sidebar
│   │       ├── AiAssistantPanel.tsx  # AI chat panel
│   │       └── GlassCard.tsx         # Reusable glass card component
│   │
│   ├── pages/
│   │   ├── Index.tsx                 # Homepage
│   │   ├── About.tsx                 # Tentang perusahaan
│   │   ├── Services.tsx              # Layanan
│   │   ├── Gallery.tsx               # Galeri
│   │   ├── Location.tsx              # Lokasi
│   │   ├── Contact.tsx               # Kontak
│   │   └── NotFound.tsx              # 404
│   │
│   ├── lib/
│   │   ├── utils.ts                  # Utility functions
│   │   ├── puter.ts                  # Puter.js SDK wrapper + types
│   │   ├── puter-ai.ts              # AI operations (chat, OCR, smart parse)
│   │   ├── puter-kv.ts              # KV Store operations
│   │   └── puter-fs.ts              # File System operations
│   │
│   ├── hooks/
│   │   ├── use-toast.ts             # Toast notifications
│   │   └── use-mobile.tsx           # Mobile detection
│   │
│   ├── services/
│   │   └── emailService.ts          # Email service (EmailJS + Formspree)
│   │
│   └── types/
│       └── dashboard.ts             # Dashboard type definitions + KV prefixes
│
├── dashboard/                        # Technical Dashboard (Vanilla HTML + CSS + JS)
│   ├── index.html                    # Dashboard shell
│   ├── css/                          # Glassmorphic stylesheets
│   ├── js/                           # JavaScript modules (15+ modules)
│   └── assets/                       # Favicon, images
│
├── .github/workflows/deploy.yml     # GitHub Actions CI/CD
├── index.html                        # Vite SPA entry point
├── vite.config.ts                    # Vite config (base path + code splitting)
├── tsconfig.json                     # TypeScript config (strict mode)
├── eslint.config.js                  # ESLint config
├── tailwind.config.ts                # Tailwind config
└── package.json                      # Dependencies (v5.1.0)
```

---

## 3. Technology Stack

### 3.1 Frontend — Corporate Website

| Layer | Technology | Version | Description |
|-------|-----------|---------|-------------|
| Framework | React | 18.3+ | UI library |
| Language | TypeScript | 5.5+ | Strict mode enabled |
| Build Tool | Vite | 5.4+ | Fast HMR & build with code splitting |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS |
| UI Library | Shadcn/UI | latest | Accessible components |
| Charts | Recharts | 2.12+ | Data visualization |
| Routing | React Router | 6.x | Client-side routing with lazy loading |
| Server State | TanStack Query | 5.x | Async state management |
| Forms | React Hook Form + Zod | latest | Form handling + validation |
| Icons | Lucide React | latest | Icon library |

### 3.2 Frontend — Technical Dashboard

| Layer | Technology | Description |
|-------|-----------|-------------|
| Framework | Vanilla JavaScript | Zero dependencies, no build step |
| Styling | Custom CSS | Glassmorphic frosted glass design |
| Backend | Puter.js | KV Store, FS, Auth, AI |
| AI | Puter AI | Chat, OCR, Smart Parse |

### 3.3 Cloud Backend — Puter.js

| Service | Function | Description |
|---------|----------|-------------|
| **Puter KV Store** | Database | Key-value store with structured prefixes (`ywm:{module}:{entity}:{id}`) |
| **Puter FS** | Cloud Storage | Documents, photos, attachments, exports |
| **Puter Auth** | Authentication | User login, session management |
| **Puter AI** | AI Services | Chat (GPT-4o-mini, Claude 3.5, Gemini, DeepSeek), OCR, Smart Parse |

### 3.4 Deployment

| Service | Purpose | Cost |
|---------|---------|------|
| **GitHub Pages** | Static site hosting | Free |
| **GitHub Actions** | CI/CD pipeline | Free |
| **Puter.js** | Backend services | Free (user-pays for AI) |

---

## 4. Data Architecture — Puter KV Store

Data stored using structured key patterns:

```
Key Pattern: ywm:{module}:{entity}:{id}

Examples:
ywm_spare_{id}          → Spare part data (JSON)
ywm_team_{id}           → Team activity data (JSON)
ywm_maint_{id}          → Maintenance work order data (JSON)
ywm_prod_{id}           → Production record data (JSON)
ywm_safety_{id}         → Safety incident data (JSON)
ywm_finance_{id}        → Finance transaction data (JSON)
ywm_hr_{id}             → Employee data (JSON)
ywm_doc_{id}            → Document metadata (JSON)
ywm_notif_{id}          → Notification data (JSON)
ywm_chat_{id}           → Chat history (JSON)
ywm_config_{key}        → App configuration (JSON)
```

---

## 5. AI Agent Architecture

The AI Agent system provides:

- **10 Actions**: check_stock, check_overdue_wo, check_production_anomaly, generate_report, create_wo, update_wo, add_spare_part, create_po, log_team_activity, run_workflow
- **4 Autonomous Workflows**: Low Stock Auto Order, Overdue WO Escalation, Production Anomaly Alert, Daily Checkup
- **Proactive Monitoring**: Background checks every 5 minutes
- **Smart Parse**: Natural language → structured JSON data

---

## 6. Security Architecture

| Layer | Implementation |
|-------|---------------|
| Network | HTTPS (GitHub Pages), CSP meta tags, X-Frame-Options, X-XSS-Protection |
| Authentication | Puter Auth (built-in), session management |
| Authorization | RBAC with 8 roles (superadmin → viewer) |
| Data | Sandboxed KV Store per app instance, input validation |
| Audit | Audit trail for all data mutations, AI agent action logging |
| Frontend | Error Boundary, TypeScript strict mode, ESLint, no PII in console |

---

## 7. Deployment Architecture

```
Developer Push → GitHub Actions → Lint + Build → Deploy to GitHub Pages

URL: https://mulkymalikuldhrs.github.io/yoga-wibawa-mandiri/

Pipeline:
1. npm ci
2. npm run lint
3. npm run build (Vite → dist/)
4. Deploy dist/ to GitHub Pages
```

---

## ⚠️ Disclaimer

For **Education Purpose** only. **Risiko apapun tidak kita tanggung.**

---

## 📬 Contact

**Mulky Malikul Dhaher** | mulkymalikuldhaher@email.com
