# 🏗️ ARCHITECTURE — PT Yoga Wibawa Mandiri Digital Platform

> **System Architecture Document** — Comprehensive technical architecture for website + dashboard
> **Version:** 2.0.0 | **Last Updated:** 2026-05-25
> **Architect:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

---

## 1. System Overview

PT YWM Digital Platform terdiri dari 2 aplikasi utama dalam satu monorepo:

1. **Corporate Website** — Website publik untuk profil perusahaan, layanan, galeri, dan kontak
2. **Technical Dashboard** — Sistem operasional komprehensif untuk manajemen produksi, inventaris, tim, maintenance, dll.

Kedua aplikasi berbagi UI components, authentication, dan backend (Supabase).

```
┌─────────────────────────────────────────────────────────┐
│                    PT YWM Digital Platform               │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────────────┐   │
│  │  Corporate        │    │  Technical Dashboard      │   │
│  │  Website          │    │  (Role-Based Access)      │   │
│  │                   │    │                            │   │
│  │  / (Home)         │    │  /dashboard (Overview)     │   │
│  │  /tentang         │    │  /dashboard/produksi       │   │
│  │  /layanan         │    │  /dashboard/inventaris     │   │
│  │  /galeri          │    │  /dashboard/maintenance    │   │
│  │  /lokasi          │    │  /dashboard/kegiatan-tim   │   │
│  │  /kontak          │    │  /dashboard/qc             │   │
│  │  /dashboard-publik│    │  /dashboard/distribusi     │   │
│  │                   │    │  /dashboard/hse            │   │
│  └────────┬──────────┘    │  /dashboard/hr             │   │
│           │               │  /dashboard/keuangan        │   │
│           │               │  /dashboard/ai-chatbot      │   │
│           │               │  /dashboard/iot             │   │
│           │               │  /dashboard/esg             │   │
│           │               │  /dashboard/dokumen         │   │
│           │               │  /dashboard/purchasing      │   │
│           │               └──────────┬─────────────────┘   │
│           │                          │                      │
│           └──────────┬───────────────┘                      │
│                      │                                      │
│              ┌───────▼───────┐                              │
│              │  Shared Layer │                              │
│              │  - UI Components (Shadcn/UI)                │
│              │  - Auth Context                              │
│              │  - API Client (Supabase)                    │
│              │  - Types & Schemas                          │
│              │  - Utils & Hooks                            │
│              └───────┬───────┘                              │
│                      │                                      │
└──────────────────────┼──────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   Supabase      │
              │   Backend       │
              │                 │
              │  - PostgreSQL   │
              │  - Auth         │
              │  - Realtime     │
              │  - Storage      │
              │  - Edge Functions│
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
   ┌──────▼──────┐ ┌──▼───────┐ ┌──▼───────┐
   │  MQTT/IoT   │ │  AI/ML   │ │ External  │
   │  Broker     │ │  Service │ │ APIs      │
   │  (Sensors)  │ │ (Python) │ │ (SP, etc) │
   └─────────────┘ └──────────┘ └───────────┘
```

---

## 2. Monorepo Structure

```
yoga-wibawa-mandiri/
├── apps/
│   ├── website/                    # Corporate Website (Vite + React)
│   │   ├── src/
│   │   │   ├── pages/             # Halaman publik
│   │   │   ├── components/        # Komponen website
│   │   │   └── ...
│   │   ├── public/
│   │   └── package.json
│   │
│   └── dashboard/                  # Technical Dashboard (Vite + React)
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Overview.tsx          # Dashboard homepage
│       │   │   ├── Produksi.tsx          # Produksi & operasional
│       │   │   ├── InventarisSparePart.tsx
│       │   │   ├── KegiatanTim.tsx
│       │   │   ├── Maintenance.tsx
│       │   │   ├── QualityControl.tsx
│       │   │   ├── Distribusi.tsx
│       │   │   ├── SafetyHSE.tsx
│       │   │   ├── HRPayroll.tsx
│       │   │   ├── Keuangan.tsx
│       │   │   ├── AIChatbot.tsx
│       │   │   ├── IoTMonitoring.tsx
│       │   │   ├── ESGDashboard.tsx
│       │   │   ├── DocumentManagement.tsx
│       │   │   ├── Purchasing.tsx
│       │   │   └── Settings.tsx
│       │   ├── components/
│       │   │   ├── layout/        # DashboardLayout, Sidebar, Header
│       │   │   ├── widgets/       # KPI cards, charts, tables
│       │   │   ├── forms/         # Input forms per module
│       │   │   └── shared/        # Reusable dashboard components
│       │   ├── hooks/             # Custom hooks (useAutoTimestamp, useRealtime, dll.)
│       │   ├── services/          # API services per module
│       │   ├── stores/            # State management (Zustand)
│       │   ├── types/             # TypeScript type definitions
│       │   └── utils/             # Utility functions
│       ├── public/
│       └── package.json
│
├── packages/
│   ├── shared/                     # Shared code between apps
│   │   ├── src/
│   │   │   ├── components/        # Shared Shadcn/UI components
│   │   │   ├── types/             # Shared TypeScript types
│   │   │   ├── utils/             # Shared utilities
│   │   │   ├── hooks/             # Shared React hooks
│   │   │   ├── api/               # Supabase client & API functions
│   │   │   └── constants/         # Shared constants
│   │   └── package.json
│   │
│   └── supabase/                   # Supabase configuration
│       ├── migrations/             # Database migration files
│       ├── seed.sql                # Seed data
│       ├── functions/              # Edge Functions
│       └── config.toml             # Supabase CLI config
│
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md
│   ├── TODO.md
│   ├── DATA_BLUEPRINT.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
│
├── .github/                        # GitHub templates & CI/CD
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-website.yml
│   │   └── deploy-dashboard.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── turbo.json                      # Turborepo config
├── pnpm-workspace.yaml             # pnpm workspace config
├── package.json                    # Root package.json
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
└── .env.example
```

---

## 3. Technology Stack

### 3.1 Frontend

| Layer | Technology | Versi | Keterangan |
|-------|-----------|-------|------------|
| Framework | React | 18.3+ | UI library |
| Language | TypeScript | 5.5+ | Type safety |
| Build Tool | Vite | 5.4+ | Fast HMR & build |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS |
| UI Library | Shadcn/UI | latest | Accessible components |
| Charts | Recharts | 2.12+ | Data visualization |
| Routing | React Router | 6.x | Client-side routing |
| State | Zustand | 4.x | Lightweight state management |
| Forms | React Hook Form + Zod | latest | Form handling + validation |
| Date | date-fns | 3.x | Date manipulation |
| Icons | Lucide React | latest | Icon library |
| Animation | Framer Motion | 11.x | Page transitions & micro-animations |
| Tables | TanStack Table | 8.x | Headless data tables |
| Export | xlsx + jspdf | latest | CSV/Excel/PDF export |

### 3.2 Backend (Supabase)

| Layer | Technology | Keterangan |
|-------|-----------|------------|
| Database | PostgreSQL 15 | Relational + JSONB |
| Auth | Supabase Auth | Email + OAuth + RBAC |
| Realtime | Supabase Realtime | WebSocket subscriptions |
| Storage | Supabase Storage | Dokumen, foto, lampiran |
| Functions | Supabase Edge Functions | Deno-based serverless |
| CDN | Supabase CDN | Static assets |

### 3.3 Infrastructure

| Layer | Technology | Keterangan |
|-------|-----------|------------|
| Hosting | Vercel | Both website & dashboard |
| CI/CD | GitHub Actions | Auto deploy on push |
| Monitoring | Sentry | Error tracking |
| Analytics | Vercel Analytics | Web vitals |
| IoT | MQTT (Mosquitto) | Sensor data ingestion |
| AI Service | Python + FastAPI | Predictive models |
| Cache | Redis (Upstash) | API response caching |

---

## 4. Database Schema Overview

### 4.1 Core Tables

```
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  mesin       │    │  spare_parts │    │  transaksi_   │  │
│  │  - mesin_id  │◄──►│  - part_id   │◄──►│  spare_part   │  │
│  │  - kode      │    │  - kode      │    │  - trx_id     │  │
│  │  - nama      │    │  - nama      │    │  - tipe       │  │
│  │  - status    │    │  - stok      │    │  - jumlah     │  │
│  └──────┬───────┘    └──────────────┘    └───────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  work_orders│    │  produksi    │    │  distribusi   │  │
│  │  - wo_id    │    │  - produksi_ │    │  - dist_id    │  │
│  │  - tipe     │    │    id        │    │  - no_do      │  │
│  │  - prioritas│    │  - tanggal   │    │  - no_kendaraan│ │
│  │  - status   │    │  - zak/ton   │    │  - status     │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  karyawan   │    │  kegiatan_   │    │  tim          │  │
│  │  - kar_id   │◄──►│  harian      │    │  - tim_id     │  │
│  │  - nama     │    │  - keg_id    │◄──►│  - nama       │  │
│  │  - jabatan  │    │  - pic_id    │    │  - divisi     │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  qc_records │    │  insiden_hse │    │  pelanggan    │  │
│  │  - qc_id    │    │  - insiden_id│    │  - pel_id     │  │
│  │  - batch    │    │  - tipe      │    │  - nama       │  │
│  │  - status   │    │  - severity  │    │  - segmentasi │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  audit_trail│    │  dokumen     │    │  purchase_    │  │
│  │  - audit_id │    │  - doc_id    │    │  orders       │  │
│  │  - aksi     │    │  - judul     │    │  - po_id      │  │
│  │  - perubahan│    │  - versi     │    │  - supplier   │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐                        │
│  │  sensors    │    │  env_records │                        │
│  │  - sensor_id│    │  - env_id    │                        │
│  │  - tipe     │    │  - debu      │                        │
│  │  - value    │    │  - energi    │                        │
│  └─────────────┘    └──────────────┘                        │
│                                                             │
│  *** Semua tabel memiliki: ***                              │
│  - created_at (auto timestamp, immutable)                   │
│  - updated_at (auto timestamp, auto-update)                 │
│  - created_by (UUID user)                                   │
│  - updated_by (UUID user)                                   │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Entity Relationships

```
mesin ◄──M:N──► spare_parts        (via mesin_spare_part_mapping)
mesin ◄──1:N──► work_orders        (satu mesin punya banyak WO)
mesin ◄──1:N──► sensors            (banyak sensor per mesin)
work_orders ◄──1:N──► transaksi_spare_part
tim ◄──1:N──► karyawan
karyawan ◄──1:N──► kegiatan_harian
produksi ◄──1:N──► distribusi
pelanggan ◄──1:N──► distribusi
supplier ◄──1:N──► purchase_orders
```

---

## 5. Authentication & Authorization

### 5.1 Role-Based Access Control (RBAC)

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
│       ├── driver ───────► Delivery tracking, POD  │
│       │                                          │
│       └── viewer ───────► Read-only dashboard     │
│                                                   │
│  [Website Publik] ──► No auth required            │
└───────────────────────────────────────────────────┘
```

### 5.2 Auth Flow

```
1. User visits /dashboard → AuthGuard checks session
2. No session → Redirect to /login
3. User logs in (email/password or OAuth)
4. Supabase Auth validates → Returns JWT
5. JWT stored in httpOnly cookie
6. App loads user profile + role from profiles table
7. Role determines visible navigation & permitted actions
8. Every API request includes JWT → RLS enforces data access
```

---

## 6. Auto Timestamp Architecture

### 6.1 Implementation Strategy

```
┌────────────────────────────────────────────────────┐
│              Auto Timestamp Flow                    │
│                                                    │
│  Client Action (create/update/delete)              │
│       │                                            │
│       ▼                                            │
│  React Hook (useAutoTimestamp)                     │
│       │                                            │
│       ▼                                            │
│  Supabase Client SDK                               │
│       │  (sends JWT, NOT timestamp)                │
│       ▼                                            │
│  Supabase PostgreSQL                               │
│       │                                            │
│       ├── DEFAULT NOW() for created_at             │
│       ├── TRIGGER for updated_at                   │
│       ├── TRIGGER for audit_trail INSERT           │
│       └── RLS checks created_by = auth.uid()       │
│                                                    │
│  Result:                                           │
│  - Timestamps are server-generated, immutable      │
│  - Audit trail captured automatically              │
│  - No client-side timestamp manipulation possible  │
└────────────────────────────────────────────────────┘
```

### 6.2 PostgreSQL Trigger for updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON {table_name}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 6.3 Audit Trail Trigger

```sql
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_trail (tabel, record_id, aksi, nilai_baru, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_trail (tabel, record_id, aksi, nilai_lama, nilai_baru, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_trail (tabel, record_id, aksi, nilai_lama, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 7. Real-Time Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Real-Time Architecture                      │
│                                                              │
│  Data Sources:                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ IoT      │  │ Operator │  │ Sensor   │  │ External │    │
│  │ Sensors  │  │ Input    │  │ Monitor  │  │ API      │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │              │              │              │          │
│       ▼              ▼              ▼              ▼          │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Supabase Realtime (WebSocket)            │    │
│  │                                                      │    │
│  │  Channels:                                           │    │
│  │  - production:realtime  (produksi updates)           │    │
│  │  - sensors:realtime     (IoT sensor readings)        │    │
│  │  - distribution:realtime (delivery tracking)         │    │
│  │  - inventory:realtime   (stock changes)              │    │
│  │  - alerts:realtime      (threshold alerts)           │    │
│  └─────────────────────┬────────────────────────────────┘    │
│                        │                                     │
│           ┌────────────┼────────────┐                        │
│           ▼            ▼            ▼                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │ Dashboard  │ │ Website    │ │ Mobile App │               │
│  │ Widgets    │ │ Public KPI │ │ (Future)   │               │
│  └────────────┘ └────────────┘ └────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Security Architecture

### 8.1 Security Layers

```
Layer 1: Network
├── HTTPS only (TLS 1.3)
├── CORS whitelist
├── Rate limiting
└── DDoS protection (Vercel)

Layer 2: Authentication
├── Supabase Auth (JWT)
├── httpOnly cookies
├── Session management
├── MFA (optional)
└── OAuth providers

Layer 3: Authorization
├── Row Level Security (RLS)
├── Role-Based Access Control (RBAC)
├── API route guards
└── Component-level visibility

Layer 4: Data
├── Input validation (Zod schemas)
├── SQL injection prevention (parameterized)
├── XSS prevention (CSP headers)
├── CSRF tokens
└── Data encryption at rest (Supabase)

Layer 5: Audit
├── Auto timestamp (immutable)
├── Audit trail (all changes logged)
├── Login history
└── Anomaly detection
```

---

## 9. API Design

### 9.1 Supabase Direct Access

Dashboard menggunakan Supabase Client SDK secara langsung untuk:
- **Queries** — `supabase.from('table').select()`
- **Mutations** — `supabase.from('table').insert/update/delete()`
- **Realtime** — `supabase.channel().on()`
- **Auth** — `supabase.auth.signIn/signUp`
- **Storage** — `supabase.storage.from().upload/download()`

### 9.2 Edge Functions (Custom APIs)

| Function | Purpose |
|----------|---------|
| `generate-wo-number` | Auto-generate nomor WO |
| `generate-po-number` | Auto-generate nomor PO |
| `check-reorder-point` | Cek & alert spare part di bawah minimum |
| `calculate-oee` | Hitung OEE per mesin/shift |
| `predict-demand` | AI demand forecasting |
| `predict-maintenance` | AI predictive maintenance |
| `send-notification` | Push notification (WhatsApp/Email) |
| `export-report` | Generate PDF/Excel report |
| `sync-spidata` | Sinkronisasi data dengan Semen Padang |

---

## 10. Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Deployment Flow                         │
│                                                          │
│  Developer Push                                          │
│       │                                                  │
│       ▼                                                  │
│  GitHub Actions                                          │
│       │                                                  │
│       ├── Lint + Type Check + Test                       │
│       │                                                  │
│       ├── Build Website (apps/website)                   │
│       │       └── Deploy to Vercel (ywm-website)         │
│       │                                                  │
│       └── Build Dashboard (apps/dashboard)               │
│               └── Deploy to Vercel (ywm-dashboard)       │
│                                                          │
│  Environment:                                            │
│  - Preview: branch deploy (PR preview)                   │
│  - Staging: staging.ywm.co.id                           │
│  - Production: ywm.co.id + dashboard.ywm.co.id          │
│                                                          │
│  Supabase:                                               │
│  - Dev: Local Supabase (Docker)                         │
│  - Staging: Supabase staging project                    │
│  - Production: Supabase production project              │
└──────────────────────────────────────────────────────────┘
```

---

## 11. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.0s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| API Response Time (p95) | < 500ms | Supabase logs |
| Realtime Latency | < 1s | WebSocket ping |
| Dashboard Widget Load | < 2s | Custom metric |

---

## ⚠️ Disclaimer

For **Education Purpose** only. **Risiko apapun tidak kita tanggung.**

---

## 📬 Contact

**Mulky Malikul Dhaher** | mulkymalikuldhaher@email.com
