'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Package, Tags, Bookmark, Sliders,
  Warehouse, Truck, ClipboardList, Users, Star, MessageSquare,
  RotateCcw, Bell, BarChart2, FileText, Settings, ChevronDown,
  ChevronRight, Menu, X, Zap, Gift, Heart, FileSpreadsheet,
  Shield, DollarSign, PenTool, Building2, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
};

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
    ],
  },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Support', href: '/admin/support', icon: MessageSquare },
  { label: 'Returns', href: '/admin/returns', icon: RotateCcw },
  { label: 'Blog', href: '/admin/blog', icon: PenTool },
  { label: 'Finance', href: '/admin/finance', icon: DollarSign },
  { label: 'Reports', href: '/admin/reports', icon: BarChart2 },
  { label: 'Analytics', href: '/admin/analytics', icon: FileText },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Users', href: '/admin/users', icon: Shield },
  { label: 'Roles', href: '/admin/roles', icon: Gift },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const isActive = item.href ? pathname === item.href : item.children?.some((c) => pathname.startsWith(c.href));

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center w-full px-3 py-2.5 rounded-lg text-sm transition-colors',
            isActive ? 'bg-accent/10 text-accent' : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary',
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="ml-3 flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="ml-7 mt-1 space-y-0.5">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                  pathname === child.href ? 'text-accent bg-accent/10' : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary',
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors',
        isActive ? 'bg-accent/10 text-accent font-medium' : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary',
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="ml-3">{item.label}</span>}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const Sidebar = () => (
    <aside className={cn(
      'flex flex-col bg-background-secondary border-r border-border h-screen sticky top-0 transition-all duration-200',
      sidebarCollapsed ? 'w-14' : 'w-60',
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
        {!sidebarCollapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-accent flex items-center justify-center font-heading font-bold text-white text-xs">Z</div>
            <span className="font-heading font-bold text-sm"><span className="text-accent">Z</span>GAMES</span>
            <span className="text-xs text-foreground-subtle border border-border px-1.5 py-0.5 rounded">Admin</span>
          </Link>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors ml-auto"
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', !sidebarCollapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => (
          <NavLink key={item.label} item={item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3 flex-shrink-0">
        <Link href="/" className={cn('flex items-center px-3 py-2.5 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors', sidebarCollapsed && 'justify-center')}>
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!sidebarCollapsed && <span className="ml-3">Back to Store</span>}
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex h-full">
            <Sidebar />
            <button
              className="absolute top-4 right-[-3rem] bg-background-secondary border border-border p-2 rounded-full text-foreground-muted"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-border bg-background-secondary flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded hover:bg-background-tertiary text-foreground-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center font-bold text-white text-sm">A</div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">Admin</p>
                <p className="text-xs text-foreground-muted">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}