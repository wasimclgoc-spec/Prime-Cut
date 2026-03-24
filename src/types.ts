export type Category = string;

export interface Product {
  id: string;
  name: string;
  category: Category;
  pricePerKg: number;
  image: string;
  description: string;
  minQty: number;
  maxQty: number;
  isFeatured: boolean;
  stockStatus: "In Stock" | "Out of Stock";
  homeSection?: "bachatPacks" | "bestCuts" | "muttonChoice" | "freshCuts" | "none";
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName?: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  status: "Pending" | "Confirmed" | "Processing" | "Out for Delivery" | "Delivered" | "Cancelled";
  address: string;
  phone: string;
  createdAt: any;
  paymentMethod: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "customer" | "admin";
  address?: string;
  phone?: string;
  wishlist?: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  isActive: boolean;
}
