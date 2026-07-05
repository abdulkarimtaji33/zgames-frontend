import apiClient from './client';
import type { AuthResponse, Product, PaginatedResponse, Order, Customer, Review, Category, Brand, OrderItem } from '@/types';

/* Auth */
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ data: AuthResponse }>('/auth/customer/login', { email, password }),
  adminLogin: (email: string, password: string) =>
    apiClient.post<{ data: AuthResponse }>('/auth/admin/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    apiClient.post<{ data: AuthResponse }>('/auth/customer/register', data),
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', { token }),
  refresh: (refreshToken: string) =>
    apiClient.post<{ data: { accessToken: string } }>('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get<{ data: Customer }>('/customers/me'),
};

/* Products */
export const productsApi = {
  findAll: (params?: Record<string, unknown>) =>
    apiClient.get<{ data: PaginatedResponse<Product> }>('/products', { params }),
  findOne: (id: string) =>
    apiClient.get<{ data: Product }>(`/products/${id}`),
  findBySlug: (slug: string) =>
    apiClient.get<{ data: Product }>(`/products/slug/${slug}`),
};

/* Categories */
export const categoriesApi = {
  findAll: () =>
    apiClient.get<{ data: Category[] }>('/categories'),
  findOne: (id: string) =>
    apiClient.get<{ data: Category }>(`/categories/${id}`),
  tree: () =>
    apiClient.get<{ data: Category[] }>('/categories/tree'),
};

/* Brands */
export const brandsApi = {
  findAll: () =>
    apiClient.get<{ data: Brand[] }>('/brands'),
};

/* Orders */
export const ordersApi = {
  create: (data: unknown) =>
    apiClient.post<{ data: Order }>('/orders', data),
  findAll: (params?: Record<string, unknown>) =>
    apiClient.get<{ data: PaginatedResponse<Order> }>('/orders', { params }),
  findByCustomer: (page = 1) =>
    apiClient.get<{ data: PaginatedResponse<Order> }>('/orders/my', { params: { page } }),
  findOne: (id: string) =>
    apiClient.get<{ data: Order }>(`/orders/${id}`),
  trackByNumber: (orderNumber: string, email: string) =>
    apiClient.get<{ data: Order }>(`/orders/track/${orderNumber}`, { params: { email } }),
};

/* Reviews */
export const reviewsApi = {
  findByProduct: (productId: string, params?: Record<string, unknown>) =>
    apiClient.get<{ data: PaginatedResponse<Review> }>(`/reviews/product/${productId}`, { params }),
  create: (data: { productId: string; rating: number; title?: string; body: string }) =>
    apiClient.post<{ data: Review }>('/reviews', data),
};

/* Coupons */
export const couponsApi = {
  validate: (code: string, orderAmount: number) =>
    apiClient.post<{ data: { discount: number; type: string } }>('/coupons/validate', { code, orderAmount }),
};

/* Digital gift card codes delivered on past orders (e.g. PlayStation, Xbox, Steam codes) */
export interface DeliveredGiftCardItem extends OrderItem {
  orderNumber: string;
  orderCreatedAt: string;
}

export const giftCardsApi = {
  /** Fetches all order items across the customer's orders that are gift_card-type products with delivered codes. */
  findMyCodes: async (): Promise<DeliveredGiftCardItem[]> => {
    const res = await apiClient.get<{ data: PaginatedResponse<Order> }>('/orders/my', { params: { limit: 100 } });
    const orders = res.data.data.items ?? [];
    const results: DeliveredGiftCardItem[] = [];
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const type = (item.productSnapshot as { type?: string } | undefined)?.type;
        if (type === 'gift_card') {
          results.push({ ...item, orderNumber: order.orderNumber, orderCreatedAt: order.createdAt });
        }
      }
    }
    return results;
  },
};

/* Customer */
export const customerApi = {
  getProfile: () =>
    apiClient.get<{ data: Customer }>('/customers/me'),
  updateProfile: (data: unknown) =>
    apiClient.patch('/customers/me', data),
  getAddresses: () =>
    apiClient.get('/customers/addresses'),
  addAddress: (data: unknown) =>
    apiClient.post('/customers/addresses', data),
  updateAddress: (id: string, data: unknown) =>
    apiClient.put(`/customers/addresses/${id}`, data),
  deleteAddress: (id: string) =>
    apiClient.delete(`/customers/addresses/${id}`),
  getWishlist: () =>
    apiClient.get('/wishlist'),
  addToWishlist: (productId: string) =>
    apiClient.post('/wishlist', { productId }),
  removeFromWishlist: (productId: string) =>
    apiClient.delete(`/wishlist/${productId}`),
};