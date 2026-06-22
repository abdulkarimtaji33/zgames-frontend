import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeUp?: boolean;
  icon: React.ReactNode;
  color?: string;
  className?: string;
}

export function StatCard({ title, value, change, changeUp, icon, color = 'text-accent', className }: StatCardProps) {
  return (
    <div className={cn('rounded-xl bg-card border border-border p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-foreground-muted font-medium">{title}</p>
        <div className={cn('h-9 w-9 rounded-full bg-background-tertiary flex items-center justify-center', color)}>
          {icon}
        </div>
      </div>
      <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
      {change && (
        <p className={cn('text-xs mt-1 font-medium', changeUp ? 'text-success' : 'text-error')}>
          {changeUp ? '▲' : '▼'} {change} vs last month
        </p>
      )}
    </div>
  );
}