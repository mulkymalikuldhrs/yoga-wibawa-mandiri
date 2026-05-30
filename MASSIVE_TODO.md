# MASSIVE TODO — YWM Dashboard Upgrade
**Target: Production-Ready Digital Platform untuk PT Yoga Wibawa Mandiri**

---

## PHASE 0: FOUNDATION ✅ DONE
- [x] Clone repo from GitHub
- [x] Setup .env.local with Supabase credentials
- [x] Run schema.sql — ALL 13 tables created in Supabase
- [x] Verify database connection ✅
- [x] Create COMPREHENSIVE_AUDIT.md

## PHASE 1: DATABASE & CRITICAL FIXES (P0)

### 1.1 Fix App.css & Remove Vite Boilerplate
- [ ] Remove default Vite styles (#root max-width, logo-spin, .card, .read-the-docs)
- [ ] Add glassmorphic base styles
- [ ] Ensure consistent ywm color theme

### 1.2 Database CRUD — Connect All Modules to Supabase
- [ ] **SparePartsModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **MaintenanceModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **TeamActivityModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **PispotModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **SiloOpnameModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **SiloCalculationModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **ProductionModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **FinanceModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **SafetyModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **NotificationsModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] **DocumentsModule** — Replace localStorage with supabase-data.ts CRUD
- [ ] Add loading states for all async operations
- [ ] Add error handling for Supabase connection failures
- [ ] Add toast notifications for successful saves/updates/deletes

### 1.3 Fix Edit/Update Operations
- [ ] Ensure all modules have working edit dialog
- [ ] Edit should populate form with existing data
- [ ] Update should call Supabase UPDATE
- [ ] Delete should call Supabase DELETE with confirmation

## PHASE 2: AI & CHATBOT (P1)

### 2.1 Connect AI to Database
- [ ] Create API endpoint: /api/ai/query — AI reads data from Supabase
- [ ] Create API endpoint: /api/ai/action — AI writes/updates data in Supabase
- [ ] Add tool/function calling to AI for: read_spare_parts, create_maintenance, get_silo_status, etc.
- [ ] System prompt includes actual database schema

### 2.2 Improve Chatbot
- [ ] Toggle ON/OFF button (exists, verify works)
- [ ] Natural language responses with YWM context
- [ ] Confirmation flow for edits: "Saya akan mengupdate spare part X. Konfirmasi?"
- [ ] Chat history saved to Supabase
- [ ] Streaming responses work properly

### 2.3 Document AI
- [ ] Upload document endpoint: accept PDF, DOCX, XLSX
- [ ] Extract text from uploaded documents
- [ ] Store in documents table with extracted text
- [ ] AI can query document contents for troubleshooting
- [ ] "Cari solusi untuk masalah [x] di manual [nama file]"

## PHASE 3: DESIGN & UI OVERHAUL (P1)

### 3.1 Logo & Branding
- [ ] Create/upload proper YWM logo
- [ ] Replace placeholder images in public/lovable-uploads/
- [ ] Update favicon
- [ ] Update PWA icons (192+512) with YWM branding

### 3.2 Dashboard Design Consistency
- [ ] Apply glassmorphic glass-frosted design to all modules
- [ ] Consistent color scheme: ywm-red + dark + light
- [ ] Match dashboard theme with website pages
- [ ] Fix font colors for readability
- [ ] Fix typography and copywriting throughout

### 3.3 Visualization
- [ ] **Silo visualization** — SVG/Canvas silo with fill level indicator
- [ ] **Spare parts** — Card grid with stock level indicators
- [ ] **Charts** — Recharts for analytics (production trends, maintenance history)
- [ ] **Ringkasan/Overview** — Dashboard summary cards for ALL data types
- [ ] Consistent chart styling across all modules

### 3.4 Website Pages Enhancement
- [ ] **Index.tsx** — Hero section, product showcase, company intro
- [ ] **About.tsx** — Company profile, history, vision-mission
- [ ] **Services.tsx** — Bagging services, product specifications
- [ ] **Gallery.tsx** — Photos of facility, operations
- [ ] **Contact.tsx** — WhatsApp integration, form, map
- [ ] **Products page (NEW)** — E-commerce style product listing with 2 variants

### 3.5 Product Page (E-commerce Style)
- [ ] Variant 1: PCC Zak 40kg (pilihan 250 zak atau 750 zak)
- [ ] Variant 2: Bulk/Curah (max 30 ton, dengan gambar mobil truk curah)
- [ ] "Pesan via WhatsApp" button → +6285322624048
- [ ] "Konsultasi" button → +6285322624048
- [ ] Product images (Semen Padang branding)
- [ ] Price on request / hubungi kami

## PHASE 4: NOTIFICATIONS & PWA (P2)

### 4.1 Real Notifications
- [ ] Implement Web Push API with VAPID keys
- [ ] Browser notification permission dialog
- [ ] Push notifications for: stock minimum alerts, maintenance due, opname reminders
- [ ] In-app notification center reads from Supabase notifications table
- [ ] Sound/beep on new notification
- [ ] Badge count on app icon

### 4.2 PWA Polish
- [ ] Fix service worker caching strategy
- [ ] Test install prompt on multiple devices
- [ ] Offline mode with cached data
- [ ] manifest.json — proper colors, icons, categories
- [ ] Test on mobile viewport

## PHASE 5: WHATSAPP & COMMUNICATION (P2)

### 5.1 WhatsApp Integration
- [ ] "Pesan via WhatsApp" buttons on product page
- [ ] WhatsApp click-to-chat: https://wa.me/6285322624048
- [ ] Auto-fill message template for product orders
- [ ] Contact form sends to WhatsApp + email

### 5.2 Contact Info
- [ ] Phone: +6285322624048 everywhere
- [ ] Email service setup (EmailJS configured)
- [ ] Contact page with working form + WhatsApp button

## PHASE 6: DATA ACCURACY & FORMULAS (P1)

### 6.1 Fix Silo Formulas
- [ ] Read actual Excel files from /home/mulky/Desktop/KDE/
- [ ] Compare SiloCalculationModule formulas with Excel originals
- [ ] Fix: kalkulasi kekosongan silo (emptiness calculation)
- [ ] Fix: opname calculation (inventory measurement)
- [ ] Fix: discharge loading calculation
- [ ] Add unit tests for all calculations
- [ ] Verify: 40kg bags (not 50kg)

### 6.2 Seed Data
- [ ] Migrate Excel data to Supabase tables
- [ ] Import silo opname records from Excel
- [ ] Import spare parts list
- [ ] Import maintenance history

## PHASE 7: TESTING & QA (P3)

### 7.1 Automated Testing
- [ ] Unit tests for calculation functions (Vitest)
- [ ] Component tests for critical modules
- [ ] API endpoint tests
- [ ] Supabase integration tests

### 7.2 Browser Testing
- [ ] Fix test-browser.mjs (Puppeteer)
- [ ] Test all dashboard pages
- [ ] Test all CRUD operations
- [ ] Test responsive layout
- [ ] Test PWA install flow
- [ ] Test offline mode

### 7.3 Code Quality
- [ ] ESLint run and fix issues
- [ ] TypeScript strict mode fixes
- [ ] Remove console.log statements
- [ ] Optimize bundle size

## PHASE 8: DOCUMENTATION & ANALYTICS (P3)

### 8.1 Documentation
- [ ] Update README.md with Supabase setup
- [ ] Update CHANGELOG.md with all changes
- [ ] ARCHITECTURE.md — update with current state
- [ ] DATA_BLUEPRINT.md — update schema docs
- [ ] DEPLOYMENT.md — update deployment steps

### 8.2 Analytics
- [ ] Move analytics tab to sidebar (not in ringkasan)
- [ ] Show comprehensive analytics: stock trends, maintenance costs, production volume
- [ ] Date range filters
- [ ] Export to CSV/Excel

## EXECUTION PLAN

Phase 0 ✅ → Phase 1 (P0) → Phase 2 (P1) → Phase 3 (P1) → Phase 4 (P2) → Phase 5 (P2) → Phase 6 (P1) → Phase 7 (P3) → Phase 8 (P3)

### Parallel Work Packages:
- **Agent A**: Phase 1.1 + Phase 3.1 + Phase 3.2 (CSS, Logo, Design)
- **Agent B**: Phase 1.2 + Phase 1.3 (Database CRUD for all modules)
- **Agent C**: Phase 2 (AI + Chatbot + Document AI)
- **Agent D**: Phase 3.3 + Phase 3.4 + Phase 3.5 (Visualization, Pages, Products)
- **Agent E**: Phase 4 + Phase 5 (Notifications, PWA, WhatsApp)
- **Agent F**: Phase 6 (Formulas, Excel Data Import)
