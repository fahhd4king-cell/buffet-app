import React from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  Coffee,
  ShoppingBag,
  ChefHat,
  LayoutDashboard,
  Volume2,
  VolumeX,
  RotateCcw,
  Building2,
  UserCheck,
  Database,
} from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenOrdersHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenOrdersHistory }) => {
  const {
    role,
    setRole,
    orders,
    cart,
    soundEnabled,
    toggleSound,
    activeBranch,
    setActiveBranch,
    resetDemoData,
    authUser,
    customerUser,
    unreadStaffOrdersCount,
    markStaffOrdersAsRead,
    setIsAuthModalOpen,
    setIsConfigModalOpen,
  } = useApp();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Active customer orders (received, preparing, ready)
  const activeCustomerOrdersCount = orders.filter((o) => {
    if (customerUser) {
      return (o.userId === customerUser.id || o.customerName === customerUser.name) && ['received', 'preparing', 'ready'].includes(o.status);
    }
    return ['received', 'preparing', 'ready'].includes(o.status);
  }).length;

  // Active kitchen pending orders (received, preparing)
  const pendingKitchenOrdersCount = orders.filter((o) =>
    ['received', 'preparing'].includes(o.status)
  ).length;

  const roleButtons: { id: Role; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'customer',
      label: 'واجهة العميل',
      icon: <Coffee className="w-4 h-4" />,
      badge: activeCustomerOrdersCount > 0 ? activeCustomerOrdersCount : undefined,
    },
    {
      id: 'employee',
      label: 'شاشة الموظف (الكوفي)',
      icon: <ChefHat className="w-4 h-4" />,
      badge: unreadStaffOrdersCount > 0 ? unreadStaffOrdersCount : (pendingKitchenOrdersCount > 0 ? pendingKitchenOrdersCount : undefined),
    },
    {
      id: 'admin',
      label: 'لوحة الإدارة',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            
            {/* Brand & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRole('welcome')}
                className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-xl hover:bg-emerald-400 transition-colors cursor-pointer"
                title="العودة للشاشة الرئيسية"
              >
                ف
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg text-white tracking-tight leading-none">
                    بوفيه <span className="text-emerald-400 font-extrabold">فادي</span>
                  </h1>
                </div>

                <div className="text-[11px] text-slate-400 mt-0.5">
                  طلب مشروباتك ووجباتك السريعة
                </div>
              </div>
            </div>

            {/* Center Role Navigation Switcher ONLY for Staff/Admin - Hidden for Customers */}
            {role !== 'customer' && (
              <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                {roleButtons.slice(1).map((btn) => {
                  const isActive = role === btn.id;
                  return (
                    <button
                      key={btn.id}
                      onClick={() => setRole(btn.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      {btn.icon}
                      <span>{btn.label}</span>
                      {btn.badge !== undefined && btn.badge > 0 && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-pulse">
                          {btn.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Right Action Icons */}
            <div className="flex items-center gap-2">

              {/* Supabase Database Config Modal Button */}
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="إعدادات Supabase والربط"
              >
                <Database className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px] font-bold">Supabase</span>
              </button>

              {/* Customer & Supabase User Auth Button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`px-2.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  customerUser || authUser
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title={customerUser ? `مرحباً ${customerUser.name}` : (authUser ? `الحساب: ${authUser.email}` : 'تسجيل دخول العملاء')}
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline text-xs font-bold max-w-[110px] truncate">
                  {customerUser ? customerUser.name : (authUser ? authUser.email?.split('@')[0] : 'تسجيل الدخول')}
                </span>
              </button>

              {/* Audio Toggle */}
              <button
                onClick={toggleSound}
                className={`p-2 rounded-xl border transition-colors ${
                  soundEnabled
                    ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
                }`}
                title={soundEnabled ? 'التنبيهات الصوتية مفعلة' : 'التنبيهات الصوتية مكتومة'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Customer Cart Button (if customer role) */}
              {role === 'customer' && (
                <>
                  <button
                    onClick={onOpenOrdersHistory}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors relative"
                  >
                    <span>طلباتي</span>
                    {activeCustomerOrdersCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    )}
                  </button>

                  <button
                    onClick={onOpenCart}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all hover:scale-102 active:scale-98 relative"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline">السلة</span>
                    {cartItemsCount > 0 && (
                      <span className="bg-white text-emerald-900 text-[11px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                        {cartItemsCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {/* Reset Demo Button */}
              <button
                onClick={() => {
                  if (window.confirm('هل ترغب في إعادة ضبط بيانات الديمو الافتراضية؟')) {
                    resetDemoData();
                  }
                }}
                className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 transition-colors"
                title="إعادة ضبط بيانات التوضيح"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile View Navigation - Hidden for customer */}
          {role !== 'customer' && (
            <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 bg-slate-900/90 -mx-4 px-4">
              {roleButtons.slice(1).map((btn) => {
                const isActive = role === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setRole(btn.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {btn.icon}
                    <span>{btn.label.split(' ')[0]}</span>
                    {btn.badge !== undefined && btn.badge > 0 && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                        {btn.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </header>
    </>
  );
};
