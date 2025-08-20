'use client';
import * as React from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';

type Props = {
  title?: string;
  children: React.ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
  onDelete?: () => void;
};

export default function FieldCard({
  title,
  children,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
  onDelete,
}: Props) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex flex-col">
          <button
            aria-label="Move up"
            onClick={onMoveUp}
            disabled={disableUp}
            className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
          >
            ↑
          </button>
          <button
            aria-label="Move down"
            onClick={onMoveDown}
            disabled={disableDown}
            className="mt-1 rounded-md border px-2 py-1 text-xs disabled:opacity-40"
          >
            ↓
          </button>
        </div>

        <div className="flex-1 space-y-3">
          {title && <h3 className="text-sm font-semibold text-gray-800">{title}</h3>}
          {children}
        </div>

        {onDelete && (
          <div>
            <Button variant="danger" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
