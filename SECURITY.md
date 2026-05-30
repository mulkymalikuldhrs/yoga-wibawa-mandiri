# Security Policy — PT Yoga Wibawa Mandiri Digital Platform

## 🇬🇧 English

### Security Architecture

This project implements a 5-layer security model:

| Layer | Protection |
|-------|------------|
| **Network** | HTTPS only (TLS 1.3), CORS whitelist, Rate limiting, DDoS protection |
| **Authentication** | Supabase Auth (JWT), httpOnly cookies, Session management |
| **Authorization** | Row Level Security (RLS), RBAC (9 roles), Component-level visibility |
| **Data** | Input validation (Zod), Parameterized queries, CSP headers, Encryption at rest |
| **Audit** | Auto timestamp (immutable), Audit trail (all changes logged), Login history |

### Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing **mulkymalikuldhaher@email.com**.

**Please do NOT create a public GitHub issue for security vulnerabilities.**

### What to Include
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### Response Time
We will acknowledge your report within 48 hours and provide a detailed response within 7 days.

### Security Best Practices for Contributors

- Never commit `.env` files or secrets
- Always use Supabase RLS policies for data access
- Never trust client-side timestamps (use server defaults/triggers)
- Always validate input with Zod schemas
- Never expose service role keys in frontend code

---

## 🇮🇩 Bahasa Indonesia

### Arsitektur Keamanan

Proyek ini mengimplementasikan model keamanan 5 lapisan:

| Lapisan | Perlindungan |
|---------|-------------|
| **Jaringan** | HTTPS saja (TLS 1.3), CORS whitelist, Rate limiting, Proteksi DDoS |
| **Autentikasi** | Supabase Auth (JWT), httpOnly cookies, Manajemen sesi |
| **Otorisasi** | Row Level Security (RLS), RBAC (9 role), Visibilitas level komponen |
| **Data** | Validasi input (Zod), Query parameterized, CSP headers, Enkripsi at rest |
| **Audit** | Auto timestamp (immutable), Audit trail, Riwayat login |

### Melaporkan Kerentanan

Jika Anda menemukan kerentanan keamanan, silakan laporkan melalui email **mulkymalikuldhaher@email.com**.

**JANGAN buat GitHub issue publik untuk kerentanan keamanan.**

---

## ⚠️ Disclaimer

**For Education Purpose Only.** All content, code, and documentation provided in this repository are intended solely for educational and research purposes. The authors and contributors assume no responsibility or liability for any losses, damages, or consequences arising from the use of this software or information provided herein.

**Hanya untuk Tujuan Pendidikan.** Semua konten, kode, dan dokumentasi dalam repositori ini hanya ditujukan untuk tujuan pendidikan dan penelitian. Penulis dan kontributor tidak bertanggung jawab atas risiko atau kerugian apa pun yang timbul dari penggunaan perangkat lunak atau informasi yang disediakan.

**Risiko apapun tidak kita tanggung.**

---

**Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
