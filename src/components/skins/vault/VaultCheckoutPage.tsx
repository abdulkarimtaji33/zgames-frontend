'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Check, ChevronDown, Lock, CreditCard, MapPin, Package, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { ordersApi, paymentsApi } from '@/lib/api';
import { StripePaymentForm } from '@/components/store/StripePaymentForm';
import { AddressBookStep, type CheckoutAddress } from '@/components/checkout/AddressBookStep';
import { cn } from '@/lib/utils/cn';
import { getShippingCost } from '@/lib/shipping';
import { ORDER_SUCCESS_STORAGE_KEY, type OrderSuccessSummary } from '@/lib/orderSuccess';

/**
 * VaultCheckoutPage — restyled as a calm single-focus flow: a vertical
 * step rail down the left (desktop) replaces the horizontal pill stepper,
 * and the order summary becomes a sticky glowing "ledger" panel. ALL
 * functional logic below — state, effects, handlers, the Stripe
 * integration, order creation, idempotency key, store credit math — is
 * copied verbatim from the previous checkout implementation. Only the
 * surrounding JSX/classNames were restructured.
 */

type Step = 'address' | 'shipping' | 'contact' | 'payment' | 'review';

const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', description: '2–5 business days', price: 15, free: false },
  { id: 'express', label: 'Express Delivery', description: 'Next business day', price: 35, free: false },
  { id: 'free', label: 'Free Shipping', description: '3–7 business days', price: 0, free: true },
];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'tabby', label: 'Tabby – Pay in 4', icon: '🔵', badge: 'Interest Free' },
  { id: 'tamara', label: 'Tamara – Buy Now Pay Later', icon: '🟢', badge: '3 Months' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
];

type AddressForm = CheckoutAddress;

export function VaultCheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, couponDiscount, clearCart } = useCartStore();
  const { isAuthenticated, customer } = useAuthStore();
  const { format } = useCurrencyStore();

  const isDigitalOnly = items.length > 0 && items.every((i) => i.type === 'gift_card' || i.type === 'digital');

  const STEPS = useMemo(() => (
    isDigitalOnly
      ? [
          { key: 'contact' as Step, label: 'Contact', icon: MapPin },
          { key: 'payment' as Step, label: 'Payment', icon: CreditCard },
          { key: 'review' as Step, label: 'Review', icon: Check },
        ]
      : [
          { key: 'address' as Step, label: 'Address', icon: MapPin },
          { key: 'shipping' as Step, label: 'Shipping', icon: Package },
          { key: 'payment' as Step, label: 'Payment', icon: CreditCard },
          { key: 'review' as Step, label: 'Review', icon: Check },
        ]
  ), [isDigitalOnly]);

  const [currentStep, setCurrentStep] = useState<Step>(isDigitalOnly ? 'contact' : 'address');
  const [shippingOption, setShippingOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isPlacing, setIsPlacing] = useState(false);
  const [addressData, setAddressData] = useState<AddressForm | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [paymentConfirmState, setPaymentConfirmState] = useState<'idle' | 'confirming' | 'confirmed' | 'failed'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [useStoreCredit, setUseStoreCredit] = useState(true);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; orderNumber?: string } | null>(null);

  // Stable idempotency key: generated once when the customer reaches Review,
  // and reused across retries so a failed payment-intent request never causes
  // ordersApi.create() to spawn a duplicate order.
  const idempotencyKeyRef = useRef<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>();

  // Contact-only form (digital carts) has no address book — just prefill the
  // logged-in customer's name/phone once auth state has hydrated from storage.
  useEffect(() => {
    if (customer) {
      reset({ firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone ?? '', addressLine1: '', city: '', countryCode: 'AE' });
    }
  }, [customer, reset]);

  const availablePaymentMethods = isDigitalOnly ? PAYMENT_METHODS.filter((pm) => pm.id !== 'cod') : PAYMENT_METHODS;

  const subtotal = getSubtotal();
  const shippingCost = isDigitalOnly ? 0 : getShippingCost(subtotal, SHIPPING_OPTIONS.find((o) => o.id === shippingOption)?.price ?? 15);
  const storeCreditBalance = customer?.walletBalance ?? 0;
  const preCreditTotal = Math.max(0, subtotal + shippingCost - couponDiscount);
  const storeCreditApplied = isAuthenticated && useStoreCredit && storeCreditBalance > 0
    ? Math.min(storeCreditBalance, preCreditTotal)
    : 0;
  const total = Math.max(0, preCreditTotal - storeCreditApplied);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const stepIndex = (s: Step) => STEPS.findIndex((st) => st.key === s);
  const currentIndex = stepIndex(currentStep);

  const onAddressSubmit = (data: AddressForm) => {
    setAddressData(data);
    setCurrentStep(isDigitalOnly ? 'payment' : 'shipping');
  };

  useEffect(() => {
    if (currentStep === 'review' && !idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }
  }, [currentStep]);

  const persistOrderSuccessSummary = (order: { id: string; orderNumber?: string }) => {
    if (!addressData) return;
    const summary: OrderSuccessSummary = {
      id: order.id,
      orderNumber: order.orderNumber,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        lineTotal: (i.salePrice ?? i.price) * i.quantity,
      })),
      subtotal,
      shippingCost,
      discount: couponDiscount,
      storeCreditUsed: storeCreditApplied,
      total,
      address: isDigitalOnly ? null : {
        firstName: addressData.firstName,
        lastName: addressData.lastName,
        addressLine1: addressData.addressLine1,
        city: addressData.city,
        phone: addressData.phone,
      },
      paymentMethodLabel: PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label ?? paymentMethod,
      isDigitalOnly,
    };
    try {
      sessionStorage.setItem(ORDER_SUCCESS_STORAGE_KEY, JSON.stringify(summary));
    } catch {
      // sessionStorage unavailable — order-success page will just show a generic confirmation
    }
  };

  const placeOrder = async () => {
    if (!addressData) return;
    if (!agreedToTerms) {
      setTermsError('Please agree to the Terms & Return Policy to continue.');
      return;
    }
    setTermsError(null);
    setIsPlacing(true);
    setPaymentError(null);
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }
    try {
      const orderData = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: i.salePrice ?? i.price,
        })),
        shippingAddress: isDigitalOnly
          ? { ...addressData, addressLine1: 'Digital delivery — no shipping required', city: 'N/A' }
          : addressData,
        shippingCost: shippingCost,
        currencyCode: 'AED',
        countryCode: addressData.countryCode,
        paymentMethod,
        idempotencyKey: idempotencyKeyRef.current,
        storeCreditUsed: storeCreditApplied,
      };
      const orderRes = await ordersApi.create(orderData);
      const order = (orderRes.data as { data?: { id: string; orderNumber?: string } }).data;
      if (order?.id) {
        setCreatedOrder(order);
        // Persist as soon as the order exists (not just after payment) so a full-page
        // Stripe redirect (e.g. 3D Secure) that returns straight to order-success
        // still has a summary to show.
        persistOrderSuccessSummary(order);
      }

      if (paymentMethod === 'card' && order?.id) {
        const intentRes = await paymentsApi.createIntent({ orderId: order.id, method: 'stripe', currency: 'AED' });
        const intentData = (intentRes.data as { data?: { id?: string; metadata?: { clientSecret?: string } } }).data;
        const secret = intentData?.metadata?.clientSecret;
        if (secret) {
          setClientSecret(secret);
          setPendingPaymentId(intentData?.id ?? null);
          setIsPlacing(false);
          return;
        }
        setPaymentError('Card payments are not configured yet. Please choose Cash on Delivery.');
        setIsPlacing(false);
        return;
      }

      clearCart();
      router.push(`/en/order-success${order?.id ? `?orderId=${order.id}` : ''}`);
    } catch {
      setPaymentError("We couldn't place your order — please check your details and try again. Your cart has been kept safe.");
    } finally {
      setIsPlacing(false);
    }
  };

  const handleCardPaymentSuccess = async () => {
    setPaymentConfirmState('confirming');
    // The Stripe webhook is a no-op on this environment (no STRIPE_WEBHOOK_SECRET configured),
    // so nothing else marks the order paid or triggers gift-card fulfillment/email. Confirm
    // directly from the client once Stripe itself has reported success.
    let confirmed = false;
    if (pendingPaymentId) {
      confirmed = await paymentsApi.confirm({ paymentId: pendingPaymentId }).then(() => true).catch(() => false);
    }
    setPaymentConfirmState(confirmed ? 'confirmed' : 'failed');
    clearCart();
    setTimeout(() => {
      router.push(`/en/order-success${createdOrder?.id ? `?orderId=${createdOrder.id}` : ''}`);
    }, confirmed ? 1400 : 2200);
  };

  useEffect(() => {
    if (items.length === 0) {
      router.push('/en/cart');
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
      {/* Mobile compact step indicator */}
      <div className="flex lg:hidden items-center justify-center mb-8 overflow-x-auto px-1 gap-1">
        {STEPS.map(({ key, label, icon: Icon }, i) => (
          <div key={key} className="flex items-center shrink-0">
            <div className={cn(
              'flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full text-sm font-medium transition-colors',
              i <= currentIndex ? 'bg-accent/10 text-[color:var(--color-action)]' : 'text-foreground-muted',
            )}>
              <div className={cn(
                'h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold',
                i <= currentIndex ? 'bg-accent text-white' : 'bg-surface-2 text-foreground-muted',
              )}>
                {i < currentIndex ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className="hidden sm:inline whitespace-nowrap">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="h-px w-4 bg-border mx-0.5" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[180px_1fr_360px] gap-8 lg:gap-10">
        {/* Desktop vertical step rail */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            {STEPS.map(({ key, label, icon: Icon }, i) => (
              <div key={key} className="relative pl-9 pb-7 last:pb-0">
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute left-[15px] top-8 bottom-0 w-px"
                    style={{ background: i < currentIndex ? 'var(--color-action)' : 'var(--border)', opacity: i < currentIndex ? 0.5 : 1 }}
                  />
                )}
                <div
                  className={cn(
                    'absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    i < currentIndex ? 'bg-accent text-white' : i === currentIndex ? 'bg-accent text-white shadow-[var(--shadow-glow)]' : 'bg-surface-2 text-foreground-subtle',
                  )}
                >
                  {i < currentIndex ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <p className={cn('text-sm font-medium pt-1.5', i === currentIndex ? 'text-foreground' : 'text-foreground-muted')}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div>
          {/* Step: Contact (digital-only carts — no shipping address needed) */}
          {currentStep === 'contact' && (
            <div className="skin-card-frame rounded-xl bg-surface-1 p-6">
              <h2 className="font-heading text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-[color:var(--color-action)]" /> Contact Details
              </h2>
              <p className="text-sm text-foreground-muted mb-6">
                Your order is fully digital — no shipping address needed. We&apos;ll email your code(s) right after payment.
              </p>
              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" error={errors.firstName?.message}
                    {...register('firstName', { required: 'Required' })} />
                  <Input label="Last Name" error={errors.lastName?.message}
                    {...register('lastName', { required: 'Required' })} />
                </div>
                <Input label="Phone Number" type="tel" placeholder="+971 50 123 4567"
                  error={errors.phone?.message}
                  {...register('phone', { required: 'Required' })} />
                <input type="hidden" value="AE" {...register('countryCode')} />
                <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                  Continue to Payment
                </Button>
              </form>
            </div>
          )}

          {/* Step: Address */}
          {currentStep === 'address' && (
            <div className="skin-card-frame rounded-xl bg-surface-1 p-6">
              <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-[color:var(--color-action)]" /> Delivery Address
              </h2>
              <AddressBookStep onContinue={onAddressSubmit} submitLabel="Continue to Shipping" />
            </div>
          )}

          {/* Step: Shipping */}
          {currentStep === 'shipping' && (
            <div className="skin-card-frame rounded-xl bg-surface-1 p-6">
              <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Package className="h-5 w-5 text-[color:var(--color-action)]" /> Shipping Method
              </h2>
              <div className="space-y-3 mb-6">
                {SHIPPING_OPTIONS.map((opt) => (
                  <label key={opt.id} className={cn(
                    'flex flex-wrap items-center justify-between gap-2 p-4 rounded-md border cursor-pointer transition-colors',
                    shippingOption === opt.id ? 'border-[color:var(--color-action)] bg-accent/5' : 'border-border hover:border-border-hover',
                  )}>
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="radio" name="shipping" value={opt.id} checked={shippingOption === opt.id}
                        onChange={() => setShippingOption(opt.id)} className="accent-accent shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{opt.label}</p>
                        <p className="text-sm text-foreground-muted">{opt.description}</p>
                      </div>
                    </div>
                    <span className={cn('font-bold shrink-0', opt.price === 0 ? 'text-success' : 'text-foreground')}>
                      {opt.price === 0 ? 'Free' : format(opt.price)}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCurrentStep('address')}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" onClick={() => setCurrentStep('payment')}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {currentStep === 'payment' && (
            <div className="skin-card-frame rounded-xl bg-surface-1 p-6">
              <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-[color:var(--color-action)]" /> Payment Method
              </h2>
              <div className="space-y-3 mb-6">
                {availablePaymentMethods.map((pm) => (
                  <label key={pm.id} className={cn(
                    'flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-colors',
                    paymentMethod === pm.id ? 'border-[color:var(--color-action)] bg-accent/5' : 'border-border hover:border-border-hover',
                  )}>
                    <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)} className="accent-accent" />
                    <span className="text-xl">{pm.icon}</span>
                    <span className="font-medium text-foreground flex-1">{pm.label}</span>
                    {pm.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30 font-medium">
                        {pm.badge}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              {paymentMethod === 'card' && (
                <div className="skin-plate p-4 mb-6">
                  <p className="text-sm text-foreground-muted">
                    You&apos;ll enter your card details securely on the next step, powered by Stripe.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCurrentStep(isDigitalOnly ? 'contact' : 'shipping')}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" onClick={() => setCurrentStep('review')}>Review Order</Button>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {currentStep === 'review' && (
            <div className="skin-card-frame rounded-xl bg-surface-1 p-6">
              <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <Check className="h-5 w-5 text-[color:var(--color-action)]" /> Review Your Order
              </h2>
              {addressData && (
                <div className="skin-plate mb-5 p-4">
                  <p className="text-xs font-semibold text-foreground-subtle uppercase mb-2">
                    {isDigitalOnly ? 'Contact' : 'Delivery To'}
                  </p>
                  <p className="text-sm font-medium text-foreground">{addressData.firstName} {addressData.lastName}</p>
                  {!isDigitalOnly && (
                    <p className="text-sm text-foreground-muted">{addressData.addressLine1}, {addressData.city}</p>
                  )}
                  <p className="text-sm text-foreground-muted">{addressData.phone}</p>
                  {isDigitalOnly && (
                    <p className="text-sm text-[color:var(--color-action)] mt-1">🎁 Delivered instantly by email — no shipping needed</p>
                  )}
                </div>
              )}
              <div className="space-y-2 mb-5">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-foreground-muted line-clamp-1 flex-1 mr-4">{item.name} ×{item.quantity}</span>
                    <span className="font-medium text-foreground">{format((item.salePrice ?? item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {isAuthenticated && storeCreditBalance > 0 && (
                <label className="flex items-start gap-3 p-3 mb-4 rounded-md border border-success/30 bg-success/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useStoreCredit}
                    onChange={(e) => setUseStoreCredit(e.target.checked)}
                    className="accent-success mt-0.5 shrink-0"
                  />
                  <span className="text-sm flex-1">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Wallet className="h-4 w-4 text-success" /> Use store credit
                    </span>
                    <span className="text-foreground-muted">
                      You have {format(storeCreditBalance)} available{useStoreCredit && storeCreditApplied > 0 ? ` — applying ${format(storeCreditApplied)}` : ''}.
                    </span>
                  </span>
                </label>
              )}

              <div className="skin-divider mb-4" />
              <div className="mb-6 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Subtotal</span>
                  <span className="text-foreground">{format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Shipping</span>
                  <span className={shippingCost === 0 ? 'text-success' : 'text-foreground'}>
                    {isDigitalOnly ? 'Digital — N/A' : shippingCost === 0 ? 'Free' : format(shippingCost)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Coupon discount</span>
                    <span className="text-success">-{format(couponDiscount)}</span>
                  </div>
                )}
                {storeCreditApplied > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Store credit applied</span>
                    <span className="text-success">-{format(storeCreditApplied)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-1.5">
                  <span className="text-foreground">Total</span>
                  <span className="skin-glow-text">{format(total)}</span>
                </div>
              </div>

              {paymentError && (
                <div className="flex items-start gap-2.5 p-3 mb-4 rounded-md bg-error/10 border border-error/30 text-sm text-error">
                  <span>{paymentError}</span>
                </div>
              )}

              {paymentConfirmState !== 'idle' ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                  {paymentConfirmState === 'confirming' && (
                    <>
                      <span className="h-10 w-10 animate-spin rounded-full border-2 border-[color:var(--color-action)] border-t-transparent" />
                      <p className="font-medium text-foreground">Confirming your payment…</p>
                    </>
                  )}
                  {paymentConfirmState === 'confirmed' && (
                    <>
                      <Check className="h-10 w-10 text-success" />
                      <p className="font-heading text-lg font-bold text-success">Payment Successful</p>
                      <p className="text-sm text-foreground-muted">Redirecting to your order…</p>
                    </>
                  )}
                  {paymentConfirmState === 'failed' && (
                    <>
                      <p className="font-heading text-lg font-bold text-error">Payment went through, but we couldn&apos;t confirm the order</p>
                      <p className="text-sm text-foreground-muted">Your card was charged by Stripe, but confirming it with us failed. Contact support with your order number — redirecting you now.</p>
                    </>
                  )}
                </div>
              ) : clientSecret ? (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm font-bold flex items-center gap-2 text-foreground">
                    <Lock className="h-4 w-4 text-[color:var(--color-action)]" /> Secure card payment
                  </h3>
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    returnUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/en/order-success${createdOrder?.id ? `?orderId=${createdOrder.id}` : ''}`}
                    onSuccess={handleCardPaymentSuccess}
                  />
                </div>
              ) : (
                <div>
                  <label className="flex items-start gap-2.5 mb-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) setTermsError(null); }}
                      className="accent-accent mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-foreground-muted">
                      I agree to the{' '}
                      <a href="/en/terms" target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-action)] hover:underline font-medium">Terms</a>
                      {' '}&amp;{' '}
                      <a href="/en/terms#returns" target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-action)] hover:underline font-medium">Return Policy</a>
                    </span>
                  </label>
                  {termsError && (
                    <p className="text-xs text-error mb-3 -mt-2">{termsError}</p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCurrentStep('payment')}>Back</Button>
                    <Button variant="primary" size="xl" className="flex-1" onClick={placeOrder} isLoading={isPlacing} disabled={!agreedToTerms}>
                      <Lock className="h-4 w-4" /> Place Order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order summary sidebar (desktop) — glowing ledger panel */}
        <div className="hidden lg:block">
          <div className="sticky top-24 skin-card-frame rounded-xl bg-surface-1 p-5 shadow-[var(--shadow-lg)]">
            <h3 className="font-heading text-lg font-bold mb-4 text-foreground">Your Order</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm gap-3">
                  <span className="text-foreground-muted line-clamp-1 flex-1">{item.name} ×{item.quantity}</span>
                  <span className="font-medium text-foreground flex-shrink-0">{format((item.salePrice ?? item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="skin-divider mb-3" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Subtotal</span>
                <span className="text-foreground">{format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Shipping</span>
                <span className={shippingCost === 0 ? 'text-success' : 'text-foreground'}>
                  {isDigitalOnly ? 'Digital — N/A' : shippingCost === 0 ? 'Free' : format(shippingCost)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Coupon discount</span>
                  <span className="text-success">-{format(couponDiscount)}</span>
                </div>
              )}
              {storeCreditApplied > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Store credit applied</span>
                  <span className="text-success">-{format(storeCreditApplied)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1">
                <span className="text-foreground">Total</span>
                <span className="skin-glow-text">{format(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile order summary — sticky collapsible bar, visible on every step */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-1 border-t border-border shadow-[var(--shadow-lg)]">
        {mobileSummaryOpen && (
          <div className="px-4 pt-4 pb-1 max-h-[45vh] overflow-y-auto border-b border-border">
            <div className="space-y-2 mb-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm gap-3">
                  <span className="text-foreground-muted line-clamp-1 flex-1">{item.name} ×{item.quantity}</span>
                  <span className="font-medium text-foreground flex-shrink-0">{format((item.salePrice ?? item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 pb-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Subtotal</span>
                <span className="text-foreground">{format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Shipping</span>
                <span className={shippingCost === 0 ? 'text-success' : 'text-foreground'}>
                  {isDigitalOnly ? 'Digital — N/A' : shippingCost === 0 ? 'Free' : format(shippingCost)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Coupon discount</span>
                  <span className="text-success">-{format(couponDiscount)}</span>
                </div>
              )}
              {storeCreditApplied > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Store credit applied</span>
                  <span className="text-success">-{format(storeCreditApplied)}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => setMobileSummaryOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:-outline-offset-2"
          aria-expanded={mobileSummaryOpen}
        >
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground-muted">
            <ChevronDown className={cn('h-4 w-4 transition-transform', mobileSummaryOpen && 'rotate-180')} />
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
          <span className="font-bold skin-glow-text">{format(total)}</span>
        </button>
      </div>
      {/* Spacer so the fixed mobile summary bar doesn't overlap page content */}
      <div className="lg:hidden h-16" />
    </div>
  );
}
