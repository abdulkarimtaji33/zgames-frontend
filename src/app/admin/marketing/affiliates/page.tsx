'use client';

import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput, FormSelect } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminAffiliatesApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface AffiliateRow {
  id: string;
  customerId: string;
  code: string;
  commissionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  status: string;
}

const EMPTY_FORM = { customerId: '', code: '', commissionRate: '5', status: 'pending' };

export default function AdminAffiliatesPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminAffiliatesApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<AffiliateRow> | AffiliateRow[] } }>,
    [],
  );
  const { items, isLoading, reload } = usePaginatedList<AffiliateRow>({ fetcher, limit: 50 });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AffiliateRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row: AffiliateRow) => {
    setEditing(row);
    setForm({
      customerId: row.customerId,
      code: row.code,
      commissionRate: String(row.commissionRate),
      status: row.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        customerId: form.customerId,
        code: form.code,
        commissionRate: Number(form.commissionRate),
        status: form.status,
      };
      if (editing) {
        await adminAffiliatesApi.update(editing.id, payload);
        toast('Affiliate updated', 'success');
      } else {
        await adminAffiliatesApi.create(payload);
        toast('Affiliate created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch {
      toast('Failed to save affiliate', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await adminAffiliatesApi.remove(deleteId);
      toast('Affiliate deleted', 'success');
      setDeleteId(null);
      reload();
    } catch {
      toast('Failed to delete affiliate', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant = (s: string) => {
    if (s === 'active') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'rejected') return 'error';
    return 'default';
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Affiliates</h1>
        <Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Affiliate</Button>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          columns={[
            { key: 'code', label: 'Code', render: (v) => <code className="font-mono text-sm text-accent">{String(v)}</code> },
            { key: 'customerId', label: 'Customer', render: (v) => <span className="text-xs font-mono">{String(v).slice(0, 8)}…</span> },
            { key: 'commissionRate', label: 'Commission', align: 'right', render: (v) => `${v}%` },
            { key: 'totalEarnings', label: 'Total Earnings', align: 'right', render: (v) => `AED ${Number(v).toFixed(2)}` },
            { key: 'pendingEarnings', label: 'Pending', align: 'right', render: (v) => `AED ${Number(v).toFixed(2)}` },
            { key: 'status', label: 'Status', render: (v) => <Badge variant={statusVariant(String(v))} size="xs">{String(v)}</Badge> },
          ]}
          actions={(row) => <CrudActions onEdit={() => openEdit(row)} onDelete={() => setDeleteId(row.id)} />}
          emptyMessage="No affiliates found."
        />
      </div>

      <AdminModal open={modalOpen} title={editing ? 'Edit Affiliate' : 'Create Affiliate'} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={submitting}>
        <div className="space-y-4">
          <FormField label="Customer ID"><FormInput value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} disabled={!!editing} /></FormField>
          <FormField label="Affiliate Code"><FormInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></FormField>
          <FormField label="Commission Rate (%)"><FormInput type="number" min="0" max="100" step="0.01" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} /></FormField>
          <FormField label="Status">
            <FormSelect value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="rejected">Rejected</option>
            </FormSelect>
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} title="Delete Affiliate" message="Are you sure you want to delete this affiliate?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={submitting} destructive />
    </div>
  );
}
