'use client';
import * as React from 'react';
import { Field, MultipleField } from '@/lib/types';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Switch from '@/components/UI/Switch';

export default function MultipleEditor({
  field,
  onUpdate,
}: {
  field: MultipleField;
  onUpdate: (id: string, patch: Partial<Field>) => void;
}) {
  return (
    <div className="grid gap-3">
      <OptionsEditor
        options={field.options}
        onChange={(opts) => onUpdate(field.id, { options: opts })}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Allow “Other”</span>
        <Switch
          checked={!!field.allowOther}
          onChange={(v) => onUpdate(field.id, { allowOther: v })}
        />
      </div>
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: Array<{ id: string; label: string; value: string }>;
  onChange: (opts: Array<{ id: string; label: string; value: string }>) => void;
}) {
  const add = () => {
    const id = Math.random().toString(36).slice(2, 9);
    onChange([...(options ?? []), { id, label: 'Option', value: id }]);
  };
  const update = (id: string, patch: Partial<{ label: string; value: string }>) =>
    onChange(options.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const remove = (id: string) => onChange(options.filter((o) => o.id !== id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">Options</span>
        <Button size="sm" onClick={add}>
          Add option
        </Button>
      </div>
      {options.length === 0 ? (
        <div className="text-sm text-gray-500">No options yet.</div>
      ) : (
        <div className="space-y-2">
          {options.map((o) => (
            <div key={o.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <Input
                label="Label"
                value={o.label}
                onChange={(e) => update(o.id, { label: e.currentTarget.value })}
              />
              <Input
                label="Value"
                value={o.value}
                onChange={(e) => update(o.id, { value: e.currentTarget.value })}
              />
              <Button variant="danger" size="sm" onClick={() => remove(o.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
