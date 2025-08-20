import {
  Answer,
  CheckboxField,
  Field,
  MultipleField,
  RatingField,
  TextField,
} from './types';

/** Validate the form schema */
export function validateSchema(fields: Field[]): string[] {
  const errs: string[] = [];

  fields.forEach((f) => {
    if (!f.label?.trim()) errs.push(`${f.id}: label required`);

    if (f.type === 'multiple' || f.type === 'checkbox') {
      const opts = (f as MultipleField | CheckboxField).options;
      if (!Array.isArray(opts) || opts.length === 0) {
        errs.push(`${f.id}: options required`);
      } else {
        for (const o of opts) {
          if (!o?.label?.trim() || !o?.value?.trim()) {
            errs.push(`${f.id}: option label/value required`);
            break;
          }
        }
      }
    }

    if (f.type === 'rating') {
      const { min, max } = f as RatingField;
      const valid =
        Number.isInteger(min) &&
        Number.isInteger(max) &&
        min < max;
      if (!valid) errs.push(`${f.id}: rating requires integer min < max`);
    }
  });

  return errs;
}

/** Validate end-user answers before submit. */
export function validateAnswers(
  fields: Field[],
  answers: Answer[],
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};
  const valueById = new Map<string, string | string[] | number | undefined>(
    answers.map((a) => [a.fieldId, a.value as string | string[] | number | undefined]),
  );

  fields.forEach((f) => {
    const v = valueById.get(f.id);

    
    if (f.required && (v === undefined || (Array.isArray(v) ? v.length === 0 : v === ''))) {
      errors[f.id] = 'Required';
      return;
    }


    if (f.type === 'text' && v != null) {
      const tf = f as TextField;
      const s = String(v).trim();
      if (tf.minLength && s.length < tf.minLength) errors[f.id] = `Min ${tf.minLength} chars`;
      if (tf.maxLength && s.length > tf.maxLength) errors[f.id] = `Max ${tf.maxLength} chars`;
      if (tf.pattern) {
        try {
          const re = new RegExp(tf.pattern);
          if (!re.test(s)) errors[f.id] = 'Invalid format';
        } catch {
          
        }
      }
    }

    if ((f.type === 'multiple' || f.type === 'checkbox') && v != null) {
      const ids = new Set(Array.isArray(v) ? v : [v]);
      const opts = (f as MultipleField | CheckboxField).options || [];
      const hasValid = opts.some((o) => ids.has(o.value) || ids.has(o.id));
      if (!hasValid) errors[f.id] = 'Choose a valid option';
    }

    if (f.type === 'rating' && v != null) {
      const { min, max } = f as RatingField;
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isInteger(n) || n < min || n > max) {
        errors[f.id] = `Choose ${min}–${max}`;
      }
    }
  });

  return errors;
}
