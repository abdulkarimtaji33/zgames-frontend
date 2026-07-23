'use client';

import { useEffect, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { ProductCard } from '@/components/store/ProductCard';
import { useWishlistStore } from '@/store/wishlistStore';
import { productsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';

export default function WishlistPage() {
  const { productIds, removeProduct } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productIds.length) { setIsLoading(false); return; }
    Promise.all(productIds.map((id) => productsApi.findOne(id).then((r) => r.data.data).catch(() => null)))
      .then((results) => setProducts(results.filter(Boolean) as Product[]))
      .finally(() => setIsLoading(false));
  }, [productIds]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          <p className="text-foreground-muted">Save products you love and find them here.</p>
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