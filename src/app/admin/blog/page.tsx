'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { isAxiosError } from 'axios';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CrudActions } from '@/components/admin/CrudActions';
import { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormField';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminBlogApi } from '@/lib/api/adminApi';
import type { PaginatedResponse } from '@/types';

interface PostRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  excerpt?: string;
  content?: string | Record<string, unknown>;
  publishedAt?: string;
  createdAt: string;
  author?: { firstName: string; lastName: string };
}

const EMPTY_FORM = { title: '', slug: '', content: '', status: 'draft', excerpt: '' };

function contentToString(c?: string | Record<string, unknown>): string {
  if (!c) return '';
  if (typeof c === 'string') return c;
  return JSON.stringify(c, null, 2);
}

export default function AdminBlogPage() {
  const toast = useAdminToast((s) => s.show);
  const [statusFilter, setStatusFilter] = useState('published');
  const extraParams = useMemo(() => ({ status: statusFilter }), [statusFilter]);
  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      adminBlogApi.findAll(params) as unknown as Promise<{ data: { data: PaginatedResponse<PostRow> | PostRow[] } }>,
    [],
  );
  const { items, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<PostRow>({ fetcher, extraParams });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<PostRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [slugError, setSlugError] = useState<string | undefined>(undefined);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugError(undefined);
    setModalOpen(true);
  };

  const openEdit = async (row: PostRow) => {
    setEditing(row);
    try {
      const res = await adminBlogApi.findOne(row.id);
      const post = res.data.data as PostRow;
      setForm({
        title: post.title,
        slug: post.slug,
        content: contentToString(post.content),
        status: post.status,
        excerpt: post.excerpt ?? '',
      });
    } catch {
      setForm({
        title: row.title,
        slug: row.slug,
        content: contentToString(row.content),
        status: row.status,
        excerpt: row.excerpt ?? '',
      });
    }
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
        excerpt: form.excerpt || undefined,
        content: form.content,
        status: form.status,
        publishedAt: form.status === 'published' ? new Date().toISOString() : undefined,
      };
      if (editing) {
        await adminBlogApi.update(editing.id, payload);
        toast('Post updated', 'success');
      } else {
        await adminBlogApi.create(payload);
        toast('Post created', 'success');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        const message = (err.response.data as { message?: string })?.message ?? 'That slug is already taken. Please choose another.';
        setSlugError(message);
        toast(message, 'error');
      } else {
        toast('Failed to save post', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await adminBlogApi.remove(deleteId);
      toast('Post deleted', 'success');
      setDeleteId(null);
      reload();
    } catch {
      toast('Failed to delete post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Blog Posts</h1>
        <div className="flex items-center gap-2">
          <FormSelect value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-36">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </FormSelect>
          <Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New Post</Button>
        </div>
      </div>

      <DataTable
        data={items}
        isLoading={isLoading}
        searchable
        columns={[
          { key: 'title', label: 'Title', sortable: true, render: (v, row) => (
            <div><p className="font-medium text-sm">{String(v)}</p><p className="text-xs text-foreground-muted">/{row.slug}</p></div>
          )},
          { key: 'author', label: 'Author', render: (v) => {
            const a = v as PostRow['author'];
            return a ? `${a.firstName} ${a.lastName}` : '—';
          }},
          { key: 'status', label: 'Status', render: (v) => <Badge variant={String(v) === 'published' ? 'success' : 'warning'} size="xs">{String(v)}</Badge> },
          { key: 'publishedAt', label: 'Published', render: (v) => <span className="text-xs text-foreground-muted">{v ? new Date(String(v)).toLocaleDateString() : 'Draft'}</span> },
        ]}
        actions={(row) => <CrudActions onEdit={() => openEdit(row)} onDelete={() => setDeleteId(row.id)} />}
        emptyMessage="No blog posts found."
      />
      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <AdminModal open={modalOpen} title={editing ? 'Edit Post' : 'New Post'} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={submitting} wide>
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
          <FormField label="Excerpt"><FormTextarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} /></FormField>
          <FormField label="Content">
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="Write the post content…"
            />
          </FormField>
          <FormField label="Status">
            <FormSelect value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </FormSelect>
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteId} title="Delete Post" message="Are you sure you want to delete this blog post?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={submitting} destructive />
    </div>
  );
}
