'use client';

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function FormField({ label, children, className, hint, error, required }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-error">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3 w-3 flex-shrink-0" /> {error}</p>
      ) : hint ? (
        <p className="text-xs text-foreground-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/** Groups related fields under a titled section with an optional description — use to break long forms into scannable chunks. */
export function FormSection({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-4 pt-5 first:pt-0 border-t border-border first:border-t-0', className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-foreground-muted mt-0.5">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export const formInputClass =
  'w-full px-3 py-2.5 rounded-lg bg-background-tertiary border border-border text-sm text-foreground placeholder:text-foreground-subtle transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed hover:border-border-hover';

export const formSelectClass = cn(formInputClass, 'cursor-pointer');

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, className, ...rest } = props;
  return <input {...rest} className={cn(formInputClass, error && 'border-error focus:border-error focus:ring-error/20', className)} />;
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  const { error, className, ...rest } = props;
  return (
    <div className="relative">
      <select
        {...rest}
        className={cn(formSelectClass, 'appearance-none pr-9', error && 'border-error focus:border-error focus:ring-error/20', className)}
      />
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" viewBox="0 0 20 20" fill="none">
        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  const { error, className, ...rest } = props;
  return <textarea {...rest} className={cn(formInputClass, 'min-h-[90px] resize-y leading-relaxed', error && 'border-error focus:border-error focus:ring-error/20', className)} />;
}

export function FormCheckbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none group">
      <input type="checkbox" {...props} className="accent-accent h-4 w-4 rounded cursor-pointer" />
      <span className="text-sm text-foreground group-hover:text-accent transition-colors">{label}</span>
    </label>
  );
}
