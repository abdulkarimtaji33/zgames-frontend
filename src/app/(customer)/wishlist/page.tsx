'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { ProductCard } from '@/components/store/ProductCard';
import { useWishlistStore } from '@/store/wishlistStore';
import { productsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';
import type { AxiosError } from 'axios';

export default function WishlistPage() {
  const { productIds, removeProduct } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productIds.length) { setIsLoading(false); return; }
    let cancelled = false;
    Promise.all(
      productIds.map((id) =>
        productsApi.findOne(id)
          .then((r) => r.data.data)
          .catch((err: AxiosError) => {
            // Product was deleted/unpublished server-side: prune the stale id from the
            // wishlist store so the header count doesn't stay wrong forever.
            if (err.response?.status === 404 && !cancelled) removeProduct(id);
            return null;
          }),
      ),
    )
      .then((results) => { if (!cancelled) setProducts(results.filter(Boolean) as Product[]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [productIds, removeProduct]);

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap gap-3 justify-between">
        <h1 className="font-heading text-2xl font-bold">My Wishlist ({productIds.length})</h1>
        {productIds.length > 0 && (
          <button
            onClick={() => productIds.forEach(removeProduct)}
            className="flex items-center gap-1.5 text-sm text-error hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear All
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} height={280} />)}
        </div>
      ) : productIds.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-card border border-border shadow-sm">
          <Heart className="h-14 w-14 text-foreground-subtle mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-foreground-muted mb-6">Save products you love and find them here.</p>
          <Link href="/en" className="inline-flex px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}