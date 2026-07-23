'use client';

import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const sideClasses: Record<NonNullable<TooltipProps['side']>, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/** Shown on hover or focus (not click) for supplementary info. */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={visible ? id : undefined}>{children}</span>
      <span
        role="tooltip"
        id={id}
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-surface-3 border border-border px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md transition-[opacity,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)]',
          sideClasses[side],
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
