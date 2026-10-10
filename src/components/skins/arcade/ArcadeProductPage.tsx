'use client';

/**
 * Arcade Pop product detail page — a badge-heavy "showcase" rather than a
 * plain two-column spec sheet: a sticker-covered gallery panel, a cartridge
 * -style price plate, a floating bottom action bar on mobile, and tabs
 * reused from the shared Tabs component instead of a manual underline
 * list. Functionally mirrors the old PDP — same data fetching (product,
 * reviews, related products), same add-to-cart/wishlist/stock logic —
 * this is low-risk display code so the structure is free to diverge.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Heart, ShoppingCart, Share2, Star, Minus, Plus, Check, AlertTriangle,
  Truck, PackageX, Gamepad2,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { StarRating } from '@/components/store/StarRating';
import { ProductGallery } from '@/components/store/ProductGallery';
import { ProductCard } from '@/components/store/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArcadeStickerBadge } from './ArcadeStickerBadge';
import { productsApi, reviewsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { cn } from '@/lib/utils/cn';
import type { Product, Review } from '@/types';

const LOW_STOCK_THRESHOLD = 5;

function RelatedRail({ products, isLoading }: { products: Product[]; isLoading: boolean }) {
  if (!isLoading && products.length === 0) return null;
  return (
    <div className="mt-16">
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-5 flex items-center gap-2">
        <Gamepad2 className="h-5 w-5 text-accent" /> You May Also Like
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:thin]">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[13rem] sm:w-[15rem] h-[20rem] rounded-xl bg-surface-2 animate-pulse" />
            ))
          : products.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-[13rem] sm:w-[15rem]">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </div>
  );
}

export function ArcadeProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { productIds: wishlist, addProduct, removeProduct } = useWishlistStore();
  const isWishlisted = product ? wishlist.includes(product.id) : false;
  const format = useCurrencyStore((s) => s.format);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.findBySlug(slug);
        setProduct(res.data.data);
        setSelectedVariantId(res.data.data.variants?.[0]?.id ?? null);
        setQuantity(1);
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) load();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    setReviewsLoading(true);
    reviewsApi
      .findByProduct(product.id)
      .then((res) => {
        if (!cancelled) setReviews(res.data.data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  useEffect(() => {
    if (!product?.categoryId) {
      setRelatedProducts([]);
      return;
    }
    let cancelled = false;
    setRelatedLoading(true);
    productsApi
      .findAll({ categoryId: product.categoryId, limit: 9 })
      .then((res) => {
        if (cancelled) return;
        const items = res.data.data.items ?? [];
        setRelatedProducts(items.filter((p) => p.id !== product.id).slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setRelatedProducts([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product?.categoryId, product?.id]);

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId) ?? null;
  const stockQuantity = selectedVariant ? selectedVariant.stockQuantity ?? 0 : product?.stockQuantity ?? 0;
  const hasSupplierFulfillment = selectedVariant
    ? Boolean(selectedVariant.hasSupplierFulfillment)
    : Boolean(product?.hasSupplierFulfillment);
  const isOutOfStock = stockQuantity <= 0 && !hasSupplierFulfillment;
  const isLowStock = !isOutOfStock && !hasSupplierFulfillment && stockQuantity <= LOW_STOCK_THRESHOLD;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    const featuredImage = product.images?.find((i) => i.isFeatured) ?? product.images?.[0];
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      name: product.name,
      price: selectedVariant?.price ?? product.price,
      salePrice: selectedVariant?.salePrice ?? product.salePrice,
      imageUrl: featuredImage?.url,
      slug: product.slug,
      platform: product.platform,
      type: product.type,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10">
          <div className="space-y-4">
            <Skeleton height={420} className="rounded-2xl" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} height={80} width={80} className="rounded-lg" />)}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton height={32} width="80%" />
            <Skeleton height={20} width="40%" />
            <Skeleton height={48} width="50%" />
            <Skeleton height={140} className="rounded-2xl" />
            <Skeleton height={56} className="rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-16">
        <EmptyState
          icon={PackageX}
          title="We couldn't find that product"
          description="It may have been removed, renamed, or the link is out of date. Try browsing our catalog instead."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/en">
                <Button variant="primary">Back to shop</Button>
              </Link>
              <Link href="/en/search">
                <Button variant="outline">Search products</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const images = product.images ?? [];
  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveSalePrice = selectedVariant?.salePrice ?? product.salePrice;
  const discountPercent = effectiveSalePrice
    ? Math.round(((effectivePrice - effectiveSalePrice) / effectivePrice) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 pb-28 md:pb-10">
      <Breadcrumbs
        items={[
          { label: 'Shop', href: '/en' },
          { label: product.category?.name ?? 'Products', href: `/en/category/${product.category?.slug ?? 'all'}` },
          { label: product.name },
        ]}
        className="mb-6"
      />

      <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14">
        {/* ── Showcase gallery, sticker overlays ──────────────── */}
        <div className="animate-fade-in relative">
          <div className="absolute -top-3 -left-3 z-10 flex flex-col gap-2 pointer-events-none">
            {product.isPreorder && <ArcadeStickerBadge>Pre-Order</ArcadeStickerBadge>}
            {product.isComingSoon && <ArcadeStickerBadge tone="cyan">Coming Soon</ArcadeStickerBadge>}
          </div>
          <ProductGallery
            images={images}
            productName={product.name}
            badge={discountPercent > 0 ? <ArcadeStickerBadge>-{discountPercent}%</ArcadeStickerBadge> : undefined}
          />
        </div>

        {/* ── Info plate ──────────────────────────────────────── */}
        <div className="space-y-5 animate-slide-up">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {product.platform && <Badge variant="default">{product.platform}</Badge>}
              {product.region && <Badge variant="outline">{product.region}</Badge>}
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold leading-snug text-foreground">{product.name}</h1>
            {product.brand && (
              <p className="text-sm text-foreground-muted mt-1">
                by{' '}
                <Link href={`/en/brand/${product.brand.slug}`} className="text-accent hover:underline font-medium">
                  {product.brand.name}
                </Link>
              </p>
            )}
          </div>

          {product.avgRating > 0 && (
            <StarRating rating={product.avgRating} size="md" showCount count={product.reviewCount} />
          )}

          {/* Cartridge-label price plate */}
          <div className="skin-card-frame rounded-2xl bg-surface-2 p-5">
            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <span className="font-heading text-3xl sm:text-4xl font-bold text-accent">
                {format(Number(effectiveSalePrice ?? effectivePrice))}
              </span>
              {effectiveSalePrice && (
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg text-foreground-subtle line-through">{format(Number(effectivePrice))}</span>
                  <span className="text-sm text-success font-medium">
                    You save {format(Number(effectivePrice) - Number(effectiveSalePrice))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Variant selector */}
          {product.variants && product.variants.filter((v) => v.isActive).length > 1 && (
            <div>
              <p className="text-sm font-bold text-foreground mb-2">Select option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter((v) => v.isActive).map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={cn(
                      'rounded-full border-2 px-3.5 py-2 text-sm font-bold transition-colors',
                      variant.id === selectedVariantId
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-foreground-muted hover:border-border-hover',
                    )}
                    aria-pressed={variant.id === selectedVariantId}
                  >
                    {variant.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.shortDescription && (
            <p className="text-sm text-foreground-muted leading-relaxed">{product.shortDescription}</p>
          )}

          {product.isPreorder && product.releaseDate && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-info/10 border border-info/30">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-sm font-bold text-foreground">Release Date</p>
                <p className="text-sm text-foreground-muted">
                  {new Date(product.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          {/* Quantity + Cart — hidden on mobile here, shown instead in the floating bar */}
          {!product.isComingSoon && (
            <div className="hidden md:block space-y-3">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className={cn('flex items-center border-2 rounded-full overflow-hidden', isOutOfStock ? 'border-border opacity-50' : 'border-border')}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="px-4 py-2.5 text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors disabled:pointer-events-none"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2.5 font-bold min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => (stockQuantity > 0 ? Math.min(stockQuantity, q + 1) : q + 1))}
                    disabled={isOutOfStock}
                    className="px-4 py-2.5 text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors disabled:pointer-events-none"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {isOutOfStock ? (
                  <span className="text-sm text-error flex items-center gap-1 font-bold"><PackageX className="h-4 w-4" /> Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-sm text-warning flex items-center gap-1 font-bold"><AlertTriangle className="h-4 w-4" /> Only {stockQuantity} left</span>
                ) : (
                  <span className="text-sm text-success flex items-center gap-1 font-bold"><Check className="h-4 w-4" /> In Stock</span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="lg" className="flex-1 min-w-[9.5rem]" onClick={handleAddToCart} disabled={isOutOfStock}>
                  {isOutOfStock ? (<><PackageX className="h-5 w-5" /> Out of Stock</>) : addedToCart ? (<><Check className="h-5 w-5" /> Added!</>) : (<><ShoppingCart className="h-5 w-5" /> {product.isPreorder ? 'Pre-Order Now' : 'Add to Cart'}</>)}
                </Button>
                <button
                  onClick={() => isWishlisted ? removeProduct(product.id) : addProduct(product.id)}
                  className={cn('h-12 w-12 shrink-0 rounded-xl border-2 flex items-center justify-center transition-colors', isWishlisted ? 'bg-accent border-accent text-white' : 'border-border text-foreground-muted hover:border-accent hover:text-accent')}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
                </button>
                <button className="h-12 w-12 shrink-0 rounded-xl border-2 border-border flex items-center justify-center text-foreground-muted hover:border-border-hover transition-colors" aria-label="Share">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-surface-2 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">Free Delivery</p>
                <p className="text-xs text-foreground-muted">On orders over AED 150 · Estimated 2–5 business days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">Easy Returns</p>
                <p className="text-xs text-foreground-muted">7-day return policy for unopened items</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-xs text-foreground-subtle">Pay with:</p>
            {['VISA', 'Mastercard', 'Tabby', 'Tamara', 'COD'].map((m) => (
              <span key={m} className="px-2 py-0.5 rounded-full bg-surface-2 border border-border text-xs text-foreground-muted font-bold">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────── */}
      <div className="mt-16">
        <Tabs
          items={[
            { value: 'description', label: 'Description' },
            { value: 'specifications', label: 'Specifications' },
            { value: 'reviews', label: `Reviews${product.reviewCount > 0 ? ` (${product.reviewCount})` : ''}` },
            { value: 'faq', label: 'FAQ' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        <div className="py-8 animate-fade-in" key={activeTab}>
          {activeTab === 'description' && (
            <div className="prose-measure">
              {product.description ? (
                <p className="text-foreground-muted leading-relaxed whitespace-pre-wrap">{product.description}</p>
              ) : (
                <p className="text-foreground-muted">No description available.</p>
              )}
            </div>
          )}
          {activeTab === 'specifications' && (() => {
            const specs: [string, string | undefined][] = [
              ['Platform', product.platform],
              ['Genre', product.genre],
              ['Region', product.region],
              ['Publisher', product.publisher],
              ['Developer', product.developer],
              ['SKU', product.sku],
              ['Barcode', product.barcode],
            ];
            const populated = specs.filter(([, v]) => v);
            if (populated.length === 0) {
              return <p className="text-foreground-muted">No specifications available for this product.</p>;
            }
            return (
              <div className="grid md:grid-cols-2 gap-4">
                {populated.map(([k, v]) => (
                  <div key={k} className="skin-card-frame flex justify-between py-3 px-4 rounded-xl bg-surface-2">
                    <span className="text-sm text-foreground-muted">{k}</span>
                    <span className="text-sm text-foreground font-bold">{v}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-heading text-6xl font-bold text-accent">{Number(product.avgRating).toFixed(1)}</p>
                    <StarRating rating={product.avgRating} size="lg" />
                    <p className="text-sm text-foreground-muted mt-1">{product.reviewCount} reviews</p>
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2 border-b border-border pb-4">
                      <Skeleton height={16} width={140} />
                      <Skeleton height={14} width={80} />
                      <Skeleton height={40} />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <EmptyState icon={Star} title="No reviews yet" description={`Be the first to share what you think about ${product.name}.`} />
              ) : (
                <ul className="space-y-5">
                  {reviews.map((review) => (
                    <li key={review.id} className="border-b border-border pb-5 last:border-b-0">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <p className="text-sm font-bold text-foreground">
                          {review.customer ? `${review.customer.firstName} ${review.customer.lastName}` : 'Verified Buyer'}
                        </p>
                        <time className="text-xs text-foreground-subtle" dateTime={review.createdAt}>
                          {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </time>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      {review.title && <p className="text-sm font-bold text-foreground mt-2">{review.title}</p>}
                      <p className="text-sm text-foreground-muted mt-1 leading-relaxed whitespace-pre-wrap">{review.body}</p>
                      {review.reply && (
                        <div className="mt-3 rounded-xl bg-surface-2 p-3">
                          <p className="text-xs font-bold text-foreground mb-1">Response from seller</p>
                          <p className="text-xs text-foreground-muted leading-relaxed">{review.reply}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === 'faq' && (
            <EmptyState icon={Gamepad2} title="No FAQ available" description="Check back soon for answers to common questions about this product." />
          )}
        </div>
      </div>

      <RelatedRail products={relatedProducts} isLoading={relatedLoading} />

      {/* Floating mobile action bar */}
      {!product.isComingSoon && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-1 border-t-2 border-border p-3 flex items-center gap-3">
          <div className={cn('flex items-center border-2 rounded-full overflow-hidden shrink-0', isOutOfStock ? 'border-border opacity-50' : 'border-border')}>
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={isOutOfStock} className="px-3 py-2 text-foreground-muted">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-bold min-w-[2rem] text-center text-sm">{quantity}</span>
            <button onClick={() => setQuantity((q) => (stockQuantity > 0 ? Math.min(stockQuantity, q + 1) : q + 1))} disabled={isOutOfStock} className="px-3 py-2 text-foreground-muted">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleAddToCart} disabled={isOutOfStock}>
            {isOutOfStock ? 'Out of Stock' : addedToCart ? <><Check className="h-4 w-4" /> Added!</> : <><ShoppingCart className="h-4 w-4" /> {product.isPreorder ? 'Pre-Order' : 'Add to Cart'}</>}
          </Button>
          <button
            onClick={() => isWishlisted ? removeProduct(product.id) : addProduct(product.id)}
            className={cn('h-11 w-11 shrink-0 rounded-xl border-2 flex items-center justify-center', isWishlisted ? 'bg-accent border-accent text-white' : 'border-border text-foreground-muted')}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
          </button>
        </div>
      )}
    </div>
  );
}
