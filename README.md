# PT. Yoga Wibawa Mandiri - Modern Corporate Website 🏢

<div align="center">
  <img src="public/ywm-logo-new.svg" alt="PT. Yoga Wibawa Mandiri Logo" width="200" height="200"/>
  
  [![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)
  
  **🌟 STABLE VERSION: v1.0 - Production Ready**
</div>

## 🏭 Tentang Perusahaan

PT. Yoga Wibawa Mandiri adalah perusahaan pengantongan Semen Padang terpercaya yang berlokasi strategis di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh. Dengan teknologi modern dan komitmen terhadap kualitas, kami melayani kebutuhan konstruksi di seluruh wilayah Aceh dan Sumatera Utara.

## 🌐 **LIVE DEMO**
### **� https://jakForever.github.io/pt-yogawibawamandiri-website**

## 📊 Branch Strategy & Versions

### 🌿 **Branch Information**

| Branch | Version | Status | Description |
|--------|---------|--------|-------------|
| **`main`** | v1.0.0 | 🟢 **YOU ARE HERE** | Production-ready stable version |
| **`mentat-5/comprehensive-update`** | v2.0.0 | 🚀 Latest | Complete dependency upgrade |
| **`mentat-4`** | v1.4.0 | 🔄 Legacy | Header improvements |
| **`mentat-3`** | v1.3.0 | 📚 Archive | Feature additions |
| **`mentat-2`** | v1.2.0 | 📚 Archive | UI enhancements |
| **`mentat-1`** | v1.1.0 | 📚 Archive | Initial improvements |

### 🔄 **Want the Latest Features?**

**For the most advanced version with comprehensive upgrades:**
```bash
git checkout mentat-5/comprehensive-update
```

**This branch includes:**
- ✅ **Latest Dependencies** - All packages updated to 2025 versions
- ✅ **Security Patches** - All vulnerabilities fixed
- ✅ **Performance Optimizations** - Faster build and runtime
- ✅ **Modern Features** - Latest React ecosystem features

## 🚀 Fitur Website (Main Branch)

### 🌟 Core Features
- **📱 Responsive Design** - Optimal di semua perangkat
- **🎨 Modern UI/UX** - Design premium dengan animasi smooth
- **📍 Interactive Maps** - Lokasi pabrik dan area distribusi
- **📸 Gallery** - Dokumentasi fasilitas dan kegiatan
- **📞 Contact System** - Form kontak terintegrasi
- **🏢 Company Profile** - Informasi lengkap perusahaan

### � Database Integration
- **Supabase Backend** - Modern PostgreSQL database
- **Real-time Data** - Live updates untuk konten
- **Contact Management** - Sistem manajemen pesan pelanggan
- **File Storage** - Supabase storage untuk media

## 🛠️ Tech Stack (Main Branch)

### Frontend Core
- **React 18.3.1** - Modern JavaScript framework
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.1** - Fast build tool dan dev server
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library

### State Management & Routing
- **React Router 6.26.2** - Client-side routing
- **TanStack Query 5.56.2** - Data fetching dan caching
- **React Hook Form 7.53.0** - Form management

### UI/UX Libraries
- **Lucide React 0.462.0** - Beautiful icons
- **Sonner 1.5.0** - Toast notifications
- **Framer Motion** - Smooth animations

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Modern relational database
- **Row Level Security** - Data protection

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (Recommended: 20.x LTS)
- **npm 10+** atau **yarn 4+** atau **bun 1.x**
- **Git** untuk version control

### Installation

```bash
# Clone repository
git clone https://github.com/jakForever/pt-yogawibawamandiri-website.git
cd pt-yogawibawamandiri-website

# Make sure you're on main branch
git checkout main

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=PT Yoga Wibawa Mandiri
VITE_APP_DESCRIPTION=Pengantongan Semen Padang Lhokseumawe
```

## 📁 Struktur Proyek

```
src/
├── components/          # Reusable components
│   ├── ui/             # Shadcn/UI components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   └── Layout.tsx      # Page layout wrapper
├── pages/              # Page components
│   ├── Index.tsx       # Homepage
│   ├── About.tsx       # Tentang kami
│   ├── Services.tsx    # Layanan
│   ├── Gallery.tsx     # Galeri
│   ├── Location.tsx    # Lokasi
│   └── Contact.tsx     # Kontak
├── lib/                # Utility libraries
│   ├── utils.ts        # Helper functions
│   └── supabase.ts     # Supabase client
├── hooks/              # Custom React hooks
└── styles/             # Global styles
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality
- **ESLint** - Code quality dan consistency
- **TypeScript** - Type safety
- **Prettier** - Code formatting

## � Performance (Main Branch)

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: Good
- **Bundle Size**: Optimized untuk fast loading
- **Build Time**: ~2-3 seconds

## 🌐 Deployment

### Netlify (Recommended)
```bash
# Build project
npm run build

# Deploy to Netlify
# Upload dist/ folder atau connect Git repository
```

### Alternative Options
- **Vercel** - `vercel --prod`
- **GitHub Pages** - `npm run deploy`
- **Manual** - Upload `dist/` folder

## � Security

### Security Features
- **Environment Variables** - Sensitive data protection
- **HTTPS Everywhere** - Encrypted connections
- **Input Validation** - XSS dan injection protection
- **Secure Headers** - Security hardening

## � Support & Contact

### Development Team
- **Lead Developer**: Mulky Malikul Dhaher
- **Role**: Technical Engineer
- **Company**: PT. Yoga Wibawa Mandiri
- **Email**: mulky@yogawibawamandiri.com

### Company Information
- **Website**: https://yogawibawamandiri.com
- **Email**: info@yogawibawamandiri.com
- **Address**: Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh
- **Phone**: +62-xxx-xxxx-xxxx

### Layanan Utama
- ✅ Pengantongan Semen Padang
- ✅ Distribusi Regional Aceh & Sumut
- ✅ Layanan Teknis & Konsultasi
- ✅ Quality Assurance & Control

## � License

**Copyright © 2025 PT. Yoga Wibawa Mandiri. All rights reserved.**

This project is proprietary software developed for PT. Yoga Wibawa Mandiri.

---

## � Changelog

### v1.0.0 (2024-06-30) - Initial Release
- ✅ Full-stack CMS implementation
- ✅ Supabase backend integration
- ✅ Admin dashboard
- ✅ PWA support
- ✅ Netlify deployment ready
- ✅ Production-ready stable version

---

**🏢 Built with ❤️ for PT. Yoga Wibawa Mandiri | Stable Production Version**

---

## 💡 Upgrade to Latest Version

**Ready for cutting-edge features?** Switch to our latest development branch:

```bash
# Switch to latest comprehensive update
git checkout mentat-5/comprehensive-update

# Install updated dependencies
npm install

# Enjoy the latest features!
npm run dev
```

**Benefits of upgrading:**
- 🚀 **Latest Dependencies** - All packages updated to 2025
- �️ **Security Fixes** - All vulnerabilities patched
- ⚡ **Performance** - Faster builds and better optimization
- 🎨 **Enhanced UI** - Improved components and animations
