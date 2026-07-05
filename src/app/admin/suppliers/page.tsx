'use client';

import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput, FormTextarea } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminSuppliersApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface SupplierRow {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

const emptyForm = { name: '', email: '', phone: '', address: '', isActive: true };

export default function AdminSuppliersPage() {
  const toast = useAdminToast((s) => s.show);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRow | null>(null);
  const [deleting, setDeleting] = useState<SupplierRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminSuppliersApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<SupplierRow> } }>,
    [],
  );

  const { items, page, setPage, total, totalPages, isLoading, reload } =
    usePaginatedList<SupplierRow>({ fetcher, limit: 20 });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row: SupplierRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      email: row.email ?? '',
      phone: row.phone ?? '',
      address: row.address ?? '',
      isActive: row.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast('Name is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        isActive: form.isActive,
      };
      if (editing) {
        await adminSuppliersApi.update(editing.id, payload);
        toast('Supplier updated', 'success');
      } else {
        await adminSuppliersApi.create(payload);
        toast('Supplier created', 'success');
      }
      setModalOpen(false);
      setForm(emptyForm);
      setEditing(null);
      reload();
    } catch {
      toast(editing ? 'Failed to update supplier' : 'Failed to create supplier', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSubmitting(true);
    try {
      await adminSuppliersApi.remove(deleting.id);
      toast('Supplier deleted', 'success');
      setDeleteOpen(false);
      setDeleting(null);
      reload();
    } catch {
      toast('Failed to delete supplier', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Suppliers</h1>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'email', label: 'Email', render: (v) => String(v ?? '—') },
            { key: 'phone', label: 'Phone', render: (v) => String(v ?? '—') },
            {
              key: 'address',
              label: 'Address',
              render: (v) => <span className="text-sm line-clamp-1">{String(v ?? '—')}</span>,
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
            <CrudActions
              onEdit={() => openEdit(row)}
              onDelete={() => {
                setDeleting(row);
                setDeleteOpen(true);
              }}
            />
          )}
          emptyMessage="No suppliers found."
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Edit Supplier' : 'Add Supplier'}
        isSubmitting={isSubmitting}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          setForm(emptyForm);
        }}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <FormField label="Name">
            <FormInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Supplier name"
            />
          </FormField>
          <FormField label="Email">
            <FormInput
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contact@supplier.com"
            />
          </FormField>
          <FormField label="Phone">
            <FormInput
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+971..."
            />
          </FormField>
          <FormField label="Address">
            <FormTextarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Supplier address"
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-border"
            />
            Active
          </label>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleting?.name}"?`}
        destructive
        isLoading={isSubmitting}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
