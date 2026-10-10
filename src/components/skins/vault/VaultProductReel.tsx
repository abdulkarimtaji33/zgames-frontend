'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';

interface VaultProductReelProps {
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading?: boolean;
  viewAllHref?: string;
}

/**
 * VaultProductReel — a horizontally-scrolling "reel" of products, used in
 * place of the conventional static 4-up grid row. Reads more like a
 * launcher's game shelf (think a storefront carousel you drag/scroll
 * through) than an e-commerce category grid.
 */
export function VaultProductReel({ title, subtitle, products, isLoading, viewAllHref }: VaultProductReelProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 560, behavior: 'smooth' });
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-foreground-muted mt-1">{subtitle}</p>}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {viewAllHref && (
              <a href={viewAllHref} className="text-sm text-foreground-muted hover:text-foreground transition-colors mr-2">
                View all
              </a>
            )}
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="skin-plate h-9 w-9 grid place-items-center text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="skin-plate h-9 w-9 grid place-items-center text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          'flex gap-4 overflow-x-auto px-4 sm:px-6 pb-2 snap-x snap-mandatory scroll-px-4 sm:scroll-px-6',
          '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        )}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[220px] sm:w-[250px] flex-shrink-0 snap-start">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((p) => (
              <div key={p.id} className="w-[220px] sm:w-[250px] flex-shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
        {!isLoading && products.length === 0 && (
          <p className="text-sm text-foreground-subtle py-8">Nothing here yet — check back soon.</p>
        )}
      </div>
    </section>
  );
}
