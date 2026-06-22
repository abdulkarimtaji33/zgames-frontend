'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  type?: 'checkbox' | 'radio';
}

interface FilterSidebarProps {
  filters: FilterGroup[];
  selected: Record<string, string[]>;
  onChange: (key: string, values: string[]) => void;
  onClearAll: () => void;
  className?: string;
  priceRange?: { min: number; max: number };
  onPriceChange?: (min: number, max: number) => void;
}

function FilterAccordion({ group, selected, onChange }: { group: FilterGroup; selected: string[]; onChange: (values: string[]) => void }) {
  const [open, setOpen] = useState(true);
  const toggle = (value: string) => {
    if (group.type === 'radio') {
      onChange(selected.includes(value) ? [] : [value]);
    } else {
      onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    }
  };

  return (
    <div className="border-b border-border py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-foreground"
      >
        <span className="flex items-center gap-1.5">
          {group.label}
          {selected.length > 0 && (
            <span className="h-4 w-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
              {selected.length}
            </span>
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-foreground-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-2 space-y-1.5">
          {group.options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type={group.type === 'radio' ? 'radio' : 'checkbox'}
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-3.5 w-3.5 rounded border-border accent-accent cursor-pointer"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors flex-1">{opt.label}</span>
              {opt.count !== undefined && (
                <span className="text-xs text-foreground-subtle">{opt.count}</span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterSidebar({ filters, selected, onChange, onClearAll, className }: FilterSidebarProps) {
  const totalActive = Object.values(selected).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold">Filters</h3>
        {totalActive > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            <X className="h-3 w-3" /> Clear all ({totalActive})
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {totalActive > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(selected).flatMap(([key, values]) =>
            values.map((val) => (
              <button
                key={`${key}-${val}`}
                onClick={() => onChange(key, selected[key].filter((v) => v !== val))}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent hover:bg-accent/20 transition-colors"
              >
                {val} <X className="h-2.5 w-2.5" />
              </button>
            )),
          )}
        </div>
      )}

      {filters.map((group) => (
        <FilterAccordion
          key={group.key}
          group={group}
          selected={selected[group.key] ?? []}
          onChange={(values) => onChange(group.key, values)}
        />
      ))}
    </div>
  );
}