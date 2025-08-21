import { AnalyticsSnapshot, FormResponse, FormSchema } from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE as string;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY as string | undefined;

if (!BASE) {
  console.warn('NEXT_PUBLIC_API_BASE is not set. Add it in Vercel env (and .env.local for dev).');
}


function adminHeaders(): Record<string, string> {
  return API_KEY ? { 'x-api-key': API_KEY } : {};
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'omit',
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} at ${path}${text ? ` - ${text}` : ''}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    
    return undefined as unknown as T;
  }
  return (await res.json()) as T;
}

export const api = {
  /* ------------------------- Forms (admin) ------------------------- */
  createForm: (body: FormSchema) =>
    http<FormSchema>('/forms', {
      method: 'POST',
      headers: { ...adminHeaders() },
      body: JSON.stringify(body),
    }),

  getForms: () =>
    http<FormSchema[]>('/forms', {
      headers: { ...adminHeaders() },
    }),

  getForm: (id: string) =>
    http<FormSchema>(`/forms/${id}`, {
      headers: { ...adminHeaders() },
    }),

  updateForm: (id: string, body: Partial<FormSchema>) =>
    http<FormSchema>(`/forms/${id}`, {
      method: 'PATCH',
      headers: { ...adminHeaders() },
      body: JSON.stringify(body),
    }),

  deleteForm: (id: string) =>
    http<{ ok: true }>(`/forms/${id}`, {
      method: 'DELETE',
      headers: { ...adminHeaders() },
    }),

  
  publishForm: (id: string, slug?: string) =>
    http<FormSchema>(`/forms/${id}`, {
      method: 'PATCH',
      headers: { ...adminHeaders() },
      body: JSON.stringify(slug ? { status: 'published', slug } : { status: 'published' }),
    }),

  /* -------------------- Public form & responses -------------------- */
  
  getPublicForm: (slug: string) => http<FormSchema>(`/public/forms/${slug}`),

  submitResponse: (id: string, body: FormResponse) =>
    http<{ ok: true }>(`/forms/${id}/responses`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /* -------------------------- Analytics --------------------------- */
  getAnalytics: (id: string) => http<AnalyticsSnapshot>(`/forms/${id}/analytics`),


  streamAnalyticsUrl: (id: string) => `${BASE}/forms/${id}/analytics/stream`,
};
