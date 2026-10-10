/**
 * ArcadeConfettiBurst — decorative, purely cosmetic backdrop for the
 * "Arcade Pop" skin. Renders a handful of absolutely-positioned shapes
 * (rounded squares, dots, a dashed ring) in the skin's magenta/cyan/amber
 * palette, scattered with slight rotation to feel hand-placed rather than
 * a generated pattern.
 *
 * Not wired into any page. Intended mount points (to be wired in by the
 * app, not by this component):
 *   - Behind the homepage hero slider, as a sibling of `.skin-hero`
 *     (absolutely positioned wrapper, z-index below the slider content).
 *   - Behind empty-state illustrations (cart/wishlist/orders empty states)
 *     for a little visual noise instead of a flat blank card.
 *   - Behind the auth pages (login/register/forgot-password) card, on the
 *     page background, so those otherwise plain centered-card pages pick
 *     up the skin's energy too.
 *
 * Usage:
 *   <div className="relative">
 *     <ArcadeConfettiBurst />
 *     <YourContent />
 *   </div>
 *
 * It is `aria-hidden` and `pointer-events-none`, sized to fill its
 * nearest positioned ancestor (absolute inset-0) — wrap it in a
 * `relative` or `absolute` container with defined bounds. It renders
 * nothing (returns null) unless the "arcade" skin is active, so it is
 * always safe to mount even while another skin is selected.
 */
'use client';

import { useEffect, useState } from 'react';

interface ConfettiShape {
  id: number;
  top: string;
  left: string;
  size: number;
  rotate: number;
  kind: 'square' | 'dot' | 'ring';
  hue: 'accent' | 'orange' | 'viz4';
}

const SHAPES: ConfettiShape[] = [
  { id: 1, top: '8%', left: '4%', size: 18, rotate: -12, kind: 'square', hue: 'accent' },
  { id: 2, top: '72%', left: '2%', size: 10, rotate: 0, kind: 'dot', hue: 'orange' },
  { id: 3, top: '14%', left: '92%', size: 14, rotate: 20, kind: 'square', hue: 'orange' },
  { id: 4, top: '85%', left: '90%', size: 26, rotate: 0, kind: 'ring', hue: 'viz4' },
  { id: 5, top: '45%', left: '96%', size: 8, rotate: 0, kind: 'dot', hue: 'accent' },
  { id: 6, top: '92%', left: '45%', size: 12, rotate: -8, kind: 'square', hue: 'viz4' },
  { id: 7, top: '4%', left: '48%', size: 9, rotate: 0, kind: 'dot', hue: 'orange' },
];

const HUE_VAR: Record<ConfettiShape['hue'], string> = {
  accent: 'var(--accent)',
  orange: 'var(--accent-orange)',
  viz4: 'var(--viz-4)',
};

export function ArcadeConfettiBurst({ className = '' }: { className?: string }) {
  // Guard against SSR/skin mismatch flash: only render once we can see the
  // skin attribute on <html>, and bail entirely for any other skin.
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(document.documentElement.getAttribute('data-skin') === 'arcade');
    const observer = new MutationObserver(() => {
      setActive(document.documentElement.getAttribute('data-skin') === 'arcade');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
    return () => observer.disconnect();
  }, []);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {SHAPES.map((s) => {
        const common = {
          position: 'absolute' as const,
          top: s.top,
          left: s.left,
          width: s.size,
          height: s.size,
          transform: `rotate(${s.rotate}deg)`,
          opacity: 0.35,
        };
        if (s.kind === 'ring') {
          return (
            <span
              key={s.id}
              style={{
                ...common,
                border: `2px dashed ${HUE_VAR[s.hue]}`,
                borderRadius: '9999px',
              }}
            />
          );
        }
        return (
          <span
            key={s.id}
            style={{
              ...common,
              background: HUE_VAR[s.hue],
              borderRadius: s.kind === 'dot' ? '9999px' : '30%',
            }}
          />
        );
      })}
    </div>
  );
}
