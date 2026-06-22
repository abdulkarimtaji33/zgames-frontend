'use client';

import { MessageSquare } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';

const TICKETS = [
  { id: 'TKT-001', subject: 'Order not delivered after 7 days', customer: 'Ahmed Al Mansouri', priority: 'HIGH', status: 'OPEN', date: '2025-01-15' },
  { id: 'TKT-002', subject: 'Received wrong item - PS5 instead of Xbox', customer: 'Sarah Johnson', priority: 'HIGH', status: 'IN_PROGRESS', date: '2025-01-14' },
  { id: 'TKT-003', subject: 'Request for refund - duplicate order', customer: 'Omar Khalid', priority: 'MEDIUM', status: 'RESOLVED', date: '2025-01-13' },
  { id: 'TKT-004', subject: 'Tracking link not working', customer: 'Fatima Al Zaabi', priority: 'LOW', status: 'OPEN', date: '2025-01-12' },
];
const PRIO_VARIANT: Record<string, 'error' | 'warning' | 'info'> = { HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };
const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success'> = { OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success' };

export default function AdminSupportPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="font-heading text-2xl font-bold">Support Tickets</h1>
      <DataTable
        data={TICKETS}
        searchable
        columns={[
          { key: 'id', label: 'Ticket ID', sortable: true },
          { key: 'subject', label: 'Subject', render: (v) => <span className="font-medium text-sm line-clamp-1 max-w-xs">{String(v)}</span> },
          { key: 'customer', label: 'Customer', render: (v) => <span className="text-sm text-foreground-muted">{String(v)}</span> },
          { key: 'priority', label: 'Priority', render: (v) => <Badge variant={PRIO_VARIANT[String(v)] ?? 'default'} size="xs">{String(v)}</Badge> },
          { key: 'status', label: 'Status', render: (v) => <Badge variant={STATUS_VARIANT[String(v)] ?? 'default'} size="xs">{String(v).replace('_', ' ')}</Badge> },
          { key: 'date', label: 'Date', render: (v) => <span className="text-xs text-foreground-muted">{String(v)}</span> },
        ]}
        actions={() => (
          <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
        )}
      />
    </div>
  );
}