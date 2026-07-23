'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { FormField, FormSelect } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminReturnsApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks';

interface ReturnItem {
  id: string;
  orderItemId: string;
  quantity: number;
  reason?: string | null;
}

interface ReturnDetail {
  id: string;
  orderId: string;
  customerId: string;
  status: string;
  reason: string;
  notes?: string | null;
  refundAmount?: number | null;
  refundMethod?: string | null;
  createdAt: string;
  items?: ReturnItem[];
}

const STATUSES = ['requested', 'approved', 'rejected', 'received', 'refunded'];
const STATUS_VARIANT: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  approved: 'success', rejected: 'error', requested: 'warning', received: 'info', refunded: 'success',
};

export default function AdminReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useAdminToast((s) => s.show);
  const [ret, setRet] = useState<ReturnDetail | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await adminReturnsApi.findOne(id);
      const data = (res.data.data ?? res.data) as ReturnDetail;
      setRet(data);
      setStatus(data.status);
    } catch {
      toast('Failed to load return', 'error');
      setRet(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = async () => {
    if (!status || status === ret?.status) return;
    setIsUpdating(true);
    try {
      await adminReturnsApi.update(id, { status });
      toast('Return status updated', 'success');
      load();
    } catch {
      toast('Failed to update return', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ret) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground-muted mb-4">Return not found.</p>
        <Link href="/admin/returns" className="text-accent text-sm hover:underline">Back to returns</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/returns" className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold">Return #{ret.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-foreground-muted">{new Date(ret.createdAt).toLocaleString()}</p>
        </div>
        <Badge variant={STATUS_VARIANT[ret.status] ?? 'default'} size="sm" className="ml-auto">{ret.status}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-3 text-sm">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-foreground-muted">Details</h2>
          <dl className="space-y-2">
            <div className="flex justify-between"><dt className="text-foreground-muted">Order ID</dt><dd className="font-mono text-xs">{ret.orderId}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground-muted">Customer ID</dt><dd className="font-mono text-xs">{ret.customerId}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground-muted">Reason</dt><dd>{ret.reason}</dd></div>
            {ret.notes && <div className="flex justify-between"><dt className="text-foreground-muted">Notes</dt><dd>{ret.notes}</dd></div>}
            {ret.refundAmount != null && (
              <div className="flex justify-between"><dt className="text-foreground-muted">Refund Amount</dt><dd>AED {Number(ret.refundAmount).toFixed(2)}</dd></div>
            )}
            {ret.refundMethod && (
              <div className="flex justify-between"><dt className="text-foreground-muted">Refund Method</dt><dd className="capitalize">{ret.refundMethod.replace(/_/g, ' ')}</dd></div>
            )}
          </dl>
        </div>

        <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-foreground-muted">Update Status</h2>
          <FormField label="Status">
            <FormSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </FormSelect>
          </FormField>
          <Button variant="primary" size="sm" onClick={handleUpdate} isLoading={isUpdating} disabled={status === ret.status}>
            Save Status
          </Button>
        </div>
      </div>

      {(ret.items?.length ?? 0) > 0 && (
        <div>
          <h2 className="font-heading text-lg font-bold mb-3">Return Items</h2>
          <DataTable
            data={ret.items!}
            columns={[
              { key: 'orderItemId', label: 'Order Item', render: (v) => <span className="font-mono text-xs">{String(v).slice(0, 8)}…</span> },
              { key: 'quantity', label: 'Qty', align: 'right' },
              { key: 'reason', label: 'Reason', render: (v) => String(v ?? '—') },
            ]}
            emptyMessage="No items."
          />
        </div>
      )}
    </div>
  );
}
