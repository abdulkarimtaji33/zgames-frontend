/**
 * ArcadeStickerBadge — a reusable "promo sticker" for the Arcade Pop skin,
 * built on the `.skin-sticker` / `.skin-sticker-cyan` CSS hooks already
 * defined in `src/styles/skins/arcade.css`. Plain-text children, small
 * footprint, meant for short callouts like "HOT", "-30%", "NEW", "BEST
 * SELLER" pinned to a corner of a card.
 *
 * Not wired into any page. Intended mount points (to be wired in by the
 * app, not by this component):
 *   - Absolutely positioned inside ProductCard, as an alternative/companion
 *     to the existing Badge components for an extra "hand-stuck-on"
 *     sticker moment (e.g. a rotated "HOT" sticker overlapping the image
 *     corner, in addition to the existing discount Badge).
 *   - On category tiles on the homepage for a "Popular" callout.
 *   - On the deals/preorders page section headers.
 *
 * On any skin other than "arcade" this renders its children in a plain
 * inline span with no rotation/shadow, so it is safe to leave mounted
 * when the user switches skins — it degrades to a no-op label rather
 * than disappearing or looking broken.
 */
'use client';

import type { ReactNode } from 'react';

interface ArcadeStickerBadgeProps {
  children: ReactNode;
  tone?: 'magenta' | 'cyan';
  className?: string;
}

export function ArcadeStickerBadge({ children, tone = 'magenta', className = '' }: ArcadeStickerBadgeProps) {
  const base = tone === 'cyan' ? 'skin-sticker-cyan' : 'skin-sticker';
  return (
    <span
      className={`${base} px-2.5 py-1 text-xs font-bold uppercase tracking-wide bg-accent text-white ${className}`}
    >
      {children}
    </span>
  );
}
