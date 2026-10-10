'use client';

import { useSkin } from '@/lib/theme/skin';
import { VaultCartPage } from '@/components/skins/vault/VaultCartPage';
import { ArcadeCartPage } from '@/components/skins/arcade/ArcadeCartPage';

/** Thin dispatcher — see src/app/(store)/[locale]/page.tsx for the pattern. */
export default function CartPage() {
  const { skin } = useSkin();
  return skin === 'arcade' ? <ArcadeCartPage /> : <VaultCartPage />;
}
