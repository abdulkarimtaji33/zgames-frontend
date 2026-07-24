'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Eye, MoreVertical } from 'lucide-react';

interface CrudActionsProps {
  viewHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CrudActions({ viewHref, onEdit, onDelete }: CrudActionsProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <>
      {/* Inline icon row — visible from small breakpoint up */}
      <div className="hidden sm:flex items-center gap-0.5">
        {viewHref && (
          <Link href={viewHref}>
            <button className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" title="View" aria-label="View">
              <Eye className="h-3.5 w-3.5" />
            </button>
          </Link>
        )}
        {onEdit && (
          <button onClick={onEdit} className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" title="Edit" aria-label="Edit">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" title="Delete" aria-label="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Compact dropdown — mobile only, avoids forcing horizontal table scroll */}
      <div className="relative sm:hidden" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Actions"
          aria-label="Actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-border bg-card shadow-xl py-1">
            {viewHref && (
              <Link href={viewHref} onClick={() => setOpen(false)}>
                <span className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background-tertiary text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Eye className="h-3.5 w-3.5" /> View
                </span>
              </Link>
            )}
            {onEdit && (
              <button
                onClick={() => { setOpen(false); onEdit(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background-tertiary text-foreground text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => { setOpen(false); onDelete(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-error/10 text-error text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
