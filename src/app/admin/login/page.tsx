'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminAuthApi } from '@/lib/api/adminApi';
import { useAdminAuthStore } from '@/store/adminAuthStore';

interface LoginForm {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAdminAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: 'admin@zgames.ae', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await adminAuthApi.login(data.email, data.password);
      const { accessToken, refreshToken } = res.data.data;
      setAuth(accessToken, refreshToken);
      try {
        const profile = await adminAuthApi.me();
        setAuth(accessToken, refreshToken, profile.data.data);
      } catch { /* profile fetch is best-effort */ }
      router.push('/admin');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent mb-4">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">Admin Sign In</h1>
          <p className="text-sm text-foreground-muted">ZGames administration panel</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-8 shadow-2xl">
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
              placeholder="admin@zgames.ae"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
              })}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword((s) => !s)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isSubmitting}>
              Sign In to Admin
            </Button>
          </form>

          <p className="text-center text-sm text-foreground-muted mt-6">
            <Link href="/" className="text-accent font-medium hover:underline">
              Back to store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
