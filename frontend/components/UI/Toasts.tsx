'use client';
import * as React from 'react';
import { useToast } from '@/hooks/useToast';

export default function Toasts() {
  const { msgs } = useToast();

  if (!msgs.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {msgs.map((m) => (
        <div
          key={m.id}
          role="status"
          className={`rounded-xl px-3 py-2 text-sm shadow-md ${
            m.type === 'success'
              ? 'bg-green-600 text-white'
              : m.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-white'
          }`}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}
