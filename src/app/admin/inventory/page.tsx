'use client';

import { AlertTriangle, TrendingDown } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { StatCard } from '@/components/admin/StatCard';

const MOCK_INVENTORY = [
  { id: '1', sku: 'PS5-DISC-UAE', name: 'PS5 Console Disc Edition', warehouse: 'Dubai Main', stock: 45, reserved: 8, threshold: 10, cost: 1800 },
  { id: '2', sku: 'PS5-DS-MBK', name: 'PS5 DualSense - Midnight Black', warehouse: 'Dubai Main', stock: 2, reserved: 0, threshold: 15, cost: 249 },
  { id: '3', sku: 'PKM-SV-BB', name: 'Pokémon TCG Scarlet & Violet Booster Box', warehouse: 'Dubai Main', stock: 5, reserved: 2, threshold: 20, cost: 899 },
  { id: '4', sku: 'XBX-SX-UAE', name: 'Xbox Series X Console', warehouse: 'Dubai Main', stock: 28, reserved: 3, threshold: 10, cost: 2099 },
  { id: '5', sku: 'NSW-OLED-WHT', name: 'Nintendo Switch OLED White', warehouse: 'Abu Dhabi', stock: 14, reserved: 1, threshold: 10, cost: 1299 },
];

export default function AdminInventoryPage() {
  const lowStock = MOCK_INVENTORY.filter((i) => i.stock <= i.threshold);
  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="font-heading text-2xl font-bold">Inventory</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total SKUs" value="3,847" icon={<span className="text-xs font-bold">SKU</span>} color="text-blue-400" />
        <StatCard title="Total Stock Value" value="AED 4.2M" icon={<span className="text-xs">💰</span>} color="text-green-400" />
        <StatCard title="Low Stock Items" value={lowStock.length} change="needs reorder" icon={<AlertTriangle className="h-4 w-4" />} color="text-warning" />
        <StatCard title="Out of Stock" value="12" change="urgent" icon={<TrendingDown className="h-4 w-4" />} color="text-error" />
      </div>
      {lowStock.length > 0 && (
        <div className="rounded-xl bg-warning/5 border border-warning/20 p-4">
          <p className="text-sm font-medium text-warning flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" /> {lowStock.length} items below reorder threshold
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i) => <span key={i.sku} className="text-xs bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded">{i.name} ({i.stock} left)</span>)}
          </div>
        </div>
      )}
      <DataTable
        data={MOCK_INVENTORY}
        searchable
        columns={[
          { key: 'sku', label: 'SKU', sortable: true },
          { key: 'name', label: 'Product', sortable: true, render: (v) => <span className="font-medium text-sm">{String(v)}</span> },
          { key: 'warehouse', label: 'Warehouse' },
          { key: 'stock', label: 'In Stock', sortable: true, render: (v, row) => (
            <span className={`font-bold ${Number(v) <= row.threshold ? 'text-error' : 'text-success'}`}>{String(v)}</span>
          )},
          { key: 'reserved', label: 'Reserved', render: (v) => <span className="text-foreground-muted">{String(v)}</span> },
          { key: 'threshold', label: 'Threshold' },
          { key: 'cost', label: 'Unit Cost', sortable: true, render: (v) => `AED ${Number(v).toFixed(2)}` },
        ]}
      />
    </div>
  );
}