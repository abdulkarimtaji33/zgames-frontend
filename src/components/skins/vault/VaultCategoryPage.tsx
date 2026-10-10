'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, LayoutGrid } from 'lucide-react';
import { ProductGrid } from '@/components/store/ProductGrid';
import { FilterSidebar, type FilterGroup } from '@/components/store/FilterSidebar';
import { Pagination } from '@/components/shared/Pagination';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { productsApi, categoriesApi } from '@/lib/api';
import { cn } from '@/lib/utils/cn';
import type { Product, PaginatedResponse } from '@/types';

/**
 * VaultCategoryPage — "the manifest room": a cinematic header band instead
 * of a plain page title, quick-filter pills for the most common cuts
 * (platform), and filters tucked behind a slide-in vault-door drawer
 * (shared by mobile AND desktop) instead of a permanent left sidebar
 * eating into the grid's width. The product grid runs full-bleed.
 */

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt:DESC' },
  { label: 'Price: Low to High', value: 'price:ASC' },
  { label: 'Price: High to Low', value: 'price:DESC' },
  { label: 'Best Sellers', value: 'reviewCount:DESC' },
  { label: 'Highest Rated', value: 'avgRating:DESC' },
];

const QUICK_PLATFORMS = [
  { label: 'PS5', value: 'ps5' },
  { label: 'Xbox Series X', value: 'xbox_series_x' },
  { label: 'Switch', value: 'nintendo_switch' },
  { label: 'PC', value: 'pc' },
];

const FILTERS: FilterGroup[] = [
  {
    key: 'platform',
    label: 'Platform',
    options: [
      { label: 'PlayStation 5', value: 'ps5' },
      { label: 'PlayStation 4', value: 'ps4' },
      { label: 'Xbox Series X', value: 'xbox_series_x' },
      { label: 'Xbox One', value: 'xbox_one' },
      { label: 'Nintendo Switch', value: 'nintendo_switch' },
      { label: 'PC', value: 'pc' },
    ],
  },
  {
    key: 'genre',
    label: 'Genre',
    options: [
      { label: 'Action', value: 'action' },
      { label: 'RPG', value: 'rpg' },
      { label: 'Sports', value: 'sports' },
      { label: 'Racing', value: 'racing' },
      { label: 'Fighting', value: 'fighting' },
      { label: 'Shooter', value: 'shooter' },
      { label: 'Adventure', value: 'adventure' },
      { label: 'Simulation', value: 'simulation' },
    ],
  },
  {
    key: 'region',
    label: 'Region',
    options: [
      { label: 'UAE', value: 'uae' },
      { label: 'KSA', value: 'ksa' },
      { label: 'Qatar', value: 'qatar' },
      { label: 'Kuwait', value: 'kuwait' },
      { label: 'Oman', value: 'oman' },
      { label: 'Bahrain', value: 'bahrain' },
      { label: 'International', value: 'international' },
      { label: 'Global', value: 'global' },
    ],
  },
  {
    key: 'availability',
    label: 'Availability',
    // Single-select: these map to separate ANDed backend flags, so letting
    // more than one be active at once can produce an impossible (zero-result)
    // combination.
    type: 'radio',
    options: [
      { label: 'In Stock', value: 'in_stock' },
      { label: 'Pre-Order', value: 'preorder' },
      { label: 'Coming Soon', value: 'coming_soon' },
    ],
  },
];

export function VaultCategoryPage() {
  const params = useParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt:DESC');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryLabel, setCategoryLabel] = useState<string | null>(null);
  const [categoryResolved, setCategoryResolved] = useState(false);

  const slug = params.slug as string;
  const fallbackName = slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Products';
  const categoryName = categoryLabel ?? fallbackName;

  useEffect(() => {
    if (!slug) return;
    setCategoryResolved(false);
    categoriesApi.findBySlug(slug)
      .then((res) => {
        const cat = (res.data as { data?: { id: string; name: string } }).data;
        setCategoryId(cat?.id ?? null);
        setCategoryLabel(cat?.name ?? null);
      })
      .catch(() => { setCategoryId(null); setCategoryLabel(null); })
      .finally(() => setCategoryResolved(true));
  }, [slug]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sortField, sortOrder] = sortBy.split(':');
      const queryParams: Record<string, unknown> = {
        page,
        limit: 20,
        sortBy: sortField,
        sortOrder,
        ...(categoryId && { categoryId }),
        ...(selectedFilters.platform?.length && { platform: selectedFilters.platform }),
        ...(selectedFilters.genre?.length && { genre: selectedFilters.genre }),
        ...(selectedFilters.region?.length && { region: selectedFilters.region }),
        ...(selectedFilters.availability?.includes('preorder') && { isPreorder: true }),
        ...(selectedFilters.availability?.includes('coming_soon') && { isComingSoon: true }),
        ...(selectedFilters.availability?.includes('in_stock') && { inStock: true }),
      };
      const res = await productsApi.findAll(queryParams);
      const data = res.data.data as PaginatedResponse<Product>;
      setProducts(data.items ?? []);
      setTotalPages(data.meta?.totalPages ?? 1);
      setTotalItems(data.meta?.total ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, selectedFilters, categoryId]);

  const categoryNotFound = categoryResolved && !categoryId;

  useEffect(() => {
    if (categoryResolved && categoryId) fetchProducts();
  }, [fetchProducts, categoryResolved, categoryId]);

  const handleFilterChange = (key: string, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: values }));
    setPage(1);
  };

  const clearAllFilters = () => { setSelectedFilters({}); setPage(1); };

  const toggleQuickPlatform = (value: string) => {
    const current = selectedFilters.platform ?? [];
    handleFilterChange('platform', current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy) ?? SORT_OPTIONS[0];
  const activeFilterCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div>
      {/* Cinematic header band */}
      <section
        className="relative overflow-hidden border-b border-border py-10 sm:py-14"
        style={{ background: 'radial-gradient(55% 90% at 85% 0%, var(--accent-glow), transparent 65%), var(--surface-1)' }}
      >
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <Breadcrumbs items={[{ label: 'Shop', href: '/en' }, { label: categoryName }]} className="mb-4" />
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-foreground leading-tight">
            {categoryName}
          </h1>
          {!isLoading && !categoryNotFound && (
            <p className="text-sm text-foreground-muted mt-3">{totalItems} pieces catalogued</p>
          )}
        </div>
      </section>

      {categoryNotFound ? (
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl mb-4">🔍</span>
          <h3 className="font-heading text-xl font-bold text-foreground mb-2">Category not found</h3>
          <p className="text-sm text-foreground-muted">
            We couldn&apos;t find the category you&apos;re looking for. Please check the URL or browse our shop.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
          {/* Quick-filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <LayoutGrid className="h-4 w-4 text-foreground-subtle flex-shrink-0" />
            {QUICK_PLATFORMS.map((p) => {
              const active = (selectedFilters.platform ?? []).includes(p.value);
              return (
                <button
                  key={p.value}
                  onClick={() => toggleQuickPlatform(p.value)}
                  className={cn(
                    'skin-plate px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0',
                    active ? 'text-[color:var(--color-action)] ring-1 ring-[color:var(--color-action)]' : 'text-foreground-muted hover:text-foreground',
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
            <button
              onClick={() => setDrawerOpen(true)}
              className="skin-plate flex items-center gap-2 px-3.5 py-2 rounded-md text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="h-4 w-4 rounded-full bg-[color:var(--color-action)] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative ml-auto">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-border text-sm text-foreground-muted hover:border-border-hover transition-colors"
              >
                <span className="truncate"><span className="hidden sm:inline">Sort: </span>{currentSort.label}</span>
                <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-md bg-surface-1 border border-border shadow-lg animate-slide-down z-40">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); setPage(1); }}
                        className={cn(
                          'w-full text-left px-3.5 py-2.5 text-sm hover:bg-surface-2 transition-colors',
                          sortBy === opt.value ? 'text-[color:var(--color-action)] font-medium' : 'text-foreground-muted',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Grid — full-bleed, no persistent sidebar */}
          <div key={`${page}-${sortBy}-${JSON.stringify(selectedFilters)}`} className="animate-fade-in">
            <ProductGrid products={products} isLoading={isLoading} cols={4} />
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Vault-door filter drawer — shared by mobile and desktop */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-surface-1 border-l border-border overflow-y-auto animate-slide-up sm:animate-fade-in shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-heading text-xl font-bold text-foreground">Filters</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-foreground-muted hover:text-foreground transition-colors" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <FilterSidebar
                filters={FILTERS}
                selected={selectedFilters}
                onChange={handleFilterChange}
                onClearAll={clearAllFilters}
              />
            </div>
            <div className="sticky bottom-0 p-5 bg-surface-1 border-t border-border">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover active:scale-95 transition-colors"
              >
                Show {totalItems} Products
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
