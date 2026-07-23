'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const PASSWORD_RULES = [
  { label: 'At least 8 characters', check: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', check: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', check: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [password, setPassword] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const watchedPassword = watch('password', '');

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      const res = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });
      const { accessToken, refreshToken } = res.data.data;
      setAuth(accessToken, refreshToken);
      router.push('/en');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-2xl bg-card border border-border p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-sm text-foreground-muted">Join CGA Games and start gaming</p>
        </div>

        {serverError && (
          <div className="flex items-start gap-2.5 p-3 mb-4 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.firstName?.message}
              {...register('firstName', { required: 'First name is required' })}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName', { required: 'Last name is required' })}
            />
          </div>

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

          <Input
            label="Phone Number (optional)"
            type="tel"
            placeholder="+971 50 123 4567"
            leftIcon={<Phone className="h-4 w-4" />}
            {...register('phone')}
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword((s) => !s)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
                onChange: (e) => setPassword(e.target.value),
              })}
            />
            {/* Password strength */}
            {watchedPassword && (
              <div className="mt-2 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.check(watchedPassword);
                  return (
                    <div key={rule.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-success' : 'text-foreground-subtle'}`}>
                      <CheckCircle2 className={`h-3 w-3 ${ok ? 'text-success' : 'text-foreground-subtle'}`} />
                      <span>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowConfirm((s) => !s)} tabIndex={-1}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === watch('password') || 'Passwords do not match',
            })}
          />

          <div className="flex items-start gap-2.5 mt-2">
            <input
              type="checkbox"
              id="agreeTerms"
              className="mt-0.5 h-4 w-4 rounded border-border accent-accent cursor-pointer"
              {...register('agreeTerms', { required: 'You must agree to the terms' })}
            />
            <label htmlFor="agreeTerms" className="text-sm text-foreground-muted leading-snug cursor-pointer">
              I agree to the{' '}
              <Link href="/en/terms" className="text-accent hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/en/privacy" className="text-accent hover:underline">Privacy Policy</Link>
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-error -mt-2">{errors.agreeTerms.message}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-foreground-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
