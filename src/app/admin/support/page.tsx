'use client';

import { useCallback } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { CrudActions } from '@/components/admin/CrudActions';
import { Badge } from '@/components/ui/Badge';
import { adminSupportApi } from '@/lib/api/adminApi';
import { usePaginatedList } from '@/hooks';
import type { PaginatedResponse } from '@/types';

interface TicketRow {
  id: string;
  ticketNumber?: string;
  subject: string;
  priority: string;
  status: string;
  createdAt: string;
  customer?: { firstName: string; lastName: string };
}

const PRIO_VARIANT: Record<string, 'error' | 'warning' | 'info'> = {
  high: 'error', urgent: 'error', medium: 'warning', low: 'info',
};
const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  open: 'warning', in_progress: 'info', resolved: 'success', closed: 'success',
};

export default function AdminSupportPage() {
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminSupportApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<TicketRow> } }>,
    [],
  );
  const { items, page, setPage, total, totalPages, isLoading } = usePaginatedList<TicketRow>({ fetcher });

  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="font-heading text-2xl font-bold">Support Tickets</h1>
      <div className="space-y-0">
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search tickets..."
          columns={[
            { key: 'id', label: 'Ticket ID', sortable: true, render: (v) => String(v).slice(0, 8).toUpperCase() },
            { key: 'subject', label: 'Subject', render: (v) => <span className="font-medium text-sm line-clamp-1 max-w-xs">{String(v)}</span> },
            {
              key: 'customer',
              label: 'Customer',
              render: (v) => {
                const c = v as TicketRow['customer'];
                return <span className="text-sm text-foreground-muted">{c ? `${c.firstName} ${c.lastName}` : '—'}</span>;
              },
            },
            {
              key: 'priority',
              label: 'Priority',
              render: (v) => <Badge variant={PRIO_VARIANT[String(v).toLowerCase()] ?? 'default'} size="xs">{String(v).toUpperCase()}</Badge>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (v) => <Badge variant={STATUS_VARIANT[String(v).toLowerCase()] ?? 'default'} size="xs">{String(v).replace(/_/g, ' ').toUpperCase()}</Badge>,
            },
            {
              key: 'createdAt',
              label: 'Date',
              render: (v) => <span className="text-xs text-foreground-muted">{new Date(String(v)).toLocaleDateString()}</span>,
            },
          ]}
          actions={(row) => <CrudActions viewHref={`/admin/support/${row.id}`} />}
          emptyMessage="No support tickets found."
        />
        <div className="-mt-px rounded-b-xl bg-card border border-t-0 border-border">
          <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
