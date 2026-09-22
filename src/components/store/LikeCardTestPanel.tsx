'use client';

import { useState } from 'react';
import { adminAuthApi, adminLikeCardApi } from '@/lib/api/adminApi';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { Button } from '@/components/ui/Button';

/**
 * TEMPORARY dev-only widget for manually exercising the LikeCard sandbox test-purchase flow
 * from the storefront home page. Logs in as the seeded admin and pulls a real (but non-charging)
 * test gift-card code. Remove before this goes anywhere near a real launch — see LikeCardController,
 * which explicitly marks these endpoints as never customer-facing.
 */
export function LikeCardTestPanel() {
  const { accessToken, setAuth } = useAdminAuthStore();
  const [productId, setProductId] = useState('1311');
  const [productIds, setProductIds] = useState<string[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ensureLoggedIn = async () => {
    if (accessToken) return;
    const res = await adminAuthApi.login('admin@cgagames.com', 'admin123');
    const { accessToken: token, refreshToken } = res.data.data;
    setAuth(token, refreshToken);
  };

  const loadProductIds = async () => {
    setError(null);
    try {
      await ensureLoggedIn();
      const res = await adminLikeCardApi.testProductIds();
      setProductIds(res.data.data.productIds);
    } catch {
      setError('Could not load test product IDs.');
    }
  };

  const runTestPurchase = async () => {
    setLoading(true);
    setError(null);
    setCode(null);
    try {
      await ensureLoggedIn();
      const res = await adminLikeCardApi.testPurchase(productId);
      setCode(res.data.data.code);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Test purchase failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-14 reveal">
      <div className="rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
          Dev only — LikeCard sandbox test card
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            onFocus={loadProductIds}
            className="rounded-lg bg-background-tertiary border border-border px-3 py-2 text-sm"
          >
            <option value={productId}>{productId}</option>
            {productIds.filter((id) => id !== productId).map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          <Button variant="primary" size="md" onClick={runTestPurchase} disabled={loading}>
            {loading ? 'Requesting...' : 'Get test card'}
          </Button>
        </div>
        {code && (
          <p className="mt-4 text-sm">
            Code: <code className="rounded bg-background-tertiary px-2 py-1 font-mono text-accent">{code}</code>
          </p>
        )}
        {error && <p className="mt-4 text-sm text-error">{error}</p>}
      </div>
    </section>
  );
}
