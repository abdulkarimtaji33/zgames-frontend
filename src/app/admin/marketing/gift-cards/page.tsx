'use client';

import { useCallback, useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminModal } from '@/components/admin/AdminModal';
import { FormField, FormInput } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminGiftCardsApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface GiftCardRow {
  id: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
  expiresAt?: string;
  purchasedByCustomerId?: string | null;
  sentToEmail?: string | null;
}

function toDateInput(v?: string) {
  if (!v) return '';
  return new Date(v).toISOString().slice(0, 16);
}

export default function AdminGiftCardsPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminGiftCardsApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<GiftCardRow> | GiftCardRow[] } }>,
    [],
  );
  const { items, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<GiftCardRow>({ fetcher, limit: 20 });

  const [issueOpen, setIssueOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ amount: '', expiresAt: '' });
  const [batchForm, setBatchForm] = useState({ count: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleIssue = async () => {
    setSubmitting(true);
    try {
      await adminGiftCardsApi.create({
        amount: Number(issueForm.amount),
        expiresAt: issueForm.expiresAt ? new Date(issueForm.expiresAt).toISOString() : undefined,
      });
      toast('Gift card issued', 'success');
      setIssueOpen(false);
      setIssueForm({ amount: '', expiresAt: '' });
      reload();
    } catch {
      toast('Failed to issue gift card', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatch = async () => {
    setSubmitting(true);
    try {
      await adminGiftCardsApi.createBatch({
        count: Number(batchForm.count),
        amount: Number(batchForm.amount),
      });
      toast(`${batchForm.count} gift cards issued`, 'success');
      setBatchOpen(false);
      setBatchForm({ count: '', amount: '' });
      reload();
    } catch {
      toast('Failed to batch issue gift cards', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Gift Cards</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setBatchOpen(true)}><Layers className="h-4 w-4" /> Batch Issue</Button>
          <Button variant="primary" size="sm" onClick={() => setIssueOpen(true)}><Plus className="h-4 w-4" /> Issue Gift Card</Button>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          columns={[
            { key: 'code', label: 'Code', render: (v) => <code className="font-mono text-sm text-accent">{String(v)}</code> },
            {
              key: 'purchasedByCustomerId',
              label: 'Source',
              render: (v, row) => v
                ? <Badge variant="accent" size="xs" title={row.sentToEmail ?? undefined}>Customer Purchased</Badge>
                : <Badge variant="default" size="xs">Manually Issued</Badge>,
            },
            { key: 'initialBalance', label: 'Initial', align: 'right', render: (v) => `AED ${Number(v).toFixed(2)}` },
            { key: 'currentBalance', label: 'Balance', align: 'right', render: (v) => <span className="font-bold text-accent">AED {Number(v).toFixed(2)}</span> },
            { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Active' : 'Inactive'}</Badge> },
            { key: 'expiresAt', label: 'Expires', render: (v) => v ? new Date(String(v)).toLocaleDateString() : 'Never' },
          ]}
          emptyMessage="No gift cards found."
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      <AdminModal open={issueOpen} title="Issue Gift Card" onClose={() => setIssueOpen(false)} onSubmit={handleIssue} isSubmitting={submitting} submitLabel="Issue">
        <div className="space-y-4">
          <FormField label="Amount"><FormInput type="number" min="1" step="0.01" value={issueForm.amount} onChange={(e) => setIssueForm({ ...issueForm, amount: e.target.value })} /></FormField>
          <FormField label="Expires At"><FormInput type="datetime-local" value={issueForm.expiresAt} onChange={(e) => setIssueForm({ ...issueForm, expiresAt: e.target.value })} /></FormField>
        </div>
      </AdminModal>

      <AdminModal open={batchOpen} title="Batch Issue Gift Cards" onClose={() => setBatchOpen(false)} onSubmit={handleBatch} isSubmitting={submitting} submitLabel="Generate">
        <div className="space-y-4">
          <FormField label="Count"><FormInput type="number" min="1" value={batchForm.count} onChange={(e) => setBatchForm({ ...batchForm, count: e.target.value })} /></FormField>
          <FormField label="Amount (each)"><FormInput type="number" min="1" step="0.01" value={batchForm.amount} onChange={(e) => setBatchForm({ ...batchForm, amount: e.target.value })} /></FormField>
        </div>
      </AdminModal>
    </div>
  );
}
