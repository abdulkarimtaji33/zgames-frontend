'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCheck, Bell, Download, CheckCircle2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { StatCard } from '@/components/admin/StatCard';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminNotificationsApi } from '@/lib/api/adminApi';
import { downloadCsv, datedCsvFilename } from '@/lib/utils/csv';
import type { PaginatedResponse } from '@/types';

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  channel?: string;
  createdAt: string;
}

interface PreferenceRow {
  id?: string;
  channel?: string;
  type?: string;
  isEnabled?: boolean;
}

export default function AdminNotificationsPage() {
  const toast = useAdminToast((s) => s.show);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<PreferenceRow[]>([]);

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminNotificationsApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<NotificationRow> | NotificationRow[] } }>,
    [],
  );
  const { items, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<NotificationRow>({ fetcher });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  const handleExport = () => {
    const rows = items.map((n) => [n.title, n.type, n.channel ?? 'in_app', n.isRead ? 'read' : 'unread', n.createdAt]);
    downloadCsv(datedCsvFilename('notifications'), ['Title', 'Type', 'Channel', 'Status', 'Date'], rows);
    toast(`Exported ${items.length} notifications`, 'success');
  };

  const handleBulkMarkRead = async () => {
    setBulkBusy(true);
    try {
      await Promise.all([...selectedIds].map((id) => adminNotificationsApi.markRead(id)));
      toast(`Marked ${selectedIds.size} notifications as read`, 'success');
      setSelectedIds(new Set());
      reload();
      loadMeta();
    } catch {
      toast('Some notifications could not be marked as read', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  const loadMeta = () => {
    adminNotificationsApi.getUnreadCount()
      .then((res) => setUnreadCount(Number(res.data.data?.count ?? res.data.count ?? 0)))
      .catch(() => {});
    adminNotificationsApi.getPreferences()
      .then((res) => setPreferences((res.data.data ?? res.data ?? []) as PreferenceRow[]))
      .catch(() => setPreferences([]));
  };

  useEffect(() => { loadMeta(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await adminNotificationsApi.markRead(id);
      toast('Marked as read', 'success');
      reload();
      loadMeta();
    } catch {
      toast('Failed to mark as read', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminNotificationsApi.markAllRead();
      toast('All notifications marked as read', 'success');
      reload();
      loadMeta();
    } catch {
      toast('Failed to mark all as read', 'error');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllRead}><CheckCheck className="h-4 w-4" /> Mark All Read</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Unread" value={String(unreadCount)} icon={<Bell className="h-4 w-4" />} color="text-accent" />
        <StatCard title="Total" value={String(total)} icon={<Bell className="h-4 w-4" />} color="text-info" />
      </div>

      <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())} isBusy={bulkBusy}>
        <Button variant="secondary" size="xs" onClick={handleBulkMarkRead} disabled={bulkBusy}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Read
        </Button>
      </BulkActionBar>
      <DataTable
        data={items}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchable
        columns={[
          { key: 'title', label: 'Title', sortable: true, render: (v, row) => (
            <div>
              <p className={`font-medium text-sm ${!row.isRead ? 'text-foreground' : 'text-foreground-muted'}`}>{String(v)}</p>
              <p className="text-xs text-foreground-muted line-clamp-1">{row.body}</p>
            </div>
          )},
          { key: 'type', label: 'Type', render: (v) => <Badge variant="default" size="xs">{String(v)}</Badge> },
          { key: 'channel', label: 'Channel', render: (v) => String(v ?? 'in_app') },
          { key: 'isRead', label: 'Status', render: (v) => <Badge variant={v ? 'default' : 'warning'} size="xs">{v ? 'Read' : 'Unread'}</Badge> },
          { key: 'createdAt', label: 'Date', render: (v) => new Date(String(v)).toLocaleString() },
        ]}
        actions={(row) => !row.isRead ? (
          <Button variant="secondary" size="sm" onClick={() => handleMarkRead(row.id)}>Mark Read</Button>
        ) : null}
        emptyMessage="No notifications found."
      />
      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <div className="rounded-xl bg-card border border-border p-5">
        <h3 className="font-heading font-bold mb-4">Notification Preferences</h3>
        {preferences.length === 0 ? (
          <p className="text-sm text-foreground-muted">No preferences configured.</p>
        ) : (
          <div className="space-y-2">
            {preferences.map((p, i) => (
              <div key={p.id ?? i} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                <div>
                  <span className="font-medium capitalize">{String(p.type ?? 'general')}</span>
                  <span className="text-foreground-muted ml-2">({String(p.channel ?? 'in_app')})</span>
                </div>
                <Badge variant={p.isEnabled !== false ? 'success' : 'error'} size="xs">{p.isEnabled !== false ? 'Enabled' : 'Disabled'}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
