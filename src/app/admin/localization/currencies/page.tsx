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
import { adminCurrenciesApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface CurrencyRow {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

const EMPTY_FORM = { code: '', name: '', symbol: '', exchangeRate: '1', isActive: true };

export default function AdminCurrenciesPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminCurrenciesApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<CurrencyRow> | CurrencyRow[] } }>,
    [],
  );
  const { items, isLoading, reload } = usePaginatedList<CurrencyRow>({ fetcher, limit: 50 });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CurrencyRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (row: CurrencyRow) => {
    setEditing(row);
    setForm({
      code: row.code,
      name: row.name,
      symbol: row.symbol,
      exchangeRate: String(row.exchangeRate ?? 1),
      isActive: row.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        name: form.name,
        symbol: form.symbol,
        exchangeRate: Number(form.exchangeRate),
        isActive: form.isActive,
      };
      if (editing) {
        await adminCurrenciesApi.update(editing.id, payload);
        toast('Currency updated', 'success');
      } else {
        await adminCurrenciesApi.create(payload);
        toast('Currency created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch {
      toast('Failed to save currency', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (row: CurrencyRow) => {
    try {
      await adminCurrenciesApi.setDefault(row.id);
      toast(`${row.code} set as default`, 'success');
      reload();
    } catch {
      toast('Failed to set default currency', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await adminCurrenciesApi.remove(deleteId);
      toast('Currency deleted', 'success');
      setDeleteId(null);
      reload();
    } catch {
      toast('Failed to delete currency', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Currencies</h1>
        <Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Currency</Button>
      </div>

      <DataTable
        data={items}
        isLoading={isLoading}
        searchable
        columns={[
          { key: 'code', label: 'Code', render: (v) => <Badge variant="default" size="xs">{String(v)}</Badge> },
          { key: 'name', label: 'Name', sortable: true },
          { key: 'symbol', label: 'Symbol' },
          { key: 'exchangeRate', label: 'Rate', render: (v) => Number(v ?? 1).toFixed(4) },
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
        emptyMessage="No currencies found."
      />

      <AdminModal open={modalOpen} title={editing ? 'Edit Currency' : 'Add Currency'} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={submitting}>
        <div className="space-y-4">
          <FormField label="Code (3 letters)"><FormInput value={form.code} maxLength={3} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} disabled={!!editing} /></FormField>
          <FormField label="Name"><FormInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Symbol"><FormInput value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} /></FormField>
          <FormField label="Exchange Rate"><FormInput type="number" min="0" step="0.0001" value={form.exchangeRate} onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })} /></FormField>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} title="Delete Currency" message="Are you sure you want to delete this currency?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={submitting} destructive />
    </div>
  );
}
