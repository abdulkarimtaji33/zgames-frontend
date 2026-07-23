'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, Tag, Gift } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { couponsApi } from '@/lib/api';

export default function CartPage() {
  const { items, updateQuantity, removeItem, couponCode, couponDiscount, applyCoupon, removeCoupon, getSubtotal, getItemCount } = useCartStore();
  const { format } = useCurrencyStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const subtotal = getSubtotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const discount = couponDiscount;
  const total = subtotal + shipping - discount;
  const itemCount = getItemCount();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await couponsApi.validate(couponInput.trim().toUpperCase(), subtotal);
      applyCoupon(couponInput.trim().toUpperCase(), res.data.data.discount);
    } catch {
      setCouponError('Invalid or expired coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-20 text-center animate-fade-in">
        <div className="h-24 w-24 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-11 w-11 text-foreground-subtle" />
        </div>
        <h1 className="font-heading text-3xl font-bold mb-3">Your Cart is Empty</h1>
        <p className="text-foreground-muted mb-8">Looks like you haven&apos;t added anything yet — browse our catalog to find your next favorite game.</p>
        <Link href="/en">
          <Button variant="primary" size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">
        Shopping Cart <span className="text-foreground-muted text-lg font-normal">({itemCount} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? ''}`} className="flex gap-4 p-4 rounded-xl bg-card border border-border transition-shadow hover:shadow-md">
              {/* Image */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-background-tertiary overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🎮</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/en/products/${item.slug}`} className="font-medium text-foreground hover:text-accent transition-colors line-clamp-2 text-sm md:text-base">
                  {item.name}
                </Link>
                {item.platform && (
                  <p className="text-xs text-foreground-muted mt-0.5">{item.platform}</p>
                )}
                <div className="flex flex-wrap items-center justify-between mt-3 gap-2 sm:gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-border rounded-full overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      aria-label={item.quantity <= 1 ? 'Remove item' : 'Decrease quantity'}
                      className="px-3 py-1.5 text-foreground-muted hover:text-foreground hover:bg-background-tertiary active:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-semibold min-w-[2rem] text-center tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="px-3 py-1.5 text-foreground-muted hover:text-foreground hover:bg-background-tertiary active:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-accent">
                      {format((item.salePrice ?? item.price) * item.quantity)}
                    </span>
                    {item.salePrice && (
                      <span className="text-sm text-foreground-subtle line-through hidden sm:inline">
                        {format(item.price * item.quantity)}
                      </span>
                    )}
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      aria-label="Remove from cart"
                      className="text-foreground-subtle hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="rounded-xl bg-card border border-border p-5">
            <h2 className="font-heading text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Subtotal ({itemCount} items)</span>
                <span className="font-medium">{format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Shipping</span>
                <span className={shipping === 0 ? 'text-success font-medium' : 'font-medium'}>
                  {shipping === 0 ? 'Free' : format(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-accent" />
                    Coupon ({couponCode})
                    <button onClick={removeCoupon} aria-label="Remove coupon" className="text-foreground-subtle hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors ml-1 text-xs">✕</button>
                  </span>
                  <span className="text-success font-medium">-{format(discount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-xl text-accent">{format(total)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <div className="text-xs text-info mb-4 p-2.5 rounded-lg bg-info/10 border border-info/30">
                💡 Add <strong>{format(150 - subtotal)}</strong> more for free shipping
              </div>
            )}

            <Link href="/en/checkout">
              <Button variant="primary" size="lg" className="w-full">Proceed to Checkout</Button>
            </Link>

            {/* Coupon */}
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-accent" /> Have a coupon?
              </p>
              {!couponCode && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1"
                    error={couponError}
                  />
                  <Button variant="secondary" size="md" onClick={handleApplyCoupon} isLoading={couponLoading}>
                    Apply
                  </Button>
                </div>
              )}
              {couponCode && (
                <div className="flex items-center gap-2 p-2 rounded bg-success/10 border border-success/30 text-sm text-success">
                  <Gift className="h-4 w-4" />
                  <span>{couponCode} applied!</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment methods */}
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-xs text-foreground-muted mb-2">Secure checkout with:</p>
            <div className="flex flex-wrap gap-1.5">
              {['VISA', 'MC', 'Tabby', 'Tamara', 'COD'].map((m) => (
                <span key={m} className="px-2 py-0.5 rounded bg-background-tertiary border border-border text-xs text-foreground-muted">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}