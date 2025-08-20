'use client';
import * as React from 'react';
import Card from '@/components/UI/Card';

export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}): React.ReactElement {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
      </div>
      {hint ? <div className="text-xs text-gray-500">{hint}</div> : null}
    </Card>
  );
}
