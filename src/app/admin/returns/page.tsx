'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, CheckCircle2, XCircle } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { CrudActions } from '@/components/admin/CrudActions';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminReturnsApi } from '@/lib/api/adminApi';
import { usePaginatedList } from '@/hooks';
import { useAdminToast } from '@/hooks/useAdminToast';
import { downloadCsv, datedCsvFilename } from '@/lib/utils/csv';
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
  const { show } = useAdminToast();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminReturnsApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<ReturnRow> } }>,
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
  const { items, page, setPage, limit, setLimit, total, totalPages, isLoading, reload } = usePaginatedList<ReturnRow>({ fetcher, extraParams });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  const handleExport = () => {
    const rows = items.map((r) => [
      r.returnNumber ?? r.id,
      r.order?.orderNumber ?? r.orderId ?? '',
      r.reason ?? '',
      r.status,
      new Date(r.createdAt).toISOString(),
    ]);
    downloadCsv(datedCsvFilename('returns'), ['Return #', 'Order', 'Reason', 'Status', 'Date'], rows);
    show(`Exported ${items.length} returns`, 'success');
  };

  const handleBulkSetStatus = async (status: string) => {
    setBulkBusy(true);
    try {
      await Promise.all([...selectedIds].map((id) => adminReturnsApi.update(id, { status })));
      show(`Updated ${selectedIds.size} returns`, 'success');
      setSelectedIds(new Set());
      reload();
    } catch {
      show('Some returns could not be updated', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Returns</h1>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>
      <div className="space-y-0">
        <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())} isBusy={bulkBusy}>
          <Button variant="secondary" size="xs" onClick={() => handleBulkSetStatus('approved')} disabled={bulkBusy}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button variant="secondary" size="xs" onClick={() => handleBulkSetStatus('rejected')} disabled={bulkBusy}>
            <XCircle className="h-3.5 w-3.5" /> Reject
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
          searchPlaceholder="Search by reason or order #..."
          onSearch={setSearch}
          filters={<DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />}
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
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            pageSize={limit}
            onPageSizeChange={setLimit}
          />
        </div>
      </div>
    </div>
  );
}
