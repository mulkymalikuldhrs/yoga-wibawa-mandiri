# 🔒 Kebijakan Keamanan — YWM Dashboard
_Last updated: 2026-05-29_
_Developer: Tim Teknik | Mulky Malikul Dhaher_

---

## 🇬🇧 English

### Security Architecture

This project implements a multi-layer security model:

| Layer | Protection | Status |
|-------|------------|--------|
| **Network** | HTTPS only (TLS 1.3), CORS configuration, Vercel CDN | ✅ Active |
| **Application** | Content Security Policy, X-Frame-Options, X-XSS-Protection | ✅ Active |
| **Data** | Input validation (Zod), Supabase RLS (ready), localStorage encryption (future) | 🚧 Partial |
| **AI** | System prompt boundaries, user input sanitization, rate limiting (future) | 🚧 Partial |
| **Authentication** | Supabase Auth (available), RBAC roles (defined, not enforced yet) | ⬜ Planned |

### 1. Supabase Row Level Security (RLS)

**Current Status:** Tables exist but RLS policies need to be configured.

**Recommended RLS Policies:**

```sql
-- Enable RLS on all tables
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE production ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_calculation ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_opname ENABLE ROW LEVEL SECURITY;

-- For development: Allow all reads/writes with anon key
CREATE POLICY "Allow anon read" ON spare_parts FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON spare_parts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON spare_parts FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON spare_parts FOR DELETE USING (true);

-- For production: Use authenticated users with role-based access
-- CREATE POLICY "Authenticated users can read" ON spare_parts
--   FOR SELECT USING (auth.role() = 'authenticated');
```

### 2. API Key Management

| Key Type | Storage | Access |
|----------|---------|--------|
| `VITE_SUPABASE_URL` | Environment variable | Client-side (public) |
| `VITE_SUPABASE_ANON_KEY` | Environment variable | Client-side (public, restricted by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** in frontend | Server-side only |
| `VITE_EMAILJS_*` | Environment variable | Client-side (public) |
| z-ai-web-dev-sdk | Auto-initialized | Server-side only (Vite middleware / Vercel) |

**Important:**
- `VITE_` prefixed variables are exposed to the client bundle
- Never use service role keys in frontend code
- Supabase anon key is safe for frontend when RLS is properly configured

### 3. CORS Configuration

**Vite Dev Server:**
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');  // Development only
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

**Production (Vercel):**
- Vercel handles CORS automatically
- Restrict origins to production domain in production

### 4. Content Security Policy (CSP)

Implemented via meta tags in `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  connect-src 'self' https://*.supabase.co https://api.openai.com;" />
```

### 5. XSS Prevention

- React automatically escapes JSX expressions
- CSP headers restrict script sources
- Input validation with Zod schemas
- No use of `dangerouslySetInnerHTML` (except markdown rendering)
- `X-XSS-Protection: 1; mode=block` header

### 6. CSRF Protection

- Same-site cookies for Supabase auth
- POST requests require JSON Content-Type
- No form-based submissions (all API-based)

---

## 🇮🇩 Bahasa Indonesia

### Arsitektur Keamanan

Proyek ini mengimplementasikan model keamanan berlapis:

| Lapisan | Perlindungan | Status |
|---------|-------------|--------|
| **Jaringan** | HTTPS saja (TLS 1.3), CORS, CDN Vercel | ✅ Aktif |
| **Aplikasi** | Content Security Policy, X-Frame-Options, X-XSS-Protection | ✅ Aktif |
| **Data** | Validasi input (Zod), RLS Supabase (siap), enkripsi localStorage (masuk depan) | 🚧 Sebagian |
| **AI** | Batasan system prompt, sanitasi input user, rate limiting (masuk depan) | 🚧 Sebagian |
| **Autentikasi** | Supabase Auth (tersedia), RBAC (didefinisikan, belum diterapkan) | ⬜ Direncanakan |

### Praktik Keamanan untuk Kontributor

1. **JANGAN** commit file `.env` atau API keys
2. **SELALU** gunakan RLS Supabase untuk akses data
3. **JANGAN** percaya timestamp dari client (gunakan server defaults)
4. **SELALU** validasi input dengan Zod schemas
5. **JANGAN** expose service role keys di frontend
6. **GUNAKAN** HTTPS untuk semua koneksi
7. **LAKUKAN** sanitasi input sebelum mengirim ke AI

### Melaporkan Kerentanan

Jika Anda menemukan kerentanan keamanan, silakan laporkan melalui email **mulkymalikuldhaher@email.com**.

**JANGAN buat GitHub issue publik untuk kerentanan keamanan.**

---

## ⚠️ Disclaimer

**For Education Purpose Only.** All content, code, and documentation provided in this repository are intended solely for educational and research purposes. The authors and contributors assume no responsibility or liability for any losses, damages, or consequences arising from the use of this software.

**Hanya untuk Tujuan Pendidikan.** Semua konten, kode, dan dokumentasi dalam repositori ini hanya ditujukan untuk tujuan pendidikan dan penelitian. Penulis dan kontributor tidak bertanggung jawab atas risiko atau kerugian apa pun.

---

_Timestamp: 2026-05-29T12:00:00+07:00_  
_Developer: Tim Teknik | Mulky Malikul Dhaher_  
_Email: mulkymalikuldhaher@email.com_
