import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatTileProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down' };
  className?: string;
}

export function StatTile({ label, value, icon: Icon, trend, className }: StatTileProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 shadow-sm skin-card-frame', className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-foreground-subtle" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
        {trend && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-semibold',
              trend.direction === 'up' ? 'text-success' : 'text-error',
            )}
          >
            {trend.direction === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
