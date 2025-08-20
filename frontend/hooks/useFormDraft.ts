'use client';
import * as React from 'react';
import {
  Field,
  FieldType,
  FormSchema,
  TextField,
  MultipleField,
  CheckboxField,
  RatingField,
  Option,
} from '@/lib/types';

/* ---------------- helpers ---------------- */

function cid(): string {
  
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);
}

function base() {
  return {
    id: cid(),
    label: 'Untitled',
    required: false,
    helpText: undefined as string | undefined,
  };
}


function makeField(type: FieldType): Field {
  switch (type) {
    case 'text':
      return {
        ...base(),
        type: 'text',
        placeholder: '',
        pattern: undefined,
        minLength: undefined,
        maxLength: undefined,
      };
    case 'multiple':
      return {
        ...base(),
        type: 'multiple',
        options: [] as Option[],
        allowOther: false,
      };
    case 'checkbox':
      return {
        ...base(),
        type: 'checkbox',
        options: [] as Option[],
      };
    case 'rating':
      return {
        ...base(),
        type: 'rating',
        min: 1,
        max: 5,
        step: 1,
      };
  }
}


function coerceField(f: unknown): Field {
  const x = f as Partial<Field> & { type?: string };
  switch (x?.type) {
    case 'text': {
      const tf = x as Partial<TextField>;
      return {
        id: tf.id ?? cid(),
        type: 'text',
        label: tf.label ?? 'Untitled',
        required: !!tf.required,
        helpText: tf.helpText,
        placeholder: tf.placeholder ?? '',
        pattern: tf.pattern,
        minLength: tf.minLength,
        maxLength: tf.maxLength,
      };
    }
    case 'multiple': {
      const mf = x as Partial<MultipleField>;
      return {
        id: mf.id ?? cid(),
        type: 'multiple',
        label: mf.label ?? 'Untitled',
        required: !!mf.required,
        helpText: mf.helpText,
        options: Array.isArray(mf.options) ? mf.options : [],
        allowOther: !!mf.allowOther,
      };
    }
    case 'checkbox': {
      const cf = x as Partial<CheckboxField>;
      return {
        id: cf.id ?? cid(),
        type: 'checkbox',
        label: cf.label ?? 'Untitled',
        required: !!cf.required,
        helpText: cf.helpText,
        options: Array.isArray(cf.options) ? cf.options : [],
      };
    }
    case 'rating': {
      const rf = x as Partial<RatingField>;
      const min = Number.isInteger(rf.min) ? (rf.min as number) : 1;
      const max = Number.isInteger(rf.max) ? (rf.max as number) : 5;
      return {
        id: rf.id ?? cid(),
        type: 'rating',
        label: rf.label ?? 'Untitled',
        required: !!rf.required,
        helpText: rf.helpText,
        min,
        max,
        step: Number.isInteger(rf.step) ? (rf.step as number) : 1,
      };
    }
    default:
      
      return makeField('text');
  }
}


function mergeField(f: Field, patch: Partial<Field>): Field {
  switch (f.type) {
    case 'text': {
      const p = patch as Partial<TextField>;
      return {
        ...f,
        label: p.label ?? f.label,
        required: p.required ?? f.required,
        helpText: p.helpText ?? f.helpText,
        placeholder: p.placeholder ?? f.placeholder,
        pattern: p.pattern ?? f.pattern,
        minLength: p.minLength ?? f.minLength,
        maxLength: p.maxLength ?? f.maxLength,
      };
    }
    case 'multiple': {
      const p = patch as Partial<MultipleField>;
      return {
        ...f,
        label: p.label ?? f.label,
        required: p.required ?? f.required,
        helpText: p.helpText ?? f.helpText,
        options: p.options ?? f.options,
        allowOther: p.allowOther ?? f.allowOther,
      };
    }
    case 'checkbox': {
      const p = patch as Partial<CheckboxField>;
      return {
        ...f,
        label: p.label ?? f.label,
        required: p.required ?? f.required,
        helpText: p.helpText ?? f.helpText,
        options: p.options ?? f.options,
      };
    }
    case 'rating': {
      const p = patch as Partial<RatingField>;
      return {
        ...f,
        label: p.label ?? f.label,
        required: p.required ?? f.required,
        helpText: p.helpText ?? f.helpText,
        min: p.min ?? f.min,
        max: p.max ?? f.max,
        step: p.step ?? f.step,
      };
    }
  }
}

/* ---------------- reducer & hook ---------------- */

type DraftAction =
  | { type: 'seed'; payload: FormSchema }
  | { type: 'meta'; patch: Partial<Pick<FormSchema, 'title' | 'slug' | 'status' | 'description'>> }
  | { type: 'add'; fieldType: FieldType }
  | { type: 'update'; id: string; patch: Partial<Field> }
  | { type: 'remove'; id: string }
  | { type: 'reorder'; from: number; to: number };

function reducer(state: FormSchema, action: DraftAction): FormSchema {
  switch (action.type) {
    case 'seed': {
      const incoming = Array.isArray(action.payload.fields) ? action.payload.fields : [];
      
      const normalized = incoming.map(coerceField);
      return { ...action.payload, fields: normalized };
    }
    case 'meta':
      return { ...state, ...action.patch };
    case 'add':
      return { ...state, fields: [...state.fields, makeField(action.fieldType)] };
    case 'update':
      return {
        ...state,
        fields: state.fields.map((f) => (f.id === action.id ? mergeField(f, action.patch) : f)),
      };
    case 'remove':
      return { ...state, fields: state.fields.filter((f) => f.id !== action.id) };
    case 'reorder': {
      const arr = [...state.fields];
      const from = Math.max(0, Math.min(action.from, arr.length - 1));
      const to = Math.max(0, Math.min(action.to, arr.length - 1));
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { ...state, fields: arr };
    }
    default:
      return state;
  }
}

export function useFormDraft(initial?: FormSchema) {
  const [draft, dispatch] = React.useReducer(
    reducer,
    initial ?? { title: 'Untitled', status: 'draft', fields: [] }
  );

  const actions = React.useMemo(
    () => ({
      seed: (payload: FormSchema) => dispatch({ type: 'seed', payload }),
      meta: (
        patch: Partial<Pick<FormSchema, 'title' | 'slug' | 'status' | 'description'>>
      ) => dispatch({ type: 'meta', patch }),
      add: (fieldType: FieldType) => dispatch({ type: 'add', fieldType }),
      update: (id: string, patch: Partial<Field>) => dispatch({ type: 'update', id, patch }),
      remove: (id: string) => dispatch({ type: 'remove', id }),
      reorder: (from: number, to: number) => dispatch({ type: 'reorder', from, to }),
    }),
    []
  );

  return { draft, actions };
}
