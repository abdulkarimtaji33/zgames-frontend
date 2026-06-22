'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import Link from 'next/link';

const RECENT_ORDERS = [
  { id: 'ZG-00123', customer: 'Ahmed Al Mansouri', total: 'AED 849.00', status: 'DELIVERED', date: '2025-01-15' },
  { id: 'ZG-00124', customer: 'Sarah Johnson', total: 'AED 1,299.00', status: 'SHIPPED', date: '2025-01-15' },
  { id: 'ZG-00125', customer: 'Omar Khalid', total: 'AED 349.00', status: 'PROCESSING', date: '2025-01-15' },
  { id: 'ZG-00126', customer: 'Fatima Al Zaabi', total: 'AED 2,100.00', status: 'PENDING', date: '2025-01-14' },
  { id: 'ZG-00127', customer: 'James Wilson', total: 'AED 599.00', status: 'CONFIRMED', date: '2025-01-14' },
];

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: 'text-success bg-success/10 border-success/20',
  SHIPPED: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  PROCESSING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  PENDING: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  CONFIRMED: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

const TOP_PRODUCTS = [
  { name: 'PS5 Console Disc Edition', sold: 142, revenue: 'AED 506,742' },
  { name: 'Pokémon TCG Scarlet & Violet Booster', sold: 891, revenue: 'AED 133,209' },
  { name: 'God of War Ragnarök', sold: 329, revenue: 'AED 109,921' },
  { name: 'Xbox Series X Console', sold: 98, revenue: 'AED 244,902' },
  { name: 'Nintendo Switch OLED', sold: 211, revenue: 'AED 210,789' },
];

const REVENUE_BARS = [45, 62, 38, 80, 55, 90, 72, 68, 85, 43, 77, 92];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboardPage() {
  const [liveOrders, setLiveOrders] = useState(3);
  useEffect(() => {
    const t = setInterval(() => setLiveOrders((n) => n + Math.floor(Math.random() * 2)), 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-foreground-muted mt-0.5">Welcome back — here is what is happening today.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-medium animate-pulse-glow">
          <div className="h-1.5 w-1.5 rounded-full bg-success" />
          {liveOrders} live orders
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="AED 2.4M" change="+18.2%" changeUp icon={<DollarSign className="h-4 w-4" />} color="text-green-400" />
        <StatCard title="Total Orders" value="4,892" change="+12.5%" changeUp icon={<ShoppingBag className="h-4 w-4" />} color="text-blue-400" />
        <StatCard title="Customers" value="12,341" change="+8.1%" changeUp icon={<Users className="h-4 w-4" />} color="text-purple-400" />
        <StatCard title="Products" value="3,847" change="+22 new" changeUp icon={<Package className="h-4 w-4" />} color="text-accent" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Order Value" value="AED 490" change="+5.2%" changeUp icon={<TrendingUp className="h-4 w-4" />} color="text-yellow-400" />
        <StatCard title="Conversion Rate" value="3.8%" change="+0.4%" changeUp icon={<CheckCircle2 className="h-4 w-4" />} color="text-cyan-400" />
        <StatCard title="Returns" value="127" change="+4 today" icon={<RotateCcw className="h-4 w-4" />} color="text-orange-400" />
        <StatCard title="Pending Orders" value="48" change="needs attention" icon={<Clock className="h-4 w-4" />} color="text-red-400" />
      </div>

      {/* Revenue chart + Recent orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue bar chart */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-base font-bold">Revenue Overview</h3>
            <select className="text-xs bg-background-tertiary border border-border rounded px-2 py-1 text-foreground-muted focus:outline-none">
              <option>2025</option><option>2024</option>
            </select>
          </div>
          <div className="flex items-end gap-1 h-40">
            {REVENUE_BARS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t bg-accent/80 hover:bg-accent transition-colors" style={{ height: `${h}%` }} title={`${MONTHS[i]}: ${h}k AED`} />
                <span className="text-xs text-foreground-subtle">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order status donut (CSS) */}
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-heading text-base font-bold mb-5">Order Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Delivered', count: 2841, pct: 58, color: 'bg-success' },
              { label: 'Processing', count: 892, pct: 18, color: 'bg-blue-400' },
              { label: 'Shipped', count: 614, pct: 13, color: 'bg-yellow-400' },
              { label: 'Pending', count: 340, pct: 7, color: 'bg-orange-400' },
              { label: 'Cancelled', count: 205, pct: 4, color: 'bg-error' },
            ].map(({ label, count, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground-muted">{label}</span>
                  <span className="font-medium">{count.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full bg-background-tertiary overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders + Top products */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-heading text-base font-bold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-background-tertiary/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{order.id}</p>
                  <p className="text-xs text-foreground-muted">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">{order.total}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-heading text-base font-bold">Top Products</h3>
            <Link href="/admin/products" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-5 py-3 hover:bg-background-tertiary/50 transition-colors">
                <span className="text-xs font-bold text-foreground-subtle w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                  <p className="text-xs text-foreground-muted">{p.sold} sold</p>
                </div>
                <span className="text-sm font-bold text-accent text-right flex-shrink-0">{p.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-heading text-base font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
            Low Stock Alerts
          </h3>
          <Link href="/admin/inventory" className="text-xs text-accent hover:underline">Manage inventory</Link>
        </div>
        <div className="divide-y divide-border">
          {[
            { name: 'PS5 DualSense Controller — Midnight Black', stock: 2, sku: 'PS5-DS-MBK' },
            { name: 'Pokémon TCG: Scarlet & Violet Booster Box', stock: 5, sku: 'PKM-SV-BB' },
            { name: 'Xbox Series X Controller — Blue', stock: 3, sku: 'XBX-CTRL-BLU' },
          ].map((item) => (
            <div key={item.sku} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-foreground-muted">SKU: {item.sku}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${item.stock <= 3 ? 'text-error bg-error/10' : 'text-warning bg-warning/10'}`}>
                {item.stock} left
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}