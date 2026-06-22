'use client';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Eye, Check, X } from 'lucide-react';
const RETURNS = [
  { id: 'RET-001', orderNumber: 'ZG-00089', customer: 'Ahmed M.', product: 'PS5 DualSense Controller', reason: 'Defective', status: 'PENDING', date: '2025-01-14' },
  { id: 'RET-002', orderNumber: 'ZG-00074', customer: 'Sarah J.', product: 'Pokémon Booster Box', reason: 'Wrong item', status: 'APPROVED', date: '2025-01-12' },
  { id: 'RET-003', orderNumber: 'ZG-00062', customer: 'Omar K.', product: 'Xbox Controller', reason: 'Change of mind', status: 'REJECTED', date: '2025-01-10' },
];
export default function AdminReturnsPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="font-heading text-2xl font-bold">Returns & Refunds</h1>
      <DataTable data={RETURNS} searchable columns={[
        { key: 'id', label: 'Return ID', sortable: true },
        { key: 'orderNumber', label: 'Order #' },
        { key: 'customer', label: 'Customer' },
        { key: 'product', label: 'Product', render: (v) => <span className="text-sm font-medium line-clamp-1 max-w-xs">{String(v)}</span> },
        { key: 'reason', label: 'Reason', render: (v) => <span className="text-sm text-foreground-muted">{String(v)}</span> },
        { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'APPROVED' ? 'success' : v === 'REJECTED' ? 'error' : 'warning'} size="xs">{String(v)}</Badge> },
        { key: 'date', label: 'Date', render: (v) => <span className="text-xs text-foreground-muted">{String(v)}</span> },
      ]}
      actions={() => (
        <>
          <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Eye className="h-3.5 w-3.5" /></button>
          <button className="p-1.5 rounded hover:bg-success/20 text-foreground-muted hover:text-success transition-colors"><Check className="h-3.5 w-3.5" /></button>
          <button className="p-1.5 rounded hover:bg-error/20 text-foreground-muted hover:text-error transition-colors"><X className="h-3.5 w-3.5" /></button>
        </>
      )} />
    </div>
  );
}