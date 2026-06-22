'use client';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
const CATEGORIES = [
  { id: '1', name: 'Console Gaming', slug: 'console-gaming', productsCount: 1842, isActive: true, children: [
    { id: '1a', name: 'PlayStation', slug: 'playstation', productsCount: 842 },
    { id: '1b', name: 'Xbox', slug: 'xbox', productsCount: 621 },
    { id: '1c', name: 'Nintendo', slug: 'nintendo', productsCount: 379 },
  ]},
  { id: '2', name: 'PC Gaming', slug: 'pc-gaming', productsCount: 934, isActive: true, children: [] },
  { id: '3', name: 'Trading Cards', slug: 'trading-cards', productsCount: 612, isActive: true, children: [] },
  { id: '4', name: 'Accessories', slug: 'accessories', productsCount: 459, isActive: true, children: [] },
];
export default function AdminCategoriesPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Categories</h1>
        <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Add Category</Button>
      </div>
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {CATEGORIES.map((cat, i) => (
          <div key={cat.id}>
            <div className={`flex items-center justify-between px-5 py-3.5 hover:bg-background-tertiary/50 transition-colors ${i > 0 ? 'border-t border-border' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">{cat.name[0]}</div>
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-foreground-muted">{cat.productsCount} products · /{cat.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded">Active</span>
                <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {cat.children.map((child) => (
              <div key={child.id} className="flex items-center justify-between pl-14 pr-5 py-2.5 border-t border-border/50 bg-background/30 hover:bg-background-tertiary/30 transition-colors">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5 text-foreground-subtle" />
                  <p className="text-sm text-foreground-muted">{child.name}</p>
                  <span className="text-xs text-foreground-subtle">({child.productsCount})</span>
                </div>
                <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}