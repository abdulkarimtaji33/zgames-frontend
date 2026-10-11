'use client';

import { X } from 'lucide-react';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

/** Compact "from / to" date-range pair for a DataTable's filter row. Values are plain `YYYY-MM-DD` strings. */
export function DateRangeFilter({ from, to, onFromChange, onToChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        aria-label="From date"
        max={to || undefined}
        className="rounded-lg bg-background-tertiary border border-border px-2.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
      />
      <span className="text-foreground-subtle text-xs">to</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        aria-label="To date"
        min={from || undefined}
        className="rounded-lg bg-background-tertiary border border-border px-2.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
      />
      {(from || to) && (
        <button
          onClick={() => { onFromChange(''); onToChange(''); }}
          aria-label="Clear date range"
          className="p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
