# Dukaan AI Copilot

AI-native billing, inventory, udhaar, supplier, GST and business-advisor dashboard for Indian kirana stores and local retail shops.

[Live Demo](https://kirana-ai-dashboard.emergent.host)

## Overview

Dukaan AI Copilot is a mobile-first full-stack app built for Indian shop owners who run day-to-day operations through counter billing, notebooks, supplier calls and WhatsApp. It turns those scattered workflows into one simple operating system for local retail.

The app helps a shopkeeper create bills, track stock, manage customer udhaar, generate WhatsApp reminders, reorder from suppliers, estimate GST-ready reports and get Hinglish AI insights for daily business decisions.

## Problem

Most kirana stores and small retail shops still manage critical business information manually:

- Stock is tracked by memory or notebooks.
- Udhaar is written in diaries and recovered late.
- Supplier orders happen through unstructured phone calls or WhatsApp.
- Profit, slow-moving stock and low-margin items are hard to identify.
- Existing POS systems often feel too complex for small shop owners.

Dukaan AI Copilot focuses on the real Indian shop workflow instead of forcing a shopkeeper into a complicated enterprise system.

## Solution

The app works as a practical AI copilot for a single shop. It connects billing, stock, customers, suppliers and reporting so every business action updates the rest of the system.

Example:

1. The owner creates a bill.
2. Inventory reduces automatically.
3. If payment mode is udhaar, the customer ledger updates.
4. The dashboard reflects sales, profit and pending credit.
5. The AI advisor recommends what to reorder, whom to remind and what to fix today.

## Key Features

### Dashboard

- Today sales, profit, cash collected, inventory value and pending udhaar
- Low-stock, expiry and supplier-payment alerts
- "Aaj ka kaam" action list for daily priorities
- 7-day sales and profit trends with top product insights
- Hinglish AI business summary with rule-based fallback

### Fast Billing / POS

- Product search by name, SKU or category
- Quick-pick products and cart quantity controls
- Cash, UPI, card and udhaar payment modes
- Automatic inventory decrement after sale
- Udhaar sale automatically updates the customer ledger
- Receipt preview with print-friendly CSS
- Camera-based barcode scanner using `html5-qrcode`

### Inventory

- Product CRUD with SKU, category, prices, stock, supplier and expiry date
- Margin calculation, low-stock badges and movement status
- AI reorder suggestions based on current stock and recent sales
- Dead-stock write-off flow with loss tracking

### Udhaar Ledger

- Customer-wise pending credit tracking
- Partial and full payment recording
- Payment history support
- AI-style WhatsApp reminder templates in multiple tones
- `wa.me` deep links with prefilled Hinglish messages

### Suppliers

- Supplier directory with category and payment-due tracking
- Purchase order receiving flow that increases inventory
- Supplier payment recording
- WhatsApp reorder message generator for low-stock items

### Customers

- Customer CRM with tags like regular, high-value, udhaar and inactive
- Lifetime value and pending amount tracking
- WhatsApp-ready offer, thank-you and comeback messages

### AI Business Advisor

- Gemini 3 Flash powered business summary and Q&A through Emergent integrations
- Reorder suggestions from shop data
- Fallback insights when AI quota or configuration is unavailable
- Hinglish responses designed for non-technical shop owners

### Reports

- Revenue, profit, bill count and average bill value
- Payment-mode breakdown
- Top-selling, low-margin and slow-moving products
- CSV export
- GST Helper with estimated taxable sales, GST collected, purchase GST and net liability
- Weekly and monthly digest with best day, top products, margin and pending udhaar

### Settings

- Shop profile, owner details, phone, address and GST number
- Language preference and low-stock threshold
- Single-shop demo mode
- Multi-store and login/team access sections marked as coming soon

## Tech Stack

### Frontend

- React 19
- React Router 7
- Tailwind CSS
- Shadcn/Radix UI components
- Recharts
- Axios
- `html5-qrcode`

### Backend

- FastAPI
- MongoDB with Motor async driver
- Pydantic models
- Emergent LLM integration with Gemini 3 Flash
- Seed data for a realistic kirana store demo

## Architecture

```text
frontend/
  src/
    pages/          Dashboard, Billing, Inventory, Udhaar, Suppliers, Customers, Advisor, Reports, Settings
    components/     Layout, BarcodeScanner, UI components
    lib/api.js      Axios client and utility helpers

backend/
  server.py         FastAPI app, models, seed data and API routes
  requirements.txt  Python dependencies
```

The backend exposes all routes under `/api`. The frontend reads `REACT_APP_BACKEND_URL` and calls the backend through `frontend/src/lib/api.js`.

## API Highlights

- `GET /api/dashboard`
- `GET /api/products`
- `POST /api/products`
- `POST /api/products/{id}/writeoff`
- `GET /api/customers`
- `POST /api/sales`
- `POST /api/credit/payment`
- `GET /api/suppliers`
- `POST /api/purchase-orders`
- `GET /api/ai/summary`
- `POST /api/ai/ask`
- `GET /api/ai/reorder-suggestions`
- `POST /api/ai/reminder`
- `GET /api/reports/summary`
- `GET /api/reports/gst`
- `GET /api/reports/digest`

## Demo Data

On first startup, the backend seeds a realistic shop:

- 17 products including Amul Milk, Parle-G, Maggi, Tata Salt, Surf Excel, Aashirvaad Atta and Fortune Oil
- 7 customers with udhaar and lifetime-value data
- 4 suppliers including Amul Distributor, FMCG Wholesaler and Local Grain Mandi
- 18 sales across the last 7 days
- Low-stock, expiry, supplier due and pending-credit examples

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Harshit-jetwani07/Kirana-Ai-Copilot.git
cd Kirana-Ai-Copilot
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=kirana_ai_copilot
EMERGENT_LLM_KEY=your_emergent_llm_key
CORS_ORIGINS=*
```

Run the backend:

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend setup

```bash
cd frontend
yarn install
```

Create `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Run the frontend:

```bash
yarn start
```

Open `http://localhost:3000`.

## Suggested Demo Flow

1. Open the dashboard and show sales, profit, udhaar, low-stock items and "Aaj ka kaam".
2. Create a bill from Billing using products like Amul Milk, Maggi and Parle-G.
3. Select udhaar payment and show the customer ledger updating.
4. Generate a WhatsApp payment reminder from the Udhaar screen.
5. Open Inventory and show low-stock, reorder suggestions and dead-stock write-off.
6. Open Suppliers and generate a reorder message.
7. Open AI Advisor and ask for daily business advice.
8. Open Reports and show GST Helper plus weekly/monthly digest.

## Why It Matters

India's kirana stores are the backbone of local commerce, but many still lack simple AI-powered tools that match how they actually work. Dukaan AI Copilot brings AI into familiar workflows: billing, udhaar, suppliers, WhatsApp and GST-ready reporting.

It is not just a POS app. It is a business copilot that helps shopkeepers sell smarter, recover payments faster, reduce stockouts and make better daily decisions in simple Hinglish.

## Contest Pitch

Dukaan AI Copilot makes Indian local retail AI-native by combining billing, inventory, udhaar, supplier orders, GST-ready reports and Hinglish AI insights into one mobile-first app for kirana shopkeepers.

## Current Scope

This version is optimized for a polished contest demo:

- Single-shop mode
- Demo data included
- `wa.me` WhatsApp links instead of WhatsApp Business API auto-send
- GST estimates only, not real GST filing
- Multi-store auth shown as future-ready UI, not enabled

## License

This repository is currently intended for demo and contest submission use. Add a license before using it in production or open-source distribution.
