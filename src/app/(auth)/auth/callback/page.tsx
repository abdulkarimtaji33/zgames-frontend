'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { authApi, customerApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const code = searchParams.get('code');
    if (!code) {
      setError('Missing sign-in code.');
      return;
    }

    (async () => {
      try {
        const res = await authApi.exchangeOAuthCode(code);
        const { accessToken, refreshToken } = res.data.data;
        setAuth(accessToken, refreshToken);
        try {
          const profile = await customerApi.getProfile();
          setAuth(accessToken, refreshToken, profile.data.data);
        } catch { /* profile fetch is best-effort */ }
        router.replace('/en');
      } catch {
        setError('That sign-in link has expired or already been used — please try signing in again.');
      }
    })();
  }, [searchParams, setAuth, router]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl text-center">
        {error ? (
          <>
            <AlertCircle className="h-8 w-8 text-error mx-auto mb-3" />
            <p className="text-sm text-foreground-muted mb-4">{error}</p>
            <Link href="/en/login" className="text-sm font-medium text-accent hover:underline">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-foreground-muted">Signing you in…</p>
          </>
        )}
      </div>
    </div>
  );
}
