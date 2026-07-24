'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Check, ChevronRight, Lock, CreditCard, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { ordersApi, paymentsApi } from '@/lib/api';
import { StripePaymentForm } from '@/components/store/StripePaymentForm';
import { AddressAutocomplete, type ParsedAddress } from '@/components/shared/AddressAutocomplete';
import { cn } from '@/lib/utils/cn';

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

interface AddressForm {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  countryCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, couponDiscount, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
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
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AddressForm>();

  const availablePaymentMethods = isDigitalOnly ? PAYMENT_METHODS.filter((pm) => pm.id !== 'cod') : PAYMENT_METHODS;

  const subtotal = getSubtotal();
  const shippingCost = isDigitalOnly ? 0 : (subtotal >= 150 ? 0 : (SHIPPING_OPTIONS.find((o) => o.id === shippingOption)?.price ?? 15));
  const total = Math.max(0, subtotal + shippingCost - couponDiscount);

  const stepIndex = (s: Step) => STEPS.findIndex((st) => st.key === s);
  const currentIndex = stepIndex(currentStep);

  const onAddressSubmit = (data: AddressForm) => {
    setAddressData(data);
    setCurrentStep(isDigitalOnly ? 'payment' : 'shipping');
  };

  const placeOrder = async () => {
    if (!addressData) return;
    setIsPlacing(true);
    setPaymentError(null);
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
      };
      const orderRes = await ordersApi.create(orderData);
      const order = (orderRes.data as { data?: { id: string } }).data;

      if (paymentMethod === 'card' && order?.id) {
        const intentRes = await paymentsApi.createIntent({ orderId: order.id, method: 'stripe', currency: 'AED' });
        const secret = (intentRes.data as { data?: { metadata?: { clientSecret?: string } } }).data?.metadata?.clientSecret;
        if (secret) {
          setClientSecret(secret);
          setIsPlacing(false);
          return;
        }
        setPaymentError('Card payments are not configured yet. Please choose Cash on Delivery.');
        setIsPlacing(false);
        return;
      }

      clearCart();
      router.push('/en/order-success');
    } catch {
      setPaymentError("We couldn't place your order — please check your details and try again. Your cart has been kept safe.");
    } finally {
      setIsPlacing(false);
    }
  };

  const handleCardPaymentSuccess = () => {
    clearCart();
    router.push('/en/order-success');
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
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-8">
      {/* Steps indicator */}
      <div className="flex items-center justify-center mb-10 overflow-x-auto px-1">
        {STEPS.map(({ key, label, icon: Icon }, i) => (
          <div key={key} className="flex items-center shrink-0">
            <div className={cn(
              'flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full text-sm font-medium transition-colors',
              i <= currentIndex ? 'bg-accent/10 text-accent' : 'text-foreground-muted',
            )}>
              <div className={cn(
                'h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold',
                i < currentIndex ? 'bg-accent text-white' : i === currentIndex ? 'bg-accent text-white' : 'bg-background-tertiary text-foreground-muted',
              )}>
                {i < currentIndex ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className="hidden sm:inline whitespace-nowrap">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 shrink-0 text-foreground-subtle mx-0.5 sm:mx-1" />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Step: Contact (digital-only carts — no shipping address needed) */}
          {currentStep === 'contact' && (
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-heading text-xl font-bold mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" /> Contact Details
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
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" /> Delivery Address
              </h2>
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
                <AddressAutocomplete
                  label="Address Line 1"
                  placeholder="Start typing your address…"
                  error={errors.addressLine1?.message}
                  onTextChange={(v) => setValue('addressLine1', v, { shouldValidate: true })}
                  onPlaceSelected={(place: ParsedAddress) => {
                    setValue('addressLine1', place.addressLine1, { shouldValidate: true });
                    setValue('city', place.city, { shouldValidate: true });
                    if (place.countryCode) setValue('countryCode', place.countryCode);
                  }}
                />
                <input type="hidden" {...register('addressLine1', { required: 'Required' })} />
                <Input label="Address Line 2 (optional)" placeholder="Apartment, Floor"
                  {...register('addressLine2')} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" error={errors.city?.message}
                    {...register('city', { required: 'Required' })} />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
                    <select {...register('countryCode')}
                      className="w-full rounded-lg border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-ring/40 transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)]"
                    >
                      <option value="AE">🇦🇪 United Arab Emirates</option>
                      <option value="SA">🇸🇦 Saudi Arabia</option>
                      <option value="QA">🇶🇦 Qatar</option>
                      <option value="KW">🇰🇼 Kuwait</option>
                      <option value="BH">🇧🇭 Bahrain</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                  Continue to Shipping
                </Button>
              </form>
            </div>
          )}

          {/* Step: Shipping */}
          {currentStep === 'shipping' && (
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" /> Shipping Method
              </h2>
              <div className="space-y-3 mb-6">
                {SHIPPING_OPTIONS.map((opt) => (
                  <label key={opt.id} className={cn(
                    'flex flex-wrap items-center justify-between gap-2 p-4 rounded-xl border cursor-pointer transition-colors',
                    shippingOption === opt.id ? 'border-accent bg-accent/5' : 'border-border hover:border-border-hover',
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
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" /> Payment Method
              </h2>
              <div className="space-y-3 mb-6">
                {availablePaymentMethods.map((pm) => (
                  <label key={pm.id} className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                    paymentMethod === pm.id ? 'border-accent bg-accent/5' : 'border-border hover:border-border-hover',
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
                <div className="border border-border rounded-xl p-4 mb-6">
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
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" /> Review Your Order
              </h2>
              {addressData && (
                <div className="mb-5 p-4 rounded-xl bg-background-tertiary">
                  <p className="text-xs font-semibold text-foreground-subtle uppercase mb-2">
                    {isDigitalOnly ? 'Contact' : 'Delivery To'}
                  </p>
                  <p className="text-sm font-medium">{addressData.firstName} {addressData.lastName}</p>
                  {!isDigitalOnly && (
                    <p className="text-sm text-foreground-muted">{addressData.addressLine1}, {addressData.city}</p>
                  )}
                  <p className="text-sm text-foreground-muted">{addressData.phone}</p>
                  {isDigitalOnly && (
                    <p className="text-sm text-accent mt-1">🎁 Delivered instantly by email — no shipping needed</p>
                  )}
                </div>
              )}
              <div className="space-y-2 mb-5">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-foreground-muted line-clamp-1 flex-1 mr-4">{item.name} ×{item.quantity}</span>
                    <span className="font-medium">{format((item.salePrice ?? item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-accent">{format(total)}</span>
                </div>
              </div>
              {paymentError && (
                <div className="flex items-start gap-2.5 p-3 mb-4 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
                  <span>{paymentError}</span>
                </div>
              )}

              {clientSecret ? (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm font-bold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-accent" /> Secure card payment
                  </h3>
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    returnUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/en/order-success`}
                    onSuccess={handleCardPaymentSuccess}
                  />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCurrentStep('payment')}>Back</Button>
                  <Button variant="primary" size="xl" className="flex-1" onClick={placeOrder} isLoading={isPlacing}>
                    <Lock className="h-4 w-4" /> Place Order
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl bg-card border border-border p-5">
            <h3 className="font-heading text-lg font-bold mb-4">Your Order</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm gap-3">
                  <span className="text-foreground-muted line-clamp-1 flex-1">{item.name} ×{item.quantity}</span>
                  <span className="font-medium flex-shrink-0">{format((item.salePrice ?? item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Subtotal</span>
                <span>{format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Shipping</span>
                <span className={shippingCost === 0 ? 'text-success' : ''}>
                  {isDigitalOnly ? 'Digital — N/A' : shippingCost === 0 ? 'Free' : format(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-accent">{format(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}