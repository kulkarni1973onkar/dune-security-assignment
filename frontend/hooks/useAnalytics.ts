'use client';
import * as React from 'react';
import { api } from '@/lib/api';
import { AnalyticsSnapshot, FieldAnalytics } from '@/lib/types';
import { useSSE } from './useSSE';

type Status = 'idle' | 'live' | 'reconnecting';

const BASE = process.env.NEXT_PUBLIC_API_BASE as string;

export function useAnalytics(formId: string) {
  const [snapshot, setSnapshot] = React.useState<AnalyticsSnapshot | null>(null);
  const [status, setStatus] = React.useState<Status>('idle');

  
  React.useEffect(() => {
    let mounted = true;
    setStatus('idle');
    setSnapshot(null);
    api
      .getAnalytics(formId)
      .then((snap) => {
        if (!mounted) return;
        setSnapshot(snap);
      })
      .catch(() => {
    
      });
    return () => {
      mounted = false;
    };
  }, [formId]);

  
  useSSE<{ totalResponses?: number; fields?: FieldAnalytics[] }>(
    snapshot ? `${BASE}/analytics/stream/${formId}` : null,
    {
      onOpen: () => setStatus('live'),
      onMessage: (delta) => {
        
        setSnapshot((prev) => {
          if (!prev) return prev; 
          return {
            ...prev,
            totalResponses:
              typeof delta.totalResponses === 'number'
                ? delta.totalResponses
                : prev.totalResponses,
            fields: delta.fields ? mergeFields(prev.fields, delta.fields) : prev.fields,
            updatedAt: new Date().toISOString(),
          };
        });
      },
      onError: () => setStatus('reconnecting'),
      retryMs: 4000,
    }
  );

  return { snapshot, status };
}


function mergeFields(prev: FieldAnalytics[], deltas: FieldAnalytics[]): FieldAnalytics[] {
  const map = new Map<string, FieldAnalytics>();
  for (const f of prev) map.set(key(f), f);
  for (const d of deltas) map.set(key(d), d);
  return Array.from(map.values());
}

function key(f: FieldAnalytics): string {
  return `${f.fieldId}|${f.type}`;
}
