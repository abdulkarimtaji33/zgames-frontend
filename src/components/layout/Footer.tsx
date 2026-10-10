'use client';

import { useSkin } from '@/lib/theme/skin';
import { VaultFooter } from '@/components/skins/vault/VaultFooter';
import { ArcadeFooter } from '@/components/skins/arcade/ArcadeFooter';

/**
 * Thin dispatcher — each skin owns a genuinely different footer
 * structure, built under src/components/skins/<skin>/. SSR/first paint
 * renders Arcade; it swaps to Vault after mount if that's what
 * localStorage says.
 */
export function Footer() {
  const { skin } = useSkin();
  return skin === 'arcade' ? <ArcadeFooter /> : <VaultFooter />;
}
