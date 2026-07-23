'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, Copy, Check, Clock } from 'lucide-react';
import { giftCardsApi, type DeliveredGiftCardItem } from '@/lib/api';

function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-md hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors flex-shrink-0"
      title="Copy code"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export default function GiftCardsPage() {
  const [items, setItems] = useState<DeliveredGiftCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    giftCardsApi.findMyCodes()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap gap-3 justify-between">
        <h1 className="font-heading text-2xl font-bold">My Gift Card Codes</h1>
        <Link href="/en/category/gift-cards" className="text-sm text-accent hover:underline">
          Buy more gift cards →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-10 text-center shadow-sm">
          <Gift className="h-12 w-12 text-foreground-subtle mx-auto mb-3" />
          <p className="text-foreground-muted mb-1">You haven&apos;t purchased any digital gift cards yet.</p>
          <p className="text-sm text-foreground-subtle mb-4">Buy a PlayStation, Xbox, Steam or other digital gift card and your redemption code will appear here right after payment.</p>
          <Link href="/en/category/gift-cards" className="inline-block px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
            Browse Gift Cards
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const productName = (item.productSnapshot as { name?: string })?.name ?? 'Gift Card';
            const codes = item.deliveredCodes ?? [];
            const isPending = item.fulfillmentStatus === 'pending' || (item.fulfillmentStatus === 'partial' && codes.length < item.quantity);
            return (
              <div key={item.id} className="rounded-2xl bg-gradient-to-br from-accent/20 to-background-secondary border border-accent/20 p-5 shadow-sm">
                <div className="flex items-center flex-wrap gap-2 justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wide min-w-0">
                    <Gift className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{productName}</span>
                  </span>
                  <span className="text-xs text-foreground-subtle flex-shrink-0">Order #{item.orderNumber}</span>
                </div>

                {codes.length > 0 ? (
                  <div className="space-y-2 mb-2">
                    {codes.map((code, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 bg-background/40 rounded-lg px-3 py-2">
                        <code className="font-mono text-sm font-bold tracking-wider truncate">{code}</code>
                        <CodeCopyButton code={code} />
                      </div>
                    ))}
                  </div>
                ) : null}

                {isPending && (
                  <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2 mt-2">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      {codes.length > 0
                        ? `${item.quantity - codes.length} more code(s) on the way — we'll email you shortly.`
                        : `Your code is being processed and will be emailed to you shortly.`}
                    </span>
                  </div>
                )}

                <p className="text-xs text-foreground-subtle mt-3">
                  Purchased {new Date(item.orderCreatedAt).toLocaleDateString()} · Qty {item.quantity}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
        <p className="text-sm text-foreground-muted">
          Redemption codes are emailed to you automatically right after payment. If you can&apos;t find the email, your codes will also always be available here.
        </p>
      </div>
    </div>
  );
}
