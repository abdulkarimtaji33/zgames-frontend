'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface StripePaymentFormProps {
  clientSecret: string;
  returnUrl: string;
  onSuccess: () => void;
}

function CheckoutForm({ returnUrl, onSuccess }: { returnUrl: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed. Please check your card details and try again.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      onSuccess();
    } else {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
          <span>{error}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px transition-colors disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
      >
        {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {submitting ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, returnUrl, onSuccess }: StripePaymentFormProps) {
  if (!stripePromise) {
    return (
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
        Card payments are not configured yet. Please choose Cash on Delivery, or contact support.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat' } }}>
      <CheckoutForm returnUrl={returnUrl} onSuccess={onSuccess} />
    </Elements>
  );
}
