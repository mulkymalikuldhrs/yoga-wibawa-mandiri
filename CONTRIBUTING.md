# Contributing to PT Yoga Wibawa Mandiri Digital Platform

Thank you for your interest in contributing! We welcome contributions from the community.

---

## 🇬🇧 English

### How to Contribute

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

### Development Guidelines

- **Code Style:** Follow existing TypeScript/React patterns in the codebase
- **Components:** Use Shadcn/UI components whenever possible
- **Styling:** Use Tailwind CSS utility classes, avoid custom CSS
- **State:** Use Zustand for global state, TanStack Query for server state
- **Types:** All new features must have proper TypeScript types
- **Forms:** Use React Hook Form + Zod for form validation
- **Timestamps:** Never set timestamps client-side; use Supabase defaults/triggers
- **RLS:** All new tables must have Row Level Security policies
- **Audit:** All data mutations must be captured by audit trail triggers

### Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/spare-part-inventory` |
| Bug Fix | `fix/description` | `fix/dashboard-routing` |
| Hotfix | `hotfix/description` | `hotfix/auth-redirect` |
| Docs | `docs/description` | `docs/api-reference` |
| Refactor | `refactor/description` | `refactor/state-management` |

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(inventaris): add spare part stock alert system
fix(dashboard): resolve auth guard redirect loop
docs(api): update edge function documentation
refactor(hooks): extract useAutoTimestamp hook
test(produksi): add unit tests for production calculations
```

### Pull Request Checklist

- [ ] Code compiles without errors (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] No TypeScript errors
- [ ] New components use Shadcn/UI patterns
- [ ] New tables have RLS policies
- [ ] Auto timestamp fields are server-side only
- [ ] Documentation updated (if applicable)

---

## 🇮🇩 Bahasa Indonesia

### Cara Berkontribusi

1. **Fork** repositori ini
2. Buat **branch fitur** (`git checkout -b feature/amazing-feature`)
3. **Commit** perubahan Anda (`git commit -m 'Add amazing feature'`)
4. **Push** ke branch (`git push origin feature/amazing-feature`)
5. Buka **Pull Request**

### Panduan Pengembangan

- **Gaya Kode:** Ikuti pola TypeScript/React yang sudah ada
- **Komponen:** Gunakan komponen Shadcn/UI jika tersedia
- **Styling:** Gunakan kelas utility Tailwind CSS, hindari CSS custom
- **State:** Gunakan Zustand untuk state global, TanStack Query untuk server state
- **Tipe:** Semua fitur baru harus memiliki tipe TypeScript yang tepat
- **Form:** Gunakan React Hook Form + Zod untuk validasi form
- **Timestamp:** Jangan set timestamp di client; gunakan default/trigger Supabase
- **RLS:** Semua tabel baru harus memiliki Row Level Security policies
- **Audit:** Semua mutasi data harus ditangkap oleh audit trail triggers

---

## ⚠️ Disclaimer

**For Education Purpose Only.** All content, code, and documentation provided in this repository are intended solely for educational and research purposes. The authors and contributors assume no responsibility or liability for any losses, damages, or consequences arising from the use of this software or information provided herein.

**Hanya untuk Tujuan Pendidikan.** Semua konten, kode, dan dokumentasi dalam repositori ini hanya ditujukan untuk tujuan pendidikan dan penelitian. Penulis dan kontributor tidak bertanggung jawab atas risiko atau kerugian apa pun yang timbul dari penggunaan perangkat lunak atau informasi yang disediakan.

**Risiko apapun tidak kita tanggung.**

---

## 📬 Contact

**Mulky Malikul Dhaher** — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)

GitHub: https://github.com/mulkymalikuldhrs
