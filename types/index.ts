export type Role = "CUSTOMER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentMethod = "COD" | "BKASH" | "SSLCOMMERZ";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  role: Role;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string | null;
  color?: string | null;
  price: number;
  stock: number;
  sku: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName?: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  basePrice?: number;
  discountPrice?: number | null;
  price: number; // current price (discountPrice ?? basePrice)
  originalPrice?: number;
  sku?: string;
  stock?: number;
  categoryId?: string;
  category?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  variants?: ProductVariant[];
  reviews?: Review[];
  createdAt?: string | Date;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
  size?: string;
  color?: string;
  sku?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  itemCount?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  phone: string;
  email?: string | null;
  division: string;
  district: string;
  area: string;
  address: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  courierTrackingId?: string | null;
  courierStatus?: string | null;
  note?: string | null;
  items: OrderItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Coupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minPurchase: number;
}
