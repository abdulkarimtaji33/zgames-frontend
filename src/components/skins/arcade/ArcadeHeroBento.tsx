'use client';

import Link from 'next/link';
import { Sparkles, Zap, Gift, Gamepad2 } from 'lucide-react';
import { ArcadeStickerBadge } from './ArcadeStickerBadge';
import { ArcadeConfettiBurst } from './ArcadeConfettiBurst';

/**
 * Hero concept: a bento/collage of colorful promo tiles instead of a
 * single full-width slider. One big "hero of the week" tile, flanked by
 * three smaller tiles (flash deal, gift cards, platform spotlight), each
 * with its own gradient wash and a pinned sticker. Energetic from the
 * very first scroll — no waiting for a slide to rotate.
 */
export function ArcadeHeroBento() {
  return (
    <section className="relative mx-auto max-w-[1440px] px-4 sm:px-6 pt-6 sm:pt-8">
      <div className="skin-hero relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 rounded-[1.75rem] p-3 sm:p-4 bg-surface-1 border border-border overflow-hidden">
        <ArcadeConfettiBurst />

        {/* Big tile — hero of the week */}
        <Link
          href="/en/new-arrivals"
          className="group relative col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 rounded-[1.5rem] p-6 sm:p-8 flex flex-col justify-end min-h-[18rem] sm:min-h-[22rem] overflow-hidden text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-action) 0%, oklch(55% 0.24 320) 60%, var(--color-accent-orange) 130%)' }}
        >
          <span className="absolute top-5 right-5 rotate-[8deg]">
            <ArcadeStickerBadge tone="cyan">New Drop</ArcadeStickerBadge>
          </span>
          <span className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" aria-hidden />
          <Gamepad2 className="relative h-10 w-10 mb-3 opacity-90" />
          <h2 className="relative font-heading text-3xl sm:text-4xl font-bold leading-tight mb-2">
            This Week&rsquo;s<br />Hottest Drops
          </h2>
          <p className="relative text-sm sm:text-base text-white/90 max-w-sm">
            Fresh games, consoles &amp; collectibles just landed. Grab them before they&rsquo;re gone.
          </p>
          <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 group-hover:underline">
            Shop new arrivals &rarr;
          </span>
        </Link>

        {/* Small tile — flash deal */}
        <Link
          href="/en/deals"
          className="group relative rounded-[1.5rem] p-5 flex flex-col justify-end min-h-[8.5rem] sm:min-h-[10.5rem] overflow-hidden text-white"
          style={{ background: 'linear-gradient(145deg, oklch(70% 0.19 145) 0%, oklch(75% 0.16 195) 100%)' }}
        >
          <span className="absolute top-4 right-4 rotate-[-6deg]">
            <ArcadeStickerBadge tone="magenta">Hot</ArcadeStickerBadge>
          </span>
          <Zap className="relative h-7 w-7 mb-2" />
          <h3 className="relative font-heading text-lg font-bold">Flash Deals</h3>
          <p className="relative text-xs text-white/85">Up to 50% off, today only</p>
        </Link>

        {/* Small tile — gift cards */}
        <Link
          href="/en/category/pc-gift-cards"
          className="group relative rounded-[1.5rem] p-5 flex flex-col justify-end min-h-[8.5rem] sm:min-h-[10.5rem] overflow-hidden text-white"
          style={{ background: 'linear-gradient(145deg, oklch(60% 0.23 300) 0%, var(--color-action) 100%)' }}
        >
          <Gift className="relative h-7 w-7 mb-2" />
          <h3 className="relative font-heading text-lg font-bold">Instant Gift Cards</h3>
          <p className="relative text-xs text-white/85">Delivered in seconds</p>
        </Link>

        {/* Small tile — platform spotlight */}
        <Link
          href="/en/preorders"
          className="group relative rounded-[1.5rem] p-5 flex flex-col justify-end min-h-[8.5rem] sm:min-h-[10.5rem] overflow-hidden text-white sm:col-span-2 lg:col-span-2"
          style={{ background: 'linear-gradient(145deg, oklch(80% 0.17 85) 0%, oklch(62% 0.25 350) 100%)' }}
        >
          <span className="absolute top-4 right-4 rotate-[5deg]">
            <ArcadeStickerBadge tone="cyan">Limited</ArcadeStickerBadge>
          </span>
          <Sparkles className="relative h-7 w-7 mb-2" />
          <h3 className="relative font-heading text-lg font-bold">Pre-Order &amp; Save</h3>
          <p className="relative text-xs text-white/85">Lock in launch-day pricing on next-gen titles</p>
        </Link>
      </div>
    </section>
  );
}
