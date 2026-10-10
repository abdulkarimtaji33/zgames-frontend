'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Download, Plus, Trash2, XCircle } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { FormField, FormInput } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminUsersApi, adminRolesApi } from '@/lib/api/adminApi';
import { usePaginatedList, useAdminToast } from '@/hooks';
import { downloadCsv, datedCsvFilename } from '@/lib/utils/csv';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import type { StaffUser } from '@/types';

interface RoleOption {
  id: string;
  name: string;
}

interface UserForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleIds: string[];
}

const emptyForm = (): UserForm => ({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  roleIds: [],
});

export default function AdminUsersPage() {
  const toast = useAdminToast((s) => s.show);
  const currentUserId = useAdminAuthStore((s) => s.user?.id);
  const fetcher = useCallback(
    (params: Record<string, unknown>) => adminUsersApi.findAll(params),
    [],
  );
  const { items, page, setPage, limit, setLimit, total, totalPages, isLoading, reload } = usePaginatedList<StaffUser>({ fetcher });

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  const handleExport = () => {
    const rows = items.map((u) => [
      u.firstName,
      u.lastName,
      u.email,
      (u.roles ?? []).map((r) => r.name).join('; '),
      u.isActive ? 'active' : 'disabled',
    ]);
    downloadCsv(datedCsvFilename('admin-users'), ['First Name', 'Last Name', 'Email', 'Roles', 'Status'], rows);
    toast(`Exported ${items.length} users`, 'success');
  };

  const handleBulkSetActive = async (isActive: boolean) => {
    setBulkBusy(true);
    try {
      await Promise.all([...selectedIds].map((id) => adminUsersApi.update(id, { isActive })));
      toast(`Updated ${selectedIds.size} users`, 'success');
      setSelectedIds(new Set());
      reload();
    } catch {
      toast('Some users could not be updated', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    const targets = [...selectedIds].filter((id) => id !== currentUserId);
    if (targets.length < selectedIds.size) toast('Your own account was skipped — you cannot delete yourself', 'info');
    if (targets.length === 0) { setBulkDeleteOpen(false); return; }
    setBulkBusy(true);
    try {
      await Promise.all(targets.map((id) => adminUsersApi.remove(id)));
      toast(`Deleted ${targets.length} users`, 'success');
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      reload();
    } catch {
      toast('Some users could not be deleted', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  useEffect(() => {
    adminRolesApi.findAll()
      .then((res) => setRoles((res.data.data ?? []) as unknown as RoleOption[]))
      .catch(() => setRoles([]));
  }, []);

  const openInvite = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (user: StaffUser) => {
    setEditing(user);
    setForm({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      roleIds: user.roles?.map((r) => r.id) ?? [],
    });
    setModalOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setForm((f) => ({
      ...f,
      roleIds: f.roleIds.includes(roleId) ? f.roleIds.filter((id) => id !== roleId) : [...f.roleIds, roleId],
    }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.firstName || !form.lastName) {
      toast('Fill in required fields', 'error');
      return;
    }
    if (!editing && (!form.password || form.password.length < 8)) {
      toast('Password must be at least 8 characters', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        roleIds: form.roleIds,
      };
      if (form.password) payload.password = form.password;

      if (editing) {
        await adminUsersApi.update(editing.id, payload);
        toast('User updated', 'success');
      } else {
        await adminUsersApi.create(payload);
        toast('User invited', 'success');
      }
      setModalOpen(false);
      reload();
    } catch {
      toast(editing ? 'Failed to update user' : 'Failed to invite user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await adminUsersApi.remove(deleteTarget.id);
      toast('User deleted', 'success');
      setDeleteTarget(null);
      reload();
    } catch {
      toast('Failed to delete user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Admin Users</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="primary" size="sm" onClick={openInvite}>
            <Plus className="h-4 w-4" /> Invite User
          </Button>
        </div>
      </div>

      <div className="space-y-0">
        <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())} isBusy={bulkBusy}>
          <Button variant="secondary" size="xs" onClick={() => handleBulkSetActive(true)} disabled={bulkBusy}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Activate
          </Button>
          <Button variant="secondary" size="xs" onClick={() => handleBulkSetActive(false)} disabled={bulkBusy}>
            <XCircle className="h-3.5 w-3.5" /> Deactivate
          </Button>
          <Button variant="danger" size="xs" onClick={() => setBulkDeleteOpen(true)} disabled={bulkBusy}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </BulkActionBar>
        <DataTable
          data={items}
          total={total}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchable
          searchPlaceholder="Search users..."
          columns={[
            {
              key: 'firstName',
              label: 'Name',
              sortable: true,
              render: (v, row) => (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">{String(v)[0]}</div>
                  <div>
                    <p className="font-medium text-sm">{row.firstName} {row.lastName}</p>
                    <p className="text-xs text-foreground-muted">{row.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'roles',
              label: 'Roles',
              render: (v) => {
                const userRoles = v as StaffUser['roles'];
                if (!userRoles?.length) return <Badge variant="info" size="xs">Staff</Badge>;
                return (
                  <div className="flex flex-wrap gap-1">
                    {userRoles.map((r) => (
                      <Badge key={r.id} variant="info" size="xs" className="capitalize">{r.name.replace(/_/g, ' ')}</Badge>
                    ))}
                  </div>
                );
              },
            },
            {
              key: 'lastLoginAt',
              label: 'Last Login',
              render: (v) => <span className="text-xs text-foreground-muted">{v ? new Date(String(v)).toLocaleString() : 'Never'}</span>,
            },
            {
              key: 'isActive',
              label: 'Status',
              render: (v) => <Badge variant={v ? 'success' : 'error'} size="xs">{v ? 'Active' : 'Disabled'}</Badge>,
            },
          ]}
          actions={(row) => (
            <CrudActions
              onEdit={() => openEdit(row)}
              onDelete={row.id === currentUserId ? undefined : () => setDeleteTarget(row)}
            />
          )}
          emptyMessage="No admin users found."
        />
        <div className="-mt-px rounded-b-xl bg-card border border-t-0 border-border">
          <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} pageSize={limit} onPageSizeChange={setLimit} />
        </div>
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Edit User' : 'Invite User'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save Changes' : 'Invite'}
        isSubmitting={isSubmitting}
        wide
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="First Name">
            <FormInput value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </FormField>
          <FormField label="Last Name">
            <FormInput value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </FormField>
          <FormField label="Email" className="sm:col-span-2">
            <FormInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField label={editing ? 'Password (leave blank to keep)' : 'Password'} className="sm:col-span-2">
            <FormInput type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>
          <FormField label="Phone" className="sm:col-span-2">
            <FormInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </FormField>
          <FormField label="Roles" className="sm:col-span-2">
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-3 space-y-2">
              {roles.length === 0 ? (
                <p className="text-xs text-foreground-muted">No roles available</p>
              ) : roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.roleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="rounded border-border"
                  />
                  <span className="capitalize">{role.name.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isSubmitting}
        destructive
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete Users"
        message={`Are you sure you want to delete ${selectedIds.size} selected user(s)? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        isLoading={bulkBusy}
        destructive
      />
    </div>
  );
}
