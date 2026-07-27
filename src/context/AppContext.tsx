import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import confetti from 'canvas-confetti';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getCurrentUserId } from '../lib/supabase';
import {
  Role,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentGatewayConfig,
  StaffMember,
  CategoryId,
  BuffetStatus,
  BuffetLocation,
  AttendanceRecord,
  CustomizationGroup,
  OptionItem,
  ChatMessage,
  AppUser,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_STAFF,
  INITIAL_BUFFET_LOCATION,
  INITIAL_ATTENDANCE,
  INITIAL_OPTION_GROUPS,
} from '../data/initialData';
import { soundManager } from '../utils/audio';
import { calculateDistanceMeters } from '../utils/location';
import { hashPassword, verifyPassword } from '../utils/security';
import { sendPushNotification, requestNotificationPermission } from '../utils/notifications';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  menuItems: MenuItem[];
  categories: typeof INITIAL_CATEGORIES;
  orders: Order[];
  staff: StaffMember[];
  cart: OrderItem[];
  optionGroups: CustomizationGroup[];
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (cat: CategoryId | 'all') => void;
  activeBranch: string;
  setActiveBranch: (branch: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Customer Accounts
  customerUser: AppUser | null;
  registerCustomerUser: (data: { name: string; username: string; password: string }) => Promise<{ success: boolean; message: string }>;
  loginCustomerUser: (data: { username: string; password: string }) => Promise<{ success: boolean; message: string }>;
  logoutCustomerUser: () => void;

  // Unread Order Counter for Staff
  unreadStaffOrdersCount: number;
  markStaffOrdersAsRead: () => void;

  // Supabase Auth & Config Modals
  authUser: User | null;
  userId: string;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;

  // Option Groups & Customizations Management
  addOptionGroup: (group: Omit<CustomizationGroup, 'id'>) => void;
  updateOptionGroup: (group: CustomizationGroup) => void;
  deleteOptionGroup: (id: string) => void;
  toggleOptionGroupStatus: (id: string) => void;
  reorderOptionGroups: (groups: CustomizationGroup[]) => void;
  addOptionToGroup: (groupId: string, option: Omit<OptionItem, 'id'>) => void;
  updateOptionInGroup: (groupId: string, option: OptionItem) => void;
  deleteOptionFromGroup: (groupId: string, optionId: string) => void;
  toggleOptionAvailability: (groupId: string, optionId: string) => void;
  reorderOptionsInGroup: (groupId: string, options: OptionItem[]) => void;
  linkGroupToMenuItem: (menuItemId: string, groupId: string) => void;
  unlinkGroupFromMenuItem: (menuItemId: string, groupId: string) => void;

  // Staff Login / Authentication
  currentStaff: StaffMember | null;
  loginStaff: (username: string, pass: string) => boolean;
  logoutStaff: () => void;

  // GPS & Attendance
  buffetLocation: BuffetLocation;
  updateBuffetLocation: (loc: BuffetLocation) => void;
  attendanceRecords: AttendanceRecord[];
  clockInStaff: (staffId: string, lat: number, lng: number) => Promise<{ success: boolean; message: string; distance: number }>;
  clockOutStaff: (staffId: string, lat: number, lng: number) => Promise<{ success: boolean; message: string; distance: number }>;

  // Buffet Open/Close Status
  buffetStatus: BuffetStatus;
  setBuffetIsOpen: (isOpen: boolean, closureReason?: string, reopenTime?: string) => void;
  updateBuffetSchedule: (autoScheduleEnabled: boolean, openHour: string, closeHour: string) => void;

  // Cart operations
  addToCart: (item: OrderItem) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Order operations
  placeOrder: (
    customerName: string,
    customerOffice: string,
    paymentMethod: PaymentMethod,
    notes?: string,
    paymentStatus?: PaymentStatus,
    paymentReference?: string,
    paymentGateway?: string
  ) => string;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  toggleOrderPaymentStatus: (orderId: string, targetStatus?: PaymentStatus) => void;
  addChatMessage: (orderId: string, text: string, sender: 'customer' | 'staff') => void;

  // Payment Gateway Configuration
  paymentGatewayConfig: PaymentGatewayConfig;
  updatePaymentGatewayConfig: (config: PaymentGatewayConfig) => void;

  // Menu Management
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;

  // Staff Management
  addStaff: (member: Omit<StaffMember, 'id'>) => void;
  updateStaff: (member: StaffMember) => void;
  deleteStaff: (id: string) => void;

  // Notification Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  clearToast: () => void;
  showToastMessage: (msg: string, type?: 'success' | 'info' | 'warning') => void;

  // Reset demo
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_MENU = 'buffet_app_menu_v1';
const LOCAL_STORAGE_KEY_ORDERS = 'buffet_app_orders_v1';
const LOCAL_STORAGE_KEY_STAFF = 'buffet_app_staff_v1';
const LOCAL_STORAGE_KEY_STATUS = 'buffet_app_status_v1';
const LOCAL_STORAGE_KEY_LOCATION = 'buffet_app_location_v1';
const LOCAL_STORAGE_KEY_ATTENDANCE = 'buffet_app_attendance_v1';
const LOCAL_STORAGE_KEY_CURRENT_STAFF = 'buffet_app_current_staff_v1';
const LOCAL_STORAGE_KEY_OPTION_GROUPS = 'buffet_app_option_groups_v1';
const LOCAL_STORAGE_KEY_GATEWAY_CONFIG = 'buffet_app_gateway_config_v1';
const LOCAL_STORAGE_KEY_CUSTOMER_USER = 'buffet_app_customer_user_v1';
const LOCAL_STORAGE_KEY_ALL_CUSTOMERS = 'buffet_app_all_customers_v1';

const DEFAULT_GATEWAY_CONFIG: PaymentGatewayConfig = {
  activeGateway: 'simulated',
  testMode: true,
  enableCashOnDelivery: true,
  enableMada: true,
  enableApplePay: true,
  enableVisaMastercard: true,
  gateways: {
    tap: { secretKey: '', publicKey: '', merchantId: '' },
    hyperpay: { entityId: '', accessToken: '' },
    paytabs: { profileId: '', serverKey: '', clientKey: '' },
  },
};

const DEFAULT_BUFFET_STATUS: BuffetStatus = {
  isOpen: true,
  closureReason: 'انتهى وقت الدوام الرسمي',
  reopenTime: '6:00 صباحاً',
  autoScheduleEnabled: false,
  workingHours: {
    openHour: '06:00',
    closeHour: '23:59',
  },
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [activeBranch, setActiveBranch] = useState<string>('بوفيه فادي');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Customer Account State
  const [customerUser, setCustomerUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMER_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Unread orders for staff
  const [unreadStaffOrdersCount, setUnreadStaffOrdersCount] = useState<number>(0);

  // Auth & Modals State
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMER_USER);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id) return parsed.id;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Audio trigger tracking to prevent duplicates
  const processedOrderIdsRef = useRef<Set<string>>(new Set());

  // Initialize Menu
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_MENU);
      if (saved) return JSON.parse(saved);
      return INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  // Initialize Orders - Clean slate for live production
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_ORDERS);
      return [];
    } catch {
      return [];
    }
  });

  // Initialize Staff
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STAFF);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  // Initialize Buffet Status
  const [buffetStatus, setBuffetStatus] = useState<BuffetStatus>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STATUS);
      if (saved) return JSON.parse(saved);
      return DEFAULT_BUFFET_STATUS;
    } catch {
      return DEFAULT_BUFFET_STATUS;
    }
  });

  // Initialize Current Logged-in Staff
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_STAFF);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Initialize Buffet Location
  const [buffetLocation, setBuffetLocation] = useState<BuffetLocation>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LOCATION);
      return saved ? JSON.parse(saved) : INITIAL_BUFFET_LOCATION;
    } catch {
      return INITIAL_BUFFET_LOCATION;
    }
  });

  // Initialize Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ATTENDANCE);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  // Initialize Customization Option Groups
  const [optionGroups, setOptionGroups] = useState<CustomizationGroup[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_OPTION_GROUPS);
      return saved ? JSON.parse(saved) : INITIAL_OPTION_GROUPS;
    } catch {
      return INITIAL_OPTION_GROUPS;
    }
  });

  // Initialize Payment Gateway Config
  const [paymentGatewayConfig, setPaymentGatewayConfig] = useState<PaymentGatewayConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_GATEWAY_CONFIG);
      return saved ? { ...DEFAULT_GATEWAY_CONFIG, ...JSON.parse(saved) } : DEFAULT_GATEWAY_CONFIG;
    } catch {
      return DEFAULT_GATEWAY_CONFIG;
    }
  });

  // Supabase Auth Listener
  useEffect(() => {
    getCurrentUserId().then((id) => setUserId(id));

    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setAuthUser(data.user);
          setUserId(data.user.id);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setAuthUser(session.user);
          setUserId(session.user.id);
        } else {
          setAuthUser(null);
          getCurrentUserId().then((id) => setUserId(id));
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // Fetch initial data & subscribe to Realtime via Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    let isMounted = true;

    // Fetch initial orders
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0 && isMounted) {
          const mapped: Order[] = data.map((d: any) => ({
            id: d.id || d.order_number,
            customerName: d.customer_name || 'عميل البوفيه',
            customerOffice: d.customer_office || '',
            items: d.items || [],
            totalPrice: Number(d.total_price) || 0,
            status: d.status || 'received',
            createdAt: d.created_at || new Date().toISOString(),
            updatedAt: d.updated_at || new Date().toISOString(),
            notes: d.notes || '',
            chatMessages: d.chat_messages || [],
            paymentMethod: d.payment_method || 'cash',
            paymentStatus: d.payment_status || 'unpaid',
            paymentReference: d.payment_reference,
            paymentGateway: d.payment_gateway,
          }));
          setOrders(mapped);
          mapped.forEach((o) => processedOrderIdsRef.current.add(o.id));
        }
      });

    // Fetch initial staff
    supabase
      .from('staff')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0 && isMounted) {
          setStaff(data as StaffMember[]);
        }
      });

    // Fetch initial buffet status
    supabase
      .from('buffet_status')
      .select('*')
      .eq('id', 'main')
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data && isMounted) {
          setBuffetStatus((prev) => ({
            ...prev,
            isOpen: Boolean(data.is_open),
            closureReason: data.closure_reason || prev.closureReason,
            reopenTime: data.reopen_time || prev.reopenTime,
            autoScheduleEnabled: Boolean(data.auto_schedule_enabled),
            workingHours: data.working_hours || prev.workingHours,
          }));
        }
      });

    // Fetch initial menu items
    supabase
      .from('menu_items')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0 && isMounted) {
          const mapped: MenuItem[] = data.map((m: any) => ({
            id: m.id,
            name: m.name,
            description: m.description || '',
            price: Number(m.price) || 0,
            category: m.category,
            image: m.image || '',
            isAvailable: Boolean(m.is_available),
            customizationGroupIds: m.customization_group_ids || [],
          }));
          setMenuItems(mapped);
        }
      });

    // Subscribe to Realtime Postgres Changes
    const channel = supabase
      .channel('buffet_global_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row: any = payload.new;
            const newOrder: Order = {
              id: row.id || row.order_number,
              customerName: row.customer_name || 'عميل البوفيه',
              customerOffice: row.customer_office || '',
              items: row.items || [],
              totalPrice: Number(row.total_price) || 0,
              status: row.status || 'received',
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || new Date().toISOString(),
              notes: row.notes || '',
              chatMessages: row.chat_messages || [],
              paymentMethod: row.payment_method || 'cash',
              paymentStatus: row.payment_status || 'unpaid',
              paymentReference: row.payment_reference,
              paymentGateway: row.payment_gateway,
            };

            setOrders((prev) => {
              if (prev.some((o) => o.id === newOrder.id)) return prev;
              return [newOrder, ...prev];
            });

            // Play notification sound if not locally created
            if (!processedOrderIdsRef.current.has(newOrder.id)) {
              processedOrderIdsRef.current.add(newOrder.id);
              soundManager.playNewOrderSound();
              showToastMessage(`وصل طلب جديد ${newOrder.id} (${newOrder.customerName})! 🔔`, 'success');
            }
          } else if (payload.eventType === 'UPDATE') {
            const row: any = payload.new;
            const updatedId = row.id || row.order_number;
            const updatedStatus = row.status as OrderStatus;

            setOrders((prev) =>
              prev.map((o) => {
                if (o.id === updatedId) {
                  // Check if status changed to ready
                  if (o.status !== 'ready' && updatedStatus === 'ready') {
                    soundManager.playOrderReadySound();
                    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                    showToastMessage(`طلبك ${updatedId} أصبح جاهزاً الآن من البوفيه! 🔔`, 'success');
                  }
                  return {
                    ...o,
                    status: updatedStatus,
                    paymentStatus: row.payment_status || o.paymentStatus,
                    chatMessages: row.chat_messages || o.chatMessages,
                    updatedAt: row.updated_at || new Date().toISOString(),
                  };
                }
                return o;
              })
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'buffet_status' },
        (payload) => {
          if (payload.new) {
            const row: any = payload.new;
            setBuffetStatus((prev) => ({
              ...prev,
              isOpen: Boolean(row.is_open),
              closureReason: row.closure_reason ?? prev.closureReason,
              reopenTime: row.reopen_time ?? prev.reopenTime,
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row: StaffMember = payload.new as StaffMember;
            setStaff((prev) => {
              if (prev.some((s) => s.id === row.id)) return prev;
              return [...prev, row];
            });
          } else if (payload.eventType === 'UPDATE') {
            const row: StaffMember = payload.new as StaffMember;
            setStaff((prev) => prev.map((s) => (s.id === row.id ? row : s)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setStaff((prev) => prev.filter((s) => s.id !== oldId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const m: any = payload.new;
            const updatedItem: MenuItem = {
              id: m.id,
              name: m.name,
              description: m.description || '',
              price: Number(m.price) || 0,
              category: m.category,
              image: m.image || '',
              isAvailable: Boolean(m.is_available),
              customizationGroupIds: m.customization_group_ids || [],
            };
            setMenuItems((prev) => {
              const idx = prev.findIndex((item) => item.id === updatedItem.id);
              if (idx > -1) {
                const copy = [...prev];
                copy[idx] = updatedItem;
                return copy;
              }
              return [updatedItem, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setMenuItems((prev) => prev.filter((m) => m.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, []);

  // Save to LocalStorage as secondary cache
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_MENU, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STATUS, JSON.stringify(buffetStatus));
  }, [buffetStatus]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOCATION, JSON.stringify(buffetLocation));
  }, [buffetLocation]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_OPTION_GROUPS, JSON.stringify(optionGroups));
  }, [optionGroups]);

  useEffect(() => {
    if (currentStaff) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_STAFF, JSON.stringify(currentStaff));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_STAFF);
    }
  }, [currentStaff]);

  const showToastMessage = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  const clearToast = () => setToast(null);

  // Customer Account Registration
  const registerCustomerUser = async ({
    name,
    username,
    password,
  }: {
    name: string;
    username: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanUsername || !password) {
      return { success: false, message: 'يرجى إدخال جميع البيانات المطلوبة' };
    }

    let isUsernameTaken = false;

    // Check Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('app_users').select('id').eq('username', cleanUsername).maybeSingle();
      if (data) isUsernameTaken = true;
    }

    // Check LocalStorage fallback
    if (!isUsernameTaken) {
      try {
        const savedUsers: AppUser[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ALL_CUSTOMERS) || '[]');
        if (savedUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
          isUsernameTaken = true;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (isUsernameTaken) {
      return { success: false, message: 'اسم المستخدم مستخدم مسبقاً، يرجى اختيار اسم آخر ❌' };
    }

    // Securely hash password
    const passwordHash = await hashPassword(password);
    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newUser: AppUser = {
      id: newUserId,
      name: cleanName,
      username: cleanUsername,
      passwordHash,
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase
    if (isSupabaseConfigured() && supabase) {
      supabase.from('app_users').insert({
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        password_hash: newUser.passwordHash,
        role: newUser.role,
        status: newUser.status,
        created_at: newUser.createdAt,
      }).then(({ error }) => {
        if (error) console.error('Error inserting app_user to Supabase:', error);
      });
    }

    // Save to LocalStorage
    try {
      const savedUsers: AppUser[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ALL_CUSTOMERS) || '[]');
      savedUsers.push(newUser);
      localStorage.setItem(LOCAL_STORAGE_KEY_ALL_CUSTOMERS, JSON.stringify(savedUsers));
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMER_USER, JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }

    setCustomerUser(newUser);
    setUserId(newUser.id);
    showToastMessage(`أهلاً بك يا ${cleanName}! تم إنشاء الحساب بنجاح ✨`, 'success');

    return { success: true, message: 'تم إنشاء الحساب بنجاح! ✨' };
  };

  // Customer Account Login
  const loginCustomerUser = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> => {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !password) {
      return { success: false, message: 'يرجى إدخال اسم المستخدم وكلمة المرور' };
    }

    let foundUser: AppUser | null = null;

    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('app_users').select('*').eq('username', cleanUsername).maybeSingle();
      if (data) {
        foundUser = {
          id: data.id,
          name: data.name,
          username: data.username,
          passwordHash: data.password_hash,
          role: data.role || 'customer',
          status: data.status || 'active',
          createdAt: data.created_at || new Date().toISOString(),
        };
      }
    }

    if (!foundUser) {
      try {
        const savedUsers: AppUser[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ALL_CUSTOMERS) || '[]');
        const localMatch = savedUsers.find((u) => u.username.toLowerCase() === cleanUsername);
        if (localMatch) foundUser = localMatch;
      } catch (e) {
        console.error(e);
      }
    }

    if (!foundUser) {
      return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة ❌' };
    }

    if (foundUser.status === 'inactive') {
      return { success: false, message: 'الحساب معطل حالياً، يرجى التواصل مع الإدارة.' };
    }

    const isValid = await verifyPassword(password, foundUser.passwordHash);
    if (!isValid) {
      return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة ❌' };
    }

    setCustomerUser(foundUser);
    setUserId(foundUser.id);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMER_USER, JSON.stringify(foundUser));
    } catch (e) {
      console.error(e);
    }
    showToastMessage(`مرحباً بعودتك يا ${foundUser.name}! 👋`, 'success');

    return { success: true, message: 'تم تسجيل الدخول بنجاح! 🎉' };
  };

  const logoutCustomerUser = () => {
    setCustomerUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CUSTOMER_USER);
    showToastMessage('تم تسجيل الخروج بنجاح 👋', 'info');
  };

  const markStaffOrdersAsRead = () => {
    setUnreadStaffOrdersCount(0);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    showToastMessage(next ? 'تم تفعيل التنبيهات الصوتية 🔔' : 'تم كتم التنبيهات الصوتية 🔕', 'info');
  };

  // Option Groups CRUD Handlers
  const addOptionGroup = (groupData: Omit<CustomizationGroup, 'id'>) => {
    const newGroup: CustomizationGroup = {
      ...groupData,
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...optionGroups, newGroup];
    setOptionGroups(updated);
    showToastMessage(`تمت إضافة مجموعة الخيارات "${newGroup.name}" بنجاح ✨`, 'success');
  };

  const updateOptionGroup = (group: CustomizationGroup) => {
    const updated = optionGroups.map((g) => (g.id === group.id ? group : g));
    setOptionGroups(updated);
    showToastMessage(`تم تحديث مجموعة "${group.name}" بنجاح ✏️`, 'success');
  };

  const deleteOptionGroup = (id: string) => {
    const groupName = optionGroups.find((g) => g.id === id)?.name;
    const updatedGroups = optionGroups.filter((g) => g.id !== id);
    setOptionGroups(updatedGroups);

    const updatedMenuItems = menuItems.map((item) => {
      if (item.customizationGroupIds?.includes(id)) {
        return {
          ...item,
          customizationGroupIds: item.customizationGroupIds.filter((gid) => gid !== id),
        };
      }
      return item;
    });
    setMenuItems(updatedMenuItems);
    showToastMessage(`تم حذف مجموعة الخيارات "${groupName || ''}" بنجاح 🗑️`, 'info');
  };

  const toggleOptionGroupStatus = (id: string) => {
    const updated = optionGroups.map((g) =>
      g.id === id ? { ...g, status: g.status === 'active' ? ('hidden' as const) : ('active' as const) } : g
    );
    setOptionGroups(updated);
  };

  const reorderOptionGroups = (groups: CustomizationGroup[]) => {
    setOptionGroups(groups);
  };

  const addOptionToGroup = (groupId: string, optionData: Omit<OptionItem, 'id'>) => {
    const newOpt: OptionItem = {
      ...optionData,
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = optionGroups.map((g) => {
      if (g.id === groupId) {
        return { ...g, options: [...g.options, newOpt] };
      }
      return g;
    });
    setOptionGroups(updated);
    showToastMessage(`تمت إضافة خيار "${newOpt.name}" بنجاح ➕`, 'success');
  };

  const updateOptionInGroup = (groupId: string, option: OptionItem) => {
    const updated = optionGroups.map((g) => {
      if (g.id === groupId) {
        return { ...g, options: g.options.map((o) => (o.id === option.id ? option : o)) };
      }
      return g;
    });
    setOptionGroups(updated);
    showToastMessage(`تم تحديث الخيار "${option.name}" بنجاح ✏️`, 'success');
  };

  const deleteOptionFromGroup = (groupId: string, optionId: string) => {
    const updated = optionGroups.map((g) => {
      if (g.id === groupId) {
        return { ...g, options: g.options.filter((o) => o.id !== optionId) };
      }
      return g;
    });
    setOptionGroups(updated);
    showToastMessage('تم حذف الخيار بنجاح 🗑️', 'info');
  };

  const toggleOptionAvailability = (groupId: string, optionId: string) => {
    const updated = optionGroups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          options: g.options.map((o) => (o.id === optionId ? { ...o, isAvailable: !o.isAvailable } : o)),
        };
      }
      return g;
    });
    setOptionGroups(updated);
  };

  const reorderOptionsInGroup = (groupId: string, options: OptionItem[]) => {
    const updated = optionGroups.map((g) => (g.id === groupId ? { ...g, options } : g));
    setOptionGroups(updated);
  };

  const linkGroupToMenuItem = (menuItemId: string, groupId: string) => {
    const updated = menuItems.map((item) => {
      if (item.id === menuItemId) {
        const currentIds = item.customizationGroupIds || [];
        if (!currentIds.includes(groupId)) {
          return { ...item, customizationGroupIds: [...currentIds, groupId] };
        }
      }
      return item;
    });
    setMenuItems(updated);
  };

  const unlinkGroupFromMenuItem = (menuItemId: string, groupId: string) => {
    const updated = menuItems.map((item) => {
      if (item.id === menuItemId && item.customizationGroupIds) {
        return {
          ...item,
          customizationGroupIds: item.customizationGroupIds.filter((gid) => gid !== groupId),
        };
      }
      return item;
    });
    setMenuItems(updated);
  };

  // Staff Authentication Methods
  const loginStaff = (username: string, pass: string): boolean => {
    const found = staff.find(
      (s) => (s.username?.toLowerCase() || '').trim() === (username?.toLowerCase() || '').trim() && s.password === pass
    );
    if (found) {
      if (found.status === 'inactive') {
        showToastMessage('حساب هذا الموظف غير نشط حالياً، يرجى مراجعة إدارة البوفيه.', 'warning');
        return false;
      }
      setCurrentStaff(found);
      const roleTitle = found.role || 'مشرف البوفيه';
      showToastMessage(`مرحباً بك يا ${found.name} (${roleTitle}) 👋`, 'success');
      return true;
    }
    showToastMessage('اسم المستخدم أو كلمة المرور غير صحيحة ❌', 'warning');
    return false;
  };

  const logoutStaff = () => {
    setCurrentStaff(null);
    showToastMessage('تم تسجيل خروج الموظف 👋', 'info');
  };

  // GPS & Attendance
  const updateBuffetLocation = (loc: BuffetLocation) => {
    setBuffetLocation(loc);
    showToastMessage('تم تحديث موقع ونطاق البوفيه بنجاح 📍', 'success');
  };

  const clockInStaff = async (
    staffId: string,
    lat: number,
    lng: number
  ): Promise<{ success: boolean; message: string; distance: number }> => {
    const distance = calculateDistanceMeters(lat, lng, buffetLocation.lat, buffetLocation.lng);
    if (distance > buffetLocation.allowedRadiusMeters) {
      const errorMsg = 'يجب أن تكون داخل البوفيه لتسجيل الحضور';
      showToastMessage(errorMsg, 'warning');
      return { success: false, message: errorMsg, distance };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const targetStaff = staff.find((s) => s.id === staffId);
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      staffId,
      staffName: targetStaff ? targetStaff.name : 'موظف البوفيه',
      date: todayStr,
      checkInTime: timeStr,
      status: 'present',
      checkInCoords: { lat, lng },
      distanceFromBuffetMeters: distance,
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    const successMsg = `تم تسجيل الحضور بنجاح الساعة ${timeStr} 📍 (${distance} متر من البوفيه)`;
    showToastMessage(successMsg, 'success');
    return { success: true, message: successMsg, distance };
  };

  const clockOutStaff = async (
    staffId: string,
    lat: number,
    lng: number
  ): Promise<{ success: boolean; message: string; distance: number }> => {
    const distance = calculateDistanceMeters(lat, lng, buffetLocation.lat, buffetLocation.lng);
    if (distance > buffetLocation.allowedRadiusMeters) {
      const errorMsg = 'يجب أن تكون داخل البوفيه لتسجيل الانصراف';
      showToastMessage(errorMsg, 'warning');
      return { success: false, message: errorMsg, distance };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    setAttendanceRecords((prev) => {
      let updated = false;
      const next = prev.map((rec) => {
        if (rec.staffId === staffId && rec.date === todayStr && rec.status === 'present') {
          updated = true;
          return {
            ...rec,
            checkOutTime: timeStr,
            status: 'completed' as const,
            workingHours: '8 ساعات',
          };
        }
        return rec;
      });
      if (!updated) {
        const targetStaff = staff.find((s) => s.id === staffId);
        next.unshift({
          id: `att_${Date.now()}`,
          staffId,
          staffName: targetStaff ? targetStaff.name : 'مشرف البوفيه',
          date: todayStr,
          checkInTime: 'غير مسجل',
          checkOutTime: timeStr,
          status: 'completed',
          distanceFromBuffetMeters: distance,
        });
      }
      return next;
    });

    const successMsg = `تم تسجيل الانصراف بنجاح الساعة ${timeStr} 📍`;
    showToastMessage(successMsg, 'success');
    return { success: true, message: successMsg, distance };
  };

  // Buffet Open/Close Status
  const setBuffetIsOpen = (isOpen: boolean, closureReason?: string, reopenTime?: string) => {
    const nextStatus: BuffetStatus = {
      ...buffetStatus,
      isOpen,
      closureReason: closureReason ?? buffetStatus.closureReason,
      reopenTime: reopenTime ?? buffetStatus.reopenTime,
    };
    setBuffetStatus(nextStatus);

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('buffet_status')
        .upsert({
          id: 'main',
          is_open: isOpen,
          closure_reason: closureReason ?? buffetStatus.closureReason,
          reopen_time: reopenTime ?? buffetStatus.reopenTime,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error('Error updating buffet_status in Supabase:', error);
        });
    }

    if (isOpen) {
      showToastMessage('تم فتح البوفيه وتفعيل استقبال الطلبات 🟢', 'success');
    } else {
      showToastMessage('تم إغلاق البوفيه وتعطيل إرسال الطلبات الجديدة 🔴', 'warning');
    }
  };

  const updateBuffetSchedule = (autoScheduleEnabled: boolean, openHour: string, closeHour: string) => {
    const nextStatus: BuffetStatus = {
      ...buffetStatus,
      autoScheduleEnabled,
      workingHours: { openHour, closeHour },
    };
    setBuffetStatus(nextStatus);

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('buffet_status')
        .upsert({
          id: 'main',
          auto_schedule_enabled: autoScheduleEnabled,
          working_hours: { openHour, closeHour },
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error('Error updating buffet schedule:', error);
        });
    }

    showToastMessage('تم حفظ إعدادات مواعيد وساعات العمل التلقائية ⏰', 'info');
  };

  // Cart logic
  const addToCart = (newItem: OrderItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.menuItemId === newItem.menuItemId &&
          JSON.stringify(i.selectedOptions) === JSON.stringify(newItem.selectedOptions) &&
          i.itemNotes === newItem.itemNotes
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += newItem.quantity;
        return copy;
      }
      return [...prev, newItem];
    });
    showToastMessage(`تمت إضافة "${newItem.name}" إلى السلة 🛒`, 'success');
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const copy = [...prev];
      copy[index].quantity = quantity;
      return copy;
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updatePaymentGatewayConfig = (newConfig: PaymentGatewayConfig) => {
    setPaymentGatewayConfig(newConfig);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_GATEWAY_CONFIG, JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
    showToastMessage('تم حفظ إعدادات بوابة الدفع الإلكتروني بنجاح ⚙️💳', 'success');
  };

  // Place Order
  const placeOrder = (
    customerName: string,
    customerOffice: string,
    paymentMethod: PaymentMethod,
    notes?: string,
    paymentStatus?: PaymentStatus,
    paymentReference?: string,
    paymentGateway?: string
  ): string => {
    if (!buffetStatus.isOpen) {
      showToastMessage(`عذراً، البوفيه مغلق حالياً (${buffetStatus.closureReason || 'انتهى وقت الدوام'}).`, 'warning');
      return '';
    }

    const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const calculatedPaymentStatus: PaymentStatus = paymentStatus || (paymentMethod === 'cash' ? 'unpaid' : 'paid');

    let defaultGatewayName = paymentGateway;
    if (!defaultGatewayName) {
      if (paymentMethod === 'cash') {
        defaultGatewayName = 'الدفع عند الاستلام';
      } else if (paymentMethod === 'apple_pay') {
        defaultGatewayName = 'Apple Pay';
      } else if (paymentMethod === 'mada') {
        defaultGatewayName = 'بطاقة مدى';
      } else {
        defaultGatewayName = 'بوابة الدفع الإلكتروني';
      }
    }

    const currentUserIdVal = customerUser ? customerUser.id : (userId || 'anon_guest');
    const finalCustomerName = customerName.trim() || (customerUser ? customerUser.name : 'عميل البوفيه');

    const newOrder: Order = {
      id: orderNumber,
      userId: currentUserIdVal,
      customerName: finalCustomerName,
      customerOffice: customerOffice || 'استلام مباشر',
      items: [...cart],
      totalPrice: cartTotal,
      status: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: notes || '',
      paymentMethod,
      paymentStatus: calculatedPaymentStatus,
      paymentReference: paymentReference || (calculatedPaymentStatus === 'paid' ? `PAY-${Math.floor(100000 + Math.random() * 900000)}` : undefined),
      paymentGateway: defaultGatewayName,
      chatMessages: [],
    };

    processedOrderIdsRef.current.add(newOrder.id);
    setOrders((prev) => [newOrder, ...prev]);
    setUnreadStaffOrdersCount((prev) => prev + 1);
    clearCart();

    // Insert into Supabase
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('orders')
        .insert({
          user_id: currentUserIdVal,
          order_number: orderNumber,
          customer_name: finalCustomerName,
          customer_office: customerOffice || '',
          items: newOrder.items,
          total_price: cartTotal,
          payment_method: paymentMethod,
          payment_status: calculatedPaymentStatus,
          payment_reference: newOrder.paymentReference,
          payment_gateway: defaultGatewayName,
          status: 'received',
          notes: notes || '',
          chat_messages: [],
          created_at: newOrder.createdAt,
          updated_at: newOrder.updatedAt,
        })
        .then(({ error }) => {
          if (error) console.error('Error inserting order to Supabase:', error);
        });
    }

    soundManager.playNewOrderSound();
    if (calculatedPaymentStatus === 'paid') {
      showToastMessage('تم استلام الدفع الإلكتروني بنجاح! تم إرسال طلبك للبوفيه 💳✅', 'success');
    } else {
      showToastMessage('تم إرسال طلبك بنجاح! يرجى الدفع عند الاستلام في البوفيه 💵', 'success');
    }

    return orderNumber;
  };

  // Toggle order payment status
  const toggleOrderPaymentStatus = (orderId: string, targetStatus?: PaymentStatus) => {
    let nextPayStatus: PaymentStatus = 'paid';
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          nextPayStatus = targetStatus || (o.paymentStatus === 'paid' ? 'unpaid' : 'paid');
          return {
            ...o,
            paymentStatus: nextPayStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('orders')
        .update({
          payment_status: nextPayStatus,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .then(({ error }) => {
          if (error) console.error('Error updating payment status in Supabase:', error);
        });
    }

    showToastMessage('تم تحديث حالة الدفع للطلب بنجاح 💵', 'success');
  };

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    let targetOrderName = '';
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          targetOrderName = o.customerName;
          return {
            ...o,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .then(({ error }) => {
          if (error) console.error('Error updating order status in Supabase:', error);
        });
    }

    if (newStatus === 'received') {
      showToastMessage(`طلب ${orderId}: تم استلام طلبك وجارٍ تحضيره.`, 'info');
      sendPushNotification(`البوفيه - طلب ${orderId}`, 'تم استلام طلبك وجارٍ تحضيره.');
    } else if (newStatus === 'preparing') {
      soundManager.playNewOrderSound();
      showToastMessage(`طلب ${orderId}: طلبك قيد التحضير الآن. 👨‍🍳`, 'info');
      sendPushNotification(`البوفيه - طلب ${orderId}`, 'طلبك قيد التحضير الآن.');
    } else if (newStatus === 'ready') {
      soundManager.playOrderReadySound();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      showToastMessage(`🎉 طلبك ${orderId} جاهز للاستلام، يرجى التوجه إلى البوفيه.`, 'success');
      sendPushNotification(`البوفيه - طلب ${orderId}`, '🎉 طلبك جاهز للاستلام، يرجى التوجه إلى البوفيه.');
    } else if (newStatus === 'cancelled') {
      showToastMessage(`طلب ${orderId}: تم إلغاء الطلب، يرجى التواصل مع البوفيه.`, 'warning');
      sendPushNotification(`البوفيه - طلب ${orderId}`, 'تم إلغاء الطلب، يرجى التواصل مع البوفيه.');
    } else if (newStatus === 'delivered') {
      showToastMessage(`طلب ${orderId}: تم استلام الطلب بنجاح ✅`, 'success');
    }
  };

  // Chat message
  const addChatMessage = (orderId: string, text: string, sender: 'customer' | 'staff') => {
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    let updatedChatMessages: ChatMessage[] = [];

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            sender,
            text,
            timestamp: timeStr,
          };
          updatedChatMessages = [...o.chatMessages, newMsg];
          return {
            ...o,
            chatMessages: updatedChatMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('orders')
        .update({
          chat_messages: updatedChatMessages,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .then(({ error }) => {
          if (error) console.error('Error updating chat in Supabase:', error);
        });
    }
  };

  // Menu Operations
  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `m_${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('menu_items')
        .insert({
          id: newItem.id,
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          category: newItem.category,
          image: newItem.image,
          is_available: newItem.isAvailable,
          customization_group_ids: newItem.customizationGroupIds || [],
        })
        .then(({ error }) => {
          if (error) console.error('Error inserting menu item into Supabase:', error);
        });
    }

    showToastMessage(`تمت إضافة الصنف "${newItem.name}" إلى المنيو`, 'success');
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('menu_items')
        .upsert({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          is_available: item.isAvailable,
          customization_group_ids: item.customizationGroupIds || [],
        })
        .then(({ error }) => {
          if (error) console.error('Error updating menu item in Supabase:', error);
        });
    }

    showToastMessage(`تم تحديث بيانات الصنف "${item.name}"`, 'info');
  };

  const deleteMenuItem = (id: string) => {
    const target = menuItems.find((m) => m.id === id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting menu item in Supabase:', error);
        });
    }

    if (target) showToastMessage(`تم حذف الصنف "${target.name}"`, 'warning');
  };

  const toggleItemAvailability = (id: string) => {
    let nextAvail = true;
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          nextAvail = !m.isAvailable;
          return { ...m, isAvailable: nextAvail };
        }
        return m;
      })
    );

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('menu_items')
        .update({ is_available: nextAvail })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error toggling availability in Supabase:', error);
        });
    }

    showToastMessage(nextAvail ? 'تم إتاحة الصنف 🟢' : 'تم إيقاف الصنف مؤقتاً 🔴', nextAvail ? 'success' : 'warning');
  };

  // Staff Operations
  const addStaff = (memberData: Omit<StaffMember, 'id'>) => {
    // Prevent duplicate usernames
    const exists = staff.some((s) => s.username.toLowerCase() === memberData.username.toLowerCase());
    if (exists) {
      showToastMessage(`اسم المستخدم "${memberData.username}" مستخدم بالفعل، اختر اسماً آخر.`, 'warning');
      return;
    }

    const newMember: StaffMember = {
      ...memberData,
      id: `s_${Date.now()}`,
    };
    setStaff((prev) => [...prev, newMember]);

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('staff')
        .insert(newMember)
        .then(({ error }) => {
          if (error) console.error('Error inserting staff into Supabase:', error);
        });
    }

    showToastMessage(`تمت إضافة الموظف "${newMember.name}" بنجاح`, 'success');
  };

  const updateStaff = (member: StaffMember) => {
    setStaff((prev) => prev.map((s) => (s.id === member.id ? member : s)));

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('staff')
        .upsert(member)
        .then(({ error }) => {
          if (error) console.error('Error updating staff in Supabase:', error);
        });
    }

    showToastMessage(`تم تعديل بيانات الموظف "${member.name}"`, 'info');
  };

  const deleteStaff = (id: string) => {
    const target = staff.find((s) => s.id === id);
    if (target?.username === 'admin' || id === 'staff-admin') {
      showToastMessage('لا يمكن حذف حساب المدير الافتراضي النظامي 🔒', 'warning');
      return;
    }

    setStaff((prev) => prev.filter((s) => s.id !== id));

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('staff')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting staff in Supabase:', error);
        });
    }

    showToastMessage('تم حذف حساب الموظف بنجاح', 'warning');
  };

  const resetDemoData = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders([]);
    setStaff(INITIAL_STAFF);
    setBuffetLocation(INITIAL_BUFFET_LOCATION);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setOptionGroups(INITIAL_OPTION_GROUPS);
    setCurrentStaff(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ORDERS);

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .then(({ error }) => {
          if (error) console.error('Error clearing Supabase orders:', error);
        });
    }

    showToastMessage('تم تفريغ وتصفير جميع الطلبات والبيانات بنجاح 🧼✨', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        menuItems,
        categories: INITIAL_CATEGORIES,
        orders,
        staff,
        cart,
        optionGroups,
        selectedCategory,
        setSelectedCategory,
        activeBranch,
        setActiveBranch,
        soundEnabled,
        toggleSound,
        customerUser,
        registerCustomerUser,
        loginCustomerUser,
        logoutCustomerUser,
        unreadStaffOrdersCount,
        markStaffOrdersAsRead,
        authUser,
        userId,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isConfigModalOpen,
        setIsConfigModalOpen,
        addOptionGroup,
        updateOptionGroup,
        deleteOptionGroup,
        toggleOptionGroupStatus,
        reorderOptionGroups,
        addOptionToGroup,
        updateOptionInGroup,
        deleteOptionFromGroup,
        toggleOptionAvailability,
        reorderOptionsInGroup,
        linkGroupToMenuItem,
        unlinkGroupFromMenuItem,
        currentStaff,
        loginStaff,
        logoutStaff,
        buffetLocation,
        updateBuffetLocation,
        attendanceRecords,
        clockInStaff,
        clockOutStaff,
        buffetStatus,
        setBuffetIsOpen,
        updateBuffetSchedule,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        placeOrder,
        updateOrderStatus,
        toggleOrderPaymentStatus,
        paymentGatewayConfig,
        updatePaymentGatewayConfig,
        addChatMessage,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        addStaff,
        updateStaff,
        deleteStaff,
        toast,
        clearToast,
        showToastMessage,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
