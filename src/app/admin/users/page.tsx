'use client';
import { Plus, Edit2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
const ADMIN_USERS = [
  { id: '1', name: 'Super Admin', email: 'admin@zgames.ae', role: 'Super Admin', lastLogin: '2025-01-15 14:22', isActive: true },
  { id: '2', name: 'Marketing Manager', email: 'marketing@zgames.ae', role: 'Marketing Manager', lastLogin: '2025-01-14 09:15', isActive: true },
  { id: '3', name: 'Warehouse Staff', email: 'warehouse@zgames.ae', role: 'Warehouse Manager', lastLogin: '2025-01-15 08:00', isActive: true },
  { id: '4', name: 'Content Editor', email: 'content@zgames.ae', role: 'Content Editor', lastLogin: '2025-01-13 16:30', isActive: true },
];
export default function AdminUsersPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Admin Users</h1>
        <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Invite User</Button>
      </div>
      <DataTable data={ADMIN_USERS} searchable columns={[
        { key: 'name', label: 'Name', sortable: true, render: (v, row) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">{String(v)[0]}</div>
            <div><p className="font-medium text-sm">{String(v)}</p><p className="text-xs text-foreground-muted">{row.email}</p></div>
          </div>
        )},
        { key: 'role', label: 'Role', render: (v) => <Badge variant="info" size="xs">{String(v)}</Badge> },
        { key: 'lastLogin', label: 'Last Login', render: (v) => <span className="text-xs text-foreground-muted">{String(v)}</span> },
        { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Active' : 'Disabled'}</Badge> },
      ]}
      actions={() => <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>} />
    </div>
  );
}