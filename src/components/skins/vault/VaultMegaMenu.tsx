'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PLATFORMS } from '@/lib/hooks/useStorefrontData';
import type { Category } from '@/types';

interface VaultMegaMenuProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  isLoading: boolean;
}

/**
 * VaultMegaMenu — a full-screen "chapters" takeover, not a dropdown.
 *
 * Concept: the vault's catalogue is framed as chapters in a case file.
 * The left column lists every chapter (category) as plain, large type;
 * hovering/focusing one swaps the right-hand pane to a full-bleed image
 * treatment for that chapter plus a "Platforms" quick-jump row along the
 * bottom. This is deliberately NOT a multi-column link dump — it's one
 * big decision at a time, cinematic rather than dense.
 */
export function VaultMegaMenu({ open, onClose, categories, isLoading }: VaultMegaMenuProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const active = categories[activeIdx];

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-[var(--surface-0)] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Browse chapters"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border px-5 sm:px-10 py-4 sm:py-5 flex-shrink-0">
        <span className="font-heading text-xs sm:text-sm uppercase tracking-[0.2em] text-foreground-subtle">
          The Catalogue — Browse by Chapter
        </span>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="flex items-center gap-2 rounded-md p-2 text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="hidden sm:inline text-xs uppercase tracking-wide">Close</span>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body: chapter list + key-art preview */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1440px] grid lg:grid-cols-[minmax(0,480px)_1fr] min-h-full">
          {/* Chapter list */}
          <nav className="px-5 sm:px-10 py-6 sm:py-10 border-b lg:border-b-0 lg:border-r border-border">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 w-2/3 rounded-md bg-surface-1 animate-pulse" />
                ))}
              </div>
            ) : (
              <ul>
                {categories.map((cat, i) => (
                  <li key={cat.id} className="border-b border-border/60 last:border-b-0">
                    <Link
                      href={`/en/category/${cat.slug}`}
                      onClick={onClose}
                      onMouseEnter={() => setActiveIdx(i)}
                      onFocus={() => setActiveIdx(i)}
                      className={cn(
                        'group flex items-center justify-between gap-4 py-4 sm:py-5 transition-colors rounded-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      )}
                    >
                      <span className="flex items-baseline gap-3 sm:gap-4">
                        <span className="font-heading text-xs text-foreground-subtle tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={cn(
                            'font-heading text-2xl sm:text-4xl font-semibold tracking-wide transition-colors',
                            i === activeIdx ? 'skin-glow-text' : 'text-foreground group-hover:text-foreground',
                          )}
                        >
                          {cat.name}
                        </span>
                      </span>
                      <ArrowUpRight
                        className={cn(
                          'h-5 w-5 flex-shrink-0 transition-all',
                          i === activeIdx ? 'text-[color:var(--color-action)] translate-x-0' : 'text-foreground-subtle -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0',
                        )}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Platforms quick-jump */}
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle mb-3">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/en/category/${p.slug}`}
                    onClick={onClose}
                    className="skin-plate px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Key-art preview pane */}
          <div className="relative hidden lg:block overflow-hidden bg-surface-1">
            {active ? (
              <Link href={`/en/category/${active.slug}`} onClick={onClose} className="skin-hero absolute inset-0 block">
                {active.imageUrl || active.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.imageUrl || active.image}
                    alt={active.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(70% 60% at 30% 20%, var(--accent-glow), transparent 60%), var(--surface-2)',
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-0)] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-10">
                  <p className="font-heading text-xs uppercase tracking-[0.2em] text-foreground-subtle mb-2">
                    Chapter {String(activeIdx + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-heading text-4xl font-bold text-foreground mb-3">{active.name}</h3>
                  {active.description && (
                    <p className="max-w-md text-sm text-foreground-muted line-clamp-2">{active.description}</p>
                  )}
                </div>
              </Link>
            ) : (
              <div className="absolute inset-0 grid place-items-center text-foreground-subtle text-sm">
                No chapters available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
