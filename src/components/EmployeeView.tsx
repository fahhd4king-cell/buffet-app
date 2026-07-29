import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { OrderChatModal } from './OrderChatModal';
import { BuffetStatusModal } from './BuffetStatusModal';
import { getCurrentCoordinates } from '../utils/location';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  BellRing,
  MessageSquare,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Flame,
  CheckCheck,
  Building,
  User,
  Coffee,
  Power,
  ShieldAlert,
  MapPin,
  LogIn,
  LogOut,
  Utensils,
  AlertCircle,
  Key,
} from 'lucide-react';

export const EmployeeView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    toggleOrderPaymentStatus,
    soundEnabled,
    toggleSound,
    activeBranch,
    buffetStatus,
    menuItems,
    categories,
    toggleItemAvailability,
    staff,
    currentStaff,
    loginStaff,
    logoutStaff,
    buffetLocation,
    attendanceRecords,
    clockInStaff,
    clockOutStaff,
  } = useApp();

  // Primary Employee Dashboard Tab State
  const [employeeDashboardTab, setEmployeeDashboardTab] = useState<'orders' | 'menu' | 'attendance'>('orders');

  // KDS Orders Tab State
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Menu Availability Search & Category Filter State
  const [menuSearch, setMenuSearch] = useState('');

  // Staff Login Form State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // GPS Attendance Loading State
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Auto tick for time elapsed updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Helper for elapsed time format in Arabic
  const getElapsedTimeStr = (isoDateStr: string) => {
    const diffMins = Math.floor((new Date().getTime() - new Date(isoDateStr).getTime()) / 60000);
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const hours = Math.floor(diffMins / 60);
    return `منذ ${hours} ساعة و${diffMins % 60} دقيقة`;
  };

  // Status counts for KDS
  const receivedCount = orders.filter((o) => o.status === 'received').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const completedTodayCount = orders.filter((o) => o.status === 'delivered').length;

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'active' && ['delivered', 'cancelled'].includes(o.status)) return false;
    if (activeTab === 'completed' && o.status !== 'delivered') return false;

    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    const query = (searchQuery || '').toLowerCase();
    return (
      (o.id?.toLowerCase() || '').includes(query) ||
      (o.customerName?.toLowerCase() || '').includes(query) ||
      (o.customerOffice?.toLowerCase() || '').includes(query) ||
      o.items.some((i) => (i.name?.toLowerCase() || '').includes(query))
    );
  });

  // Sort orders: received & preparing first, oldest first
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a.status === 'received' && b.status !== 'received') return -1;
    if (b.status === 'received' && a.status !== 'received') return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Handle Staff Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginStaff(loginForm.username, loginForm.password)) {
      setIsLoginModalOpen(false);
      setLoginForm({ username: '', password: '' });

      // Request GPS location permission on staff login
      if ('geolocation' in navigator) {
        try {
          await getCurrentCoordinates();
        } catch (err: any) {
          // Permission prompt requested on login
        }
      }
    }
  };

  // Handle GPS Clock-in
  const handleClockIn = async () => {
    if (!currentStaff) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    try {
      const coords = await getCurrentCoordinates();
      const res = await clockInStaff(currentStaff.id, coords.lat, coords.lng);
      if (!res.success) {
        setGpsError(res.message);
      }
    } catch (err: any) {
      setGpsError(err.message || 'فشل الحصول على الموقع الجغرافي. تأكد من تفعيل الـ GPS في متصفحك.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Handle GPS Clock-out
  const handleClockOut = async () => {
    if (!currentStaff) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    try {
      const coords = await getCurrentCoordinates();
      const res = await clockOutStaff(currentStaff.id, coords.lat, coords.lng);
      if (!res.success) {
        setGpsError(res.message);
      }
    } catch (err: any) {
      setGpsError(err.message || 'فشل الحصول على الموقع الجغرافي. تأكد من تفعيل الـ GPS.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Active user staff attendance status for today
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayAttendance = currentStaff
    ? attendanceRecords.find((rec) => rec.staffId === currentStaff.id && rec.date === todayStr)
    : null;

  const isCurrentlyClockedIn = myTodayAttendance?.status === 'present';

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      
      {/* Top KDS Header & Staff Info Bar */}
      <section className="bg-slate-900 text-white pt-6 pb-10 px-4 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-black border border-emerald-500/30">
                👨‍🍳
              </div>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>لوحة شاشة الموظف (مشرف البوفيه)</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    مباشر ⚡
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  إدارة الطلبات، توفر المنتجات، وتسجيل الحضور والانصراف بالـ GPS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              
              {/* Quick Buffet Open/Close Control Button */}
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  buffetStatus.isOpen
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 animate-pulse'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{buffetStatus.isOpen ? '🟢 مفتوح' : '🔴 مغلق'}</span>
              </button>

              <button
                onClick={toggleSound}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  soundEnabled
                    ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">الجرس</span>
              </button>
            </div>
          </div>

          {/* Logged-in Staff Bar */}
          <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            {currentStaff ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                  👨‍🍳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">{currentStaff.name}</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold text-[10px] border border-emerald-500/30">
                      {currentStaff.role || 'مشرف البوفيه'}
                    </span>
                    <span className="bg-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded text-[10px]">
                      @{currentStaff.username}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isCurrentlyClockedIn
                      ? `🟢 مسجل حضور اليوم الساعة ${myTodayAttendance?.checkInTime}`
                      : '🟡 لم تسجل الحضور اليوم بعد'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>أنت تعمل حالياً كحساب مشرف افتراضي. قم بتسجيل الدخول بحسابك لمتابعة الحضور بالـ GPS.</span>
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              {currentStaff ? (
                <button
                  onClick={logoutStaff}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل خروج</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل دخول الموظف</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Employee Tab Switcher */}
          <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-slate-700 gap-2 overflow-x-auto">
            <button
              onClick={() => setEmployeeDashboardTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                employeeDashboardTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>شاشة تحضير الطلبات (KDS) ({receivedCount + preparingCount})</span>
            </button>

            <button
              onClick={() => setEmployeeDashboardTab('menu')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                employeeDashboardTab === 'menu'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>حالة توفر منتجات المنيو ({menuItems.length})</span>
            </button>

            <button
              onClick={() => setEmployeeDashboardTab('attendance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                employeeDashboardTab === 'attendance'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>تسجيل الحضور والانصراف (GPS)</span>
            </button>
          </div>

        </div>
      </section>

      {/* Main Content Dashboard Views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 space-y-5">
        
        {/* VIEW 1: KDS ORDERS PREPARATION */}
        {employeeDashboardTab === 'orders' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            
            {/* Metric Summary Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  📥
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-bold">طلبات جديدة</span>
                  <span className="text-xl font-black text-slate-900">{receivedCount}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                  ⏳
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-bold">جاري التحضير</span>
                  <span className="text-xl font-black text-amber-700">{preparingCount}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  🔔
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-bold">جاهزة للاستلام</span>
                  <span className="text-xl font-black text-emerald-700">{readyCount}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg">
                  ✅
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-bold">المكتملة اليوم</span>
                  <span className="text-xl font-black text-slate-800">{completedTodayCount}</span>
                </div>
              </div>
            </div>

            {/* Controls Toolbar */}
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الطلبات النشطة ({receivedCount + preparingCount + readyCount})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  المنتهية اليوم ({completedTodayCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث…"
                    className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Orders Cards Grid */}
            {sortedOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                <div className="text-4xl">🎉</div>
                <h3 className="font-extrabold text-slate-800 text-base">لا توجد طلبات معلقة بانتظار التحضير</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  جميع طلبات بوفيه الموظفين تم تحضيرها وتسليمها بنجاح!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedOrders.map((ord) => {
                  const isReceived = ord.status === 'received';
                  const isPreparing = ord.status === 'preparing';
                  const isReady = ord.status === 'ready';
                  const isDelivered = ord.status === 'delivered';

                  return (
                    <div
                      key={ord.id}
                      className={`bg-white rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                        isReceived
                          ? 'border-blue-300 ring-2 ring-blue-500/20'
                          : isPreparing
                          ? 'border-amber-300 ring-2 ring-amber-500/20'
                          : isReady
                          ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 opacity-80'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-base">{ord.id}</span>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                isReceived
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : isPreparing
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : isReady
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isReceived && 'جديد 📥'}
                              {isPreparing && 'جاري التحضير ⏳'}
                              {isReady && 'جاهز للاستلام 🔔'}
                              {isDelivered && 'تم التسليم ✅'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-bold block mt-1">
                            ⏰ وصل: {getElapsedTimeStr(ord.createdAt)}
                          </span>
                        </div>

                        {/* Customer Chat Button */}
                        <button
                          onClick={() => setChatOrder(ord)}
                          className="relative p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                          title="محادثة العميل"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {(ord.unreadCountStaff || 0) > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                              {ord.unreadCountStaff}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Customer & Location Info */}
                      <div className="p-4 space-y-3 flex-1">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-slate-900">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{ord.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                            <Building className="w-3.5 h-3.5 text-emerald-600" />
                            <span>المكتب: {ord.customerOffice}</span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <ul className="space-y-2 divide-y divide-slate-100 text-xs">
                          {ord.items.map((item, idx) => (
                            <li key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                              <div>
                                <span className="font-extrabold text-slate-900">{item.quantity}x {item.name}</span>
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                                  </div>
                                )}
                                {item.itemNotes && (
                                  <span className="text-[10px] text-amber-700 font-bold block">
                                    ملاحظة: {item.itemNotes}
                                  </span>
                                )}
                              </div>
                              <span className="font-black text-slate-800 shrink-0">{item.price * item.quantity} ر.س</span>
                            </li>
                          ))}
                        </ul>

                        {ord.notes && (
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                            <strong className="block text-[10px] text-amber-700">ملاحظة عامة:</strong>
                            <p className="font-bold text-[11px] mt-0.5">{ord.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2.5">
                        <div className="flex flex-col gap-1.5 pb-1 border-b border-slate-200/60">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-bold">طريقة الدفع:</span>
                            <span className="font-extrabold text-slate-800">
                              {ord.paymentMethod === 'cash'
                                ? '💵 كاش'
                                : ord.paymentMethod === 'mada'
                                ? '💳 بطاقة مدى'
                                : ord.paymentMethod === 'apple_pay'
                                ? '🍎 Apple Pay'
                                : ord.paymentMethod === 'visa_mastercard'
                                ? '💳 فيزا / ماستركارد'
                                : '💳 دفع إلكتروني'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-bold">حالة الدفع:</span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                  ord.paymentStatus === 'paid'
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                {ord.paymentStatus === 'paid' ? '✓ مدفوع' : '⏳ غير مدفوع'}
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleOrderPaymentStatus(ord.id)}
                                className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors"
                                title="تغيير حالة الدفع للطلب"
                              >
                                {ord.paymentStatus === 'paid' ? 'تغيير لـ غير مدفوع' : 'تحديد كـ مدفوع ✅'}
                              </button>
                            </div>
                          </div>

                          {ord.paymentReference && (
                            <div className="text-[10px] text-slate-400 truncate">
                              مرجع الدفع: <span className="font-mono text-slate-600">{ord.paymentReference}</span> ({ord.paymentGateway || 'بوابة الدفع'})
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-500 font-extrabold">المبلغ الإجمالي:</span>
                            <span className="font-black text-sm text-emerald-700">{ord.totalPrice} ر.س</span>
                          </div>
                        </div>

                        {isReceived && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'preparing')}
                            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <Flame className="w-4 h-4" />
                            <span>بدء تحضير الطلب الآن ⏳</span>
                          </button>
                        )}

                        {isPreparing && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'ready')}
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 animate-pulse"
                          >
                            <BellRing className="w-4 h-4" />
                            <span>تعليم كجاهز للاستلام وإشعار العميل 🔔</span>
                          </button>
                        )}

                        {isReady && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'delivered')}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCheck className="w-4 h-4 text-emerald-400" />
                            <span>تأكيد تسليم الطلب للعميل ✅</span>
                          </button>
                        )}

                        {isDelivered && (
                          <div className="text-center text-xs text-slate-500 font-bold py-1 bg-slate-100 rounded-lg">
                            تم تسليم هذا الطلب بنجاح ✅
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: MENU AVAILABILITY TOGGLE (STAFF RESTRICTED VIEW) */}
        {employeeDashboardTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  <span>التحكم في حالة توفر المنتجات (متاح / نفاد الكمية)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تغيير حالة توفر الصنف مباشرة لكي يظهر أو يختفي من واجهة طلبات العملاء بالمكتب.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="بحث عن منتج..."
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems
                .filter((m) => (m.name?.toLowerCase() || '').includes((menuSearch || '').toLowerCase()))
                .map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white p-4 rounded-3xl border transition-all flex items-center justify-between gap-3 ${
                      item.isAvailable
                        ? 'border-slate-200 shadow-xs'
                        : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{item.name}</h4>
                        <span className="text-xs font-bold text-emerald-700 block mt-0.5">{item.price} ر.س</span>
                        <span className={`text-[10px] font-bold inline-block mt-1 ${item.isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.isAvailable ? '🟢 متاح للعملاء' : '🔴 غير متاح (نفاد الكمية)'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                        item.isAvailable
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                      }`}
                    >
                      {item.isAvailable ? 'إيقاف (نفاد)' : 'تفعيل الصنف 🟢'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 3: GPS ATTENDANCE SYSTEM */}
        {employeeDashboardTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Attendance Action Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>تسجيل الحضور والانصراف بالـ GPS (النطاق الجغرافي)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    يشترط التواجد الجغرافي داخل نطاق البوفيه (أقل من {buffetLocation.allowedRadiusMeters} متراً) لتسجيل الحضور.
                  </p>
                </div>

                <div className="text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0 space-y-1">
                  <div className="font-extrabold text-slate-900">📍 البوفيه المعتمد: {buffetLocation.name}</div>
                  <div className="text-slate-500 text-[11px]">الحد المسموح: {buffetLocation.allowedRadiusMeters} متر فقط</div>
                </div>
              </div>

              {gpsError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}

              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">حالة الحضور اليوم ({todayStr})</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">
                    {isCurrentlyClockedIn ? `🟢 متواجد بالدورة (حضر الساعة ${myTodayAttendance?.checkInTime})` : '⚪ لم تسجل الحضور بعد'}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleClockIn}
                    disabled={isGpsLoading}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{isGpsLoading ? 'جاري التحقق من الـ GPS...' : 'تسجيل الحضور 📍'}</span>
                  </button>

                  <button
                    onClick={handleClockOut}
                    disabled={isGpsLoading}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-950 disabled:bg-slate-300 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>{isGpsLoading ? 'جاري التحقق...' : 'تسجيل الانصراف 📍'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Personal Logs Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>سجل حضورك وانصرافك الشخصي</span>
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 text-xs">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">وقت الحضور</th>
                      <th className="p-3">وقت الانصراف</th>
                      <th className="p-3">ساعات العمل</th>
                      <th className="p-3">المسافة عن البوفيه</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceRecords
                      .filter((rec) => !currentStaff || rec.staffId === currentStaff.id)
                      .map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-slate-900 font-bold">{rec.date}</td>
                          <td className="p-3 text-emerald-700 font-bold">{rec.checkInTime}</td>
                          <td className="p-3 text-slate-700 font-bold">{rec.checkOutTime || '— (قيد الدوام)'}</td>
                          <td className="p-3 text-slate-600">{rec.workingHours || 'جاري الدوام'}</td>
                          <td className="p-3 text-slate-600 font-bold">📍 {rec.distanceFromBuffetMeters} متر</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              rec.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {rec.status === 'present' ? '🟢 متواجد' : '✅ مكتمل'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Staff Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 text-right">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">
                👨‍🍳
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">تسجيل دخول مشرف البوفيه</h3>
                <p className="text-xs text-slate-500 mt-0.5">أدخل اسم المستخدم وكلمة المرور المسجلة بالنظام</p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الموظف أو اكتب اسم المستخدم</label>
                <div className="space-y-2 mb-2">
                  <select
                    onChange={(e) => {
                      const found = staff.find((s) => s.username === e.target.value);
                      if (found) {
                        setLoginForm({ username: found.username, password: found.password || '123' });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900 font-bold"
                  >
                    <option value="">-- اختار الموظف --</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.username}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="اسم المستخدم (Username)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  تسجيل الدخول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal with Customer */}
      {chatOrder && (
        <OrderChatModal
          order={chatOrder}
          isOpen={!!chatOrder}
          onClose={() => setChatOrder(null)}
          currentUserRole="staff"
        />
      )}

      {/* Buffet Status Modal */}
      <BuffetStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

    </div>
  );
};
