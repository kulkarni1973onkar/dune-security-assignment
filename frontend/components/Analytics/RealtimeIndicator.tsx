'use client';
import * as React from 'react';

export default function RealtimeIndicator({ state }: { state: 'idle' | 'live' | 'reconnecting' }): React.ReactElement {
  const color =
    state === 'live' ? 'bg-green-500' : state === 'reconnecting' ? 'bg-amber-500' : 'bg-gray-400';
  const label = state === 'live' ? 'Live' : state === 'reconnecting' ? 'Reconnecting…' : 'Idle';

  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
      <span className={`h-2 w-2 animate-pulse rounded-full ${color}`} />
      <span className="text-gray-700">{label}</span>
    </div>
  );
}
