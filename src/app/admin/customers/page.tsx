'use client';

import { Eye, Mail } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';

interface CustomerRow { id: string; firstName: string; lastName: string; email: string; country: string; ordersCount: number; totalSpent: number; isActive: boolean; createdAt: string; }

const MOCK_CUSTOMERS: CustomerRow[] = [
  { id: '1', firstName: 'Ahmed', lastName: 'Al Mansouri', email: 'ahmed@example.com', country: 'UAE', ordersCount: 14, totalSpent: 8420, isActive: true, createdAt: '2024-06-01' },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com', country: 'UAE', ordersCount: 7, totalSpent: 3210, isActive: true, createdAt: '2024-08-15' },
  { id: '3', firstName: 'Omar', lastName: 'Khalid', email: 'omar@example.com', country: 'KSA', ordersCount: 22, totalSpent: 14800, isActive: true, createdAt: '2024-03-22' },
  { id: '4', firstName: 'Fatima', lastName: 'Al Zaabi', email: 'fatima@example.com', country: 'UAE', ordersCount: 5, totalSpent: 2100, isActive: true, createdAt: '2024-11-10' },
];

export default function AdminCustomersPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="font-heading text-2xl font-bold">Customers</h1>
      <DataTable
        data={MOCK_CUSTOMERS}
        searchable
        searchPlaceholder="Search customers..."
        columns={[
          { key: 'firstName', label: 'Name', sortable: true, render: (v, row) => (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">{String(v)[0]}</div>
              <div><p className="font-medium text-sm">{row.firstName} {row.lastName}</p><p className="text-xs text-foreground-muted">{row.email}</p></div>
            </div>
          )},
          { key: 'country', label: 'Country' },
          { key: 'ordersCount', label: 'Orders', sortable: true },
          { key: 'totalSpent', label: 'Total Spent', sortable: true, render: (v) => <span className="font-bold text-accent">AED {Number(v).toFixed(2)}</span> },
          { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Active' : 'Banned'}</Badge> },
        ]}
        actions={() => (
          <>
            <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Eye className="h-3.5 w-3.5" /></button>
            <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Mail className="h-3.5 w-3.5" /></button>
          </>
        )}
      />
    </div>
  );
}