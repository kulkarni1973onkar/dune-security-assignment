import { AnalyticsSnapshot, FormResponse, FormSchema } from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE as string;
if (!BASE) {
  
  
  console.warn('NEXT_PUBLIC_API_BASE is not set. Add it to .env.local');
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'omit',
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} at ${path} ${text ? `- ${text}` : ''}`);
  }
  
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return undefined as unknown as T;
  return (await res.json()) as T;
}

export const api = {
  /* ------------------------- Forms CRUD ------------------------- */
  createForm: (body: FormSchema) =>
    http<FormSchema>('/forms', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getForms: () => http<FormSchema[]>('/forms'),

  getForm: (id: string) => http<FormSchema>(`/forms/${id}`),

  updateForm: (id: string, body: Partial<FormSchema>) =>
    http<FormSchema>(`/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  publishForm: (id: string) =>
    http<FormSchema>(`/forms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'published' }),
    }),

  /* -------------------- Public form & responses -------------------- */
  getPublicForm: (slug: string) => http<FormSchema>(`/forms/public/${slug}`),

  submitResponse: (id: string, body: FormResponse) =>
    http<{ ok: true }>(`/forms/${id}/responses`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /* -------------------------- Analytics --------------------------- */
  getAnalytics: (id: string) => http<AnalyticsSnapshot>(`/forms/${id}/analytics`),


};
