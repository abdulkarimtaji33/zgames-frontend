'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Users, Star, Pencil, Download } from 'lucide-react';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { EntityPicker } from '@/components/admin/EntityPicker';
import { FormField, FormInput, FormTextarea } from '@/components/admin/FormField';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminCustomersApi, adminLoyaltyApi } from '@/lib/api/adminApi';
import { downloadCsv, datedCsvFilename } from '@/lib/utils/csv';
import type { PaginatedResponse } from '@/types';

interface CustomerRow {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  pointsBalance?: number;
}

export default function AdminLoyaltyPage() {
  const toast = useAdminToast((s) => s.show);
  const [totalPoints, setTotalPoints] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [form, setForm] = useState({ customerId: '', points: '', reason: '' });
  const [customerOption, setCustomerOption] = useState<{ id: string; label: string; sublabel?: string } | null>(null);
  const [search, setSearch] = useState('');

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminCustomersApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<CustomerRow> } }>,
    [],
  );
  const extraParams = useMemo(() => ({ search: search || undefined }), [search]);
  const { items, page, setPage, limit, setLimit, total, totalPages, isLoading, reload } =
    usePaginatedList<CustomerRow>({ fetcher, limit: 20, extraParams });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    adminCustomersApi.findAll({ limit: 100 })
      .then((res) => {
        const data = res.data.data.items ?? [];
        setTotalPoints(data.reduce((s: number, c: Record<string, unknown>) => s + Number(c.pointsBalance ?? 0), 0));
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const openAdjust = (customer?: CustomerRow) => {
    setBulkMode(false);
    if (customer) {
      setCustomerOption({
        id: customer.id,
        label: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email,
        sublabel: customer.email,
      });
      setForm({ customerId: customer.id, points: '', reason: '' });
    } else {
      setCustomerOption(null);
      setForm({ customerId: '', points: '', reason: '' });
    }
    setModalOpen(true);
  };

  const openBulkAdjust = () => {
    setBulkMode(true);
    setCustomerOption(null);
    setForm({ customerId: '', points: '', reason: '' });
    setModalOpen(true);
  };

  const handleAdjust = async () => {
    if (bulkMode) {
      if (selectedIds.size === 0) return;
      setSubmitting(true);
      setBulkBusy(true);
      try {
        await Promise.all([...selectedIds].map((customerId) => adminLoyaltyApi.adjust({
          customerId,
          points: Number(form.points),
          type: 'adjusted',
          notes: form.reason || undefined,
        })));
        toast(`Points adjusted for ${selectedIds.size} customers`, 'success');
        setModalOpen(false);
        setForm({ customerId: '', points: '', reason: '' });
        setSelectedIds(new Set());
        reload();
        loadStats();
      } catch {
        toast('Failed to adjust points for some customers', 'error');
      } finally {
        setSubmitting(false);
        setBulkBusy(false);
      }
      return;
    }

    if (!form.customerId) {
      toast('Select a customer first', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await adminLoyaltyApi.adjust({
        customerId: form.customerId,
        points: Number(form.points),
        type: 'adjusted',
        notes: form.reason || undefined,
      });
      toast('Points adjusted successfully', 'success');
      setModalOpen(false);
      setForm({ customerId: '', points: '', reason: '' });
      setCustomerOption(null);
      reload();
      loadStats();
    } catch {
      toast('Failed to adjust points', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    const rows = items.map((c) => [
      [c.firstName, c.lastName].filter(Boolean).join(' '),
      c.email,
      String(c.pointsBalance ?? 0),
    ]);
    downloadCsv(datedCsvFilename('loyalty-customers'), ['Name', 'Email', 'Points Balance'], rows);
    toast(`Exported ${items.length} customers`, 'success');
  };

  const columns: Column<CustomerRow>[] = [
    {
      key: 'firstName',
      label: 'Customer',
      render: (_v, row) => (
        <div>
          <p className="font-medium text-sm">{[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}</p>
          <p className="text-xs text-foreground-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'pointsBalance',
      label: 'Points Balance',
      sortable: true,
      align: 'right',
      render: (v) => <span className="font-bold text-accent">{Number(v ?? 0).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Loyalty Program</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="primary" size="sm" onClick={() => openAdjust()}><Plus className="h-4 w-4" /> Adjust Points</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Enrolled Customers" value={isLoading ? '...' : String(total)} icon={<Users className="h-4 w-4" />} color="text-viz-4" />
        <StatCard title="Total Points Issued" value={statsLoading ? '...' : totalPoints.toLocaleString()} icon={<Star className="h-4 w-4" />} color="text-accent" />
        <StatCard title="Avg Points / Customer" value={statsLoading ? '...' : total ? Math.round(totalPoints / total).toLocaleString() : '0'} icon={<Star className="h-4 w-4" />} color="text-info" />
        <StatCard title="Program Status" value="Active" icon={<Star className="h-4 w-4" />} color="text-success" />
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())} isBusy={bulkBusy}>
          <Button variant="secondary" size="xs" onClick={openBulkAdjust} disabled={bulkBusy}>
            <Pencil className="h-3.5 w-3.5" /> Adjust Points
          </Button>
        </BulkActionBar>
        <DataTable
          data={items}
          columns={columns}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchable
          searchPlaceholder="Search customers by name or email..."
          onSearch={setSearch}
          total={total}
          hideFooter
          emptyMessage="No customers found."
          actions={(row) => (
            <button
              onClick={() => openAdjust(row)}
              className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-accent transition-colors"
              title="Adjust Points"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
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

      <AdminModal
        open={modalOpen}
        title={bulkMode ? `Adjust Points for ${selectedIds.size} Customers` : 'Adjust Loyalty Points'}
        onClose={() => { setModalOpen(false); setCustomerOption(null); }}
        onSubmit={handleAdjust}
        isSubmitting={submitting}
        submitLabel="Adjust"
      >
        <div className="space-y-4">
          {bulkMode ? (
            <p className="text-sm text-foreground-muted">
              This adjustment will be applied to all {selectedIds.size} selected customers.
            </p>
          ) : (
            <EntityPicker
              type="customer"
              label="Customer"
              value={customerOption}
              onChange={(opt) => { setCustomerOption(opt); setForm({ ...form, customerId: opt?.id ?? '' }); }}
            />
          )}
          <FormField label="Points" hint="Use negative values to deduct">
            <FormInput type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
          </FormField>
          <FormField label="Reason">
            <FormTextarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason for adjustment..." />
          </FormField>
        </div>
      </AdminModal>
    </div>
  );
}
