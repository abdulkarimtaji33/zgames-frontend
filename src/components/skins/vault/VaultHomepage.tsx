'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useProductSection, PLATFORMS, BRANDS } from '@/lib/hooks/useStorefrontData';
import { VaultHeroShowcase } from './VaultHeroShowcase';
import { VaultProductReel } from './VaultProductReel';

/**
 * VaultHomepage — an editorial, slower-paced page: a handful of large,
 * deliberate sections instead of a long stack of same-shaped rows.
 *
 *   1. Hero       — one rotating "featured drop", full-bleed key art.
 *   2. Collection  — a single big editorial spread (image + copy) for the
 *                    current sale collection, not another grid.
 *   3. Reels       — horizontally-scrolling shelves (new arrivals, best
 *                    sellers, pre-orders, coming soon) instead of static grids.
 *   4. Platforms   — full-bleed dark spreads, one per platform, instead of
 *                    small gradient tiles.
 *   5. Brands      — a quiet marquee-style strip, closing the page out.
 */
export function VaultHomepage() {
  const { products: featured, isLoading: featuredLoading } = useProductSection({ isFeatured: true }, 6, { diversify: true });
  const { products: onSale, isLoading: onSaleLoading } = useProductSection({ isOnSale: true }, 6, { diversify: true });
  const { products: newArrivals, isLoading: newLoading } = useProductSection({ sortBy: 'createdAt', sortOrder: 'DESC' }, 10, { diversify: true });
  const { products: bestSellers, isLoading: bestLoading } = useProductSection({ sortBy: 'soldCount', sortOrder: 'DESC' }, 10, { diversify: true });
  const { products: preorders, isLoading: preorderLoading } = useProductSection({ isPreorder: true }, 10, { diversify: true });
  const { products: comingSoon, isLoading: comingSoonLoading } = useProductSection({ isComingSoon: true }, 10, { diversify: true });

  const collectionLead = onSale[0];

  return (
    <div>
      {/* 1. Hero — single rotating featured drop */}
      <VaultHeroShowcase products={featured} isLoading={featuredLoading} />

      {/* 2. Editorial collection spread */}
      <section className="py-14 sm:py-20 border-b border-border">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* Image side */}
            <div className="skin-card-frame relative aspect-[16/11] rounded-xl overflow-hidden bg-surface-1 order-1 lg:order-none">
              {collectionLead ? (
                (() => {
                  const img = collectionLead.images?.find((i) => i.isFeatured) ?? collectionLead.images?.[0];
                  return img?.url ? (
                    <Image src={img.url} alt={collectionLead.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-6xl">🎮</div>
                  );
                })()
              ) : (
                <div className="absolute inset-0 animate-pulse bg-surface-2" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-0)]/60 via-transparent to-transparent" />
            </div>

            {/* Copy side */}
            <div>
              <p className="font-heading text-xs uppercase tracking-[0.25em] text-[color:var(--color-accent-orange)] mb-4">
                Curated Collection
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-foreground leading-tight mb-5">
                The Vault&apos;s current <span className="skin-glow-text">cut</span>
              </h2>
              <p className="text-base text-foreground-muted leading-relaxed mb-8 max-w-lg">
                A hand-picked run of titles and gift cards currently marked down inside the vault —
                rotated regularly, gone once the drop closes. {onSale.length > 0 && `${onSale.length} pieces live right now.`}
              </p>

              {onSaleLoading ? (
                <div className="flex gap-3 mb-8">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 w-16 rounded-md bg-surface-1 animate-pulse" />)}
                </div>
              ) : (
                <div className="flex gap-3 mb-8 flex-wrap">
                  {onSale.slice(0, 5).map((p) => {
                    const img = p.images?.find((i) => i.isFeatured) ?? p.images?.[0];
                    return (
                      <Link key={p.id} href={`/en/products/${p.slug}`} className="skin-avatar-ring relative h-16 w-16 rounded-md overflow-hidden bg-surface-2 flex-shrink-0">
                        {img?.url ? (
                          <Image src={img.url} alt={p.name} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-xl">🎮</div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              <Link
                href="/en/deals"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent text-white font-medium hover:bg-accent-hover active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Shop the Collection <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Reels */}
      <VaultProductReel title="New Arrivals" subtitle="Freshly added to the vault" products={newArrivals} isLoading={newLoading} viewAllHref="/en/new-arrivals" />
      <div className="skin-divider mx-4 sm:mx-6" />
      <VaultProductReel title="Most Claimed" subtitle="What everyone else is unlocking" products={bestSellers} isLoading={bestLoading} viewAllHref="/en/best-sellers" />

      {/* 4. Platform spreads — full-bleed dark sections, not small gradient tiles */}
      <PlatformSpreads />

      {preorders.length > 0 || preorderLoading ? (
        <>
          <div className="skin-divider mx-4 sm:mx-6" />
          <VaultProductReel title="Pre-Orders" subtitle="Reserve it before the drop" products={preorders} isLoading={preorderLoading} viewAllHref="/en/preorders" />
        </>
      ) : null}
      {comingSoon.length > 0 || comingSoonLoading ? (
        <>
          <div className="skin-divider mx-4 sm:mx-6" />
          <VaultProductReel title="Coming Soon" subtitle="On the horizon" products={comingSoon} isLoading={comingSoonLoading} viewAllHref="/en/coming-soon" />
        </>
      ) : null}

      {/* 5. Brand marquee */}
      <section className="py-10 border-t border-border overflow-hidden">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-foreground-subtle mb-6">Trusted brands inside the vault</p>
        <div className="flex gap-10 overflow-x-auto px-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] justify-center flex-wrap">
          {BRANDS.map((b) => (
            <span key={b} className="font-heading text-sm sm:text-base text-foreground-subtle hover:text-foreground-muted transition-colors whitespace-nowrap">
              {b}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function PlatformSpreads() {
  return (
    <section className="border-t border-border">
      {PLATFORMS.map((platform, i) => (
        <PlatformSpread key={platform.slug} platform={platform} index={i} />
      ))}
    </section>
  );
}

function PlatformSpread({
  platform,
  index,
}: {
  platform: (typeof PLATFORMS)[number];
  index: number;
}) {
  const { products } = useProductSection({ platform: platform.apiPlatform }, 4);
  const [hovered, setHovered] = useState(false);
  const flipped = index % 2 === 1;

  return (
    <Link
      href={`/en/category/${platform.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block border-b border-border overflow-hidden"
    >
      <div
        className="relative py-16 sm:py-24 transition-colors duration-[var(--duration-slow)]"
        style={{
          background: hovered
            ? 'radial-gradient(60% 80% at 20% 50%, var(--accent-glow), transparent 60%), var(--surface-1)'
            : 'var(--surface-0)',
        }}
      >
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-8 ${flipped ? 'sm:flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <p className="font-heading text-xs uppercase tracking-[0.25em] text-foreground-subtle mb-3">
                Platform {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="font-heading text-4xl sm:text-6xl font-bold text-foreground mb-3 flex items-center gap-4">
                {platform.name}
                <ArrowUpRight className={`h-8 w-8 text-[color:var(--color-action)] transition-transform ${hovered ? 'translate-x-1 -translate-y-1' : ''}`} />
              </h3>
              <p className="text-base text-foreground-muted max-w-md">{platform.desc}</p>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              {(products.length > 0 ? products.map((p) => p.name) : platform.games).slice(0, 4).map((name) => (
                <span key={name} className="skin-plate px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
