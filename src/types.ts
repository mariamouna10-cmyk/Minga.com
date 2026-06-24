/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number; // in DZD
  category: string;
  categoryAr: string;
  subcategory: string;
  subcategoryAr: string;
  images: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isRecommended?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productNameAr: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  wilaya: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: "COD" | "Edahabia" | "CCP" | "Bank";
  status: OrderStatus;
  date: string;
  trackingNumber: string;
}

export interface SupportMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: "order" | "promotion" | "system";
  date: string;
  read?: boolean;
}

export interface AnalyticsStats {
  salesTotal: number;
  ordersCount: number;
  productsCount: number;
  customersCount: number;
  revenueByMonth: { month: string; amount: number }[];
  wilayaSales: { wilaya: string; sales: number }[];
  categorySales: { category: string; count: number }[];
  recentOrders: Order[];
}
