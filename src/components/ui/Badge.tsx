import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-background-tertiary text-foreground-muted',
        accent: 'bg-accent text-white',
        orange: 'bg-accent-orange text-white',
        success: 'bg-success/20 text-success border border-success/30',
        warning: 'bg-warning/20 text-warning border border-warning/30',
        error: 'bg-error/20 text-error border border-error/30',
        info: 'bg-info/20 text-info border border-info/30',
        outline: 'border border-border text-foreground-muted',
        new: 'bg-success text-white',
        sale: 'bg-accent text-white',
        preorder: 'bg-viz-4 text-white',
        comingsoon: 'bg-accent-orange text-white',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
