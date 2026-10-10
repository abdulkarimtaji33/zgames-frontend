'use client';

import { useSkin } from '@/lib/theme/skin';
import { VaultProductPage } from '@/components/skins/vault/VaultProductPage';
import { ArcadeProductPage } from '@/components/skins/arcade/ArcadeProductPage';

/** Thin dispatcher — see src/app/(store)/[locale]/page.tsx for the pattern. */
export default function ProductDetailPage() {
  const { skin } = useSkin();
  return skin === 'arcade' ? <ArcadeProductPage /> : <VaultProductPage />;
}
