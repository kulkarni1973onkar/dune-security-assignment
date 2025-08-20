'use client';
import * as React from 'react';
import { useParams } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';
import Skeleton from '@/components/UI/Skeleton';
import StatCard from '@/components/Analytics/StatCard';
import RatingsChart from '@/components/Analytics/RatingsChart';
import OptionsBar from '@/components/Analytics/OptionsBar';
import RealtimeIndicator from '@/components/Analytics/RealtimeIndicator';

export default function AnalyticsPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const { snapshot, status } = useAnalytics(id);

  if (!snapshot) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <RealtimeIndicator state={status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total responses"
          value={snapshot.totalResponses}
          hint={`Updated ${new Date(snapshot.updatedAt).toLocaleTimeString()}`}
        />
      </div>

      <RatingsChart fields={snapshot.fields} />
      <OptionsBar fields={snapshot.fields} />
    </div>
  );
}
