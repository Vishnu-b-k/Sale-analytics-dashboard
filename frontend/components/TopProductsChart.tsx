'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Product } from '@/lib/api';

const COLORS = [
    '#0ea5e9', '#38bdf8', '#00d4ff', '#818cf8', '#a5b4fc',
    '#34d399', '#6ee7b7', '#fbbf24', '#f87171', '#2dd4bf'
];

export default function TopProductsChart({ data }: { data: Product[] }) {
    const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
    return (
        <div className="card" style={{ height: 340 }}>
            <div className="card-title">
                <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)', boxShadow: '0 0 8px var(--accent-purple)', display: 'inline-block' }} />
                Top Products by Revenue
            </div>
            <ResponsiveContainer width="100%" height={270}>
                <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                    <YAxis dataKey="product" type="category" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                        axisLine={false} tickLine={false} width={110} />
                    <Tooltip
                        formatter={(v: any) => [`₹${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Revenue']}
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.85rem' }}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                        {sorted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
