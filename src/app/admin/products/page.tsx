'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormSelect } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminProductsApi, adminCategoriesApi, adminBrandsApi } from '@/lib/api/adminApi';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import type { Category, Brand, Product } from '@/types';

function flattenCategories(cats: Category[], depth = 0): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  for (const cat of cats) {
    result.push({ id: cat.id, label: `${'— '.repeat(depth)}${cat.name}` });
    if (cat.children?.length) result.push(...flattenCategories(cat.children, depth + 1));
  }
  return result;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { show } = useAdminToast();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    adminCategoriesApi.tree().then((res) => setCategories(flattenCategories(res.data.data ?? []))).catch(() => {});
    adminBrandsApi.findAll({ limit: 100 }).then((res) => {
      const data = res.data.data;
      setBrands(Array.isArray(data) ? data : data.items ?? []);
    }).catch(() => {});
  }, []);

  const fetcher = useCallback((params: Record<string, unknown>) => adminProductsApi.findAll(params), []);
  const extraParams = useMemo(() => ({
    ...(search ? { search } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(status ? { isActive: status === 'active' } : {}),
  }), [search, categoryId, brandId, status]);
  const { items, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<Product>({ fetcher, extraParams });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDelete = (product: Product) => {
    setDeleting(product);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await adminProductsApi.remove(deleting.id);
      show('Product deleted', 'success');
      setConfirmOpen(false);
      setDeleting(null);
      reload();
    } catch {
      show('Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div>
        <DataTable
          data={items}
          total={total}
          hideFooter
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search all products..."
          onSearch={setSearch}
          filters={(
            <>
              <FormSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-auto min-w-[9rem]">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </FormSelect>
              <FormSelect value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-auto min-w-[9rem]">
                <option value="">All Brands</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </FormSelect>
              <FormSelect value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto min-w-[9rem]">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </FormSelect>
            </>
          )}
          columns={[
            {
              key: 'name',
              label: 'Product',
              sortable: true,
              render: (v, row) => (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-background-tertiary flex items-center justify-center text-xl flex-shrink-0">
                    {row.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.images[0].url} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      '🎮'
                    )}
                  </div>
                  <div>
                    <p className="font-medium line-clamp-1">{String(v)}</p>
                    <p className="text-xs text-foreground-muted">{row.sku ?? '—'}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'price',
              label: 'Price',
              sortable: true,
              align: 'right',
              render: (v, row) => (
                <div>
                  <p className="font-medium">AED {Number(v).toFixed(2)}</p>
                  {row.salePrice != null && (
                    <p className="text-xs text-success">Sale: AED {Number(row.salePrice).toFixed(2)}</p>
                  )}
                </div>
              ),
            },
            {
              key: 'platform',
              label: 'Platform',
              render: (v) => v ? <Badge variant="default" size="xs">{String(v)}</Badge> : <span className="text-foreground-subtle">—</span>,
            },
            {
              key: 'isActive',
              label: 'Status',
              render: (v) => (
                <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Active' : 'Inactive'}</Badge>
              ),
            },
            {
              key: 'isFeatured',
              label: 'Featured',
              render: (v) => v ? <Badge variant="accent" size="xs">Yes</Badge> : null,
            },
          ]}
          actions={(row) => (
            <CrudActions
              viewHref={`/admin/products/${row.id}`}
              onEdit={() => router.push(`/admin/products/${row.id}`)}
              onDelete={() => openDelete(row)}
            />
          )}
          emptyMessage={
            search || categoryId || brandId || status
              ? 'No products match your filters. Try adjusting search or clearing filters.'
              : 'No products yet. Add your first product to get started.'
          }
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleting(null); }}
        isLoading={isDeleting}
        destructive
      />
    </div>
  );
}
