'use client';
import * as React from 'react';
import { useParams } from 'next/navigation';
import { useFormDraft } from '@/hooks/useFormDraft';
import { api } from '@/lib/api';
import BuilderShell from '@/components/FormBuilder/BuilderShell';
import Card from '@/components/UI/Card';
import Skeleton from '@/components/UI/Skeleton';
import { trimAll } from '@/lib/sanitize';
import { useToast } from '@/hooks/useToast';

export default function EditFormPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const { push } = useToast();
  const { draft, actions } = useFormDraft();
  const [loading, setLoading] = React.useState(true);

  // Load form
  React.useEffect(() => {
    let mounted = true;
    api
      .getForm(id)
      .then((form) => {
        if (mounted && form) actions.seed(form);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, actions]);

  const onSave = async () => {
    try {
      await api.updateForm(id, trimAll(draft));
      push('success', 'Saved');
    } catch {
      push('error', 'Save failed');
    }
  };

  const onPublish = async () => {
    try {
      const pub = await api.publishForm(id);
      if (pub.slug) {
        actions.meta({ status: 'published', slug: pub.slug });
        push('success', 'Published');
      } else {
        push('error', 'Publish failed');
      }
    } catch {
      push('error', 'Publish failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="mb-4 text-2xl font-semibold">Edit form</h1>
      {draft.slug && draft.status === 'published' && (
        <Card className="mb-4 text-sm">
          Public link:{' '}
          <a className="text-blue-600 underline" href={`/public/${draft.slug}`} target="_blank">
            /public/{draft.slug}
          </a>
        </Card>
      )}

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
