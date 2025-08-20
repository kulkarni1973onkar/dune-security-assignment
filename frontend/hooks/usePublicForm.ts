'use client';
import * as React from 'react';
import { api } from '@/lib/api';
import { Answer, Field, FormResponse, FormSchema } from '@/lib/types';
import { validateAnswers } from '@/lib/validators';

type AnswersMap = Map<string, string | string[] | number>;

export function usePublicForm(slug: string) {
  const [schema, setSchema] = React.useState<FormSchema | null>(null);
  const [answers, setAnswers] = React.useState<AnswersMap>(new Map());
  const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getPublicForm(slug)
      .then((s) => {
        if (!mounted) return;
        setSchema(s);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug]);

  const setAnswer = React.useCallback((fieldId: string, value: string | string[] | number) => {
    setAnswers((m) => {
      const next = new Map(m);
      next.set(fieldId, value);
      return next;
    });
  }, []);

  
  const fieldTypeById = React.useMemo(() => {
    const map = new Map<string, 'text' | 'multiple' | 'checkbox' | 'rating'>();
    if (schema?.fields) {
      for (const f of schema.fields) map.set(f.id, f.type);
    }
    return map;
  }, [schema]);

  const asArray = React.useMemo<Answer[]>(() => {
    const arr: Answer[] = [];
    for (const [fieldId, raw] of answers.entries()) {
      const t = fieldTypeById.get(fieldId);
      if (t === 'rating') {
        const n = typeof raw === 'number' ? raw : Number(raw);
        arr.push({ fieldId, value: n });
      } else if (t === 'checkbox') {
        const list = Array.isArray(raw) ? raw.map(String) : [String(raw)];
        arr.push({ fieldId, value: list });
      } else if (t === 'multiple' || t === 'text') {
        arr.push({ fieldId, value: String(raw ?? '') });
      } else {
        
        arr.push({ fieldId, value: String(raw ?? '') });
      }
    }
    return arr;
  }, [answers, fieldTypeById]);

  async function submit() {
    if (!schema?._id) return;
    const errMap = validateAnswers(schema.fields, asArray);
    setErrors(errMap);
    const hasErrors = Object.values(errMap).some(Boolean);
    if (hasErrors) return;

    const body: FormResponse = { formId: schema._id, answers: asArray };
    await api.submitResponse(schema._id, body);
    setSubmitted(true);
  }

  return {
    schema,
    loading,
    answers,
    setAnswer,
    submit,
    errors,
    submitted,
  };
}


export function getField(schema: FormSchema | null, id: string): Field | undefined {
  return schema?.fields.find((f) => f.id === id);
}
