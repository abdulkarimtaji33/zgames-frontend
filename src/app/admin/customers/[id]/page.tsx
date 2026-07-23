'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Coins } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { FormField, FormInput, FormTextarea } from '@/components/admin/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminCustomersApi, adminLoyaltyApi } from '@/lib/api/adminApi';
import { useAdminToast } from '@/hooks';

interface CustomerDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  loyaltyPoints: number;
  storeCredit: number;
  isActive: boolean;
  createdAt?: string;
}

interface LoyaltyHistoryItem {
  id: string;
  type: string;
  points: number;
  balance: number;
  description?: string | null;
  createdAt: string;
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useAdminToast((s) => s.show);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [history, setHistory] = useState<LoyaltyHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [customerRes, historyRes] = await Promise.all([
        adminCustomersApi.findOne(id),
        adminLoyaltyApi.getHistory(id),
      ]);
      setCustomer(customerRes.data.data as unknown as CustomerDetail);
      const historyData = historyRes.data.data ?? historyRes.data;
      setHistory(Array.isArray(historyData) ? historyData as LoyaltyHistoryItem[] : []);
    } catch {
      toast('Failed to load customer', 'error');
      setCustomer(null);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdjust = async () => {
    const points = Number(adjustPoints);
    if (!adjustPoints || Number.isNaN(points) || points === 0) {
      toast('Enter a non-zero points value', 'error');
      return;
    }
    if (!adjustReason.trim()) {
      toast('Reason is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminLoyaltyApi.adjust({
        customerId: id,
        points,
        type: 'adjusted',
        notes: adjustReason.trim(),
      });
      toast('Loyalty points adjusted', 'success');
      setAdjustOpen(false);
      setAdjustPoints('');
      setAdjustReason('');
      load();
    } catch {
      toast('Failed to adjust points', 'error');
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

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground-muted mb-4">Customer not found.</p>
        <Link href="/admin/customers" className="text-accent text-sm hover:underline">Back to customers</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/customers" className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold">{customer.firstName} {customer.lastName}</h1>
          <p className="text-sm text-foreground-muted">{customer.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-foreground-muted">Profile</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-foreground-muted">Name</dt><dd>{customer.firstName} {customer.lastName}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground-muted">Email</dt><dd>{customer.email}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground-muted">Phone</dt><dd>{customer.phone ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground-muted">Status</dt><dd><Badge variant={customer.isActive ? 'success' : 'error'} size="xs">{customer.isActive ? 'Active' : 'Banned'}</Badge></dd></div>
            {customer.createdAt && (
              <div className="flex justify-between"><dt className="text-foreground-muted">Joined</dt><dd>{new Date(customer.createdAt).toLocaleDateString()}</dd></div>
            )}
          </dl>
        </div>

        <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-foreground-muted">Balances</h2>
            <Button variant="secondary" size="sm" onClick={() => setAdjustOpen(true)}>
              <Coins className="h-4 w-4" /> Adjust Points
            </Button>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-foreground-muted">Points Balance</dt><dd className="font-bold text-accent">{customer.loyaltyPoints ?? 0}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground-muted">Wallet Balance</dt><dd className="font-bold">AED {Number(customer.storeCredit ?? 0).toFixed(2)}</dd></div>
          </dl>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-bold mb-3">Loyalty History</h2>
        <DataTable
          data={history}
          isLoading={false}
          columns={[
            { key: 'type', label: 'Type', render: (v) => <Badge variant="default" size="xs">{String(v)}</Badge> },
            { key: 'points', label: 'Points', align: 'right', render: (v) => {
              const n = Number(v);
              return <span className={n >= 0 ? 'text-success' : 'text-error'}>{n >= 0 ? '+' : ''}{n}</span>;
            }},
            { key: 'balance', label: 'Balance', align: 'right', render: (v) => String(v) },
            { key: 'description', label: 'Reason', render: (v) => String(v ?? '—') },
            { key: 'createdAt', label: 'Date', render: (v) => <span className="text-xs text-foreground-muted">{new Date(String(v)).toLocaleString()}</span> },
          ]}
          emptyMessage="No loyalty transactions yet."
        />
      </div>

      <AdminModal
        open={adjustOpen}
        title="Adjust Loyalty Points"
        onClose={() => setAdjustOpen(false)}
        onSubmit={handleAdjust}
        submitLabel="Adjust"
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <FormField label="Points" hint="Use negative values to deduct points">
            <FormInput type="number" value={adjustPoints} onChange={(e) => setAdjustPoints(e.target.value)} placeholder="e.g. 100 or -50" />
          </FormField>
          <FormField label="Reason">
            <FormTextarea value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Reason for adjustment..." />
          </FormField>
        </div>
      </AdminModal>
    </div>
  );
}
