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
import { sendPushNotification } from '../utils/notifications';

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
  ) => Promise<string>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  toggleOrderPaymentStatus: (orderId: string, targetStatus?: PaymentStatus) => Promise<void>;
  addChatMessage: (orderId: string, text: string, sender: 'customer' | 'staff') => Promise<void>;

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

const mapOrder = (row: any): Order => ({
  id: row.order_number,
  userId: row.user_id ?? undefined,
  customerName: row.customer_name ?? 'عميل البوفيه',
  customerOffice: row.customer_office ?? '',
  items: row.items ?? [], totalPrice: Number(row.total_price ?? 0),
  status: row.status ?? 'received', createdAt: row.created_at, updatedAt: row.updated_at,
  notes: row.notes ?? '', chatMessages: row.chat_messages ?? [],
  paymentMethod: row.payment_method ?? 'cash', paymentStatus: row.payment_status ?? 'unpaid',
  paymentReference: row.payment_reference ?? undefined, paymentGateway: row.payment_gateway ?? undefined,
});
export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [activeBranch, setActiveBranch] = useState<string>('بوفيه فادي');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Cloud is the source of truth; no browser persistence is used.
  const [customerUser, setCustomerUser] = useState<AppUser | null>(null);
  const [unreadStaffOrdersCount, setUnreadStaffOrdersCount] = useState(0);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userId, setUserId] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const processedOrderIdsRef = useRef<Set<string>>(new Set());
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [buffetStatus, setBuffetStatus] = useState<BuffetStatus>(DEFAULT_BUFFET_STATUS);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [buffetLocation, setBuffetLocation] = useState<BuffetLocation>(INITIAL_BUFFET_LOCATION);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [optionGroups, setOptionGroups] = useState<CustomizationGroup[]>([]);
  const [paymentGatewayConfig, setPaymentGatewayConfig] = useState<PaymentGatewayConfig>(DEFAULT_GATEWAY_CONFIG);

  // Supabase Auth Listener
  useEffect(() => {
    getCurrentUserId().then((id) => setUserId(id || ''));

    if (isSupabaseConfigured() && supabase) {
      supabase!.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setAuthUser(data.user);
          setUserId(data.user.id);
        }
      });

      const { data: authListener } = supabase!.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setAuthUser(session.user);
          setUserId(session.user.id);
        } else {
          setAuthUser(null);
         getCurrentUserId().then((id) => setUserId(id ?? ''));
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

    const loadInitialData = async () => {
      try {
        const [ordersResult, staffResult, statusResult, menuResult] = await Promise.all([
          supabase!.from('orders').select('*').order('created_at', { ascending: false }),
          supabase!.from('staff').select('*'),
          supabase!.from('buffet_status').select('*').eq('id', 'main').maybeSingle(),
          supabase!.from('menu_items').select('*'),
        ]);

        if (!isMounted) return;

        if (ordersResult.error) {
          console.error('تعذر جلب الطلبات من Supabase:', ordersResult.error);
          showToastMessage('تعذر جلب الطلبات من الخادم. تحقق من الاتصال والصلاحيات.', 'warning');
        } else {
          const cloudOrders = (ordersResult.data ?? []).map(mapOrder);
          setOrders(cloudOrders);
          cloudOrders.forEach((order) => processedOrderIdsRef.current.add(order.id));
        }

        if (staffResult.error) {
          console.error('تعذر جلب الموظفين من Supabase:', staffResult.error);
          setStaff(INITIAL_STAFF);
          showToastMessage('تعذر جلب الموظفين؛ تم عرض البيانات الافتراضية مؤقتاً.', 'warning');
        } else {
          setStaff(staffResult.data?.length ? (staffResult.data as StaffMember[]) : INITIAL_STAFF);
        }

        if (menuResult.error) {
          console.error('تعذر جلب المنيو من Supabase:', menuResult.error);
          setMenuItems(INITIAL_MENU_ITEMS);
          showToastMessage('تعذر جلب المنيو؛ تم عرض المنيو الافتراضي مؤقتاً.', 'warning');
        } else if (!menuResult.data?.length) {
          setMenuItems(INITIAL_MENU_ITEMS);
          showToastMessage('المنيو السحابي فارغ؛ تم عرض المنيو الافتراضي مؤقتاً.', 'info');
        } else {
          setMenuItems(menuResult.data.map((item: any): MenuItem => ({
            id: item.id,
            name: item.name,
            description: item.description ?? '',
            price: Number(item.price ?? 0),
            category: item.category,
            image: item.image ?? '',
            isAvailable: Boolean(item.is_available),
            customizationGroupIds: item.customization_group_ids ?? [],
          })));
        }

        if (statusResult.error) {
          console.error('تعذر جلب حالة البوفيه من Supabase:', statusResult.error);
          setBuffetStatus(DEFAULT_BUFFET_STATUS);
          showToastMessage('تعذر جلب حالة البوفيه؛ استُخدمت الحالة الافتراضية.', 'warning');
        } else if (statusResult.data) {
          const status = statusResult.data;
          setBuffetStatus({
            isOpen: Boolean(status.is_open),
            closureReason: status.closure_reason ?? DEFAULT_BUFFET_STATUS.closureReason,
            reopenTime: status.reopen_time ?? DEFAULT_BUFFET_STATUS.reopenTime,
            autoScheduleEnabled: Boolean(status.auto_schedule_enabled),
            workingHours: status.working_hours ?? DEFAULT_BUFFET_STATUS.workingHours,
          });
        } else {
          setBuffetStatus(DEFAULT_BUFFET_STATUS);
        }
      } catch (error) {
        console.error('خطأ غير متوقع أثناء تحميل بيانات التطبيق:', error);
        if (isMounted) {
          setMenuItems(INITIAL_MENU_ITEMS);
          setStaff(INITIAL_STAFF);
          setBuffetStatus(DEFAULT_BUFFET_STATUS);
          showToastMessage('تعذر الاتصال بالخادم. تم عرض البيانات الافتراضية مؤقتاً.', 'warning');
        }
      }
    };

    void loadInitialData();

    // Subscribe to Realtime Postgres Changes
    const realtimeClient = supabase! as any;
    const channel = realtimeClient
      .channel('buffet_global_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const row: any = payload.new;
            const newOrder: Order = {
              id: row.order_number,
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
            const updatedId = row.order_number;
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
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).order_number;
            setOrders((prev) => prev.filter((order) => order.id !== deletedId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'buffet_status' },
        (payload: any) => {
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
        (payload: any) => {
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
        (payload: any) => {
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
      void realtimeClient.removeChannel(channel);
    };
  }, []);

  // Cloud-backed auxiliary state.  These table names intentionally match the
  // domain names used by the context; enable them in the Realtime publication.
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) return;

    const load = async () => {
      const [groups, location, attendance, gateway] = await Promise.all([
        supabase!.from('option_groups').select('*'),
        supabase!.from('buffet_location').select('*').eq('id', 'main').maybeSingle(),
        supabase!.from('attendance_records').select('*').order('date', { ascending: false }),
        supabase!.from('payment_gateway_config').select('config').eq('id', 'main').maybeSingle(),
      ]);
      if (!groups.error) setOptionGroups((groups.data ?? []) as CustomizationGroup[]);
      if (!location.error && location.data) setBuffetLocation(location.data as BuffetLocation);
      if (!attendance.error) setAttendanceRecords((attendance.data ?? []) as AttendanceRecord[]);
      if (!gateway.error && gateway.data?.config) setPaymentGatewayConfig(gateway.data.config as PaymentGatewayConfig);
    };
    void load();

    const realtimeClient = supabase! as any;
    const channel = realtimeClient
      .channel('buffet-auxiliary-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'option_groups' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          setOptionGroups((current) => current.filter((group) => group.id !== payload.old.id));
          return;
        }
        const group = payload.new as CustomizationGroup;
        setOptionGroups((current) => {
          const found = current.findIndex((item) => item.id === group.id);
          if (found < 0) return [...current, group];
          const next = [...current]; next[found] = group; return next;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buffet_location' }, (payload: any) => {
        if (payload.eventType !== 'DELETE') setBuffetLocation(payload.new as BuffetLocation);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          setAttendanceRecords((current) => current.filter((record) => record.id !== payload.old.id));
          return;
        }
        const record = payload.new as AttendanceRecord;
        setAttendanceRecords((current) => {
          const found = current.findIndex((item) => item.id === record.id);
          if (found < 0) return [record, ...current];
          const next = [...current]; next[found] = record; return next;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_gateway_config' }, (payload: any) => {
        if (payload.eventType !== 'DELETE' && payload.new.config) setPaymentGatewayConfig(payload.new.config as PaymentGatewayConfig);
      })
      .subscribe((status: any) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          showToastMessage('تعذر تشغيل التحديث اللحظي. ستظهر البيانات عند إعادة المحاولة.', 'warning');
        }
      });

    return () => { void realtimeClient.removeChannel(channel); };
  }, []);

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
      const { data } = await supabase!.from('app_users').select('id').eq('username', cleanUsername).maybeSingle();
      if (data) isUsernameTaken = true;
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
      supabase!.from('app_users').insert({
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
      const { data } = await supabase!.from('app_users').select('*').eq('username', cleanUsername).maybeSingle();
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
    showToastMessage(`مرحباً بعودتك يا ${foundUser.name}! 👋`, 'success');

    return { success: true, message: 'تم تسجيل الدخول بنجاح! 🎉' };
  };

  const logoutCustomerUser = () => {
    setCustomerUser(null);
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
  const setBuffetIsOpen = async (isOpen: boolean, closureReason?: string, reopenTime?: string) => {
    if (!supabase) {
      showToastMessage('تعذر تغيير حالة البوفيه: لا يوجد اتصال بقاعدة البيانات.', 'warning');
      return;
    }

    const normalizedReason = closureReason?.trim();
    if (!isOpen && !normalizedReason) {
      showToastMessage('يرجى كتابة سبب إغلاق البوفيه قبل التأكيد.', 'warning');
      return;
    }

    const nextStatus: BuffetStatus = {
      ...buffetStatus,
      isOpen,
      closureReason: isOpen ? '' : normalizedReason!,
      reopenTime: reopenTime ?? buffetStatus.reopenTime,
    };

    try {
      const { error } = await supabase!.from('buffet_status').upsert({
        id: 'main',
        is_open: nextStatus.isOpen,
        closure_reason: nextStatus.closureReason,
        reopen_time: nextStatus.reopenTime,
        auto_schedule_enabled: nextStatus.autoScheduleEnabled,
        working_hours: nextStatus.workingHours,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setBuffetStatus(nextStatus);
      showToastMessage(
        isOpen
          ? 'تم فتح البوفيه واستقبال الطلبات.'
          : `تم إغلاق البوفيه. السبب: ${nextStatus.closureReason}`,
        isOpen ? 'success' : 'warning'
      );
    } catch (error) {
      console.error('تعذر تحديث حالة البوفيه:', error);
      showToastMessage('تعذر تغيير حالة البوفيه. تحقق من الاتصال وصلاحيات Supabase ثم أعد المحاولة.', 'warning');
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

  const updatePaymentGatewayConfig = async (newConfig: PaymentGatewayConfig) => {
    if (!supabase) return;
    const { error } = await supabase!.from('payment_gateway_config').upsert({ id: 'main', config: newConfig, updated_at: new Date().toISOString() });
    if (error) { console.error('Error saving payment config:', error); showToastMessage('���� ��� ������� �����.', 'warning'); return; }
    setPaymentGatewayConfig(newConfig);
    showToastMessage('�� ��� ������� ����� �����.', 'success');
  };

  // Place Order: Supabase is confirmed before local UI is changed.
  const placeOrder = async (
    customerName: string, customerOffice: string, paymentMethod: PaymentMethod,
    notes = '', paymentStatus?: PaymentStatus, paymentReference?: string, paymentGateway?: string
  ): Promise<string> => {
    if (!supabase || !isSupabaseConfigured()) { showToastMessage('تعذر الاتصال بقاعدة البيانات.', 'warning'); return ''; }
    if (!buffetStatus.isOpen) { showToastMessage('البوفيه مغلق حالياً.', 'warning'); return ''; }
    if (!cart.length) { showToastMessage('السلة فارغة.', 'warning'); return ''; }
    const orderNumber = `#${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
    const finalPaymentStatus = paymentStatus ?? (paymentMethod === 'cash' ? 'unpaid' : 'paid');
    const gateway = paymentGateway ?? (paymentMethod === 'cash' ? 'الدفع عند الاستلام' : 'بوابة الدفع الإلكتروني');
    const { data, error } = await supabase!.from('orders').insert({
      order_number: orderNumber, user_id: customerUser?.id ?? userId ?? null,
      customer_name: customerName.trim() || customerUser?.name || 'عميل البوفيه',
      customer_office: customerOffice.trim() || 'استلام مباشر', items: cart, total_price: cartTotal,
      status: 'received', notes, payment_method: paymentMethod, payment_status: finalPaymentStatus,
      payment_reference: paymentReference ?? null, payment_gateway: gateway, chat_messages: []
    }).select('*').single();
    if (error || !data) { console.error('Error inserting order:', error); showToastMessage('تعذر إرسال الطلب.', 'warning'); return ''; }
    const order = mapOrder(data);
    processedOrderIdsRef.current.add(order.id);
    setOrders((current) => current.some((item) => item.id === order.id) ? current : [order, ...current]);
    clearCart();
    showToastMessage('تم إرسال طلبك بنجاح.', 'success');
    return order.id;
  };

  const toggleOrderPaymentStatus = async (orderId: string, targetStatus?: PaymentStatus): Promise<void> => {
    if (!supabase) return;
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    const paymentStatus = targetStatus ?? (order.paymentStatus === 'paid' ? 'unpaid' : 'paid');
    const { error } = await supabase!.from('orders').update({ payment_status: paymentStatus, updated_at: new Date().toISOString() }).eq('order_number', orderId);
    if (error) { console.error('Error updating payment:', error); showToastMessage('تعذر تحديث حالة الدفع.', 'warning'); }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase!.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('order_number', orderId);
    if (error) { console.error('Error updating status:', error); showToastMessage('تعذر تحديث حالة الطلب.', 'warning'); return; }
    if (newStatus === 'ready') soundManager.playOrderReadySound();
    showToastMessage('تم تحديث حالة الطلب.', 'success');
  };

  const addChatMessage = async (orderId: string, text: string, sender: 'customer' | 'staff'): Promise<void> => {
    if (!supabase || !text.trim()) return;
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    const message: ChatMessage = { id: crypto.randomUUID(), sender, text: text.trim(), timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) };
    const { error } = await supabase!.from('orders').update({ chat_messages: [...order.chatMessages, message], updated_at: new Date().toISOString() }).eq('order_number', orderId);
    if (error) { console.error('Error sending message:', error); showToastMessage('تعذر إرسال الرسالة.', 'warning'); }
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






