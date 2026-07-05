'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { adminProductsApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks/useAdminToast';
import { Button } from '@/components/ui/Button';
import { ProductPicker } from './ProductPicker';
import type { Product } from '@/types';

interface ProductRelatedTabProps {
  productId: string;
  related: Product[];
  upsell: Product[];
  crossSell: Product[];
}

function RelatedSection({
  title, description, productId, initial, save,
}: {
  title: string;
  description: string;
  productId: string;
  initial: Product[];
  save: (id: string, productIds: string[]) => Promise<unknown>;
}) {
  const { show } = useAdminToast();
  const [selected, setSelected] = useState<Product[]>(initial);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(productId, selected.map((p) => p.id));
      show(`${title} updated`, 'success');
    } catch {
      show(`Failed to update ${title.toLowerCase()}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs text-foreground-muted mt-0.5">{description}</p>
      </div>
      <ProductPicker selected={selected} onChange={setSelected} excludeId={productId} />
      <Button type="button" variant="secondary" size="sm" onClick={handleSave} isLoading={saving}>
        <Save className="h-4 w-4" /> Save {title}
      </Button>
    </div>
  );
}

export function ProductRelatedTab({ productId, related, upsell, crossSell }: ProductRelatedTabProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground-muted">
        Control which products show up as recommendations on this product&apos;s storefront page.
      </p>
      <RelatedSection
        title="Related Products"
        description="Shown as “You may also like” on the product page."
        productId={productId}
        initial={related}
        save={adminProductsApi.setRelated}
      />
      <RelatedSection
        title="Upsell Products"
        description="Higher-value alternatives suggested before checkout."
        productId={productId}
        initial={upsell}
        save={adminProductsApi.setUpsell}
      />
      <RelatedSection
        title="Cross-sell Products"
        description="Complementary add-ons suggested in the cart."
        productId={productId}
        initial={crossSell}
        save={adminProductsApi.setCrosssell}
      />
    </div>
  );
}
