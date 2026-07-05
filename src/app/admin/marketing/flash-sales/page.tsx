'use client';

import { useCallback, useState } from 'react';
import { Plus, PackagePlus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminFlashSalesApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface FlashSaleProduct {
  id: string;
  productId: string;
  salePrice: number;
  product?: { name?: string };
}

interface FlashSaleRow {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  products?: FlashSaleProduct[];
}

const EMPTY_FORM = { name: '', startsAt: '', endsAt: '', isActive: true };

function toDateInput(v?: string) {
  if (!v) return '';
  return new Date(v).toISOString().slice(0, 16);
}

export default function AdminFlashSalesPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminFlashSalesApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<FlashSaleRow> | FlashSaleRow[] } }>,
    [],
  );
  const { items, isLoading, reload } = usePaginatedList<FlashSaleRow>({ fetcher, limit: 50 });

  const [modalOpen, setModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<FlashSaleRow | null>(null);
  const [selectedSale, setSelectedSale] = useState<FlashSaleRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [productForm, setProductForm] = useState({ productId: '', salePrice: '' });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row: FlashSaleRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      startsAt: toDateInput(row.startsAt),
      endsAt: toDateInput(row.endsAt),
      isActive: row.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        isActive: form.isActive,
      };
      if (editing) {
        await adminFlashSalesApi.update(editing.id, payload);
        toast('Flash sale updated', 'success');
      } else {
        await adminFlashSalesApi.create(payload);
        toast('Flash sale created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch {
      toast('Failed to save flash sale', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await adminFlashSalesApi.remove(deleteId);
      toast('Flash sale deleted', 'success');
      setDeleteId(null);
      reload();
    } catch {
      toast('Failed to delete flash sale', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddProduct = (row: FlashSaleRow) => {
    setSelectedSale(row);
    setProductForm({ productId: '', salePrice: '' });
    setProductModalOpen(true);
  };

  const handleAddProduct = async () => {
    if (!selectedSale) return;
    setSubmitting(true);
    try {
      await adminFlashSalesApi.addProduct(selectedSale.id, {
        productId: productForm.productId,
        salePrice: Number(productForm.salePrice),
      });
      toast('Product added to flash sale', 'success');
      setProductModalOpen(false);
      reload();
    } catch {
      toast('Failed to add product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Flash Sales</h1>
        <Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Create Flash Sale</Button>
      </div>

      <DataTable
        data={items}
        isLoading={isLoading}
        searchable
        columns={[
          { key: 'name', label: 'Name', sortable: true },
          { key: 'startsAt', label: 'Start', render: (v) => new Date(String(v)).toLocaleString() },
          { key: 'endsAt', label: 'End', render: (v) => new Date(String(v)).toLocaleString() },
          { key: 'products', label: 'Products', render: (v) => String((v as FlashSaleProduct[] | undefined)?.length ?? 0) },
          { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'default'} size="xs">{v ? 'Active' : 'Inactive'}</Badge> },
        ]}
        actions={(row) => (
          <>
            <button onClick={() => openAddProduct(row)} className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-accent transition-colors" title="Add Product">
              <PackagePlus className="h-3.5 w-3.5" />
            </button>
            <CrudActions onEdit={() => openEdit(row)} onDelete={() => setDeleteId(row.id)} />
          </>
        )}
        emptyMessage="No flash sales found."
      />

      <AdminModal open={modalOpen} title={editing ? 'Edit Flash Sale' : 'Create Flash Sale'} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={submitting}>
        <div className="space-y-4">
          <FormField label="Name"><FormInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Starts At"><FormInput type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></FormField>
          <FormField label="Ends At"><FormInput type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></FormField>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
        </div>
      </AdminModal>

      <AdminModal open={productModalOpen} title={`Add Product — ${selectedSale?.name ?? ''}`} onClose={() => setProductModalOpen(false)} onSubmit={handleAddProduct} isSubmitting={submitting} submitLabel="Add Product">
        <div className="space-y-4">
          <FormField label="Product ID" hint="UUID of the product"><FormInput value={productForm.productId} onChange={(e) => setProductForm({ ...productForm, productId: e.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></FormField>
          <FormField label="Sale Price"><FormInput type="number" min="0" step="0.01" value={productForm.salePrice} onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })} /></FormField>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} title="Delete Flash Sale" message="Are you sure you want to delete this flash sale?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={submitting} destructive />
    </div>
  );
}
