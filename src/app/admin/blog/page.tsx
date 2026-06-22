'use client';
import { Plus, Edit2, Eye, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
const POSTS = [
  { id: '1', title: 'Top 10 PS5 Games to Play in 2025', category: 'PlayStation', status: 'PUBLISHED', views: 4821, publishedAt: '2025-01-15' },
  { id: '2', title: 'Beginner Guide to Pokémon TCG', category: 'Trading Cards', status: 'PUBLISHED', views: 7234, publishedAt: '2025-01-10' },
  { id: '3', title: 'Xbox vs PlayStation in 2025', category: 'Consoles', status: 'DRAFT', views: 0, publishedAt: null },
  { id: '4', title: 'Nintendo Switch 2: Everything We Know', category: 'Nintendo', status: 'SCHEDULED', views: 0, publishedAt: '2025-01-20' },
];
export default function AdminBlogPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Blog Posts</h1>
        <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> New Post</Button>
      </div>
      <DataTable data={POSTS} searchable columns={[
        { key: 'title', label: 'Title', sortable: true, render: (v) => <p className="font-medium text-sm line-clamp-1 max-w-sm">{String(v)}</p> },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'PUBLISHED' ? 'success' : v === 'DRAFT' ? 'default' : 'info'} size="xs">{String(v)}</Badge> },
        { key: 'views', label: 'Views', sortable: true, render: (v) => Number(v) > 0 ? Number(v).toLocaleString() : <span className="text-foreground-subtle">—</span> },
        { key: 'publishedAt', label: 'Published', render: (v) => v ? <span className="text-xs text-foreground-muted">{String(v)}</span> : <span className="text-foreground-subtle">—</span> },
      ]}
      actions={() => (
        <>
          <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Eye className="h-3.5 w-3.5" /></button>
          <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
          <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </>
      )} />
    </div>
  );
}