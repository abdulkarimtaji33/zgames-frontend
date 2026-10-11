'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, ShoppingCart, Heart, User, Menu, X,
  ChevronDown, LogOut, Sparkles, Gamepad2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { authApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { SkinSwitcher } from '@/components/layout/SkinSwitcher';
import { ArcadeMegaMenu } from './ArcadeMegaMenu';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const PILL_LINKS = [
  { label: 'Deals', href: '/en/deals', emoji: '⚡' },
  { label: 'New', href: '/en/new-arrivals', emoji: '✨' },
  { label: 'Pre-Order', href: '/en/preorders', emoji: '⏰' },
];

const MOBILE_CATEGORY_LINKS = [
  { label: 'PlayStation', href: '/en/category/playstation' },
  { label: 'Xbox', href: '/en/category/xbox' },
  { label: 'Nintendo', href: '/en/category/nintendo' },
  { label: 'PC Gaming', href: '/en/category/pc-gaming' },
  { label: 'Trading Cards', href: '/en/category/trading-cards' },
  { label: 'Accessories', href: '/en/category/accessories' },
  { label: 'Merchandise', href: '/en/category/merchandise' },
];

/**
 * Arcade Pop header — a bold, playful "app bar" rather than a classic
 * e-commerce masthead: a thick rounded logo lockup, chunky pill shortcuts
 * instead of a plain text nav, and a grid-of-tiles mega menu (see
 * ArcadeMegaMenu) instead of a dense dropdown. Functionally it still
 * covers everything the old header did — search, cart/wishlist counts,
 * currency, auth, skin switch, mobile drawer — just arranged differently.
 */
export function ArcadeHeader() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [desktopQuery, setDesktopQuery] = useState('');

  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const { customer, isAuthenticated, refreshToken, clearAuth } = useAuthStore();
  const { selected: currency, currencies, setCurrency } = useCurrencyStore();

  const submitSearch = (q: string) => {
    const query = q.trim();
    if (!query) return;
    router.push(`/en/search?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  };

  const handleLogout = () => {
    if (refreshToken) authApi.logout(refreshToken).catch(() => {});
    clearAuth();
  };

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

  return (
    <>
      {/* Chunky top banner — irreverent one-liner instead of a formal shipping bar */}
      <div className="hidden md:flex items-center justify-center gap-2 bg-accent text-white px-4 py-1.5 text-xs font-bold">
        <Sparkles className="h-3.5 w-3.5" />
        <span>FREE SHIPPING OVER AED 150 &middot; NEW DROPS EVERY FRIDAY &middot; LEVEL UP YOUR CART</span>
        <Sparkles className="h-3.5 w-3.5" />
      </div>

      <header
        ref={headerRef}
        className="sticky top-0 z-50 w-full bg-surface-0 border-b-2 border-border relative"
      >
        <div className="mx-auto max-w-[1440px] px-3 sm:px-5 md:px-6">
          <div className="flex h-[4.25rem] items-center gap-2 sm:gap-3">
            {/* Logo lockup */}
            <Link href="/en" className={cn('flex-shrink-0 flex items-center gap-2 group rounded-xl', focusRing)}>
              <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center shadow-[var(--shadow-md)] group-hover:rotate-[-6deg] transition-transform duration-[var(--duration-base)] ease-[var(--ease-standard)]">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-xl sm:text-2xl font-bold leading-none whitespace-nowrap">
                <span className="text-accent">CGA GAMES</span>
                <span className="text-accent-orange">!</span>
              </span>
            </Link>

            {/* Shop button — opens the tile mega menu */}
            <button
              onClick={() => setMegaOpen((o) => !o)}
              aria-expanded={megaOpen}
              className={cn(
                'hidden lg:flex items-center gap-1.5 ml-2 px-4 py-2.5 rounded-full text-sm font-bold transition-colors active:scale-95',
                megaOpen ? 'bg-accent text-white' : 'bg-surface-2 text-foreground hover:bg-accent hover:text-white',
                focusRing,
              )}
            >
              Shop
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', megaOpen && 'rotate-180')} />
            </button>

            {/* Pill shortcuts */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {PILL_LINKS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className={cn(
                    'skin-sticker px-3 py-1.5 bg-surface-2 text-xs font-bold text-foreground-muted hover:text-foreground',
                    focusRing,
                  )}
                >
                  <span aria-hidden>{p.emoji}</span> {p.label}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-2">
              <form onSubmit={(e) => { e.preventDefault(); submitSearch(desktopQuery); }} className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
                <input
                  type="text"
                  value={desktopQuery}
                  onChange={(e) => setDesktopQuery(e.target.value)}
                  placeholder="Find your next game..."
                  className={cn(
                    'w-full rounded-full bg-surface-2 border-2 border-transparent pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle transition-colors',
                    'focus:outline-none focus:border-accent',
                  )}
                />
              </form>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
              <button
                onClick={() => setSearchOpen((o) => !o)}
                className={cn('md:hidden p-2 rounded-full text-foreground-muted hover:bg-surface-2 active:scale-95', focusRing)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Currency */}
              <div className="hidden sm:block">
                <Dropdown
                  align="right"
                  trigger={({ open, toggle }) => (
                    <button
                      onClick={toggle}
                      aria-expanded={open}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-2 rounded-full text-xs font-bold transition-colors active:scale-95',
                        open ? 'bg-surface-2 text-foreground' : 'text-foreground-muted hover:bg-surface-2',
                        focusRing,
                      )}
                    >
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

              <SkinSwitcher />

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className={cn('relative hidden sm:flex p-2 rounded-full text-foreground-muted hover:bg-surface-2 active:scale-95', focusRing)}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="skin-avatar-ring absolute -top-0.5 -right-0.5 h-[1.125rem] w-[1.125rem] min-w-[1.125rem] rounded-full bg-accent-orange text-[10px] font-bold text-white flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/en/cart"
                className={cn('relative p-2 rounded-full text-foreground-muted hover:bg-surface-2 active:scale-95', focusRing)}
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="skin-avatar-ring absolute -top-0.5 -right-0.5 h-[1.125rem] w-[1.125rem] min-w-[1.125rem] rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center animate-count-badge">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <Dropdown
                  align="right"
                  trigger={({ open, toggle }) => (
                    <button
                      onClick={toggle}
                      aria-expanded={open}
                      className={cn('flex items-center gap-2 px-1.5 py-1.5 rounded-full hover:bg-surface-2 active:scale-95', focusRing)}
                    >
                      <div className="skin-avatar-ring h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
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
                  <DropdownItem onClick={handleLogout} className="text-error hover:bg-error/10 focus-visible:bg-error/10">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownItem>
                </Dropdown>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    'hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-sm font-bold hover:bg-accent-hover active:scale-95',
                    focusRing,
                  )}
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className={cn('lg:hidden p-2 rounded-full text-foreground-muted hover:bg-surface-2 active:scale-95 ml-0.5', focusRing)}
                aria-label="Menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          {searchOpen && (
            <div className="md:hidden pb-3">
              <form onSubmit={(e) => { e.preventDefault(); submitSearch(searchQuery); }} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find your next game..."
                  className="w-full rounded-full bg-surface-2 border-2 border-transparent pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className={cn('absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground rounded-full', focusRing)}
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        <ArcadeMegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[90vw] bg-surface-0 border-l-2 border-border shadow-lg animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <span className="font-heading text-xl font-bold text-accent">CGA GAMES!</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className={cn('p-2 rounded-full text-foreground-muted hover:bg-surface-2', focusRing)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="px-4 py-4 border-b border-border flex gap-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center rounded-full bg-accent text-white text-sm font-bold py-2.5">Login</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center rounded-full bg-surface-2 text-foreground text-sm font-bold py-2.5">Register</Link>
              </div>
            ) : (
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="skin-avatar-ring h-10 w-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-white">
                  {customer?.firstName?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{customer?.firstName} {customer?.lastName}</p>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-xs text-error font-semibold">Logout</button>
                </div>
              </div>
            )}

            <div className="px-4 py-4">
              <p className="text-xs font-bold text-foreground-subtle uppercase tracking-wider mb-2">Shop by platform</p>
              <div className="grid grid-cols-2 gap-2">
                {MOBILE_CATEGORY_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl bg-surface-2 px-3 py-2.5 text-sm font-semibold text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border flex flex-wrap gap-2">
              {PILL_LINKS.map((p) => (
                <Link key={p.href} href={p.href} onClick={() => setMobileOpen(false)} className="skin-sticker px-3 py-1.5 bg-surface-2 text-xs font-bold text-foreground-muted">
                  <span aria-hidden>{p.emoji}</span> {p.label}
                </Link>
              ))}
            </div>

            <div className="px-4 py-4 border-t border-border flex items-center justify-between">
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-foreground-muted">
                <Heart className="h-4 w-4" /> Wishlist ({wishlistCount})
              </Link>
              <Link href="/en/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-foreground-muted">
                <ShoppingCart className="h-4 w-4" /> Cart ({cartCount})
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
