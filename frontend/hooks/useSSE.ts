'use client';
import * as React from 'react';

type UseSSEOptions<T> = {
  
  onMessage: (data: T) => void;
  
  onOpen?: () => void;
  
  onError?: (e: Event) => void;
  
  retryMs?: number;
};


export function useSSE<T = unknown>(url: string | null, opts: UseSSEOptions<T>) {
  const { onMessage, onOpen, onError, retryMs = 3000 } = opts;

  
  const urlRef = React.useRef<string | null>(url);
  const onMessageRef = React.useRef(onMessage);
  const onOpenRef = React.useRef(onOpen);
  const onErrorRef = React.useRef(onError);

  const timerRef = React.useRef<number | null>(null);
  const esRef = React.useRef<EventSource | null>(null);

  React.useEffect(() => {
    urlRef.current = url;
  }, [url]);
  React.useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  React.useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    if (!urlRef.current) return;

    let closed = false;
    let attempt = 0;

    const connect = () => {
      const currentUrl = urlRef.current;
      if (!currentUrl) return;

      const es = new EventSource(currentUrl);
      esRef.current = es;

      
      es.onopen = () => {
        attempt = 0; 
        
        Promise.resolve().then(() => {
          onOpenRef.current?.();
        });
      };

      es.onmessage = (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data) as T;
          onMessageRef.current(data);
        } catch {
          
        }
      };

      
      es.onerror = (e: Event) => {
        onErrorRef.current?.(e);
        if (closed) return;

        es.close();
        attempt += 1;
        const delay = Math.min(retryMs * attempt, 15000); 

        timerRef.current = window.setTimeout(() => {
          if (!closed) connect();
        }, delay);
      };
    };

    connect();

    
    return () => {
      closed = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      esRef.current?.close();
      esRef.current = null;
    };
    
  }, [retryMs, url]);
}
