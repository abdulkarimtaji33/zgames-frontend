'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FormField, FormInput } from '@/components/admin/FormField';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminReportsApi } from '@/lib/api/adminApi';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-accent font-semibold">AED {Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
}

interface PeriodRow {
  period?: string;
  date?: string;
  revenue?: string | number;
  orderCount?: string | number;
}

export default function AdminReportsPage() {
  const toast = useAdminToast((s) => s.show);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [topProducts, setTopProducts] = useState<Record<string, unknown>[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, unknown>[]>([]);
  const [revenuePeriods, setRevenuePeriods] = useState<PeriodRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const params = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const load = () => {
    setIsLoading(true);
    Promise.all([
      adminReportsApi.revenueSummary(params),
      adminReportsApi.topProducts({ ...params, limit: 10 }),
      adminReportsApi.ordersByStatus(params),
      adminReportsApi.customerStats(params),
      adminReportsApi.revenueByPeriod({ ...params, groupBy: 'day' }),
    ])
      .then(([sumRes, topRes, statusRes, custRes, periodRes]) => {
        setSummary({ ...sumRes.data.data, ...custRes.data.data });
        setTopProducts(topRes.data.data ?? []);
        setOrdersByStatus(statusRes.data.data ?? []);
        setRevenuePeriods(periodRes.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [startDate, endDate]);

  const exportCsv = () => {
    if (revenuePeriods.length === 0) {
      toast('No data to export', 'info');
      return;
    }
    const header = 'Period,Revenue,Orders\n';
    const rows = revenuePeriods.map((p) =>
      `${p.period ?? p.date ?? ''},${p.revenue ?? 0},${p.orderCount ?? 0}`,
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${startDate || 'all'}-${endDate || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported', 'success');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Reports</h1>
        <div className="flex items-end gap-3">
          <FormField label="Start Date"><FormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></FormField>
          <FormField label="End Date"><FormInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></FormField>
          <Button variant="secondary" size="sm" onClick={exportCsv} className="mb-0.5"><Download className="h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenue" value={isLoading ? '...' : `AED ${Number(summary.revenue ?? 0).toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} color="text-success" />
        <StatCard title="Orders" value={isLoading ? '...' : String(summary.orderCount ?? 0)} icon={<ShoppingBag className="h-4 w-4" />} color="text-info" />
        <StatCard title="Customers" value={isLoading ? '...' : String(summary.total ?? 0)} icon={<Users className="h-4 w-4" />} color="text-viz-4" />
        <StatCard title="Avg Order" value={isLoading ? '...' : `AED ${Number(summary.aov ?? 0).toFixed(0)}`} icon={<Package className="h-4 w-4" />} color="text-accent" />
      </div>

      <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
        <h3 className="font-heading font-bold mb-4">Revenue by Period</h3>
        {isLoading ? (
          <div className="h-48 skeleton rounded-lg" />
        ) : revenuePeriods.length === 0 ? (
          <p className="text-sm text-foreground-muted">No revenue data for selected range.</p>
        ) : (
          <ResponsiveContainer width="100%" height={192}>
            <BarChart data={revenuePeriods.map((p, i) => ({ label: String(p.period ?? p.date ?? i + 1).slice(-5), revenue: Number(p.revenue ?? 0) }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--color-foreground-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'var(--color-background-tertiary)' }} />
              <Bar dataKey="revenue" fill="var(--color-accent)" radius={[4, 4, 0, 0]} animationDuration={400} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-heading font-bold mb-4">Orders by Status</h3>
          {ordersByStatus.length === 0 ? <p className="text-sm text-foreground-muted">No data.</p> : (
            <div className="space-y-2">
              {ordersByStatus.map((s) => (
                <div key={String(s.status)} className="flex justify-between text-sm">
                  <span className="capitalize">{String(s.status)}</span>
                  <span className="font-bold">{String(s.count)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-heading font-bold mb-4">Top Products</h3>
          {topProducts.length === 0 ? <p className="text-sm text-foreground-muted">No data.</p> : (
            <div className="space-y-2">
              {topProducts.map((p) => (
                <div key={String(p.id)} className="flex justify-between text-sm">
                  <span className="line-clamp-1">{String(p.name)}</span>
                  <span className="font-bold ml-2">{String(p.totalSales ?? 0)} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
