'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from './StarRating';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { productIds: wishlist, addProduct, removeProduct } = useWishlistStore();
  const isWishlisted = wishlist.includes(product.id);

  const featuredImage = product.images?.find((i) => i.isFeatured) ?? product.images?.[0];
  const imageUrl = !imageError && featuredImage?.url ? featuredImage.url : null;
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      imageUrl: imageUrl ?? undefined,
      slug: product.slug,
      platform: product.platform,
      type: product.type,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) removeProduct(product.id);
    else addProduct(product.id);
  };

  return (
    <Link href={`/en/products/${product.slug}`} className={cn('group block', className)}>
      <div className="rounded-xl bg-card border border-border overflow-hidden card-hover h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-background-tertiary overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={featuredImage?.alt ?? product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🎮</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isPreorder && <Badge variant="preorder">Pre-Order</Badge>}
            {product.isComingSoon && <Badge variant="comingsoon">Soon</Badge>}
            {!product.isPreorder && !product.isComingSoon && discountPercent > 0 && (
              <Badge variant="sale">-{discountPercent}%</Badge>
            )}
            {product.isFeatured && !product.isPreorder && !discountPercent && (
              <Badge variant="new">Featured</Badge>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center shadow-lg transition-colors',
                isWishlisted
                  ? 'bg-accent text-white'
                  : 'bg-card/90 text-foreground-muted hover:bg-accent hover:text-white',
              )}
              aria-label="Wishlist"
            >
              <Heart className={cn('h-3.5 w-3.5', isWishlisted && 'fill-current')} />
            </button>
            <Link
              href={`/en/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 rounded-full bg-card/90 flex items-center justify-center shadow-lg text-foreground-muted hover:bg-background-tertiary transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Platform badge */}
          {product.platform && (
            <div className="absolute bottom-2 left-2">
              <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                {product.platform}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-xs text-foreground-muted mb-0.5 line-clamp-1">
            {product.brand?.name ?? product.category?.name ?? ''}
          </p>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2 flex-1">
            {product.name}
          </h3>

          {product.avgRating > 0 && (
            <div className="mb-2">
              <StarRating rating={product.avgRating} showCount count={product.reviewCount} />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mt-auto">
            <div>
              {product.salePrice ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-accent">AED {product.salePrice.toFixed(2)}</span>
                  <span className="text-xs text-foreground-subtle line-through">AED {product.price.toFixed(2)}</span>
                </div>
              ) : (
                <span className="font-bold text-foreground">
                  {product.isPreorder ? `AED ${product.price.toFixed(2)}` : `AED ${product.price.toFixed(2)}`}
                </span>
              )}
            </div>
            {!product.isComingSoon && (
              <button
                onClick={handleAddToCart}
                className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors flex-shrink-0"
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}