'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, Package, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
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
// Every value the order_status enum accepts — kept in sync with
// OrderStatus in the backend (src/modules/orders/entities/order.enums.ts).
const ALL_STATUSES = [
  'pending', 'confirmed', 'paid', 'processing', 'packed', 'shipped',
  'delivered', 'cancelled', 'refunded', 'returned', 'exchange_requested', 'exchange_approved',
];
const STATUS_SELECT_CLASS: Record<string, string> = {
  pending: 'bg-warning/10 border-warning/30 text-warning',
  confirmed: 'bg-info/10 border-info/30 text-info',
  paid: 'bg-info/10 border-info/30 text-info',
  processing: 'bg-info/10 border-info/30 text-info',
  packed: 'bg-info/10 border-info/30 text-info',
  shipped: 'bg-info/10 border-info/30 text-info',
  delivered: 'bg-success/10 border-success/30 text-success',
  cancelled: 'bg-error/10 border-error/30 text-error',
  refunded: 'bg-error/10 border-error/30 text-error',
  returned: 'bg-error/10 border-error/30 text-error',
  exchange_requested: 'bg-warning/10 border-warning/30 text-warning',
  exchange_approved: 'bg-info/10 border-info/30 text-info',
  default: 'bg-background-tertiary border-border text-foreground-muted',
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
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const extraParams = useMemo(
    () => ({
      ...(activeTab !== 'ALL' ? { status: activeTab.toLowerCase() } : {}),
      ...(search ? { search } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }),
    [activeTab, search, dateFrom, dateTo],
  );

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminOrdersApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<OrderRow> } }>,
    [],
  );

  const { items, page, setPage, limit, setLimit, total, totalPages, isLoading, reload } = usePaginatedList<OrderRow>({
    fetcher,
    extraParams,
  });

  useEffect(() => {
    setPage(1);
  }, [activeTab, setPage]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false);
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  const handleExport = () => {
    if (items.length === 0) {
      toast('No orders to export', 'info');
      return;
    }
    exportOrdersCsv(items);
    toast(`Exported ${items.length} orders`, 'success');
  };

  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);

  const handleRowStatusChange = async (orderId: string, status: string) => {
    setStatusBusyId(orderId);
    try {
      await adminOrdersApi.updateStatus(orderId, { status });
      toast('Order status updated', 'success');
      reload();
    } catch {
      toast('Could not change status — that transition may not be allowed', 'error');
    } finally {
      setStatusBusyId(null);
    }
  };

  const handleBulkSetStatus = async (status: string) => {
    setBulkBusy(true);
    try {
      await Promise.all([...selectedIds].map((id) => adminOrdersApi.updateStatus(id, { status })));
      toast(`Updated ${selectedIds.size} orders`, 'success');
      setSelectedIds(new Set());
      reload();
    } catch {
      toast('Some orders could not be updated', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkCancel = async () => {
    setBulkBusy(true);
    try {
      await Promise.all([...selectedIds].map((id) => adminOrdersApi.cancel(id)));
      toast(`Cancelled ${selectedIds.size} orders`, 'success');
      setSelectedIds(new Set());
      setBulkCancelOpen(false);
      reload();
    } catch {
      toast('Some orders could not be cancelled', 'error');
    } finally {
      setBulkBusy(false);
    }
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
        <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())} isBusy={bulkBusy}>
          <Button variant="secondary" size="xs" onClick={() => handleBulkSetStatus('shipped')} disabled={bulkBusy}>
            <Package className="h-3.5 w-3.5" /> Mark Shipped
          </Button>
          <Button variant="secondary" size="xs" onClick={() => handleBulkSetStatus('delivered')} disabled={bulkBusy}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Delivered
          </Button>
          <Button variant="danger" size="xs" onClick={() => setBulkCancelOpen(true)} disabled={bulkBusy}>
            <XCircle className="h-3.5 w-3.5" /> Cancel
          </Button>
        </BulkActionBar>
        <DataTable
          data={items}
          total={total}
          hideFooter
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchable
          searchPlaceholder="Search by order # or customer email..."
          onSearch={setSearch}
          filters={<DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />}
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
              render: (v, row) => {
                const current = String(v).toLowerCase();
                return (
                  <div className="relative inline-flex">
                    <select
                      value={current}
                      disabled={statusBusyId === row.id}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleRowStatusChange(row.id, e.target.value)}
                      className={cn(
                        'appearance-none rounded-full pl-2.5 pr-6 py-1 text-[11px] font-bold uppercase tracking-wide border cursor-pointer disabled:opacity-50 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        STATUS_SELECT_CLASS[current] ?? STATUS_SELECT_CLASS.default,
                      )}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 opacity-60" />
                  </div>
                );
              },
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
            search || dateFrom || dateTo
              ? 'No orders match your search or date range.'
              : activeTab === 'ALL'
                ? 'No orders yet. Orders will appear here as customers check out.'
                : `No ${activeTab.toLowerCase()} orders found. Try a different status filter.`
          }
        />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          pageSize={limit}
          onPageSizeChange={setLimit}
        />
      </div>

      <ConfirmDialog
        open={bulkCancelOpen}
        title="Cancel Orders"
        message={`Are you sure you want to cancel ${selectedIds.size} selected order(s)? This action cannot be undone.`}
        onConfirm={handleBulkCancel}
        onCancel={() => setBulkCancelOpen(false)}
        isLoading={bulkBusy}
        destructive
      />
    </div>
  );
}
