'use client';
import * as React from 'react';
import { useParams } from 'next/navigation';
import { usePublicForm } from '@/hooks/usePublicForm';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Skeleton from '@/components/UI/Skeleton';
import RenderField from '@/components/FormRenderer/RenderField';

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const { schema, loading, answers, setAnswer, submit, errors, submitted } = usePublicForm(slug);

  // NEW: local submitting state
  const [submitting, setSubmitting] = React.useState(false);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-5 w-96" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    );
  }

  if (!schema) {
    return <div className="max-w-3xl mx-auto p-4">Form not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold">{schema.title}</h1>
      {schema.description && <p className="mt-1 text-gray-600">{schema.description}</p>}

      <Card className="mt-4">
        {submitted ? (
          <p className="text-green-700">Thanks! Your response has been recorded.</p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              try {
                await submit();
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {schema.fields.map((f) => (
              <RenderField
                key={f.id}
                field={f}
                value={answers.get(f.id)}
                error={errors[f.id]}
                onChange={(v) => setAnswer(f.id, v)}
              />
            ))}

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
