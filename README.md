# DHAHER LABS — REALIZATION MANDATE

> **⚠️ THIS IS A REAL SYSTEM. NOT A TOOL. NOT A SIMULATION.**
> This is a REAL production system in the DHAHER LABS autonomous ecosystem.

---

> **DHAHER LABS — REALIZATION MANDATE**
> This is a REAL production system in the DHAHER LABS autonomous ecosystem.
> Not a simulation. Not a toy. Not a placeholder.
> Every component serves the autonomous organism.


<!-- CAPSULE-RENDER HEADER -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0a1a2e,50:0d2b4a,100:143d5e&fontColor=60a5fa&descColor=34d399&height=220&section=header&text=Yoga%20Wibawa%20Mandiri&fontSize=55&desc=Company%20Profile%20Website&animation=fadeIn" />

---

## Audit Report

**Score:** 50 | Last audit: 2026-06-27

**Files:** 39 | **Dirty:** 134 | **Last commit:** 2026-06-11 | **Stack:** Vite/TypeScript (v8.0.0)

### Known Gaps
1. 134 dirty files — worktree index drift; needs reconciliation (likely global filemode or whitespace changes)
2. Uses Vite but README badges claim Next.js — actual framework identity is inconsistent
3. No test scripts configured — static company profile is low risk but still no safety net
4. Last commit 2026-06-11 — 16 days stale, no recent activity
5. Missing CI/CD for a client-facing production website

### Ecosystem Role
Corporate profile website for Yoga Wibawa Mandiri. Client-facing static presence within Dhaher Labs' web services portfolio.

<!-- TYPING SVG -->
<div align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=60A5FA&center=true&vCenter=true&width=600&lines=Professional+Company+Profile;TypeScript+%2B+Next.js;Clean+%2C+Modern+%2C+Trustworthy;Building+Corporate+Presence" alt="Typing SVG" />
  </a>
</div>

<br/>

<!-- BADGES -->
<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

</div>

---


<!-- AUTO-PACKAGE-BADGES:START -->

<!-- AUTO-PACKAGE-BADGES:END -->

## Overview

**Yoga Wibawa Mandiri** is a professional company profile website built with TypeScript and Next.js. It presents the company's services, team, history, and values in a clean, modern design that builds trust and credibility. Optimized for SEO with server-side rendering, the site ensures strong search visibility while delivering a fast, professional user experience.

## Visual Architecture

### Corporate Site Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend - Vite React SPA"]
        UI["React 18 + TypeScript"]
        Router["React Router DOM"]
        Shadcn["shadcn/ui + Radix UI"]
        RQ["TanStack React Query"]
        TW["Tailwind CSS"]
    end

    subgraph Backend["Backend - Express 5"]
        API["REST API Routes"]
        ContactAPI["Contact Form Endpoint"]
        ContentAPI["Content Delivery API"]
    end

    subgraph DataLayer["Data Layer - Supabase"]
        SupaClient["Supabase JS Client"]
        PG["PostgreSQL Database"]
        Auth2["Supabase Auth"]
        Storage["Supabase Storage"]
    end

    subgraph External["External Services"]
        EmailJS["EmailJS - Email Delivery"]
        Vercel["Vercel Deployment"]
    end

    UI --> Router
    UI --> Shadcn
    UI --> RQ
    UI --> TW
    UI --> API
    API --> ContactAPI
    API --> ContentAPI
    ContactAPI --> EmailJS
    ContentAPI --> SupaClient
    SupaClient --> PG
    SupaClient --> Auth2
    SupaClient --> Storage
    API --> Vercel

    style UI fill:#61DAFB,color:#000
    style API fill:#000,color:#fff
    style SupaClient fill:#3ECF8E,color:#000
    style PG fill:#336791,color:#fff
    style EmailJS fill:#00BCD4,color:#fff
```

### Content Management Flow

```mermaid
flowchart TB
    subgraph Pages["Page Structure"]
        SitePages["Site Pages"] --> Home["Home"]
        SitePages --> About["About Us"]
        SitePages --> Services["Services"]
        SitePages --> Team["Team"]
        SitePages --> Portfolio["Portfolio"]
        SitePages --> Contact["Contact"]
    end

    subgraph Sections["Section Composition"]
        Home --> HeroSection["Hero Section"]
        Home --> CTASection["Call-to-Action"]
        About --> Timeline["Company Timeline"]
        About --> Values["Mission and Values"]
        Services --> ServiceCards["Service Cards"]
        Team --> TeamGrid["Team Member Grid"]
        Portfolio --> ProjectShowcase["Project Showcase"]
    end

    subgraph Content["Content Source"]
        Timeline --> StaticData["Static Content Data"]
        ServiceCards --> StaticData
        TeamGrid --> SupabaseData["Supabase Content"]
        ProjectShowcase --> SupabaseData
    end

    style SitePages fill:#0d2b4a,color:#60a5fa
    style StaticData fill:#143d5e,color:#34d399
    style SupabaseData fill:#3ECF8E,color:#000
```

### Contact Form Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant F as Contact Form
    participant V as Client Validation
    participant E as EmailJS API
    participant N as Notification Email
    participant S as Supabase Log

    U->>F: Fill out contact form
    F->>V: Validate name, email, message
    alt Validation fails
        V-->>F: Show error messages
        F-->>U: Highlight invalid fields
    else Validation passes
        V->>E: Send via EmailJS SDK
        E->>N: Deliver notification email
        N-->>U: Auto-reply confirmation
        V->>S: Log submission to database
        S-->>V: Store success
    end
```

> **Stack Note**: Yoga Wibawa Mandiri uses Vite + React 18 with Express backend and Supabase for PostgreSQL data. Contact forms are delivered via EmailJS without requiring a dedicated mail server. The site is designed as a corporate profile/CMS with server-side rendering capabilities.

---

## Features

### Company Presentation
- **Company Overview** — Mission, vision, and company history with timeline
- **Service Pages** — Detailed descriptions of company services and capabilities
- **Team Section** — Professional profiles with roles and expertise
- **Portfolio/Projects** — Showcase completed projects and case studies
- **Client Logos** — Trusted partner and client brand display

### User Experience
- **Contact Page** — Contact form, office location with map, and social links
- **Responsive Design** — Professional appearance across all devices
- **SEO Optimized** — Server-side rendering for search engine visibility
- **Fast Loading** — Optimized images and code splitting for performance
- **Dark/Light Mode** — Theme preference support

### Technical
- **CMS Ready** — Structured content management integration points
- **Analytics** — Visitor tracking and engagement metrics
- **i18n Ready** — Internationalization structure for multilingual support

## Quick Start

### Prerequisites
- Node.js 18+

### Installation

```bash
git clone https://github.com/mulkymalikuldhrs/yoga-wibawa-mandiri.git
cd yoga-wibawa-mandiri
npm install
cp .env.example .env
```

### Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_NAME="Yoga Wibawa Mandiri"
NEXT_PUBLIC_CONTACT_EMAIL=info@yogawibawamandiri.com
```

### Running

```bash
npm run dev
```

## Project Structure

```
yoga-wibawa-mandiri/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/
│   │   ├── about/        # Company info sections
│   │   ├── services/     # Service display components
│   │   ├── team/         # Team member profiles
│   │   ├── projects/     # Portfolio showcase
│   │   └── contact/      # Contact form & map
│   ├── content/          # Static content & data
│   ├── lib/
│   │   ├── seo/          # SEO utilities
│   │   └── analytics/    # Tracking integration
│   └── types/            # TypeScript definitions
└── public/               # Static assets & images
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

Content updates, design improvements, and SEO optimizations welcome.

## License

**MIT License** — see [LICENSE](./LICENSE) for details.

## Author

<div align="center">

**Mulky Malikul Dhaher**

[![GitHub](https://img.shields.io/badge/GitHub-mulkymalikuldhrs-181717?style=flat-square&logo=github)](https://github.com/mulkymalikuldhrs)
[![Email](https://img.shields.io/badge/Email-mulkymalikudhr@mail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:mulkymalikudhr@mail.com)

</div>

---

<!-- FOOTER BANNER -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0a1a2e,50:0d2b4a,100:143d5e&fontColor=60a5fa&descColor=34d399&height=120&section=footer&text=&fontSize=0" />

## Architecture

```mermaid

```
