import { cn } from '@/lib/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className, width, height, rounded, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', rounded ? 'rounded-full' : 'rounded', className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden">
      <Skeleton height={200} className="rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton height={16} width="80%" />
        <Skeleton height={14} width="60%" />
        <Skeleton height={20} width="40%" />
      </div>
    </div>
  );
}
