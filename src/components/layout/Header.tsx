'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, ShoppingCart, Heart, User, Menu, X,
  ChevronDown, DollarSign, Bell, LogOut,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { cn } from '@/lib/utils/cn';
import { MegaMenu } from './MegaMenu';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';

const NAV_ITEMS = [
  { label: 'Shop', href: '#', hasMega: true },
  { label: 'Deals', href: '/en/deals' },
  { label: 'Pre-Orders', href: '/en/preorders' },
  { label: 'New Arrivals', href: '/en/new-arrivals' },
  { label: 'Blog', href: '/en/blog' },
];

const COUNTRIES = [
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', name: 'KSA', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
];

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const submitSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    router.push(`/en/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const { customer: user, isAuthenticated, clearAuth } = useAuthStore();
  const { country, setCountry } = useUIStore();
  const { selected: currency, currencies, setCurrency } = useCurrencyStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close the mega menu on outside click / Escape.
  useEffect(() => {
    if (!megaOpen) return;
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMegaOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [megaOpen]);

  const selectedCountry = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];

  return (
    <>
      {/* ── Top strip ─────────────────────────────── */}
      <div className="hidden md:flex items-center justify-between bg-surface-1 border-b border-border px-4 py-1.5 text-xs text-foreground-muted">
        <span>Free shipping on orders over AED 150 · Same day delivery in Dubai</span>
        <div className="flex items-center gap-4">
          <Link href="/en/store-locator" className={cn('rounded-sm hover:text-foreground transition-colors', focusRing)}>Store Locator</Link>
          <Link href="/en/track-order" className={cn('rounded-sm hover:text-foreground transition-colors', focusRing)}>Track Order</Link>
          <Link href="/en/faq" className={cn('rounded-sm hover:text-foreground transition-colors', focusRing)}>Help</Link>
        </div>
      </div>

      {/* ── Main header ───────────────────────────── */}
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-shadow duration-300',
          scrolled ? 'glass shadow-md border-border' : 'bg-surface-0 border-border/60',
        )}
      >
        <div className="mx-auto max-w-[1440px] px-3 sm:px-4 md:px-6">
          <div className="flex h-16 items-center gap-2 sm:gap-4">
            {/* Logo */}
            <Link href="/en" className={cn('flex-shrink-0 flex items-center gap-1.5 sm:gap-2 group rounded-md', focusRing)}>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-accent flex items-center justify-center font-heading font-bold text-white text-sm group-hover:scale-105 transition-transform">C</div>
              <span className="font-heading text-lg sm:text-2xl font-bold sm:tracking-wide whitespace-nowrap">
                <span className="text-accent">CGA</span>
                <span className="text-foreground">GAMES</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              {NAV_ITEMS.map((item) =>
                item.hasMega ? (
                  <button
                    key={item.label}
                    onClick={() => setMegaOpen((o) => !o)}
                    aria-expanded={megaOpen}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors active:scale-[0.97]',
                      megaOpen ? 'text-accent bg-accent/10' : 'text-foreground-muted hover:text-foreground hover:bg-surface-1',
                      focusRing,
                    )}
                  >
                    {item.label}
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', megaOpen && 'rotate-180')} />
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors',
                      focusRing,
                    )}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            {/* Search bar (md+) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <form
                onSubmit={(e) => { e.preventDefault(); submitSearch(desktopSearchQuery); }}
                className="relative w-full"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
                <input
                  type="text"
                  value={desktopSearchQuery}
                  onChange={(e) => setDesktopSearchQuery(e.target.value)}
                  placeholder="Search games, consoles, accessories..."
                  className={cn(
                    'w-full rounded-full bg-surface-1 border border-border pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-subtle transition-colors',
                    'focus:outline-none focus:border-accent focus:ring-2 focus:ring-ring',
                  )}
                />
              </form>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
              {/* Search (mobile) */}
              <button
                onClick={() => setSearchOpen((o) => !o)}
                className={cn('md:hidden p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors active:scale-95', focusRing)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Country switcher */}
              <div className="hidden sm:block">
                <Dropdown
                  align="right"
                  trigger={({ open, toggle }) => (
                    <button
                      onClick={toggle}
                      aria-expanded={open}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-colors active:scale-95',
                        open ? 'text-foreground bg-surface-1' : 'text-foreground-muted hover:text-foreground hover:bg-surface-1',
                        focusRing,
                      )}
                    >
                      <span aria-hidden>{selectedCountry.flag}</span>
                      <span className="hidden lg:inline">{selectedCountry.name}</span>
                      <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')} />
                    </button>
                  )}
                >
                  {COUNTRIES.map((c) => (
                    <DropdownItem
                      key={c.code}
                      onClick={() => setCountry(c.code)}
                      className={cn(country === c.code ? 'text-accent' : 'text-foreground-muted')}
                    >
                      <span aria-hidden>{c.flag}</span>
                      <span>{c.name}</span>
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>

              {/* Currency switcher */}
              <div className="hidden lg:block">
                <Dropdown
                  align="right"
                  trigger={({ open, toggle }) => (
                    <button
                      onClick={toggle}
                      aria-expanded={open}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-colors active:scale-95',
                        open ? 'text-foreground bg-surface-1' : 'text-foreground-muted hover:text-foreground hover:bg-surface-1',
                        focusRing,
                      )}
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>{currency.code}</span>
                      <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')} />
                    </button>
                  )}
                >
                  {currencies.map((c) => (
                    <DropdownItem
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      className={cn('justify-between', currency.code === c.code ? 'text-accent' : 'text-foreground-muted')}
                    >
                      <span>{c.code}</span>
                      <span className="text-xs text-foreground-subtle">{c.symbol}</span>
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>

              <ThemeToggle />

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className={cn('relative p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors hidden sm:flex active:scale-95', focusRing)}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/en/cart"
                className={cn('relative p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors active:scale-95', focusRing)}
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center animate-count-badge">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {isAuthenticated ? (
                <Dropdown
                  align="right"
                  trigger={({ open, toggle }) => (
                    <button
                      onClick={toggle}
                      aria-expanded={open}
                      className={cn('flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-1 transition-colors active:scale-95', focusRing)}
                    >
                      <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
                        {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <span className="hidden lg:inline text-sm text-foreground">{user?.firstName}</span>
                    </button>
                  )}
                >
                  <div className="px-3.5 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-foreground-muted truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    className={cn('flex items-center gap-2 px-3.5 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}
                  >
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <Link
                    href="/orders"
                    role="menuitem"
                    className={cn('flex items-center gap-2 px-3.5 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}
                  >
                    <Bell className="h-4 w-4" /> Orders
                  </Link>
                  <DropdownItem onClick={clearAuth} className="text-error hover:bg-error/10 focus-visible:bg-error/10">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownItem>
                </Dropdown>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-sm font-medium transition-colors hover:bg-accent-hover active:scale-95',
                    focusRing,
                  )}
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className={cn('lg:hidden p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors ml-0 sm:ml-1 active:scale-95', focusRing)}
                aria-label="Menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {searchOpen && (
            <div className="md:hidden pb-3 animate-slide-down">
              <form onSubmit={(e) => { e.preventDefault(); submitSearch(searchQuery); }} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games, consoles..."
                  className="w-full rounded-full bg-surface-1 border border-border pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className={cn('absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground rounded-sm', focusRing)}
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mega Menu */}
        <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
      </header>

      {/* ── Mobile Drawer ─────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 mega-menu-backdrop animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[90vw] bg-card border-l border-border shadow-lg animate-slide-in-right overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <span className="font-heading text-xl font-bold">
                <span className="text-accent">CGA</span>GAMES
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className={cn('p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Auth section */}
            {!isAuthenticated && (
              <div className="px-4 py-4 border-b border-border flex gap-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="primary" className="w-full" size="sm">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="secondary" className="w-full" size="sm">Register</Button>
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="border-b border-border">
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-white">
                    {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-foreground-muted">{user?.email}</p>
                  </div>
                </div>
                <nav className="px-4 pb-3 space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={cn('flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}
                  >
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileOpen(false)}
                    className={cn('flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}
                  >
                    <Bell className="h-4 w-4" /> Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className={cn('flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}
                  >
                    <Heart className="h-4 w-4" /> Wishlist
                  </Link>
                  <button
                    onClick={() => { clearAuth(); setMobileOpen(false); }}
                    className={cn('flex w-full items-center gap-2 px-3 py-2.5 rounded-md text-sm text-error hover:bg-error/10 transition-colors', focusRing)}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </nav>
              </div>
            )}

            {/* Nav links */}
            <nav className="px-4 py-4 space-y-1">
              {[
                { label: 'All Products', href: '/en' },
                { label: 'PlayStation', href: '/en/category/playstation' },
                { label: 'Xbox', href: '/en/category/xbox' },
                { label: 'Nintendo', href: '/en/category/nintendo' },
                { label: 'PC Gaming', href: '/en/category/pc-gaming' },
                { label: 'Trading Cards', href: '/en/category/trading-cards' },
                { label: 'Accessories', href: '/en/category/accessories' },
                { label: 'Merchandise', href: '/en/category/merchandise' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn('flex items-center px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border px-4 py-4 space-y-1">
              {[
                { label: 'Deals', href: '/en/deals' },
                { label: 'New Arrivals', href: '/en/new-arrivals' },
                { label: 'Pre-Orders', href: '/en/preorders' },
                { label: 'Blog', href: '/en/blog' },
                { label: 'Store Locator', href: '/en/store-locator' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn('flex items-center px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Country/Currency */}
            <div className="border-t border-border px-4 py-4">
              <p className="text-xs font-medium text-foreground-subtle uppercase tracking-wider mb-2">Region & Currency</p>
              <div className="flex gap-2 flex-wrap">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCountry(c.code)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs border transition-colors active:scale-95',
                      country === c.code
                        ? 'border-accent text-accent bg-accent/10'
                        : 'border-border text-foreground-muted hover:border-border-hover',
                      focusRing,
                    )}
                  >
                    <span aria-hidden>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
