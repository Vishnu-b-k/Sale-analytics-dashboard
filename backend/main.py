"""
Sales Analytics Dashboard — FastAPI Backend
Senior-grade implementation with synthetic dataset + full analytics endpoints
"""

from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import io
from datetime import datetime, timedelta
from typing import Optional, List

app = FastAPI(title="Sales Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Sample Data Generator ─────────────────────────────────────────────────────

def generate_sample_data() -> pd.DataFrame:
    np.random.seed(42)
    n = 5000

    products = [
        "Laptop Pro X1", "Wireless Mouse", "Mech Keyboard", "4K Monitor",
        "USB-C Hub", "Webcam HD Pro", "Noise-Cancel Headset", "SSD 1TB",
        "RTX Graphics Card", "Smart Speaker", "Standing Desk", "Ergonomic Chair"
    ]
    categories = {
        "Laptop Pro X1": "Computers", "Wireless Mouse": "Peripherals",
        "Mech Keyboard": "Peripherals", "4K Monitor": "Displays",
        "USB-C Hub": "Accessories", "Webcam HD Pro": "Peripherals",
        "Noise-Cancel Headset": "Audio", "SSD 1TB": "Storage",
        "RTX Graphics Card": "Computers", "Smart Speaker": "Audio",
        "Standing Desk": "Furniture", "Ergonomic Chair": "Furniture"
    }
    base_prices = {
        "Laptop Pro X1": 1299.99, "Wireless Mouse": 49.99,
        "Mech Keyboard": 129.99, "4K Monitor": 449.99,
        "USB-C Hub": 39.99, "Webcam HD Pro": 89.99,
        "Noise-Cancel Headset": 199.99, "SSD 1TB": 109.99,
        "RTX Graphics Card": 799.99, "Smart Speaker": 129.99,
        "Standing Desk": 349.99, "Ergonomic Chair": 499.99
    }
    sales_weights = {
        "Laptop Pro X1": 0.06, "Wireless Mouse": 0.14, "Mech Keyboard": 0.10,
        "4K Monitor": 0.08, "USB-C Hub": 0.14, "Webcam HD Pro": 0.10,
        "Noise-Cancel Headset": 0.08, "SSD 1TB": 0.12, "RTX Graphics Card": 0.04,
        "Smart Speaker": 0.08, "Standing Desk": 0.03, "Ergonomic Chair": 0.03
    }
    regions = ["North", "South", "East", "West", "Central"]
    region_multipliers = {"North": 1.15, "South": 0.85, "East": 1.05, "West": 0.95, "Central": 1.0}
    region_weights = [0.25, 0.15, 0.25, 0.20, 0.15]

    start_date = datetime(2024, 1, 1)
    all_dates = [start_date + timedelta(days=x) for x in range(365)]

    # Seasonal multipliers per month
    seasonal = {1: 0.85, 2: 0.80, 3: 0.90, 4: 0.95, 5: 0.95, 6: 0.90,
                7: 0.88, 8: 0.92, 9: 1.00, 10: 1.10, 11: 1.35, 12: 1.45}

    product_list = list(sales_weights.keys())
    product_probs = list(sales_weights.values())

    records = []
    for _ in range(n):
        product = np.random.choice(product_list, p=product_probs)
        date = np.random.choice(all_dates)
        month_mult = seasonal[date.month]
        region = np.random.choice(regions, p=region_weights)
        reg_mult = region_multipliers[region]
        qty = max(1, int(np.random.poisson(3) * month_mult))
        price = base_prices[product]
        discount = np.random.choice([0, 0.05, 0.10, 0.15], p=[0.60, 0.20, 0.12, 0.08])
        unit_price = round(price * (1 - discount) * reg_mult, 2)
        revenue = round(unit_price * qty, 2)
        cost = round(price * 0.55 * qty, 2)
        profit = round(revenue - cost, 2)
        is_returned = np.random.choice([0, 1], p=[0.88, 0.12])

        records.append({
            "date": date.strftime("%Y-%m-%d"),
            "month": date.strftime("%Y-%m"),
            "week": date.isocalendar()[1],
            "product": product,
            "category": categories[product],
            "region": region,
            "quantity": qty,
            "unit_price": unit_price,
            "discount_pct": discount * 100,
            "revenue": revenue,
            "cost": cost,
            "profit": profit,
            "returned": is_returned,
        })

    return pd.DataFrame(records)


_sample_df: pd.DataFrame = generate_sample_data()
_current_df: pd.DataFrame = _sample_df.copy()


def get_df(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
) -> pd.DataFrame:
    df = _current_df.copy()
    df["date"] = pd.to_datetime(df["date"])
    if start_date:
        df = df[df["date"] >= pd.to_datetime(start_date)]
    if end_date:
        df = df[df["date"] <= pd.to_datetime(end_date)]
    if category and category != "All":
        df = df[df["category"] == category]
    if region and region != "All":
        df = df[df["region"] == region]
    return df


# ─── Metadata ─────────────────────────────────────────────────────────────────

@app.get("/api/meta")
async def get_meta():
    df = _current_df.copy()
    categories = ["All"] + sorted(df["category"].unique().tolist())
    regions = ["All"] + sorted(df["region"].unique().tolist())
    date_min = df["date"].min()
    date_max = df["date"].max()
    return {
        "categories": categories,
        "regions": regions,
        "date_min": date_min,
        "date_max": date_max,
        "total_rows": len(df),
    }


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Smartly maps CSV columns to standard dashboard fields.
    """
    df = df.copy()
    cols = {c.lower().replace("_", "").replace(" ", ""): c for c in df.columns}

    mapping = {
        "revenue": ["revenue", "sales", "amount", "rev", "total", "turnover", "totalrevenue"],
        "product": ["product", "item", "name", "sku", "description", "productname"],
        "category": ["category", "group", "cat", "class", "productcategory"],
        "region": ["region", "area", "loc", "location", "territory", "city", "state"],
        "date": ["date", "time", "timestamp", "period", "day", "orderdate", "saledate"],
        "quantity": ["quantity", "qty", "count", "units", "items"],
        "profit": ["profit", "margin", "earnings", "netprice"],
        "returned": ["returned", "status", "cancel", "refund", "isreturned"]
    }

    found = {}
    for standard, synonyms in mapping.items():
        for syn in synonyms:
            if syn in cols:
                found[standard] = cols[syn]
                break

    # Apply mapping
    new_df = pd.DataFrame()
    for standard, original in found.items():
        new_df[standard] = df[original]

    # Defaults & Derived Columns
    if "date" in new_df.columns:
        new_df["date"] = pd.to_datetime(new_df["date"], errors="coerce")
    else:
        new_df["date"] = datetime.now()

    if "revenue" not in new_df.columns:
        # Try calculating from quantity * price if possible
        price_col = next((c for c in df.columns if "price" in c.lower()), None)
        if price_col and "quantity" in new_df.columns:
            new_df["revenue"] = new_df["quantity"] * df[price_col]
        else:
            new_df["revenue"] = 0.0

    if "profit" not in new_df.columns:
        new_df["profit"] = new_df["revenue"] * 0.45

    if "category" not in new_df.columns:
        new_df["category"] = "General"

    if "region" not in new_df.columns:
        new_df["region"] = "All Regions"

    if "product" not in new_df.columns:
        new_df["product"] = "Unknown Product"

    if "returned" not in new_df.columns:
        new_df["returned"] = 0

    return new_df


# ─── KPI Cards ────────────────────────────────────────────────────────────────

@app.get("/api/kpis")
async def get_kpis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
):
    df = get_df(start_date, end_date, category, region)
    if df.empty:
        return {"total_revenue": 0, "total_orders": 0, "avg_order_value": 0,
                "return_rate": 0, "total_profit": 0, "profit_margin": 0,
                "revenue_growth": 0, "top_category": "N/A"}

    total_revenue = float(df["revenue"].sum())
    total_orders = int(len(df))
    avg_order_value = float(df["revenue"].mean())
    return_rate = float(df["returned"].mean() * 100)
    total_profit = float(df["profit"].sum())
    profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

    # MoM growth using last 2 available months
    df["month"] = df["date"].dt.to_period("M")
    monthly = df.groupby("month")["revenue"].sum().sort_index()
    revenue_growth = 0.0
    if len(monthly) >= 2:
        last = float(monthly.iloc[-1])
        prev = float(monthly.iloc[-2])
        revenue_growth = ((last - prev) / prev * 100) if prev > 0 else 0.0

    top_category = df.groupby("category")["revenue"].sum().idxmax()

    return {
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "avg_order_value": round(avg_order_value, 2),
        "return_rate": round(return_rate, 2),
        "total_profit": round(total_profit, 2),
        "profit_margin": round(profit_margin, 2),
        "revenue_growth": round(revenue_growth, 2),
        "top_category": top_category,
    }


# ─── Revenue Trend ────────────────────────────────────────────────────────────

@app.get("/api/revenue-trend")
async def get_revenue_trend(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
    granularity: str = "monthly",
):
    df = get_df(start_date, end_date, category, region)
    if df.empty:
        return []

    if granularity == "weekly":
        df["period"] = df["date"].dt.to_period("W").apply(lambda x: str(x.start_time.date()))
    else:
        df["period"] = df["date"].dt.to_period("M").astype(str)

    trend = (
        df.groupby("period")
        .agg(revenue=("revenue", "sum"), profit=("profit", "sum"), orders=("revenue", "count"))
        .reset_index()
        .sort_values("period")
    )
    trend["revenue"] = trend["revenue"].round(2)
    trend["profit"] = trend["profit"].round(2)
    return trend.to_dict(orient="records")


# ─── Top Products ─────────────────────────────────────────────────────────────

@app.get("/api/top-products")
async def get_top_products(
    n: int = 10,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
):
    df = get_df(start_date, end_date, category, region)
    if df.empty:
        return []
    top = (
        df.groupby("product")
        .agg(revenue=("revenue", "sum"), orders=("revenue", "count"), profit=("profit", "sum"))
        .reset_index()
        .nlargest(n, "revenue")
    )
    top["revenue"] = top["revenue"].round(2)
    top["profit"] = top["profit"].round(2)
    return top.to_dict(orient="records")


# ─── Region Sales ─────────────────────────────────────────────────────────────

@app.get("/api/region-sales")
async def get_region_sales(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
):
    df = get_df(start_date, end_date, category, region)
    if df.empty:
        return []
    region_data = (
        df.groupby("region")
        .agg(revenue=("revenue", "sum"), orders=("revenue", "count"),
             profit=("profit", "sum"), return_rate=("returned", "mean"))
        .reset_index()
    )
    region_data["revenue"] = region_data["revenue"].round(2)
    region_data["profit"] = region_data["profit"].round(2)
    region_data["return_rate"] = (region_data["return_rate"] * 100).round(2)
    return region_data.to_dict(orient="records")


# ─── Category Breakdown ───────────────────────────────────────────────────────

@app.get("/api/category-breakdown")
async def get_category_breakdown(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    region: Optional[str] = None,
):
    df = get_df(start_date, end_date, None, region)
    if df.empty:
        return []
    cat = (
        df.groupby("category")
        .agg(revenue=("revenue", "sum"), orders=("revenue", "count"))
        .reset_index()
        .sort_values("revenue", ascending=False)
    )
    total = cat["revenue"].sum()
    cat["pct"] = (cat["revenue"] / total * 100).round(1)
    cat["revenue"] = cat["revenue"].round(2)
    return cat.to_dict(orient="records")


# ─── Areas of Improvement (AI Insights) ──────────────────────────────────────

@app.get("/api/improvements")
async def get_improvements(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
):
    df = get_df(start_date, end_date, category, region)
    if df.empty:
        return []

    insights = []

    # 1. Underperforming products
    prod_rev = df.groupby("product")["revenue"].sum().sort_values()
    threshold_pct = prod_rev.quantile(0.25)
    underperformers = prod_rev[prod_rev <= threshold_pct].index.tolist()[:3]
    total_rev = prod_rev.sum()
    low_rev_share = prod_rev[prod_rev <= threshold_pct].sum() / total_rev * 100
    insights.append({
        "type": "warning",
        "title": "Underperforming Products",
        "description": f"{', '.join(underperformers)} are in the bottom 25% by revenue, contributing only {low_rev_share:.1f}% of total sales. Consider bundling offers, targeted discounts, or re-evaluating stocking levels.",
        "impact": "High",
        "action": "Launch a 2-week flash sale bundling low-revenue items with best-sellers."
    })

    # 2. High return rate products
    prod_returns = df.groupby("product")["returned"].mean()
    avg_return = prod_returns.mean()
    std_return = prod_returns.std()
    high_return_prods = prod_returns[prod_returns > avg_return + 0.5 * std_return].index.tolist()[:2]
    if high_return_prods:
        avg_r_pct = prod_returns[high_return_prods].mean() * 100
        insights.append({
            "type": "danger",
            "title": "High Return Rate Alert",
            "description": f"{', '.join(high_return_prods)} show a {avg_r_pct:.1f}% return rate vs {avg_return*100:.1f}% overall average. High returns erode profitability and increase operational costs.",
            "impact": "High",
            "action": "Audit product descriptions, images and packaging. Add size/compatibility guides."
        })

    # 3. Regional growth opportunity
    region_rev = df.groupby("region")["revenue"].sum().sort_values()
    weakest_region = region_rev.index[0]
    strongest_region = region_rev.index[-1]
    gap = (region_rev[strongest_region] - region_rev[weakest_region]) / region_rev[strongest_region] * 100
    insights.append({
        "type": "info",
        "title": "Regional Revenue Gap",
        "description": f"The {weakest_region} region generates {gap:.0f}% less revenue than {strongest_region}. Targeted regional campaigns and local promotions could close this gap.",
        "impact": "Medium",
        "action": f"Run a region-specific campaign in {weakest_region} with 10% discount codes."
    })

    # 4. Seasonal opportunity
    df["month_num"] = df["date"].dt.month
    monthly_rev = df.groupby("month_num")["revenue"].sum()
    weakest_month = monthly_rev.idxmin()
    month_names = {1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",
                   7:"July",8:"August",9:"September",10:"October",11:"November",12:"December"}
    peak_month = monthly_rev.idxmax()
    seasonal_drop = (monthly_rev[peak_month] - monthly_rev[weakest_month]) / monthly_rev[peak_month] * 100
    insights.append({
        "type": "success",
        "title": "Seasonal Revenue Optimization",
        "description": f"{month_names[weakest_month]} shows {seasonal_drop:.0f}% lower revenue than your peak month ({month_names[peak_month]}). Proactive planning can smooth revenue dips.",
        "impact": "Medium",
        "action": f"Launch 'Off-Season Deals' campaign in {month_names[weakest_month]} with exclusive bundles."
    })

    # 5. Profit margin by category
    cat_margin = (df.groupby("category").apply(lambda x: (x["profit"].sum() / x["revenue"].sum() * 100))).sort_values()
    lowest_margin_cat = cat_margin.index[0]
    highest_margin_cat = cat_margin.index[-1]
    insights.append({
        "type": "info",
        "title": "Profit Margin Disparity",
        "description": f"{lowest_margin_cat} has the lowest profit margin ({cat_margin[lowest_margin_cat]:.1f}%) vs {highest_margin_cat} at {cat_margin[highest_margin_cat]:.1f}%. Shifting marketing focus to high-margin categories can boost profitability.",
        "impact": "Medium",
        "action": f"Increase ad spend on {highest_margin_cat} and review supplier costs for {lowest_margin_cat}."
    })

    return insights


# ─── Upload CSV ───────────────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    global _current_df
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        # Normalize and map columns flexibly
        df = normalize_dataframe(df)
        
        # Final validation
        if df["revenue"].sum() == 0 and len(df) > 0:
            return JSONResponse(
                status_code=422,
                content={"error": "Could not detect a 'revenue' or 'price' column. Please check your CSV."}
            )
            
        _current_df = df
        return {"message": "Dataset uploaded successfully", "rows": len(df), "columns": df.columns.tolist()}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@app.get("/api/reset")
async def reset_to_sample():
    global _current_df
    _current_df = _sample_df.copy()
    return {"message": "Reset to built-in sample dataset", "rows": len(_current_df)}


@app.get("/health")
async def health():
    return {"status": "ok", "rows_loaded": len(_current_df)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
