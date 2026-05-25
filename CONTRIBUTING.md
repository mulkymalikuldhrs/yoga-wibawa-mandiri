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

- **Code Style:** Follow existing patterns (JS for dashboard, TS/React for website)
- **Dashboard Modules:** Use `YWM.Modules.{name} = { title, render(), init() }` pattern
- **Styling:** Use glassmorphic CSS classes (`.glass`, `.btn-accent`, `.badge-*`, etc.)
- **Data:** Use `YWM.Data.get/set/setWithTimestamp/addAuditLog` for all data operations
- **AI:** Use `puter.ai.chat()` for AI operations, `puter.ai.img2txt()` for OCR
- **KV Keys:** Follow `ywm:{module}:{entity}:{id}` naming pattern
- **Timestamps:** Always use `YWM.Data.setWithTimestamp()` for data mutations
- **Audit:** All data mutations must be logged via `YWM.Data.addAuditLog()`
- **Error Handling:** All async operations must use try/catch with user-friendly toast
- **Comments:** Write comments in Indonesian (Bahasa Indonesia)

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

- **Gaya Kode:** Ikuti pola yang sudah ada (JS untuk dashboard, TS/React untuk website)
- **Modul Dashboard:** Gunakan pola `YWM.Modules.{name} = { title, render(), init() }`
- **Styling:** Gunakan kelas CSS glassmorphic (`.glass`, `.btn-accent`, `.badge-*`, dll.)
- **Data:** Gunakan `YWM.Data.get/set/setWithTimestamp/addAuditLog` untuk semua operasi data
- **AI:** Gunakan `puter.ai.chat()` untuk operasi AI, `puter.ai.img2txt()` untuk OCR
- **KV Keys:** Ikuti pola penamaan `ywm:{module}:{entity}:{id}`
- **Timestamp:** Selalu gunakan `YWM.Data.setWithTimestamp()` untuk mutasi data
- **Audit:** Semua mutasi data harus dicatat via `YWM.Data.addAuditLog()`
- **Error Handling:** Semua operasi async harus menggunakan try/catch dengan toast user-friendly
- **Komentar:** Tulis komentar dalam Bahasa Indonesia

---

## ⚠️ Disclaimer

**For Education Purpose Only.** All content, code, and documentation provided in this repository are intended solely for educational and research purposes. The authors and contributors assume no responsibility or liability for any losses, damages, or consequences arising from the use of this software or information provided herein.

**Hanya untuk Tujuan Pendidikan.** Semua konten, kode, dan dokumentasi dalam repositori ini hanya ditujukan untuk tujuan pendidikan dan penelitian. Penulis dan kontributor tidak bertanggung jawab atas risiko atau kerugian apa pun yang timbul dari penggunaan perangkat lunak atau informasi yang disediakan.

**Risiko apapun tidak kita tanggung.**

---

## 📬 Contact

**Mulky Malikul Dhaher** — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)

GitHub: https://github.com/mulkymalikuldhrs
