'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight, Star, Minus, Plus, Check, AlertTriangle, Truck } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/store/StarRating';
import { Skeleton } from '@/components/ui/Skeleton';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types';

const TABS = ['Description', 'Specifications', 'Reviews', 'FAQ'];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { productIds: wishlist, addProduct, removeProduct } = useWishlistStore();
  const isWishlisted = product ? wishlist.includes(product.id) : false;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.findBySlug(slug);
        setProduct(res.data.data);
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) load();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const featuredImage = product.images?.find((i) => i.isFeatured) ?? product.images?.[0];
    addItem({
      productId: product.id,
      quantity,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      imageUrl: featuredImage?.url,
      slug: product.slug,
      platform: product.platform,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Skeleton height={400} className="rounded-xl" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} height={80} width={80} className="rounded-lg" />)}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton height={32} width="80%" />
            <Skeleton height={20} width="40%" />
            <Skeleton height={40} width="30%" />
            <Skeleton height={120} />
            <Skeleton height={48} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-20 text-center">
        <span className="text-6xl mb-4 block">😢</span>
        <h2 className="font-heading text-2xl font-bold mb-2">Product not found</h2>
        <Link href="/en" className="text-accent hover:underline">← Back to shop</Link>
      </div>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[selectedImageIndex];
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-6">
      <Breadcrumbs
        items={[
          { label: 'Shop', href: '/en' },
          { label: product.category?.name ?? 'Products', href: `/en/category/${product.category?.slug ?? 'all'}` },
          { label: product.name },
        ]}
        className="mb-6"
      />

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Image Gallery ──────────────────────── */}
        <div className="space-y-4">
          <div className="relative rounded-2xl bg-background-tertiary overflow-hidden aspect-square group">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={currentImage.alt ?? product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-7xl">🎮</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4">
                <Badge variant="sale" size="md">-{discountPercent}%</Badge>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(i)}
                  className={cn(
                    'flex-shrink-0 h-18 w-18 rounded-lg overflow-hidden border-2 transition-colors',
                    i === selectedImageIndex ? 'border-accent' : 'border-border hover:border-border-hover',
                  )}
                >
                  <Image src={img.url} alt={img.alt ?? ''} width={72} height={72} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ───────────────────────── */}
        <div className="space-y-5">
          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {product.platform && <Badge variant="default">{product.platform}</Badge>}
              {product.region && <Badge variant="outline">{product.region}</Badge>}
              {product.isPreorder && <Badge variant="preorder">Pre-Order</Badge>}
              {product.isComingSoon && <Badge variant="comingsoon">Coming Soon</Badge>}
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold leading-snug">{product.name}</h1>
            {product.brand && (
              <p className="text-sm text-foreground-muted mt-1">
                by{' '}
                <Link href={`/en/brand/${product.brand.slug}`} className="text-accent hover:underline">
                  {product.brand.name}
                </Link>
              </p>
            )}
          </div>

          {/* Rating */}
          {product.avgRating > 0 && (
            <StarRating rating={product.avgRating} size="md" showCount count={product.reviewCount} />
          )}

          {/* Price */}
          <div className="border-t border-b border-border py-4">
            <div className="flex items-end gap-3">
              <span className="font-heading text-4xl font-bold text-accent">
                AED {(product.salePrice ?? product.price).toFixed(2)}
              </span>
              {product.salePrice && (
                <div className="flex flex-col">
                  <span className="text-lg text-foreground-subtle line-through">AED {product.price.toFixed(2)}</span>
                  <span className="text-sm text-success font-medium">You save AED {(product.price - product.salePrice).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-sm text-foreground-muted leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Release date */}
          {product.isPreorder && product.releaseDate && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-900/20 border border-purple-500/20">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-sm font-medium text-foreground">Release Date</p>
                <p className="text-sm text-foreground-muted">{new Date(product.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          )}

          {/* Quantity + Cart */}
          {!product.isComingSoon && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2.5 text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2.5 font-semibold min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-2.5 text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-success flex items-center gap-1">
                  <Check className="h-4 w-4" /> In Stock
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  {addedToCart ? (
                    <><Check className="h-5 w-5" /> Added!</>
                  ) : (
                    <><ShoppingCart className="h-5 w-5" /> {product.isPreorder ? 'Pre-Order Now' : 'Add to Cart'}</>
                  )}
                </Button>
                <button
                  onClick={() => isWishlisted ? removeProduct(product.id) : addProduct(product.id)}
                  className={cn(
                    'h-12 w-12 rounded-xl border flex items-center justify-center transition-colors',
                    isWishlisted ? 'bg-accent border-accent text-white' : 'border-border text-foreground-muted hover:border-accent hover:text-accent',
                  )}
                  aria-label="Wishlist"
                >
                  <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
                </button>
                <button
                  className="h-12 w-12 rounded-xl border border-border flex items-center justify-center text-foreground-muted hover:border-border-hover transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Delivery info */}
          <div className="rounded-xl bg-background-tertiary p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Free Delivery</p>
                <p className="text-xs text-foreground-muted">On orders over AED 150 · Estimated 2–5 business days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Easy Returns</p>
                <p className="text-xs text-foreground-muted">7-day return policy for unopened items</p>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-xs text-foreground-subtle">Pay with:</p>
            {['VISA', 'Mastercard', 'Tabby', 'Tamara', 'COD'].map((m) => (
              <span key={m} className="px-2 py-0.5 rounded bg-background-tertiary border border-border text-xs text-foreground-muted font-medium">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────── */}
      <div className="mt-16">
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                activeTab === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-foreground-muted hover:text-foreground',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="py-8">
          {activeTab === 'Description' && (
            <div className="prose prose-invert max-w-none">
              {product.description ? (
                <p className="text-foreground-muted leading-relaxed whitespace-pre-wrap">{product.description}</p>
              ) : (
                <p className="text-foreground-muted">No description available.</p>
              )}
            </div>
          )}
          {activeTab === 'Specifications' && (
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ['Platform', product.platform],
                ['Genre', product.genre],
                ['Region', product.region],
                ['Publisher', product.publisher],
                ['Developer', product.developer],
                ['SKU', product.sku],
                ['Barcode', product.barcode],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between py-3 border-b border-border">
                  <span className="text-sm text-foreground-muted">{k}</span>
                  <span className="text-sm text-foreground font-medium">{v}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'Reviews' && (
            <div className="space-y-6">
              {product.reviewCount === 0 ? (
                <div className="text-center py-10">
                  <Star className="h-10 w-10 text-foreground-subtle mx-auto mb-3" />
                  <p className="text-foreground-muted">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="text-center">
                      <p className="font-heading text-6xl font-bold text-accent">{product.avgRating.toFixed(1)}</p>
                      <StarRating rating={product.avgRating} size="lg" />
                      <p className="text-sm text-foreground-muted mt-1">{product.reviewCount} reviews</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground-muted">Reviews loaded from API</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'FAQ' && (
            <p className="text-foreground-muted">No FAQ available for this product.</p>
          )}
        </div>
      </div>
    </div>
  );
}