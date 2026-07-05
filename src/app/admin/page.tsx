'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import Link from 'next/link';
import { adminOrdersApi, adminProductsApi, adminReportsApi } from '@/lib/api/adminApi';
import type { Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  delivered: 'text-success bg-success/10 border-success/20',
  shipped: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  processing: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  pending: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  confirmed: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

function formatCurrency(value: unknown) {
  const num = Number(value ?? 0);
  return `AED ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function AdminDashboardPage() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Record<string, unknown>[]>([]);
  const [revenueBars, setRevenueBars] = useState<number[]>([]);
  const [stats, setStats] = useState({
    revenue: 'AED 0',
    orders: '0',
    customers: '0',
    products: '0',
    aov: 'AED 0',
    pendingOrders: '0',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminReportsApi.revenueSummary({}),
      adminReportsApi.customerStats({}),
      adminReportsApi.ordersByStatus({}),
      adminReportsApi.topProducts({ limit: 5 }),
      adminReportsApi.revenueByPeriod({ groupBy: 'month' }),
      adminOrdersApi.findAll({ limit: 5, sort: 'createdAt', order: 'DESC' }),
      adminProductsApi.findAll({ limit: 1 }),
    ])
      .then(([revenueRes, customerRes, statusRes, topRes, periodRes, ordersRes, productsRes]) => {
        const revenue = revenueRes.data.data;
        const customers = customerRes.data.data;
        const statuses = statusRes.data.data ?? [];
        const top = topRes.data.data ?? [];
        const periods = periodRes.data.data ?? [];
        const orders = ordersRes.data.data;
        const products = productsRes.data.data;

        const pending = (statuses as Array<{ status: string; count: string }>)
          .filter((s) => ['pending', 'confirmed', 'processing'].includes(String(s.status).toLowerCase()))
          .reduce((sum, s) => sum + Number(s.count), 0);

        setStats({
          revenue: formatCurrency(revenue?.revenue),
          orders: String(revenue?.orderCount ?? 0),
          customers: String(customers?.total ?? 0),
          products: String(products?.meta?.total ?? 0),
          aov: formatCurrency(revenue?.aov),
          pendingOrders: String(pending),
        });

        setRecentOrders(orders?.items ?? []);
        setTopProducts(top);
        setRevenueBars(
          (periods as Array<{ revenue: string }>).map((p) => {
            const max = Math.max(...(periods as Array<{ revenue: string }>).map((x) => Number(x.revenue)), 1);
            return Math.round((Number(p.revenue) / max) * 100);
          }),
        );
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-foreground-muted mt-0.5">Live data from your store.</p>
        </div>
        {stats.pendingOrders !== '0' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-medium">
            <div className="h-1.5 w-1.5 rounded-full bg-warning" />
            {stats.pendingOrders} pending orders
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={isLoading ? '...' : stats.revenue} icon={<DollarSign className="h-4 w-4" />} color="text-green-400" />
        <StatCard title="Total Orders" value={isLoading ? '...' : stats.orders} icon={<ShoppingBag className="h-4 w-4" />} color="text-blue-400" />
        <StatCard title="Customers" value={isLoading ? '...' : stats.customers} icon={<Users className="h-4 w-4" />} color="text-purple-400" />
        <StatCard title="Products" value={isLoading ? '...' : stats.products} icon={<Package className="h-4 w-4" />} color="text-accent" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Order Value" value={isLoading ? '...' : stats.aov} icon={<TrendingUp className="h-4 w-4" />} color="text-yellow-400" />
        <StatCard title="Pending Orders" value={isLoading ? '...' : stats.pendingOrders} icon={<Clock className="h-4 w-4" />} color="text-red-400" />
        <StatCard title="Top Products" value={isLoading ? '...' : String(topProducts.length)} icon={<CheckCircle2 className="h-4 w-4" />} color="text-cyan-400" />
        <StatCard title="Recent Orders" value={isLoading ? '...' : String(recentOrders.length)} icon={<RotateCcw className="h-4 w-4" />} color="text-orange-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5">
          <h3 className="font-heading text-base font-bold mb-5">Revenue Overview</h3>
          {revenueBars.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {revenueBars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-accent/80 rounded-t" style={{ height: `${Math.max(h, 4)}%` }} />
                  <span className="text-[10px] text-foreground-subtle">{months[i] ?? i + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground-muted py-8 text-center">No revenue data yet.</p>
          )}
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-bold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 && !isLoading && (
              <p className="text-sm text-foreground-muted text-center py-4">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-background-tertiary/50 -mx-2 px-2 rounded transition-colors">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-foreground-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">AED {Number(order.total).toFixed(2)}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${STATUS_COLORS[order.status?.toLowerCase()] ?? 'text-foreground-muted bg-background-tertiary border-border'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-5">
        <h3 className="font-heading text-base font-bold mb-4">Top Products</h3>
        {topProducts.length === 0 && !isLoading ? (
          <p className="text-sm text-foreground-muted text-center py-4">No product sales data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-foreground-muted border-b border-border">
                  <th className="text-left py-2 font-medium">Product</th>
                  <th className="text-right py-2 font-medium">Sales</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={String(p.id)} className="border-b border-border/50">
                    <td className="py-2.5">{String(p.name ?? 'Unknown')}</td>
                    <td className="py-2.5 text-right font-medium">{String(p.totalSales ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
