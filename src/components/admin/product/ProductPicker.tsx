'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { adminProductsApi } from '@/lib/api/adminApi';
import type { Product } from '@/types';

interface ProductPickerProps {
  selected: Product[];
  onChange: (products: Product[]) => void;
  excludeId?: string;
  placeholder?: string;
}

/** Debounced product search combobox with selected-item chips, used for related/upsell/cross-sell pickers. */
export function ProductPicker({ selected, onChange, excludeId, placeholder = 'Search products to add...' }: ProductPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => {
      adminProductsApi.findAll({ search: query.trim(), limit: 8 })
        .then((res) => {
          const data = res.data.data;
          const items = Array.isArray(data) ? data : data.items ?? [];
          setResults(items.filter((p) => p.id !== excludeId && !selected.some((s) => s.id === p.id)));
        })
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query, excludeId, selected]);

  const addProduct = (p: Product) => {
    onChange([...selected, p]);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const removeProduct = (id: string) => onChange(selected.filter((p) => p.id !== id));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-background-tertiary border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
        />
        {open && (query.trim() || isSearching) && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-xl max-h-64 overflow-y-auto">
            {isSearching ? (
              <p className="px-3 py-3 text-xs text-foreground-muted">Searching...</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-xs text-foreground-muted">No matching products.</p>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); addProduct(p); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-background-tertiary text-left transition-colors"
                >
                  <div className="h-8 w-8 rounded bg-background-tertiary flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
                    {p.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : '🎮'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-foreground-muted">AED {Number(p.price).toFixed(2)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-background-tertiary border border-border text-xs">
              {p.name}
              <button type="button" onClick={() => removeProduct(p.id)} className="p-0.5 rounded-full hover:bg-error/10 hover:text-error">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
