'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ProductImage } from '@/types';

interface ProductImageLightboxProps {
  images: ProductImage[];
  productName: string;
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

export function ProductImageLightbox({
  images,
  productName,
  index,
  onIndexChange,
  open,
  onClose,
}: ProductImageLightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const mounted = useMountedForExit(open);
  const prefersReducedMotion = useReducedMotion();
  const hasMultiple = images.length > 1;
  const current = images[index];

  const goTo = (next: number) => {
    setZoomed(false);
    onIndexChange((next + images.length) % images.length);
  };

  // Focus management: remember the trigger element and focus the panel on open,
  // return focus to the trigger on close.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      requestAnimationFrame(() => panelRef.current?.focus());
    } else {
      (triggerRef.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);

  // Keyboard: Escape closes, arrows navigate, Tab is trapped within the panel.
  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft' && hasMultiple) {
        e.preventDefault();
        goTo(index - 1);
        return;
      }
      if (e.key === 'ArrowRight' && hasMultiple) {
        e.preventDefault();
        goTo(index + 1);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, onClose, index, hasMultiple]);

  if (!mounted) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultiple) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0) goTo(index - 1);
      else goTo(index + 1);
    }
    touchStartX.current = null;
  };

  const slideDistance = prefersReducedMotion ? 0 : 40;
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col" role="presentation">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${productName} image gallery`}
        tabIndex={-1}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'relative z-10 flex h-full w-full flex-col outline-none transition-[opacity,transform] duration-300',
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-sm font-medium text-white/70">
            {hasMultiple ? `${index + 1} / ${images.length}` : productName}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomed((z) => !z)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
              aria-pressed={zoomed}
            >
              {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main image area */}
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4 sm:px-16"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {hasMultiple && (
            <button
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="relative h-full w-full max-w-4xl">
            <AnimatePresence mode="wait" initial={false}>
              {current && (
                <motion.div
                  key={current.id}
                  className="relative h-full w-full"
                  initial={{ opacity: 0, x: slideDistance }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slideDistance }}
                  transition={transition}
                >
                  <button
                    type="button"
                    className={cn(
                      'relative h-full w-full',
                      zoomed ? 'cursor-zoom-out' : hasMultiple ? 'cursor-default' : 'cursor-zoom-in',
                    )}
                    onClick={() => setZoomed((z) => !z)}
                    aria-label={zoomed ? 'Zoom out of image' : 'Zoom in to image'}
                  >
                    <Image
                      src={current.url}
                      alt={current.alt ?? productName}
                      fill
                      className={cn(
                        'object-contain transition-transform duration-300 ease-out',
                        zoomed ? 'scale-[1.9]' : 'scale-100',
                      )}
                      sizes="100vw"
                      priority
                    />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {hasMultiple && (
            <button
              onClick={() => goTo(index + 1)}
              className="absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {hasMultiple && (
          <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-4 sm:pb-6">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => goTo(i)}
                className={cn(
                  'h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-16 sm:w-16',
                  i === index ? 'border-white' : 'border-white/20 hover:border-white/50',
                )}
                aria-label={`View image ${i + 1}`}
                aria-current={i === index}
              >
                <Image src={img.url} alt="" width={64} height={64} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Keeps the lightbox mounted through its exit transition before unmounting. */
function useMountedForExit(open: boolean): boolean {
  const [mounted, setMounted] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMounted(true);
  }

  useEffect(() => {
    if (open || !mounted) return;
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open, mounted]);

  return mounted;
}
