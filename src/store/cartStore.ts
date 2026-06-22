'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  giftCardCode: string | null;
  giftCardDiscount: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  applyGiftCard: (code: string, discount: number) => void;
  removeGiftCard: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      giftCardCode: null,
      giftCardDiscount: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !(i.productId === productId && i.variantId === variantId),
                )
              : state.items.map((i) =>
                  i.productId === productId && i.variantId === variantId
                    ? { ...i, quantity }
                    : i,
                ),
        })),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId),
          ),
        })),

      clearCart: () =>
        set({ items: [], couponCode: null, couponDiscount: 0, giftCardCode: null, giftCardDiscount: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
      applyGiftCard: (code, discount) => set({ giftCardCode: code, giftCardDiscount: discount }),
      removeGiftCard: () => set({ giftCardCode: null, giftCardDiscount: 0 }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
          0,
        );
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: 'zgames-cart' },
  ),
);
