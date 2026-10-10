'use client';

import { useSkin } from '@/lib/theme/skin';
import { VaultCategoryPage } from '@/components/skins/vault/VaultCategoryPage';
import { ArcadeCategoryPage } from '@/components/skins/arcade/ArcadeCategoryPage';

/** Thin dispatcher — see src/app/(store)/[locale]/page.tsx for the pattern.
 * Each skin component reads its own params/searchParams via next/navigation
 * hooks (useParams/useSearchParams), same as the page did before. */
export default function CategoryPage() {
  const { skin } = useSkin();
  return skin === 'arcade' ? <ArcadeCategoryPage /> : <VaultCategoryPage />;
}
