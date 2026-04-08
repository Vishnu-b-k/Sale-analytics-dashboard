'use client';
import { Lightbulb, AlertTriangle, Info, CheckCircle, ArrowRight } from 'lucide-react';
import type { Improvement } from '@/lib/api';

const iconsMap: Record<string, React.ReactNode> = {
    warning: <AlertTriangle size={16} />,
    danger: <AlertTriangle size={16} />,
    info: <Info size={16} />,
    success: <CheckCircle size={16} />,
};

export default function ImprovementsPanel({ data }: { data: Improvement[] }) {
    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">
                    <span className="dot" />
                    <Lightbulb size={16} style={{ color: 'var(--accent-amber)' }} />
                    AI-Powered Improvement Insights
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                    {data.length} recommendations
                </span>
            </div>
            <div className="improvements-grid">
                {data.map((item, i) => (
                    <div key={i} className={`insight-card ${item.type}`}>
                        <div className="insight-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    color: item.type === 'warning' ? 'var(--accent-amber)'
                                        : item.type === 'danger' ? 'var(--accent-red)'
                                            : item.type === 'success' ? 'var(--accent-green)'
                                                : 'var(--accent)'
                                }}>
                                    {iconsMap[item.type]}
                                </span>
                                <span className="insight-title">{item.title}</span>
                            </div>
                            <span className={`impact-badge ${item.impact}`}>{item.impact}</span>
                        </div>
                        <p className="insight-desc">{item.description}</p>
                        <div className="insight-action">
                            <ArrowRight size={13} />
                            {item.action}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
