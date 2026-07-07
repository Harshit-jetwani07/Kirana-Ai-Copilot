# Dukaan AI Copilot - PRD

## Original Problem
Mobile-first web app for Indian kirana stores. Manages billing, inventory, profit, credit/udhaar, supplier payments, customer reminders, and daily AI business insights in Hinglish.

## User Personas
- Indian shop owner (kirana / general store / pharmacy)
- Uses phone + WhatsApp primarily; low tech literacy
- Wants Hindi/Hinglish labels and quick actions

## Architecture
- Backend: FastAPI + MongoDB (single server.py, /api prefix)
- Frontend: React 19 + Tailwind + Shadcn UI + Recharts
- AI: Gemini 3 Flash via emergentintegrations + Emergent LLM key (rule-based fallback when budget exhausted)
- No auth (single-shop demo)

## Implemented (Feb 2026)
- Dashboard: today's sales/profit/inventory/udhaar/supplier stats, Aaj ka kaam, AI Hinglish summary, 7-day charts, top products, payment modes
- Fast Billing/POS: search, quick picks, cart, discount/tax, 4 payment modes, auto-udhaar-ledger, receipt dialog, stock auto-decrement
- Inventory: CRUD, low-stock badges, movement badges, AI reorder suggestions, margin %
- Udhaar Ledger: pending amounts, WhatsApp reminders (4 tones), payment recording
- Suppliers: list, add, WhatsApp reorder message (auto-generated from low-stock), payment tracking
- Customers: CRM with tags, WhatsApp offer/thank/combo/comeback messages
- AI Advisor: business summary, reorder suggestions, chat with quick prompts
- Reports: revenue/profit/bills, top selling, low margin, slow moving, payment modes, CSV export
- Settings: shop profile, language toggle, low-stock threshold
- Demo seed data: 17 products, 7 customers, 4 suppliers, 18 sales over 7 days

## P1 Backlog
- Print-friendly receipt via CSS print media
- Barcode scanner (camera-based) for Billing
- Multi-shop / user auth
- Dead-stock write-off flow
- Weekly / monthly email digest

## P2 Backlog
- WhatsApp Business API auto-send (currently uses wa.me link)
- GST filing helper
- SMS reminders fallback

## Feb 2026 - Enhancements Round 2

### P1 Delivered
- Barcode camera scanner in Billing (html5-qrcode) with SKU/name auto-add to cart
- Print-friendly receipt (@media print CSS, print-receipt class, no-print on buttons/dialog chrome)
- Dead-stock write-off flow in Inventory (POST /api/products/{id}/writeoff records loss to write_offs collection, sets stock=0, movement=dead)
- Weekly/Monthly Digest inside Reports (GET /api/reports/digest?period=week|month) with best day, top 3 products, profit margin, pending udhaar

### P2 Delivered (contest-safe)
- GST Helper tab in Reports (GET /api/reports/gst?days=&rate=) with total_sales, taxable_sales, net_sales, gst_collected, purchase_gst, net_gst_liability, per-mode breakdown, and CSV export. Non-filing disclaimer shown.
- Multi-Store Manager + Login & Team Access sections in Settings — disabled, "Coming Soon" badges, single-shop demo mode preserved

### Not Done (by design)
- WhatsApp Business API auto-send (kept as wa.me deep links)
- SMS fallback

## Feb 2026 - Enhancements Round 3 (Production Feel)
- **Welcome / first-run screen** at /welcome — App name "Dukaan AI Copilot", tagline, Demo card (Sharma Kirana Store with real stats ₹1,065 / ₹139 / ₹4,340 / 7 customers) with "Open Demo Store" CTA, Live card "Apni Dukaan Banao" with "Create My Shop" CTA.
- **Shop Setup form** — shop_name, owner_name, phone, city/address, business_type dropdown, GST optional, language. Saves via PUT /api/settings, then routes to dashboard. Persistence via localStorage flags dukaan_onboarded + dukaan_mode.
- **Rich production header** (sticky, glass-morphism backdrop-blur): shop name from settings, DEMO badge (when mode=demo), Saved / Syncing sync indicator with green/amber dot, notifications bell with red count badge, popover listing Aaj ka kaam (low-stock/udhaar/supplier/expiry) polling every 45s, owner-initials avatar (blue gradient).
- **Aaj ka Workflow section** on Dashboard: 4-step visual card (Billing → Inventory Update → Udhaar Reminder → Supplier Reorder). Steps show green (done) / blue (active) / slate (idle) state with metrics ("10 bills aaj", "7 low stock", "4 customers", "₹20,500 due"). Each step routes to the relevant page.
- **Switch Shop** action in sidebar clears localStorage and returns to /welcome.
- **Business type** added to ShopSettings model in backend.

## Feb 2026 - Major Refactor: Multi-Shop SaaS Product

### Architecture Change
- **Multi-shop backend** via `X-Shop-Id` header (no auth, localStorage-based). Every collection (products, customers, suppliers, sales, credit_payments, purchase_orders, write_offs, supplier_payments) now has `shop_id`. All CRUD & analytics endpoints filter by shop_id via `Depends(shop_id_dep)`.
- New `shops` collection stores shop profile (name, owner, phone, address, GST, business_type, language, mode).
- Demo shop has fixed id `"demo"` (auto-seeded on startup). Live shops get UUIDs.
- Existing data migrated to `shop_id="demo"` via startup routine.

### Frontend
- `/` = **Landing page**: hero + product mockup, problem section (6 cards), features (9 cards), workflow strip (6 steps), social proof (dark card with metrics), final CTA. Sticky top-nav with Start Free / View Demo.
- `/onboarding` = 2-step **shop setup wizard** (details → empty vs sample data choice with "Popular" badge on samples).
- `/dashboard` etc. protected by `RequireShop` — redirects to `/` if no shop_id in localStorage.
- Landing → "View Demo" sets shop_id=demo, mode=demo.
- Landing → "Start Free" → onboarding → creates shop via POST /api/shops with optional seed_samples flag.
- Layout header: `Demo` (amber) vs `My Shop` (green) badge based on mode.
- **Empty state Dashboard**: Getting Started hero + 4 CTA cards (Create first product, first bill, first customer, add supplier) + Import Sample Data fallback.
- Settings adds `Import Kirana Sample Data` button (live shops only, empty-only) and `Reset Demo Data` button (demo shop only).
- api.js: axios interceptor injects `X-Shop-Id` header from localStorage on every request.

### Endpoints Added
- POST /api/shops — create shop (with optional seed)
- GET /api/shops/{id}
- PUT /api/shops/{id}
- POST /api/shops/{id}/import-samples
- POST /api/shops/demo/reset
- All existing endpoints now scoped by X-Shop-Id header.

### Verified
- Demo shop preserved (17 products, 23 sales), new shops isolated, sample import works (empty → 17 products/7 customers/4 suppliers/18 sales), product creation works, dashboard counts correct.

## Feb 2026 - Final Polish (Contest Submission)

### Visual Theme Overhaul (Premium)
- **Palette**: warm cream (#FBF7F0) background, deep indigo (#312E81 → #1E1B4B) primary, saffron (#EA580C) accent, emerald success. Distinctive Indian SMB feel — not generic blue-SaaS-slop.
- **Typography**: **Fraunces** (chunky editorial serif) for display headings + **Manrope** for body + IBM Plex Mono for numerics. Italic Fraunces used on accent words ("India's", "real dard", "complete", "digital").
- Dot-grid backdrop on landing hero. Grain texture (SVG noise) on premium dark surfaces. Custom orange arrows in workflow strip.
- Bulk migration of all `bg-blue-*`/`text-blue-*` classes across every page to the new palette via a Python sed sweep.

### First-run polish
- Browser title: `Dukaan AI Copilot | AI POS for Kirana Stores`. Rich meta description + OG tags.
- Landing CTAs: Primary `Create My Shop`, Secondary `Open Demo Store` (swapped as requested).
- Product-preview mockup on landing shows Sales, Low Stock, Udhaar Reminder (with WhatsApp CTA), AI Advice card — all in one glance.

### Demo & My Shop Distinction
- **Demo mode banner** (orange gradient strip below header): "You're viewing sample data. Create your own shop to use real data." with Create My Shop link that clears localStorage first.
- **My Shop mode** shows green `My Shop` badge, no banner, no "Demo" wording anywhere.

### Empty Setup Checklist (5 items)
- Add first product / Create first bill / Add first customer / Add supplier / **Import sample products (optional)** — the 5th is featured with saffron accent.

### Language Toggle (functional)
- `LangProvider` context + `useLang()` hook + labels dict for Hinglish / हिंदी / English covering greetings, KPI labels, workflow, notifications, sync indicator.
- Settings save emits `dukaan-lang-changed` window event → Layout re-reads settings → UI updates live.

### Supplier Payments
- Pay button now always visible on supplier cards (shows `Pay ₹XXX` when due > 0, `Record Payment` when 0). Both open the amount dialog.

### README
- Rewrote README.md with landing/onboarding flow, shop_id architecture, demo vs live mode, sample import.
