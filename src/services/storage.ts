import { AppData, Category, Product, Staff, Order, BuffetSettings, OrderStatus, BlockedCustomer } from '../types';
import {
  broadcastSupabaseBuffetStatus,
  broadcastSupabaseNewOrder,
  broadcastSupabaseOrderStatus,
  broadcastSupabaseBlockedCustomers,
  broadcastSupabaseCatalog,
  broadcastSupabaseStaff,
} from './supabase';
import { getClientSessionId, getUserMode } from './session';

const STORAGE_KEY = 'buffet_app_data_v1';

const INITIAL_EMPTY_DATA: AppData = {
  categories: [],
  products: [],
  staff: [],
  orders: [],
  blockedCustomers: [],
  settings: {
    buffetName: 'بوفيه فادي',
    currency: 'ر.س',
    taxPercentage: 0,
    allowDeferredPayment: true,
    phone: '966500000000',
    address: 'الفرع الرئيسي - استلام من المحل',
    welcomeMessage: 'مرحباً بكم في بوفيه فادي - اطلب وجبتك ومشروبك واستلم من المحل مباشرة',
    isOpen: true,
    adminPin: '1234',
  },
  lastOrderNumber: 1000
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToData(listener: Listener): () => void {
  listeners.add(listener);

  // Cross-tab broadcast listener
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      notifyListeners();
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function getAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMPTY_DATA));
      return INITIAL_EMPTY_DATA;
    }
    const parsed = JSON.parse(raw);
    const parsedSettings = parsed.settings || {};
    return {
      categories: parsed.categories || [],
      products: parsed.products || [],
      staff: parsed.staff || [],
      orders: parsed.orders || [],
      blockedCustomers: parsed.blockedCustomers || [],
      settings: {
        ...INITIAL_EMPTY_DATA.settings,
        ...parsedSettings,
        isOpen: typeof parsedSettings.isOpen === 'boolean' ? parsedSettings.isOpen : true,
      },
      lastOrderNumber: typeof parsed.lastOrderNumber === 'number' ? parsed.lastOrderNumber : 1000,
    };
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return INITIAL_EMPTY_DATA;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notifyListeners();
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Category Operations
export function addCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
  if (getUserMode() !== 'admin') {
    throw new Error('Unauthorized: Manager permission required.');
  }
  const data = getAppData();
  const newCat: Category = {
    ...category,
    id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
  };
  data.categories.push(newCat);
  saveAppData(data);
  broadcastSupabaseCatalog(data.categories, data.products);
  return newCat;
}

export function updateCategory(id: string, updates: Partial<Category>): void {
  if (getUserMode() !== 'admin') return;
  const data = getAppData();
  data.categories = data.categories.map(c => (c.id === id ? { ...c, ...updates } : c));
  saveAppData(data);
  broadcastSupabaseCatalog(data.categories, data.products);
}

export function deleteCategory(id: string): void {
  if (getUserMode() !== 'admin') return;
  const data = getAppData();
  data.categories = data.categories.filter(c => c.id !== id);
  // Remove category from products or leave them uncategorized
  data.products = data.products.filter(p => p.categoryId !== id);
  saveAppData(data);
  broadcastSupabaseCatalog(data.categories, data.products);
}

// Product Operations
export function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
  if (getUserMode() !== 'admin') {
    throw new Error('Unauthorized: Manager permission required.');
  }
  const data = getAppData();
  const newProd: Product = {
    ...product,
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
  };
  data.products.push(newProd);
  saveAppData(data);
  broadcastSupabaseCatalog(data.categories, data.products);
  return newProd;
}

export function updateProduct(id: string, updates: Partial<Product>): void {
  if (getUserMode() !== 'admin') return;
  const data = getAppData();
  data.products = data.products.map(p => (p.id === id ? { ...p, ...updates } : p));
  saveAppData(data);
  broadcastSupabaseCatalog(data.categories, data.products);
}

export function deleteProduct(id: string): void {
  if (getUserMode() !== 'admin') return;
  const data = getAppData();
  data.products = data.products.filter(p => p.id !== id);
  saveAppData(data);
  broadcastSupabaseCatalog(data.categories, data.products);
}

// Staff Operations
export function addStaff(staffMember: Omit<Staff, 'id' | 'createdAt'>): Staff {
  if (getUserMode() !== 'admin') {
    throw new Error('Unauthorized: Manager permission required.');
  }
  const data = getAppData();
  const newStaff: Staff = {
    ...staffMember,
    id: 'staff_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
  };
  data.staff.push(newStaff);
  saveAppData(data);
  broadcastSupabaseStaff(data.staff);
  return newStaff;
}

export function updateStaff(id: string, updates: Partial<Staff>): void {
  if (getUserMode() !== 'admin') return;
  const data = getAppData();
  data.staff = data.staff.map(s => (s.id === id ? { ...s, ...updates } : s));
  saveAppData(data);
  broadcastSupabaseStaff(data.staff);
}

export function deleteStaff(id: string): void {
  if (getUserMode() !== 'admin') return;
  const data = getAppData();
  data.staff = data.staff.filter(s => s.id !== id);
  saveAppData(data);
  broadcastSupabaseStaff(data.staff);
}

// Order Operations
export function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
  const data = getAppData();
  const nextOrderNum = (data.lastOrderNumber || 1000) + 1;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id: 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    orderNumber: nextOrderNum,
    sessionId: orderData.sessionId || getClientSessionId(),
    createdAt: now,
    updatedAt: now,
  };

  data.orders.unshift(newOrder); // Most recent orders first
  data.lastOrderNumber = nextOrderNum;
  saveAppData(data);

  // Broadcast new order instantly via Supabase Realtime
  broadcastSupabaseNewOrder(newOrder);

  return newOrder;
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  estimatedPickupMinutes?: number,
  estimatedPickupTime?: string
): void {
  // Strict RBAC Guard: Customers cannot change order status
  if (getUserMode() === 'customer') {
    console.warn('RBAC Protection: Customer mode is strictly forbidden from changing order status.');
    return;
  }

  const data = getAppData();
  const now = new Date().toISOString();
  data.orders = data.orders.map(o => {
    if (o.id === id) {
      return {
        ...o,
        status,
        updatedAt: now,
        ...(estimatedPickupMinutes !== undefined ? { estimatedPickupMinutes } : {}),
        ...(estimatedPickupTime !== undefined ? { estimatedPickupTime } : {}),
      };
    }
    return o;
  });
  saveAppData(data);

  // Broadcast order status update instantly via Supabase Realtime
  broadcastSupabaseOrderStatus(id, status, estimatedPickupMinutes, estimatedPickupTime);
}

export function deleteOrder(id: string): void {
  // Strict RBAC Guard: Customers cannot delete orders
  if (getUserMode() === 'customer') {
    console.warn('RBAC Protection: Customer mode is strictly forbidden from deleting orders.');
    return;
  }

  const data = getAppData();
  data.orders = data.orders.filter(o => o.id !== id);
  saveAppData(data);
}

export function setOrderEstimatedPickupTime(id: string, minutes: number): void {
  if (getUserMode() === 'customer') return;

  const data = getAppData();
  const now = new Date();
  const pickupTime = new Date(now.getTime() + minutes * 60000);
  const formattedTime = `خلال ${minutes} دقائق (${pickupTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })})`;

  const targetOrder = data.orders.find(o => o.id === id);
  if (!targetOrder) return;

  updateOrderStatus(id, targetOrder.status, minutes, formattedTime);
}

/**
 * Handle new order received from remote Supabase Realtime broadcast.
 */
export function syncRemoteNewOrder(incomingOrder: Order): void {
  if (!incomingOrder || !incomingOrder.id) return;
  const data = getAppData();
  const exists = data.orders.some(o => o.id === incomingOrder.id);
  if (!exists) {
    data.orders.unshift(incomingOrder);
    if (incomingOrder.orderNumber > (data.lastOrderNumber || 1000)) {
      data.lastOrderNumber = incomingOrder.orderNumber;
    }
    saveAppData(data);
  }
}

/**
 * Handle order status update received from remote Supabase Realtime broadcast.
 */
export function syncRemoteOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  estimatedPickupMinutes?: number,
  estimatedPickupTime?: string
): void {
  if (!orderId || !newStatus) return;
  const data = getAppData();
  let updated = false;
  data.orders = data.orders.map(o => {
    if (o.id === orderId) {
      updated = true;
      return {
        ...o,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(estimatedPickupMinutes !== undefined ? { estimatedPickupMinutes } : {}),
        ...(estimatedPickupTime !== undefined ? { estimatedPickupTime } : {}),
      };
    }
    return o;
  });
  if (updated) {
    saveAppData(data);
  }
}

// Block Customer Operations
export function blockCustomer(
  sessionId: string,
  reason: string,
  customerName?: string,
  customerPhone?: string,
  blockedBy: string = 'الإدارة / المطبخ'
): void {
  if (!sessionId || getUserMode() === 'customer') return;
  const data = getAppData();
  const existingIndex = data.blockedCustomers.findIndex(b => b.sessionId === sessionId);
  const newEntry: BlockedCustomer = {
    sessionId,
    customerName: customerName || 'زبون غير معروف',
    customerPhone: customerPhone || '',
    reason: reason || 'عدم الالتزام بطلب الوجبة / إلغاء مكرر',
    blockedAt: new Date().toISOString(),
    blockedBy,
  };

  if (existingIndex >= 0) {
    data.blockedCustomers[existingIndex] = newEntry;
  } else {
    data.blockedCustomers.unshift(newEntry);
  }

  saveAppData(data);
  broadcastSupabaseBlockedCustomers(data.blockedCustomers);
}

export function unblockCustomer(sessionId: string): void {
  if (!sessionId || getUserMode() === 'customer') return;
  const data = getAppData();
  data.blockedCustomers = data.blockedCustomers.filter(b => b.sessionId !== sessionId);
  saveAppData(data);
  broadcastSupabaseBlockedCustomers(data.blockedCustomers);
}

export function isCustomerBlocked(sessionId: string): boolean {
  if (!sessionId) return false;
  const data = getAppData();
  return data.blockedCustomers.some(b => b.sessionId === sessionId);
}

export function syncRemoteBlockedCustomers(blockedList: BlockedCustomer[]): void {
  if (!Array.isArray(blockedList)) return;
  const data = getAppData();
  data.blockedCustomers = blockedList;
  saveAppData(data);
}

export function syncRemoteSettings(newSettings: BuffetSettings): void {
  if (!newSettings) return;
  const data = getAppData();
  data.settings = { ...data.settings, ...newSettings };
  saveAppData(data);
}

export function syncRemoteCatalog(categories: Category[], products: Product[]): void {
  if (!Array.isArray(categories) || !Array.isArray(products)) return;
  const data = getAppData();
  data.categories = categories;
  data.products = products;
  saveAppData(data);
}

export function syncRemoteStaff(staff: Staff[]): void {
  if (!Array.isArray(staff)) return;
  const data = getAppData();
  data.staff = staff;
  saveAppData(data);
}

// Settings Operations
export function updateSettings(settings: Partial<BuffetSettings>): void {
  if (getUserMode() !== 'admin') {
    console.warn('RBAC Protection: Only Manager can update settings.');
    return;
  }
  const data = getAppData();
  data.settings = { ...data.settings, ...settings };
  saveAppData(data);
  if (typeof settings.isOpen === 'boolean') {
    broadcastSupabaseBuffetStatus(
      settings.isOpen,
      data.settings.closedReason,
      data.settings.reopenTime
    );
  }
}

export function toggleBuffetStatus(
  isOpen: boolean,
  closedReason?: string,
  reopenTime?: string,
  updatedBy: string = 'مدير / موظف'
): void {
  if (getUserMode() === 'customer') {
    console.warn('RBAC Protection: Customer cannot toggle buffet status.');
    return;
  }
  const data = getAppData();
  data.settings.isOpen = isOpen;
  if (isOpen) {
    data.settings.closedReason = '';
    data.settings.reopenTime = '';
  } else {
    if (closedReason !== undefined) data.settings.closedReason = closedReason;
    if (reopenTime !== undefined) data.settings.reopenTime = reopenTime;
  }
  saveAppData(data);
  broadcastSupabaseBuffetStatus(
    isOpen,
    data.settings.closedReason,
    data.settings.reopenTime,
    updatedBy
  );
}

// Reset System completely to ZERO
export function resetAllData(): void {
  if (getUserMode() !== 'admin') {
    console.warn('RBAC Protection: Only Manager can reset system data.');
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMPTY_DATA));
  notifyListeners();
}

// Export / Import
export function exportBackupJSON(): string {
  const data = getAppData();
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.products)) {
      saveAppData(parsed);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
