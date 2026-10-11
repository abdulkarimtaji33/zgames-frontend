'use client';

import Link from 'next/link';
import { Camera, X as XIcon, ArrowUpRight } from 'lucide-react';
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils/cn';

// lucide-react in this version ships no brand/social glyphs, so Facebook and
// YouTube are drawn inline in the same stroke style as the rest of the icon
// set (currentColor, 1.75px stroke) — mirrors the approach used elsewhere
// in this codebase for the same gap.
function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const CHAPTERS = [
  { label: 'About the Vault', href: '/en/about' },
  { label: 'Contact', href: '/en/contact' },
  { label: 'FAQ', href: '/en/faq' },
  { label: 'Blog', href: '/en/blog' },
];

const LEGAL = [
  { label: 'Privacy Policy', href: '/en/privacy' },
  { label: 'Terms & Conditions', href: '/en/terms' },
  { label: 'Returns Policy', href: '/en/returns-policy' },
  { label: 'Delivery Policy', href: '/en/delivery-policy' },
];

const ACCOUNT = [
  { label: 'Sign In / Register', href: '/login' },
  { label: 'My Orders', href: '/orders' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Track Order', href: '/en/track-order' },
];

const SOCIALS = [
  { icon: Camera, href: '#', label: 'Instagram' },
  { icon: XIcon, href: '#', label: 'Twitter / X' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: YoutubeIcon, href: '#', label: 'YouTube' },
];

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * VaultFooter — an editorial close rather than a shrunk 4-column link dump.
 * Leads with a large "join the vault" newsletter statement treated like a
 * closing title card, then a quiet three-group link index, then a thin
 * legal bar. Keeps every link category the old footer had, just paced and
 * weighted differently.
 */
export function VaultFooter() {
  return (
    <footer className="mt-auto bg-[var(--surface-0)] border-t border-border">
      {/* Newsletter — treated as a title card, not a form bolted onto a nav row */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="font-heading text-xs uppercase tracking-[0.25em] text-[color:var(--color-accent-orange)] mb-4">
              Stay Inside
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-foreground leading-tight mb-6">
              Get first access to the next <span className="skin-glow-text">drop</span>.
            </h2>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-lg"
            >
              <input
                type="email"
                required
                placeholder="your@email.com"
                className={cn(
                  'flex-1 min-w-0 rounded-md bg-surface-1 border border-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle transition-colors',
                  'focus:outline-none focus:border-[color:var(--color-action)] focus:ring-2 focus:ring-ring',
                )}
              />
              <button
                type="submit"
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-6 py-3 text-sm font-medium hover:bg-accent-hover active:scale-95 transition-colors whitespace-nowrap',
                  focusRing,
                )}
              >
                Notify Me <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Link index */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          {/* Brand */}
          <div>
            <span className="font-heading text-2xl font-bold tracking-[0.08em] skin-glow-text">VAULT</span>
            <p className="text-sm text-foreground-muted mt-4 leading-relaxed max-w-sm">
              A premium gaming &amp; gift-card vault for the GCC — consoles, keys, top-ups and
              collectibles, curated and dropped on rotation.
            </p>
            <div className="flex gap-2 mt-6">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className={cn(
                    'skin-plate h-9 w-9 grid place-items-center text-foreground-muted hover:text-foreground transition-colors',
                    focusRing,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <FooterColumn title="Vault" links={CHAPTERS} />
          <FooterColumn title="Account" links={ACCOUNT} />
          <FooterColumn title="Legal" links={LEGAL} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground-subtle">
          <p>© {new Date().getFullYear()} Vault — a CGA Games property. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/en/terms" className={cn('hover:text-foreground-muted transition-colors', focusRing)}>Terms</Link>
            <Link href="/en/privacy" className={cn('hover:text-foreground-muted transition-colors', focusRing)}>Privacy</Link>
            <Link href="/en/faq" className={cn('hover:text-foreground-muted transition-colors', focusRing)}>FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground-subtle mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={cn('text-sm text-foreground-muted hover:text-foreground transition-colors', focusRing)}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
