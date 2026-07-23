'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import type { Order, PaginatedResponse } from '@/types';

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
  RETURNED: 'error',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersApi.findByCustomer().then((res) => {
      const data = res.data.data as PaginatedResponse<Order>;
      setOrders(data.items ?? []);
    }).catch(() => {
      setOrders([]);
    }).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">My Orders</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} height={80} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-card border border-border shadow-sm">
          <Package className="h-14 w-14 text-foreground-subtle mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-foreground-muted mb-6">When you place an order, it will appear here.</p>
          <Link href="/en" className="inline-flex px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border shadow-sm hover:border-border-hover hover:shadow-md transition-all group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-full bg-background-tertiary flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-foreground-muted" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{order.orderNumber}</p>
                  <p className="text-xs text-foreground-muted">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>{order.status}</Badge>
                <p className="font-bold text-accent whitespace-nowrap">{order.currency} {Number(order.total).toFixed(2)}</p>
                <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}