'use client';

import { useCallback, useState } from 'react';
import { Check, MessageSquare, Trash2, X } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FormField, FormTextarea } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { adminReviewsApi } from '@/lib/api/adminApi';
import { usePaginatedList, useAdminToast } from '@/hooks';
import type { Review } from '@/types';

export default function AdminReviewsPage() {
  const toast = useAdminToast((s) => s.show);
  const fetcher = useCallback(
    (params: Record<string, unknown>) => adminReviewsApi.findAll(params),
    [],
  );
  const { items, page, setPage, total, totalPages, isLoading, reload } = usePaginatedList<Review>({ fetcher });

  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Review | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async (review: Review) => {
    try {
      await adminReviewsApi.approve(review.id);
      toast('Review approved', 'success');
      reload();
    } catch {
      toast('Failed to approve review', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setIsSubmitting(true);
    try {
      await adminReviewsApi.reject(rejectTarget.id, rejectReason.trim() || undefined);
      toast('Review rejected', 'success');
      setRejectTarget(null);
      setRejectReason('');
      reload();
    } catch {
      toast('Failed to reject review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyTarget || !replyText.trim()) {
      toast('Enter a reply', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminReviewsApi.addReply(replyTarget.id, replyText.trim());
      toast('Reply added', 'success');
      setReplyTarget(null);
      setReplyText('');
      reload();
    } catch {
      toast('Failed to add reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await adminReviewsApi.remove(deleteTarget.id);
      toast('Review deleted', 'success');
      setDeleteTarget(null);
      reload();
    } catch {
      toast('Failed to delete review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="font-heading text-2xl font-bold">Reviews</h1>
      <div className="space-y-0">
        <DataTable
          data={items}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search reviews..."
          columns={[
            { key: 'rating', label: 'Rating', render: (v) => <span className="text-yellow-400">{'★'.repeat(Number(v))}</span> },
            {
              key: 'title',
              label: 'Review',
              render: (v, row) => (
                <div>
                  <p className="font-medium text-sm">{String(v ?? '—')}</p>
                  <p className="text-xs text-foreground-muted line-clamp-1">{row.body}</p>
                  {row.reply && <p className="text-xs text-accent mt-1 line-clamp-1">Reply: {row.reply}</p>}
                </div>
              ),
            },
            {
              key: 'customer',
              label: 'Customer',
              render: (v) => {
                const c = v as Review['customer'];
                return c ? `${c.firstName} ${c.lastName}` : '—';
              },
            },
            {
              key: 'status',
              label: 'Status',
              render: (v) => (
                <Badge variant={String(v) === 'approved' ? 'success' : String(v) === 'rejected' ? 'error' : 'warning'} size="xs">
                  {String(v)}
                </Badge>
              ),
            },
            {
              key: 'createdAt',
              label: 'Date',
              render: (v) => <span className="text-xs text-foreground-muted">{new Date(String(v)).toLocaleDateString()}</span>,
            },
          ]}
          actions={(row) => (
            <>
              {row.status !== 'approved' && (
                <button onClick={() => handleApprove(row)} title="Approve" className="p-1.5 rounded hover:bg-success/10 text-foreground-muted hover:text-success transition-colors">
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              {row.status !== 'rejected' && (
                <button onClick={() => setRejectTarget(row)} title="Reject" className="p-1.5 rounded hover:bg-error/10 text-foreground-muted hover:text-error transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => { setReplyTarget(row); setReplyText(row.reply ?? ''); }} title="Reply" className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-accent transition-colors">
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(row)} title="Delete" className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          emptyMessage="No reviews found."
        />
        <div className="-mt-px rounded-b-xl bg-card border border-t-0 border-border">
          <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </div>
      </div>

      <AdminModal
        open={!!replyTarget}
        title="Reply to Review"
        onClose={() => { setReplyTarget(null); setReplyText(''); }}
        onSubmit={handleReply}
        submitLabel="Send Reply"
        isSubmitting={isSubmitting}
      >
        <FormField label="Reply">
          <FormTextarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." rows={4} />
        </FormField>
      </AdminModal>

      <AdminModal
        open={!!rejectTarget}
        title="Reject Review"
        onClose={() => { setRejectTarget(null); setRejectReason(''); }}
        onSubmit={handleReject}
        submitLabel="Reject"
        isSubmitting={isSubmitting}
      >
        <FormField label="Reason (optional)">
          <FormTextarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." />
        </FormField>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isSubmitting}
        destructive
      />
    </div>
  );
}
