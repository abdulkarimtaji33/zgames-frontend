'use client';

import { useCallback } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { CrudActions } from '@/components/admin/CrudActions';
import { Badge } from '@/components/ui/Badge';
import { adminReturnsApi } from '@/lib/api/adminApi';
import { usePaginatedList } from '@/hooks';
import type { PaginatedResponse } from '@/types';

interface ReturnRow {
  id: string;
  returnNumber?: string;
  status: string;
  reason?: string;
  createdAt: string;
  orderId?: string;
  order?: { orderNumber: string };
}

const STATUS_VARIANT: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  approved: 'success', rejected: 'error', requested: 'warning', received: 'info', refunded: 'success',
};

export default function AdminReturnsPage() {
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminReturnsApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<ReturnRow> } }>,
    [],
  );
  const { items, page, setPage, total, totalPages, isLoading } = usePaginatedList<ReturnRow>({ fetcher });

  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="font-heading text-2xl font-bold">Returns</h1>
      <div className="space-y-0">
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search returns..."
          columns={[
            { key: 'id', label: 'Return #', render: (v, row) => String(row.returnNumber ?? v).slice(0, 8).toUpperCase() },
            {
              key: 'orderId',
              label: 'Order',
              render: (v, row) => row.order?.orderNumber ?? (v ? String(v).slice(0, 8) + '…' : '—'),
            },
            { key: 'reason', label: 'Reason', render: (v) => <span className="text-sm line-clamp-1">{String(v ?? '—')}</span> },
            {
              key: 'status',
              label: 'Status',
              render: (v) => <Badge variant={STATUS_VARIANT[String(v).toLowerCase()] ?? 'default'} size="xs">{String(v)}</Badge>,
            },
            {
              key: 'createdAt',
              label: 'Date',
              render: (v) => <span className="text-xs text-foreground-muted">{new Date(String(v)).toLocaleDateString()}</span>,
            },
          ]}
          actions={(row) => <CrudActions viewHref={`/admin/returns/${row.id}`} />}
          emptyMessage="No returns found."
        />
        <div className="-mt-px rounded-b-xl bg-card border border-t-0 border-border">
          <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
