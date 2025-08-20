'use client';
import * as React from 'react';
import Card from '@/components/UI/Card';
import { FieldAnalytics } from '@/lib/types';

export default function OptionsBar({
  fields,
}: {
  fields: FieldAnalytics[];
}): React.ReactElement | null {
  const optionFields = fields.filter(
    (f) => f.type === 'multiple' || f.type === 'checkbox'
  ) as Extract<FieldAnalytics, { type: 'multiple' | 'checkbox' }>[];

  if (optionFields.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Option Distribution</h3>
      <div className="space-y-4">
        {optionFields.map((f) => (
          <StackedBar key={f.fieldId} label={f.fieldId} parts={f.distribution} />
        ))}
      </div>
    </Card>
  );
}

function StackedBar({
  label,
  parts,
}: {
  label: string;
  parts: { optionId: string; count: number }[];
}): React.ReactElement {
  const total = parts.reduce((s, p) => s + p.count, 0);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
        <span className="truncate">{label}</span>
        <span>{total} responses</span>
      </div>
      <div className="flex h-4 w-full overflow-hidden rounded-full border">
        {parts.map((p) => {
          const pct = total > 0 ? (p.count / total) * 100 : 0;
          return (
            <div
              key={p.optionId}
              className="h-full border-r last:border-r-0"
              style={{ width: `${pct}%` }}
              title={`${p.optionId}: ${p.count}`}
            />
          );
        })}
      </div>
      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-600">
        {parts.map((p) => (
          <span key={p.optionId} className="rounded border px-1.5 py-0.5">
            {p.optionId} · {p.count}
          </span>
        ))}
      </div>
    </div>
  );
}
