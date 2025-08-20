'use client';
import * as React from 'react';
import { Field, RatingField } from '@/lib/types';
import Input from '@/components/UI/Input';

export default function RatingEditor({
  field,
  onUpdate,
}: {
  field: RatingField;
  onUpdate: (id: string, patch: Partial<Field>) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Input
        label="Min"
        type="number"
        value={field.min}
        onChange={(e) => onUpdate(field.id, { min: Number(e.currentTarget.value || 0) })}
      />
      <Input
        label="Max"
        type="number"
        value={field.max}
        onChange={(e) => onUpdate(field.id, { max: Number(e.currentTarget.value || 0) })}
      />
      <Input
        label="Step"
        type="number"
        value={field.step ?? 1}
        onChange={(e) => onUpdate(field.id, { step: Number(e.currentTarget.value || 1) })}
      />
    </div>
  );
}
