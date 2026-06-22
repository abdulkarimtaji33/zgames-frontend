'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

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
  { emoji: '📸', href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
  { emoji: '𝕏', href: '#', label: 'Twitter/X', color: 'hover:text-sky-400' },
  { emoji: '📘', href: '#', label: 'Facebook', color: 'hover:text-blue-400' },
  { emoji: '▶️', href: '#', label: 'YouTube', color: 'hover:text-red-400' },
];

export function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border mt-auto">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1440px] px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-1">
                Join the <span className="text-accent">ZGames</span> Community
              </h3>
              <p className="text-sm text-foreground-muted">
                Get the latest gaming news, exclusive deals & early access to new arrivals.
              </p>
            </div>
            <form className="flex gap-2 w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 rounded-full bg-background-tertiary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="rounded-full bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors whitespace-nowrap"
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
            <Link href="/en" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded bg-accent flex items-center justify-center font-heading font-bold text-white text-sm">Z</div>
              <span className="font-heading text-2xl font-bold">
                <span className="text-accent">Z</span>
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
                <span>+971 4 XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Mail className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                <span>support@zgames.ae</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-foreground-muted">
                <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
                <span>Dubai, United Arab Emirates</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ emoji, href, label, color }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`p-2 rounded-lg bg-background-tertiary border border-border text-foreground-muted ${color} hover:border-border-hover transition-colors text-sm leading-none`}
                >
                  {emoji}
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
                      className="text-sm text-foreground-muted hover:text-accent transition-colors"
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
          <div className="flex items-center gap-4">
            <p className="text-sm text-foreground-muted">Download the app:</p>
            <a
              href="#"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-background-tertiary border border-border text-sm text-foreground-muted hover:border-border-hover transition-colors"
            >
              <span>🍎</span>
              <span>App Store</span>
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-background-tertiary border border-border text-sm text-foreground-muted hover:border-border-hover transition-colors"
            >
              <span>🤖</span>
              <span>Google Play</span>
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </div>

          {/* Payment methods */}
          <div className="flex items-center gap-2">
            <p className="text-xs text-foreground-subtle mr-1">We accept:</p>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded bg-background-tertiary border border-border text-xs text-foreground-muted font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground-subtle">
          <p>© {new Date().getFullYear()} ZGames. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/en/terms" className="hover:text-foreground-muted transition-colors">Terms</Link>
            <Link href="/en/privacy" className="hover:text-foreground-muted transition-colors">Privacy</Link>
            <Link href="/en/faq" className="hover:text-foreground-muted transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
