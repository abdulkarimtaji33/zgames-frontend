'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FormField, FormInput, FormTextarea } from '@/components/admin/FormField';
import { Button } from '@/components/ui/Button';
import { adminPermissionsApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string | null;
}

interface PermissionForm {
  resource: string;
  action: string;
  description: string;
}

const emptyForm = (): PermissionForm => ({ resource: '', action: '', description: '' });

export default function AdminPermissionsPage() {
  const toast = useAdminToast((s) => s.show);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [form, setForm] = useState<PermissionForm>(emptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await adminPermissionsApi.findAll();
      setPermissions((res.data.data ?? []) as unknown as Permission[]);
    } catch {
      toast('Failed to load permissions', 'error');
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.resource] ??= []).push(p);
    return acc;
  }, {});

  const handleCreate = async () => {
    if (!form.resource.trim() || !form.action.trim()) {
      toast('Resource and action are required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminPermissionsApi.create({
        resource: form.resource.trim(),
        action: form.action.trim(),
        description: form.description.trim() || undefined,
      });
      toast('Permission created', 'success');
      setModalOpen(false);
      setForm(emptyForm());
      load();
    } catch {
      toast('Failed to create permission', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await adminPermissionsApi.remove(deleteTarget.id);
      toast('Permission deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      toast('Failed to delete permission', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="font-heading text-2xl font-bold">Permissions</h1>
        <Button variant="primary" size="sm" onClick={() => { setForm(emptyForm()); setModalOpen(true); }}>
          <Plus className="h-4 w-4" /> Create Permission
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-12">No permissions found.</p>
        ) : Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([resource, perms], gi) => (
          <div key={resource} className={gi > 0 ? 'border-t border-border' : ''}>
            <div className="px-5 py-3 bg-background-tertiary/50">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">{resource}</h2>
            </div>
            {perms.sort((a, b) => a.action.localeCompare(b.action)).map((perm, pi) => (
              <div
                key={perm.id}
                className={`flex items-center justify-between px-5 py-3 hover:bg-background-tertiary/50 transition-colors ${pi > 0 ? 'border-t border-border/50' : ''}`}
              >
                <div>
                  <p className="text-sm font-medium">{perm.action}</p>
                  {perm.description && <p className="text-xs text-foreground-muted">{perm.description}</p>}
                </div>
                <button
                  onClick={() => setDeleteTarget(perm)}
                  title="Delete"
                  className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <AdminModal
        open={modalOpen}
        title="Create Permission"
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        submitLabel="Create"
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <FormField label="Resource" hint="e.g. products, orders, customers">
            <FormInput value={form.resource} onChange={(e) => setForm({ ...form, resource: e.target.value })} placeholder="products" />
          </FormField>
          <FormField label="Action" hint="e.g. create, read, update, delete">
            <FormInput value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} placeholder="read" />
          </FormField>
          <FormField label="Description">
            <FormTextarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Permission"
        message={`Delete permission "${deleteTarget?.resource}:${deleteTarget?.action}"? This may affect role assignments.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isSubmitting}
        destructive
      />
    </div>
  );
}
