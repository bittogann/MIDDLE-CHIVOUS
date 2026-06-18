// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, colorIdx, qty = 1) => {
        const key = `${product.id}-${size}-${colorIdx}`;
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return { items: state.items.map((i) => i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i) };
          }
          return {
            items: [...state.items, {
              key, productId: product.id, name: product.name,
              price: product.price, size, colorIdx,
              colorHex: product.colors[colorIdx]?.hex || product.colors[0]?.hex,
              colorName: product.colors[colorIdx]?.name || '',
              qty
            }]
          };
        });
      },

      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      changeQty: (key, delta) => set((state) => ({
        items: state.items.map((i) =>
          i.key === key ? { ...i, qty: Math.max(1, Math.min(10, i.qty + delta)) } : i
        )
      })),

      clearCart: () => set({ items: [] }),

      get totalItems() { return get().items.reduce((s, i) => s + i.qty, 0); },
      get subtotal() { return get().items.reduce((s, i) => s + i.price * i.qty, 0); }
    }),
    { name: 'mf-cart' }
  )
);
