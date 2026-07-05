'use client';

import { cn } from '@/lib/utils/cn';

export interface AdminTab {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  disabledHint?: string;
}

interface AdminTabsProps {
  tabs: AdminTab[];
  active: string;
  onChange: (id: string) => void;
}

export function AdminTabs({ tabs, active, onChange }: AdminTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          disabled={tab.disabled}
          title={tab.disabled ? tab.disabledHint : undefined}
          onClick={() => !tab.disabled && onChange(tab.id)}
          className={cn(
            'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
            tab.disabled
              ? 'text-foreground-subtle cursor-not-allowed'
              : active === tab.id
                ? 'text-accent'
                : 'text-foreground-muted hover:text-foreground',
          )}
        >
          {tab.label}
          {tab.count != null && (
            <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-bold', active === tab.id ? 'bg-accent/10 text-accent' : 'bg-background-tertiary text-foreground-muted')}>
              {tab.count}
            </span>
          )}
          {active === tab.id && !tab.disabled && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
