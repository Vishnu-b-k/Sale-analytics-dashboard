# Sales Analytics Dashboard

**Live demo of a full-stack data analytics solution — Next.js + FastAPI + Pandas**

## Features
- 📊 **6 KPI cards** — Revenue, Orders, Profit, Margin, Return Rate, Top Category
- 📈 **Area chart** — Revenue & Profit trend (monthly/weekly)
- 📉 **Top Products** — Horizontal bar chart (top 10 by revenue)
- 🗺️ **Region chart** — Revenue breakdown by geographic region
- 🥧 **Category pie chart** — Revenue share by product category
- 🔍 **Smart Filters** — Date range, category, region (all charts update live)
- 📤 **CSV Upload** — Upload your own dataset; auto-detects columns
- 💡 **5 AI Improvement Insights** — Underperforming products, high return rate, regional gaps, seasonal dips, margin analysis
- 🌙 **Light/Dark theme** — Neon blue pastel design, persistent preference

## Quick Start

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
# → Runs on http://localhost:8000
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# → Runs on http://localhost:3000
```

## Deploy
- **Frontend** → [Vercel](https://vercel.com) (connect GitHub repo, set `NEXT_PUBLIC_API_URL`)
- **Backend** → [Render](https://render.com) (Python 3.12, start: `uvicorn main:app --host 0.0.0.0 --port 8000`)

## Resume Bullet
> Built a full-stack sales analytics dashboard (Next.js + FastAPI + Pandas) processing 5,000+ synthetic retail transactions with live KPI tracking, 4 interactive charts, smart filters, CSV upload, and AI-generated improvement recommendations — deployed on Vercel & Render.

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Recharts, Lucide |
| Backend | FastAPI, Pandas, NumPy |
| Deploy | Vercel (FE) + Render (BE) |
