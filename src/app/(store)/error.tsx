'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Catches unhandled render/client errors anywhere under the storefront route
 * group (home, category, PDP, cart, checkout, etc.) so a crash shows a
 * friendly retry screen instead of a blank/broken page or the browser's own
 * "This page couldn't load" fallback. Next keeps the surrounding layout
 * (header/footer) mounted — this only replaces the page content.
 */
export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Storefront render error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-error/10 text-error">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="font-heading text-xl font-bold text-foreground">Something went wrong</h1>
      <p className="text-sm text-foreground-muted">
        That page hit an unexpected error. It&apos;s usually temporary — try again, or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
        <Link href="/en">
          <Button variant="secondary">Back to homepage</Button>
        </Link>
      </div>
    </div>
  );
}
