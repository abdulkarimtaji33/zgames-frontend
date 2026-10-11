'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi, customerApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await authApi.login(data.email, data.password);
      const { accessToken, refreshToken } = res.data.data;
      setAuth(accessToken, refreshToken);
      // Fetch profile after setting token
      try {
        const profile = await customerApi.getProfile();
        setAuth(accessToken, refreshToken, profile.data.data);
      } catch { /* profile fetch is best-effort */ }
      router.push('/en');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? "That email or password didn't match — try again, or reset your password below.");
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-sm text-foreground-muted">Sign in to your CGA Games account</p>
        </div>

        {/* Google is the only social login — a real OAuth flow via the backend's
            passport-google strategy (src/app/(auth)/auth/callback handles the
            redirect back with an exchange code). */}
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/auth/google`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 mb-6 rounded-lg border border-border bg-background-tertiary hover:bg-card-hover hover:border-border-hover transition-colors text-sm font-medium"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </a>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-foreground-subtle">or continue with email</span>
          <div className="flex-1 h-px bg-border" />
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
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
            })}
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <div className="flex justify-end mt-1.5">
              <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-foreground-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent font-medium hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
