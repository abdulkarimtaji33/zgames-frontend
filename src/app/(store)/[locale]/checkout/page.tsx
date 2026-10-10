'use client';

import { useSkin } from '@/lib/theme/skin';
import { VaultCheckoutPage } from '@/components/skins/vault/VaultCheckoutPage';
import { ArcadeCheckoutPage } from '@/components/skins/arcade/ArcadeCheckoutPage';

/** Thin dispatcher — see src/app/(store)/[locale]/page.tsx for the pattern. */
export default function CheckoutPage() {
  const { skin } = useSkin();
  return skin === 'arcade' ? <ArcadeCheckoutPage /> : <VaultCheckoutPage />;
}
