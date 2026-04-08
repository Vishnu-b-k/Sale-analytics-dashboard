'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Category } from '@/lib/api';

const COLORS = ['#0ea5e9', '#818cf8', '#34d399', '#fbbf24', '#2dd4bf', '#f87171'];

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }: any) => {
    if (pct < 5) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
            {`${pct}%`}
        </text>
    );
};

export default function CategoryChart({ data }: { data: Category[] }) {
    return (
        <div className="card" style={{ height: 320 }}>
            <div className="card-title">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-amber)', boxShadow: '0 0 8px var(--accent-amber)', display: 'inline-block' }} />
                Revenue by Category
            </div>
            <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="revenue"
                        nameKey="category" labelLine={false} label={renderCustomLabel}>
                        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                        formatter={(v: any) => [`₹${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Revenue']}
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.85rem' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
