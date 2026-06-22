'use client';

import { useState } from 'react';
import { Package, Search, CheckCircle2, Clock, Truck, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/types';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!orderNumber.trim() || !email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await ordersApi.trackByNumber(orderNumber.trim(), email.trim());
      setOrder(res.data.data);
    } catch {
      setError('Order not found. Please check your order number and email.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <Package className="h-14 w-14 text-accent mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-foreground-muted">Enter your order number and email to see the status.</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4 mb-6">
          <Input label="Order Number" placeholder="ZG-XXXXX-XXXX"
            value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
          <Input label="Email Address" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          <Button variant="primary" size="lg" className="w-full" onClick={handleTrack} isLoading={loading}>
            <Search className="h-4 w-4" /> Track Order
          </Button>
        </div>

        {order && (
          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex justify-between mb-6">
              <div>
                <p className="text-xs text-foreground-muted">Order Number</p>
                <p className="font-bold text-lg">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground-muted">Total</p>
                <p className="font-bold text-lg text-accent">AED {Number(order.total).toFixed(2)}</p>
              </div>
            </div>

            {/* Status timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {STATUS_STEPS.map((status, i) => {
                  const done = i <= currentStepIndex;
                  const current = i === currentStepIndex;
                  return (
                    <div key={status} className={`relative flex items-center gap-4 pl-10 ${done ? '' : 'opacity-40'}`}>
                      <div className={`absolute left-0 h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                        done ? (current ? 'bg-accent' : 'bg-success') : 'bg-background-tertiary border border-border'
                      }`}>
                        {done && !current ? <CheckCircle2 className="h-4 w-4 text-white" /> :
                         current ? <Clock className="h-4 w-4 text-white" /> :
                         <div className="h-2 w-2 rounded-full bg-foreground-subtle" />}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${current ? 'text-accent' : done ? 'text-foreground' : 'text-foreground-muted'}`}>
                          {STATUS_LABELS[status]}
                        </p>
                        {current && <p className="text-xs text-foreground-muted">Current status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}