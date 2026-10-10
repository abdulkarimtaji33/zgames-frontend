'use client';

/**
 * Arcade Pop category/listing page — a "quest board" instead of a classic
 * sidebar+grid layout: a big cartridge-style header with a live item-count
 * sticker, filter *chips* that expand into a bottom-sheet-style panel on
 * every breakpoint (not a permanent desktop rail), and a sort control
 * styled as a pill dropdown. Functionally it covers what the old page did
 * — category resolution by slug, server-side filter/sort params, paging —
 * this is low-risk display code so the structure is free to diverge.
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, Search as SearchIcon } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Pagination } from '@/components/shared/Pagination';
import { ProductGrid } from '@/components/store/ProductGrid';
import { FilterSidebar, type FilterGroup } from '@/components/store/FilterSidebar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArcadeStickerBadge } from './ArcadeStickerBadge';
import { productsApi, categoriesApi } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';
import { cn } from '@/lib/utils/cn';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt:DESC' },
  { label: 'Price: Low to High', value: 'price:ASC' },
  { label: 'Price: High to Low', value: 'price:DESC' },
  { label: 'Best Sellers', value: 'reviewCount:DESC' },
  { label: 'Highest Rated', value: 'avgRating:DESC' },
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
    // Single-select — same reasoning as the previous page: these map to ANDed
    // backend flags, so letting more than one be active could 0-result silently.
    type: 'radio',
    options: [
      { label: 'In Stock', value: 'in_stock' },
      { label: 'Pre-Order', value: 'preorder' },
      { label: 'Coming Soon', value: 'coming_soon' },
    ],
  },
];

export function ArcadeCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt:DESC');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryLabel, setCategoryLabel] = useState<string | null>(null);
  const [categoryResolved, setCategoryResolved] = useState(false);

  const slug = params.slug as string;
  const fallbackName = slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Products';
  const categoryName = categoryLabel ?? fallbackName;
  // searchParams isn't read directly elsewhere, but keeping the hook call mirrors the old
  // page's shape in case a future query param (e.g. a shared filter link) needs to seed state.
  void searchParams;

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
  const activeFilterCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);
  const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy) ?? SORT_OPTIONS[0];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ label: 'Shop', href: '/en' }, { label: categoryName }]} className="mb-5" />

      {/* Quest-board header */}
      <div className="skin-hero relative overflow-hidden rounded-2xl bg-surface-1 border-2 border-border p-6 sm:p-8 mb-6">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="skin-sticker-cyan inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wide mb-3">
              🎯 Category
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">{categoryName}</h1>
          </div>
          {!isLoading && !categoryNotFound && (
            <div className="skin-card-frame rounded-xl bg-surface-2 px-4 py-3 text-center shrink-0">
              <p className="font-heading text-2xl font-bold text-accent leading-none">{totalItems}</p>
              <p className="text-xs text-foreground-muted mt-0.5">items found</p>
            </div>
          )}
        </div>
      </div>

      {categoryNotFound ? (
        <EmptyState
          icon={SearchIcon}
          title="Category not found"
          description="We couldn't find the category you're looking for. Please check the URL or browse our shop."
        />
      ) : (
        <>
          {/* Toolbar: filter chips + sort, no permanent sidebar */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              onClick={() => setFilterOpen(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-bold transition-colors',
                activeFilterCount > 0 ? 'border-accent bg-accent/10 text-accent' : 'border-border text-foreground-muted hover:border-border-hover',
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active filter chips */}
            {Object.entries(selectedFilters).flatMap(([key, values]) =>
              values.map((val) => (
                <button
                  key={`${key}-${val}`}
                  onClick={() => handleFilterChange(key, selectedFilters[key].filter((v) => v !== val))}
                  className="skin-sticker flex items-center gap-1 px-2.5 py-1.5 bg-surface-2 text-xs font-bold text-foreground-muted hover:text-foreground"
                >
                  {val.replace(/_/g, ' ')} <X className="h-3 w-3" />
                </button>
              )),
            )}

            <div className="relative ml-auto">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border text-sm font-bold text-foreground-muted hover:border-border-hover transition-colors"
              >
                <span className="hidden sm:inline">Sort:</span> {currentSort.label}
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', sortOpen && 'rotate-180')} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-surface-1 border-2 border-border shadow-lg z-40 overflow-hidden">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); setPage(1); }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-surface-2 transition-colors',
                          sortBy === opt.value ? 'text-accent' : 'text-foreground-muted',
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

          {/* Product grid */}
          <div key={`${page}-${sortBy}-${JSON.stringify(selectedFilters)}`} className="animate-fade-in">
            <ProductGrid products={products} isLoading={isLoading} cols={4} />
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Filter bottom-sheet (every breakpoint) */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 animate-fade-in" onClick={() => setFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-4 sm:bottom-4 sm:w-96 z-50 bg-surface-1 border-2 border-border rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-bold">Filters</h3>
              <button onClick={() => setFilterOpen(false)} className="p-2 text-foreground-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              filters={FILTERS}
              selected={selectedFilters}
              onChange={handleFilterChange}
              onClearAll={clearAllFilters}
            />
            <button
              onClick={() => setFilterOpen(false)}
              className="w-full mt-6 py-3 rounded-full bg-accent text-white font-bold hover:bg-accent-hover transition-colors"
            >
              Show {totalItems} Products
            </button>
          </div>
        </>
      )}
    </div>
  );
}
