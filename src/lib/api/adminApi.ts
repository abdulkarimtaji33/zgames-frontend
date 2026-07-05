import adminClient from './adminClient';
import type { PaginatedResponse, Product, Order, Category, Brand, Review, StaffUser } from '@/types';

type ApiData<T> = { data: T };
type Params = Record<string, unknown>;

const crud = <T>(base: string) => ({
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<T>>>(base, { params }),
  findOne: (id: string) => adminClient.get<ApiData<T>>(`${base}/${id}`),
  create: (data: unknown) => adminClient.post<ApiData<T>>(base, data),
  update: (id: string, data: unknown) => adminClient.patch<ApiData<T>>(`${base}/${id}`, data),
  remove: (id: string) => adminClient.delete(`${base}/${id}`),
});

export const adminAuthApi = {
  login: (email: string, password: string) =>
    adminClient.post<ApiData<{ accessToken: string; refreshToken: string; expiresIn: number }>>('/auth/admin/login', { email, password }),
  logout: (refreshToken: string) => adminClient.post('/auth/logout', { refreshToken }),
  me: () => adminClient.get<ApiData<StaffUser>>('/users/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    adminClient.post('/users/me/change-password', { currentPassword, newPassword }),
};

export const adminProductsApi = {
  ...crud<Product>('/products'),
  findBySlug: (slug: string) => adminClient.get<ApiData<Product>>(`/products/by-slug/${slug}`),
  getImages: (id: string) => adminClient.get(`/products/${id}/images`),
  getVariants: (id: string) => adminClient.get(`/products/${id}/variants`),
  addVariant: (id: string, data: unknown) => adminClient.post(`/products/${id}/variants`, data),
  updateVariant: (id: string, variantId: string, data: unknown) => adminClient.patch(`/products/${id}/variants/${variantId}`, data),
  removeVariant: (id: string, variantId: string) => adminClient.delete(`/products/${id}/variants/${variantId}`),
  addImage: (id: string, data: unknown) => adminClient.post(`/products/${id}/images`, data),
  setPrimaryImage: (id: string, imageId: string) => adminClient.patch(`/products/${id}/images/${imageId}/set-primary`),
  removeImage: (id: string, imageId: string) => adminClient.delete(`/products/${id}/images/${imageId}`),
  reorderImages: (id: string, imageIds: string[]) => adminClient.patch(`/products/${id}/images/reorder`, { imageIds }),
  setRelated: (id: string, productIds: string[]) => adminClient.patch(`/products/${id}/related`, { productIds }),
  setUpsell: (id: string, productIds: string[]) => adminClient.patch(`/products/${id}/upsell`, { productIds }),
  setCrosssell: (id: string, productIds: string[]) => adminClient.patch(`/products/${id}/crosssell`, { productIds }),
};

export const adminOrdersApi = {
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Order>>>('/orders', { params }),
  findOne: (id: string) => adminClient.get<ApiData<Order>>(`/orders/${id}`),
  updateStatus: (id: string, data: unknown) => adminClient.patch<ApiData<Order>>(`/orders/${id}/status`, data),
  cancel: (id: string, reason?: string) => adminClient.patch<ApiData<Order>>(`/orders/${id}/cancel`, { reason }),
  addShipment: (id: string, data: unknown) => adminClient.post(`/orders/${id}/shipment`, data),
  getTimeline: (id: string) => adminClient.get(`/orders/${id}/timeline`),
  fulfillGiftCardManually: (orderId: string, itemId: string, code: string) =>
    adminClient.post<ApiData<Order>>(`/orders/${orderId}/items/${itemId}/fulfill-manual`, { code }),
};

export const adminCategoriesApi = {
  tree: () => adminClient.get<ApiData<Category[]>>('/categories/tree'),
  productCounts: () => adminClient.get<ApiData<Record<string, number>>>('/categories/product-counts'),
  ...crud<Category>('/categories'),
};

export const adminBrandsApi = crud<Brand>('/brands');

export const adminCustomersApi = {
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Record<string, unknown>>>>('/customers', { params }),
  findOne: (id: string) => adminClient.get<ApiData<Record<string, unknown>>>(`/customers/${id}`),
};

export const adminReviewsApi = {
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Review>>>('/reviews', { params }),
  approve: (id: string) => adminClient.patch<ApiData<Review>>(`/reviews/${id}/approve`),
  reject: (id: string, reason?: string) => adminClient.patch<ApiData<Review>>(`/reviews/${id}/reject`, { reason }),
  addReply: (id: string, reply: string) => adminClient.post(`/reviews/${id}/reply`, { reply }),
  remove: (id: string) => adminClient.delete(`/reviews/${id}`),
};

export const adminUsersApi = crud<StaffUser>('/users');

export const adminRolesApi = {
  findAll: () => adminClient.get<ApiData<Array<Record<string, unknown>>>>('/roles'),
  findOne: (id: string) => adminClient.get(`/roles/${id}`),
  create: (data: unknown) => adminClient.post('/roles', data),
  update: (id: string, data: unknown) => adminClient.patch(`/roles/${id}`, data),
  remove: (id: string) => adminClient.delete(`/roles/${id}`),
  assignPermissions: (id: string, permissionIds: string[]) => adminClient.patch(`/roles/${id}/permissions`, { permissionIds }),
  seed: () => adminClient.post('/roles/seed'),
};

export const adminPermissionsApi = {
  findAll: () => adminClient.get<ApiData<Array<Record<string, unknown>>>>('/permissions'),
  create: (data: unknown) => adminClient.post('/permissions', data),
  update: (id: string, data: unknown) => adminClient.patch(`/permissions/${id}`, data),
  remove: (id: string) => adminClient.delete(`/permissions/${id}`),
  seed: () => adminClient.post('/permissions/seed'),
};

export const adminCouponsApi = crud('/coupons');

export const adminFlashSalesApi = {
  findAll: (params?: Params) => adminClient.get('/flash-sales', { params }),
  findOne: (id: string) => adminClient.get(`/flash-sales/${id}`),
  create: (data: unknown) => adminClient.post('/flash-sales', data),
  update: (id: string, data: unknown) => adminClient.patch(`/flash-sales/${id}`, data),
  remove: (id: string) => adminClient.delete(`/flash-sales/${id}`),
  addProduct: (id: string, data: unknown) => adminClient.post(`/flash-sales/${id}/products`, data),
  removeProduct: (id: string, productId: string) => adminClient.delete(`/flash-sales/${id}/products/${productId}`),
};

export const adminGiftCardsApi = {
  findAll: (params?: Params) => adminClient.get('/gift-cards', { params }),
  create: (data: unknown) => adminClient.post('/gift-cards', data),
  createBatch: (data: unknown) => adminClient.post('/gift-cards/batch', data),
  findOne: (id: string) => adminClient.get(`/gift-cards/${id}`),
};

export interface GiftCardCode {
  id: string;
  productId: string;
  variantId: string | null;
  code: string;
  status: 'available' | 'sold' | 'disabled';
  source: 'manual' | 'api';
  orderId: string | null;
  soldAt: string | null;
  createdAt: string;
}

export interface GiftCardCodeStat {
  variantId: string | null;
  available: number;
  sold: number;
  disabled: number;
}

export interface GiftCardSupplierConfig {
  enabled: boolean;
  apiUrl?: string;
  apiKey?: string;
  method?: 'GET' | 'POST';
  bodyTemplate?: string;
  codePath?: string;
}

export const adminGiftCardCodesApi = {
  bulkUpload: (productId: string, codes: string[], variantId?: string) =>
    adminClient.post<ApiData<{ uploaded: number }>>(`/products/${productId}/gift-card-codes/bulk`, { codes, variantId }),
  list: (productId: string, variantId?: string, status?: string) =>
    adminClient.get<ApiData<GiftCardCode[]>>(`/products/${productId}/gift-card-codes`, { params: { variantId, status } }),
  stats: (productId: string) =>
    adminClient.get<ApiData<GiftCardCodeStat[]>>(`/products/${productId}/gift-card-codes/stats`),
  remove: (id: string) => adminClient.delete(`/gift-card-codes/${id}`),
  configureSupplier: (variantId: string, config: GiftCardSupplierConfig) =>
    adminClient.post<ApiData<GiftCardSupplierConfig>>(`/products/variants/${variantId}/gift-card-supplier`, config),
  lowStock: (threshold?: number) =>
    adminClient.get(`/gift-card-codes/low-stock`, { params: { threshold } }),
};

export const adminLoyaltyApi = {
  getHistory: (customerId: string) => adminClient.get(`/loyalty/${customerId}/history`),
  adjust: (data: unknown) => adminClient.post('/loyalty/adjust', data),
  redeem: (data: unknown) => adminClient.post('/loyalty/redeem', data),
};

export const adminAffiliatesApi = crud('/affiliates');

export const adminInventoryApi = {
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Record<string, unknown>>>>('/inventory', { params }),
  lowStock: (threshold?: number) => adminClient.get('/inventory/low-stock', { params: { threshold } }),
  getTransactions: (productId: string) => adminClient.get(`/inventory/${productId}/transactions`),
  adjust: (data: unknown) => adminClient.post('/inventory/adjust', data),
  transfer: (data: unknown) => adminClient.post('/inventory/transfer', data),
};

export const adminWarehousesApi = {
  findAll: () => adminClient.get<ApiData<Record<string, unknown>[]>>('/warehouses'),
  findOne: (id: string) => adminClient.get(`/warehouses/${id}`),
  create: (data: unknown) => adminClient.post('/warehouses', data),
  update: (id: string, data: unknown) => adminClient.patch(`/warehouses/${id}`, data),
  setDefault: (id: string) => adminClient.patch(`/warehouses/${id}/set-default`),
  remove: (id: string) => adminClient.delete(`/warehouses/${id}`),
};

export const adminSuppliersApi = crud('/suppliers');

export const adminPurchaseOrdersApi = {
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Record<string, unknown>>>>('/purchase-orders', { params }),
  findOne: (id: string) => adminClient.get(`/purchase-orders/${id}`),
  create: (data: unknown) => adminClient.post('/purchase-orders', data),
  updateStatus: (id: string, status: string) => adminClient.patch(`/purchase-orders/${id}/status/${status}`),
  receive: (id: string, data: unknown) => adminClient.post(`/purchase-orders/${id}/receive`, data),
  remove: (id: string) => adminClient.delete(`/purchase-orders/${id}`),
};

export const adminSupportApi = {
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Record<string, unknown>>>>('/support-tickets', { params }),
  findOne: (id: string) => adminClient.get(`/support-tickets/${id}`),
  update: (id: string, data: unknown) => adminClient.patch(`/support-tickets/${id}`, data),
  agentReply: (id: string, message: string) => adminClient.post(`/support-tickets/${id}/agent-reply`, { message }),
  close: (id: string) => adminClient.patch(`/support-tickets/${id}/close`),
};

export const adminReturnsApi = {
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Record<string, unknown>>>>('/returns', { params }),
  findOne: (id: string) => adminClient.get(`/returns/${id}`),
  update: (id: string, data: unknown) => adminClient.patch(`/returns/${id}`, data),
};

export const adminBlogApi = {
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Record<string, unknown>>>>('/blog/posts', { params }),
  findOne: (id: string) => adminClient.get(`/blog/posts/${id}`),
  create: (data: unknown) => adminClient.post('/blog/posts', data),
  update: (id: string, data: unknown) => adminClient.patch(`/blog/posts/${id}`, data),
  remove: (id: string) => adminClient.delete(`/blog/posts/${id}`),
  findAuthors: () => adminClient.get('/blog/authors'),
  findBlogCategories: () => adminClient.get('/blog/categories'),
  createAuthor: (data: unknown) => adminClient.post('/blog/authors', data),
  createBlogCategory: (data: unknown) => adminClient.post('/blog/categories', data),
};

export const adminAttributesApi = {
  findAll: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Record<string, unknown>>>>('/attributes', { params }),
  findOne: (id: string) => adminClient.get(`/attributes/${id}`),
  create: (data: unknown) => adminClient.post('/attributes', data),
  update: (id: string, data: unknown) => adminClient.patch(`/attributes/${id}`, data),
  remove: (id: string) => adminClient.delete(`/attributes/${id}`),
  addOption: (id: string, data: unknown) => adminClient.post(`/attributes/${id}/options`, data),
  updateOption: (id: string, optionId: string, data: unknown) => adminClient.patch(`/attributes/${id}/options/${optionId}`, data),
  removeOption: (id: string, optionId: string) => adminClient.delete(`/attributes/${id}/options/${optionId}`),
};

export const adminCmsApi = crud('/cms-pages');

export const adminCountriesApi = crud('/countries');

export const adminCurrenciesApi = {
  findAll: (params?: Params) => adminClient.get('/currencies', { params }),
  findOne: (id: string) => adminClient.get(`/currencies/${id}`),
  create: (data: unknown) => adminClient.post('/currencies', data),
  update: (id: string, data: unknown) => adminClient.patch(`/currencies/${id}`, data),
  setDefault: (id: string) => adminClient.patch(`/currencies/${id}/set-default`),
  remove: (id: string) => adminClient.delete(`/currencies/${id}`),
};

export const adminLanguagesApi = {
  findAll: (params?: Params) => adminClient.get('/languages', { params }),
  findOne: (id: string) => adminClient.get(`/languages/${id}`),
  create: (data: unknown) => adminClient.post('/languages', data),
  update: (id: string, data: unknown) => adminClient.patch(`/languages/${id}`, data),
  setDefault: (id: string) => adminClient.patch(`/languages/${id}/set-default`),
  remove: (id: string) => adminClient.delete(`/languages/${id}`),
};

export const adminStoresApi = crud('/stores');

export const adminPaymentsApi = {
  findOne: (id: string) => adminClient.get(`/payments/${id}`),
  findByOrder: (orderId: string) => adminClient.get(`/payments/order/${orderId}`),
  refund: (data: unknown) => adminClient.post('/payments/refund', data),
};

export const adminSettingsApi = {
  findAll: () => adminClient.get<ApiData<Record<string, unknown>[]>>('/settings'),
  findByGroup: (group: string) => adminClient.get(`/settings/group/${group}`),
  upsert: (data: unknown) => adminClient.post('/settings', data),
  bulkUpdate: (data: unknown) => adminClient.post('/settings/bulk', data),
  remove: (key: string) => adminClient.delete(`/settings/${key}`),
};

export const adminStorageApi = {
  presignedUpload: (folder: string, fileName: string, contentType: string) =>
    adminClient.post('/storage/presigned-upload', { folder, fileName, contentType }),
};

export const adminReportsApi = {
  revenueSummary: (params?: Params) => adminClient.get<ApiData<Record<string, unknown>>>('/reports/revenue/summary', { params }),
  revenueByPeriod: (params?: Params) => adminClient.get<ApiData<Record<string, unknown>[]>>('/reports/revenue/by-period', { params }),
  ordersByStatus: (params?: Params) => adminClient.get<ApiData<Record<string, unknown>[]>>('/reports/orders/by-status', { params }),
  topProducts: (params?: Params) => adminClient.get<ApiData<Record<string, unknown>[]>>('/reports/products/top', { params }),
  customerStats: (params?: Params) => adminClient.get<ApiData<Record<string, unknown>>>('/reports/customers/stats', { params }),
  lowStock: () => adminClient.get<ApiData<Record<string, unknown>[]>>('/reports/inventory/low-stock'),
};

export const adminAnalyticsApi = {
  events: (params?: Params) => adminClient.get<ApiData<PaginatedResponse<Record<string, unknown>>>>('/analytics/events', { params }),
  pageViews: (params?: Params) => adminClient.get<ApiData<Record<string, unknown>[]>>('/analytics/page-views', { params }),
};

export const adminNotificationsApi = {
  findAll: (params?: Params) => adminClient.get('/notifications', { params }),
  getUnreadCount: () => adminClient.get('/notifications/unread-count'),
  markAllRead: () => adminClient.patch('/notifications/read-all'),
  markRead: (id: string) => adminClient.patch(`/notifications/${id}/read`),
  getPreferences: () => adminClient.get('/notifications/preferences'),
};
