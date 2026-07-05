'use client';

import { AdminModal } from './AdminModal';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  destructive?: boolean;
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, isLoading, destructive }: ConfirmDialogProps) {
  return (
    <AdminModal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-foreground-muted mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant={destructive ? 'primary' : 'primary'} size="sm" onClick={onConfirm} isLoading={isLoading}
          className={destructive ? 'bg-error hover:bg-error/90' : ''}>
          Confirm
        </Button>
      </div>
    </AdminModal>
  );
}
