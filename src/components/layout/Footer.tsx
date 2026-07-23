'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, ExternalLink, Camera, X as XIcon } from 'lucide-react';
import type { SVGProps } from 'react';

// lucide-react no longer ships brand/social icons in this version, so
// Facebook and YouTube are represented as small inline glyphs drawn in the
// same stroke style as the rest of the icon set (currentColor, 1.75px stroke).
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

const FOOTER_LINKS = {
  shop: {
    title: 'Shop',
    links: [
      { label: 'PlayStation', href: '/en/category/playstation' },
      { label: 'Xbox', href: '/en/category/xbox' },
      { label: 'Nintendo', href: '/en/category/nintendo' },
      { label: 'PC Gaming', href: '/en/category/pc-gaming' },
      { label: 'Trading Cards', href: '/en/category/trading-cards' },
      { label: 'Merchandise', href: '/en/category/merchandise' },
      { label: 'Accessories', href: '/en/category/accessories' },
    ],
  },
  discover: {
    title: 'Discover',
    links: [
      { label: 'New Arrivals', href: '/en/new-arrivals' },
      { label: 'Best Sellers', href: '/en/best-sellers' },
      { label: 'Flash Deals', href: '/en/deals' },
      { label: 'Pre-Orders', href: '/en/preorders' },
      { label: 'Coming Soon', href: '/en/coming-soon' },
      { label: 'Blog', href: '/en/blog' },
      { label: 'Store Locator', href: '/en/store-locator' },
    ],
  },
  account: {
    title: 'My Account',
    links: [
      { label: 'Login / Register', href: '/login' },
      { label: 'My Orders', href: '/orders' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Track My Order', href: '/en/track-order' },
      { label: 'Loyalty Rewards', href: '/loyalty' },
      { label: 'Store Credit', href: '/store-credit' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { label: 'Help & FAQ', href: '/en/faq' },
      { label: 'Contact Us', href: '/en/contact' },
      { label: 'Return Policy', href: '/en/returns-policy' },
      { label: 'Delivery Policy', href: '/en/delivery-policy' },
      { label: 'Terms & Conditions', href: '/en/terms' },
      { label: 'Privacy Policy', href: '/en/privacy' },
    ],
  },
};

const PAYMENT_METHODS = ['VISA', 'MC', 'AMEX', 'Apple Pay', 'Tabby', 'Tamara', 'COD'];
const SOCIAL_LINKS = [
  { icon: Camera, href: '#', label: 'Instagram' },
  { icon: XIcon, href: '#', label: 'Twitter/X' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: YoutubeIcon, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-surface-1 border-t border-border mt-auto">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1440px] px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full text-center md:text-left">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-1">
                Join the <span className="text-accent">CGA Games</span> Community
              </h3>
              <p className="text-sm text-foreground-muted">
                Get the latest gaming news, exclusive deals & early access to new arrivals.
              </p>
            </div>
            <form className="flex gap-2 w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 min-w-0 rounded-full bg-surface-2 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-ring transition-colors"
              />
              <button
                type="submit"
                className="rounded-full bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-hover active:scale-95 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/en" className="flex items-center gap-2 mb-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center font-heading font-bold text-white text-sm">C</div>
              <span className="font-heading text-2xl font-bold">
                <span className="text-accent">CGA</span>
                <span className="text-foreground">GAMES</span>
              </span>
            </Link>
            <p className="text-sm text-foreground-muted mb-4 leading-relaxed">
              Your ultimate gaming destination in the GCC. Shop the latest consoles, games, trading cards, accessories, and collectibles.
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Phone className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                {/* Placeholder number — styled as a pending value, not a real hotline */}
                <span className="italic text-foreground-subtle">+971 4 XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Mail className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                <span>support@cgagames.com</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-foreground-muted">
                <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
                <span>Dubai, United Arab Emirates</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2.5 sm:p-2 rounded-lg bg-surface-1 border border-border text-foreground-muted hover:text-foreground hover:border-border-hover hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground-muted hover:text-accent transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App download */}
        <div className="mt-10 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
            <p className="text-sm text-foreground-muted">Download the app:</p>
            <a
              href="#"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-1 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-border-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>App Store</span>
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-1 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-border-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>Google Play</span>
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </div>

          {/* Payment methods */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-foreground-subtle mr-1">We accept:</p>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded-md bg-surface-1 border border-border text-xs text-foreground-muted font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground-subtle">
          <p>© {new Date().getFullYear()} CGA Games. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/en/terms" className="rounded-sm hover:text-foreground-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Terms</Link>
            <Link href="/en/privacy" className="rounded-sm hover:text-foreground-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Privacy</Link>
            <Link href="/en/faq" className="rounded-sm hover:text-foreground-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
