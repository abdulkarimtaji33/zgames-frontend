'use client';

import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminStoresApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface StoreRow {
  id: string;
  name: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

const EMPTY_FORM = { name: '', address: '', phone: '', latitude: '', longitude: '', isActive: true };

export default function AdminStoresPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminStoresApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<StoreRow> | StoreRow[] } }>,
    [],
  );
  const { items, isLoading, reload } = usePaginatedList<StoreRow>({ fetcher, limit: 50 });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<StoreRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (row: StoreRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      address: row.address,
      phone: row.phone ?? '',
      latitude: row.latitude != null ? String(row.latitude) : '',
      longitude: row.longitude != null ? String(row.longitude) : '',
      isActive: row.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        phone: form.phone || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        isActive: form.isActive,
      };
      if (editing) {
        await adminStoresApi.update(editing.id, payload);
        toast('Store updated', 'success');
      } else {
        await adminStoresApi.create(payload);
        toast('Store created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch {
      toast('Failed to save store', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await adminStoresApi.remove(deleteId);
      toast('Store deleted', 'success');
      setDeleteId(null);
      reload();
    } catch {
      toast('Failed to delete store', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Store Locations</h1>
        <Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Store</Button>
      </div>

      <DataTable
        data={items}
        isLoading={isLoading}
        searchable
        columns={[
          { key: 'name', label: 'Name', sortable: true },
          { key: 'address', label: 'Address', render: (v) => <span className="text-sm line-clamp-1">{String(v)}</span> },
          { key: 'phone', label: 'Phone', render: (v) => String(v ?? '—') },
          { key: 'latitude', label: 'Coordinates', render: (_, row) => row.latitude != null ? `${row.latitude}, ${row.longitude}` : '—' },
          { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v !== false ? 'success' : 'error'} size="xs">{v !== false ? 'Active' : 'Inactive'}</Badge> },
        ]}
        actions={(row) => <CrudActions onEdit={() => openEdit(row)} onDelete={() => setDeleteId(row.id)} />}
        emptyMessage="No stores found."
      />

      <AdminModal open={modalOpen} title={editing ? 'Edit Store' : 'Add Store'} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={submitting} wide>
        <div className="space-y-4">
          <FormField label="Name"><FormInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Address"><FormInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></FormField>
          <FormField label="Phone"><FormInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Latitude"><FormInput type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></FormField>
            <FormField label="Longitude"><FormInput type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></FormField>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} title="Delete Store" message="Are you sure you want to delete this store?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={submitting} destructive />
    </div>
  );
}
