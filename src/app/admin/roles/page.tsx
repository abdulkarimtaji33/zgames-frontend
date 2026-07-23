'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Key } from 'lucide-react';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FormField, FormInput, FormTextarea } from '@/components/admin/FormField';
import { Button } from '@/components/ui/Button';
import { adminRolesApi, adminPermissionsApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string | null;
}

interface RoleRow {
  id: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  permissions?: Permission[];
}

interface RoleForm {
  name: string;
  description: string;
}

const emptyForm = (): RoleForm => ({ name: '', description: '' });

export default function AdminRolesPage() {
  const toast = useAdminToast((s) => s.show);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [permRole, setPermRole] = useState<RoleRow | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        adminRolesApi.findAll(),
        adminPermissionsApi.findAll(),
      ]);
      setRoles((rolesRes.data.data ?? []) as unknown as RoleRow[]);
      setAllPermissions((permsRes.data.data ?? []) as unknown as Permission[]);
    } catch {
      toast('Failed to load roles', 'error');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (role: RoleRow) => {
    setEditing(role);
    setForm({ name: role.name, description: role.description ?? '' });
    setModalOpen(true);
  };

  const openPermissions = (role: RoleRow) => {
    setPermRole(role);
    setSelectedPermIds(role.permissions?.map((p) => p.id) ?? []);
    setPermModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermIds((ids) =>
      ids.includes(permId) ? ids.filter((id) => id !== permId) : [...ids, permId],
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast('Role name is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() || undefined };
      if (editing) {
        await adminRolesApi.update(editing.id, payload);
        toast('Role updated', 'success');
      } else {
        await adminRolesApi.create(payload);
        toast('Role created', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      toast(editing ? 'Failed to update role' : 'Failed to create role', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignPermissions = async () => {
    if (!permRole) return;
    setIsSubmitting(true);
    try {
      await adminRolesApi.assignPermissions(permRole.id, selectedPermIds);
      toast('Permissions saved', 'success');
      setPermModalOpen(false);
      load();
    } catch {
      toast('Failed to save permissions', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await adminRolesApi.remove(deleteTarget.id);
      toast('Role deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      toast('Failed to delete role', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = ['text-accent', 'text-info', 'text-viz-4', 'text-success', 'text-viz-3', 'text-accent-orange', 'text-viz-6'];

  const groupedPerms = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.resource] ??= []).push(p);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Roles & Permissions</h1>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create Role
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {roles.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-12">No roles found.</p>
        ) : roles.map((role, i) => (
          <div key={role.id} className={`flex items-center justify-between px-5 py-4 hover:bg-background-tertiary/50 transition-colors ${i > 0 ? 'border-t border-border' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full bg-background-tertiary flex items-center justify-center text-sm font-bold ${colors[i % colors.length]}`}>
                {role.name[0].toUpperCase()}
              </div>
              <div>
                <p className={`font-semibold text-sm capitalize ${colors[i % colors.length]}`}>{role.name.replace(/_/g, ' ')}</p>
                <p className="text-xs text-foreground-muted">{role.description ?? `${role.permissions?.length ?? 0} permissions`}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {role.isSystem && <span className="text-xs text-foreground-subtle border border-border px-1.5 py-0.5 rounded">System</span>}
              <button onClick={() => openPermissions(role)} title="Permissions" className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-accent transition-colors">
                <Key className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => openEdit(role)} title="Edit" className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              {!role.isSystem && (
                <button onClick={() => setDeleteTarget(role)} title="Delete" className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Edit Role' : 'Create Role'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save' : 'Create'}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <FormField label="Name">
            <FormInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. content_editor" disabled={!!editing?.isSystem} />
          </FormField>
          <FormField label="Description">
            <FormTextarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Role description..." />
          </FormField>
        </div>
      </AdminModal>

      <AdminModal
        open={permModalOpen}
        title={`Permissions — ${permRole?.name.replace(/_/g, ' ') ?? ''}`}
        onClose={() => setPermModalOpen(false)}
        onSubmit={handleAssignPermissions}
        submitLabel="Save Permissions"
        isSubmitting={isSubmitting}
        wide
      >
        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
          {Object.keys(groupedPerms).length === 0 ? (
            <p className="text-sm text-foreground-muted">No permissions available.</p>
          ) : Object.entries(groupedPerms).sort(([a], [b]) => a.localeCompare(b)).map(([resource, perms]) => (
            <div key={resource}>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">{resource}</p>
              <div className="space-y-1.5 pl-1">
                {perms.map((perm) => (
                  <label key={perm.id} className="flex items-start gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermIds.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      className="mt-0.5 rounded border-border"
                    />
                    <span>
                      <span className="font-medium">{perm.action}</span>
                      {perm.description && <span className="text-foreground-muted"> — {perm.description}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Role"
        message={`Delete role "${deleteTarget?.name.replace(/_/g, ' ')}"? Users with this role may lose access.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isSubmitting}
        destructive
      />
    </div>
  );
}
