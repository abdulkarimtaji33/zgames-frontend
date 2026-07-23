'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus, Ticket } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput, FormSelect } from '@/components/admin/FormField';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminCouponsApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface CouponRow {
  id: string;
  code: string;
  discountType?: string;
  type?: string;
  discountValue?: number;
  value?: number;
  minimumOrderAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount?: number;
  usedCount?: number;
  expiresAt?: string;
  endsAt?: string;
  isActive: boolean;
}

const EMPTY_FORM = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minimumOrderAmount: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
};

function couponType(row: CouponRow) {
  return row.discountType ?? row.type ?? 'percentage';
}

function couponValue(row: CouponRow) {
  return Number(row.discountValue ?? row.value ?? 0);
}

function couponMinOrder(row: CouponRow) {
  return row.minimumOrderAmount ?? row.minOrderAmount;
}

function couponExpires(row: CouponRow) {
  return row.expiresAt ?? row.endsAt;
}

function couponUsage(row: CouponRow) {
  return row.usageCount ?? row.usedCount ?? 0;
}

function toDateInput(v?: string) {
  if (!v) return '';
  return new Date(v).toISOString().slice(0, 16);
}

export default function AdminCouponsPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminCouponsApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<CouponRow> | CouponRow[] } }>,
    [],
  );
  const { items, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<CouponRow>({ fetcher });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const active = useMemo(() => items.filter((c) => c.isActive).length, [items]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row: CouponRow) => {
    setEditing(row);
    setForm({
      code: row.code,
      discountType: couponType(row),
      discountValue: String(couponValue(row)),
      minimumOrderAmount: couponMinOrder(row) != null ? String(couponMinOrder(row)) : '',
      usageLimit: row.usageLimit != null ? String(row.usageLimit) : '',
      expiresAt: toDateInput(couponExpires(row)),
      isActive: row.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        isActive: form.isActive,
      };
      if (editing) {
        await adminCouponsApi.update(editing.id, payload);
        toast('Coupon updated', 'success');
      } else {
        await adminCouponsApi.create(payload);
        toast('Coupon created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch {
      toast('Failed to save coupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await adminCouponsApi.remove(deleteId);
      toast('Coupon deleted', 'success');
      setDeleteId(null);
      reload();
    } catch {
      toast('Failed to delete coupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Coupons</h1>
        <Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Create Coupon</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Coupons" value={String(active)} icon={<Ticket className="h-4 w-4" />} color="text-success" />
        <StatCard title="Total Coupons" value={String(total)} icon={<Ticket className="h-4 w-4" />} color="text-info" />
        <StatCard title="Total Redemptions" value={String(items.reduce((s, c) => s + couponUsage(c), 0))} icon={<Ticket className="h-4 w-4" />} color="text-accent" />
        <StatCard title="Expired/Inactive" value={String(items.length - active)} icon={<Ticket className="h-4 w-4" />} color="text-error" />
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          columns={[
            { key: 'code', label: 'Code', render: (v) => <code className="bg-background-tertiary px-2 py-0.5 rounded text-accent font-mono text-sm">{String(v)}</code> },
            { key: 'discountType', label: 'Type', render: (_, row) => <Badge variant="default" size="xs">{couponType(row)}</Badge> },
            { key: 'discountValue', label: 'Discount', align: 'right', render: (_, row) => couponType(row).includes('percentage') ? `${couponValue(row)}%` : `AED ${couponValue(row)}` },
            { key: 'usageCount', label: 'Used', align: 'right', render: (_, row) => `${couponUsage(row)} / ${row.usageLimit ?? '∞'}` },
            { key: 'expiresAt', label: 'Expires', render: (_, row) => <span className="text-xs text-foreground-muted">{couponExpires(row) ? new Date(couponExpires(row)!).toLocaleDateString() : 'Never'}</span> },
            { key: 'isActive', label: 'Active', render: (v) => <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Yes' : 'No'}</Badge> },
          ]}
          actions={(row) => <CrudActions onEdit={() => openEdit(row)} onDelete={() => setDeleteId(row.id)} />}
          emptyMessage="No coupons found."
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      <AdminModal open={modalOpen} title={editing ? 'Edit Coupon' : 'Create Coupon'} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={submitting}>
        <div className="space-y-4">
          <FormField label="Code"><FormInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE20" /></FormField>
          <FormField label="Discount Type">
            <FormSelect value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="free_shipping">Free Shipping</option>
            </FormSelect>
          </FormField>
          <FormField label="Discount Value"><FormInput type="number" min="0" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} /></FormField>
          <FormField label="Minimum Order Amount"><FormInput type="number" min="0" step="0.01" value={form.minimumOrderAmount} onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value })} /></FormField>
          <FormField label="Usage Limit"><FormInput type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited if empty" /></FormField>
          <FormField label="Expires At"><FormInput type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></FormField>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} title="Delete Coupon" message="Are you sure you want to delete this coupon?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={submitting} destructive />
    </div>
  );
}
