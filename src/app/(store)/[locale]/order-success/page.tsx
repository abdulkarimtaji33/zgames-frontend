'use client';

import { useSkin } from '@/lib/theme/skin';
import { VaultOrderSuccessPage } from '@/components/skins/vault/VaultOrderSuccessPage';
import { ArcadeOrderSuccessPage } from '@/components/skins/arcade/ArcadeOrderSuccessPage';

/** Thin dispatcher — see src/app/(store)/[locale]/page.tsx for the pattern. */
export default function OrderSuccessPage() {
  const { skin } = useSkin();
  return skin === 'arcade' ? <ArcadeOrderSuccessPage /> : <VaultOrderSuccessPage />;
}
