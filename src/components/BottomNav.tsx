import React from 'react';
import { UtensilsCrossed, ClipboardList, Settings2, Home } from 'lucide-react';
import { UserMode } from '../services/session';

interface BottomNavProps {
  activeTab: 'menu' | 'orders' | 'manager';
  setActiveTab: (tab: 'menu' | 'orders' | 'manager') => void;
  activeOrdersCount: number;
  userMode?: UserMode;
  onGoToLanding?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  activeOrdersCount,
  userMode = 'customer',
  onGoToLanding,
}) => {
  const isCustomer = userMode === 'customer';
  const isStaff = userMode === 'staff'; // Cashier
  const isAdmin = userMode === 'admin'; // Manager

  return (
    <nav id="bottom-navigation" className="fixed bottom-0 left-0 right-0 z-30 bg-[#070B1A]/95 backdrop-blur-xl border-t border-[#F5B31B]/20 pb-safe pt-2.5 px-3 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Logout / Exit Tab (FOR STAFF / ADMIN) */}
        {(isStaff || isAdmin) && onGoToLanding && (
          <button
            id="btn-nav-home"
            onClick={onGoToLanding}
            className="flex flex-col items-center justify-center py-1.5 px-3.5 rounded-[18px] transition-all text-[#F44336] hover:bg-[#F44336]/10 cursor-pointer"
            title="تسجيل الخروج"
          >
            <Home className="w-5 h-5 mb-0.5 text-[#F44336]" />
            <span className="text-[10px] font-bold">تسجيل الخروج</span>
          </button>
        )}

        {/* Menu Tab (ONLY FOR CUSTOMER & MANAGER - HIDDEN FROM CASHIER) */}
        {!isStaff && (
          <button
            id="btn-nav-menu"
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-[18px] transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'text-[#FFD66B] bg-[#F5B31B]/15 font-tajawal font-bold border border-[#F5B31B]/30'
                : 'text-[#A8B3C7] hover:text-[#FFFFFF]'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-bold">المنيو والطلب</span>
          </button>
        )}

        {/* Orders Tab ("طلباتي" for Customer, "الطلبات" for Cashier/Manager) */}
        <button
          id="btn-nav-orders"
          onClick={() => setActiveTab('orders')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3.5 rounded-[18px] transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'text-[#FFD66B] bg-[#F5B31B]/15 font-tajawal font-bold border border-[#F5B31B]/30'
              : 'text-[#A8B3C7] hover:text-[#FFFFFF]'
          }`}
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5 mb-0.5" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#F5B31B] text-[#070B1A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold">
            {isCustomer ? 'طلباتي' : isStaff ? 'شاشة الطلبات' : 'المطبخ والطلبات'}
          </span>
        </button>

        {/* Manager Tab (ONLY FOR MANAGER / ADMIN - STRICTLY HIDDEN FROM CASHIER) */}
        {isAdmin && (
          <button
            id="btn-nav-manager"
            onClick={() => setActiveTab('manager')}
            className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-[18px] transition-all cursor-pointer ${
              activeTab === 'manager'
                ? 'text-[#FFD66B] bg-[#F5B31B]/15 font-tajawal font-bold border border-[#F5B31B]/30'
                : 'text-[#A8B3C7] hover:text-[#FFFFFF]'
            }`}
          >
            <Settings2 className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-bold">الإدارة</span>
          </button>
        )}
      </div>
    </nav>
  );
};
