'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput, FormTextarea } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminWarehousesApi } from '@/lib/api/adminApi';

interface WarehouseRow {
  id: string;
  name: string;
  code?: string;
  address?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
}

const emptyForm = { name: '', code: '', address: '', isActive: true };

export default function AdminWarehousesPage() {
  const toast = useAdminToast((s) => s.show);
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseRow | null>(null);
  const [deleting, setDeleting] = useState<WarehouseRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminWarehousesApi.findAll();
      setWarehouses((res.data.data ?? []) as unknown as WarehouseRow[]);
    } catch {
      toast('Failed to load warehouses', 'error');
      setWarehouses([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row: WarehouseRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      code: row.code ?? '',
      address: row.address ?? '',
      isActive: row.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast('Name and code are required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        addressLine1: form.address.trim() || undefined,
        isActive: form.isActive,
      };
      if (editing) {
        await adminWarehousesApi.update(editing.id, payload);
        toast('Warehouse updated', 'success');
      } else {
        await adminWarehousesApi.create(payload);
        toast('Warehouse created', 'success');
      }
      setModalOpen(false);
      setForm(emptyForm);
      setEditing(null);
      load();
    } catch {
      toast(editing ? 'Failed to update warehouse' : 'Failed to create warehouse', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (row: WarehouseRow) => {
    try {
      await adminWarehousesApi.setDefault(row.id);
      toast(`${row.name} set as default`, 'success');
      load();
    } catch {
      toast('Failed to set default warehouse', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSubmitting(true);
    try {
      await adminWarehousesApi.remove(deleting.id);
      toast('Warehouse deleted', 'success');
      setDeleteOpen(false);
      setDeleting(null);
      load();
    } catch {
      toast('Failed to delete warehouse', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Warehouses</h1>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Warehouse
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <DataTable
          data={warehouses}
          isLoading={isLoading}
          searchable
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'code', label: 'Code', render: (v) => String(v ?? '—') },
            {
              key: 'address',
              label: 'Address',
              render: (v) => <span className="text-sm line-clamp-1">{String(v ?? '—')}</span>,
            },
            {
              key: 'isDefault',
              label: 'Default',
              render: (v) => (v ? <Badge variant="success" size="xs">Default</Badge> : null),
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
            <>
              {!row.isDefault && (
                <Button variant="ghost" size="xs" onClick={() => handleSetDefault(row)}>
                  Set Default
                </Button>
              )}
              <CrudActions onEdit={() => openEdit(row)} onDelete={() => { setDeleting(row); setDeleteOpen(true); }} />
            </>
          )}
          emptyMessage="No warehouses found."
        />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Edit Warehouse' : 'Add Warehouse'}
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
              placeholder="Main Warehouse"
            />
          </FormField>
          <FormField label="Code">
            <FormInput
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="WH-001"
              disabled={!!editing}
            />
          </FormField>
          <FormField label="Address">
            <FormTextarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Full address"
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
        title="Delete Warehouse"
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
