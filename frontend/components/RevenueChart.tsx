'use client';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import type { TrendPoint } from '@/lib/api';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '12px 16px', boxShadow: 'var(--shadow-hover)'
        }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ fontSize: '0.875rem', color: p.color, fontWeight: 600, marginBottom: 4 }}>
                    {p.name}: {p.dataKey === 'orders' ? p.value : `₹${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                </p>
            ))}
        </div>
    );
};

export default function RevenueChart({ data }: { data: TrendPoint[] }) {
    return (
        <div className="card" style={{ height: 340 }}>
            <div className="card-title">
                <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-neon)', boxShadow: '0 0 8px var(--accent-neon)', display: 'inline-block' }} />
                Revenue & Profit Trend
            </div>
            <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--accent)" strokeWidth={2.5}
                        fill="url(#gradRevenue)" dot={false} activeDot={{ r: 5, fill: 'var(--accent)' }} />
                    <Area type="monotone" dataKey="profit" name="Profit" stroke="var(--accent-green)" strokeWidth={2}
                        fill="url(#gradProfit)" dot={false} activeDot={{ r: 4, fill: 'var(--accent-green)' }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
