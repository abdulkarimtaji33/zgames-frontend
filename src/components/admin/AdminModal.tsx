'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
  wide?: boolean;
}

export function AdminModal({ open, title, onClose, onSubmit, submitLabel = 'Save', isSubmitting, children, wide }: AdminModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 mega-menu-backdrop animate-fade-in" onClick={onClose} />
      <div
        data-transition-panel
        data-state="open"
        className={`relative bg-card border border-border rounded-xl shadow-lg w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-heading font-bold text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="p-1.5 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-5">{children}</div>
        {onSubmit && (
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-border flex-shrink-0 bg-background-secondary/40 rounded-b-xl">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={onSubmit} isLoading={isSubmitting}>{submitLabel}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
