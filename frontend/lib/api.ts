const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store', ...init });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
}

export type KPIs = {
    total_revenue: number;
    total_orders: number;
    avg_order_value: number;
    return_rate: number;
    total_profit: number;
    profit_margin: number;
    revenue_growth: number;
    top_category: string;
};

export type TrendPoint = { period: string; revenue: number; profit: number; orders: number };
export type Product = { product: string; revenue: number; orders: number; profit: number };
export type Region = { region: string; revenue: number; orders: number; profit: number; return_rate: number };
export type Category = { category: string; revenue: number; orders: number; pct: number };
export type Improvement = { type: string; title: string; description: string; impact: string; action: string };
export type Meta = { categories: string[]; regions: string[]; date_min: string; date_max: string; total_rows: number };

function buildQuery(params: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v && v !== 'All') q.set(k, v); });
    const s = q.toString();
    return s ? `?${s}` : '';
}

export const api = {
    getMeta: () => fetcher<Meta>('/api/meta'),
    getKPIs: (p: Record<string, string | undefined>) => fetcher<KPIs>(`/api/kpis${buildQuery(p)}`),
    getTrend: (p: Record<string, string | undefined>) => fetcher<TrendPoint[]>(`/api/revenue-trend${buildQuery(p)}`),
    getTopProducts: (n = 10, p: Record<string, string | undefined> = {}) =>
        fetcher<Product[]>(`/api/top-products?n=${n}${buildQuery(p) ? '&' + buildQuery(p).slice(1) : ''}`),
    getRegions: (p: Record<string, string | undefined>) => fetcher<Region[]>(`/api/region-sales${buildQuery(p)}`),
    getCategories: (p: Record<string, string | undefined>) => fetcher<Category[]>(`/api/category-breakdown${buildQuery(p)}`),
    getImprovements: (p: Record<string, string | undefined>) => fetcher<Improvement[]>(`/api/improvements${buildQuery(p)}`),
    reset: () => fetcher<{ message: string; rows: number }>('/api/reset'),
};
