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
