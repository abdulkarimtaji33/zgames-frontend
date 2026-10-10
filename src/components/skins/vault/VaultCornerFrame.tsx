'use client';

import type { ReactNode } from 'react';
import { useSkin } from '@/lib/theme/skin';
import { cn } from '@/lib/utils/cn';

interface VaultCornerFrameProps {
  children: ReactNode;
  className?: string;
}

/**
 * VaultCornerFrame — wraps key visual content (the homepage hero slider,
 * a product gallery's main image, a key-art banner) with four small
 * violet corner brackets, like a museum display case or a targeting
 * reticle — reinforcing the "vault display" identity beyond what the
 * `.skin-hero` glow/vignette alone communicates.
 *
 * Not wired into any page. Intended usage is to wrap the existing hero
 * markup in `src/app/(store)/[locale]/page.tsx` and/or the main image in
 * `src/components/store/ProductGallery.tsx`:
 *
 *   <VaultCornerFrame>
 *     <HeroSlider />
 *   </VaultCornerFrame>
 *
 * Falls back to rendering only its children (no wrapper, no brackets)
 * when the active skin isn't "vault", so it's safe to mount unconditionally.
 */
export function VaultCornerFrame({ children, className }: VaultCornerFrameProps) {
  const { skin } = useSkin();
  if (skin !== 'vault') return <>{children}</>;

  const bracket = 'absolute h-5 w-5 border-[color:var(--color-action)] opacity-70';

  return (
    <div className={cn('relative', className)}>
      {children}
      <span aria-hidden="true" className={cn(bracket, 'top-0 left-0 border-t-2 border-l-2 rounded-tl-sm')} />
      <span aria-hidden="true" className={cn(bracket, 'top-0 right-0 border-t-2 border-r-2 rounded-tr-sm')} />
      <span aria-hidden="true" className={cn(bracket, 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-sm')} />
      <span aria-hidden="true" className={cn(bracket, 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm')} />
    </div>
  );
}
