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
