'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  children: React.ReactNode;
  isBusy?: boolean;
}

/** Sticky bar shown above a DataTable when one or more rows are selected. */
export function BulkActionBar({ count, onClear, children, isBusy }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="sticky top-0 z-[3] flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 mb-3 animate-fade-in">
      <span className="text-sm font-medium text-accent whitespace-nowrap">
        {count} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <Button
        variant="ghost"
        size="xs"
        onClick={onClear}
        disabled={isBusy}
        className="ml-auto"
      >
        <X className="h-3.5 w-3.5" /> Clear
      </Button>
    </div>
  );
}
