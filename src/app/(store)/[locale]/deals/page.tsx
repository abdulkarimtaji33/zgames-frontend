'use client';

import { useEffect, useState, useCallback } from 'react';
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
      const res = await productsApi.findAll({ ...{ isOnSale: true }, page, limit: 24 });
      const data = res.data.data as PaginatedResponse<Product>;
      setProducts(data.items ?? []);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch { setProducts([]); }
    finally { setIsLoading(false); }
  }, [page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-6">
      <Breadcrumbs items={[{ label: 'Shop', href: '/en' }, { label: 'Flash Deals' }]} className="mb-6" />
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-1">Flash Deals</h1>
        <p className="text-sm text-foreground-muted">Limited-time discounts on your favorite gaming products.</p>
      </div>
      <ProductGrid products={products} isLoading={isLoading} cols={4} />
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}