'use client';

import { useEffect, useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { adminProductsApi, adminCustomersApi } from '@/lib/api/adminApi';

type EntityType = 'product' | 'customer';

interface EntityOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface EntityPickerProps {
  type: EntityType;
  value: EntityOption | null;
  onChange: (value: EntityOption | null) => void;
  placeholder?: string;
  /** Label shown above the control, e.g. "Product" */
  label?: string;
}

function customerToOption(c: Record<string, unknown>): EntityOption {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || (c.email as string) || 'Customer';
  return { id: String(c.id), label: name, sublabel: c.email as string | undefined };
}

/**
 * Single-select searchable combobox for Products/Customers — replaces hand-typed raw UUID inputs.
 * Shows the selected entity's real name once picked, with a clear button to change it.
 */
export function EntityPicker({ type, value, onChange, placeholder, label }: EntityPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EntityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => {
      const req =
        type === 'product'
          ? adminProductsApi.findAll({ search: query.trim(), limit: 8 }).then((res) => {
              const data = res.data.data;
              const items = Array.isArray(data) ? data : data.items ?? [];
              return items.map((p) => ({ id: p.id, label: p.name, sublabel: p.sku ? `SKU: ${p.sku}` : undefined }));
            })
          : adminCustomersApi.findAll({ search: query.trim(), limit: 8 }).then((res) => {
              const data = res.data.data;
              const items = Array.isArray(data) ? data : data.items ?? [];
              return items.map(customerToOption);
            });
      req.then(setResults).catch(() => setResults([])).finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query, type]);

  const defaultPlaceholder = type === 'product' ? 'Search products by name or SKU...' : 'Search customers by name or email...';

  if (value) {
    return (
      <div className="space-y-1.5">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-background-tertiary border border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Check className="h-4 w-4 text-success flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{value.label}</p>
              {value.sublabel && <p className="text-xs text-foreground-muted truncate">{value.sublabel}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1 rounded-md hover:bg-error/10 hover:text-error flex-shrink-0"
            aria-label="Change selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder ?? defaultPlaceholder}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-background-tertiary border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
        />
        {open && (query.trim() || isSearching) && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-xl max-h-64 overflow-y-auto">
            {isSearching ? (
              <p className="px-3 py-3 text-xs text-foreground-muted">Searching...</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-xs text-foreground-muted">No matches found.</p>
            ) : (
              results.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); onChange(opt); setQuery(''); setResults([]); setOpen(false); }}
                  className="w-full flex flex-col items-start px-3 py-2 hover:bg-background-tertiary text-left transition-colors"
                >
                  <span className="text-sm font-medium truncate w-full">{opt.label}</span>
                  {opt.sublabel && <span className="text-xs text-foreground-muted truncate w-full">{opt.sublabel}</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
