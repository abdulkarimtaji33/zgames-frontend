'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { ProductGrid } from '@/components/store/ProductGrid';
import { productsApi } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!query) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.findAll({ search: query, limit: 24 });
        const data = res.data.data as PaginatedResponse<Product>;
        setProducts(data.items ?? []);
        setTotal(data.meta?.total ?? 0);
      } catch { setProducts([]); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [query]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-1">
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
        {!isLoading && query && (
          <p className="text-sm text-foreground-muted">{total} products found</p>
        )}
      </div>
      {!query ? (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-foreground-subtle mx-auto mb-4" />
          <p className="text-foreground-muted">Enter a search term to find products</p>
        </div>
      ) : (
        <ProductGrid products={products} isLoading={isLoading} cols={4} />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}