/**
 * Shared shipping constants/helpers so cart and checkout always agree on
 * the free-shipping threshold and cost calculation.
 */
export const FREE_SHIPPING_THRESHOLD = 150;

/**
 * Returns the shipping cost for a given subtotal.
 * Once the subtotal reaches (>=) the free shipping threshold, shipping is free
 * regardless of the base/standard shipping cost passed in.
 */
export function getShippingCost(subtotal: number, baseCost = 15): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : baseCost;
}
