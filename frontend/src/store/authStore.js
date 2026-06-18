// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const res = await api.login({ email, password })
        localStorage.setItem('mf_token', res.data.token)
        set({ user: res.data.user, token: res.data.token })
        return res.data
      },

      register: async (data) => {
        const res = await api.register(data)
        localStorage.setItem('mf_token', res.data.token)
        set({ user: res.data.user, token: res.data.token })
        return res.data
      },

      logout: () => {
        localStorage.removeItem('mf_token')
        localStorage.removeItem('mf-wishlist')
        localStorage.removeItem('mf-cart')
        set({ user: null, token: null })
        // Reset các store khác
        window.__mf_logout?.()
      },

      fetchMe: async () => {
        try {
          const res = await api.getMe()
          set({ user: res.data.user })
        } catch {
          localStorage.removeItem('mf_token')
          set({ user: null, token: null })
        }
      },

      updateProfile: async (data) => {
        const res = await api.updateMe(data)
        set({ user: res.data.user })
      },

      isLoggedIn: () => !!get().token,
    }),
    { name: 'mf-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)