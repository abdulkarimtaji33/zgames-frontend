'use client';

import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput, FormTextarea } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminBrandsApi } from '@/lib/api/adminApi';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import type { Brand } from '@/types';

interface BrandRow extends Brand {
  description?: string;
  logo?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

interface BrandForm {
  name: string;
  description: string;
  logo: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: BrandForm = {
  name: '',
  description: '',
  logo: '',
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
};

export default function AdminBrandsPage() {
  const { show } = useAdminToast();
  const fetcher = useCallback((params: Record<string, unknown>) => adminBrandsApi.findAll(params), []);
  const { items, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<BrandRow>({ fetcher });

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<BrandRow | null>(null);
  const [deleting, setDeleting] = useState<BrandRow | null>(null);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (brand: BrandRow) => {
    setEditing(brand);
    setForm({
      name: brand.name,
      description: brand.description ?? '',
      logo: brand.logo ?? brand.logoUrl ?? '',
      isFeatured: brand.isFeatured ?? false,
      isActive: brand.isActive !== false,
      sortOrder: brand.sortOrder ?? 0,
    });
    setModalOpen(true);
  };

  const openDelete = (brand: BrandRow) => {
    setDeleting(brand);
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      show('Name is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        logo: form.logo.trim() || undefined,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };
      if (editing) {
        await adminBrandsApi.update(editing.id, payload);
        show('Brand updated', 'success');
      } else {
        await adminBrandsApi.create(payload);
        show('Brand created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch {
      show(editing ? 'Failed to update brand' : 'Failed to create brand', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await adminBrandsApi.remove(deleting.id);
      show('Brand deleted', 'success');
      setConfirmOpen(false);
      setDeleting(null);
      reload();
    } catch {
      show('Failed to delete brand', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Brands</h1>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>

      <div>
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search brands..."
          columns={[
            {
              key: 'name',
              label: 'Brand',
              sortable: true,
              render: (v, row) => (
                <div className="flex items-center gap-3">
                  {(row.logo ?? row.logoUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.logo ?? row.logoUrl} alt="" className="h-8 w-8 rounded object-cover bg-background-tertiary" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-background-tertiary flex items-center justify-center text-sm font-bold">
                      {String(v)[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{String(v)}</p>
                    <p className="text-xs text-foreground-muted">/{row.slug}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'isFeatured',
              label: 'Featured',
              render: (v) => v ? <Badge variant="accent" size="xs">Featured</Badge> : null,
            },
            {
              key: 'sortOrder',
              label: 'Sort',
              align: 'right',
              render: (v) => String(v ?? 0),
            },
            {
              key: 'isActive',
              label: 'Status',
              render: (v) => (
                <Badge variant={v !== false ? 'success' : 'error'} size="xs">
                  {v !== false ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
          ]}
          actions={(row) => (
            <CrudActions onEdit={() => openEdit(row)} onDelete={() => openDelete(row)} />
          )}
          emptyMessage="No brands yet. Add your first brand to get started."
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Edit Brand' : 'Add Brand'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <FormField label="Name">
            <FormInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Brand name"
            />
          </FormField>
          <FormField label="Description">
            <FormTextarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
            />
          </FormField>
          <FormField label="Logo URL">
            <FormInput
              value={form.logo}
              onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
              placeholder="https://..."
            />
          </FormField>
          <FormField label="Sort Order">
            <FormInput
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
            />
          </FormField>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="accent-accent h-4 w-4"
              />
              <span className="text-sm text-foreground">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="accent-accent h-4 w-4"
              />
              <span className="text-sm text-foreground">Active</span>
            </label>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Brand"
        message={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleting(null); }}
        isLoading={isDeleting}
        destructive
      />
    </div>
  );
}
