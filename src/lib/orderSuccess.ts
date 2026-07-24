/**
 * Shared shape for the order summary handed off from checkout to the
 * order-success page via sessionStorage (see checkout/page.tsx and
 * order-success/page.tsx).
 */
export interface OrderSuccessSummary {
  id: string;
  orderNumber?: string;
  items: { name: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  storeCreditUsed: number;
  total: number;
  address: { firstName: string; lastName: string; addressLine1: string; city: string; phone: string } | null;
  paymentMethodLabel: string;
  isDigitalOnly: boolean;
}

export const ORDER_SUCCESS_STORAGE_KEY = 'zg-last-order-summary';
