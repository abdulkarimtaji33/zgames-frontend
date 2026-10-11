'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, XCircle } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { CrudActions } from '@/components/admin/CrudActions';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminSupportApi } from '@/lib/api/adminApi';
import { usePaginatedList, useAdminToast } from '@/hooks';
import { downloadCsv, datedCsvFilename } from '@/lib/utils/csv';
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
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminSupportApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<TicketRow> } }>,
    [],
  );
  const extraParams = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }),
    [search, dateFrom, dateTo],
  );
  const { items, page, setPage, limit, setLimit, total, totalPages, isLoading, reload } = usePaginatedList<TicketRow>({ fetcher, extraParams });
  const toast = useAdminToast((s) => s.show);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  const handleExport = () => {
    const rows = items.map((t) => [
      t.ticketNumber ?? t.id.slice(0, 8).toUpperCase(),
      t.subject,
      t.customer ? `${t.customer.firstName} ${t.customer.lastName}` : '',
      t.priority,
      t.status,
      new Date(t.createdAt).toLocaleDateString(),
    ]);
    downloadCsv(datedCsvFilename('support-tickets'), ['Ticket ID', 'Subject', 'Customer', 'Priority', 'Status', 'Date'], rows);
    toast(`Exported ${items.length} tickets`, 'success');
  };

  const handleBulkResolve = async () => {
    setBulkBusy(true);
    try {
      await Promise.all([...selectedIds].map((id) => adminSupportApi.update(id, { status: 'resolved' })));
      toast(`Resolved ${selectedIds.size} tickets`, 'success');
      setSelectedIds(new Set());
      reload();
    } catch {
      toast('Some tickets could not be resolved', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkClose = async () => {
    setBulkBusy(true);
    try {
      await Promise.all([...selectedIds].map((id) => adminSupportApi.close(id)));
      toast(`Closed ${selectedIds.size} tickets`, 'success');
      setSelectedIds(new Set());
      reload();
    } catch {
      toast('Some tickets could not be closed', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Support Tickets</h1>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>
      <div className="space-y-0">
        <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())} isBusy={bulkBusy}>
          <Button variant="secondary" size="xs" onClick={handleBulkResolve} disabled={bulkBusy}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
          </Button>
          <Button variant="secondary" size="xs" onClick={handleBulkClose} disabled={bulkBusy}>
            <XCircle className="h-3.5 w-3.5" /> Mark Closed
          </Button>
        </BulkActionBar>
        <DataTable
          data={items}
          total={total}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchable
          searchPlaceholder="Search tickets..."
          filters={<DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />}
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
          <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} pageSize={limit} onPageSizeChange={setLimit} />
        </div>
      </div>
    </div>
  );
}
