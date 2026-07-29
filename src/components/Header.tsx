import React from 'react';
import { Coffee, ShoppingBag, Utensils, ShieldCheck, Power, Home, LogOut } from 'lucide-react';
import { BuffetSettings } from '../types';
import { UserMode } from '../services/session';

interface HeaderProps {
  settings: BuffetSettings;
  activeTab: 'menu' | 'orders' | 'manager';
  setActiveTab: (tab: 'menu' | 'orders' | 'manager') => void;
  cartItemCount: number;
  openCart: () => void;
  activeOrdersCount: number;
  userMode: UserMode;
  onToggleStatus: (newStatus: boolean) => void;
  onGoToLanding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  cartItemCount,
  openCart,
  activeOrdersCount,
  userMode,
  onToggleStatus,
  onGoToLanding,
}) => {
  const isOpen = settings.isOpen !== false;
  const isCustomer = userMode === 'customer';
  const isStaff = userMode === 'staff'; // Cashier
  const isAdmin = userMode === 'admin'; // Manager

  return (
    <header id="app-header" className="sticky top-0 z-30 bg-[#070B1A]/95 backdrop-blur-md border-b border-[#F5B31B]/20 px-4 py-3 shadow-xl">
      <div className="flex items-center justify-between max-w-md mx-auto gap-2">
        {/* Brand & Title - Golden F Coffee Emblem */}
        <button
          id="btn-coffee-icon-login"
          onClick={onGoToLanding}
          className="flex items-center gap-2.5 min-w-0 text-right group cursor-pointer hover:opacity-90 transition-all"
          title="تسجيل الدخول / العودة للشاشة الرئيسية"
        >
          {/* Golden F Emblem Badge */}
          <div className="w-10 h-10 rounded-[18px] bg-gradient-to-br from-[#111827] via-[#070B1A] to-[#111827] border border-[#F5B31B]/40 flex items-center justify-center text-[#F5B31B] shadow-md shrink-0 group-hover:scale-105 transition-transform gold-glow">
            <span className="font-['Tajawal'] font-black text-xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#F5B31B] to-[#D4930A]">
              F
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-['Tajawal'] font-black text-[#FFFFFF] leading-tight truncate max-w-[130px]">
              {settings.buffetName || 'بوفيه'}
            </h1>
            {/* Realtime Status Badge */}
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-[#18D26E] animate-pulse' : 'bg-[#F44336]'}`} />
              <span className={`text-[10px] font-extrabold ${isOpen ? 'text-[#18D26E]' : 'text-[#F44336]'}`}>
                {isStaff ? 'شاشة الكاشير' : isAdmin ? 'لوحة المدير' : isOpen ? 'مفتوح للطلبات' : 'مغلق حالياً'}
              </span>
            </div>
          </div>
        </button>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Main Open/Close Toggle Button (ONLY FOR MANAGER / ADMIN) */}
          {isAdmin && (
            <button
              id="btn-toggle-buffet-header"
              onClick={() => onToggleStatus(!isOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[16px] text-[10px] font-black transition-all border shadow-sm cursor-pointer ${
                isOpen
                  ? 'bg-[#18D26E]/15 border-[#18D26E]/40 text-[#18D26E] hover:bg-[#18D26E]/25'
                  : 'bg-[#F44336]/15 border-[#F44336]/40 text-[#F44336] hover:bg-[#F44336]/25'
              }`}
              title={isOpen ? 'إغلاق البوفيه' : 'فتح البوفيه'}
            >
              <Power className={`w-3.5 h-3.5 ${isOpen ? 'text-[#18D26E]' : 'text-[#F44336]'}`} />
              <span>{isOpen ? 'مفتوح' : 'مغلق'}</span>
            </button>
          )}

          {/* Cart Button (ONLY FOR CUSTOMER & MANAGER) */}
          {!isStaff && (
            <button
              id="btn-open-cart-header"
              onClick={openCart}
              className="relative p-2.5 bg-gradient-to-r from-[#F5B31B] to-[#FFD66B] text-[#070B1A] rounded-[18px] font-black hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer"
              title="السلة"
            >
              <ShoppingBag className="w-4 h-4 text-[#070B1A]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#070B1A] text-[#FFD66B] border border-[#F5B31B] font-black text-[9px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* Active Orders Badge (For Manager) */}
          {isAdmin && (
            <button
              id="btn-nav-orders-header"
              onClick={() => setActiveTab('orders')}
              className={`relative p-2.5 rounded-[18px] border transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#F5B31B]/20 border-[#F5B31B]/50 text-[#FFD66B]'
                  : 'bg-[#111827] border-[#F5B31B]/20 text-[#A8B3C7] hover:bg-[#1E293D]'
              }`}
              title="المطبخ والطلبات"
            >
              <Utensils className="w-4 h-4" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F5B31B] text-[#070B1A] font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {activeOrdersCount}
                </span>
              )}
            </button>
          )}

          {/* Manager Toggle (ONLY FOR MANAGER / ADMIN) */}
          {isAdmin && (
            <button
              id="btn-nav-manager-header"
              onClick={() => setActiveTab('manager')}
              className={`p-2.5 rounded-[18px] border transition-all cursor-pointer ${
                activeTab === 'manager'
                  ? 'bg-gradient-to-r from-[#F5B31B] to-[#FFD66B] text-[#070B1A] border-[#FFD66B]'
                  : 'bg-[#111827] border-[#F5B31B]/20 text-[#A8B3C7] hover:bg-[#1E293D]'
              }`}
              title="الإدارة"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          {/* Exit / Return Home (For Staff & Manager & Customer) */}
          {(isStaff || isAdmin) && (
            <button
              onClick={onGoToLanding}
              className="p-2.5 text-[#F44336] hover:text-[#FFFFFF] bg-[#F44336]/10 hover:bg-[#F44336]/20 border border-[#F44336]/30 rounded-[18px] transition-all cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
