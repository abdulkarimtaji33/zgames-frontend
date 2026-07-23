'use client';

import { Bell, Mail, MessageSquare } from 'lucide-react';

const PREF_ITEMS = [
  { label: 'Order Updates', desc: 'Shipping and delivery notifications' },
  { label: 'Deals & Offers', desc: 'Flash sales, coupons, and promotions' },
  { label: 'New Arrivals', desc: 'Latest products and releases' },
  { label: 'Loyalty Rewards', desc: 'Points earned and tier changes' },
  { label: 'Price Drop Alerts', desc: 'When wishlist items go on sale' },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Notification Preferences</h1>
      <div className="rounded-xl bg-card border border-border divide-y divide-border shadow-sm">
        {PREF_ITEMS.map((pref) => (
          <div key={pref.label} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground text-sm">{pref.label}</p>
              <p className="text-xs text-foreground-muted">{pref.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer hover:text-foreground transition-colors">
                <input type="checkbox" defaultChecked className="accent-accent focus-visible:ring-2 focus-visible:ring-ring/40 rounded" />
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <label className="flex items-center gap-1.5 text-xs text-foreground-muted cursor-pointer hover:text-foreground transition-colors">
                <input type="checkbox" className="accent-accent focus-visible:ring-2 focus-visible:ring-ring/40 rounded" />
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}