'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ProductImageLightbox } from './ProductImageLightbox';
import type { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  /** Extra content rendered over the top-left of the main image, e.g. a sale badge. */
  badge?: ReactNode;
}

export function ProductGallery({ images, productName, badge }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [erroredIds, setErroredIds] = useState<Set<string>>(new Set());

  const hasMultiple = images.length > 1;
  const currentImage = images[selectedIndex];
  const currentErrored = currentImage ? erroredIds.has(currentImage.id) : false;

  const markErrored = (id: string) =>
    setErroredIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const openAt = (i: number) => {
    setSelectedIndex(i);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-surface-2">
        {currentImage && !currentErrored ? (
          <button
            type="button"
            onClick={() => openAt(selectedIndex)}
            className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={`View larger image of ${productName}`}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt ?? productName}
              fill
              className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              onError={() => markErrored(currentImage.id)}
            />
            {/* Zoom affordance */}
            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground-muted opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
              <Expand className="h-4 w-4" />
            </span>
          </button>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl">🎮</div>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={() => setSelectedIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-card/80 flex items-center justify-center opacity-0 transition-opacity hover:bg-card group-hover:opacity-100 [@media(hover:none)]:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSelectedIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-card/80 flex items-center justify-center opacity-0 transition-opacity hover:bg-card group-hover:opacity-100 [@media(hover:none)]:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {badge && <div className="absolute top-4 left-4">{badge}</div>}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => {
            const errored = erroredIds.has(img.id);
            return (
              <button
                key={img.id}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  'h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                  i === selectedIndex ? 'border-accent' : 'border-border hover:border-border-hover',
                )}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === selectedIndex}
              >
                {errored ? (
                  <div className="flex h-full w-full items-center justify-center text-lg">🎮</div>
                ) : (
                  <Image
                    src={img.url}
                    alt={img.alt ?? ''}
                    width={72}
                    height={72}
                    className="h-full w-full object-cover"
                    onError={() => markErrored(img.id)}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <ProductImageLightbox
        images={images}
        productName={productName}
        index={selectedIndex}
        onIndexChange={setSelectedIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
