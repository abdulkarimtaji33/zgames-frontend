'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { CrudActions } from '@/components/admin/CrudActions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminOrdersApi } from '@/lib/api/adminApi';
import type { PaginatedResponse, Order } from '@/types';

type OrderRow = Order;

function customerName(customer: OrderRow['customer']): string | null {
  if (!customer) return null;
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  return fullName || customer.email || null;
}

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

function exportOrdersCsv(orders: OrderRow[]) {
  const headers = ['Order #', 'Customer', 'Total', 'Currency', 'Status', 'Payment', 'Date'];
  const rows = orders.map((o) => [
    o.orderNumber,
    customerName(o.customer) ?? 'Guest',
    String(o.total),
    o.currency,
    o.status,
    o.paymentStatus,
    new Date(o.createdAt).toISOString(),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const toast = useAdminToast((s) => s.show);
  const [activeTab, setActiveTab] = useState('ALL');

  const extraParams = useMemo(
    () => (activeTab !== 'ALL' ? { status: activeTab.toLowerCase() } : {}),
    [activeTab],
  );

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminOrdersApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<OrderRow> } }>,
    [],
  );

  const { items, page, setPage, total, totalPages, isLoading } = usePaginatedList<OrderRow>({
    fetcher,
    extraParams,
  });

  useEffect(() => {
    setPage(1);
  }, [activeTab, setPage]);

  const handleExport = () => {
    if (items.length === 0) {
      toast('No orders to export', 'info');
      return;
    }
    exportOrdersCsv(items);
    toast(`Exported ${items.length} orders`, 'success');
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Orders</h1>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-accent text-white'
                : 'bg-background-tertiary text-foreground-muted hover:text-foreground border border-border'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search orders..."
          columns={[
            { key: 'orderNumber', label: 'Order #', sortable: true },
            {
              key: 'customer',
              label: 'Customer',
              render: (_v, row) => {
                const name = customerName(row.customer);
                if (!name) return <span className="text-sm text-foreground-muted">Guest</span>;
                const customerId = row.customer?.id;
                if (!customerId) return <span className="text-sm">{name}</span>;
                return (
                  <Link
                    href={`/admin/customers/${customerId}`}
                    className="text-sm text-accent hover:underline underline-offset-2"
                  >
                    {name}
                  </Link>
                );
              },
            },
            {
              key: 'total',
              label: 'Total',
              sortable: true,
              align: 'right',
              render: (v, row) => (
                <span className="font-bold text-accent">
                  {row.currency ?? 'AED'} {Number(v).toFixed(2)}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (v) => (
                <Badge variant={STATUS_VARIANT[String(v).toLowerCase()] ?? 'default'} size="xs">
                  {String(v).toUpperCase()}
                </Badge>
              ),
            },
            {
              key: 'paymentStatus',
              label: 'Payment',
              render: (v) => (
                <Badge variant={String(v) === 'paid' ? 'success' : 'warning'} size="xs">
                  {String(v)}
                </Badge>
              ),
            },
            {
              key: 'createdAt',
              label: 'Date',
              sortable: true,
              render: (v) => (
                <span className="text-xs text-foreground-muted">
                  {new Date(String(v)).toLocaleDateString()}
                </span>
              ),
            },
          ]}
          actions={(row) => <CrudActions viewHref={`/admin/orders/${row.id}`} />}
          emptyMessage={
            activeTab === 'ALL'
              ? 'No orders yet. Orders will appear here as customers check out.'
              : `No ${activeTab.toLowerCase()} orders found. Try a different status filter.`
          }
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>
    </div>
  );
}
