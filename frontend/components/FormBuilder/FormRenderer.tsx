'use client';
import * as React from 'react';
import { Field, TextField, MultipleField, CheckboxField, RatingField } from '@/lib/types';
import Input from '@/components/UI/Input';

type Props = {
  field: Field;
  value: string | string[] | number | undefined;
  error?: string;
  onChange: (value: string | string[] | number) => void;
};

export default function RenderField({ field, value, error, onChange }: Props) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-900">
        {field.label} {field.required ? <span className="text-red-600">*</span> : null}
      </label>
      {field.helpText && <p className="mb-2 text-xs text-gray-600">{field.helpText}</p>}

      {field.type === 'text' && <TextInput field={field} value={(value as string) ?? ''} error={error} onChange={onChange} />}

      {field.type === 'multiple' && (
        <MultipleInput field={field} value={(value as string) ?? ''} error={error} onChange={onChange} />
      )}

      {field.type === 'checkbox' && (
        <CheckboxInput field={field} value={Array.isArray(value) ? (value as string[]) : []} error={error} onChange={onChange} />
      )}

      {field.type === 'rating' && (
        <RatingInput field={field} value={typeof value === 'number' ? (value as number) : (field.min ?? 1)} error={error} onChange={onChange} />
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ---- per-type controls ---- */

function TextInput({ field, value, error, onChange }: { field: TextField; value: string; error?: string; onChange: (v: string) => void }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={field.placeholder ?? ''}
      error={error}
    />
  );
}

function MultipleInput({
  field,
  value,
  error,
  onChange,
}: {
  field: MultipleField;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {field.options.map((o) => (
        <label key={o.id} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            className="h-4 w-4"
            name={field.id}
            value={o.value}
            checked={value === o.value || value === o.id}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function CheckboxInput({
  field,
  value,
  error,
  onChange,
}: {
  field: CheckboxField;
  value: string[];
  error?: string;
  onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) => {
  const set = new Set(value);
  if (set.has(val)) {
    set.delete(val);
  } else {
    set.add(val);
  }
  onChange(Array.from(set));
};
  return (
    <div className="space-y-2">
      {field.options.map((o) => (
        <label key={o.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            value={o.value}
            checked={value.includes(o.value) || value.includes(o.id)}
            onChange={() => toggle(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function RatingInput({
  field,
  value,
  error,
  onChange,
}: {
  field: RatingField;
  value: number;
  error?: string;
  onChange: (v: number) => void;
}) {
  const min = field.min ?? 1;
  const max = field.max ?? 5;
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={field.step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
      <span className="text-sm text-gray-700">{value}</span>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
