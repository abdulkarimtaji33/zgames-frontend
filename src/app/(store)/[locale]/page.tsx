'use client';

import { useSkin } from '@/lib/theme/skin';
import { VaultHomepage } from '@/components/skins/vault/VaultHomepage';
import { ArcadeHomepage } from '@/components/skins/arcade/ArcadeHomepage';

/**
 * The homepage is a thin dispatcher — each skin owns a genuinely different
 * layout/structure (not just a restyle of a shared one), built as its own
 * component under src/components/skins/<skin>/. SSR/first paint renders
 * Arcade (the default skin); it swaps to Vault after mount if that's what
 * localStorage says, same tradeoff as the no-flash CSS script but for
 * markup — a one-time swap for returning Vault users, not a persistent
 * flash.
 */
export default function HomePage() {
  const { skin } = useSkin();
  return skin === 'arcade' ? <ArcadeHomepage /> : <VaultHomepage />;
}
