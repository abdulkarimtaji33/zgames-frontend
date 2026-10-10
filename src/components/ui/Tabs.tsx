'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/** Underline-indicator tab list. Controlled if `value`/`onChange` are given, else uncontrolled. */
export function Tabs({ items, value, defaultValue, onChange, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;

  const select = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };

  return (
    <div role="tablist" className={cn('flex items-center gap-1 border-b border-border overflow-x-auto', className)}>
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => select(item.value)}
            className={cn(
              'relative flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-md',
              isActive ? 'text-accent' : 'text-foreground-muted hover:text-foreground',
            )}
          >
            {item.icon}
            {item.label}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
