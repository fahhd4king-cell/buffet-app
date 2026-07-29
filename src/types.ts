export interface Category {
  id: string;
  name: string;
  icon?: string;
  createdAt?: string;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  addons?: ProductAddon[];
}

export interface CartItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedAddons: CartItemAddon[];
  notes: string;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'جديد' | 'قيد التحضير' | 'جاهز' | 'مكتمل' | 'ملغي';
export type OrderType = 'محلي' | 'سفري' | 'توصيل';
export type PaymentMethod = 'نقدي' | 'شبكة' | 'تحويل';

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  selectedAddons?: CartItemAddon[];
  itemTotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  sessionId: string;
  customerName: string;
  customerPhone?: string;
  destinationDetails?: string;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'مدفوع' | 'غير مدفوع';
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  pin: string;
}

export interface BlockedCustomer {
  sessionId: string;
  customerName?: string;
  customerPhone?: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
}

export interface BuffetSettings {
  buffetName: string;
  currency: string;
  isOpen: boolean;
  closedReason?: string;
  reopenTime?: string;
  taxPercentage: number;
  adminPin: string;
  allowCustomerOrders: boolean;
}

export interface AppData {
  settings: BuffetSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  staff: Staff[];
  blockedCustomers: BlockedCustomer[];
}