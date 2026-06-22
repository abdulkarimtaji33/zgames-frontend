import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded border bg-background-secondary px-3 py-2.5 text-sm text-foreground',
              'placeholder:text-foreground-subtle',
              'border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
              'transition-colors duration-150',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-error focus:border-error focus:ring-error',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-foreground-muted">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
