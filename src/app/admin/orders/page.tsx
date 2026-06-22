'use client';

import { useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning', CONFIRMED: 'info', PROCESSING: 'info',
  SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'error',
};

const MOCK_ORDERS = [
  { id: 'o1', orderNumber: 'ZG-00123', customerId: 'Ahmed Al Mansouri', total: 849, status: 'DELIVERED', currencyCode: 'AED', createdAt: '2025-01-15' },
  { id: 'o2', orderNumber: 'ZG-00124', customerId: 'Sarah Johnson', total: 1299, status: 'SHIPPED', currencyCode: 'AED', createdAt: '2025-01-15' },
  { id: 'o3', orderNumber: 'ZG-00125', customerId: 'Omar Khalid', total: 349, status: 'PROCESSING', currencyCode: 'AED', createdAt: '2025-01-15' },
  { id: 'o4', orderNumber: 'ZG-00126', customerId: 'Fatima Al Zaabi', total: 2100, status: 'PENDING', currencyCode: 'AED', createdAt: '2025-01-14' },
  { id: 'o5', orderNumber: 'ZG-00127', customerId: 'James Wilson', total: 599, status: 'CONFIRMED', currencyCode: 'AED', createdAt: '2025-01-14' },
  { id: 'o6', orderNumber: 'ZG-00128', customerId: 'Layla Hassan', total: 4200, status: 'DELIVERED', currencyCode: 'AED', createdAt: '2025-01-13' },
];

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const filtered = activeTab === 'ALL' ? MOCK_ORDERS : MOCK_ORDERS.filter((o) => o.status === activeTab);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Orders</h1>
        <Button variant="secondary" size="sm">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab ? 'bg-accent text-white' : 'bg-background-tertiary text-foreground-muted hover:text-foreground border border-border'}`}>
            {tab}
          </button>
        ))}
      </div>
      <DataTable
        data={filtered}
        searchable
        searchPlaceholder="Search orders..."
        columns={[
          { key: 'orderNumber', label: 'Order #', sortable: true },
          { key: 'customerId', label: 'Customer', render: (v) => <span className="text-sm">{String(v)}</span> },
          { key: 'total', label: 'Total', sortable: true, render: (v) => <span className="font-bold text-accent">AED {Number(v).toFixed(2)}</span> },
          { key: 'status', label: 'Status', render: (v) => <Badge variant={STATUS_VARIANT[String(v)] ?? 'default'} size="xs">{String(v)}</Badge> },
          { key: 'createdAt', label: 'Date', sortable: true, render: (v) => <span className="text-xs text-foreground-muted">{String(v)}</span> },
          { key: 'currencyCode', label: 'Currency' },
        ]}
        actions={() => (
          <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors">
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
        emptyMessage="No orders found."
      />
    </div>
  );
}