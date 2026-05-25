# 🏢 PT. Yoga Wibawa Mandiri — Digital Platform & AI Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Puter.js](https://img.shields.io/badge/Powered%20by-Puter.js-00d4ff)](https://puter.com/)
[![Zero Server](https://img.shields.io/badge/Architecture-Zero%20Server-green)](https://puter.com/)
[![AI Powered](https://img.shields.io/badge/AI-GPT--4o%20%7C%20Claude%20%7C%20Gemini-blue)](https://puter.com/)

---

## 🇬🇧 English

PT. Yoga Wibawa Mandiri is a trusted cement packaging company strategically located at Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh. This repository contains the complete digital platform including corporate website and a **comprehensive AI-powered technical dashboard** built on **Puter.js** (zero server, zero backend, zero API keys).

### Platform Components

| Component | Description | Status |
|-----------|-------------|--------|
| **Corporate Website** | Public-facing website (profile, services, gallery, contact) | ✅ Live |
| **AI Dashboard** | 15-module operational dashboard with Puter.js | ✅ Built |
| **Glassmorphic UI** | Frosted glass design system | ✅ Complete |

### Dashboard — 15 Modules

| # | Module | Description | KV Prefix |
|---|--------|-------------|----------|
| 1 | Beranda | KPI overview, quick actions, alerts | — |
| 2 | Spare Parts | Stock management, reorder alerts, part-mesin mapping | `ywm:sparepart:` |
| 3 | Produksi | Daily production, curah receiving, OEE | `ywm:production:` |
| 4 | Maintenance | Work orders, preventive/corrective/predictive | `ywm:maintenance:` |
| 5 | Tim & Aktivitas | Activity tracking, check-in/out, performance | `ywm:team:` |
| 6 | Quality Control | Batch testing, SNI compliance, trend analysis | `ywm:qc:` |
| 7 | Safety / HSE | Incident reporting, safety inspection, K3 | `ywm:hse:` |
| 8 | Keuangan | Transaction tracking, budget, cost per zak | `ywm:finance:` |
| 9 | HR & Payroll | Employee management, attendance, payroll | `ywm:hr:` |
| 10 | Purchasing | Purchase orders, supplier directory | `ywm:purchasing:` |
| 11 | Dokumen & OCR | Upload, OCR scanning, AI extraction | `ywm:doc:` |
| 12 | Laporan | Auto-generated reports, AI summaries | `ywm:report:` |
| 13 | Notifikasi | Alert system, voice notifications | `ywm:notification:` |
| 14 | Analytics | KPI trends, AI forecasting, charts | `ywm:analytics:` |
| 15 | Pengaturan | App config, user roles, data management | `ywm:settings:` |

### Tech Stack

- **Dashboard:** Vanilla HTML + CSS + JS + Puter.js (zero dependencies)
- **Website:** React 18.3 + TypeScript 5.5 + Vite 5.4 + Tailwind CSS + Shadcn/UI
- **Backend:** Puter.js Cloud OS (KV Store + FS + Auth + AI)
- **AI:** Puter AI (GPT-4o-mini, Claude 3.5, Gemini, DeepSeek, 500+ models)
- **Data:** Puter KV Store (key-value with structured prefixes) + Puter FS (cloud storage)
- **Design:** Glassmorphic Frosted UI (backdrop-filter blur, rgba backgrounds, glow accents)
- **Deployment:** Puter Hosting / GitHub Pages / Vercel (free, zero config)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/mulkymalikuldhrs/yoga-wibawa-mandiri.git
cd yoga-wibawa-mandiri

# Open dashboard directly in browser (no build needed!)
open dashboard/index.html

# Or serve locally
npx serve .
```

> **No npm install needed for the dashboard!** Just open `dashboard/index.html` in a browser. Puter.js loads from CDN.

### Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Puter.js architecture, data flow, security model |
| [TODO.md](TODO.md) | Master task list across 6 phases |
| [ROADMAP.md](ROADMAP.md) | Development roadmap per phase |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributing guidelines |

---

## 🇮🇩 Bahasa Indonesia

PT. Yoga Wibawa Mandiri adalah perusahaan pengantongan Semen Padang terpercaya yang berlokasi strategis di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh. Repositori ini berisi platform digital lengkap termasuk website korporat dan **dashboard teknis AI komprehensif** berbasis **Puter.js** (zero server, zero backend, zero API key).

### Komponen Platform

| Komponen | Deskripsi | Status |
|----------|-----------|--------|
| **Website Korporat** | Website publik (profil, layanan, galeri, kontak) | ✅ Aktif |
| **AI Dashboard** | Dashboard operasional 15 modul dengan Puter.js | ✅ Dibangun |
| **Glassmorphic UI** | Sistem desain frosted glass | ✅ Selesai |

---

## ⚠️ Disclaimer

**For Education Purpose Only.** All content, code, and documentation provided in this repository are intended solely for educational and research purposes. The authors and contributors assume no responsibility or liability for any losses, damages, or consequences arising from the use of this software or information provided herein.

**Hanya untuk Tujuan Pendidikan.** Semua konten, kode, dan dokumentasi dalam repositori ini hanya ditujukan untuk tujuan pendidikan dan penelitian. Penulis dan kontributor tidak bertanggung jawab atas risiko atau kerugian apa pun yang timbul dari penggunaan perangkat lunak atau informasi yang disediakan.

**仅用于教育目的。** 本仓库中的所有内容、代码和文档仅用于教育和研究目的。作者和贡献者对因使用本软件或提供的信息而造成的任何损失、损害或后果不承担任何责任。

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
