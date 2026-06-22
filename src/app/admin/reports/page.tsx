'use client';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/admin/StatCard';
const REPORT_TYPES = [
  { title: 'Revenue Report', desc: 'Sales by period, category, brand, country', icon: '💰' },
  { title: 'Orders Report', desc: 'Order status breakdown, AOV trends', icon: '📦' },
  { title: 'Products Report', desc: 'Views, conversions, top performers', icon: '🎮' },
  { title: 'Customers Report', desc: 'New vs returning, LTV, cohort analysis', icon: '👥' },
  { title: 'Inventory Report', desc: 'Stock levels, movement, shrinkage', icon: '🏭' },
  { title: 'Marketing Report', desc: 'Coupon usage, flash sale performance', icon: '⚡' },
];
const REVENUE_BARS = [45, 62, 38, 80, 55, 90, 72, 68, 85, 43, 77, 92];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export default function AdminReportsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <select className="text-sm bg-background-tertiary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent">
            <option>Last 30 days</option><option>Last 90 days</option><option>This year</option>
          </select>
          <Button variant="secondary" size="sm"><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Gross Revenue" value="AED 2.4M" change="+18.2%" changeUp icon={<span>💰</span>} color="text-green-400" />
        <StatCard title="Net Revenue" value="AED 1.9M" change="+14.1%" changeUp icon={<span>📈</span>} color="text-blue-400" />
        <StatCard title="Refunds" value="AED 42K" change="+2.1%" icon={<span>↩️</span>} color="text-error" />
        <StatCard title="Profit Margin" value="38.2%" change="+1.8%" changeUp icon={<span>🎯</span>} color="text-accent" />
      </div>
      <div className="rounded-xl bg-card border border-border p-5">
        <h3 className="font-heading text-base font-bold mb-5">Revenue Trend — 2025</h3>
        <div className="flex items-end gap-2 h-48">
          {REVENUE_BARS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-foreground-subtle hidden md:block">{Math.round(h * 28)}k</span>
              <div className="w-full rounded-t bg-accent/80 hover:bg-accent transition-colors cursor-pointer" style={{ height: `${h}%` }} title={`${MONTHS[i]}: ${h * 28}k AED`} />
              <span className="text-xs text-foreground-subtle">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map((r) => (
          <div key={r.title} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-border-hover transition-colors cursor-pointer group">
            <span className="text-3xl">{r.icon}</span>
            <div className="flex-1">
              <p className="font-medium text-sm group-hover:text-accent transition-colors">{r.title}</p>
              <p className="text-xs text-foreground-muted">{r.desc}</p>
            </div>
            <Button variant="ghost" size="xs"><Download className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}