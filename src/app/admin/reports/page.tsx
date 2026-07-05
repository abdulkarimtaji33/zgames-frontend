'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { FormField, FormInput } from '@/components/admin/FormField';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminReportsApi } from '@/lib/api/adminApi';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';

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

  const maxRevenue = Math.max(...revenuePeriods.map((p) => Number(p.revenue ?? 0)), 1);

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
        <StatCard title="Revenue" value={isLoading ? '...' : `AED ${Number(summary.revenue ?? 0).toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} color="text-green-400" />
        <StatCard title="Orders" value={isLoading ? '...' : String(summary.orderCount ?? 0)} icon={<ShoppingBag className="h-4 w-4" />} color="text-blue-400" />
        <StatCard title="Customers" value={isLoading ? '...' : String(summary.total ?? 0)} icon={<Users className="h-4 w-4" />} color="text-purple-400" />
        <StatCard title="Avg Order" value={isLoading ? '...' : `AED ${Number(summary.aov ?? 0).toFixed(0)}`} icon={<Package className="h-4 w-4" />} color="text-accent" />
      </div>

      <div className="rounded-xl bg-card border border-border p-5">
        <h3 className="font-heading font-bold mb-4">Revenue by Period</h3>
        {revenuePeriods.length === 0 ? (
          <p className="text-sm text-foreground-muted">No revenue data for selected range.</p>
        ) : (
          <div className="flex items-end gap-1 h-40 overflow-x-auto">
            {revenuePeriods.map((p, i) => {
              const h = Math.round((Number(p.revenue ?? 0) / maxRevenue) * 100);
              return (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[32px]">
                  <div className="w-full bg-accent/80 rounded-t" style={{ height: `${Math.max(h, 4)}%`, minHeight: 4 }} title={`AED ${p.revenue}`} />
                  <span className="text-[9px] text-foreground-subtle truncate max-w-[48px]">{String(p.period ?? p.date ?? i + 1).slice(-5)}</span>
                </div>
              );
            })}
          </div>
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
