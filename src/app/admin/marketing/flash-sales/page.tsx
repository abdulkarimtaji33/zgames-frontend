'use client';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
const SALES = [
  { id: '1', name: 'Weekend Flash Sale', discount: '25%', products: 48, startDate: '2025-01-18 00:00', endDate: '2025-01-19 23:59', status: 'SCHEDULED' },
  { id: '2', name: 'PS5 Launch Deal', discount: '15%', products: 12, startDate: '2025-01-10 12:00', endDate: '2025-01-12 12:00', status: 'ENDED' },
  { id: '3', name: 'Pokémon TCG Sale', discount: '20%', products: 32, startDate: '2025-01-15 09:00', endDate: '2025-01-17 09:00', status: 'ACTIVE' },
];
export default function AdminFlashSalesPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Flash Sales</h1>
        <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> New Flash Sale</Button>
      </div>
      <DataTable data={SALES} searchable columns={[
        { key: 'name', label: 'Name', sortable: true, render: (v) => <span className="font-medium">{String(v)}</span> },
        { key: 'discount', label: 'Discount' },
        { key: 'products', label: 'Products' },
        { key: 'startDate', label: 'Start', render: (v) => <span className="text-xs text-foreground-muted">{String(v)}</span> },
        { key: 'endDate', label: 'End', render: (v) => <span className="text-xs text-foreground-muted">{String(v)}</span> },
        { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'ACTIVE' ? 'success' : v === 'SCHEDULED' ? 'info' : 'default'} size="xs">{String(v)}</Badge> },
      ]} />
    </div>
  );
}