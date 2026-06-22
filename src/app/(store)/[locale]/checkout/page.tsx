'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Check, ChevronRight, Lock, CreditCard, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { ordersApi } from '@/lib/api';
import { cn } from '@/lib/utils/cn';

type Step = 'address' | 'shipping' | 'payment' | 'review';

const STEPS: { key: Step; label: string; icon: typeof MapPin }[] = [
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'shipping', label: 'Shipping', icon: Package },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: Check },
];

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

  const [currentStep, setCurrentStep] = useState<Step>('address');
  const [shippingOption, setShippingOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isPlacing, setIsPlacing] = useState(false);
  const [addressData, setAddressData] = useState<AddressForm | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>();

  const subtotal = getSubtotal();
  const shippingCost = subtotal >= 150 ? 0 : (SHIPPING_OPTIONS.find((o) => o.id === shippingOption)?.price ?? 15);
  const total = subtotal + shippingCost - couponDiscount;

  const stepIndex = (s: Step) => STEPS.findIndex((st) => st.key === s);
  const currentIndex = stepIndex(currentStep);

  const onAddressSubmit = (data: AddressForm) => {
    setAddressData(data);
    setCurrentStep('shipping');
  };

  const placeOrder = async () => {
    if (!addressData) return;
    setIsPlacing(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: i.salePrice ?? i.price,
        })),
        shippingAddress: addressData,
        shippingCost: shippingCost,
        currencyCode: 'AED',
        countryCode: addressData.countryCode,
        paymentMethod,
      };
      await ordersApi.create(orderData);
      clearCart();
      router.push('/en/order-success');
    } catch {
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (items.length === 0) {
    router.push('/en/cart');
    return null;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-8">
      {/* Steps indicator */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map(({ key, label, icon: Icon }, i) => (
          <div key={key} className="flex items-center">
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors',
              i <= currentIndex ? 'bg-accent/10 text-accent' : 'text-foreground-muted',
            )}>
              <div className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold',
                i < currentIndex ? 'bg-accent text-white' : i === currentIndex ? 'bg-accent text-white' : 'bg-background-tertiary text-foreground-muted',
              )}>
                {i < currentIndex ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-foreground-subtle mx-1" />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
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
                <Input label="Address Line 1" placeholder="Building, Street"
                  error={errors.addressLine1?.message}
                  {...register('addressLine1', { required: 'Required' })} />
                <Input label="Address Line 2 (optional)" placeholder="Apartment, Floor"
                  {...register('addressLine2')} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" error={errors.city?.message}
                    {...register('city', { required: 'Required' })} />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
                    <select {...register('countryCode')}
                      className="w-full rounded border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
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
                    'flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors',
                    shippingOption === opt.id ? 'border-accent bg-accent/5' : 'border-border hover:border-border-hover',
                  )}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" value={opt.id} checked={shippingOption === opt.id}
                        onChange={() => setShippingOption(opt.id)} className="accent-accent" />
                      <div>
                        <p className="font-medium text-foreground">{opt.label}</p>
                        <p className="text-sm text-foreground-muted">{opt.description}</p>
                      </div>
                    </div>
                    <span className={cn('font-bold', opt.price === 0 ? 'text-success' : 'text-foreground')}>
                      {opt.price === 0 ? 'Free' : format(opt.price)}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
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
                {PAYMENT_METHODS.map((pm) => (
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
                <div className="border border-border rounded-xl p-4 mb-6 space-y-3">
                  <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Expiry" placeholder="MM / YY" />
                    <Input label="CVV" placeholder="123" type="password" />
                  </div>
                  <Input label="Name on Card" placeholder="John Doe" />
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCurrentStep('shipping')}>Back</Button>
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
                  <p className="text-xs font-semibold text-foreground-subtle uppercase mb-2">Delivery To</p>
                  <p className="text-sm font-medium">{addressData.firstName} {addressData.lastName}</p>
                  <p className="text-sm text-foreground-muted">{addressData.addressLine1}, {addressData.city}</p>
                  <p className="text-sm text-foreground-muted">{addressData.phone}</p>
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
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCurrentStep('payment')}>Back</Button>
                <Button variant="primary" size="xl" className="flex-1" onClick={placeOrder} isLoading={isPlacing}>
                  <Lock className="h-4 w-4" /> Place Order
                </Button>
              </div>
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
                <span className={shippingCost === 0 ? 'text-success' : ''}>{shippingCost === 0 ? 'Free' : format(shippingCost)}</span>
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