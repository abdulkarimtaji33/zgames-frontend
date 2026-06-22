export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  type?: string;
  platform?: string;
  region?: string;
  genre?: string;
  description?: string;
  shortDescription?: string;
  publisher?: string;
  developer?: string;
  isActive: boolean;
  isFeatured: boolean;
  isPreorder: boolean;
  isComingSoon: boolean;
  releaseDate?: string;
  avgRating: number;
  reviewCount: number;
  brandId?: string;
  categoryId?: string;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  tags?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  salePrice?: number;
  isActive: boolean;
  stockQuantity?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  parentId?: string;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  slug: string;
  platform?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  pointsBalance: number;
  walletBalance: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingAmount: number;
  total: number;
  currency: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot?: Record<string, unknown>;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  countryCode: string;
  isDefault?: boolean;
}

export interface Review {
  id: string;
  customerId: string;
  productId: string;
  rating: number;
  title?: string;
  body: string;
  status: string;
  reply?: string;
  repliedAt?: string;
  customer?: { firstName: string; lastName: string; avatarUrl?: string };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AuthResponse {
  user: User;
  customer?: Customer;
  accessToken: string;
  refreshToken: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag?: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  isValid: boolean;
  minOrderAmount?: number;
}
