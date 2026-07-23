'use client';

import { useCallback, useEffect, useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, RotateCcw } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminModal } from '@/components/admin/AdminModal';
import { FormField, FormInput, FormTextarea } from '@/components/admin/FormField';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminOrdersApi, adminPaymentsApi, adminReportsApi } from '@/lib/api/adminApi';
import type { Order, PaginatedResponse } from '@/types';

interface PaymentRow {
  id: string;
  orderId: string;
  orderNumber?: string;
  amount: number;
  status: string;
  method?: string;
  createdAt?: string;
}

export default function AdminFinancePage() {
  const toast = useAdminToast((s) => s.show);
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminOrdersApi.findAll({ ...params, sort: 'createdAt', order: 'DESC' }) as Promise<{ data: { data: PaginatedResponse<Order> } }>,
    [],
  );
  const { items: orders, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<Order>({ fetcher, limit: 20 });

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundForm, setRefundForm] = useState({ paymentId: '', amount: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminReportsApi.revenueSummary({})
      .then((res) => setSummary(res.data.data ?? {}))
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    setPaymentsLoading(true);
    Promise.all(
      orders.filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'completed' || o.paymentStatus === 'partially_refunded').slice(0, 20).map(async (order) => {
        try {
          const res = await adminPaymentsApi.findByOrder(order.id);
          const data = res.data.data;
          const list = Array.isArray(data) ? data : data ? [data] : [];
          return list.map((p: Record<string, unknown>) => ({
            id: String(p.id),
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: Number(p.amount ?? order.total),
            status: String(p.status ?? order.paymentStatus),
            method: String(p.method ?? '—'),
            createdAt: String(p.createdAt ?? order.createdAt),
          }));
        } catch {
          return [{
            id: order.id,
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: Number(order.total),
            status: order.paymentStatus,
            createdAt: order.createdAt,
          }];
        }
      }),
    )
      .then((results) => setPayments(results.flat()))
      .catch(() => setPayments([]))
      .finally(() => setPaymentsLoading(false));
  }, [orders]);

  const openRefund = (payment: PaymentRow) => {
    setRefundForm({ paymentId: payment.id, amount: String(payment.amount), reason: '' });
    setRefundOpen(true);
  };

  const handleRefund = async () => {
    setSubmitting(true);
    try {
      await adminPaymentsApi.refund({
        paymentId: refundForm.paymentId,
        amount: refundForm.amount ? Number(refundForm.amount) : undefined,
        reason: refundForm.reason || undefined,
      });
      toast('Refund processed', 'success');
      setRefundOpen(false);
      reload();
    } catch {
      toast('Failed to process refund', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant = (s: string) => {
    if (['completed', 'paid'].includes(s.toLowerCase())) return 'success';
    if (['refunded', 'partially_refunded'].includes(s.toLowerCase())) return 'warning';
    if (['failed', 'cancelled'].includes(s.toLowerCase())) return 'error';
    return 'default';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="font-heading text-2xl font-bold">Finance</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value={summaryLoading ? '...' : `AED ${Number(summary.revenue ?? 0).toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} color="text-success" />
        <StatCard title="Paid Orders" value={summaryLoading ? '...' : String(summary.orderCount ?? 0)} icon={<CreditCard className="h-4 w-4" />} color="text-info" />
        <StatCard title="Avg Order Value" value={summaryLoading ? '...' : `AED ${Number(summary.aov ?? 0).toFixed(0)}`} icon={<TrendingUp className="h-4 w-4" />} color="text-accent" />
      </div>

      <div>
        <h2 className="font-heading text-lg font-bold mb-3">Payments</h2>
        <DataTable
          data={payments}
          isLoading={isLoading || paymentsLoading}
          searchable
          columns={[
            { key: 'orderNumber', label: 'Order', render: (v) => <span className="font-medium">{String(v ?? '—')}</span> },
            { key: 'method', label: 'Method', render: (v) => String(v ?? '—') },
            { key: 'amount', label: 'Amount', align: 'right', render: (v) => <span className="font-bold text-accent">AED {Number(v).toFixed(2)}</span> },
            { key: 'status', label: 'Status', render: (v) => <Badge variant={statusVariant(String(v))} size="xs">{String(v)}</Badge> },
            { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(String(v)).toLocaleDateString() : '—' },
          ]}
          actions={(row) => (
            ['completed', 'paid', 'partially_refunded'].includes(row.status.toLowerCase()) ? (
              <button onClick={() => openRefund(row)} className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors" title="Refund">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            ) : null
          )}
          emptyMessage="No payments found."
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      <AdminModal open={refundOpen} title="Process Refund" onClose={() => setRefundOpen(false)} onSubmit={handleRefund} isSubmitting={submitting} submitLabel="Refund">
        <div className="space-y-4">
          <FormField label="Payment ID"><FormInput value={refundForm.paymentId} disabled /></FormField>
          <FormField label="Amount"><FormInput type="number" min="0" step="0.01" value={refundForm.amount} onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })} /></FormField>
          <FormField label="Reason"><FormTextarea value={refundForm.reason} onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })} rows={3} /></FormField>
        </div>
      </AdminModal>
    </div>
  );
}
