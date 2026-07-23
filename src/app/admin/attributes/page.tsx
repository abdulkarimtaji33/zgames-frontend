'use client';

import { useCallback, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput, FormSelect } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminAttributesApi } from '@/lib/api/adminApi';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import type { PaginatedResponse } from '@/types';

interface AttributeOption {
  id: string;
  value: string;
  label: string;
  colorCode?: string | null;
  sortOrder?: number;
}

interface AttributeRow {
  id: string;
  name: string;
  type?: string;
  isFilterable?: boolean;
  options?: AttributeOption[];
}

interface AttributeForm {
  name: string;
  type: string;
  isFilterable: boolean;
}

const emptyForm: AttributeForm = {
  name: '',
  type: 'text',
  isFilterable: false,
};

const emptyOptionForm = { label: '', value: '', colorCode: '#e53e3e' };

const TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'select', label: 'Select' },
  { value: 'color', label: 'Color' },
];

function slugifyValue(label: string) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export default function AdminAttributesPage() {
  const { show } = useAdminToast();
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminAttributesApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<AttributeRow> } }>,
    [],
  );
  const { items, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<AttributeRow>({ fetcher });

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<AttributeRow | null>(null);
  const [deleting, setDeleting] = useState<AttributeRow | null>(null);
  const [form, setForm] = useState<AttributeForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Options manager state (only active once the attribute has an id)
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [optionForm, setOptionForm] = useState(emptyOptionForm);
  const [addingOption, setAddingOption] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionForm, setEditOptionForm] = useState(emptyOptionForm);
  const [deletingOption, setDeletingOption] = useState<AttributeOption | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOptions([]);
    setModalOpen(true);
  };

  const openEdit = (attr: AttributeRow) => {
    setEditing(attr);
    setForm({
      name: attr.name,
      type: attr.type ?? 'text',
      isFilterable: attr.isFilterable ?? false,
    });
    setOptions([...(attr.options ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    setModalOpen(true);
  };

  const openDelete = (attr: AttributeRow) => {
    setDeleting(attr);
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      show('Name is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        isFilterable: form.isFilterable,
      };
      if (editing) {
        await adminAttributesApi.update(editing.id, payload);
        show('Attribute updated', 'success');
        reload();
      } else {
        const res = await adminAttributesApi.create(payload) as { data: { data: AttributeRow } };
        show('Attribute created — now add some options below', 'success');
        setEditing(res.data.data);
        reload();
        setIsSubmitting(false);
        return;
      }
      setModalOpen(false);
      reload();
    } catch {
      show(editing ? 'Failed to update attribute' : 'Failed to create attribute', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await adminAttributesApi.remove(deleting.id);
      show('Attribute deleted', 'success');
      setConfirmOpen(false);
      setDeleting(null);
      reload();
    } catch {
      show('Failed to delete attribute', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddOption = async () => {
    if (!editing) return;
    if (!optionForm.label.trim()) {
      show('Option label is required', 'error');
      return;
    }
    setAddingOption(true);
    try {
      const payload = {
        label: optionForm.label.trim(),
        value: optionForm.value.trim() || slugifyValue(optionForm.label),
        colorCode: form.type === 'color' ? optionForm.colorCode : undefined,
        sortOrder: options.length,
      };
      const res = await adminAttributesApi.addOption(editing.id, payload) as { data: AttributeOption } | { data: { data: AttributeOption } };
      const created = ('data' in res.data ? (res.data as { data: AttributeOption }).data : res.data) as AttributeOption;
      setOptions((prev) => [...prev, created]);
      setOptionForm(emptyOptionForm);
      reload();
    } catch {
      show('Failed to add option', 'error');
    } finally {
      setAddingOption(false);
    }
  };

  const startEditOption = (opt: AttributeOption) => {
    setEditingOptionId(opt.id);
    setEditOptionForm({ label: opt.label, value: opt.value, colorCode: opt.colorCode ?? '#e53e3e' });
  };

  const saveEditOption = async (optionId: string) => {
    if (!editing) return;
    try {
      await adminAttributesApi.updateOption(editing.id, optionId, {
        label: editOptionForm.label.trim(),
        value: editOptionForm.value.trim(),
        colorCode: form.type === 'color' ? editOptionForm.colorCode : undefined,
      });
      setOptions((prev) => prev.map((o) => (o.id === optionId ? { ...o, ...editOptionForm } : o)));
      setEditingOptionId(null);
      show('Option updated', 'success');
      reload();
    } catch {
      show('Failed to update option', 'error');
    }
  };

  const confirmDeleteOption = async () => {
    if (!editing || !deletingOption) return;
    try {
      await adminAttributesApi.removeOption(editing.id, deletingOption.id);
      setOptions((prev) => prev.filter((o) => o.id !== deletingOption.id));
      show('Option removed', 'success');
      reload();
    } catch {
      show('Failed to remove option', 'error');
    } finally {
      setDeletingOption(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Attributes</h1>
          <p className="text-sm text-foreground-muted mt-0.5">Define reusable product attributes like Size or Color, and their selectable options.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Attribute
        </Button>
      </div>

      <div>
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            {
              key: 'type',
              label: 'Type',
              render: (v) => (
                <Badge variant="default" size="xs">{String(v ?? 'text')}</Badge>
              ),
            },
            {
              key: 'isFilterable',
              label: 'Filterable',
              render: (v) => v ? <Badge variant="success" size="xs">Yes</Badge> : <span className="text-foreground-subtle">No</span>,
            },
            {
              key: 'options',
              label: 'Options',
              render: (v, row) => (
                <button onClick={() => openEdit(row)} className="flex items-center gap-1.5 hover:text-accent transition-colors">
                  {Array.isArray(v) && v.length > 0 ? (
                    <div className="flex items-center -space-x-1.5">
                      {(v as AttributeOption[]).slice(0, 4).map((opt) => (
                        row.type === 'color' && opt.colorCode ? (
                          <span key={opt.id} className="h-5 w-5 rounded-full border-2 border-card" style={{ backgroundColor: opt.colorCode }} title={opt.label} />
                        ) : (
                          <span key={opt.id} className="h-5 px-1.5 rounded-full border-2 border-card bg-background-tertiary text-[10px] flex items-center" title={opt.label}>{opt.label.slice(0, 3)}</span>
                        )
                      ))}
                    </div>
                  ) : null}
                  <span className="text-xs text-foreground-muted">{Array.isArray(v) ? v.length : 0} option{Array.isArray(v) && v.length === 1 ? '' : 's'}</span>
                </button>
              ),
            },
          ]}
          actions={(row) => (
            <CrudActions onEdit={() => openEdit(row)} onDelete={() => openDelete(row)} />
          )}
          emptyMessage="No attributes yet. Add one like Size or Color to build product variants."
        />
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? `Edit Attribute — ${editing.name}` : 'Add Attribute'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save Changes' : 'Create & Add Options'}
        isSubmitting={isSubmitting}
        wide
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name">
              <FormInput
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Size, Color, Edition"
              />
            </FormField>
            <FormField label="Type">
              <FormSelect
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </FormSelect>
            </FormField>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFilterable}
              onChange={(e) => setForm((f) => ({ ...f, isFilterable: e.target.checked }))}
              className="accent-accent h-4 w-4"
            />
            <span className="text-sm text-foreground">Show as a filter on category pages</span>
          </label>

          {editing && (
            <div className="border-t border-border pt-4">
              <h3 className="font-heading font-bold text-sm mb-1">Options</h3>
              <p className="text-xs text-foreground-muted mb-3">
                These are the values customers pick from (e.g. Small/Medium/Large, or Red/Blue). Product variants are built from these.
              </p>

              {options.length > 0 && (
                <div className="rounded-lg border border-border divide-y divide-border mb-3 overflow-hidden">
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-3 px-3 py-2.5">
                      {editingOptionId === opt.id ? (
                        <>
                          {form.type === 'color' && (
                            <input
                              type="color"
                              value={editOptionForm.colorCode}
                              onChange={(e) => setEditOptionForm((f) => ({ ...f, colorCode: e.target.value }))}
                              className="h-8 w-8 rounded border border-border cursor-pointer flex-shrink-0"
                            />
                          )}
                          <input
                            value={editOptionForm.label}
                            onChange={(e) => setEditOptionForm((f) => ({ ...f, label: e.target.value }))}
                            className="flex-1 min-w-0 px-2 py-1 rounded bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
                            placeholder="Label"
                          />
                          <input
                            value={editOptionForm.value}
                            onChange={(e) => setEditOptionForm((f) => ({ ...f, value: e.target.value }))}
                            className="w-28 px-2 py-1 rounded bg-background-tertiary border border-border text-xs font-mono focus:outline-none focus:border-accent"
                            placeholder="value"
                          />
                          <button onClick={() => saveEditOption(opt.id)} className="p-1.5 rounded text-success hover:bg-success/10"><Check className="h-4 w-4" /></button>
                          <button onClick={() => setEditingOptionId(null)} className="p-1.5 rounded text-foreground-muted hover:bg-background-tertiary"><X className="h-4 w-4" /></button>
                        </>
                      ) : (
                        <>
                          {form.type === 'color' && (
                            <span className="h-6 w-6 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: opt.colorCode ?? '#ccc' }} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{opt.label}</p>
                            <p className="text-xs text-foreground-subtle font-mono">{opt.value}</p>
                          </div>
                          <button onClick={() => startEditOption(opt)} className="p-1.5 rounded text-foreground-muted hover:bg-background-tertiary hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeletingOption(opt)} className="p-1.5 rounded text-foreground-muted hover:bg-error/10 hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                {form.type === 'color' && (
                  <input
                    type="color"
                    value={optionForm.colorCode}
                    onChange={(e) => setOptionForm((f) => ({ ...f, colorCode: e.target.value }))}
                    className="h-9 w-9 rounded border border-border cursor-pointer flex-shrink-0"
                  />
                )}
                <input
                  value={optionForm.label}
                  onChange={(e) => setOptionForm((f) => ({ ...f, label: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }}
                  placeholder="New option label (e.g. Red, Medium)"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
                />
                <Button variant="secondary" size="sm" onClick={handleAddOption} isLoading={addingOption} type="button">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </AdminModal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Attribute"
        message={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleting(null); }}
        isLoading={isDeleting}
        destructive
      />

      <ConfirmDialog
        open={!!deletingOption}
        title="Remove Option"
        message={`Remove "${deletingOption?.label}" from this attribute?`}
        onConfirm={confirmDeleteOption}
        onCancel={() => setDeletingOption(null)}
        destructive
      />
    </div>
  );
}
