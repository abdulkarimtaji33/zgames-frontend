'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Package, Star, ChevronRight, Clock } from 'lucide-react';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Button } from '@/components/ui/Button';
import { productsApi } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

const CATEGORIES = [
  { label: 'PS5 Games', href: '/en/category/ps5-games', emoji: '🎮', color: 'from-blue-900/40 to-blue-800/10' },
  { label: 'Xbox Games', href: '/en/category/xbox-games', emoji: '🟢', color: 'from-green-900/40 to-green-800/10' },
  { label: 'Nintendo', href: '/en/category/nintendo', emoji: '🔴', color: 'from-red-900/40 to-red-800/10' },
  { label: 'PC Gaming', href: '/en/category/pc-gaming', emoji: '💻', color: 'from-purple-900/40 to-purple-800/10' },
  { label: 'Trading Cards', href: '/en/category/trading-cards', emoji: '🃏', color: 'from-yellow-900/40 to-yellow-800/10' },
  { label: 'Accessories', href: '/en/category/accessories', emoji: '🎧', color: 'from-gray-900/40 to-gray-800/10' },
  { label: 'Collectibles', href: '/en/category/collectibles', emoji: '🏆', color: 'from-orange-900/40 to-orange-800/10' },
];

const PLATFORMS = [
  { name: 'PlayStation 5', logo: '🎮', slug: 'playstation-5', desc: 'Exclusive titles & accessories', color: 'from-blue-700 to-blue-500', games: ['PS5 Console', 'God of War Ragnarök', 'Spider-Man 2', 'Demon Souls'] },
  { name: 'Xbox Series X', logo: '🟩', slug: 'xbox-series-x', desc: 'Game Pass & next-gen gaming', color: 'from-green-700 to-green-500', games: ['Xbox Series X', 'Forza Horizon 5', 'Halo Infinite', 'Starfield'] },
  { name: 'Nintendo Switch', logo: '🔴', slug: 'nintendo-switch', desc: 'Play anywhere, anytime', color: 'from-red-700 to-red-500', games: ['Switch OLED', 'Zelda TotK', 'Mario Kart 8', 'Splatoon 3'] },
];

const BRANDS = ['Sony', 'Microsoft', 'Nintendo', 'Ubisoft', 'EA Sports', 'Capcom', 'Razer', 'ASUS ROG', 'Logitech G', 'Pokémon', 'Yu-Gi-Oh!', 'Magic'];

function HeroSlider() {
  const slides = [
    { title: 'PS5 Pro', subtitle: 'The most powerful PlayStation ever', cta: 'Pre-Order Now', href: '/en/preorders', color: 'from-blue-900 via-transparent', emoji: '🎮' },
    { title: 'Flash Deals', subtitle: 'Up to 70% off gaming essentials', cta: 'Shop Deals', href: '/en/deals', color: 'from-red-900 via-transparent', emoji: '⚡' },
    { title: 'Pokémon TCG', subtitle: 'Scarlet & Violet booster boxes in stock', cta: 'Shop Now', href: '/en/category/trading-cards', color: 'from-yellow-900 via-transparent', emoji: '🃏' },
  ];

  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <div className="relative rounded-2xl overflow-hidden h-64 md:h-96 lg:h-[480px] mb-6">
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-background-tertiary transition-all duration-700`} />
      <div className="absolute inset-0 flex items-center">
        <div className="px-8 md:px-16 max-w-lg">
          <p className="text-sm text-foreground-muted mb-2 uppercase tracking-widest">ZGames Exclusive</p>
          <h2 className="font-heading text-4xl md:text-6xl font-black text-foreground mb-3 leading-none">{slide.title}</h2>
          <p className="text-foreground-muted text-base md:text-lg mb-6">{slide.subtitle}</p>
          <Link href={slide.href}>
            <Button variant="primary" size="lg">{slide.cta} <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl md:text-[10rem] opacity-20">{slide.emoji}</div>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-accent' : 'w-1.5 bg-foreground-subtle'}`} />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-heading text-2xl md:text-3xl font-bold">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-sm text-accent hover:underline font-medium">
        View All <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function CountdownTimer({ label }: { label: string }) {
  const [time, setTime] = useState({ h: 5, m: 30, s: 0 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm text-foreground-muted">{label}</p>
      <div className="flex items-center gap-1">
        {[pad(time.h), pad(time.m), pad(time.s)].map((unit, i) => (
          <span key={i}>
            <span className="font-mono font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded text-sm">{unit}</span>
            {i < 2 && <span className="text-foreground-muted mx-0.5">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProductSection({ title, href, params }: { title: string; href: string; params: Record<string, unknown> }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productsApi.findAll({ ...params, limit: 8 })
      .then((res) => {
        const data = res.data.data as PaginatedResponse<Product>;
        setProducts(data.items ?? []);
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mb-14">
      <SectionHeader title={title} href={href} />
      <ProductGrid products={products} isLoading={isLoading} cols={4} />
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-6">
      {/* Hero */}
      <HeroSlider />

      {/* Category grid */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl font-bold mb-5">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {CATEGORIES.map(({ label, href, emoji, color }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br ${color} border border-border hover:border-border-hover transition-colors group text-center`}>
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-medium text-foreground-muted group-hover:text-foreground transition-colors leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Deals */}
      <section className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-accent" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Flash Deals</h2>
          </div>
          <div className="flex items-center justify-between sm:gap-6">
            <CountdownTimer label="Ends in:" />
            <Link href="/en/deals" className="text-sm text-accent hover:underline font-medium flex items-center gap-1 ml-4">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <ProductSection title="" href="/en/deals" params={{ isOnSale: true }} />
      </section>

      {/* New Arrivals */}
      <ProductSection title="New Arrivals" href="/en/new-arrivals" params={{ sortBy: 'createdAt', sortOrder: 'DESC' }} />

      {/* Platform sections */}
      {PLATFORMS.map((platform) => (
        <section key={platform.slug} className="mb-14">
          <div className={`rounded-2xl bg-gradient-to-br ${platform.color}/10 border border-border/50 p-6 md:p-8 mb-6`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{platform.logo}</span>
                  <div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold">{platform.name}</h2>
                    <p className="text-sm text-foreground-muted">{platform.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {platform.games.map((g) => (
                    <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-background-tertiary border border-border text-foreground-muted">{g}</span>
                  ))}
                </div>
              </div>
              <Link href={`/en/category/${platform.slug}`}>
                <Button variant="secondary" size="md">
                  Shop {platform.name} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <ProductSection title="" href={`/en/category/${platform.slug}`} params={{ platform: platform.name.split(' ')[0] }} />
        </section>
      ))}

      {/* Pre-orders */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-purple-400" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Pre-Orders</h2>
          </div>
          <Link href="/en/preorders" className="text-sm text-accent hover:underline font-medium flex items-center gap-1">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ProductSection title="" href="/en/preorders" params={{ isPreorder: true }} />
      </section>

      {/* Best Sellers */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-yellow-400" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Best Sellers</h2>
          </div>
          <Link href="/en/best-sellers" className="text-sm text-accent hover:underline font-medium flex items-center gap-1">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ProductSection title="" href="/en/best-sellers" params={{ sortBy: 'soldCount', sortOrder: 'DESC' }} />
      </section>

      {/* Coming Soon */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-orange-400" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Coming Soon</h2>
          </div>
          <Link href="/en/coming-soon" className="text-sm text-accent hover:underline font-medium flex items-center gap-1">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ProductSection title="" href="/en/coming-soon" params={{ isComingSoon: true }} />
      </section>

      {/* Brand showcase */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Shop by Brand</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {BRANDS.map((brand) => (
            <Link key={brand} href={`/en/brand/${brand.toLowerCase().replace(/[\s.]+/g, '-')}`}
              className="flex items-center justify-center p-4 rounded-xl bg-card border border-border hover:border-border-hover transition-colors text-sm font-medium text-foreground-muted hover:text-foreground text-center"
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-accent/20 via-background-secondary to-background-tertiary border border-accent/20 p-8 md:p-12 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            Join the <span className="text-accent">ZGames</span> Community
          </h2>
          <p className="text-foreground-muted mb-6 max-w-md mx-auto">
            Get exclusive deals, early access to new arrivals, and gaming news delivered to your inbox.
          </p>
          <form className="flex gap-2 max-w-sm mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-full bg-background-tertiary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
            />
            <Button type="submit" variant="primary" size="md" className="rounded-full">Subscribe</Button>
          </form>
        </div>
      </section>
    </main>
  );
}