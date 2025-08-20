'use client';
import * as React from 'react';

type ToastMsg = {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
};

const ToastCtx = React.createContext<{
  msgs: ToastMsg[];
  push: (type: ToastMsg['type'], text: string, ms?: number) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msgs, setMsgs] = React.useState<ToastMsg[]>([]);

  const push = React.useCallback((type: ToastMsg['type'], text: string, ms = 3000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setMsgs((prev) => [...prev, { id, type, text }]);
    window.setTimeout(() => {
      setMsgs((prev) => prev.filter((m) => m.id !== id));
    }, ms);
  }, []);

  return <ToastCtx.Provider value={{ msgs, push }}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) {
    
    return {
      msgs: [] as ToastMsg[],
      
      push: () => {},
    };
  }
  return ctx;
}
