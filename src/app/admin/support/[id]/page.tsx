'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, XCircle } from 'lucide-react';
import { FormField, FormSelect, FormTextarea } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminSupportApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface SupportMessage {
  id: string;
  senderId: string;
  senderType: string;
  body: string;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  customerId: string;
  subject: string;
  status: string;
  priority: string;
  orderId?: string | null;
  createdAt: string;
  messages?: SupportMessage[];
}

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  open: 'warning', in_progress: 'info', resolved: 'success', closed: 'success',
};

export default function AdminSupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useAdminToast((s) => s.show);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await adminSupportApi.findOne(id);
      const data = (res.data.data ?? res.data) as TicketDetail;
      setTicket(data);
      setStatus(data.status);
    } catch {
      toast('Failed to load ticket', 'error');
      setTicket(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReply = async () => {
    if (!reply.trim()) {
      toast('Enter a message', 'error');
      return;
    }
    setIsSending(true);
    try {
      await adminSupportApi.agentReply(id, reply.trim());
      toast('Reply sent', 'success');
      setReply('');
      load();
    } catch {
      toast('Failed to send reply', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!status || status === ticket?.status) return;
    setIsUpdating(true);
    try {
      await adminSupportApi.update(id, { status });
      toast('Status updated', 'success');
      load();
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = async () => {
    setIsClosing(true);
    try {
      await adminSupportApi.close(id);
      toast('Ticket closed', 'success');
      load();
    } catch {
      toast('Failed to close ticket', 'error');
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground-muted mb-4">Ticket not found.</p>
        <Link href="/admin/support" className="text-accent text-sm hover:underline">Back to support</Link>
      </div>
    );
  }

  const messages = [...(ticket.messages ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/support" className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold">{ticket.subject}</h1>
            <p className="text-sm text-foreground-muted">#{ticket.id.slice(0, 8).toUpperCase()} · {new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[ticket.status] ?? 'default'} size="sm">{ticket.status.replace(/_/g, ' ').toUpperCase()}</Badge>
          {ticket.status !== 'closed' && (
            <Button variant="secondary" size="sm" onClick={handleClose} isLoading={isClosing}>
              <XCircle className="h-4 w-4" /> Close
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border shadow-sm p-4 space-y-2 text-sm">
          <p><span className="text-foreground-muted">Priority:</span> <span className="capitalize">{ticket.priority}</span></p>
          <p><span className="text-foreground-muted">Customer ID:</span> {ticket.customerId.slice(0, 8)}…</p>
          {ticket.orderId && <p><span className="text-foreground-muted">Order ID:</span> {ticket.orderId.slice(0, 8)}…</p>}
        </div>
        <div className="md:col-span-2 rounded-xl bg-card border border-border shadow-sm p-4 flex items-end gap-3">
          <FormField label="Status" className="flex-1">
            <FormSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </FormSelect>
          </FormField>
          <Button variant="primary" size="sm" onClick={handleStatusUpdate} isLoading={isUpdating} disabled={status === ticket.status}>
            Update Status
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-foreground-muted">Messages</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-8">No messages yet.</p>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {messages.map((msg) => {
              const isAgent = msg.senderType === 'admin';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'max-w-[85%] rounded-lg px-4 py-3 text-sm',
                    isAgent ? 'ml-auto bg-accent/10 border border-accent/20' : 'bg-background-tertiary border border-border',
                  )}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-xs font-semibold capitalize">{isAgent ? 'Agent' : 'Customer'}</span>
                    <span className="text-xs text-foreground-muted">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {ticket.status !== 'closed' && (
        <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-3">
          <FormField label="Agent Reply">
            <FormTextarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
            />
          </FormField>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={handleReply} isLoading={isSending}>
              <Send className="h-4 w-4" /> Send Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
