'use client';

import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type Column<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  /** Right-aligns the column and uses tabular-nums — set for numeric/currency columns. */
  align?: 'left' | 'right';
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  /**
   * When provided, search input is debounced and forwarded here instead of
   * filtering `data` client-side — use this when `data` is only the current
   * page from a server-paginated endpoint, so search covers the full dataset.
   */
  onSearch?: (query: string) => void;
  /** Extra filter controls rendered next to the search box (e.g. dropdowns). */
  filters?: React.ReactNode;
}

function getValue<T>(row: T, key: string): unknown {
  return key.split('.').reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], row);
}

/** Compares as numbers or dates when both sides parse cleanly; falls back to locale string compare. */
function compareValues(a: unknown, b: unknown): number {
  const na = typeof a === 'number' ? a : Number(a);
  const nb = typeof b === 'number' ? b : Number(b);
  if (a !== '' && b !== '' && a != null && b != null && !Number.isNaN(na) && !Number.isNaN(nb)) {
    return na - nb;
  }
  const da = Date.parse(String(a ?? ''));
  const db = Date.parse(String(b ?? ''));
  if (!Number.isNaN(da) && !Number.isNaN(db) && String(a).length > 4) {
    return da - db;
  }
  return String(a ?? '').localeCompare(String(b ?? ''));
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  searchable,
  searchPlaceholder = 'Search...',
  actions,
  emptyMessage = 'No records found.',
  onSearch,
  filters,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!onSearch) return;
    const t = setTimeout(() => onSearch(search), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filtered = onSearch
    ? data
    : search
      ? data.filter((row) =>
          columns.some((col) => {
            const v = getValue(row, String(col.key));
            return String(v ?? '').toLowerCase().includes(search.toLowerCase());
          }),
        )
      : data;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const cmp = compareValues(getValue(a, sortKey), getValue(b, sortKey));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: string }) => {
    if (sortKey !== k) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-accent" /> : <ChevronDown className="h-3.5 w-3.5 text-accent" />;
  };

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
      {(searchable || filters) && (
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
          {searchable && (
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-background-tertiary border border-border text-sm text-foreground placeholder:text-foreground-subtle transition-colors duration-[var(--duration-fast)] focus:outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        </div>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card to-transparent sm:hidden z-[1]" />
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-background-tertiary border-b border-border sticky top-0 z-[2]">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  aria-sort={
                    col.sortable
                      ? sortKey === String(col.key)
                        ? sortDir === 'asc' ? 'ascending' : 'descending'
                        : 'none'
                      : undefined
                  }
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.className,
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(String(col.key))}
                      className={cn(
                        'flex items-center gap-1.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
                        col.align === 'right' && 'ml-auto',
                      )}
                    >
                      {col.label}
                      <SortIcon k={String(col.key)} />
                    </button>
                  ) : (
                    <div className={cn('flex items-center gap-1.5', col.align === 'right' && 'justify-end')}>
                      {col.label}
                    </div>
                  )}
                </th>
              ))}
              {actions && <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground-muted">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-4 skeleton rounded w-3/4" />
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3"><div className="h-4 skeleton rounded w-16 ml-auto" /></td>}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-foreground-muted text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr key={row.id} className="hover:bg-background-tertiary/50 transition-colors duration-[var(--duration-fast)]">
                  {columns.map((col) => {
                    const val = getValue(row, String(col.key));
                    return (
                      <td
                        key={String(col.key)}
                        className={cn(
                          'px-4 py-3 text-foreground',
                          col.align === 'right' && 'text-right tabular-nums',
                          col.className,
                        )}
                      >
                        {col.render ? col.render(val, row) : String(val ?? '—')}
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      {sorted.length > 0 && (
        <div className="px-4 py-3 border-t border-border text-xs text-foreground-muted">
          Showing {sorted.length} of {data.length} records
        </div>
      )}
    </div>
  );
}
