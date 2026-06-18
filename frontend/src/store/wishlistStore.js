// src/store/wishlistStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],
      userId: null,

      setUser: (userId) => {
        const saved = localStorage.getItem(`mf-wishlist-${userId}`)
        const ids = saved ? JSON.parse(saved) : []
        set({ ids, userId })
      },

      toggle: (id) => {
        const { userId } = get()
        set((state) => {
          const newIds = state.ids.includes(id)
            ? state.ids.filter((x) => x !== id)
            : [...state.ids, id]
          if (userId) localStorage.setItem(`mf-wishlist-${userId}`, JSON.stringify(newIds))
          return { ids: newIds }
        })
      },

      isWishlisted: (id) => get().ids.includes(id),

      clear: () => {
        set({ ids: [], userId: null })
      },
    }),
    { name: 'mf-wishlist' }
  )
)