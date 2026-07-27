import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CustomerView } from './components/CustomerView';
import { EmployeeView } from './components/EmployeeView';
import { AdminView } from './components/AdminView';
import { CartDrawer } from './components/CartDrawer';
import { CustomerOrdersTracker } from './components/CustomerOrdersTracker';
import { Toast } from './components/Toast';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { AuthModal } from './components/AuthModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

const MainAppContent: React.FC = () => {
  const { role, authUser, isAuthModalOpen, setIsAuthModalOpen, isConfigModalOpen, setIsConfigModalOpen } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersHistoryOpen, setIsOrdersHistoryOpen] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | undefined>(undefined);

  // If role is welcome, render the welcome screen landing page directly
  if (role === 'welcome') {
    return (
      <>
        <WelcomeScreen />
        <Toast />
        <PwaInstallPrompt />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={authUser}
        />
        <SupabaseConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Tajawal',sans-serif] text-slate-900 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      
      {/* Top Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrdersHistory={() => setIsOrdersHistoryOpen(true)}
      />

      {/* Active Role View */}
      <div className="flex-1">
        {role === 'customer' && <CustomerView />}
        {role === 'employee' && <EmployeeView />}
        {role === 'admin' && <AdminView />}
      </div>

      {/* Floating Global Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={(orderId) => {
          setLastPlacedOrderId(orderId);
          setIsOrdersHistoryOpen(true);
        }}
      />

      {/* Global Customer Orders Tracker Drawer */}
      <CustomerOrdersTracker
        isOpen={isOrdersHistoryOpen}
        onClose={() => setIsOrdersHistoryOpen(false)}
        highlightOrderId={lastPlacedOrderId}
      />

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={authUser}
      />

      {/* Supabase Configuration & Schema Modal */}
      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />

      {/* Toast Notification */}
      <Toast />

      {/* PWA Install Banner & Modal */}
      <PwaInstallPrompt />

      {/* Minimal Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 text-center text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام طلبات بوفيه فادي الإلكتروني الذكي © {new Date().getFullYear()}</span>
          <span className="text-emerald-400 font-bold">بوفيه فادي • خدمة سريعة بدون انتظار</span>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
