'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import type { NavSection } from './Sidebar';

interface FlatEntry {
  label: string;
  href: string;
  group: string;
}

function flattenSections(sections: NavSection[]): FlatEntry[] {
  const out: FlatEntry[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      if (item.href) out.push({ label: item.label, href: item.href, group: section.label });
      if (item.children) {
        for (const child of item.children) {
          out.push({ label: `${item.label} / ${child.label}`, href: child.href, group: section.label });
        }
      }
    }
  }
  return out;
}

interface CommandPaletteProps {
  sections: NavSection[];
}

/** Global Ctrl/Cmd+K quick-navigation palette covering every admin section. */
export function CommandPalette({ sections }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo(() => flattenSections(sections), [sections]);

  const results = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter((e) => e.label.toLowerCase().includes(q) || e.group.toLowerCase().includes(q));
  }, [entries, query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    const onOpenEvent = () => setOpen(true);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('admin:open-command-palette', onOpenEvent);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('admin:open-command-palette', onOpenEvent);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) navigate(target.href);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 mega-menu-backdrop animate-fade-in" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-lg rounded-xl bg-card border border-border shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-foreground-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jump to a section..."
            aria-label="Search admin sections"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
          />
          <kbd className="hidden sm:inline-block text-[10px] text-foreground-subtle border border-border rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-1.5">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-foreground-muted">No matching section.</p>
          ) : (
            results.map((entry, i) => (
              <button
                key={entry.href}
                onClick={() => navigate(entry.href)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                  i === activeIndex ? 'bg-accent/10 text-accent' : 'text-foreground hover:bg-background-tertiary'
                }`}
              >
                <span>{entry.label}</span>
                <span className="text-xs text-foreground-subtle">{entry.group}</span>
              </button>
            ))
          )}
        </div>
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[11px] text-foreground-subtle">
          <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> Navigate</span>
          <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> Select</span>
        </div>
      </div>
    </div>
  );
}
