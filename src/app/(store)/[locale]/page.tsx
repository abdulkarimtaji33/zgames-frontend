'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Package, Star, ChevronRight, Clock } from 'lucide-react';
import Image from 'next/image';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Button } from '@/components/ui/Button';
import { productsApi, categoriesApi } from '@/lib/api';
import type { Product, PaginatedResponse, Category } from '@/types';

const CATEGORY_TILE_COLORS = [
  'from-viz-1/25 to-viz-1/5',
  'from-viz-2/25 to-viz-2/5',
  'from-viz-3/25 to-viz-3/5',
  'from-viz-4/25 to-viz-4/5',
  'from-viz-5/25 to-viz-5/5',
  'from-viz-6/25 to-viz-6/5',
];

function useFeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoriesApi.findAll({ isFeatured: true, isActive: true, limit: 14 })
      .then((res) => {
        const data = res.data.data as PaginatedResponse<Category> | Category[];
        setCategories(Array.isArray(data) ? data : (data.items ?? []));
      })
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}

const PLATFORMS = [
  { name: 'PlayStation 5', apiPlatform: 'ps5', logo: '🎮', slug: 'playstation-5', desc: 'Exclusive titles & accessories', color: 'from-viz-1/20 to-viz-1/5', games: ['PS5 Console', 'God of War Ragnarök', 'Spider-Man 2', 'Demon Souls'] },
  { name: 'Xbox Series X', apiPlatform: 'xbox_series_x', logo: '🟩', slug: 'xbox-series-x', desc: 'Game Pass & next-gen gaming', color: 'from-viz-2/20 to-viz-2/5', games: ['Xbox Series X', 'Forza Horizon 5', 'Halo Infinite', 'Starfield'] },
  { name: 'Nintendo Switch', apiPlatform: 'nintendo_switch', logo: '🔴', slug: 'nintendo-switch', desc: 'Play anywhere, anytime', color: 'from-viz-6/20 to-viz-6/5', games: ['Switch OLED', 'Zelda TotK', 'Mario Kart 8', 'Splatoon 3'] },
];

const BRANDS = ['Sony', 'Microsoft', 'Nintendo', 'Ubisoft', 'EA Sports', 'Capcom', 'Razer', 'ASUS ROG', 'Logitech G', 'Pokémon', 'Yu-Gi-Oh!', 'Magic'];

function HeroSlider() {
  const slides = [
    {
      title: 'PS5 Deals',
      subtitle: "Need for Speed Unbound Collector's Edition and more",
      cta: 'Shop PS5',
      href: '/en/category/playstation-5',
      image: 'https://cgagames.com/media/catalog/product/cache/ed0e0b9233706b5b42d1db286ecb0c36/uploads/uploads/Web_Banner___767_x_484px.png',
    },
    {
      title: 'Flash Deals',
      subtitle: 'Up to 30% off Xbox, PlayStation & Switch essentials',
      cta: 'Shop Deals',
      href: '/en/deals',
      image: 'https://cgagames.com/media/catalog/product/cache/ed0e0b9233706b5b42d1db286ecb0c36/uploads/uploads/uae_metal_gear_solid_delta_snake_eater_deluxe_edition_pegi_xbox.jpg',
    },
    {
      title: 'Pokémon Collection',
      subtitle: 'Figures, Funko Pops and collectibles in stock',
      cta: 'Shop Now',
      href: '/en/category/trading-cards',
      image: 'https://cgagames.com/media/catalog/product/cache/ed0e0b9233706b5b42d1db286ecb0c36/8/8/889698505611_1.jpg',
    },
  ];

  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <div className="relative rounded-2xl overflow-hidden h-64 md:h-96 lg:h-[480px] mb-6 bg-background-tertiary">
      <Image
        key={slide.image}
        src={slide.image}
        alt={slide.title}
        fill
        priority
        className="object-cover transition-opacity duration-700"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="px-8 md:px-16 max-w-lg">
          <p className="text-sm text-white/70 mb-2 uppercase tracking-widest">CGA Games Exclusive</p>
          <h2 className="font-heading text-4xl md:text-6xl font-black text-white mb-3 leading-none drop-shadow-lg">{slide.title}</h2>
          <p className="text-white/85 text-base md:text-lg mb-6 drop-shadow">{slide.subtitle}</p>
          <Link href={slide.href}>
            <Button variant="primary" size="lg">{slide.cta} <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-accent' : 'w-1.5 bg-white/50'}`} />
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
    <section className="mb-14 reveal">
      <SectionHeader title={title} href={href} />
      <ProductGrid products={products} isLoading={isLoading} cols={4} />
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className="mb-6 reveal">
      <div className="rounded-2xl bg-gradient-to-br from-accent/20 via-background-secondary to-background-tertiary border border-accent/20 p-8 md:p-12 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
          Join the <span className="text-accent">CGA Games</span> Community
        </h2>
        <p className="text-foreground-muted mb-6 max-w-md mx-auto">
          Get exclusive deals, early access to new arrivals, and gaming news delivered to your inbox.
        </p>
        {subscribed ? (
          <p className="max-w-sm mx-auto rounded-full bg-success/20 border border-success/30 text-success px-4 py-2.5 text-sm font-medium">
            Thanks — you're subscribed!
          </p>
        ) : (
          <form className="flex gap-2 max-w-sm mx-auto" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 rounded-full bg-background-tertiary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent transition-colors"
            />
            <Button type="submit" variant="primary" size="md" className="rounded-full">Subscribe</Button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { categories: featuredCategories, isLoading: categoriesLoading } = useFeaturedCategories();

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-6">
      {/* Hero */}
      <HeroSlider />

      {/* Category grid */}
      <section className="mb-14 reveal">
        <h2 className="font-heading text-2xl font-bold mb-5">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {categoriesLoading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl skeleton" />
            ))
          ) : featuredCategories.length === 0 ? null : featuredCategories.map((cat, i) => (
            <Link key={cat.id} href={`/en/category/${cat.slug}`}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br ${CATEGORY_TILE_COLORS[i % CATEGORY_TILE_COLORS.length]} border border-border hover:border-border-hover transition-colors group text-center`}>
              {cat.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.image} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="text-3xl">🎮</span>
              )}
              <span className="text-xs font-medium text-foreground-muted group-hover:text-foreground transition-colors leading-tight line-clamp-2">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Deals */}
      <section className="mb-14 reveal">
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
        <section key={platform.slug} className="mb-14 reveal">
          <div className={`rounded-2xl bg-gradient-to-br ${platform.color} border border-border/50 p-6 md:p-8 mb-6`}>
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
          <ProductSection title="" href={`/en/category/${platform.slug}`} params={{ platform: platform.apiPlatform }} />
        </section>
      ))}

      {/* Pre-orders */}
      <section className="mb-14 reveal">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-viz-4" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Pre-Orders</h2>
          </div>
          <Link href="/en/preorders" className="text-sm text-accent hover:underline font-medium flex items-center gap-1">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ProductSection title="" href="/en/preorders" params={{ isPreorder: true }} />
      </section>

      {/* Best Sellers */}
      <section className="mb-14 reveal">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-viz-3" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Best Sellers</h2>
          </div>
          <Link href="/en/best-sellers" className="text-sm text-accent hover:underline font-medium flex items-center gap-1">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ProductSection title="" href="/en/best-sellers" params={{ sortBy: 'soldCount', sortOrder: 'DESC' }} />
      </section>

      {/* Coming Soon */}
      <section className="mb-14 reveal">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-accent-orange" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Coming Soon</h2>
          </div>
          <Link href="/en/coming-soon" className="text-sm text-accent hover:underline font-medium flex items-center gap-1">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ProductSection title="" href="/en/coming-soon" params={{ isComingSoon: true }} />
      </section>

      {/* Brand showcase */}
      <section className="mb-14 reveal">
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
      <Newsletter />
    </main>
  );
}