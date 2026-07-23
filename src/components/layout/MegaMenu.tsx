'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Zap, Clock, Tag, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MegaMenuProps {
  open: boolean;
  onClose: () => void;
}

const MENU_DATA = {
  consoles: {
    label: 'Console Gaming',
    sections: [
      {
        title: 'PlayStation',
        emoji: '🎮',
        links: [
          { label: 'PS5 Games', href: '/en/category/ps5-games' },
          { label: 'PS5 Consoles', href: '/en/category/ps5-consoles' },
          { label: 'PS5 Accessories', href: '/en/category/ps5-accessories' },
          { label: 'PS4 Games', href: '/en/category/ps4-games' },
          { label: 'PS4 Accessories', href: '/en/category/ps4-accessories' },
        ],
      },
      {
        title: 'Xbox',
        emoji: '🟢',
        links: [
          { label: 'Xbox Series X/S Games', href: '/en/category/xbox-series-games' },
          { label: 'Xbox Consoles', href: '/en/category/xbox-consoles' },
          { label: 'Xbox Accessories', href: '/en/category/xbox-accessories' },
          { label: 'Xbox One Games', href: '/en/category/xbox-one-games' },
        ],
      },
      {
        title: 'Nintendo',
        emoji: '🔴',
        links: [
          { label: 'Switch Games', href: '/en/category/switch-games' },
          { label: 'Switch Consoles', href: '/en/category/switch-consoles' },
          { label: 'Switch Accessories', href: '/en/category/switch-accessories' },
          { label: 'Switch Lite', href: '/en/category/switch-lite' },
        ],
      },
    ],
    featured: { label: 'PS5 Pro Bundle', badge: 'New', href: '/en/products/ps5-pro' },
  },
  pc: {
    label: 'PC Gaming',
    sections: [
      {
        title: 'Components',
        emoji: '⚙️',
        links: [
          { label: 'Graphics Cards (GPU)', href: '/en/category/gpu' },
          { label: 'Processors (CPU)', href: '/en/category/cpu' },
          { label: 'Memory (RAM)', href: '/en/category/ram' },
          { label: 'Storage (SSD)', href: '/en/category/ssd' },
          { label: 'Motherboards', href: '/en/category/motherboards' },
        ],
      },
      {
        title: 'Peripherals',
        emoji: '🖱️',
        links: [
          { label: 'Gaming Monitors', href: '/en/category/monitors' },
          { label: 'Keyboards', href: '/en/category/keyboards' },
          { label: 'Gaming Mice', href: '/en/category/mice' },
          { label: 'Headsets', href: '/en/category/headsets' },
          { label: 'Chairs', href: '/en/category/gaming-chairs' },
        ],
      },
      {
        title: 'PC Gaming Software',
        emoji: '💿',
        links: [
          { label: 'PC Games (Box)', href: '/en/category/pc-games' },
          { label: 'Gift Cards', href: '/en/category/pc-gift-cards' },
          { label: 'Xbox Game Pass', href: '/en/category/game-pass' },
          { label: 'PlayStation Plus', href: '/en/category/ps-plus' },
        ],
      },
    ],
    featured: { label: 'RTX 4090 In Stock!', badge: 'Hot', href: '/en/category/gpu' },
  },
  cards: {
    label: 'Trading Cards',
    sections: [
      {
        title: 'Pokémon TCG',
        emoji: '⚡',
        links: [
          { label: 'Booster Packs', href: '/en/category/pokemon-boosters' },
          { label: 'Elite Trainer Boxes', href: '/en/category/pokemon-etb' },
          { label: 'Theme Decks', href: '/en/category/pokemon-decks' },
          { label: 'Single Cards', href: '/en/category/pokemon-singles' },
        ],
      },
      {
        title: 'Yu-Gi-Oh!',
        emoji: '🃏',
        links: [
          { label: 'Booster Packs', href: '/en/category/yugioh-boosters' },
          { label: 'Structure Decks', href: '/en/category/yugioh-decks' },
          { label: 'Tin Sets', href: '/en/category/yugioh-tins' },
        ],
      },
      {
        title: 'Other TCG',
        emoji: '🎴',
        links: [
          { label: 'Magic: The Gathering', href: '/en/category/mtg' },
          { label: 'One Piece TCG', href: '/en/category/one-piece-tcg' },
          { label: 'Dragon Ball Super', href: '/en/category/dbs-tcg' },
        ],
      },
    ],
    featured: { label: 'Prismatic Evolution', badge: 'Limited', href: '/en/category/pokemon-boosters' },
  },
  more: {
    label: 'More',
    sections: [
      {
        title: 'Merchandise',
        emoji: '👕',
        links: [
          { label: 'Apparel & Clothing', href: '/en/category/apparel' },
          { label: 'Figures & Statues', href: '/en/category/figures' },
          { label: 'Posters & Art', href: '/en/category/posters' },
          { label: 'Plushies', href: '/en/category/plushies' },
        ],
      },
      {
        title: 'Collectibles',
        emoji: '🏆',
        links: [
          { label: 'Limited Editions', href: '/en/category/limited-editions' },
          { label: 'Collector\'s Sets', href: '/en/category/collectors' },
          { label: 'Vintage Games', href: '/en/category/vintage' },
        ],
      },
    ],
    featured: { label: 'Racing Corner', badge: 'New', href: '/en/category/racing' },
  },
};

type TabKey = keyof typeof MENU_DATA;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'consoles', label: 'Console Gaming' },
  { key: 'pc', label: 'PC Gaming' },
  { key: 'cards', label: 'Trading Cards' },
  { key: 'more', label: 'Merchandise' },
];

const QUICK_LINKS = [
  { icon: Zap, label: 'Flash Deals', href: '/en/deals', color: 'text-viz-3' },
  { icon: Clock, label: 'Pre-Orders', href: '/en/preorders', color: 'text-viz-4' },
  { icon: Tag, label: 'New Arrivals', href: '/en/new-arrivals', color: 'text-viz-2' },
  { icon: Star, label: 'Best Sellers', href: '/en/best-sellers', color: 'text-viz-5' },
];

/** Keeps the panel mounted through its exit transition before unmounting. */
function useMountedForExit(open: boolean): boolean {
  const [mounted, setMounted] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);

  // Adjust state during render when `open` changes, rather than in an
  // effect, so opening shows the panel on the same render (no flash).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMounted(true);
  }

  useEffect(() => {
    if (open || !mounted) return;
    const t = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(t);
  }, [open, mounted]);

  return mounted;
}

export function MegaMenu({ open, onClose }: MegaMenuProps) {
  const mounted = useMountedForExit(open);

  if (!mounted) return null;

  return (
    <div
      data-transition-panel
      data-state={open ? 'open' : 'closed'}
      className="w-full glass border-t-0 shadow-lg origin-top"
    >
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        {/* Quick links strip */}
        <div className="flex gap-6 mb-6 border-b border-border pb-4">
          {QUICK_LINKS.map(({ icon: Icon, label, href, color }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className={cn('h-4 w-4 group-hover:scale-110 transition-transform', color)} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-4 gap-8">
          {TABS.map(({ key }) => {
            const section = MENU_DATA[key];
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
                    {section.label}
                  </h3>
                  <ChevronRight className="h-3.5 w-3.5 text-foreground-subtle" />
                </div>

                <div className="space-y-4">
                  {section.sections.map((sub) => (
                    <div key={sub.title}>
                      <p className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span aria-hidden>{sub.emoji}</span>
                        <span>{sub.title}</span>
                      </p>
                      <ul className="space-y-1">
                        {sub.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className="text-sm text-foreground-muted hover:text-accent transition-colors block py-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Featured callout */}
                {section.featured && (
                  <Link
                    href={section.featured.href}
                    onClick={onClose}
                    className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex-1 text-sm font-medium text-accent group-hover:underline">
                      {section.featured.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-white font-medium">
                      {section.featured.badge}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom banner */}
        <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4">
          <Link
            href="/en/preorders"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-lg bg-viz-4/20 border border-viz-4/30 hover:border-viz-4/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-2xl" aria-hidden>⏰</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Pre-Orders Open</p>
              <p className="text-xs text-foreground-muted">Secure yours before launch</p>
            </div>
          </Link>
          <Link
            href="/en/coming-soon"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20 hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-2xl" aria-hidden>🔥</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Coming Soon</p>
              <p className="text-xs text-foreground-muted">Upcoming releases & drops</p>
            </div>
          </Link>
          <Link
            href="/en/deals"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-lg bg-viz-2/20 border border-viz-2/30 hover:border-viz-2/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-2xl" aria-hidden>💰</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Flash Deals</p>
              <p className="text-xs text-foreground-muted">Limited time discounts</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
