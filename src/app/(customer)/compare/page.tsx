'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GitCompare, X, ShoppingCart } from 'lucide-react';
import { useCompareStore } from '@/store/compareStore';
import { useCartStore } from '@/store/cartStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { StarRating } from '@/components/store/StarRating';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { productsApi } from '@/lib/api';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types';

const PLATFORM_LABELS: Record<string, string> = {
  ps5: 'PlayStation 5',
  ps4: 'PlayStation 4',
  xbox_series_x: 'Xbox Series X',
  xbox_one: 'Xbox One',
  nintendo_switch: 'Nintendo Switch',
  pc: 'PC',
};

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** A single labeled comparison row, rendered as label cell + one value cell per product. */
function CompareRow({
  label,
  products,
  render,
}: {
  label: string;
  products: Product[];
  render: (product: Product) => React.ReactNode;
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <th
        scope="row"
        className="sticky left-0 z-10 bg-card text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted px-4 py-3 align-top w-32 sm:w-40"
      >
        {label}
      </th>
      {products.map((product) => (
        <td key={product.id} className="px-4 py-3 align-top text-sm text-foreground border-l border-border min-w-[200px]">
          {render(product)}
        </td>
      ))}
    </tr>
  );
}

export default function ComparePage() {
  const { productIds, removeProduct } = useCompareStore();
  const addItem = useCartStore((s) => s.addItem);
  const format = useCurrencyStore((s) => s.format);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productIds.length) { setProducts([]); setIsLoading(false); return; }
    let cancelled = false;
    setIsLoading(true);
    Promise.all(
      productIds.map((id) => productsApi.findOne(id).then((r) => r.data.data).catch(() => null)),
    ).then((results) => {
      if (cancelled) return;
      // Preserve the store's selection order rather than API resolution order.
      setProducts(results.filter(Boolean) as Product[]);
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [productIds]);

  const handleAddToCart = (product: Product) => {
    const featuredImage = product.images?.find((i) => i.isFeatured) ?? product.images?.[0];
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

  return (
    <div>
      <div className="flex items-center flex-wrap gap-3 justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Compare Products ({productIds.length}/4)</h1>
        {productIds.length > 0 && (
          <button
            onClick={() => productIds.forEach(removeProduct)}
            className="text-sm text-error hover:underline focus-visible:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {productIds.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-card border border-border shadow-sm">
          <GitCompare className="h-14 w-14 text-foreground-subtle mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Nothing to compare</h2>
          <p className="text-foreground-muted mb-6">Add products to compare their specs side-by-side.</p>
          <Link href="/en" className="inline-flex px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">Browse Products</Link>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl bg-card border border-border p-5 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
          {productIds.map((id) => <Skeleton key={id} height={320} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-card border border-border shadow-sm">
          <GitCompare className="h-14 w-14 text-foreground-subtle mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">These products are no longer available</h2>
          <p className="text-foreground-muted mb-6">Try adding different products to compare.</p>
          <Link href="/en" className="inline-flex px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">Browse Products</Link>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border shadow-sm overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="sticky left-0 z-10 bg-card px-4 py-3 w-32 sm:w-40" />
                {products.map((product) => {
                  const featuredImage = product.images?.find((i) => i.isFeatured) ?? product.images?.[0];
                  return (
                    <th key={product.id} scope="col" className="px-4 py-3 align-top text-left border-l border-border min-w-[200px]">
                      <div className="flex justify-end mb-1">
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="h-7 w-7 rounded-full flex items-center justify-center text-foreground-muted hover:bg-surface-2 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          aria-label={`Remove ${product.name} from comparison`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <Link href={`/en/products/${product.slug}`} className="block group">
                        <div className="relative aspect-[4/3] rounded-lg bg-background-tertiary overflow-hidden mb-2">
                          {featuredImage?.url ? (
                            <Image
                              src={featuredImage.url}
                              alt={featuredImage.alt ?? product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-3xl">🎮</div>
                          )}
                        </div>
                        <h3 className="font-heading text-sm font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.isComingSoon}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {product.isComingSoon ? 'Coming Soon' : 'Add to Cart'}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <CompareRow
                label="Price"
                products={products}
                render={(p) =>
                  p.salePrice ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-accent">{format(Number(p.salePrice))}</span>
                      <span className="text-xs text-foreground-subtle line-through">{format(Number(p.price))}</span>
                    </div>
                  ) : (
                    <span className="font-bold">{format(Number(p.price))}</span>
                  )
                }
              />
              <CompareRow
                label="Rating"
                products={products}
                render={(p) =>
                  p.avgRating > 0 ? (
                    <StarRating rating={p.avgRating} showCount count={p.reviewCount} />
                  ) : (
                    <span className="text-foreground-muted">No reviews yet</span>
                  )
                }
              />
              <CompareRow
                label="Availability"
                products={products}
                render={(p) =>
                  p.isPreorder ? (
                    <Badge variant="preorder">Pre-Order</Badge>
                  ) : p.isComingSoon ? (
                    <Badge variant="comingsoon">Coming Soon</Badge>
                  ) : (
                    <Badge variant="success">In Stock</Badge>
                  )
                }
              />
              <CompareRow
                label="Platform"
                products={products}
                render={(p) => (p.platform ? PLATFORM_LABELS[p.platform] ?? p.platform : '—')}
              />
              <CompareRow label="Genre" products={products} render={(p) => p.genre ?? '—'} />
              <CompareRow label="Region" products={products} render={(p) => p.region ?? '—'} />
              <CompareRow label="Brand" products={products} render={(p) => p.brand?.name ?? '—'} />
              <CompareRow label="Category" products={products} render={(p) => p.category?.name ?? '—'} />
              <CompareRow label="Publisher" products={products} render={(p) => p.publisher ?? '—'} />
              <CompareRow label="Developer" products={products} render={(p) => p.developer ?? '—'} />
              <CompareRow label="Release Date" products={products} render={(p) => formatDate(p.releaseDate)} />
              <CompareRow
                label="Description"
                products={products}
                render={(p) => (
                  <span className={cn('text-foreground-muted line-clamp-4')}>
                    {p.shortDescription ?? p.description ?? '—'}
                  </span>
                )}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
