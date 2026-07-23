'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Package, Tags, Bookmark, Sliders,
  Warehouse, Truck, ClipboardList, Users, Star, MessageSquare,
  RotateCcw, Bell, BarChart2, LineChart, FileText, Settings,
  Menu, X, Zap, UserCog, ShieldCheck, Lock, DollarSign, PenTool,
  Building2, Globe, BookOpen,
} from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminAuthApi } from '@/lib/api/adminApi';
import { AdminToastContainer } from '@/components/admin/AdminToast';
import { Sidebar, type NavItem } from '@/components/admin/Sidebar';

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Tags },
  { label: 'Brands', href: '/admin/brands', icon: Bookmark },
  { label: 'Attributes', href: '/admin/attributes', icon: Sliders },
  { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { label: 'Purchase Orders', href: '/admin/purchase-orders', icon: ClipboardList },
  { label: 'Suppliers', href: '/admin/suppliers', icon: Building2 },
  { label: 'Warehouses', href: '/admin/warehouses', icon: Truck },
  {
    label: 'Marketing', icon: Zap,
    children: [
      { label: 'Coupons', href: '/admin/marketing/coupons' },
      { label: 'Flash Sales', href: '/admin/marketing/flash-sales' },
      { label: 'Loyalty', href: '/admin/marketing/loyalty' },
      { label: 'Gift Cards', href: '/admin/marketing/gift-cards' },
      { label: 'Affiliates', href: '/admin/marketing/affiliates' },
    ],
  },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Support', href: '/admin/support', icon: MessageSquare },
  { label: 'Returns', href: '/admin/returns', icon: RotateCcw },
  { label: 'Blog', href: '/admin/blog', icon: PenTool },
  { label: 'CMS Pages', href: '/admin/cms-pages', icon: FileText },
  { label: 'Finance', href: '/admin/finance', icon: DollarSign },
  { label: 'Reports', href: '/admin/reports', icon: BarChart2 },
  { label: 'Analytics', href: '/admin/analytics', icon: LineChart },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Users', href: '/admin/users', icon: UserCog },
  { label: 'Roles', href: '/admin/roles', icon: ShieldCheck },
  { label: 'Permissions', href: '/admin/permissions', icon: Lock },
  {
    label: 'Localization', icon: Globe,
    children: [
      { label: 'Countries', href: '/admin/localization/countries' },
      { label: 'Currencies', href: '/admin/localization/currencies' },
      { label: 'Languages', href: '/admin/localization/languages' },
      { label: 'Stores', href: '/admin/localization/stores' },
    ],
  },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const ROLE_NAV: Record<string, string[]> = {
  super_admin: ['*'],
  admin: ['*'],
  marketing_manager: ['Dashboard', 'Products', 'Categories', 'Brands', 'Marketing', 'Blog', 'CMS Pages', 'Analytics', 'Reports'],
  warehouse_manager: ['Dashboard', 'Products', 'Inventory', 'Purchase Orders', 'Suppliers', 'Warehouses', 'Reports'],
  finance_manager: ['Dashboard', 'Orders', 'Finance', 'Reports', 'Analytics', 'Customers'],
  customer_support: ['Dashboard', 'Orders', 'Customers', 'Support', 'Returns', 'Reviews'],
  content_editor: ['Dashboard', 'Products', 'Blog', 'CMS Pages', 'Categories'],
};

function filterNav(roles: string[] | undefined): NavItem[] {
  if (!roles?.length) return NAV;
  if (roles.some((r) => ROLE_NAV[r]?.includes('*'))) return NAV;
  const allowed = new Set(roles.flatMap((r) => ROLE_NAV[r] ?? []));
  if (allowed.size === 0) return NAV;
  return NAV.filter((item) => allowed.has(item.label));
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const { user, isAuthenticated, clearAuth, accessToken, refreshToken, setAuth } = useAdminAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      if (isAuthenticated) router.replace('/admin');
      setAuthChecked(true);
      return;
    }

    if (!isAuthenticated) {
      router.replace('/admin/login');
      return;
    }

    if (isAuthenticated && !user && accessToken) {
      adminAuthApi.me()
        .then((res) => setAuth(accessToken, refreshToken ?? '', res.data.data))
        .catch(() => {
          clearAuth();
          router.replace('/admin/login');
        })
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, [isLoginPage, isAuthenticated, user, accessToken, refreshToken, router, setAuth, clearAuth]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      if (refreshToken) await adminAuthApi.logout(refreshToken);
    } catch { /* ignore */ }
    clearAuth();
    router.push('/admin/login');
  };

  if (isLoginPage) return <>{children}</>;

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Admin';
  const roleName = user?.roles?.[0]?.name?.replace(/_/g, ' ') ?? 'Staff';
  const filteredNav = filterNav(user?.roles?.map((r) => r.name));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          navItems={filteredNav}
          onLogout={handleLogout}
        />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 mega-menu-backdrop animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex h-full animate-slide-in-right">
            <Sidebar
              collapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
              navItems={filteredNav}
              onLogout={handleLogout}
            />
            <button
              className="absolute top-4 right-[-3rem] bg-background-secondary border border-border p-2 rounded-full text-foreground-muted shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-border bg-background-secondary/80 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-md hover:bg-background-tertiary text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/admin/guide"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-accent hover:bg-accent/10 transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Guide</span>
            </Link>
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 pl-3 border-l border-border hover:opacity-80 transition-opacity duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center font-bold text-white text-sm">
                {displayName[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-foreground-muted capitalize">{roleName}</p>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <AdminToastContainer />
    </div>
  );
}
