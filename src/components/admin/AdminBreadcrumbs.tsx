'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { NavItem } from './Sidebar';

function humanize(segment: string): string {
  // Looks like an id (uuid, numeric, or other opaque slug with no spaces/letters pattern) — show a generic label instead of the raw value.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return 'Details';
  if (/^\d+$/.test(segment)) return 'Details';
  if (segment === 'new') return 'New';
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildLabelMap(navItems: NavItem[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of navItems) {
    if (item.href) map.set(item.href, item.label);
    for (const child of item.children ?? []) map.set(child.href, child.label);
  }
  return map;
}

export function AdminBreadcrumbs({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();
  const labelMap = buildLabelMap(navItems);

  if (pathname === '/admin') return null;

  const segments = pathname.split('/').filter(Boolean); // ['admin', 'products', '[id]', ...]
  const crumbs: { label: string; href: string }[] = [{ label: 'Dashboard', href: '/admin' }];

  let acc = '';
  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`;
    if (acc === '/admin') continue;
    const label = labelMap.get(acc) ?? humanize(segments[i]);
    crumbs.push({ label, href: acc });
  }

  return (
    <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3 text-foreground-subtle flex-shrink-0" />}
            {isLast ? (
              <span className="current">{crumb.label}</span>
            ) : (
              <Link href={crumb.href}>{crumb.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
