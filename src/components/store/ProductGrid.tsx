import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  cols?: 2 | 3 | 4 | 5;
}

const COL_CLASSES = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
};

export function ProductGrid({ products, isLoading, skeletonCount = 12, cols = 4 }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={`grid ${COL_CLASSES[cols]} gap-4`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
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
    <div className={`grid ${COL_CLASSES[cols]} items-stretch gap-4`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}