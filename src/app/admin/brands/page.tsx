'use client';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
const BRANDS = [
  { id: '1', name: 'Sony', slug: 'sony', productsCount: 342, isActive: true },
  { id: '2', name: 'Microsoft', slug: 'microsoft', productsCount: 289, isActive: true },
  { id: '3', name: 'Nintendo', slug: 'nintendo', productsCount: 218, isActive: true },
  { id: '4', name: 'Razer', slug: 'razer', productsCount: 156, isActive: true },
  { id: '5', name: 'ASUS ROG', slug: 'asus-rog', productsCount: 203, isActive: true },
  { id: '6', name: 'Pokémon', slug: 'pokemon', productsCount: 892, isActive: true },
];
export default function AdminBrandsPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Brands</h1>
        <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Add Brand</Button>
      </div>
      <DataTable data={BRANDS} searchable columns={[
        { key: 'name', label: 'Brand', sortable: true, render: (v, row) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-sm font-bold text-accent">{String(v)[0]}</div>
            <div><p className="font-medium">{String(v)}</p><p className="text-xs text-foreground-muted">/{row.slug}</p></div>
          </div>
        )},
        { key: 'productsCount', label: 'Products', sortable: true },
        { key: 'isActive', label: 'Status', render: (v) => <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${v ? 'text-success bg-success/10 border-success/20' : 'text-error bg-error/10 border-error/20'}`}>{v ? 'Active' : 'Hidden'}</span> },
      ]}
      actions={() => (
        <>
          <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
          <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </>
      )} />
    </div>
  );
}