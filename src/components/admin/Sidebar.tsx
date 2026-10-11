'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
  /** Whether this section's items are expanded by default (before any stored per-user preference is applied). Defaults to true. */
  defaultOpen?: boolean;
};

const SECTION_COLLAPSE_KEY = 'cgagames-admin-nav-sections';

function sectionContainsPath(section: NavSection, pathname: string): boolean {
  return section.items.some((item) =>
    item.href ? pathname === item.href : item.children?.some((c) => pathname.startsWith(c.href)),
  );
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(
    item.children?.some((c) => pathname.startsWith(c.href)) ?? false,
  );
  const Icon = item.icon;
  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((c) => pathname.startsWith(c.href));

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={cn(
            'flex items-center w-full px-3 py-2.5 rounded-lg text-sm transition-colors duration-[var(--duration-fast)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background-secondary',
            isActive
              ? 'bg-accent/10 text-accent'
              : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary',
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="ml-3 flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform duration-[var(--duration-fast)]', open && 'rotate-180')}
              />
            </>
          )}
        </button>
        {!collapsed && (
          <div
            className={cn(
              'ml-7 overflow-hidden transition-[grid-template-rows] duration-[var(--duration-base)] ease-[var(--ease-standard)] grid',
              open ? 'grid-rows-[1fr] mt-1' : 'grid-rows-[0fr]',
            )}
          >
            <div className="overflow-hidden space-y-0.5">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm transition-colors duration-[var(--duration-fast)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    pathname === child.href
                      ? 'text-accent bg-accent/10 font-medium'
                      : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary',
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors duration-[var(--duration-fast)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-accent/10 text-accent font-medium'
          : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary',
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="ml-3">{item.label}</span>}
    </Link>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  sections: NavSection[];
  onLogout: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, sections, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((s) => { initial[s.label] = s.defaultOpen ?? true; });
    return initial;
  });

  // Merge in any persisted per-user overrides after mount (avoids SSR/localStorage mismatch),
  // and always force-open whichever section contains the current route.
  useEffect(() => {
    let stored: Record<string, boolean> = {};
    try {
      const raw = window.localStorage.getItem(SECTION_COLLAPSE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch { /* ignore */ }
    setOpenSections((prev) => {
      const next = { ...prev };
      sections.forEach((s) => {
        if (stored[s.label] !== undefined) next[s.label] = stored[s.label];
        if (sectionContainsPath(s, pathname)) next[s.label] = true;
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        window.localStorage.setItem(SECTION_COLLAPSE_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-background-secondary border-r border-border h-screen sticky top-0 transition-[width] duration-[var(--duration-base)] ease-[var(--ease-standard)]',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center font-heading font-bold text-white text-xs">
              C
            </div>
            <span className="font-heading font-bold text-sm">
              <span className="text-accent">CGA</span> GAMES
            </span>
            <span className="text-xs text-foreground-subtle border border-border px-1.5 py-0.5 rounded-md">
              Admin
            </span>
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-md hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors duration-[var(--duration-fast)] ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform duration-[var(--duration-base)]', !collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {sections.map((section) => {
          const open = collapsed || (openSections[section.label] ?? true);
          return (
            <div key={section.label} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  aria-expanded={open}
                  className="admin-nav-section-label flex items-center justify-between w-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 text-foreground-subtle transition-transform duration-[var(--duration-fast)] opacity-0 group-hover:opacity-100',
                      open ? 'rotate-180' : '',
                      !open && 'opacity-100',
                    )}
                  />
                </button>
              )}
              <div
                className={cn(
                  'overflow-hidden transition-[grid-template-rows] duration-[var(--duration-base)] ease-[var(--ease-standard)] grid',
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink key={item.label} item={item} collapsed={collapsed} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 flex-shrink-0 space-y-1">
        <button
          onClick={onLogout}
          className={cn(
            'flex items-center w-full px-3 py-2.5 rounded-lg text-sm text-foreground-muted hover:text-error hover:bg-error/10 transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed && 'justify-center',
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </button>
        <Link
          href="/"
          className={cn(
            'flex items-center px-3 py-2.5 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors duration-[var(--duration-fast)]',
            collapsed && 'justify-center',
          )}
        >
          <ChevronRight className="h-4 w-4 flex-shrink-0 rotate-180" />
          {!collapsed && <span className="ml-3">Back to Store</span>}
        </Link>
      </div>
    </aside>
  );
}
