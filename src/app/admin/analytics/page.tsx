'use client';

import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { FormField, FormInput } from '@/components/admin/FormField';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { adminAnalyticsApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface EventRow {
  id: string;
  eventType?: string;
  event?: string;
  page?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface PageViewRow {
  page?: string;
  path?: string;
  views?: number;
  count?: number;
}

export default function AdminAnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pageViews, setPageViews] = useState<PageViewRow[]>([]);
  const [viewsLoading, setViewsLoading] = useState(true);

  const dateParams = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminAnalyticsApi.events({ ...params, ...dateParams }) as unknown as Promise<{ data: { data: PaginatedResponse<EventRow> | EventRow[] } }>,
    [startDate, endDate],
  );
  const { items, page, setPage, total, totalPages, isLoading } = usePaginatedList<EventRow>({ fetcher, limit: 20 });

  useEffect(() => {
    setViewsLoading(true);
    adminAnalyticsApi.pageViews({ ...dateParams, limit: 10 })
      .then((res) => setPageViews(res.data.data ?? []))
      .catch(() => setPageViews([]))
      .finally(() => setViewsLoading(false));
  }, [startDate, endDate]);

  const maxViews = Math.max(...pageViews.map((p) => Number(p.views ?? p.count ?? 0)), 1);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <div className="flex items-end gap-3">
          <FormField label="Start Date"><FormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></FormField>
          <FormField label="End Date"><FormInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></FormField>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-5">
        <h3 className="font-heading font-bold mb-4">Page Views</h3>
        {viewsLoading ? (
          <div className="h-32 flex items-center justify-center"><div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : pageViews.length === 0 ? (
          <p className="text-sm text-foreground-muted">No page view data.</p>
        ) : (
          <div className="space-y-3">
            {pageViews.map((p, i) => {
              const views = Number(p.views ?? p.count ?? 0);
              const pct = Math.round((views / maxViews) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{String(p.page ?? p.path ?? 'Unknown')}</span>
                    <span className="font-bold ml-2">{views}</span>
                  </div>
                  <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-accent/80 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-heading font-bold mb-3">Events</h3>
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          columns={[
            { key: 'eventType', label: 'Event', sortable: true, render: (v, row) => String(v ?? row.event ?? '—') },
            { key: 'page', label: 'Page', render: (v) => String(v ?? '—') },
            { key: 'createdAt', label: 'Time', render: (v) => new Date(String(v)).toLocaleString() },
          ]}
          emptyMessage="No analytics events recorded yet."
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>
    </div>
  );
}
