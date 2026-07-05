'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormField';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { ProductImagesTab } from '@/components/admin/product/ProductImagesTab';
import { ProductVariantsTab } from '@/components/admin/product/ProductVariantsTab';
import { ProductRelatedTab } from '@/components/admin/product/ProductRelatedTab';
import { ProductGiftCardCodesTab } from '@/components/admin/product/ProductGiftCardCodesTab';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { adminProductsApi, adminCategoriesApi, adminBrandsApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks/useAdminToast';
import type { Product, Category, Brand } from '@/types';

const PLATFORM_OPTIONS = [
  { value: 'ps5', label: 'PlayStation 5' },
  { value: 'ps4', label: 'PlayStation 4' },
  { value: 'xbox_series_x', label: 'Xbox Series X' },
  { value: 'xbox_one', label: 'Xbox One' },
  { value: 'nintendo_switch', label: 'Nintendo Switch' },
  { value: 'pc', label: 'PC' },
  { value: 'multi', label: 'Multi-platform' },
  { value: 'n_a', label: 'N/A' },
];

const TYPE_OPTIONS = [
  { value: 'simple', label: 'Simple Product' },
  { value: 'variable', label: 'Variable (has variants)' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'gift_card', label: 'Digital Gift Card' },
  { value: 'digital', label: 'Digital / Download' },
  { value: 'preorder', label: 'Pre-order' },
  { value: 'limited', label: 'Limited Edition' },
];

interface ProductForm {
  name: string;
  sku: string;
  type: string;
  price: string;
  salePrice: string;
  description: string;
  platform: string;
  categoryId: string;
  brandId: string;
  isActive: boolean;
  isFeatured: boolean;
}

function flattenCategories(cats: Category[], depth = 0): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  for (const cat of cats) {
    result.push({ id: cat.id, label: `${'— '.repeat(depth)}${cat.name}` });
    if (cat.children?.length) {
      result.push(...flattenCategories(cat.children, depth + 1));
    }
  }
  return result;
}

function productToForm(product: Product): ProductForm {
  return {
    name: product.name,
    sku: product.sku ?? '',
    type: product.type ?? 'simple',
    price: String(product.price ?? ''),
    salePrice: product.salePrice != null ? String(product.salePrice) : '',
    description: product.description ?? '',
    platform: product.platform ?? 'n_a',
    categoryId: product.categoryId ?? product.category?.id ?? '',
    brandId: product.brandId ?? product.brand?.id ?? '',
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  };
}

type TabId = 'details' | 'images' | 'variants' | 'related' | 'codes';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { show } = useAdminToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('details');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      adminProductsApi.findOne(id),
      adminCategoriesApi.tree(),
      adminBrandsApi.findAll({ limit: 100 }),
    ])
      .then(([productRes, catRes, brandRes]) => {
        const p = productRes.data.data;
        setProduct(p);
        setForm(productToForm(p));
        setCategories(flattenCategories(catRes.data.data ?? []));
        const brandData = brandRes.data.data;
        setBrands(Array.isArray(brandData) ? brandData : brandData.items ?? []);
      })
      .catch(() => {
        show('Failed to load product', 'error');
        router.push('/admin/products');
      })
      .finally(() => setIsLoading(false));
  }, [id, show, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim()) {
      show('Name is required', 'error');
      return;
    }
    if (!form.price || Number(form.price) < 0) {
      show('Valid price is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        type: form.type,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        description: form.description.trim() || undefined,
        platform: form.platform,
        categoryId: form.categoryId || undefined,
        brandId: form.brandId || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };
      const res = await adminProductsApi.update(id, payload);
      setProduct(res.data.data);
      setForm(productToForm(res.data.data));
      show('Product updated', 'success');
    } catch {
      show('Failed to update product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminProductsApi.remove(id);
      show('Product deleted', 'success');
      router.push('/admin/products');
    } catch {
      show('Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !form || !product) {
    return (
      <div className="p-6 flex justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'images', label: 'Images', count: product.images?.length ?? 0 },
    { id: 'variants', label: 'Variants', count: product.variants?.length ?? 0 },
    ...(form.type === 'gift_card' ? [{ id: 'codes', label: 'Redemption Codes' }] : []),
    { id: 'related', label: 'Related Products' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold truncate">{product.name}</h1>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/en/products/${product.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-accent truncate"
              >
                /{product.slug} <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
              <Badge variant={product.isActive ? 'success' : 'error'} size="xs">{product.isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="px-2">
          <AdminTabs tabs={tabs} active={activeTab} onChange={(t) => setActiveTab(t as TabId)} />
        </div>

        <div className="p-5 md:p-6">
          {activeTab === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Name">
                <FormInput
                  value={form.name}
                  onChange={(e) => setForm((f) => f && ({ ...f, name: e.target.value }))}
                  placeholder="Product name"
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="SKU">
                  <FormInput
                    value={form.sku}
                    onChange={(e) => setForm((f) => f && ({ ...f, sku: e.target.value }))}
                    placeholder="SKU-001"
                  />
                </FormField>
                <FormField label="Product Type">
                  <FormSelect
                    value={form.type}
                    onChange={(e) => setForm((f) => f && ({ ...f, type: e.target.value }))}
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </FormSelect>
                </FormField>
              </div>

              {form.type === 'gift_card' && (
                <p className="text-xs text-accent bg-accent/10 rounded-lg px-3 py-2">
                  This is a digital gift card. Add one variant per denomination (e.g. AED 50 / 100 / 250) in the Variants tab —
                  each purchase will automatically issue and email a redeemable code once paid.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Platform">
                  <FormSelect
                    value={form.platform}
                    onChange={(e) => setForm((f) => f && ({ ...f, platform: e.target.value }))}
                  >
                    {PLATFORM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </FormSelect>
                </FormField>
                <FormField label="Price (AED)">
                  <FormInput
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => f && ({ ...f, price: e.target.value }))}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Sale Price (AED)">
                <FormInput
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) => setForm((f) => f && ({ ...f, salePrice: e.target.value }))}
                  placeholder="Optional"
                />
              </FormField>

              <FormField label="Description">
                <FormTextarea
                  value={form.description}
                  onChange={(e) => setForm((f) => f && ({ ...f, description: e.target.value }))}
                  rows={4}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Category">
                  <FormSelect
                    value={form.categoryId}
                    onChange={(e) => setForm((f) => f && ({ ...f, categoryId: e.target.value }))}
                  >
                    <option value="">None</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </FormSelect>
                </FormField>
                <FormField label="Brand">
                  <FormSelect
                    value={form.brandId}
                    onChange={(e) => setForm((f) => f && ({ ...f, brandId: e.target.value }))}
                  >
                    <option value="">None</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </FormSelect>
                </FormField>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => f && ({ ...f, isActive: e.target.checked }))}
                    className="accent-accent h-4 w-4"
                  />
                  <span className="text-sm text-foreground">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((f) => f && ({ ...f, isFeatured: e.target.checked }))}
                    className="accent-accent h-4 w-4"
                  />
                  <span className="text-sm text-foreground">Featured</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Button type="submit" variant="primary" isLoading={isSubmitting} className="mt-4">
                  Save Changes
                </Button>
                <Link href="/admin/products" className="mt-4">
                  <Button type="button" variant="secondary">Cancel</Button>
                </Link>
              </div>
            </form>
          )}

          {activeTab === 'images' && (
            <ProductImagesTab
              productId={id}
              images={product.images ?? []}
              onChange={(images) => setProduct((p) => p && ({ ...p, images }))}
            />
          )}

          {activeTab === 'variants' && (
            <ProductVariantsTab
              productId={id}
              variants={product.variants ?? []}
              onChange={(variants) => setProduct((p) => p && ({ ...p, variants }))}
            />
          )}

          {activeTab === 'codes' && (
            <ProductGiftCardCodesTab productId={id} variants={product.variants ?? []} />
          )}

          {activeTab === 'related' && (
            <ProductRelatedTab
              productId={id}
              related={product.relatedProducts ?? []}
              upsell={product.upsellProducts ?? []}
              crossSell={product.crossSellProducts ?? []}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        isLoading={isDeleting}
        destructive
      />
    </div>
  );
}
