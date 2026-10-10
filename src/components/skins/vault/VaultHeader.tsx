'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown,
  LayoutGrid, LogOut, Bell, DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { authApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { useFeaturedCategories } from '@/lib/hooks/useStorefrontData';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { SkinSwitcher } from '@/components/layout/SkinSwitcher';
import { VaultMegaMenu } from './VaultMegaMenu';

const RAIL_LINKS = [
  { label: 'Deals', href: '/en/deals' },
  { label: 'Pre-Orders', href: '/en/preorders' },
  { label: 'New Arrivals', href: '/en/new-arrivals' },
  { label: 'Blog', href: '/en/blog' },
];

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * VaultHeader — a slim, single-row "launcher" bar rather than the
 * conventional two-tier (utility strip + nav row + search bar) header.
 * Browsing the catalogue is deliberately NOT a hover dropdown: it opens
 * VaultMegaMenu, a full-screen chapter takeover. Search is a click-to-expand
 * overlay rather than a permanently docked input, keeping the resting bar
 * uncluttered the way a game launcher's top bar stays out of the way.
 */
export function VaultHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const { categories, isLoading: categoriesLoading } = useFeaturedCategories(8);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const { customer, isAuthenticated, refreshToken, clearAuth } = useAuthStore();
  const { selected: currency, currencies, setCurrency } = useCurrencyStore();

  const handleLogout = () => {
    if (refreshToken) authApi.logout(refreshToken).catch(() => {});
    clearAuth();
  };

  const submitSearch = (q: string) => {
    const query = q.trim();
    if (!query) return;
    router.push(`/en/search?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setChaptersOpen(false);
    setSearchOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-[background-color,box-shadow,border-color] duration-[var(--duration-base)]',
          scrolled ? 'bg-[var(--surface-0)]/95 backdrop-blur-md border-border shadow-md' : 'bg-[var(--surface-0)] border-border/50',
        )}
      >
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="flex h-16 items-center gap-2 sm:gap-3">
            {/* Wordmark */}
            <Link href="/en" className={cn('flex items-center gap-2 flex-shrink-0 rounded-sm', focusRing)}>
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-[0.08em]">
                <span className="skin-glow-text">VAULT</span>
              </span>
            </Link>

            {/* Chapters trigger */}
            <button
              onClick={() => setChaptersOpen((o) => !o)}
              aria-expanded={chaptersOpen}
              className={cn(
                'hidden sm:flex items-center gap-2 ml-2 px-3 py-2 rounded-md text-sm font-medium transition-colors active:scale-[0.97]',
                chaptersOpen ? 'bg-surface-2 text-foreground' : 'text-foreground-muted hover:text-foreground hover:bg-surface-1',
                focusRing,
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Chapters
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', chaptersOpen && 'rotate-180')} />
            </button>

            {/* Rail links */}
            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {RAIL_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors',
                    focusRing,
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Right cluster */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Search"
                aria-expanded={searchOpen}
                className={cn(
                  'p-2 rounded-md transition-colors active:scale-95',
                  searchOpen ? 'text-foreground bg-surface-2' : 'text-foreground-muted hover:text-foreground hover:bg-surface-1',
                  focusRing,
                )}
              >
                <Search className="h-5 w-5" />
              </button>

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
                      <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
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

              <SkinSwitcher />

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className={cn('relative p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors hidden sm:flex active:scale-95', focusRing)}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/en/cart"
                aria-label="Cart"
                className={cn('relative p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors active:scale-95', focusRing)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <Dropdown
                  align="right"
                  trigger={({ open, toggle }) => (
                    <button
                      onClick={toggle}
                      aria-expanded={open}
                      className={cn('flex items-center gap-2 px-1.5 py-1.5 rounded-md hover:bg-surface-1 transition-colors active:scale-95', focusRing)}
                    >
                      <div className="skin-avatar-ring h-7 w-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
                        {customer?.firstName?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                    </button>
                  )}
                >
                  <div className="px-3.5 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{customer?.firstName} {customer?.lastName}</p>
                    <p className="text-xs text-foreground-muted truncate">{customer?.email}</p>
                  </div>
                  <Link href="/dashboard" role="menuitem" className={cn('flex items-center gap-2 px-3.5 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}>
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <Link href="/orders" role="menuitem" className={cn('flex items-center gap-2 px-3.5 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors', focusRing)}>
                    <Bell className="h-4 w-4" /> Orders
                  </Link>
                  <DropdownItem onClick={handleLogout} className="text-error hover:bg-error/10 focus-visible:bg-error/10">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownItem>
                </Dropdown>
              ) : (
                <Link
                  href="/login"
                  className={cn('hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover active:scale-95 transition-colors', focusRing)}
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Menu"
                aria-expanded={mobileOpen}
                className={cn('sm:hidden p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors active:scale-95', focusRing)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanding search overlay */}
        {searchOpen && (
          <div className="border-t border-border bg-surface-1 animate-slide-down">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-4">
              <form onSubmit={(e) => { e.preventDefault(); submitSearch(searchQuery); }} className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-subtle" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the vault — games, consoles, gift cards..."
                  className="w-full rounded-md bg-surface-0 border border-border pl-12 pr-12 py-3.5 text-base text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-[color:var(--color-action)] focus:ring-2 focus:ring-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className={cn('absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground rounded-sm', focusRing)}
                >
                  <X className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      <VaultMegaMenu
        open={chaptersOpen}
        onClose={() => setChaptersOpen(false)}
        categories={categories}
        isLoading={categoriesLoading}
      />

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[90vw] bg-surface-1 border-l border-border shadow-lg overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <span className="font-heading text-xl font-bold skin-glow-text">VAULT</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className={cn('p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors', focusRing)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="px-4 py-4 border-b border-border flex gap-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center rounded-md bg-accent text-white text-sm font-medium py-2.5">Sign In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center rounded-md border border-border text-sm font-medium py-2.5">Register</Link>
              </div>
            ) : (
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="skin-avatar-ring h-10 w-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-white">
                  {customer?.firstName?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium">{customer?.firstName} {customer?.lastName}</p>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-xs text-error">Logout</button>
                </div>
              </div>
            )}

            <button
              onClick={() => { setMobileOpen(false); setChaptersOpen(true); }}
              className={cn('flex w-full items-center gap-2 px-4 py-3.5 text-sm font-medium text-foreground border-b border-border', focusRing)}
            >
              <LayoutGrid className="h-4 w-4" /> Browse Chapters
            </button>

            <nav className="px-4 py-3 space-y-1">
              {RAIL_LINKS.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn('flex items-center px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors', focusRing)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className={cn('flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors', focusRing)}>
                Wishlist {wishlistCount > 0 && <span className="text-xs text-accent">{wishlistCount}</span>}
              </Link>
            </nav>

            <div className="border-t border-border px-4 py-4">
              <p className="text-xs font-medium text-foreground-subtle uppercase tracking-wider mb-2">Currency</p>
              <div className="flex gap-2 flex-wrap">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-md text-xs border transition-colors',
                      currency.code === c.code ? 'border-[color:var(--color-action)] text-accent bg-accent/10' : 'border-border text-foreground-muted',
                    )}
                  >
                    {c.code}
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
