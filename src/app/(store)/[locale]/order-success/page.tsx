'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight, MapPin, CreditCard, Receipt, Mail, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { ordersApi } from '@/lib/api';
import { ORDER_SUCCESS_STORAGE_KEY, type OrderSuccessSummary } from '@/lib/orderSuccess';
import type { Order } from '@/types';

function readStoredSummary(orderId: string | null): OrderSuccessSummary | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ORDER_SUCCESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrderSuccessSummary;
    // Only show the stored summary if it matches the order we just got redirected for
    // (or if there's no orderId in the URL, fall back to whatever was last stored).
    if (!orderId || parsed.id === orderId) return parsed;
    return null;
  } catch {
    // malformed/unavailable sessionStorage — page still works without a summary
    return null;
  }
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { isAuthenticated } = useAuthStore();
  const { format } = useCurrencyStore();
  const [summary] = useState<OrderSuccessSummary | null>(() => readStoredSummary(orderId));
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<'checking' | 'known' | 'unknown'>('checking');
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fulfillment and email delivery happen asynchronously right after payment confirms, so the
  // order may not have its status-history notes yet the instant this page loads. Poll briefly
  // instead of asserting anything happened before we've actually verified it did.
  useEffect(() => {
    if (!isAuthenticated || !orderId) {
      setDeliveryStatus('unknown');
      return;
    }
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await ordersApi.findByCustomer(1);
        const found = res.data.data.items.find((o) => o.id === orderId) ?? null;
        if (cancelled) return;
        if (found) {
          setOrder(found);
          const hasEmailNote = (found.statusHistory ?? []).some((h) => h.isCustomerVisible && /email/i.test(h.note ?? ''));
          if (hasEmailNote || found.paymentStatus !== 'pending' && attempts >= 4) {
            setDeliveryStatus(hasEmailNote ? 'known' : 'unknown');
            return;
          }
        }
        if (attempts < 8) {
          pollTimer.current = setTimeout(poll, 2500);
        } else {
          setDeliveryStatus('unknown');
        }
      } catch {
        if (!cancelled) setDeliveryStatus('unknown');
      }
    };
    poll();

    return () => {
      cancelled = true;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [isAuthenticated, orderId]);

  const emailNotes = (order?.statusHistory ?? [])
    .filter((h) => h.isCustomerVisible && /email/i.test(h.note ?? ''))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Guests get redirected to /login by the (customer) layout if we send them to /orders,
  // so point unauthenticated shoppers to the public guest tracking page instead.
  const trackOrderHref = isAuthenticated ? '/orders' : '/en/track-order';

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-20 text-center">
      <div className="max-w-lg mx-auto">
        <div className="h-20 w-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6 animate-fade-in">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 className="font-heading text-4xl font-bold mb-3 animate-slide-up">Order Placed!</h1>
        <p className="text-foreground-muted text-lg mb-2 animate-slide-up">Thank you for your purchase.</p>
        {summary?.orderNumber && (
          <p className="text-sm font-medium text-accent mb-2 animate-slide-up">Order #{summary.orderNumber}</p>
        )}
        {isAuthenticated ? (
          <div className="mb-8 animate-slide-up">
            {deliveryStatus === 'checking' && (
              <p className="flex items-center justify-center gap-2 text-sm text-foreground-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Confirming payment and checking email delivery…
              </p>
            )}
            {deliveryStatus === 'known' && emailNotes.length > 0 && (
              <div className="space-y-1.5">
                {emailNotes.map((n) => (
                  <p key={n.id} className="flex items-center justify-center gap-2 text-sm text-success font-medium">
                    <Mail className="h-4 w-4" /> {n.note}
                  </p>
                ))}
              </div>
            )}
            {deliveryStatus === 'unknown' && (
              <p className="flex items-center justify-center gap-2 text-sm text-warning font-medium">
                <AlertTriangle className="h-4 w-4" /> We couldn&apos;t yet confirm your email was sent — check{' '}
                <Link href={trackOrderHref} className="underline">Track My Order</Link> shortly for the latest status.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-foreground-muted mb-8 animate-slide-up">
            You checked out as a guest — email delivery can&apos;t be confirmed here. Contact support with your order number if you don&apos;t receive anything.
          </p>
        )}

        {summary && (
          <div className="text-left rounded-2xl bg-card border border-border p-6 mb-8 animate-slide-up">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground-subtle mb-4 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-accent" /> Order Summary
            </h2>

            <div className="space-y-2 mb-4">
              {summary.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-foreground-muted line-clamp-1 flex-1 mr-4">{item.name} ×{item.quantity}</span>
                  <span className="font-medium">{format(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-1.5 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Subtotal</span>
                <span>{format(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Shipping</span>
                <span className={summary.shippingCost === 0 ? 'text-success' : ''}>
                  {summary.isDigitalOnly ? 'Digital — N/A' : summary.shippingCost === 0 ? 'Free' : format(summary.shippingCost)}
                </span>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Coupon discount</span>
                  <span className="text-success">-{format(summary.discount)}</span>
                </div>
              )}
              {summary.storeCreditUsed > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Store credit applied</span>
                  <span className="text-success">-{format(summary.storeCreditUsed)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1.5">
                <span>Total</span>
                <span className="text-accent">{format(summary.total)}</span>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-2.5">
              {summary.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-foreground-subtle mt-0.5 shrink-0" />
                  <span className="text-foreground-muted">
                    {summary.address.firstName} {summary.address.lastName}, {summary.address.addressLine1}, {summary.address.city}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-foreground-subtle shrink-0" />
                <span className="text-foreground-muted">{summary.paymentMethodLabel}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
          <Link href={trackOrderHref} className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors">
            <Package className="h-4 w-4" /> Track My Order
          </Link>
          <Link href="/en" className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-background-tertiary border border-border text-foreground font-semibold hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
