'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { productsApi, brandsApi } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

/** Shape returned by GET /brands/by-slug/:slug — the shared Brand type only models the fields
 * used by product cards, so the fuller admin-authored fields are typed locally here. */
interface BrandDetail {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
}

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const fallbackName = slug?.split('-').map((w: string) => w[0]?.toUpperCase() + w.slice(1)).join(' ') ?? 'Brand';
  const brandName = brand?.name ?? fallbackName;

  useEffect(() => {
    if (!slug) return;
    setBrandLoading(true);
    setLogoError(false);
    brandsApi.findBySlug(slug)
      .then((res) => setBrand((res.data as { data?: BrandDetail }).data ?? null))
      .catch(() => setBrand(null))
      .finally(() => setBrandLoading(false));
  }, [slug]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.findAll({ brandSlug: slug, page, limit: 24 });
      const data = res.data.data as PaginatedResponse<Product>;
      setProducts(data.items ?? []);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch { setProducts([]); }
    finally { setIsLoading(false); }
  }, [slug, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-6">
      <Breadcrumbs
        items={[{ label: 'Shop', href: '/en' }, { label: brandName }]}
        className="mb-6"
      />
      {/* Brand hero */}
      <div className="rounded-2xl bg-gradient-to-br from-surface-1 to-surface-2 border border-border p-6 sm:p-8 mb-8 text-center animate-fade-in">
        {brandLoading ? (
          <Skeleton height={64} width={64} rounded className="mx-auto mb-3" />
        ) : brand?.logo && !logoError ? (
          <div className="h-16 w-16 rounded-2xl bg-surface-0 border border-border overflow-hidden relative mx-auto mb-3">
            <Image
              src={brand.logo}
              alt={`${brandName} logo`}
              fill
              className="object-contain p-2"
              onError={() => setLogoError(true)}
              sizes="64px"
            />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-2xl bg-surface-0 border border-border flex items-center justify-center text-3xl mx-auto mb-3">🎮</div>
        )}
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">{brandName}</h1>
        {brand?.description ? (
          <p className="text-foreground-muted mt-2 text-sm max-w-2xl mx-auto">{brand.description}</p>
        ) : (
          <p className="text-foreground-muted mt-1 text-sm">Browse all {brandName} products</p>
        )}
      </div>
      <div key={page} className="animate-fade-in">
        <ProductGrid products={products} isLoading={isLoading} cols={4} />
      </div>
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}