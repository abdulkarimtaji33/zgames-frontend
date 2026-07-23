'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, LayoutGrid, List, ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Pagination } from '@/components/shared/Pagination';
import { ProductGrid } from '@/components/store/ProductGrid';
import { FilterSidebar } from '@/components/store/FilterSidebar';
import type { Product, PaginatedResponse } from '@/types';
import { productsApi, categoriesApi } from '@/lib/api';
import { cn } from '@/lib/utils/cn';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt:DESC' },
  { label: 'Price: Low to High', value: 'price:ASC' },
  { label: 'Price: High to Low', value: 'price:DESC' },
  { label: 'Best Sellers', value: 'reviewCount:DESC' },
  { label: 'Highest Rated', value: 'avgRating:DESC' },
];

const FILTERS = [
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
      { label: 'International', value: 'international' },
    ],
  },
  {
    key: 'availability',
    label: 'Availability',
    options: [
      { label: 'In Stock', value: 'in_stock' },
      { label: 'Pre-Order', value: 'preorder' },
      { label: 'Coming Soon', value: 'coming_soon' },
    ],
  },
];

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt:DESC');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
        ...(selectedFilters.platform?.length && { platform: selectedFilters.platform[0] }),
        ...(selectedFilters.genre?.length && { genre: selectedFilters.genre[0] }),
        ...(selectedFilters.region?.length && { region: selectedFilters.region[0] }),
        ...(selectedFilters.availability?.includes('preorder') && { isPreorder: true }),
        ...(selectedFilters.availability?.includes('coming_soon') && { isComingSoon: true }),
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
  }, [page, sortBy, selectedFilters]);

  useEffect(() => { if (categoryResolved) fetchProducts(); }, [fetchProducts, categoryResolved]);

  const handleFilterChange = (key: string, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: values }));
    setPage(1);
  };

  const clearAllFilters = () => { setSelectedFilters({}); setPage(1); };

  const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy) ?? SORT_OPTIONS[0];

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: 'Shop', href: '/en' }, { label: categoryName }]}
        className="mb-4"
      />

      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4 animate-fade-in">
        <div>
          <h1 className="font-heading text-3xl font-bold">{categoryName}</h1>
          {!isLoading && (
            <p className="text-sm text-foreground-muted mt-1">{totalItems} products</p>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar - desktop */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <FilterSidebar
            filters={FILTERS}
            selected={selectedFilters}
            onChange={handleFilterChange}
            onClearAll={clearAllFilters}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-border">
            {/* Mobile filter btn */}
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 lg:hidden px-3 py-2 rounded border border-border text-sm text-foreground-muted hover:border-border-hover transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>

            <div className="flex items-center gap-3 ml-auto">
              {/* View mode */}
              <div className="hidden sm:flex items-center gap-1 border border-border rounded p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-surface-2 text-foreground' : 'text-foreground-muted')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-surface-2 text-foreground' : 'text-foreground-muted')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded border border-border text-sm text-foreground-muted hover:border-border-hover transition-colors"
                >
                  <span>Sort: {currentSort.label}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-52 rounded-lg bg-card border border-border shadow-xl animate-slide-down z-40">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setSortOpen(false); setPage(1); }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm hover:bg-surface-2 transition-colors',
                            sortBy === opt.value ? 'text-accent font-medium' : 'text-foreground-muted',
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
          </div>

          {/* Products */}
          <div key={`${page}-${sortBy}-${JSON.stringify(selectedFilters)}`} className="animate-fade-in">
            <ProductGrid products={products} isLoading={isLoading} cols={viewMode === 'list' ? 2 : 4} />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 z-40 mega-menu-backdrop animate-fade-in" onClick={() => setFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
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
              className="w-full mt-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
            >
              Show {totalItems} Products
            </button>
          </div>
        </>
      )}
    </div>
  );
}