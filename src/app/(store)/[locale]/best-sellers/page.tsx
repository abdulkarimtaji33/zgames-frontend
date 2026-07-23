'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Pagination } from '@/components/shared/Pagination';
import { productsApi } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

export default function ListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.findAll({ ...{ sortBy: 'soldCount', sortOrder: 'DESC' }, page, limit: 24 });
      const data = res.data.data as PaginatedResponse<Product>;
      setProducts(data.items ?? []);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch { setProducts([]); }
    finally { setIsLoading(false); }
  }, [page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-6">
      <Breadcrumbs items={[{ label: 'Shop', href: '/en' }, { label: 'Best Sellers' }]} className="mb-6" />
      <div className="mb-8 flex items-center gap-4 animate-fade-in">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold">Best Sellers</h1>
          <p className="text-sm text-foreground-muted">The most popular products loved by our community.</p>
        </div>
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