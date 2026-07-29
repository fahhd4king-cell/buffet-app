export type Role = 'مدير' | 'كاشير' | 'مجهز بوفيه';

export type OrderType = 'استلام من المحل (Pickup)';

export type PaymentMethod = 'كاش' | 'شبكة' | 'Apple Pay' | 'تحويل بنكي' | 'حساب آجل' | 'نقداً';

export type PaymentStatus = 'مدفوع' | 'غير مدفوع';

export type OrderStatus = 'جديد' | 'قيد التحضير' | 'جاهز' | 'تم التسليم' | 'ملغي';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  isOutOfStock?: boolean; // نفد حالياً / نفاذ صنف
  addons: AddonOption[];
  createdAt: string;
}

export interface CartItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart item id
  product: Product;
  quantity: number;
  selectedAddons: CartItemAddon[];
  notes: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  selectedAddons: CartItemAddon[];
  itemTotal: number;
  notes: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  sessionId?: string; // معرف جلسة العميل لمنع تداخل الطلبات بين الأجهزة
  customerName: string;
  customerPhone?: string;
  destinationDetails?: string; // e.g. Office number, Table number
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  staffName?: string;
  estimatedPickupMinutes?: number; // وقت التحضير المحدد بالدقائق (مثل: 5، 10، 15، 30)
  estimatedPickupTime?: string; // وقت الاستلام المتوقع المنسق (مثل: "12:45 م" أو "خلال 10 دقائق")
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: Role;
  phone: string;
  pin?: string; // رمز الدخول السري للموظف (PIN)
  isAvailable: boolean;
  createdAt: string;
}

export interface BuffetSettings {
  buffetName: string;
  currency: string;
  taxPercentage: number;
  allowDeferredPayment: boolean;
  phone: string;
  address: string;
  welcomeMessage: string;
  isOpen: boolean; // حالة البوفيه: true = مفتوح, false = مغلق
  closedReason?: string; // سبب الإغلاق (استراحة، صلاة، صيانة، نفاد المواد...)
  reopenTime?: string; // موعد إعادة الفتح المتوقع (مثلاً: 4:00 عصراً)
  adminPin?: string; // رمز المرور السري للإدارة (الافتراضي: 1234)
}

export interface BlockedCustomer {
  sessionId: string;
  customerName?: string;
  customerPhone?: string;
  reason: string;
  blockedAt: string;
  blockedBy?: string;
}

export interface AppData {
  categories: Category[];
  products: Product[];
  staff: Staff[];
  orders: Order[];
  blockedCustomers: BlockedCustomer[];
  settings: BuffetSettings;
  lastOrderNumber: number;
}
