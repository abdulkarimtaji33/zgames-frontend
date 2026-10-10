'use client';

import Link from 'next/link';
import { Mail, MapPin, Camera, X as XIcon } from 'lucide-react';
import type { SVGProps } from 'react';
import { ArcadeStickerBadge } from './ArcadeStickerBadge';

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

const SOCIAL_LINKS = [
  { icon: Camera, href: '#', label: 'Instagram' },
  { icon: XIcon, href: '#', label: 'Twitter/X' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: YoutubeIcon, href: '#', label: 'YouTube' },
];

const LINK_TILES = [
  { label: 'About Us', href: '/en/about', emoji: '\u{1F3AE}' },
  { label: 'Contact', href: '/en/contact', emoji: '\u{1F4EC}' },
  { label: 'FAQ', href: '/en/faq', emoji: '❓' },
  { label: 'Blog', href: '/en/blog', emoji: '\u{1F4F0}' },
  { label: 'Privacy', href: '/en/privacy', emoji: '\u{1F512}' },
  { label: 'Terms', href: '/en/terms', emoji: '\u{1F4DC}' },
];

/**
 * Arcade Pop footer — a playful closer instead of a shrunk 4-column
 * reference footer: a big "join the arcade" newsletter stripe, link
 * destinations rendered as sticker-style tappable tiles, a trust/social
 * strip, and a cheeky sign-off line.
 */
export function ArcadeFooter() {
  return (
    <footer className="mt-auto bg-surface-1 border-t-2 border-border">
      {/* Newsletter banner */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-10">
        <div
          className="skin-hero relative rounded-[1.75rem] p-6 sm:p-8 overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-5"
          style={{ background: 'linear-gradient(120deg, var(--color-action) 0%, var(--color-accent-orange) 100%)' }}
        >
          <div className="relative text-center md:text-left">
            <span className="rotate-[-4deg] inline-block mb-2">
              <ArcadeStickerBadge tone="cyan">Join the arcade</ArcadeStickerBadge>
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold leading-tight">
              Get drops, deals &amp; secret codes
            </h3>
            <p className="text-sm text-white/90 mt-1">No spam. Just the good stuff, straight to your inbox.</p>
          </div>
          <form
            className="relative flex w-full md:w-auto max-w-md gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 min-w-0 rounded-full bg-white/95 text-foreground px-4 py-2.5 text-sm placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="rounded-full bg-[color:var(--text-primary)] text-white px-5 py-2.5 text-sm font-bold whitespace-nowrap hover:opacity-90 active:scale-95 transition"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>

      {/* Link tiles + brand column */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/en" className="inline-flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center font-heading font-bold text-white">Z</div>
              <span className="font-heading text-xl font-bold text-accent">ZGAMES!</span>
            </Link>
            <p className="text-sm text-foreground-muted leading-relaxed mb-4 max-w-sm">
              Your favorite corner of the internet for games, consoles, trading cards &amp; gaming gear &mdash; stocked fresh, shipped fast.
            </p>
            <div className="space-y-1.5 mb-4 text-sm text-foreground-muted">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-accent" /> support@zgames.com</div>
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-accent" /> Dubai, United Arab Emirates</div>
            </div>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-surface-2 border border-border text-foreground-muted hover:bg-accent hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sticker link tiles */}
          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground-subtle mb-3">Quick links</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LINK_TILES.map((tile) => (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className="flex items-center gap-2 rounded-xl bg-surface-2 border border-border px-3.5 py-3 text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  <span aria-hidden>{tile.emoji}</span> {tile.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-foreground-subtle">
          <p>&copy; {new Date().getFullYear()} ZGAMES. Built different, played harder.</p>
          <p>Press start to continue shopping {'\u{1F579}️'}</p>
        </div>
      </div>
    </footer>
  );
}
