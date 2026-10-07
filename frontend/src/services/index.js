import api from './api';

const data = (p) => p.then((r) => r.data);

export const authService = {
  register: (body) => data(api.post('/auth/register', body)),
  login: (body) => data(api.post('/auth/login', body)),
  profile: () => data(api.get('/auth/profile')),
  updateProfile: (body) => data(api.put('/auth/profile', body)),
  changePassword: (body) => data(api.put('/auth/password', body)),
};

export const productService = {
  list: (params) => data(api.get('/products', { params })),
  get: (idOrSlug) => data(api.get(`/products/${idOrSlug}`)),
  create: (body) => data(api.post('/products', body)),
  update: (id, body) => data(api.put(`/products/${id}`, body)),
  remove: (id) => data(api.delete(`/products/${id}`)),
  reviews: (id) => data(api.get(`/products/${id}/reviews`)),
};

export const categoryService = {
  list: () => data(api.get('/categories')),
  create: (body) => data(api.post('/categories', body)),
  update: (id, body) => data(api.put(`/categories/${id}`, body)),
  remove: (id) => data(api.delete(`/categories/${id}`)),
};

export const cartService = {
  get: () => data(api.get('/cart')),
  add: (body) => data(api.post('/cart', body)),
  update: (id, body) => data(api.put(`/cart/${id}`, body)),
  remove: (id) => data(api.delete(`/cart/${id}`)),
  clear: () => data(api.delete('/cart')),
};

export const wishlistService = {
  get: () => data(api.get('/wishlist')),
  add: (productId) => data(api.post('/wishlist', { productId })),
  remove: (productId) => data(api.delete(`/wishlist/${productId}`)),
};

export const orderService = {
  create: (body) => data(api.post('/orders', body)),
  mine: () => data(api.get('/orders')),
  get: (id) => data(api.get(`/orders/${id}`)),
  cancel: (id) => data(api.put(`/orders/${id}/cancel`)),
  updateStatus: (id, body) => data(api.put(`/orders/${id}/status`, body)),
  updatePayment: (id, paymentStatus) => data(api.put(`/orders/${id}/payment`, { paymentStatus })),
};

export const reviewService = {
  create: (body) => data(api.post('/reviews', body)),
  eligibility: (productId) => data(api.get(`/reviews/eligibility/${productId}`)),
  featured: () => data(api.get('/reviews/featured')),
  all: () => data(api.get('/reviews')),
  remove: (id) => data(api.delete(`/reviews/${id}`)),
};

export const adminService = {
  stats: () => data(api.get('/admin/stats')),
  orders: (params) => data(api.get('/admin/orders', { params })),
  customers: (params) => data(api.get('/admin/customers', { params })),
  customer: (id) => data(api.get(`/admin/customers/${id}`)),
  setCustomerActive: (id, isActive) => data(api.put(`/admin/customers/${id}/active`, { isActive })),
  messages: () => data(api.get('/admin/messages')),
  markMessageRead: (id) => data(api.put(`/admin/messages/${id}/read`)),
};

export const uploadService = {
  status: () => data(api.get('/uploads/status')),
  images: (files) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return data(api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }));
  },
};

export const publicService = {
  subscribe: (email) => data(api.post('/newsletter', { email })),
  contact: (body) => data(api.post('/contact', body)),
};

export { getErrorMessage, getFieldErrors } from './api';
