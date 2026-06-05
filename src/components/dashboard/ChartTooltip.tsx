import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

/**
 * Reusable chart tooltip component for Recharts.
 * Replaces inline `any`-typed tooltip components across dashboard modules.
 */
const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="backdrop-blur-xl bg-white/90 border border-slate-200/60 rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/[0.05]" role="tooltip">
      {label && <p className="text-slate-500 mb-1">{label}</p>}
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

export default ChartTooltip;
