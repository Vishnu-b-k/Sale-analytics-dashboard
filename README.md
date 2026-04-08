# 🚀 DataInsight — Enterprise Sales Analytics Platform

![Project Banner](https://raw.githubusercontent.com/Vishnu-b-k/Sale-analytics-dashboard/main/assets/hero.png)

**DataInsight** is a professional-grade, full-stack analytics solution designed for high-velocity retail environments. Built with **Next.js 14** and **FastAPI**, it transforms raw CSV transactions into actionable, AI-driven business intelligence.

---

## 🌟 Key Features

### 🇮🇳 Indian Market Localization
Fully localized for the Indian financial context, featuring **Rupee (₹) symbol** integration across all KPI cards, chart formatters, and AI insight reports.

### 🧠 Smart CSV Detection & Mapping
The backend features a robust "Fuzzy Column Matcher." Upload any sales CSV, and the system intelligently maps columns like `"Sales"`, `"Total Amount"`, `"Territory"`, or `"Item Name"` to the correct internal analytics schema—no manual renaming required.

### 💡 AI-Driven Business Insights
Beyond raw numbers, the platform generates 5 critical "Areas of Improvement":
- **Underperforming Products**: Bottom 25% revenue analysis.
- **High Return Alerts**: Automatic detection of product quality issues.
- **Regional Gap Analysis**: Performance benchmarking across territories.
- **Peak Season Optimization**: Seasonal trend identification.
- **Margin Disparity**: Profitability audits per category.

### 📈 Full-Spectrum Visualization
- **KPI Command Center**: 6 real-time metrics with trend indicators.
- **Multi-Dimension Charts**: 4 interactive Recharts (Area, Bar, Pie) with smart filtering by Date, Category, and Region.

---

## 🛠️ Technical Stack

- **Backend** (Render): 
    - Create a **Web Service**.
    - Set **Root Directory** to `backend`.
    - Build Command: `pip install -r requirements.txt`
    - Start Command: `uvicorn main:app --host 0.0.0.0 --port 10000`
- **Frontend** (Vercel): 
    - Set **Root Directory** to `frontend`.
    - Set Environment Variable `NEXT_PUBLIC_API_URL` to your Render URL.

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://127.0.0.1:8000` with automatic 127.0.0.1 binding for stable Windows loopback.*

### 2. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 📁 Project Structure

```text
├── backend/
│   ├── main.py              # Analytics engine & Smart CSV logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── app/                 # Next.js App Router & Global Styles
│   ├── components/          # Reusable Chart & UI Components
│   └── lib/                 # API interaction layer
└── README.md                # Documentation
```

---

## 📈 High-Impact Metrics
- **Performance**: Handles 5,000+ retail records with <100ms API response time.
- **Intelligence**: 8 analytics endpoints providing deep-dive data granularity.
- **Accuracy**: Automated numeric validation and date normalization.

---

## 📄 License & Author
Built as a production-grade portfolio project by **Vishnu**. Feel free to use this as a reference or template for enterprise data applications!
