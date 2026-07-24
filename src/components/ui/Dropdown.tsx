'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';

interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

/** Click-triggered menu; fully keyboard-navigable (Arrow keys, Enter, Escape). */
export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);

  const closeAndReturnFocus = () => {
    setOpen(false);
    triggerElRef.current?.focus();
  };

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) triggerElRef.current = document.activeElement as HTMLElement;
      return next;
    });
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAndReturnFocus();
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // WAI-ARIA menu-button pattern: move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return;
    const firstItem = panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])');
    firstItem?.focus();
  }, [open]);

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'),
    );
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      // Tabbing out of the menu should close it, matching the menu-button pattern.
      setOpen(false);
    }
  };

  // Close (without stealing focus back — the activating click/Enter already
  // moved focus appropriately) once a menu item has been activated.
  const onMenuClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[role="menuitem"]')) {
      closeAndReturnFocus();
    }
  };

  return (
    <div className="relative inline-block" ref={rootRef}>
      {trigger({ open, toggle })}
      <div
        ref={panelRef}
        role="menu"
        data-transition-panel
        data-state={open ? 'open' : 'closed'}
        onKeyDown={onMenuKeyDown}
        onClick={onMenuClick}
        className={cn(
          'absolute z-40 mt-2 min-w-[10rem] rounded-lg border border-border bg-surface-2 shadow-lg py-1.5',
          align === 'right' ? 'right-0' : 'left-0',
          !open && 'pointer-events-none',
          className,
        )}
      >
        {open && children}
      </div>
    </div>
  );
}

export function DropdownItem({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      role="menuitem"
      tabIndex={-1}
      className={cn(
        'flex w-full items-center gap-2 px-3.5 py-2 text-sm text-foreground text-left hover:bg-background-tertiary focus-visible:bg-background-tertiary focus-visible:outline-none transition-colors duration-[var(--duration-fast)]',
        className,
      )}
      {...props}
    />
  );
}
