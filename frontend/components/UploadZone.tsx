'use client';
import { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface UploadZoneProps {
    onUpload: (file: File) => Promise<void>;
    onReset: () => Promise<void>;
    isUploaded: boolean;
    fileName?: string;
}

export default function UploadZone({ onUpload, onReset, isUploaded, fileName }: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);

    const handle = async (file: File) => {
        if (!file.name.endsWith('.csv')) return alert('Please upload a CSV file.');
        setLoading(true);
        await onUpload(file);
        setLoading(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handle(f);
    };

    if (isUploaded) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
                <FileText size={16} style={{ color: 'var(--accent-green)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1 }}>{fileName || 'Custom dataset active'}</span>
                <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={onReset}>
                    <X size={13} /> Reset
                </button>
            </div>
        );
    }

    return (
        <div
            className={`upload-zone ${dragging ? 'drag-over' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer' }}
        >
            <div className="upload-icon-wrap" style={{ width: 42, height: 42, flexShrink: 0 }}>
                {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : <Upload size={20} />}
            </div>
            <div>
                <div className="upload-title" style={{ fontSize: '0.9rem', marginBottom: 2 }}>Upload your own CSV dataset</div>
                <div className="upload-sub">Drag & drop or click — must include a &lsquo;revenue&rsquo; column</div>
            </div>
            <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ''; }} />
        </div>
    );
}
