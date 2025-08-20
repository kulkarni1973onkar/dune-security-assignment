'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useFormDraft } from '@/hooks/useFormDraft';
import BuilderShell from '@/components/FormBuilder/BuilderShell';
import { api } from '@/lib/api';
import { trimAll } from '@/lib/sanitize';
import Card from '@/components/UI/Card';

export default function NewFormPage() {
  const router = useRouter();
  const { draft, actions } = useFormDraft();

  const onSave = async () => {
    const created = await api.createForm(trimAll({ ...draft, status: 'draft' }));
    if (created?._id) router.push(`/forms/${created._id}`);
  };

  const onPublish = async () => {
    // First create then publish if needed
    const created = await api.createForm(trimAll({ ...draft, status: 'draft' }));
    if (!created?._id) return;
    const pub = await api.publishForm(created._id);
    router.push(`/forms/${pub._id}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="mb-4 text-2xl font-semibold">Create form</h1>
      <Card className="mb-4 text-sm text-gray-600">Build your form on the left and add fields from the right palette.</Card>
      <BuilderShell
        draft={draft}
        onMeta={actions.meta}
        onAdd={actions.add}
        onUpdate={actions.update}
        onRemove={actions.remove}
        onReorder={actions.reorder}
        onSave={onSave}
        onPublish={onPublish}
      />
    </div>
  );
}
