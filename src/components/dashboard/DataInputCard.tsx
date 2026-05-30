// ============================================================
// DataInputCard — Shared data input confirmation component
// Used by FloatingChatBot and AiAssistantPanel
// ============================================================

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const MODULE_LABELS: Record<string, string> = {
  'spare-parts': 'Spare Parts',
  production: 'Produksi',
  maintenance: 'Maintenance',
  'team-activity': 'Tim & Aktivitas',
  safety: 'Safety / HSE',
  finance: 'Keuangan',
  hr: 'HR & Payroll',
};

interface DataInputCardProps {
  module: string;
  action?: string;
  data: Record<string, unknown>;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DataInputCard({
  module,
  action,
  data,
  onConfirm,
  onCancel,
}: DataInputCardProps) {
  return (
    <div className="mt-2 rounded-xl border border-amber-200/50 bg-amber-50/80 p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={16} className="text-amber-600" />
        <span className="text-amber-700 font-semibold text-sm">Konfirmasi Input Data</span>
      </div>
      <p className="text-xs text-amber-700 mb-2">
        AI ingin melakukan: <strong>{action || 'create'}</strong> pada modul <strong>{MODULE_LABELS[module] || module}</strong> dengan data:
      </p>
      <div className="space-y-1 text-xs text-slate-600 mb-3">
        {Object.entries(data).slice(0, 8).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-slate-500">{key}:</span>
            <span className="text-slate-700 font-medium">{String(value ?? '-')}</span>
          </div>
        ))}
        {Object.keys(data).length > 8 && (
          <div className="text-slate-400 text-center">...dan {Object.keys(data).length - 8} field lainnya</div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 py-1.5 rounded-lg bg-emerald-100/80 text-emerald-600 text-xs font-medium hover:bg-emerald-500/30 transition-all"
        >
          <CheckCircle2 size={12} className="inline mr-1" />
          Konfirmasi
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg bg-red-50/80 text-red-500 text-xs font-medium hover:bg-red-100/80 transition-all"
        >
          <XCircle size={12} className="inline mr-1" />
          Batal
        </button>
      </div>
    </div>
  );
}
