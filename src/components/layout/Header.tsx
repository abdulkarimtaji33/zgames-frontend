'use client';

import { useSkin } from '@/lib/theme/skin';
import { VaultHeader } from '@/components/skins/vault/VaultHeader';
import { ArcadeHeader } from '@/components/skins/arcade/ArcadeHeader';

/**
 * Thin dispatcher — each skin owns a genuinely different nav/header
 * structure (not a restyle of a shared one), built under
 * src/components/skins/<skin>/. SSR/first paint renders Arcade; it swaps
 * to Vault after mount if that's what localStorage says.
 */
export function Header() {
  const { skin } = useSkin();
  return skin === 'arcade' ? <ArcadeHeader /> : <VaultHeader />;
}
