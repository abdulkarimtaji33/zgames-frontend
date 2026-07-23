'use client';

import { useEffect, useState } from 'react';
import { Plus, Users, Star } from 'lucide-react';
import { AdminModal } from '@/components/admin/AdminModal';
import { FormField, FormInput, FormTextarea } from '@/components/admin/FormField';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminCustomersApi, adminLoyaltyApi } from '@/lib/api/adminApi';

export default function AdminLoyaltyPage() {
  const toast = useAdminToast((s) => s.show);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customerId: '', points: '', reason: '' });

  const loadStats = () => {
    setIsLoading(true);
    adminCustomersApi.findAll({ limit: 100 })
      .then((res) => {
        const items = res.data.data.items ?? [];
        setTotalCustomers(res.data.data.meta?.total ?? items.length);
        setTotalPoints(items.reduce((s: number, c: Record<string, unknown>) => s + Number(c.pointsBalance ?? 0), 0));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadStats(); }, []);

  const handleAdjust = async () => {
    setSubmitting(true);
    try {
      await adminLoyaltyApi.adjust({
        customerId: form.customerId,
        points: Number(form.points),
        type: 'adjusted',
        notes: form.reason || undefined,
      });
      toast('Points adjusted successfully', 'success');
      setModalOpen(false);
      setForm({ customerId: '', points: '', reason: '' });
      loadStats();
    } catch {
      toast('Failed to adjust points', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Loyalty Program</h1>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Adjust Points</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Enrolled Customers" value={isLoading ? '...' : String(totalCustomers)} icon={<Users className="h-4 w-4" />} color="text-viz-4" />
        <StatCard title="Total Points Issued" value={isLoading ? '...' : totalPoints.toLocaleString()} icon={<Star className="h-4 w-4" />} color="text-accent" />
        <StatCard title="Avg Points / Customer" value={isLoading ? '...' : totalCustomers ? Math.round(totalPoints / totalCustomers).toLocaleString() : '0'} icon={<Star className="h-4 w-4" />} color="text-info" />
        <StatCard title="Program Status" value="Active" icon={<Star className="h-4 w-4" />} color="text-success" />
      </div>

      <AdminModal open={modalOpen} title="Adjust Loyalty Points" onClose={() => setModalOpen(false)} onSubmit={handleAdjust} isSubmitting={submitting} submitLabel="Adjust">
        <div className="space-y-4">
          <FormField label="Customer ID" hint="UUID of the customer"><FormInput value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></FormField>
          <FormField label="Points" hint="Use negative values to deduct"><FormInput type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} /></FormField>
          <FormField label="Reason"><FormTextarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason for adjustment..." /></FormField>
        </div>
      </AdminModal>
    </div>
  );
}
