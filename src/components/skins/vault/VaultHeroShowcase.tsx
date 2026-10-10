'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cartStore';
import { useCurrencyStore } from '@/store/currencyStore';
import type { Product } from '@/types';

interface VaultHeroShowcaseProps {
  products: Product[];
  isLoading?: boolean;
}

/**
 * VaultHeroShowcase — full-bleed cinematic key art for a single "featured
 * drop" at a time, auto-rotating slowly, rather than a 3-up generic promo
 * carousel. Deliberately shows ONE product's title treatment at full scale
 * (large type, one CTA, one secondary action) instead of stacking several
 * small promo cards side by side.
 */
export function VaultHeroShowcase({ products, isLoading }: VaultHeroShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const format = useCurrencyStore((s) => s.format);

  const active = products[index];

  useEffect(() => {
    if (products.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % products.length), 7000);
    return () => clearInterval(t);
  }, [products.length]);

  useEffect(() => setImageError(false), [index]);

  const goTo = (i: number) => setIndex(i);
  const step = (dir: 1 | -1) => setIndex((i) => (i + dir + products.length) % products.length);

  if (isLoading) {
    return <div className="h-[72vh] min-h-[520px] w-full bg-surface-1 animate-pulse" />;
  }

  if (!active) {
    return (
      <div className="h-[50vh] min-h-[360px] w-full grid place-items-center bg-surface-1 text-foreground-subtle">
        No featured drops right now.
      </div>
    );
  }

  const featuredImage = active.images?.find((i) => i.isFeatured) ?? active.images?.[0];
  const imageUrl = !imageError && featuredImage?.url ? featuredImage.url : null;
  const discountPercent = active.salePrice
    ? Math.round(((active.price - active.salePrice) / active.price) * 100)
    : 0;

  return (
    <section className="skin-hero relative h-[80vh] min-h-[560px] max-h-[860px] w-full overflow-hidden bg-surface-1">
      {/* Key art */}
      {imageUrl ? (
        <Image
          key={active.id}
          src={imageUrl}
          alt={active.name}
          fill
          priority
          className="object-cover animate-fade-in"
          onError={() => setImageError(true)}
          sizes="100vw"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(60% 60% at 70% 30%, var(--accent-glow), transparent 60%), var(--surface-2)' }}
        />
      )}
      {/* Left-to-right legibility gradient, independent of the shared .skin-hero vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface-0)] via-[var(--surface-0)]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-0)] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-[2] h-full flex items-center">
        <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6">
          <div className="max-w-xl">
            <p className="font-heading text-xs sm:text-sm uppercase tracking-[0.25em] text-[color:var(--color-accent-orange)] mb-4">
              Featured Drop
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold text-foreground leading-[1.05] mb-4">
              {active.name}
            </h1>
            {active.shortDescription && (
              <p className="text-base text-foreground-muted mb-6 line-clamp-3">{active.shortDescription}</p>
            )}

            <div className="flex items-center gap-3 mb-8 flex-wrap">
              {active.isPreorder && <Badge variant="preorder">Pre-Order</Badge>}
              {active.isComingSoon && <Badge variant="comingsoon">Coming Soon</Badge>}
              {discountPercent > 0 && <Badge variant="sale">-{discountPercent}%</Badge>}
              {active.platform && <Badge variant="outline">{active.platform}</Badge>}
              <span className="text-2xl font-bold text-foreground">
                {format(Number(active.salePrice ?? active.price))}
              </span>
              {active.salePrice && (
                <span className="text-sm text-foreground-subtle line-through">{format(Number(active.price))}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/en/products/${active.slug}`}
                className="inline-flex items-center px-6 py-3 rounded-md bg-accent text-white font-medium hover:bg-accent-hover active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View Drop
              </Link>
              {!active.isComingSoon && (
                <button
                  onClick={() =>
                    addItem({
                      productId: active.id,
                      quantity: 1,
                      name: active.name,
                      price: active.price,
                      salePrice: active.salePrice,
                      imageUrl: imageUrl ?? undefined,
                      slug: active.slug,
                      platform: active.platform,
                      type: active.type,
                    })
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border text-foreground font-medium hover:border-border-hover hover:bg-surface-1/60 active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {products.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-[2] flex items-center justify-center gap-4">
          <button
            onClick={() => step(-1)}
            aria-label="Previous drop"
            className="hidden sm:grid h-9 w-9 place-items-center rounded-full bg-surface-1/70 text-foreground-muted hover:text-foreground backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            {products.map((p, i) => (
              <button
                key={p.id}
                onClick={() => goTo(i)}
                aria-label={`Show drop ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-8 bg-[color:var(--color-action)]' : 'w-4 bg-white/25 hover:bg-white/40',
                )}
              />
            ))}
          </div>
          <button
            onClick={() => step(1)}
            aria-label="Next drop"
            className="hidden sm:grid h-9 w-9 place-items-center rounded-full bg-surface-1/70 text-foreground-muted hover:text-foreground backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
