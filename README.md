# Dukaan AI Copilot

**AI Copilot for India's Kirana Stores** — a mobile-first SaaS-style app for kirana, general stores, pharmacies, stationery shops and local traders. Manage billing, stock, udhaar, suppliers, GST-ready reports and WhatsApp reminders — all from one simple app.

---

## Highlights

- **Landing page** at `/` — hero, real problem statements, features, workflow strip, social proof, final CTA. Two entry paths: `Create My Shop` (primary) and `Open Demo Store` (secondary).
- **Onboarding** at `/onboarding` — 2-step wizard: shop details → **Empty Shop** vs **Sample Data** (Popular).
- **Multi-shop backend** (no auth) via `X-Shop-Id` header + `shop_id` field on every record. Full data isolation between demo and every user shop.
- **Demo mode** loads seeded `Sharma General Store` (17 products, 7 customers, 4 suppliers, 7 days of sales). Shows an amber `Demo` badge and a top banner reminding users to create their own shop.
- **My Shop mode** — real user-created data, `My Shop` badge, empty-state setup checklist.
- **AI Business Advisor** powered by Gemini 3 Flash (Emergent LLM Key) — Hinglish insights with graceful rule-based fallback.
- **WhatsApp deep-link integration** for udhaar reminders, supplier reorders and customer offers.
- **GST Helper** — monthly/quarterly GST estimate report with CSV export.
- **Weekly / Monthly Digest** with best-day, top products, profit margin.
- **Language toggle** (Hinglish / हिंदी / English) — live UI language switch.

## Modules

- Dashboard (with "Aaj ka Workflow" 4-step visualiser)
- Fast Billing / POS (search, quick picks, barcode scan, receipt print)
- Inventory (low-stock/expiry alerts, dead-stock write-off, AI reorder)
- Udhaar Ledger (4-tone WhatsApp reminders, payment recording)
- Suppliers (WhatsApp reorder message from low-stock, payment recording)
- Customers CRM (tags, offer/thank/comeback WhatsApp templates)
- AI Advisor (chat with quick prompts, reorder suggestions)
- Reports (Summary + GST + Digest tabs, CSV export)
- Settings (shop profile, language, sample import, demo reset, multi-store coming soon)

## Architecture

- **Backend**: FastAPI + MongoDB, single `server.py`. All routes prefixed with `/api`.
  - `shops` collection stores shop profiles; `products`, `customers`, `suppliers`, `sales`, `credit_payments`, `purchase_orders`, `write_offs`, `supplier_payments` collections all keyed by `shop_id`.
  - Every endpoint uses `Depends(shop_id_dep)` to filter by the `X-Shop-Id` header.
  - Startup routine (`ensure_demo_shop`) creates the `demo` shop and seeds it once.
- **Frontend**: React 19 + Tailwind + Shadcn/UI + Recharts + Framer-free CSS animations.
  - `axios` interceptor injects `X-Shop-Id` from `localStorage` on every request.
  - Route guard `RequireShop` redirects unauthenticated visits to `/`.
  - `LangProvider` supplies `t(key)` across the app.
- **AI**: `emergentintegrations` LLM wrapper → `gemini-3-flash-preview`. Empty shops get a helpful onboarding message; API errors fall back to rule-based Hinglish summaries.

## Key Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/shops` | Create a new shop (with optional `seed_samples`) |
| `POST /api/shops/{id}/import-samples` | Import kirana samples into an empty shop |
| `POST /api/shops/demo/reset` | Wipe & reseed the demo shop |
| `GET /api/settings` / `PUT /api/settings` | Read/update current shop profile |
| `GET /api/dashboard` | KPIs, trend, top products, Aaj-ka-kaam |
| `GET /api/ai/summary` | Hinglish daily summary |
| `POST /api/ai/ask` | Free-form business questions |
| `GET /api/reports/gst?days=30&rate=5` | GST-ready estimate |
| `GET /api/reports/digest?period=week\|month` | Digest report |

## Local Development

Services are supervisor-managed:
```
sudo supervisorctl restart backend   # FastAPI on :8001
sudo supervisorctl restart frontend  # React on :3000
```

Environment:
- `backend/.env` — `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `EMERGENT_LLM_KEY`
- `frontend/.env` — `REACT_APP_BACKEND_URL`

## Tech Stack

React 19 · FastAPI · MongoDB · Tailwind CSS · Shadcn/UI · Recharts · Fraunces & Manrope fonts · Gemini 3 Flash · Emergent LLM Key
