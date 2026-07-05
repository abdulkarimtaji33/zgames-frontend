'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Package, Truck, Clock, Gift, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AdminModal } from '@/components/admin/AdminModal';
import { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormField';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminOrdersApi } from '@/lib/api/adminApi';
import type { Order, OrderItem } from '@/types';

interface OrderDetail extends Order {
  customerId?: string | null;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: Record<string, string>;
  discountAmount?: number;
  taxAmount?: number;
}

interface TimelineEntry {
  id: string;
  status: string;
  note?: string | null;
  createdAt: string;
  isCustomerVisible?: boolean;
}

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'returned',
];

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useAdminToast((s) => s.show);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isAddingShipment, setIsAddingShipment] = useState(false);
  const [fulfillCodeInputs, setFulfillCodeInputs] = useState<Record<string, string>>({});
  const [fulfillingItemId, setFulfillingItemId] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [orderRes, timelineRes] = await Promise.all([
        adminOrdersApi.findOne(id),
        adminOrdersApi.getTimeline(id),
      ]);
      const data = orderRes.data.data as OrderDetail;
      setOrder(data);
      setNewStatus(data.status);
      const tl = timelineRes.data?.data ?? timelineRes.data ?? [];
      setTimeline(Array.isArray(tl) ? tl : []);
    } catch {
      toast('Failed to load order', 'error');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleUpdateStatus = async () => {
    if (!id || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await adminOrdersApi.updateStatus(id, { status: newStatus });
      toast('Order status updated', 'success');
      await loadOrder();
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      await adminOrdersApi.cancel(id, cancelReason || undefined);
      toast('Order cancelled', 'success');
      setShowCancel(false);
      setCancelReason('');
      await loadOrder();
    } catch {
      toast('Failed to cancel order', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAddShipment = async () => {
    if (!id || !carrier || !trackingNumber) {
      toast('Carrier and tracking number are required', 'error');
      return;
    }
    setIsAddingShipment(true);
    try {
      await adminOrdersApi.addShipment(id, { carrier, trackingNumber });
      toast('Shipment added', 'success');
      setCarrier('');
      setTrackingNumber('');
      await loadOrder();
    } catch {
      toast('Failed to add shipment', 'error');
    } finally {
      setIsAddingShipment(false);
    }
  };

  const handleManualFulfill = async (itemId: string) => {
    if (!id) return;
    const code = (fulfillCodeInputs[itemId] ?? '').trim();
    if (!code) {
      toast('Enter a redemption code', 'error');
      return;
    }
    setFulfillingItemId(itemId);
    try {
      await adminOrdersApi.fulfillGiftCardManually(id, itemId, code);
      toast('Code assigned and emailed to the customer', 'success');
      setFulfillCodeInputs((prev) => ({ ...prev, [itemId]: '' }));
      await loadOrder();
    } catch {
      toast('Failed to assign code', 'error');
    } finally {
      setFulfillingItemId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground-muted mb-4">Order not found.</p>
        <Link href="/admin/orders">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress;
  const customerName = order.customer
    ? `${order.customer.firstName ?? ''} ${order.customer.lastName ?? ''}`.trim()
    : addr
      ? `${addr.firstName ?? ''} ${addr.lastName ?? ''}`.trim()
      : 'Guest';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-foreground-muted">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? 'default'} size="sm">
          {order.status.toUpperCase()}
        </Badge>
        <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'} size="sm">
          {order.paymentStatus}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl bg-card border border-border p-5">
            <h2 className="font-heading font-bold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-accent" /> Items
            </h2>
            <div className="divide-y divide-border">
              {(order.items ?? []).map((item: OrderItem) => {
                const snapshot = item.productSnapshot as { name?: string; sku?: string; type?: string } | undefined;
                const isGiftCard = snapshot?.type === 'gift_card';
                const needsFulfillment = isGiftCard && (item.fulfillmentStatus === 'pending' || item.fulfillmentStatus === 'partial');
                return (
                  <div key={item.id} className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-1.5">
                          {isGiftCard && <Gift className="h-3.5 w-3.5 text-accent" />}
                          {snapshot?.name ?? item.productId.slice(0, 8)}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          SKU: {snapshot?.sku ?? '—'} · Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-accent">
                          {order.currency} {Number(item.totalPrice).toFixed(2)}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {order.currency} {Number(item.unitPrice).toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {isGiftCard && (item.deliveredCodes?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.deliveredCodes!.map((code, i) => (
                          <code key={i} className="text-xs font-mono px-2 py-1 rounded bg-background-tertiary border border-border">{code}</code>
                        ))}
                      </div>
                    )}

                    {needsFulfillment && (
                      <div className="mt-2 rounded-lg border border-warning/30 bg-warning/10 p-3">
                        <p className="text-xs text-warning font-medium mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {(item.deliveredCodes?.length ?? 0)} of {item.quantity} code(s) delivered — out of stock, needs manual code
                        </p>
                        <div className="flex gap-2">
                          <input
                            value={fulfillCodeInputs[item.id] ?? ''}
                            onChange={(e) => setFulfillCodeInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Paste redemption code"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-background-tertiary border border-border text-xs font-mono focus:outline-none focus:border-accent"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleManualFulfill(item.id)}
                            isLoading={fulfillingItemId === item.id}
                          >
                            Assign & Email
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {(order.items ?? []).length === 0 && (
                <p className="text-sm text-foreground-muted py-4">No items in this order.</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Subtotal</span>
                <span>{order.currency} {Number(order.subtotal).toFixed(2)}</span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Discount</span>
                  <span>-{order.currency} {Number(order.discountAmount).toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-foreground-muted">Shipping</span>
                <span>{order.currency} {Number(order.shippingAmount).toFixed(2)}</span>
              </div>
              {order.taxAmount ? (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Tax</span>
                  <span>{order.currency} {Number(order.taxAmount).toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total</span>
                <span className="text-accent">{order.currency} {Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-card border border-border p-5">
            <h2 className="font-heading font-bold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" /> Timeline
            </h2>
            {timeline.length === 0 ? (
              <p className="text-sm text-foreground-muted">No timeline events yet.</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((entry) => (
                  <div key={entry.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium capitalize">{entry.status.replace(/_/g, ' ')}</p>
                      {entry.note && <p className="text-foreground-muted">{entry.note}</p>}
                      <p className="text-xs text-foreground-subtle">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl bg-card border border-border p-5">
            <h2 className="font-heading font-bold mb-4">Customer</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{customerName || 'Guest'}</p>
              {order.customer?.email && <p className="text-foreground-muted">{order.customer.email}</p>}
              {(order.customer?.phone || addr?.phone) && (
                <p className="text-foreground-muted">{order.customer?.phone ?? addr?.phone}</p>
              )}
              {addr && (
                <div className="pt-2 text-foreground-muted">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {[addr.city, addr.state, addr.postalCode ?? addr.zipCode, addr.countryCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl bg-card border border-border p-5 space-y-4">
            <h2 className="font-heading font-bold">Update Status</h2>
            <FormField label="Status">
              <FormSelect value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={handleUpdateStatus}
              isLoading={isUpdatingStatus}
              disabled={order.status === 'cancelled'}
            >
              Update Status
            </Button>
            {order.status !== 'cancelled' && (
              <Button variant="danger" size="sm" className="w-full" onClick={() => setShowCancel(true)}>
                Cancel Order
              </Button>
            )}
          </section>

          <section className="rounded-xl bg-card border border-border p-5 space-y-4">
            <h2 className="font-heading font-bold flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" /> Add Shipment
            </h2>
            <FormField label="Carrier">
              <FormInput
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. Aramex, DHL"
              />
            </FormField>
            <FormField label="Tracking Number">
              <FormInput
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking number"
              />
            </FormField>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={handleAddShipment}
              isLoading={isAddingShipment}
            >
              Add Shipment
            </Button>
          </section>
        </div>
      </div>

      <AdminModal
        open={showCancel}
        title="Cancel Order"
        submitLabel="Cancel Order"
        isSubmitting={isCancelling}
        onClose={() => {
          setShowCancel(false);
          setCancelReason('');
        }}
        onSubmit={handleCancel}
      >
        <p className="text-sm text-foreground-muted mb-4">
          Are you sure you want to cancel this order? This action may not be reversible.
        </p>
        <FormField label="Cancellation Reason">
          <FormTextarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Optional reason for cancellation"
          />
        </FormField>
      </AdminModal>
    </div>
  );
}
