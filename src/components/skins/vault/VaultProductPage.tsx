'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingCart, Share2, Star, Minus, Plus, Check, AlertTriangle, Truck, PackageX } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/store/StarRating';
import { ProductGallery } from '@/components/store/ProductGallery';
import { Skeleton } from '@/components/ui/Skeleton';
import { Accordion } from '@/components/ui/Accordion';
import { VaultCornerFrame } from './VaultCornerFrame';
import { VaultProductReel } from './VaultProductReel';
import { productsApi, reviewsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { cn } from '@/lib/utils/cn';
import type { Product, Review } from '@/types';

const LOW_STOCK_THRESHOLD = 5;

/**
 * VaultProductPage — a "key-art reveal" rather than a cramped two-column
 * spec sheet: the gallery gets museum-case corner framing, title/price sit
 * in large confident type, and secondary info (description/specs/FAQ)
 * moves into an accordion below the fold instead of competing tabs.
 * Related products become a horizontally-scrolling reel (matching the
 * homepage's shelf language) instead of a static grid.
 */
export function VaultProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
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
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16">
          <Skeleton height={480} className="rounded-xl" />
          <div className="space-y-4">
            <Skeleton height={14} width="30%" />
            <Skeleton height={40} width="80%" />
            <Skeleton height={48} width="40%" />
            <Skeleton height={120} />
            <Skeleton height={48} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-24 text-center animate-fade-in">
        <div className="skin-icon-well mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-4xl">
          🕹️
        </div>
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">We couldn&apos;t find that product</h2>
        <p className="mx-auto max-w-md text-sm text-foreground-muted mb-6">
          It may have been removed, renamed, or the link is out of date. Try browsing our catalog instead.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/en" className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
            Back to shop
          </Link>
          <Link href="/en/search" className="inline-flex h-10 items-center justify-center rounded-md border border-accent px-4 text-sm font-medium text-[color:var(--color-action)] transition-colors hover:bg-accent hover:text-white">
            Search products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images ?? [];
  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveSalePrice = selectedVariant?.salePrice ?? product.salePrice;
  const discountPercent = effectiveSalePrice
    ? Math.round(((effectivePrice - effectiveSalePrice) / effectivePrice) * 100)
    : 0;

  const specs: [string, string | undefined][] = [
    ['Platform', product.platform],
    ['Genre', product.genre],
    ['Region', product.region],
    ['Publisher', product.publisher],
    ['Developer', product.developer],
    ['SKU', product.sku],
    ['Barcode', product.barcode],
  ];
  const specsWithValues = specs.filter(([, v]) => v);

  return (
    <div>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/en' },
            { label: product.category?.name ?? 'Products', href: `/en/category/${product.category?.slug ?? 'all'}` },
            { label: product.name },
          ]}
          className="mb-6"
        />

        {/* ── Key-art reveal ───────────────────────────── */}
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16">
          <div className="animate-fade-in">
            <VaultCornerFrame>
              <ProductGallery
                images={images}
                productName={product.name}
                badge={discountPercent > 0 ? <Badge variant="sale" size="md">-{discountPercent}%</Badge> : undefined}
              />
            </VaultCornerFrame>
          </div>

          <div className="space-y-6 animate-slide-up">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {product.platform && <Badge variant="default">{product.platform}</Badge>}
                {product.region && <Badge variant="outline">{product.region}</Badge>}
                {product.isPreorder && <Badge variant="preorder">Pre-Order</Badge>}
                {product.isComingSoon && <Badge variant="comingsoon">Coming Soon</Badge>}
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-bold leading-[1.05] text-foreground">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-sm text-foreground-muted mt-2">
                  by{' '}
                  <Link href={`/en/brand/${product.brand.slug}`} className="text-[color:var(--color-action)] hover:underline">
                    {product.brand.name}
                  </Link>
                </p>
              )}
            </div>

            {product.avgRating > 0 && (
              <StarRating rating={product.avgRating} size="md" showCount count={product.reviewCount} />
            )}

            <div className="flex flex-wrap items-end gap-3">
              <span className="skin-glow-text font-heading text-4xl sm:text-5xl font-bold">
                {format(Number(effectiveSalePrice ?? effectivePrice))}
              </span>
              {effectiveSalePrice && (
                <div className="flex flex-col pb-1">
                  <span className="text-base text-foreground-subtle line-through">{format(Number(effectivePrice))}</span>
                  <span className="text-sm text-success font-medium">
                    You save {format(Number(effectivePrice) - Number(effectiveSalePrice))}
                  </span>
                </div>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-base text-foreground-muted leading-relaxed max-w-lg">{product.shortDescription}</p>
            )}

            {product.variants && product.variants.filter((v) => v.isActive).length > 1 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Select option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.filter((v) => v.isActive).map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                        variant.id === selectedVariantId
                          ? 'border-[color:var(--color-action)] bg-accent/10 text-[color:var(--color-action)]'
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

            {product.isPreorder && product.releaseDate && (
              <div className="skin-plate flex items-center gap-2 p-3">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Release Date</p>
                  <p className="text-sm text-foreground-muted">
                    {new Date(product.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

            {!product.isComingSoon && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4">
                  <div className={cn('flex items-center border rounded-full overflow-hidden', isOutOfStock ? 'border-border opacity-50' : 'border-border')}>
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={isOutOfStock}
                      className="px-4 py-2.5 text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors disabled:pointer-events-none"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2.5 font-semibold min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => (stockQuantity > 0 ? Math.min(stockQuantity, q + 1) : q + 1))}
                      disabled={isOutOfStock}
                      className="px-4 py-2.5 text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors disabled:pointer-events-none"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {isOutOfStock ? (
                    <span className="text-sm text-error flex items-center gap-1 font-medium"><PackageX className="h-4 w-4" /> Out of Stock</span>
                  ) : isLowStock ? (
                    <span className="text-sm text-warning flex items-center gap-1 font-medium"><AlertTriangle className="h-4 w-4" /> Only {stockQuantity} left in stock</span>
                  ) : (
                    <span className="text-sm text-success flex items-center gap-1"><Check className="h-4 w-4" /> In Stock</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" size="lg" className="flex-1 min-w-[9.5rem]" onClick={handleAddToCart} disabled={isOutOfStock}>
                    {isOutOfStock ? (
                      <><PackageX className="h-5 w-5" /> Out of Stock</>
                    ) : addedToCart ? (
                      <><Check className="h-5 w-5" /> Added!</>
                    ) : (
                      <><ShoppingCart className="h-5 w-5" /> {product.isPreorder ? 'Pre-Order Now' : 'Add to Cart'}</>
                    )}
                  </Button>
                  <button
                    onClick={() => (isWishlisted ? removeProduct(product.id) : addProduct(product.id))}
                    className={cn(
                      'h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 rounded-md border flex items-center justify-center transition-colors',
                      isWishlisted ? 'bg-accent border-accent text-white' : 'border-border text-foreground-muted hover:border-[color:var(--color-action)] hover:text-[color:var(--color-action)]',
                    )}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
                  </button>
                  <button
                    className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 rounded-md border border-border flex items-center justify-center text-foreground-muted hover:border-border-hover transition-colors"
                    aria-label="Share"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Info plates */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="skin-plate flex items-start gap-3 p-4">
                <Truck className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Free Delivery</p>
                  <p className="text-xs text-foreground-muted">On orders over AED 150 · 2–5 business days</p>
                </div>
              </div>
              <div className="skin-plate flex items-start gap-3 p-4">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Easy Returns</p>
                  <p className="text-xs text-foreground-muted">7-day return policy for unopened items</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <p className="text-xs text-foreground-subtle">Pay with:</p>
              {['VISA', 'Mastercard', 'Tabby', 'Tamara', 'COD'].map((m) => (
                <span key={m} className="skin-plate px-2 py-0.5 text-xs text-foreground-muted font-medium">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Details accordion ───────────────────────────── */}
        <div className="mt-16 max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">Details</h2>
          <Accordion
            defaultOpen={['description']}
            items={[
              {
                value: 'description',
                trigger: 'Description',
                content: product.description ? (
                  <p className="text-foreground-muted leading-relaxed whitespace-pre-wrap">{product.description}</p>
                ) : (
                  <p className="text-foreground-muted">No description available.</p>
                ),
              },
              {
                value: 'specs',
                trigger: 'Specifications',
                content: specsWithValues.length === 0 ? (
                  <p className="text-foreground-muted">No specifications available for this product.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {specsWithValues.map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-foreground-muted">{k}</span>
                        <span className="text-sm text-foreground font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                value: 'faq',
                trigger: 'FAQ',
                content: <p className="text-foreground-muted">No FAQ available for this product yet.</p>,
              },
            ]}
          />
        </div>

        {/* ── Reviews ───────────────────────────── */}
        <div className="mt-16 max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-foreground mb-5">Reviews</h2>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-6 mb-6">
              <div className="skin-card-frame rounded-xl bg-surface-1 px-6 py-4 text-center">
                <p className="font-heading text-5xl font-bold skin-glow-text">{Number(product.avgRating).toFixed(1)}</p>
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
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="skin-icon-well mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <Star className="h-6 w-6 text-foreground-subtle" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-1">No reviews yet</h3>
              <p className="text-sm text-foreground-muted w-full max-w-sm mx-auto">
                Be the first to share what you think about {product.name}.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {reviews.map((review) => (
                <li key={review.id} className="border-b border-border pb-5 last:border-b-0">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <p className="text-sm font-semibold text-foreground">
                      {review.customer ? `${review.customer.firstName} ${review.customer.lastName}` : 'Verified Buyer'}
                    </p>
                    <time className="text-xs text-foreground-subtle" dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </time>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.title && <p className="text-sm font-medium text-foreground mt-2">{review.title}</p>}
                  <p className="text-sm text-foreground-muted mt-1 leading-relaxed whitespace-pre-wrap">{review.body}</p>
                  {review.reply && (
                    <div className="skin-plate mt-3 p-3">
                      <p className="text-xs font-semibold text-foreground mb-1">Response from seller</p>
                      <p className="text-xs text-foreground-muted leading-relaxed">{review.reply}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── You may also like — reel, matching the homepage shelf language ─── */}
      {(relatedLoading || relatedProducts.length > 0) && (
        <div className="mt-8 border-t border-border">
          <VaultProductReel title="You may also like" products={relatedProducts} isLoading={relatedLoading} />
        </div>
      )}
    </div>
  );
}
