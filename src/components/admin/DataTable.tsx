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
        const va = String(getValue(a, sortKey) ?? '');
        const vb = String(getValue(b, sortKey) ?? '');
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
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
    <div className="rounded-xl bg-card border border-border overflow-hidden">
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
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-background-tertiary border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        </div>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card to-transparent sm:hidden z-[1]" />
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background-tertiary border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted',
                    col.sortable && 'cursor-pointer hover:text-foreground select-none',
                    col.className,
                  )}
                  onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon k={String(col.key)} />}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground-muted">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-4 bg-background-tertiary rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3"><div className="h-4 bg-background-tertiary rounded animate-pulse w-16 ml-auto" /></td>}
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
                <tr key={row.id} className="hover:bg-background-tertiary/50 transition-colors">
                  {columns.map((col) => {
                    const val = getValue(row, String(col.key));
                    return (
                      <td key={String(col.key)} className={cn('px-4 py-3 text-foreground', col.className)}>
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