'use client';

import { Check, X, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';

const MOCK_REVIEWS = [
  { id: '1', product: 'PS5 Console', customer: 'Ahmed M.', rating: 5, status: 'PENDING', date: '2025-01-15', excerpt: 'Amazing console, super fast...' },
  { id: '2', product: 'Pokémon Booster Box', customer: 'Sarah J.', rating: 4, status: 'APPROVED', date: '2025-01-14', excerpt: 'Good pulls, worth the price...' },
  { id: '3', product: 'Xbox Series X', customer: 'Omar K.', rating: 3, status: 'PENDING', date: '2025-01-13', excerpt: 'Good but expected more...' },
];

export default function AdminReviewsPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="font-heading text-2xl font-bold">Reviews</h1>
      <DataTable
        data={MOCK_REVIEWS}
        searchable
        columns={[
          { key: 'product', label: 'Product', sortable: true },
          { key: 'customer', label: 'Customer' },
          { key: 'rating', label: 'Rating', render: (v) => '⭐'.repeat(Number(v)) },
          { key: 'excerpt', label: 'Review', render: (v) => <span className="text-foreground-muted text-xs line-clamp-1 max-w-xs">{String(v)}</span> },
          { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'APPROVED' ? 'success' : 'warning'} size="xs">{String(v)}</Badge> },
          { key: 'date', label: 'Date', render: (v) => <span className="text-xs text-foreground-muted">{String(v)}</span> },
        ]}
        actions={() => (
          <>
            <button className="p-1.5 rounded hover:bg-success/20 text-foreground-muted hover:text-success transition-colors"><Check className="h-3.5 w-3.5" /></button>
            <button className="p-1.5 rounded hover:bg-error/20 text-foreground-muted hover:text-error transition-colors"><X className="h-3.5 w-3.5" /></button>
            <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </>
        )}
      />
    </div>
  );
}