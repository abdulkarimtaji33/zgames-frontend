'use client';

import { useAdminToast } from '@/hooks/useAdminToast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-error/30 bg-error/10 text-error',
  info: 'border-accent/30 bg-accent/10 text-accent',
};

export function AdminToastContainer() {
  const { toasts, dismiss } = useAdminToast();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={cn('flex items-start gap-2 p-3 rounded-lg border shadow-lg text-sm', styles[t.type])}>
            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
          </div>
        );
      })}
    </div>
  );
}
