'use client';
import { useState, useEffect, useCallback } from 'react';
import { BarChart2, RefreshCw, Database, Activity } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import KPIGrid from '@/components/KPIGrid';
import RevenueChart from '@/components/RevenueChart';
import TopProductsChart from '@/components/TopProductsChart';
import RegionChart from '@/components/RegionChart';
import CategoryChart from '@/components/CategoryChart';
import ImprovementsPanel from '@/components/ImprovementsPanel';
import UploadZone from '@/components/UploadZone';
import { api, type KPIs, type TrendPoint, type Product, type Region, type Category, type Improvement, type Meta } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DEFAULT_KPI: KPIs = {
  total_revenue: 0, total_orders: 0, avg_order_value: 0,
  return_rate: 0, total_profit: 0, profit_margin: 0,
  revenue_growth: 0, top_category: '—',
};

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs>(DEFAULT_KPI);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState('');

  // Filter state
  const [category, setCategory] = useState('All');
  const [region, setRegion] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const p = { category, region, start_date: startDate || undefined, end_date: endDate || undefined } as Record<string, string | undefined>;
    try {
      const [k, t, pr, re, ca, im] = await Promise.all([
        api.getKPIs(p),
        api.getTrend(p),
        api.getTopProducts(10, p),
        api.getRegions(p),
        api.getCategories(p),
        api.getImprovements(p),
      ]);
      setKpis(k); setTrend(t); setProducts(pr); setRegions(re); setCategories(ca); setImprovements(im);
    } catch {
      showToast('Backend unreachable. Start the FastAPI server.', false);
    } finally {
      setLoading(false);
    }
  }, [category, region, startDate, endDate]);

  useEffect(() => {
    setMounted(true);
    api.getMeta().then(setMeta).catch(() => { });
    fetchAll();
  }, [fetchAll]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) { showToast(data.error, false); return; }
      setIsUploaded(true);
      setFileName(file.name);
      showToast(`Dataset uploaded: ${data.rows} rows`);
      fetchAll();
    } catch {
      showToast('Upload failed', false);
    }
  };

  const handleReset = async () => {
    await api.reset();
    setIsUploaded(false);
    setFileName('');
    showToast('Reset to sample dataset');
    fetchAll();
  };

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">
              <BarChart2 size={18} color="white" />
            </div>
            <span className="logo-text">Data<span>Insight</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="status-dot" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {mounted && meta ? `${(meta.total_rows || 0).toLocaleString()} records` : mounted ? 'No records' : 'Loading…'}
            </span>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={fetchAll} title="Refresh data" style={{ padding: '8px 12px' }}>
              <RefreshCw size={15} className={loading ? 'pulse' : ''} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Page Body ───────────────────────────────────────────────────── */}
      <main className="page-wrap">
        {/* Hero */}
        <div className="page-hero">
          <h1 className="page-title">Sales Analytics Dashboard</h1>
          <p className="page-subtitle">
            Real-time insights from {meta?.total_rows?.toLocaleString() || '—'} transactions · {meta?.date_min || '—'} to {meta?.date_max || '—'}
          </p>
        </div>

        {/* Upload */}
        <div style={{ marginBottom: 20 }}>
          <UploadZone onUpload={handleUpload} onReset={handleReset} isUploaded={isUploaded} fileName={fileName} />
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <span className="filter-label">Filters</span>
          <div className="filter-divider" />
          <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
            {(meta?.categories || ['All']).map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="filter-select" value={region} onChange={e => setRegion(e.target.value)}>
            {(meta?.regions || ['All']).map(r => <option key={r}>{r}</option>)}
          </select>
          <div className="filter-divider" />
          <input type="date" className="filter-input" value={startDate}
            onChange={e => setStartDate(e.target.value)} placeholder="Start date" style={{ minWidth: 140 }} />
          <input type="date" className="filter-input" value={endDate}
            onChange={e => setEndDate(e.target.value)} placeholder="End date" style={{ minWidth: 140 }} />
          <div className="filter-divider" />
          <button className="btn btn-secondary" onClick={() => { setCategory('All'); setRegion('All'); setStartDate(''); setEndDate(''); }}>
            Clear
          </button>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="loading-state" style={{ height: 140 }}>
            <div className="spinner" />
            <span>Loading analytics…</span>
          </div>
        ) : <KPIGrid data={kpis} />}

        {/* Revenue trend + Top products */}
        <div className="charts-grid">
          <RevenueChart data={trend} />
          <TopProductsChart data={products} />
        </div>

        {/* Region + Category */}
        <div className="charts-grid">
          <RegionChart data={regions} />
          <CategoryChart data={categories} />
        </div>

        {/* AI Improvements */}
        <div className="card" style={{ marginBottom: 0 }}>
          <ImprovementsPanel data={improvements} />
        </div>
      </main>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && (
        <div className="toast" style={{ borderColor: toast.ok ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          <Activity size={16} style={{ color: toast.ok ? 'var(--accent-green)' : 'var(--accent-red)' }} />
          {toast.msg}
        </div>
      )}
    </>
  );
}
