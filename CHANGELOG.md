# Changelog — yoga-wibawa-mandiri

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-05-25 — Digital Transformation Phase

### Added
- **Architecture Document** — Full system architecture with monorepo structure, RBAC, auto timestamp, realtime, security layers
- **Data Blueprint** — 17 core tables with complete field definitions, types, constraints, and relationships
- **TODO Master Task List** — 83 tasks across 6 phases with timeline (May-December 2026)
- **Deployment Guide** — Environment setup, Vercel deployment, Supabase configuration
- **API Reference** — Supabase SDK patterns, Edge Functions, RLS policies
- **Monorepo Plan** — Turborepo + pnpm workspace with apps/website + apps/dashboard + packages/shared
- **12 Dashboard Pilar Definitions:**
  - Inventaris Spare Part Management
  - Kegiatan Tim & Performance Tracking
  - Auto Timestamp & Audit Trail (universal)
  - Produksi & Operasional
  - Maintenance Management
  - Quality Control & Compliance
  - Smart AI Customer Service
  - Real-Time Operations Dashboard
  - Predictive Analytics & AI Forecasting
  - Digital Twin & IoT Integration
  - ESG & Sustainability Dashboard
  - Smart Marketing & CRM
  - Document Management & Compliance
  - HR & Payroll Management
  - Safety & HSE Management
  - Purchasing & Procurement
  - Financial & Accounting
- **RBAC System** — 9 roles (superadmin → viewer) with permission matrix
- **Auto Timestamp Architecture** — Server-side immutable timestamps + audit trail triggers
- **Real-Time Data Flow** — Supabase Realtime channels for production, sensors, distribution, inventory, alerts
- **Security Architecture** — 5-layer security (Network → Auth → Authorization → Data → Audit)
- **Performance Targets** — Lighthouse score targets, API response time, realtime latency

### Changed
- **Project scope** expanded from corporate website only → website + comprehensive technical dashboard
- **Architecture** migrated from single Vite app → monorepo (website + dashboard + shared)
- **State management** plan migrated from React Query only → Zustand + React Query
- **Routing** plan expanded with /dashboard/* routes and auth guards

---

## [1.1.0] - 2026-03-04

### Added
- Trilingual README (EN/ID/CN) with disclaimer
- CONTRIBUTING.md with trilingual content and disclaimer
- CODE_OF_CONDUCT.md with disclaimer
- SECURITY.md with disclaimer
- MIT License (2026)
- GitHub issue templates (bug report, feature request, question)
- Pull request template with disclaimer
- FUNDING.yml
- Deleted stale branch: mentat-5/comprehensive-update

---

## [1.0.0] - Initial Release

### Added
- Full-stack CMS with React 18 and TypeScript
- Supabase backend integration
- Responsive design with Tailwind CSS
- Shadcn/UI component library
- Interactive maps and gallery
- Contact management system

---

## ⚠️ Disclaimer

For **Education Purpose** only. **Risiko apapun tidak kita tanggung.**

## 📬 Contact

**Mulky Malikul Dhaher** | mulkymalikuldhaher@email.com
