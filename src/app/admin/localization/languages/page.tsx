'use client';

import { useCallback, useState } from 'react';
import { Plus, Star } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminLanguagesApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface LanguageRow {
  id: string;
  code: string;
  name: string;
  nativeName?: string;
  isRTL?: boolean;
  isDefault?: boolean;
  isActive?: boolean;
}

const EMPTY_FORM = { code: '', name: '', nativeName: '', isRTL: false, isActive: true };

export default function AdminLanguagesPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminLanguagesApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<LanguageRow> | LanguageRow[] } }>,
    [],
  );
  const { items, isLoading, reload } = usePaginatedList<LanguageRow>({ fetcher, limit: 50 });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<LanguageRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (row: LanguageRow) => {
    setEditing(row);
    setForm({
      code: row.code,
      name: row.name,
      nativeName: row.nativeName ?? '',
      isRTL: row.isRTL ?? false,
      isActive: row.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (editing) {
        await adminLanguagesApi.update(editing.id, payload);
        toast('Language updated', 'success');
      } else {
        await adminLanguagesApi.create(payload);
        toast('Language created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch {
      toast('Failed to save language', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (row: LanguageRow) => {
    try {
      await adminLanguagesApi.setDefault(row.id);
      toast(`${row.name} set as default`, 'success');
      reload();
    } catch {
      toast('Failed to set default language', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await adminLanguagesApi.remove(deleteId);
      toast('Language deleted', 'success');
      setDeleteId(null);
      reload();
    } catch {
      toast('Failed to delete language', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Languages</h1>
        <Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Language</Button>
      </div>

      <DataTable
        data={items}
        isLoading={isLoading}
        searchable
        columns={[
          { key: 'code', label: 'Code', render: (v) => <Badge variant="default" size="xs">{String(v)}</Badge> },
          { key: 'name', label: 'Name', sortable: true },
          { key: 'nativeName', label: 'Native Name', render: (v) => String(v ?? '—') },
          { key: 'isRTL', label: 'RTL', render: (v) => v ? 'Yes' : 'No' },
          { key: 'isDefault', label: 'Default', render: (v) => v ? <Badge variant="success" size="xs">Default</Badge> : null },
          { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v !== false ? 'success' : 'error'} size="xs">{v !== false ? 'Active' : 'Inactive'}</Badge> },
        ]}
        actions={(row) => (
          <>
            {!row.isDefault && (
              <button onClick={() => handleSetDefault(row)} className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-accent transition-colors" title="Set Default">
                <Star className="h-3.5 w-3.5" />
              </button>
            )}
            <CrudActions onEdit={() => openEdit(row)} onDelete={() => setDeleteId(row.id)} />
          </>
        )}
        emptyMessage="No languages found."
      />

      <AdminModal open={modalOpen} title={editing ? 'Edit Language' : 'Add Language'} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={submitting}>
        <div className="space-y-4">
          <FormField label="Code"><FormInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={!!editing} placeholder="en" /></FormField>
          <FormField label="Name"><FormInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Native Name"><FormInput value={form.nativeName} onChange={(e) => setForm({ ...form, nativeName: e.target.value })} /></FormField>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isRTL} onChange={(e) => setForm({ ...form, isRTL: e.target.checked })} /> Right-to-left (RTL)</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} title="Delete Language" message="Are you sure you want to delete this language?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={submitting} destructive />
    </div>
  );
}
