'use client';
import { Plus, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
const ROLES = [
  { name: 'Super Admin', permissions: 'All permissions', members: 1, color: 'text-accent' },
  { name: 'Admin', permissions: 'Most permissions, no system settings', members: 2, color: 'text-blue-400' },
  { name: 'Marketing Manager', permissions: 'Coupons, flash sales, blog, products read', members: 3, color: 'text-purple-400' },
  { name: 'Warehouse Manager', permissions: 'Inventory, purchase orders, suppliers', members: 5, color: 'text-green-400' },
  { name: 'Finance Manager', permissions: 'Reports, finance, orders read', members: 2, color: 'text-yellow-400' },
  { name: 'Customer Support', permissions: 'Orders, customers, support tickets, returns', members: 8, color: 'text-orange-400' },
  { name: 'Content Editor', permissions: 'Blog, CMS pages, products read', members: 4, color: 'text-pink-400' },
];
export default function AdminRolesPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Roles & Permissions</h1>
        <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Create Role</Button>
      </div>
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {ROLES.map((role, i) => (
          <div key={role.name} className={`flex items-center justify-between px-5 py-4 hover:bg-background-tertiary/50 transition-colors ${i > 0 ? 'border-t border-border' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full bg-background-tertiary flex items-center justify-center text-sm font-bold ${role.color}`}>{role.name[0]}</div>
              <div>
                <p className={`font-semibold text-sm ${role.color}`}>{role.name}</p>
                <p className="text-xs text-foreground-muted">{role.permissions}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-foreground-muted">{role.members} member{role.members !== 1 ? 's' : ''}</span>
              <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}