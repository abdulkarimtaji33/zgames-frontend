'use client';

import { Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/admin/StatCard';

const COUPONS = [
  { id: '1', code: 'WELCOME20', type: 'PERCENTAGE', value: 20, usageCount: 142, usageLimit: 500, isActive: true, expiresAt: '2025-03-31' },
  { id: '2', code: 'FLAT50', type: 'FIXED', value: 50, usageCount: 89, usageLimit: 200, isActive: true, expiresAt: '2025-02-28' },
  { id: '3', code: 'FREESHIP', type: 'FREE_SHIPPING', value: 0, usageCount: 334, usageLimit: 1000, isActive: true, expiresAt: '2025-12-31' },
  { id: '4', code: 'GAMING30', type: 'PERCENTAGE', value: 30, usageCount: 200, usageLimit: 200, isActive: false, expiresAt: '2025-01-01' },
];

export default function AdminCouponsPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Coupons</h1>
        <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Create Coupon</Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Coupons" value="3" icon={<span>🏷️</span>} color="text-green-400" />
        <StatCard title="Total Redemptions" value="765" icon={<span>✅</span>} color="text-blue-400" />
        <StatCard title="Discount Given" value="AED 23,450" icon={<span>💸</span>} color="text-accent" />
        <StatCard title="Expired" value="1" icon={<span>⏰</span>} color="text-error" />
      </div>
      <DataTable
        data={COUPONS}
        searchable
        columns={[
          { key: 'code', label: 'Code', render: (v) => <code className="bg-background-tertiary px-2 py-0.5 rounded text-accent font-mono text-sm">{String(v)}</code> },
          { key: 'type', label: 'Type', render: (v) => <Badge variant="default" size="xs">{String(v)}</Badge> },
          { key: 'value', label: 'Discount', render: (v, row) => row.type === 'PERCENTAGE' ? `${v}%` : row.type === 'FREE_SHIPPING' ? 'Free Ship' : `AED ${v}` },
          { key: 'usageCount', label: 'Used', sortable: true, render: (v, row) => `${v} / ${row.usageLimit}` },
          { key: 'expiresAt', label: 'Expires', render: (v) => <span className="text-xs text-foreground-muted">{String(v)}</span> },
          { key: 'isActive', label: 'Active', render: (v) => v ? <ToggleRight className="h-5 w-5 text-success" /> : <ToggleLeft className="h-5 w-5 text-foreground-subtle" /> },
        ]}
        actions={() => (
          <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        )}
      />
    </div>
  );
}