'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Package, Heart, GitCompare, MapPin, Bell, Star, Wallet, LogOut, Gift } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: User },
  { href: '/orders', label: 'My Orders', icon: Package },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/addresses', label: 'Addresses', icon: MapPin },
  { href: '/loyalty', label: 'Loyalty Rewards', icon: Star },
  { href: '/store-credit', label: 'Store Credit', icon: Wallet },
  { href: '/gift-cards', label: 'Gift Cards', icon: Gift },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, clearAuth, isAuthenticated } = useAuthStore();
  const user = customer;

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          {/* User info */}
          <div className="rounded-xl bg-card border border-border p-5 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-foreground-muted truncate">{user?.email}</p>
              </div>
            </div>
            {customer && (
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-background-tertiary">
                  <p className="text-xs text-foreground-muted">Points</p>
                  <p className="font-bold text-accent text-sm">{customer.pointsBalance ?? 0}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-background-tertiary">
                  <p className="text-xs text-foreground-muted">Credit</p>
                  <p className="font-bold text-foreground text-sm">AED {Number(customer.walletBalance ?? 0).toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="rounded-xl bg-card border border-border overflow-hidden">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm border-b border-border last:border-b-0 transition-colors',
                  pathname === href
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary',
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
            <button
              onClick={() => { clearAuth(); router.push('/login'); }}
              className="flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-background-tertiary transition-colors w-full"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}