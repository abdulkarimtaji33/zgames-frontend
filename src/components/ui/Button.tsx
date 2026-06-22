import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-white hover:bg-accent-hover active:scale-95 btn-glow',
        secondary:
          'bg-background-tertiary text-foreground border border-border hover:border-border-hover hover:bg-card-hover active:scale-95',
        ghost:
          'text-foreground-muted hover:text-foreground hover:bg-background-tertiary active:scale-95',
        outline:
          'border border-accent text-accent hover:bg-accent hover:text-white active:scale-95',
        danger:
          'bg-red-600 text-white hover:bg-red-700 active:scale-95',
        link:
          'text-accent underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg font-semibold',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';
