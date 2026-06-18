// src/utils/format.js
export const fmt = (n) => Number(n).toLocaleString('vi-VN') + '₫';

export const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-');

export const getStatusLabel = (status) => ({
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ'
}[status] || status);

export const getStatusClass = (status) => ({
  processing: 'status-processing',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled'
}[status] || '');
