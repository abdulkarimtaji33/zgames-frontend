'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal, X, LayoutGrid, List, ChevronDown, Heart, ShoppingCart } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Pagination } from '@/components/shared/Pagination';
import { ProductGrid } from '@/components/store/ProductGrid';
import { FilterSidebar } from '@/components/store/FilterSidebar';
import { StarRating } from '@/components/store/StarRating';
import { Badge } from '@/components/ui/Badge';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCurrencyStore } from '@/store/currencyStore';
import type { Product, PaginatedResponse } from '@/types';
import { productsApi, categoriesApi } from '@/lib/api';
import { cn } from '@/lib/utils/cn';

/** Compact horizontal row used for the "list" view toggle — image-left, details-right.
 * Kept local to this page rather than added to ProductCard, which is owned elsewhere. */
function ProductListRow({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { productIds: wishlist, addProduct, removeProduct } = useWishlistStore();
  const isWishlisted = wishlist.includes(product.id);
  const format = useCurrencyStore((s) => s.format);

  const featuredImage = product.images?.find((i) => i.isFeatured) ?? product.images?.[0];
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      imageUrl: featuredImage?.url,
      slug: product.slug,
      platform: product.platform,
      type: product.type,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) removeProduct(product.id);
    else addProduct(product.id);
  };

  return (
    <Link
      href={`/en/products/${product.slug}`}
      className="group flex gap-4 rounded-xl bg-card border border-border p-3 card-hover"
    >
      <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 rounded-lg bg-background-tertiary overflow-hidden">
        {featuredImage?.url ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="128px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🎮</div>
        )}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {product.isPreorder && <Badge variant="preorder">Pre-Order</Badge>}
          {product.isComingSoon && <Badge variant="comingsoon">Soon</Badge>}
          {!product.isPreorder && !product.isComingSoon && discountPercent > 0 && (
            <Badge variant="sale">-{discountPercent}%</Badge>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-foreground-muted mb-0.5 line-clamp-1">
              {product.brand?.name ?? product.category?.name ?? ''}
              {product.platform ? ` · ${product.platform}` : ''}
            </p>
            <h3 className="font-medium text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
              {product.name}
            </h3>
          </div>
          <button
            onClick={handleWishlist}
            className={cn(
              'h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center transition-colors',
              isWishlisted ? 'text-accent' : 'text-foreground-muted hover:text-accent',
            )}
            aria-label="Wishlist"
          >
            <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
          </button>
        </div>

        {product.avgRating > 0 && (
          <div className="mt-1.5">
            <StarRating rating={product.avgRating} showCount count={product.reviewCount} />
          </div>
        )}

        {product.shortDescription && (
          <p className="hidden sm:block text-sm text-foreground-muted mt-1.5 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div>
            {product.salePrice ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-accent">{format(Number(product.salePrice))}</span>
                <span className="text-xs text-foreground-subtle line-through">{format(Number(product.price))}</span>
              </div>
            ) : (
              <span className="font-bold text-foreground">{format(Number(product.price))}</span>
            )}
          </div>
          {!product.isComingSoon && (
            <button
              onClick={handleAddToCart}
              className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors flex-shrink-0"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProductListView({ products, isLoading }: { products: Product[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">🎮</span>
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">No products found</h3>
        <p className="text-sm text-foreground-muted">Try adjusting your filters or search term.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {products.map((product) => <ProductListRow key={product.id} product={product} />)}
    </div>
  );
}

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
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-5 pb-4 border-b border-border">
            {/* Mobile filter btn */}
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 lg:hidden px-3 py-2 rounded border border-border text-sm text-foreground-muted hover:border-border-hover transition-colors flex-shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
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
                  className="flex items-center gap-2 px-3 py-2 rounded border border-border text-sm text-foreground-muted hover:border-border-hover transition-colors max-w-[10rem] sm:max-w-none"
                >
                  <span className="truncate">
                    <span className="hidden sm:inline">Sort: </span>{currentSort.label}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-52 max-w-[calc(100vw-2rem)] rounded-lg bg-card border border-border shadow-xl animate-slide-down z-40">
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
            {viewMode === 'list' ? (
              <ProductListView products={products} isLoading={isLoading} />
            ) : (
              <ProductGrid products={products} isLoading={isLoading} cols={4} />
            )}
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