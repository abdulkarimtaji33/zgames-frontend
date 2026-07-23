'use client';

import Link from 'next/link';
import { Package, Heart, Star, Wallet, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Card, CardBody } from '@/components/ui/Card';

export default function DashboardPage() {
  const { customer } = useAuthStore();
  const user = customer;
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  const stats = [
    { label: 'Total Orders', value: '0', icon: Package, color: 'text-viz-1', href: '/orders' },
    { label: 'Wishlist Items', value: wishlistCount.toString(), icon: Heart, color: 'text-viz-4', href: '/wishlist' },
    { label: 'Loyalty Points', value: (customer?.pointsBalance ?? 0).toString(), icon: Star, color: 'text-viz-3', href: '/loyalty' },
    { label: 'Store Credit', value: `AED ${Number(customer?.walletBalance ?? 0).toFixed(2)}`, icon: Wallet, color: 'text-success', href: '/store-credit' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-sm text-foreground-muted mt-1">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={href} href={href}>
            <Card hover className="p-5 group">
              <CardBody className="p-0">
                <Icon className={`h-6 w-6 ${color} mb-3`} />
                <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-foreground-muted mt-0.5">{label}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-heading text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { label: 'View My Orders', href: '/orders', desc: 'Check status and history' },
            { label: 'Manage Addresses', href: '/addresses', desc: 'Add or edit delivery addresses' },
            { label: 'Loyalty Rewards', href: '/loyalty', desc: 'View your points & tier status' },
            { label: 'Notification Settings', href: '/notifications', desc: 'Manage email & SMS alerts' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm hover:border-accent/40 hover:shadow-md transition-all group"
            >
              <div>
                <p className="font-medium text-foreground text-sm group-hover:text-accent transition-colors">{action.label}</p>
                <p className="text-xs text-foreground-muted mt-0.5">{action.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-foreground-muted group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}