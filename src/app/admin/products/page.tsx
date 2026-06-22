'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { productsApi } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productsApi.findAll({ limit: 50 })
      .then((res) => {
        const d = res.data.data as PaginatedResponse<Product>;
        setProducts(d.items ?? []);
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

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

      <DataTable
        data={products}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search products..."
        columns={[
          { key: 'name', label: 'Product', sortable: true, render: (v, row) => (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-background-tertiary flex items-center justify-center text-xl flex-shrink-0">🎮</div>
              <div>
                <p className="font-medium line-clamp-1">{String(v)}</p>
                <p className="text-xs text-foreground-muted">{row.sku}</p>
              </div>
            </div>
          )},
          { key: 'price', label: 'Price', sortable: true, render: (v, row) => (
            <div>
              <p className="font-medium">AED {Number(v).toFixed(2)}</p>
              {row.salePrice && <p className="text-xs text-success">Sale: AED {Number(row.salePrice).toFixed(2)}</p>}
            </div>
          )},
          { key: 'platform', label: 'Platform', render: (v) => v ? <Badge variant="default" size="xs">{String(v)}</Badge> : <span className="text-foreground-subtle">—</span> },
          { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Active' : 'Inactive'}</Badge> },
          { key: 'isPreorder', label: 'Type', render: (v, row) => (
            <span className="text-xs text-foreground-muted">
              {row.isPreorder ? '🔔 Pre-order' : row.isComingSoon ? '⏳ Coming Soon' : '✅ In Stock'}
            </span>
          )},
        ]}
        actions={(row) => (
          <>
            <Link href={`/en/products/${row.slug}`} target="_blank">
              <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Eye className="h-3.5 w-3.5" /></button>
            </Link>
            <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
            <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </>
        )}
        emptyMessage="No products found."
      />
    </div>
  );
}