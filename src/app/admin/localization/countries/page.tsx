'use client';

import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput, FormCheckbox } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminCountriesApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface CountryRow {
  id: string;
  name: string;
  code: string;
  dialCode?: string;
  currencyCode?: string;
  taxRate?: number;
  isActive: boolean;
}

const EMPTY_FORM = { name: '', code: '', dialCode: '', currencyCode: '', taxRate: '', isActive: true };

export default function AdminCountriesPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminCountriesApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<CountryRow> | CountryRow[] } }>,
    [],
  );
  const { items, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<CountryRow>({ fetcher });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CountryRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (row: CountryRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      code: row.code,
      dialCode: row.dialCode ?? '',
      currencyCode: row.currencyCode ?? '',
      taxRate: row.taxRate != null ? String(row.taxRate) : '',
      isActive: row.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        code: form.code.toUpperCase(),
        dialCode: form.dialCode || undefined,
        currencyCode: form.currencyCode || undefined,
        taxRate: form.taxRate ? Number(form.taxRate) : undefined,
        isActive: form.isActive,
      };
      if (editing) {
        await adminCountriesApi.update(editing.id, payload);
        toast('Country updated', 'success');
      } else {
        await adminCountriesApi.create(payload);
        toast('Country created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch {
      toast('Failed to save country', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await adminCountriesApi.remove(deleteId);
      toast('Country deleted', 'success');
      setDeleteId(null);
      reload();
    } catch {
      toast('Failed to delete country', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Countries</h1>
        <Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Country</Button>
      </div>

      <DataTable
        data={items}
        isLoading={isLoading}
        searchable
        columns={[
          { key: 'name', label: 'Name', sortable: true },
          { key: 'code', label: 'Code', render: (v) => <Badge variant="default" size="xs">{String(v)}</Badge> },
          { key: 'dialCode', label: 'Dial Code', render: (v) => String(v ?? '—') },
          { key: 'currencyCode', label: 'Currency', render: (v) => String(v ?? '—') },
          { key: 'taxRate', label: 'Tax Rate', align: 'right', render: (v) => v != null ? `${v}%` : '—' },
          { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Active' : 'Inactive'}</Badge> },
        ]}
        actions={(row) => <CrudActions onEdit={() => openEdit(row)} onDelete={() => setDeleteId(row.id)} />}
        emptyMessage="No countries found."
      />
      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <AdminModal open={modalOpen} title={editing ? 'Edit Country' : 'Add Country'} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={submitting}>
        <div className="space-y-4">
          <FormField label="Name"><FormInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Code (2 letters)"><FormInput value={form.code} maxLength={2} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} disabled={!!editing} /></FormField>
          <FormField label="Dial Code"><FormInput value={form.dialCode} onChange={(e) => setForm({ ...form, dialCode: e.target.value })} placeholder="+971" /></FormField>
          <FormField label="Currency Code"><FormInput value={form.currencyCode} maxLength={3} onChange={(e) => setForm({ ...form, currencyCode: e.target.value.toUpperCase() })} /></FormField>
          <FormField label="Tax Rate (%)"><FormInput type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} /></FormField>
          <FormCheckbox label="Active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} title="Delete Country" message="Are you sure you want to delete this country?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={submitting} destructive />
    </div>
  );
}
