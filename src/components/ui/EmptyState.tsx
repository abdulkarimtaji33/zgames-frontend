import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { ArcadeConfettiBurst } from '@/components/skins/arcade/ArcadeConfettiBurst';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('relative flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center overflow-hidden', className)}>
      <ArcadeConfettiBurst />
      {Icon && (
        <div className="skin-icon-well relative grid h-14 w-14 place-items-center rounded-full bg-background-tertiary text-foreground-subtle">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div className="relative space-y-1">
        <p className="font-heading text-lg font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-foreground-muted max-w-sm">{description}</p>}
      </div>
      {action && <div className="relative">{action}</div>}
    </div>
  );
}
