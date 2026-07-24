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
  stockQuantity?: number;
  brandId?: string;
  categoryId?: string;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  relatedProducts?: Product[];
  upsellProducts?: Product[];
  crossSellProducts?: Product[];
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
  altText?: string;
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
  options?: Array<{ attributeId: string; optionId: string }>;
  sortOrder?: number;
  giftCardSupplierConfig?: {
    enabled: boolean;
    apiUrl?: string;
    apiKey?: string;
    method?: 'GET' | 'POST';
    bodyTemplate?: string;
    codePath?: string;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  imageUrl?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
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
  type?: string;
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

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  roles?: Array<{ id: string; name: string; description?: string }>;
  lastLoginAt?: string;
  createdAt?: string;
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
  customerId?: string | null;
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot?: Record<string, unknown>;
  deliveredCodes?: string[] | null;
  fulfillmentStatus?: 'not_applicable' | 'pending' | 'fulfilled' | 'partial';
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
