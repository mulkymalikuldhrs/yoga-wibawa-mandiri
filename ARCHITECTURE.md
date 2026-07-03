# 🏗️ ARSITEKTUR SISTEM — YWM Dashboard
_Last updated: 2026-05-29_
_Developer: ⚡ Tim Teknik | Mulky Malikul Dhaher ⚡_

---

## 1. Ringkasan Sistem

YWM Dashboard adalah platform operasional komprehensif untuk PT. Yoga Wibawa Mandiri yang dibangun dengan React + TypeScript + Vite. Sistem menggunakan arsitektur **Supabase-first + localStorage fallback** dengan AI terintegrasi melalui z-ai-web-dev-sdk.

### Prinsip Desain

| Prinsip | Penjelasan |
|---------|-----------|
| **Offline-First** | Semua fitur berfungsi tanpa koneksi internet (localStorage fallback) |
| **AI-Integrated** | Asisten AI yang bisa baca data dashboard dan input data |
| **Supabase-First** | Data disimpan di Supabase jika tersedia, fallback ke localStorage |
| **PWA-Ready** | Installable, offline support, push notification infrastructure |
| **Glassmorphic UI** | Desain frosted glass yang modern dan elegan |

---

## 2. Arsitektur High-Level

```
┌─────────────────────────────────────────────────────────────────────┐
│                    YWM Dashboard Platform                            │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Frontend (React 18 + TypeScript)           │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐│  │
│  │  │  Dashboard   │  │  AI          │  │  Notification        ││  │
│  │  │  Modules     │  │  Assistant   │  │  System              ││  │
│  │  │  (14 modul)  │  │  (z-ai SDK)  │  │  (Popup + Center)   ││  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘│  │
│  │         │                  │                      │           │  │
│  │  ┌──────┴──────────────────┴──────────────────────┴──────────┐│  │
│  │  │              Data Layer (Supabase + localStorage)        ││  │
│  │  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  ││  │
│  │  │  │ Supabase     │  │ localStorage  │  │ Dashboard    │  ││  │
│  │  │  │ (PostgreSQL) │  │ (Fallback)    │  │ Storage      │  ││  │
│  │  │  └──────────────┘  └───────────────┘  └──────────────┘  ││  │
│  │  └──────────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Vite Dev Server / Vercel Serverless              │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐│  │
│  │  │ /api/chat   │  │ /api/chat/   │  │ /api/health          ││  │
│  │  │ (POST)      │  │ stream (SSE) │  │ (GET)                ││  │
│  │  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘│  │
│  │         │                │                       │           │  │
│  │  ┌──────┴────────────────┴───────────────────────┴──────────┐│  │
│  │  │              z-ai-web-dev-sdk (AI Backend)               ││  │
│  │  └──────────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              PWA Layer                                        │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐│  │
│  │  │ Service     │  │ Manifest     │  │ Push Notification    ││  │
│  │  │ Worker v2   │  │ (PWA Config) │  │ Infrastructure       ││  │
│  │  └─────────────┘  └──────────────┘  └──────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Hierarchy

```
App.tsx
├── ErrorBoundary
├── QueryClientProvider
├── TooltipProvider
├── BrowserRouter
│   ├── / → Index.tsx (Website)
│   ├── /tentang → About.tsx
│   ├── /layanan → Services.tsx
│   ├── /galeri → Gallery.tsx
│   ├── /lokasi → Location.tsx
│   ├── /kontak → Contact.tsx
│   │   └── ChatBot.tsx (Public AI Chatbot)
│   ├── /dashboard → Dashboard.tsx
│   │   └── DashboardLayout.tsx
│   │       ├── NotificationProvider (Context)
│   │       ├── DashboardSidebar.tsx
│   │       ├── MobileNav.tsx
│   │       ├── AiAssistantPanel.tsx
│   │       ├── FloatingChatBot.tsx
│   │       ├── InstallPWAButton.tsx
│   │       ├── NotificationPopup.tsx
│   │       ├── NotificationCenter.tsx
│   │       └── Active Module Component:
│   │           ├── OverviewModule.tsx
│   │           ├── SparePartsModule.tsx
│   │           ├── TeamActivityModule.tsx
│   │           ├── MaintenanceModule.tsx
│   │           ├── PispotModule.tsx
│   │           ├── ProductionModule.tsx
│   │           ├── SiloCalculationModule.tsx
│   │           ├── SiloOpnameModule.tsx
│   │           ├── SafetyModule.tsx
│   │           ├── FinanceModule.tsx
│   │           ├── HrModule.tsx
│   │           ├── DocumentsModule.tsx
│   │           ├── AnalyticsModule.tsx
│   │           └── NotificationsModule.tsx
│   └── * → NotFound.tsx
```

---

## 4. Data Flow

### 4.1 Chat AI dengan Dashboard Context

```
User Input (Text/Voice)
    │
    ▼
FloatingChatBot / AiAssistantPanel
    │
    ├── buildDashboardContext() → Read all localStorage data
    │   ├── spare parts (stok, minimum)
    │   ├── pispot (status, kondisi)
    │   ├── production (target, aktual)
    │   ├── maintenance (status, prioritas)
    │   ├── safety (severity, status)
    │   ├── finance (pemasukan, pengeluaran)
    │   ├── team (kehadiran, absensi)
    │   └── hr (karyawan aktif)
    │
    ├── Create system message with dashboard context
    │
    ▼
chatWithAiStream([contextMessage, ...chatMessages])
    │
    ├── Try SSE streaming: POST /api/chat/stream
    │   ├── If SSE works → Parse data chunks → Update UI
    │   └── If SSE fails → Fallback to non-streaming
    │
    ├── Fallback: POST /api/chat
    │   └── Simulate streaming by word chunks
    │
    ▼
Response Processing
    ├── Render in chat UI (streaming)
    ├── Check for ACTION:INPUT_DATA → Show DataInputCard
    └── Update message state
```

### 4.2 Notification System Flow

```
Data Change / Timer (60s)
    │
    ▼
NotificationProvider.checkSmartNotifications()
    │
    ├── Try Supabase first
    │   └── isSupabaseAvailable() → getSupabaseData()
    │
    ├── Fallback to localStorage
    │   └── getData() from localStorage
    │
    ├── Check: stok <= stokMinimum → Create notification
    ├── Check: maintenance overdue → Create notification
    │
    ▼
addNotification()
    ├── Save to localStorage (KV_PREFIXES.notification)
    ├── Save to Supabase (if available)
    │
    └── Create PopupNotification
        ├── Show in NotificationPopup (bottom-right toast)
        ├── Auto-dismiss after 8 seconds
        └── Actions: Baca, Buka Modul, Balas AI, Tutup
```

### 4.3 Data Persistence (Supabase + localStorage Dual-Write)

```
Component Action (Create/Update/Delete)
    │
    ▼
supabase-data.ts
    │
    ├── saveData() / deleteData()
    │   ├── 1. Write to localStorage FIRST (fast, reliable)
    │   ├── 2. Check Supabase availability (cached 30s)
    │   └── 3. If available → Also write to Supabase
    │
    ├── getData()
    │   ├── 1. Check Supabase availability
    │   ├── 2. If available → Fetch from Supabase
    │   └── 3. If not → Read from localStorage
    │
    └── camelCase ↔ snake_case conversion
        ├── toSnakeCase() for writing to Supabase
        └── toCamelCase() for reading from Supabase
```

---

## 5. Database Schema Overview

### Supabase Tables

| Table | Fields | KV Prefix |
|-------|--------|-----------|
| `spare_parts` | nama, kode, kategori, stok, stok_minimum, satuan, lokasi, harga, pemasok | `ywm_spare_` |
| `pispot` | nama_peralatan, kode_peralatan, lokasi, jenis_pelumas, spesifikasi, volume, periode, bulan, tanggal_pelaksanaan, petugas, status, kondisi, catatan, tindak_lanjut | `ywm_pispot_` |
| `production` | tanggal, shift, mesin, target, aktual, satuan, kualitas | `ywm_prod_` |
| `maintenance` | judul, mesin, jenis, prioritas, status, tanggal_mulai, teknisi, estimasi_biaya | `ywm_maint_` |
| `team_activity` | nama_karyawan, divisi, aktivitas, status, jam_masuk, jam_keluar | `ywm_team_` |
| `safety_incident` | judul, tanggal, lokasi, severity, status, pelapor, korban, deskripsi, kategori_insiden, tindakan_perbaikan | `ywm_safety_` |
| `finance` | tanggal, jenis, kategori, deskripsi, jumlah, metode_pembayaran | `ywm_finance_` |
| `employee` | nama, nip, jabatan, divisi, tanggal_masuk, gaji_pokok, status, no_telepon, alamat | `ywm_hr_` |
| `documents` | nama, jenis, kategori, ukuran, url, ocr_text | `ywm_doc_` |
| `notifications` | judul, pesan, tipe, dibaca, modul, action_url | `ywm_notif_` |
| `silo_calculation` | silo, tanggal, ukuran[], volume, kekosongan, pengeluaran | `ywm_silo_calc_` |
| `silo_opname` | tanggal, kapal, opname1/2_ukuran_a/b, volume, pengeluaran_zak | `ywm_silo_opname_` |

### localStorage Key Pattern

```
{prefix}{id}
Contoh: ywm_spare_lq3k8a2 → JSON data
```

---

## 6. API Endpoints

### Vite Dev Server (Middleware)

| Endpoint | Method | Content-Type | Deskripsi |
|----------|--------|-------------|-----------|
| `/api/health` | GET | JSON | Health check: AI status + timestamp |
| `/api/chat` | POST | JSON | Non-streaming chat completion |
| `/api/chat/stream` | POST | SSE | Streaming chat (text/event-stream) |
| `/api/smart-parse` | POST | JSON | Natural language → structured data |

### Vercel Serverless (Production)

Same endpoints, implemented as serverless functions in `api/` directory.

### Request Format

```typescript
// POST /api/chat or /api/chat/stream
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>
}
```

### Response Format

```typescript
// /api/chat response
{
  message: {
    id: string;
    role: 'assistant';
    content: string;
    timestamp: string;
  },
  usage?: { input_tokens: number; output_tokens: number }
}

// /api/chat/stream response (SSE)
data: {"content":"chunk1"}
data: {"content":"chunk2"}
data: [DONE]
```

---

## 7. AI Integration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    AI Integration Architecture                    │
│                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ FloatingChatBot  │     │ AiAssistantPanel │                   │
│  │ (Mobile + Desktop)│    │ (Desktop Side)    │                   │
│  └────────┬────────┘     └────────┬────────┘                    │
│           │                       │                              │
│           └───────────┬───────────┘                              │
│                       │                                          │
│           ┌───────────▼───────────┐                              │
│           │  buildDashboardContext()│                             │
│           │  - Spare parts data    │                             │
│           │  - Pispot data         │                             │
│           │  - Production data     │                             │
│           │  - Maintenance data    │                             │
│           │  - Safety data         │                             │
│           │  - Finance data        │                             │
│           │  - Team data           │                             │
│           │  - HR data             │                             │
│           └───────────┬───────────┘                              │
│                       │                                          │
│           ┌───────────▼───────────┐                              │
│           │  chatWithAiStream()   │                              │
│           │  [context + messages]  │                              │
│           └───────────┬───────────┘                              │
│                       │                                          │
│           ┌───────────▼───────────┐                              │
│           │  Vite Middleware /    │                              │
│           │  Vercel Serverless    │                              │
│           │  + YWM System Prompt  │                              │
│           └───────────┬───────────┘                              │
│                       │                                          │
│           ┌───────────▼───────────┐                              │
│           │  z-ai-web-dev-sdk     │                              │
│           │  (AI Chat Completions)│                              │
│           └───────────────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. PWA Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    PWA Architecture                                │
│                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ manifest.json    │     │ Service Worker   │                   │
│  │ - name, icons   │     │ - Cache-first    │                   │
│  │ - display, theme│     │ - Network-first  │                   │
│  │ - start_url     │     │ - Push handler   │                   │
│  └─────────────────┘     └────────┬────────┘                    │
│                                   │                              │
│           ┌───────────────────────┼──────────────────┐          │
│           │                       │                  │          │
│  ┌────────▼────────┐  ┌──────────▼─────────┐  ┌────▼─────────┐│
│  │ STATIC_CACHE    │  │ API_CACHE          │  │ IMAGE_CACHE   ││
│  │ JS, CSS, Fonts  │  │ /api/* responses   │  │ PNG, SVG, etc ││
│  │ (Cache-first)   │  │ (Network-first)    │  │ (Cache-first) ││
│  └─────────────────┘  └────────────────────┘  └───────────────┘│
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Push Notification Infrastructure                         │  │
│  │ - requestPushPermission()                                 │  │
│  │ - subscribeToPush(vapidKey)                               │  │
│  │ - getPushSubscription()                                   │  │
│  │ - Service Worker: push + notificationclick handlers       │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript | UI & type safety |
| Build | Vite 5.4 | Dev server & build |
| Styling | Tailwind CSS 3.4 + Shadcn/UI | Utility CSS + components |
| Routing | React Router 6 | Client-side routing |
| State | TanStack Query | Server state |
| Charts | Recharts | Data visualization |
| AI | z-ai-web-dev-sdk | Chat completions |
| Database | Supabase (PostgreSQL) | Primary data store |
| Offline | localStorage | Fallback data store |
| PWA | Service Worker + manifest | Installable + offline |
| Deployment | Vercel | Hosting + serverless |

---

_Timestamp: 2026-05-29_  
_Developer: ⚡ Tim Teknik | Mulky Malikul Dhaher ⚡_  
_WhatsApp: +6285322624038_  
_Email: mulkymalikuldhaher@email.com_
