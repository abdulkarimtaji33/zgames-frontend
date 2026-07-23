'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Pagination } from '@/components/shared/Pagination';
import { productsApi } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const brandName = slug.split('-').map((w: string) => w[0]?.toUpperCase() + w.slice(1)).join(' ');

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
      <div className="rounded-2xl bg-gradient-to-br from-surface-1 to-surface-2 border border-border p-8 mb-8 text-center animate-fade-in">
        <div className="h-16 w-16 rounded-2xl bg-surface-0 border border-border flex items-center justify-center text-3xl mx-auto mb-3">🎮</div>
        <h1 className="font-heading text-3xl font-bold">{brandName}</h1>
        <p className="text-foreground-muted mt-1 text-sm">Browse all {brandName} products</p>
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