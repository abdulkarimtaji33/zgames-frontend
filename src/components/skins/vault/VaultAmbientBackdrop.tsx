'use client';

import { useSkin } from '@/lib/theme/skin';

/**
 * VaultAmbientBackdrop — a fixed, full-viewport, non-interactive layer of
 * very low-opacity violet/cyan glows plus a faint grid, meant to sit behind
 * all storefront/customer-dashboard content for ambient "lit vault" depth
 * that a flat `background: var(--surface-0)` can't give on its own.
 *
 * Not wired into any layout — intended mount point is near the top of
 * `src/app/(store)/[locale]/layout.tsx` and `src/app/(customer)/layout.tsx`,
 * as the first child inside the `data-shop` wrapper, e.g.:
 *
 *   <div data-shop>
 *     <VaultAmbientBackdrop />
 *     <Header />
 *     ...
 *   </div>
 *
 * It renders nothing when the active skin isn't "vault", so it is safe to
 * mount unconditionally even while the sibling Arcade skin is active.
 */
export function VaultAmbientBackdrop() {
  const { skin } = useSkin();
  if (skin !== 'vault') return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Two slow, large, soft glows — violet top-left, cyan bottom-right.
          Kept at ~8-10% opacity so they read as ambient lighting, not a
          decoration anyone consciously notices. */}
      <div
        className="absolute -top-1/4 -left-1/4 h-[60vmax] w-[60vmax] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(66% 0.23 295 / 10%), transparent 70%)' }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[55vmax] w-[55vmax] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(74% 0.13 205 / 8%), transparent 70%)' }}
      />
      {/* Faint structural grid — reads as "vault blueprint / security grid"
          at a glance, invisible unless you look for it. */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(oklch(100% 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(100% 0 0 / 1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}
