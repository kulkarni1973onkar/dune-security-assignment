'use client';
import * as React from 'react';

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}
