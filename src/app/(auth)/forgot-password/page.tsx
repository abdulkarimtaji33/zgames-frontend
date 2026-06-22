'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';

type Step = 'email' | 'sent';

interface EmailForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmailForm>();

  const onSubmit = async (data: EmailForm) => {
    setServerError('');
    try {
      await authApi.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setStep('sent');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-card border border-border p-8 shadow-2xl">
        {step === 'email' ? (
          <>
            <div className="text-center mb-8">
              <div className="h-14 w-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <h1 className="font-heading text-3xl font-bold mb-2">Forgot Password?</h1>
              <p className="text-sm text-foreground-muted">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {serverError && (
              <div className="flex items-start gap-2.5 p-3 mb-4 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-3">Check Your Email</h2>
            <p className="text-sm text-foreground-muted mb-2">
              We&apos;ve sent a password reset link to:
            </p>
            <p className="font-medium text-foreground mb-6">{submittedEmail}</p>
            <p className="text-xs text-foreground-muted mb-6">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => { setStep('email'); setServerError(''); }}
                className="text-accent hover:underline"
              >
                try again
              </button>.
            </p>
          </div>
        )}

        <div className="text-center mt-4">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
