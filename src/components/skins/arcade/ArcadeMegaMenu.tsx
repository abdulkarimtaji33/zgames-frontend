'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Zap, Clock, Tag, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PLATFORMS } from '@/lib/hooks/useStorefrontData';

interface ArcadeMegaMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Grid of colorful tiles" mega menu — the opposite of a dense
 * multi-column dropdown. Each category is its own big, colorful,
 * clickable tile with an emoji icon and a one-line hook. Feels like
 * tapping into a mobile game store's category screen, not scanning a
 * spreadsheet of links.
 */
const TILES: { label: string; href: string; emoji: string; hue: string; hint: string }[] = [
  { label: 'PlayStation', href: '/en/category/playstation', emoji: '🎮', hue: 'var(--viz-1)', hint: 'Games & consoles' },
  { label: 'Xbox', href: '/en/category/xbox', emoji: '🟢', hue: 'var(--viz-2)', hint: 'Game Pass & more' },
  { label: 'Nintendo', href: '/en/category/nintendo', emoji: '🔴', hue: 'var(--viz-6)', hint: 'Switch & beyond' },
  { label: 'PC Gaming', href: '/en/category/pc-gaming', emoji: '⚙️', hue: 'var(--viz-5)', hint: 'Parts & peripherals' },
  { label: 'Trading Cards', href: '/en/category/trading-cards', emoji: '🃏', hue: 'var(--viz-4)', hint: 'Pokémon, MTG & more' },
  { label: 'Gift Cards', href: '/en/category/pc-gift-cards', emoji: '💳', hue: 'var(--viz-3)', hint: 'Digital codes, instant' },
  { label: 'Merch', href: '/en/category/merchandise', emoji: '👕', hue: 'var(--viz-2)', hint: 'Apparel & figures' },
  { label: 'Accessories', href: '/en/category/accessories', emoji: '🎧', hue: 'var(--viz-1)', hint: 'Controllers & gear' },
];

const QUICK_LINKS = [
  { icon: Zap, label: 'Flash Deals', href: '/en/deals' },
  { icon: Clock, label: 'Pre-Orders', href: '/en/preorders' },
  { icon: Tag, label: 'New Drops', href: '/en/new-arrivals' },
  { icon: Star, label: 'Best Sellers', href: '/en/best-sellers' },
];

function useMountedForExit(open: boolean): boolean {
  const [mounted, setMounted] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMounted(true);
  }
  useEffect(() => {
    if (open || !mounted) return;
    const t = setTimeout(() => setMounted(false), 260);
    return () => clearTimeout(t);
  }, [open, mounted]);
  return mounted;
}

export function ArcadeMegaMenu({ open, onClose }: ArcadeMegaMenuProps) {
  const mounted = useMountedForExit(open);
  if (!mounted) return null;

  return (
    <div
      data-transition-panel
      data-state={open ? 'open' : 'closed'}
      className="absolute left-0 top-full z-40 w-full origin-top"
    >
      <div className="mx-4 mt-2 sm:mx-6 rounded-2xl border border-border bg-surface-1 shadow-lg p-5 sm:p-6">
        {/* Quick links strip */}
        <div className="flex flex-wrap gap-2 mb-5">
          {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="skin-sticker inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 text-xs font-bold text-foreground hover:bg-accent hover:text-white transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>

        {/* Tile grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              onClick={onClose}
              className="group relative rounded-xl p-4 overflow-hidden border border-border bg-surface-2 transition-transform duration-[var(--duration-base)] ease-[var(--ease-standard)] hover:-translate-y-1 hover:rotate-[-0.5deg] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 transition-transform duration-300 group-hover:scale-125"
                style={{ background: tile.hue }}
                aria-hidden
              />
              <span className="relative text-2xl" aria-hidden>{tile.emoji}</span>
              <p className="relative mt-2 font-heading text-sm font-bold text-foreground">{tile.label}</p>
              <p className="relative text-xs text-foreground-muted">{tile.hint}</p>
            </Link>
          ))}
        </div>

        {/* Platform shortcuts */}
        <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <Link
              key={p.slug}
              href={`/en/category/${p.slug}`}
              onClick={onClose}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border border-border text-foreground-muted',
                'hover:border-accent hover:text-accent transition-colors',
              )}
            >
              {p.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
