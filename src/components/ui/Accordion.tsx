'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface AccordionItemData {
  value: string;
  trigger: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, defaultOpen = [], allowMultiple = false, className }: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);

  const toggle = (value: string) => {
    setOpen((prev) => {
      const isOpen = prev.includes(value);
      if (isOpen) return prev.filter((v) => v !== value);
      return allowMultiple ? [...prev, value] : [value];
    });
  };

  return (
    <div className={cn('divide-y divide-border rounded-lg border border-border bg-card', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.value);
        return (
          <div key={item.value}>
            <button
              onClick={() => toggle(item.value)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-foreground hover:bg-background-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.trigger}
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-[var(--duration-base)]', isOpen && 'rotate-180')}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-[max-height,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)]',
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className="px-4 pb-4 text-sm text-foreground-muted">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
