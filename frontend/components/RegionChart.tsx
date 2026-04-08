'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Region } from '@/lib/api';

const REGION_COLORS: Record<string, string> = {
    North: '#0ea5e9', South: '#818cf8', East: '#34d399',
    West: '#fbbf24', Central: '#2dd4bf',
};

export default function RegionChart({ data }: { data: Region[] }) {
    const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
    return (
        <div className="card" style={{ height: 320 }}>
            <div className="card-title">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)', display: 'inline-block' }} />
                Revenue by Region
            </div>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sorted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="region" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                    <Tooltip
                        formatter={(v: any, name: any) => [`₹${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name === 'revenue' ? 'Revenue' : name]}
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.85rem' }}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                        {sorted.map((r) => <Cell key={r.region} fill={REGION_COLORS[r.region] || '#0ea5e9'} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
