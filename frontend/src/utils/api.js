// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mf_token');
      window.location.href = '/account';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Product helpers ────────────────────────────────────────────────────
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);

// ── Auth helpers ───────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateMe = (data) => api.put('/auth/me', data);

// ── Order helpers ──────────────────────────────────────────────────────
export const placeOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders');
export const getOrder = (orderNumber) => api.get(`/orders/${orderNumber}`);

// ── Misc ───────────────────────────────────────────────────────────────
export const validateDiscount = (data) => api.post('/discount/validate', data);
export const subscribeNewsletter = (email) => api.post('/newsletter/subscribe', { email });
