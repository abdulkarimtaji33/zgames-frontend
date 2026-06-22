'use client';
import { StatCard } from '@/components/admin/StatCard';
import { Eye, MousePointer, ShoppingCart, Users } from 'lucide-react';
export default function AdminAnalyticsPage() {
  const EVENTS = [
    { event: 'page_view', count: 284921, change: '+12.3%', up: true },
    { event: 'view_item', count: 89234, change: '+8.1%', up: true },
    { event: 'add_to_cart', count: 12841, change: '+5.2%', up: true },
    { event: 'begin_checkout', count: 4921, change: '+3.8%', up: true },
    { event: 'purchase', count: 1842, change: '+15.2%', up: true },
    { event: 'search', count: 23891, change: '-2.1%', up: false },
  ];
  const TOP_PAGES = [
    { page: '/en', views: 48921, bounce: '38%' },
    { page: '/en/products/ps5-console-disc', views: 12834, bounce: '22%' },
    { page: '/en/category/playstation', views: 9821, bounce: '34%' },
    { page: '/en/deals', views: 8934, bounce: '41%' },
    { page: '/en/products/pokemon-sv-booster-box', views: 7821, bounce: '19%' },
  ];
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="font-heading text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Sessions" value="284,921" change="+12.3%" changeUp icon={<Eye className="h-4 w-4" />} color="text-blue-400" />
        <StatCard title="Page Views" value="842,341" change="+8.4%" changeUp icon={<MousePointer className="h-4 w-4" />} color="text-purple-400" />
        <StatCard title="Add to Cart" value="12,841" change="+5.2%" changeUp icon={<ShoppingCart className="h-4 w-4" />} color="text-accent" />
        <StatCard title="New Users" value="4,891" change="+18.1%" changeUp icon={<Users className="h-4 w-4" />} color="text-green-400" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h3 className="font-heading text-base font-bold">Event Funnel</h3></div>
          <div className="divide-y divide-border">
            {EVENTS.map((e) => (
              <div key={e.event} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium font-mono text-accent">{e.event}</p>
                  <p className="text-xl font-bold text-foreground">{e.count.toLocaleString()}</p>
                </div>
                <span className={`text-sm font-medium ${e.up ? 'text-success' : 'text-error'}`}>{e.change}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h3 className="font-heading text-base font-bold">Top Pages</h3></div>
          <div className="divide-y divide-border">
            {TOP_PAGES.map((p) => (
              <div key={p.page} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm font-mono text-foreground-muted truncate flex-1">{p.page}</p>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold">{p.views.toLocaleString()}</p>
                  <p className="text-xs text-foreground-muted">Bounce: {p.bounce}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}