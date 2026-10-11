'use client';

import { useCallback, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { CrudActions } from '@/components/admin/CrudActions';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminCustomersApi } from '@/lib/api/adminApi';
import { usePaginatedList } from '@/hooks';
import { downloadCsv, datedCsvFilename } from '@/lib/utils/csv';
import type { PaginatedResponse } from '@/types';

interface CustomerRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  loyaltyPoints?: number;
  storeCredit?: number;
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminCustomersApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<CustomerRow> } }>,
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
  const { items, page, setPage, limit, setLimit, total, totalPages, isLoading } = usePaginatedList<CustomerRow>({ fetcher, extraParams });

  const handleExport = () => {
    const rows = items.map((c) => [
      c.firstName,
      c.lastName,
      c.email,
      c.phone ?? '',
      String(c.loyaltyPoints ?? 0),
      Number(c.storeCredit ?? 0).toFixed(2),
      c.isActive ? 'active' : 'banned',
    ]);
    downloadCsv(datedCsvFilename('customers'), ['First Name', 'Last Name', 'Email', 'Phone', 'Loyalty Points', 'Store Credit', 'Status'], rows);
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Customers</h1>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>
      <div className="space-y-0">
        <DataTable
          data={items}
          total={total}
          hideFooter
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search customers..."
          onSearch={setSearch}
          filters={<DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />}
          columns={[
            {
              key: 'firstName',
              label: 'Name',
              sortable: true,
              render: (v, row) => (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
                    {String(v)[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{row.firstName} {row.lastName}</p>
                    <p className="text-xs text-foreground-muted">{row.email}</p>
                  </div>
                </div>
              ),
            },
            { key: 'phone', label: 'Phone', render: (v) => (v ? String(v) : '—') },
            { key: 'loyaltyPoints', label: 'Points', align: 'right', render: (v) => String(v ?? 0) },
            { key: 'storeCredit', label: 'Wallet', align: 'right', render: (v) => `AED ${Number(v ?? 0).toFixed(2)}` },
            {
              key: 'createdAt',
              label: 'Joined',
              render: (v) => (
                <span className="text-xs text-foreground-muted">{new Date(String(v)).toLocaleDateString()}</span>
              ),
            },
            {
              key: 'isActive',
              label: 'Status',
              render: (v) => (
                <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Active' : 'Banned'}</Badge>
              ),
            },
          ]}
          actions={(row) => <CrudActions viewHref={`/admin/customers/${row.id}`} />}
          emptyMessage="No customers found."
        />
        <div className="-mt-px rounded-b-xl bg-card border border-t-0 border-border">
          <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} pageSize={limit} onPageSizeChange={setLimit} />
        </div>
      </div>
    </div>
  );
}
