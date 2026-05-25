# 🏢 PT. Yoga Wibawa Mandiri — Digital Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)

---

## 🇬🇧 English

PT. Yoga Wibawa Mandiri is a trusted cement packaging company strategically located at Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh. This repository contains the complete digital platform including corporate website and comprehensive technical dashboard.

### Platform Components

| Component | Description | Status |
|-----------|-------------|--------|
| **Corporate Website** | Public-facing website (profile, services, gallery, contact) | ✅ Live |
| **Technical Dashboard** | Comprehensive operational management system | 🚧 In Development |
| **Shared UI Library** | Reusable components between website & dashboard | 🚧 In Development |

### Dashboard Modules (12 Pillars)

| # | Module | Description |
|---|--------|-------------|
| 1 | Inventaris Spare Part | Stock management, reorder alerts, part-mesin mapping |
| 2 | Kegiatan Tim | Team activity tracking, performance metrics |
| 3 | Auto Timestamp & Audit Trail | Server-side immutable timestamps, change logging |
| 4 | Produksi & Operasional | Production tracking, curah receiving, distribution |
| 5 | Maintenance Management | Work orders, preventive/corrective/predictive |
| 6 | Quality Control | Batch testing, SNI compliance, trend analysis |
| 7 | AI Customer Service | WhatsApp chatbot, auto-responses, escalation |
| 8 | Real-Time Dashboard | Live KPIs, machine status, GPS tracking |
| 9 | Predictive Analytics | Demand forecast, predictive maintenance |
| 10 | Digital Twin & IoT | Sensor monitoring, 3D visualization |
| 11 | ESG & Sustainability | Emission tracking, energy consumption, compliance |
| 12 | Smart Marketing & CRM | Customer pipeline, segmentation, market intelligence |

### Tech Stack

- **Frontend:** React 18.3 + TypeScript 5.5 + Vite 5.4 + Tailwind CSS 3.4 + Shadcn/UI
- **State:** Zustand + TanStack Query 5
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Charts:** Recharts + TanStack Table
- **Deployment:** Vercel + GitHub Actions
- **IoT:** MQTT (Mosquitto) — Future
- **AI:** Python + FastAPI — Future

### Quick Start

```bash
git clone https://github.com/mulkymalikuldhrs/yoga-wibawa-mandiri.git
cd yoga-wibawa-mandiri
pnpm install
cp .env.example .env.local
pnpm dev
```

### Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, monorepo structure, RBAC, security |
| [TODO.md](TODO.md) | Master task list with 83 tasks across 6 phases |
| [DATA_BLUEPRINT.md](docs/DATA_BLUEPRINT.md) | Database schema, 17 core tables, relationships |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | Supabase SDK patterns, Edge Functions, RLS |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Environment setup, Vercel, Supabase config |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## 🇮🇩 Bahasa Indonesia

PT. Yoga Wibawa Mandiri adalah perusahaan pengantongan Semen Padang terpercaya yang berlokasi strategis di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh. Repositori ini berisi platform digital lengkap termasuk website korporat dan dashboard teknis komprehensif.

### Komponen Platform

| Komponen | Deskripsi | Status |
|----------|-----------|--------|
| **Website Korporat** | Website publik (profil, layanan, galeri, kontak) | ✅ Aktif |
| **Dashboard Teknis** | Sistem manajemen operasional komprehensif | 🚧 Dalam Pengembangan |
| **Shared UI Library** | Komponen yang digunakan bersama | 🚧 Dalam Pengembangan |

---

## ⚠️ Disclaimer

**For Education Purpose Only.** All content, code, and documentation provided in this repository are intended solely for educational and research purposes. The authors and contributors assume no responsibility or liability for any losses, damages, or consequences arising from the use of this software or information provided herein.

**Hanya untuk Tujuan Pendidikan.** Semua konten, kode, dan dokumentasi dalam repositori ini hanya ditujukan untuk tujuan pendidikan dan penelitian. Penulis dan kontributor tidak bertanggung jawab atas risiko atau kerugian apa pun yang timbul dari penggunaan perangkat lunak atau informasi yang disediakan.

**Risiko apapun tidak kita tanggung.**

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📬 Contact

**Mulky Malikul Dhaher** — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)

GitHub: [https://github.com/mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright © 2026 Mulky Malikul Dhaher. All rights reserved.
