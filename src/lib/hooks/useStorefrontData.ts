'use client';

import { useEffect, useState } from 'react';
import { productsApi, categoriesApi } from '@/lib/api';
import type { Product, PaginatedResponse, Category } from '@/types';

/** Shared across both skin homepages so neither has to reimplement data fetching. */
export function useFeaturedCategories(limit = 14) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoriesApi.findAll({ isFeatured: true, isActive: true, limit })
      .then((res) => {
        const data = res.data.data as PaginatedResponse<Category> | Category[];
        setCategories(Array.isArray(data) ? data : (data.items ?? []));
      })
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { categories, isLoading };
}

/** Storefront default: UAE-region items plus region-less/global ones (gift
 * cards, digital keys) — excludes other storefronts' region-locked SKUs
 * (KSA/Qatar/Bahrain/Oman) from showing up on the default UAE homepage.
 * Callers can override by passing their own `region` in params. */
const DEFAULT_REGIONS = ['uae', 'global'];

/** Dedupe a product list down to one item per "family" (same brand, or
 * same product name with a trailing denomination/variant stripped, e.g.
 * "Roblox Gift Card — UAE — AED 500" / "...AED 200" collapse to one) so a
 * rail reads as a variety of products rather than five denominations of
 * the same gift card. Keeps first-seen order. */
function diversifyProducts(products: Product[], limit: number): Product[] {
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const p of products) {
    const key = p.brandId || p.brand?.name || p.name.split(/[-–—]/)[0].trim() || p.name;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(p);
    if (result.length >= limit) break;
  }
  return result;
}

/** Fetches one product rail's worth of items for a given query.
 * - Defaults to UAE + global region unless `params.region` is set.
 * - Pass `{ diversify: true }` to collapse same-family items (e.g. many
 *   denominations of one gift card) down to one per family, so a rail
 *   reads as a mix of different products instead of one product repeated. */
export function useProductSection(
  params: Record<string, unknown>,
  limit = 8,
  options?: { diversify?: boolean },
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const diversify = options?.diversify ?? false;

  useEffect(() => {
    const fetchLimit = diversify ? Math.min(limit * 6, 60) : limit;
    productsApi.findAll({ region: DEFAULT_REGIONS, ...params, limit: fetchLimit })
      .then((res) => {
        const data = res.data.data as PaginatedResponse<Product>;
        const items = data.items ?? [];
        setProducts(diversify ? diversifyProducts(items, limit) : items);
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params), limit, diversify]);

  return { products, isLoading };
}

export const PLATFORMS = [
  { name: 'PlayStation 5', apiPlatform: 'ps5', slug: 'playstation-5', desc: 'Exclusive titles & accessories', games: ['PS5 Console', 'God of War Ragnarök', 'Spider-Man 2', 'Demon Souls'] },
  { name: 'Xbox Series X', apiPlatform: 'xbox_series_x', slug: 'xbox-series-x', desc: 'Game Pass & next-gen gaming', games: ['Xbox Series X', 'Forza Horizon 5', 'Halo Infinite', 'Starfield'] },
  { name: 'Nintendo Switch', apiPlatform: 'nintendo_switch', slug: 'nintendo-switch', desc: 'Play anywhere, anytime', games: ['Switch OLED', 'Zelda TotK', 'Mario Kart 8', 'Splatoon 3'] },
];

export const BRANDS = ['Sony', 'Microsoft', 'Nintendo', 'Ubisoft', 'EA Sports', 'Capcom', 'Razer', 'ASUS ROG', 'Logitech G', 'Pokémon', 'Yu-Gi-Oh!', 'Magic'];
