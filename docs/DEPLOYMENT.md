# 🚀 DEPLOYMENT — PT Yoga Wibawa Mandiri Digital Platform

> **Deployment Guide & Environment Configuration**
> **Version:** 2.0.0 | **Last Updated:** 2026-05-25

---

## 1. Environment Setup

### 1.1 Prerequisites

- Node.js 20+
- pnpm 9+
- Git
- Supabase CLI
- Vercel CLI (optional)

### 1.2 Local Development

```bash
# Clone repo
git clone https://github.com/mulkymalikuldhrs/yoga-wibawa-mandiri.git
cd yoga-wibawa-mandiri

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start local Supabase (for dashboard development)
pnpm supabase:start

# Run development servers
pnpm dev          # Both website + dashboard
pnpm dev:web      # Website only
pnpm dev:dash     # Dashboard only
```

### 1.3 Environment Variables

```env
# .env.example

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URLs
VITE_WEBSITE_URL=http://localhost:5173
VITE_DASHBOARD_URL=http://localhost:5174
VITE_API_URL=http://localhost:54321

# External APIs (future)
VITE_WA_API_KEY=your-whatsapp-api-key
VITE_MAPS_API_KEY=your-maps-api-key

# Monitoring (production)
VITE_SENTRY_DSN=your-sentry-dsn
```

---

## 2. Build & Deploy

### 2.1 Production Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:web
pnpm build:dashboard
```

### 2.2 Vercel Deployment

#### Website
- **Framework Preset:** Vite
- **Root Directory:** `apps/website`
- **Build Command:** `pnpm build`
- **Output Directory:** `apps/website/dist`

#### Dashboard
- **Framework Preset:** Vite
- **Root Directory:** `apps/dashboard`
- **Build Command:** `pnpm build`
- **Output Directory:** `apps/dashboard/dist`

### 2.3 Domain Configuration

| App | Domain | Type |
|-----|--------|------|
| Website | ywm.co.id | Public |
| Dashboard | dashboard.ywm.co.id | Authenticated |
| Staging | staging.ywm.co.id | Internal |

---

## 3. Supabase Configuration

### 3.1 Production Setup

1. Create Supabase project at supabase.com
2. Run migrations: `pnpm supabase:db:push`
3. Seed initial data: `pnpm supabase:db:seed`
4. Configure Auth providers (Email, Google)
5. Setup Storage buckets (documents, photos)
6. Enable Realtime for required tables
7. Configure RLS policies

### 3.2 Backup Strategy

- Daily automated backups via Supabase
- Point-in-time recovery enabled
- Manual backup before major migrations

---

## 4. Monitoring

- **Vercel Analytics** — Web vitals (FCP, LCP, CLS)
- **Sentry** — Error tracking & performance
- **Supabase Logs** — Database & Auth logs
- **Uptime Robot** — Availability monitoring

---

## ⚠️ Disclaimer

For **Education Purpose** only. **Risiko apapun tidak kita tanggung.**

## 📬 Contact

**Mulky Malikul Dhaher** | mulkymalikuldhaher@email.com
