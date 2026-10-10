'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Download, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { isAxiosError } from 'axios';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { FormField, FormInput, FormCheckbox } from '@/components/admin/FormField';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminCmsApi } from '@/lib/api/adminApi';
import { downloadCsv, datedCsvFilename } from '@/lib/utils/csv';
import type { PaginatedResponse } from '@/types';

interface CmsRow {
  id: string;
  title: string;
  slug: string;
  content?: string | Record<string, unknown>;
  isPublished?: boolean;
  isActive?: boolean;
  updatedAt?: string;
}

const EMPTY_FORM = { title: '', slug: '', content: '', isPublished: false };

function contentToString(c?: string | Record<string, unknown>): string {
  if (!c) return '';
  if (typeof c === 'string') return c;
  if (c.html) return String(c.html);
  return JSON.stringify(c, null, 2);
}

function isPublished(row: CmsRow) {
  return row.isPublished ?? row.isActive ?? false;
}

export default function AdminCmsPagesPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminCmsApi.findAll(params) as Promise<{ data: { data: PaginatedResponse<CmsRow> | CmsRow[] } }>,
    [],
  );
  const { items, isLoading, reload } = usePaginatedList<CmsRow>({ fetcher, limit: 50 });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CmsRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [slugError, setSlugError] = useState<string | undefined>(undefined);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  const handleExport = () => {
    const rows = items.map((p) => [p.title, p.slug, isPublished(p) ? 'published' : 'draft', p.updatedAt ?? '']);
    downloadCsv(datedCsvFilename('cms-pages'), ['Title', 'Slug', 'Status', 'Updated'], rows);
    toast(`Exported ${items.length} pages`, 'success');
  };

  const handleBulkDelete = async () => {
    setBulkBusy(true);
    try {
      await Promise.all([...selectedIds].map((id) => adminCmsApi.remove(id)));
      toast(`Deleted ${selectedIds.size} pages`, 'success');
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      reload();
    } catch {
      toast('Some pages could not be deleted', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkSetPublished = async (isActive: boolean) => {
    setBulkBusy(true);
    try {
      await Promise.all([...selectedIds].map((id) => adminCmsApi.update(id, { isActive })));
      toast(`Updated ${selectedIds.size} pages`, 'success');
      setSelectedIds(new Set());
      reload();
    } catch {
      toast('Some pages could not be updated', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugError(undefined);
    setModalOpen(true);
  };

  const openEdit = (row: CmsRow) => {
    setEditing(row);
    setForm({
      title: row.title,
      slug: row.slug,
      content: contentToString(row.content),
      isPublished: isPublished(row),
    });
    setSlugError(undefined);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSlugError(undefined);
    try {
      const trimmedSlug = form.slug.trim();
      const payload = {
        title: form.title,
        slug: trimmedSlug || undefined,
        content: form.content,
        isActive: form.isPublished,
      };
      if (editing) {
        await adminCmsApi.update(editing.id, payload);
        toast('Page updated', 'success');
      } else {
        await adminCmsApi.create(payload);
        toast('Page created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        const message = (err.response.data as { message?: string })?.message ?? 'That slug is already taken. Please choose another.';
        setSlugError(message);
        toast(message, 'error');
      } else {
        toast('Failed to save page', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await adminCmsApi.remove(deleteId);
      toast('Page deleted', 'success');
      setDeleteId(null);
      reload();
    } catch {
      toast('Failed to delete page', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">CMS Pages</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New Page</Button>
        </div>
      </div>

      <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())} isBusy={bulkBusy}>
        <Button variant="secondary" size="xs" onClick={() => handleBulkSetPublished(true)} disabled={bulkBusy}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Publish
        </Button>
        <Button variant="secondary" size="xs" onClick={() => handleBulkSetPublished(false)} disabled={bulkBusy}>
          <XCircle className="h-3.5 w-3.5" /> Unpublish
        </Button>
        <Button variant="danger" size="xs" onClick={() => setBulkDeleteOpen(true)} disabled={bulkBusy}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </BulkActionBar>
      <DataTable
        data={items}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchable
        columns={[
          { key: 'title', label: 'Title', sortable: true, render: (v, row) => (
            <div><p className="font-medium text-sm">{String(v)}</p><p className="text-xs text-foreground-muted">/{row.slug}</p></div>
          )},
          { key: 'isPublished', label: 'Status', render: (_, row) => <Badge variant={isPublished(row) ? 'success' : 'warning'} size="xs">{isPublished(row) ? 'Published' : 'Draft'}</Badge> },
          { key: 'updatedAt', label: 'Updated', render: (v) => v ? new Date(String(v)).toLocaleDateString() : '—' },
        ]}
        actions={(row) => <CrudActions onEdit={() => openEdit(row)} onDelete={() => setDeleteId(row.id)} />}
        emptyMessage="No CMS pages found."
      />

      <AdminModal open={modalOpen} title={editing ? 'Edit Page' : 'New Page'} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={submitting} wide>
        <div className="space-y-4">
          <FormField label="Title"><FormInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField
            label="Slug"
            hint={slugError ? undefined : 'Leave blank to auto-generate from title'}
            error={slugError}
          >
            <FormInput
              value={form.slug}
              onChange={(e) => { setForm({ ...form, slug: e.target.value }); if (slugError) setSlugError(undefined); }}
              placeholder="auto-generated"
              error={!!slugError}
            />
          </FormField>
          <FormField label="Content">
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="Write the page content…"
            />
          </FormField>
          <FormCheckbox label="Published" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} title="Delete Page" message="Are you sure you want to delete this CMS page?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={submitting} destructive />
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete Pages"
        message={`Are you sure you want to delete ${selectedIds.size} selected page(s)? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        isLoading={bulkBusy}
        destructive
      />
    </div>
  );
}
