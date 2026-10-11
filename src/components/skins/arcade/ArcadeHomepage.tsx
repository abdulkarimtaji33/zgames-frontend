'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Clock, Flame, Gamepad2, Headphones, Puzzle, Trophy, Joystick,
  Gift, Gamepad, Shapes, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ProductCard } from '@/components/store/ProductCard';
import { useCurrencyStore } from '@/store/currencyStore';
import {
  useFeaturedCategories,
  useProductSection,
  PLATFORMS,
  BRANDS,
} from '@/lib/hooks/useStorefrontData';
import type { Product } from '@/types';
import { ArcadeHeroBento } from './ArcadeHeroBento';
import { ArcadeStickerBadge } from './ArcadeStickerBadge';

const SECTION_WRAP = 'mx-auto max-w-[1440px] px-4 sm:px-6';

/* ── Shared "bouncy rail" — horizontal snap-scroll row of product cards,
   used for every rail section instead of a static grid. ───────────── */
function ProductRail({ title, emoji, viewAllHref, products, isLoading }: {
  title: string;
  emoji: string;
  viewAllHref: string;
  products: Product[];
  isLoading: boolean;
}) {
  return (
    <section className={cn(SECTION_WRAP, 'py-8 sm:py-10')}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <span aria-hidden>{emoji}</span> {title}
        </h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-bold text-accent hover:underline shrink-0"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:thin]">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[13rem] sm:w-[15rem] h-[20rem] rounded-xl bg-surface-2 animate-pulse" />
            ))
          : products.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-[13rem] sm:w-[15rem]">
                <ProductCard product={p} />
              </div>
            ))}
        {!isLoading && products.length === 0 && (
          <p className="text-sm text-foreground-muted py-8">Nothing here yet — check back soon.</p>
        )}
      </div>
    </section>
  );
}

/* ── Ticket strip — flash deals stamped like a game ticket, with a live
   countdown and a perforated edge, in a horizontal scroll row. ─────── */
function useCountdown(hours = 14) {
  const [ms, setMs] = useState(() => hours * 3600 * 1000);
  useEffect(() => {
    const id = setInterval(() => setMs((v) => (v > 1000 ? v - 1000 : hours * 3600 * 1000)), 1000);
    return () => clearInterval(id);
  }, [hours]);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TicketStrip() {
  const { products, isLoading } = useProductSection({ isOnSale: true }, 8, { diversify: true });
  const format = useCurrencyStore((s) => s.format);
  const countdown = useCountdown(14);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className={cn(SECTION_WRAP, 'py-8 sm:py-10')}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Flame className="h-6 w-6 text-accent" /> Flash Deal Tickets
        </h2>
        <div className="flex items-center gap-2 rounded-full bg-accent text-white px-4 py-1.5 text-sm font-bold font-mono">
          <Clock className="h-4 w-4" />
          {countdown}
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[17rem] h-32 rounded-xl bg-surface-2 animate-pulse" />
            ))
          : products.map((p) => {
              const pct = p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0;
              return (
                <Link
                  key={p.id}
                  href={`/en/products/${p.slug}`}
                  className="skin-ticket relative snap-start shrink-0 w-[17rem] rounded-xl bg-surface-1 border border-border p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
                >
                  <div className="h-14 w-14 rounded-lg bg-surface-2 flex items-center justify-center text-2xl shrink-0" aria-hidden>
                    🎮
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-accent text-sm">{format(Number(p.salePrice ?? p.price))}</span>
                      {pct > 0 && <span className="text-xs text-foreground-subtle line-through">{format(Number(p.price))}</span>}
                    </div>
                  </div>
                  {pct > 0 && (
                    <span className="absolute -top-2 -right-2 rotate-[8deg]">
                      <ArcadeStickerBadge>-{pct}%</ArcadeStickerBadge>
                    </span>
                  )}
                </Link>
              );
            })}
      </div>
    </section>
  );
}

/* ── Sticker-wall category grid — playful tiles with idle wiggle. ───── */
/* Keyword-matched icon per category, used when no image has been uploaded
 * for it yet (Admin → Categories → Image) — a deliberate fallback instead
 * of one generic placeholder glyph for every category. */
const CATEGORY_ICON_RULES: [RegExp, LucideIcon][] = [
  [/playstation|ps\d/i, Gamepad],
  [/xbox/i, Gamepad],
  [/nintendo|switch/i, Joystick],
  [/accessor/i, Headphones],
  [/toy/i, Shapes],
  [/action figure|collectible|figure/i, Trophy],
  [/gift/i, Gift],
  [/game/i, Gamepad2],
];
function categoryIcon(name: string): LucideIcon {
  return CATEGORY_ICON_RULES.find(([re]) => re.test(name))?.[1] ?? Puzzle;
}

function StickerWall() {
  const { categories, isLoading } = useFeaturedCategories(10);

  return (
    <section className={cn(SECTION_WRAP, 'py-8 sm:py-10')}>
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">Browse the Wall</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-surface-2 animate-pulse" />
            ))
          : categories.map((cat, i) => {
              const photo = cat.image || cat.imageUrl;
              const Icon = categoryIcon(cat.name);
              return (
                <Link
                  key={cat.id}
                  href={`/en/category/${cat.slug}`}
                  className="skin-wiggle group relative aspect-square rounded-2xl bg-surface-1 border border-border overflow-hidden flex flex-col items-center justify-center gap-2 p-3 text-center transition-transform"
                  style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 1.5}deg)` }}
                >
                  {photo ? (
                    <>
                      <Image
                        src={photo}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-110"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <span className="relative text-xs sm:text-sm font-bold text-white line-clamp-2 drop-shadow">{cat.name}</span>
                    </>
                  ) : (
                    <>
                      <span
                        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-25"
                        style={{ background: `var(--viz-${(i % 6) + 1})` }}
                        aria-hidden
                      />
                      <Icon className="relative h-8 w-8 text-accent" aria-hidden />
                      <span className="relative text-xs sm:text-sm font-bold text-foreground line-clamp-2">{cat.name}</span>
                    </>
                  )}
                </Link>
              );
            })}
        {!isLoading && categories.length === 0 && (
          <p className="col-span-full text-sm text-foreground-subtle py-6">Nothing here yet — check back soon.</p>
        )}
      </div>
    </section>
  );
}

/* ── Platform spotlight — 3-up grid of character-card tiles instead of
   stacked full-width platform blocks. ───────────────────────────────── */
function PlatformSpotlight() {
  const gradients = [
    'linear-gradient(160deg, oklch(65% 0.17 230) 0%, oklch(60% 0.23 300) 100%)',
    'linear-gradient(160deg, oklch(70% 0.19 145) 0%, oklch(75% 0.16 195) 100%)',
    'linear-gradient(160deg, oklch(62% 0.25 350) 0%, oklch(80% 0.17 85) 100%)',
  ];
  return (
    <section className={cn(SECTION_WRAP, 'py-8 sm:py-10')}>
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">Pick Your Platform</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLATFORMS.map((platform, i) => (
          <Link
            key={platform.slug}
            href={`/en/category/${platform.slug}`}
            className="group relative rounded-2xl p-5 min-h-[14rem] flex flex-col justify-end overflow-hidden text-white"
            style={{ background: gradients[i % gradients.length] }}
          >
            <Gamepad2 className="relative h-8 w-8 mb-3 opacity-90 group-hover:rotate-12 transition-transform" />
            <h3 className="relative font-heading text-xl font-bold mb-1">{platform.name}</h3>
            <p className="relative text-sm text-white/85 mb-3">{platform.desc}</p>
            <ul className="relative flex flex-wrap gap-1.5">
              {platform.games.slice(0, 3).map((g) => (
                <li key={g} className="text-[11px] font-semibold bg-white/15 rounded-full px-2 py-0.5 backdrop-blur-sm">
                  {g}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Brand marquee — continuously auto-scrolling strip. ──────────────── */
function BrandMarquee() {
  return (
    <section className="py-8 sm:py-10 border-t border-border bg-surface-1">
      <div className={SECTION_WRAP}>
        <p className="text-xs font-bold uppercase tracking-wider text-foreground-subtle mb-4">Brands we carry</p>
      </div>
      <div className="skin-marquee-viewport overflow-hidden">
        <div className="skin-marquee-track flex w-max gap-10 items-center">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span key={`${brand}-${i}`} className="font-heading text-lg sm:text-2xl font-bold text-foreground-subtle whitespace-nowrap">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ArcadeHomepage() {
  const newArrivals = useProductSection({ sortBy: 'createdAt', sortOrder: 'DESC' }, 10, { diversify: true });
  const bestSellers = useProductSection({ sortBy: 'soldCount', sortOrder: 'DESC' }, 10, { diversify: true });
  const comingSoon = useProductSection({ isComingSoon: true }, 10, { diversify: true });

  return (
    <div className="pb-8">
      <ArcadeHeroBento />
      <StickerWall />
      <TicketStrip />
      <ProductRail title="Fresh Drops" emoji={'\u{1F680}'} viewAllHref="/en/new-arrivals" products={newArrivals.products} isLoading={newArrivals.isLoading} />
      <PlatformSpotlight />
      <ProductRail title="Player Favorites" emoji={'\u{1F3C6}'} viewAllHref="/en/best-sellers" products={bestSellers.products} isLoading={bestSellers.isLoading} />
      <ProductRail title="Coming Soon" emoji={'\u{1F52E}'} viewAllHref="/en/coming-soon" products={comingSoon.products} isLoading={comingSoon.isLoading} />
      <BrandMarquee />
    </div>
  );
}
