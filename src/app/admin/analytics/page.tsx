'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  const viewsData = pageViews.map((p) => ({
    label: String(p.page ?? p.path ?? 'Unknown'),
    views: Number(p.views ?? p.count ?? 0),
  }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <div className="flex items-end gap-3">
          <FormField label="Start Date"><FormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></FormField>
          <FormField label="End Date"><FormInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></FormField>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
        <h3 className="font-heading font-bold mb-4">Page Views</h3>
        {viewsLoading ? (
          <div className="h-48 skeleton rounded-lg" />
        ) : viewsData.length === 0 ? (
          <p className="text-sm text-foreground-muted">No page view data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(viewsData.length * 32, 160)}>
            <BarChart data={viewsData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: 'var(--color-foreground)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-background-tertiary)' }}
                contentStyle={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="views" fill="var(--color-accent)" radius={[0, 4, 4, 0]} animationDuration={400} />
            </BarChart>
          </ResponsiveContainer>
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
