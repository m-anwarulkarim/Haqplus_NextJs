import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { CartItem } from "@/types";

export interface AppliedCoupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minPurchase?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: AppliedCoupon | null;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, "id" | "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingCharge: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,

      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.productId === product.productId &&
            (item.variantId ?? "") === (product.variantId ?? "") &&
            (item.size ?? item.selectedSize ?? "") ===
              (product.size ?? product.selectedSize ?? "") &&
            (item.color ?? item.selectedColor ?? "") ===
              (product.color ?? product.selectedColor ?? "")
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems, isOpen: true });
        } else {
          set({
            items: [
              ...currentItems,
              {
                ...product,
                size: product.size ?? product.selectedSize,
                color: product.color ?? product.selectedColor,
                id: `${product.productId}-${product.variantId ?? "default"}-${Date.now()}-${Math.random()
                  .toString(36)
                  .substring(2, 6)}`,
                quantity,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().coupon;
        if (!coupon || subtotal === 0) return 0;

        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
          return 0;
        }

        if (coupon.type === "PERCENTAGE") {
          return Number(((subtotal * coupon.value) / 100).toFixed(2));
        }

        return Math.min(coupon.value, subtotal);
      },

      getShippingCharge: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0 || subtotal >= 75) {
          return 0; // Free shipping over $75
        }
        return 9.99;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingCharge();
        return Math.max(0, Number((subtotal - discount + shipping).toFixed(2)));
      },
    }),
    {
      name: "ecom-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({ items: state.items, coupon: state.coupon } as CartState),
    }
  )
);

const emptySubscribe = () => () => {};

export function useCartHydration() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
