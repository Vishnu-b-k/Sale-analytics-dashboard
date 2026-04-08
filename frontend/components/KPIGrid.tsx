'use client';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, Target, RotateCcw, BarChart2, Percent, Award } from 'lucide-react';
import type { KPIs } from '@/lib/api';

function fmt(n: number, type: 'currency' | 'number' | 'percent' = 'currency'): string {
    if (type === 'currency') {
        if (n >= 1000000) return `₹${(n / 1000000).toFixed(2)}M`;
        if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
        return `₹${n.toFixed(2)}`;
    }
    if (type === 'number') {
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
        return n.toString();
    }
    return `${n.toFixed(1)}%`;
}

interface KPICardProps {
    label: string;
    value: string;
    badge?: { text: string; type: 'positive' | 'negative' | 'neutral' };
    color: 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'teal';
    Icon: React.ComponentType<{ size?: number }>;
}

function KPICard({ label, value, badge, color, Icon }: KPICardProps) {
    return (
        <div className={`kpi-card ${color}`}>
            <div className={`kpi-icon ${color}`}><Icon size={18} /></div>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
            {badge && (
                <span className={`kpi-badge ${badge.type}`}>
                    {badge.type === 'positive' ? <TrendingUp size={11} /> : badge.type === 'negative' ? <TrendingDown size={11} /> : <Minus size={11} />}
                    {badge.text}
                </span>
            )}
        </div>
    );
}

export default function KPIGrid({ data }: { data: KPIs }) {
    const growthPos = data.revenue_growth >= 0;
    return (
        <div className="kpi-grid">
            <KPICard
                label="Total Revenue" value={fmt(data.total_revenue)} color="blue" Icon={DollarSign}
                badge={{ text: `${growthPos ? '+' : ''}${data.revenue_growth.toFixed(1)}% MoM`, type: growthPos ? 'positive' : 'negative' }}
            />
            <KPICard label="Total Orders" value={fmt(data.total_orders, 'number')} color="purple" Icon={ShoppingCart}
                badge={{ text: 'All time', type: 'neutral' }}
            />
            <KPICard label="Avg Order Value" value={fmt(data.avg_order_value)} color="teal" Icon={Target}
                badge={{ text: 'Per transaction', type: 'neutral' }}
            />
            <KPICard label="Total Profit" value={fmt(data.total_profit)} color="green" Icon={BarChart2}
                badge={{ text: `${data.profit_margin.toFixed(1)}% margin`, type: data.profit_margin > 30 ? 'positive' : 'neutral' }}
            />
            <KPICard label="Return Rate" value={fmt(data.return_rate, 'percent')} color="red" Icon={RotateCcw}
                badge={{ text: data.return_rate < 15 ? 'Healthy' : 'High', type: data.return_rate < 15 ? 'positive' : 'negative' }}
            />
            <KPICard label="Top Category" value={data.top_category} color="amber" Icon={Award}
                badge={{ text: 'By revenue', type: 'positive' }}
            />
        </div>
    );
}
