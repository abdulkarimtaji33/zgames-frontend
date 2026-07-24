'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/Button';
import { adminProductsApi, adminCategoriesApi, adminBrandsApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks/useAdminToast';
import type { Category, Brand } from '@/types';

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

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  type: 'simple',
  price: '',
  salePrice: '',
  description: '',
  platform: 'n_a',
  categoryId: '',
  brandId: '',
  isActive: true,
  isFeatured: false,
};

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

function validateProductForm(form: ProductForm): Partial<Record<keyof ProductForm, string>> {
  const errors: Partial<Record<keyof ProductForm, string>> = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!form.price.trim()) {
    errors.price = 'Price is required.';
  } else if (Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Enter a valid price of 0 or more.';
  }

  if (form.salePrice.trim()) {
    if (Number.isNaN(Number(form.salePrice)) || Number(form.salePrice) < 0) {
      errors.salePrice = 'Enter a valid sale price of 0 or more.';
    } else if (form.price.trim() && !Number.isNaN(Number(form.price)) && Number(form.salePrice) >= Number(form.price)) {
      errors.salePrice = 'Sale price must be less than the regular price.';
    }
  }

  if (form.sku.trim() && !/^[A-Za-z0-9._-]+$/.test(form.sku.trim())) {
    errors.sku = 'SKU can only contain letters, numbers, dots, dashes, and underscores.';
  }

  return errors;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const { show } = useAdminToast();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    Promise.all([
      adminCategoriesApi.tree(),
      adminBrandsApi.findAll({ limit: 100 }),
    ])
      .then(([catRes, brandRes]) => {
        setCategories(flattenCategories(catRes.data.data ?? []));
        const brandData = brandRes.data.data;
        setBrands(Array.isArray(brandData) ? brandData : brandData.items ?? []);
      })
      .catch(() => show('Failed to load form options', 'error'))
      .finally(() => setIsLoadingOptions(false));
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProductForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
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
      const res = await adminProductsApi.create(payload);
      const newId = res.data.data.id;
      if (coverImage) {
        await adminProductsApi.addImage(newId, { url: coverImage, isFeatured: true, sortOrder: 0 });
      }
      show('Product created', 'success');
      router.push(`/admin/products/${newId}`);
    } catch {
      show('Failed to create product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-bold">New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl bg-card border border-border shadow-sm p-5 md:p-6 space-y-5">
        <FormField label="Cover Image">
          <div className="flex items-center gap-3">
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="" className="h-20 w-20 rounded-lg object-cover border border-border" />
            ) : (
              <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-foreground-subtle flex-shrink-0">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
            <ImageUpload folder="products" value={coverImage} onChange={setCoverImage} label={coverImage ? 'Change image' : 'Upload cover image'} />
          </div>
          <p className="text-xs text-foreground-muted mt-1.5">You can add more photos and manage variants after creating the product.</p>
        </FormField>

        <FormField label="Name" error={errors.name} required>
          <FormInput
            value={form.name}
            onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: undefined })); }}
            placeholder="Product name"
            required
            error={!!errors.name}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="SKU" error={errors.sku}>
            <FormInput
              value={form.sku}
              onChange={(e) => { setForm((f) => ({ ...f, sku: e.target.value })); setErrors((er) => ({ ...er, sku: undefined })); }}
              placeholder="SKU-001"
              error={!!errors.sku}
            />
          </FormField>
          <FormField label="Product Type">
            <FormSelect
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              disabled={isLoadingOptions}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </FormSelect>
          </FormField>
        </div>

        {form.type === 'gift_card' && (
          <p className="text-xs text-accent bg-accent/10 rounded-lg px-3 py-2">
            This is a digital gift card. After creating it, add one variant per denomination (e.g. AED 50 / 100 / 250) —
            each purchase will automatically issue and email a redeemable code once paid.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Platform">
            <FormSelect
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              disabled={isLoadingOptions}
            >
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Price (AED)" error={errors.price} required>
            <FormInput
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => { setForm((f) => ({ ...f, price: e.target.value })); setErrors((er) => ({ ...er, price: undefined })); }}
              placeholder="0.00"
              required
              error={!!errors.price}
            />
          </FormField>
        </div>

        <FormField label="Sale Price (AED)" error={errors.salePrice}>
          <FormInput
            type="number"
            min={0}
            step="0.01"
            value={form.salePrice}
            onChange={(e) => { setForm((f) => ({ ...f, salePrice: e.target.value })); setErrors((er) => ({ ...er, salePrice: undefined })); }}
            placeholder="Optional"
            error={!!errors.salePrice}
          />
        </FormField>

        <FormField label="Description">
          <FormTextarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Product description"
            rows={4}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Category">
            <FormSelect
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              disabled={isLoadingOptions}
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
              onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
              disabled={isLoadingOptions}
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
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="accent-accent h-4 w-4"
            />
            <span className="text-sm text-foreground">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              className="accent-accent h-4 w-4"
            />
            <span className="text-sm text-foreground">Featured</span>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Product
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
