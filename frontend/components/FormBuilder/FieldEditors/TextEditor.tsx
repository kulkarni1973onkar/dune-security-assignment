'use client';
import React from 'react';

type TextEditorProps = {
  label: string;
  min?: number;
  max?: number;
  required?: boolean;
  onChange: (updated: { label: string; min?: number; max?: number; required: boolean }) => void;
};

export default function TextEditor({ label, min, max, required, onChange }: TextEditorProps) {
  const updateLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ label: e.target.value, min, max, required: required ?? false });
  };

  return (
    <div className="space-y-2">
      <input
        className="border rounded p-2 w-full"
        value={label}
        onChange={updateLabel}
        placeholder="Text question"
      />
      <div className="flex gap-2">
        <input
          type="number"
          className="border p-1 w-20"
          value={min ?? ''}
          onChange={(e) => onChange({ label, min: Number(e.target.value), max, required: required ?? false })}
          placeholder="Min"
        />
        <input
          type="number"
          className="border p-1 w-20"
          value={max ?? ''}
          onChange={(e) => onChange({ label, min, max: Number(e.target.value), required: required ?? false })}
          placeholder="Max"
        />
      </div>
      <label className="flex items-center space-x-2">
        <input type="checkbox" checked={required} onChange={() => onChange({ label, min, max, required: !required })} />
        <span>Required</span>
      </label>
    </div>
  );
}
