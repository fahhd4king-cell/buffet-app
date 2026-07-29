export type Role = 'welcome' | 'customer' | 'employee' | 'admin';

export type CategoryId = 'hot-drinks' | 'cold-drinks' | 'sandwiches' | 'fresh-juices';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
}

export interface OptionItem {
  id: string;
  name: string; // e.g. "نعناع طازج", "جبن إضافي", "بدون سكر"
  price: number; // 0 for free, or extra price in SAR
  isAvailable: boolean; // toggle hide/show
}

export interface CustomizationGroup {
  id: string;
  name: string; // e.g. "درجة السكر", "الإضافات والمرمية", "الصوصات والإضافات"
  selectionType: 'single' | 'multiple'; // يسمح باختيار واحد فقط أو عدة خيارات
  isRequired: boolean; // إجباري أم اختياري
  maxSelections?: number; // الحد الأقصى لعدد الخيارات (إلزام اختياري متعدد)
  status: 'active' | 'hidden'; // إخفاء أو إظهار المجموعة بالكامل
  options: OptionItem[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  options: string[];
  defaultOption?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  image: string;
  isAvailable: boolean;
  customizationGroupIds?: string[]; // IDs of CustomizationGroups linked to this item
  customizations?: CustomizationOption[];
  popularScore?: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: Record<string, string>;
  itemNotes?: string;
}

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cash' | 'mada' | 'apple_pay' | 'visa_mastercard' | 'card';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';

export type PaymentGatewayType = 'tap' | 'hyperpay' | 'paytabs' | 'simulated';

export interface PaymentGatewayConfig {
  activeGateway: PaymentGatewayType;
  testMode: boolean;
  enableCashOnDelivery: boolean;
  enableMada: boolean;
  enableApplePay: boolean;
  enableVisaMastercard: boolean;
  gateways: {
    tap: {
      secretKey: string;
      publicKey: string;
      merchantId: string;
    };
    hyperpay: {
      entityId: string;
      accessToken: string;
    };
    paytabs: {
      profileId: string;
      serverKey: string;
      clientKey: string;
    };
  };
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'staff';
  text: string;
  timestamp: string;
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: 'customer' | 'staff' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerOffice?: string; // Optional office or section number for identification upon pickup
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  notes?: string;
  chatMessages: ChatMessage[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string; // e.g. transaction reference ID
  paymentGateway?: string; // Gateway name e.g. "Tap", "HyperPay", "PayTabs", "Cash"
  unreadCountCustomer?: number;
  unreadCountStaff?: number;
  isOpenedByStaff?: boolean;
}

export type StaffRole = 'مشرف البوفيه' | 'موظف بوفيه';

export interface StaffMember {
  id: string;
  name: string;
  username: string;
  password: string;
  phone?: string;
  role: StaffRole;
  status: 'active' | 'inactive';
  shift?: 'الوردية الصباحية' | 'الوردية المسائية';
}

export interface BuffetLocation {
  lat: number;
  lng: number;
  allowedRadiusMeters: number;
  name: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // e.g. "08:15 AM"
  checkOutTime?: string; // e.g. "04:30 PM"
  workingHours?: string; // e.g. "8 س و 15 د"
  status: 'present' | 'completed';
  checkInCoords?: { lat: number; lng: number };
  distanceFromBuffetMeters?: number;
}

export interface DailySalesSummary {
  date: string;
  dayName: string;
  totalRevenue: number;
  ordersCount: number;
}

export interface BuffetStatus {
  isOpen: boolean;
  closureReason: string;
  reopenTime: string;
  autoScheduleEnabled: boolean;
  workingHours: {
    openHour: string; // e.g. "06:00"
    closeHour: string; // e.g. "23:59"
  };
}

