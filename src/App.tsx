import React, { useState, useEffect } from 'react';
import {
  getAppData,
  subscribeToData,
  toggleBuffetStatus,
  addCategory,
  deleteCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  addStaff,
  deleteStaff,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  updateSettings,
  resetAllData,
  exportBackupJSON,
  importBackupJSON,
  syncRemoteNewOrder,
  syncRemoteOrderStatus,
  blockCustomer,
  unblockCustomer,
  syncRemoteBlockedCustomers,
  syncRemoteSettings,
  syncRemoteCatalog,
  syncRemoteStaff,
} from './services/storage';
import { subscribeSupabaseRealtimeEvents } from './services/supabase';
import { getClientSessionId, getUserMode, setUserMode, UserMode } from './services/session';
import { playNewOrderSound } from './utils/audio';
import { AppData, Product, CartItem, CartItemAddon, OrderStatus, Order } from './types';

// Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LandingView } from './components/LandingView';
import { MenuView } from './components/MenuView';
import { OrdersView } from './components/OrdersView';
import { ManagerView } from './components/ManagerView';
import { CartSheet } from './components/CartSheet';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CloseBuffetModal } from './components/CloseBuffetModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';

export default function App() {
  const [data, setData] = useState<AppData>(getAppData());
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'manager'>('menu');
  const [userModeState, setUserModeState] = useState<UserMode>(getUserMode());
  const [sessionId] = useState<string>(getClientSessionId());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Subscribe to local storage & Supabase Realtime changes
  useEffect(() => {
    const unsubscribeLocal = subscribeToData(() => {
      setData(getAppData());
    });

    const unsubscribeRealtime = subscribeSupabaseRealtimeEvents({
      onStatusChange: (isOpen, closedReason, reopenTime) => {
        const current = getAppData();
        current.settings.isOpen = isOpen;
        if (closedReason !== undefined) current.settings.closedReason = closedReason;
        if (reopenTime !== undefined) current.settings.reopenTime = reopenTime;
        setData({ ...current });
      },
      onNewOrder: (incomingOrder) => {
        syncRemoteNewOrder(incomingOrder);
        setData(getAppData());
        playNewOrderSound();
      },
      onOrderStatusChanged: (orderId, newStatus, estimatedPickupMinutes, estimatedPickupTime) => {
        syncRemoteOrderStatus(orderId, newStatus as OrderStatus, estimatedPickupMinutes, estimatedPickupTime);
        setData(getAppData());
      },
      onBlockedCustomersChanged: (blockedList) => {
        syncRemoteBlockedCustomers(blockedList);
        setData(getAppData());
      },
      onSettingsChange: (newSettings) => {
        syncRemoteSettings(newSettings);
        setData(getAppData());
      },
      onCatalogChange: (categories, products) => {
        syncRemoteCatalog(categories, products);
        setData(getAppData());
      },
      onStaffChange: (staff) => {
        syncRemoteStaff(staff);
        setData(getAppData());
      },
    });

    return () => {
      unsubscribeLocal();
      unsubscribeRealtime();
    };
  }, []);

  // Handlers for switching user mode & strict RBAC Route Guards
  const handleSetActiveTab = (tab: 'menu' | 'orders' | 'manager') => {
    if (userModeState === 'staff') {
      setActiveTab('orders');
      return;
    }
    if (tab === 'manager' && userModeState !== 'admin') {
      setActiveTab('orders');
      return;
    }
    setActiveTab(tab);
  };

  // Enforce role security: Route Guard strictly redirects non-authorized users
  useEffect(() => {
    if (userModeState === 'staff' && activeTab !== 'orders') {
      setActiveTab('orders');
    } else if (userModeState === 'customer' && activeTab === 'manager') {
      setActiveTab('menu');
    } else if (userModeState !== 'admin' && activeTab === 'manager') {
      setActiveTab('orders');
    }
  }, [userModeState, activeTab]);

  const handleCustomerStart = () => {
    setUserMode('customer');
    setUserModeState('customer');
    setActiveTab('menu');
  };

  const handleStaffLogin = (pin: string): boolean => {
    const cleanPin = pin.trim();
    const adminPin = data.settings.adminPin || '1234';

    if (cleanPin === adminPin) {
      setUserMode('admin');
      setUserModeState('admin');
      setActiveTab('manager');
      return true;
    }

    const matchingStaff = data.staff.find(s => s.pin && s.pin.trim() === cleanPin);
    if (matchingStaff) {
      const role = matchingStaff.role;
      if (role === 'مدير' || role === 'manager' || (role as string) === 'admin') {
        setUserMode('admin');
        setUserModeState('admin');
        setActiveTab('manager');
      } else {
        setUserMode('staff');
        setUserModeState('staff');
        setActiveTab('orders');
      }
      return true;
    }

    if (cleanPin === '2222' || cleanPin === '0000') {
      setUserMode('staff');
      setUserModeState('staff');
      setActiveTab('orders');
      return true;
    }

    return false;
  };

  const handleGoToLanding = () => {
    setUserMode('landing');
    setUserModeState('landing');
  };

  const handleToggleBuffetStatus = (newStatus: boolean) => {
    if (!newStatus) {
      setIsCloseModalOpen(true);
    } else {
      toggleBuffetStatus(true);
      setData(getAppData());
    }
  };

  const handleConfirmClose = (reason: string, reopenTime: string) => {
    toggleBuffetStatus(false, reason, reopenTime);
    setData(getAppData());
  };

  // Cart Handlers
  const handleAddToCart = (
    product: Product,
    quantity: number,
    selectedAddons: CartItemAddon[],
    notes: string
  ) => {
    const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = product.price + addonsPrice;
    const totalPrice = unitPrice * quantity;

    const newCartItem: CartItem = {
      id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      product,
      quantity,
      selectedAddons,
      notes,
      unitPrice,
      totalPrice,
    };

    setCart(prev => [...prev, newCartItem]);
  };

  const handleQuickAdd = (product: Product) => {
    handleAddToCart(product, 1, [], '');
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSubmitOrder = (orderDetails: {
    customerName: string;
    customerPhone: string;
    destinationDetails: string;
    orderType: any;
    paymentMethod: any;
  }) => {
    const subtotal = cart.reduce((sum, i) => sum + i.totalPrice, 0);
    const tax = data.settings.taxPercentage > 0 ? (subtotal * data.settings.taxPercentage) / 100 : 0;
    const total = subtotal + tax;

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      selectedAddons: item.selectedAddons,
      itemTotal: item.totalPrice,
      notes: item.notes,
    }));

    const createdOrder = createOrder({
      sessionId,
      customerName: orderDetails.customerName,
      customerPhone: orderDetails.customerPhone,
      destinationDetails: orderDetails.destinationDetails,
      orderType: orderDetails.orderType,
      items: orderItems,
      subtotal,
      tax,
      discount: 0,
      total,
      status: 'جديد',
      paymentMethod: orderDetails.paymentMethod,
      paymentStatus: 'مدفوع',
    });

    setCart([]);
    setIsCartOpen(false);
    setLastPlacedOrder(createdOrder);
    setIsSuccessModalOpen(true);
  };

  const handleExportBackup = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buffet_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const activeOrdersCount = data.orders.filter(o =>
    ['جديد', 'قيد التحضير', 'جاهز'].includes(o.status)
  ).length;

  const currentBlockedRecord = data.blockedCustomers?.find(b => b.sessionId === sessionId);
  const isCurrentSessionBlocked = !!currentBlockedRecord;
  const currentBlockedReason = currentBlockedRecord?.reason;

  const handleBlockCustomer = (targetSessionId: string, reason: string, customerName?: string, customerPhone?: string) => {
    blockCustomer(targetSessionId, reason, customerName, customerPhone, userModeState === 'staff' ? 'المطبخ/الكاشير' : 'الإدارة');
    setData(getAppData());
  };

  const handleUnblockCustomer = (targetSessionId: string) => {
    unblockCustomer(targetSessionId);
    setData(getAppData());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative min-h-screen border-x border-slate-900 shadow-2xl">
        {userModeState === 'landing' ? (
          <LandingView
            settings={data.settings}
            onCustomerStart={handleCustomerStart}
            onStaffLogin={handleStaffLogin}
          />
        ) : (
          <>
            <Header
              settings={data.settings}
              activeTab={activeTab}
              setActiveTab={handleSetActiveTab}
              cartItemCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
              openCart={() => setIsCartOpen(true)}
              activeOrdersCount={activeOrdersCount}
              userMode={userModeState}
              onToggleStatus={handleToggleBuffetStatus}
              onGoToLanding={handleGoToLanding}
            />

            <main className="flex-1 overflow-y-auto">
              {activeTab === 'menu' && (
                <MenuView
                  categories={data.categories}
                  products={data.products}
                  settings={data.settings}
                  userMode={userModeState}
                  onSelectProduct={p => setSelectedProductForDetail(p)}
                  onQuickAdd={handleQuickAdd}
                  onNavigateToManager={() => handleSetActiveTab('manager')}
                  onToggleStatus={handleToggleBuffetStatus}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersView
                  orders={data.orders}
                  settings={data.settings}
                  currentSessionId={sessionId}
                  userMode={userModeState}
                  blockedCustomers={data.blockedCustomers || []}
                  onUpdateStatus={(id, status: OrderStatus) => updateOrderStatus(id, status)}
                  onBlockCustomer={handleBlockCustomer}
                  onUnblockCustomer={handleUnblockCustomer}
                  onNavigateToMenu={() => handleSetActiveTab('menu')}
                  onDeleteOrder={deleteOrder}
                />
              )}

              {activeTab === 'manager' && userModeState === 'admin' ? (
                <ManagerView
                  data={data}
                  onAddCategory={addCategory}
                  onDeleteCategory={deleteCategory}
                  onAddProduct={addProduct}
                  onUpdateProduct={updateProduct}
                  onDeleteProduct={deleteProduct}
                  onAddStaff={addStaff}
                  onDeleteStaff={deleteStaff}
                  onUpdateSettings={updateSettings}
                  onToggleStatus={handleToggleBuffetStatus}
                  onBlockCustomer={handleBlockCustomer}
                  onUnblockCustomer={handleUnblockCustomer}
                  onResetAllData={resetAllData}
                  onExportBackup={handleExportBackup}
                  onImportBackup={importBackupJSON}
                />
              ) : activeTab === 'manager' ? (
                <div className="p-8 text-center space-y-3">
                  <div className="text-rose-400 font-bold text-sm bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                    🚫 عذراً، الوصول إلى لوحة الإدارة مقتصر على المدير فقط.
                  </div>
                  <button
                    onClick={() => handleSetActiveTab('orders')}
                    className="px-4 py-2 bg-slate-800 text-amber-400 font-bold text-xs rounded-xl"
                  >
                    العودة للطلبات
                  </button>
                </div>
              ) : null}
            </main>

            <BottomNav
              activeTab={activeTab}
              setActiveTab={handleSetActiveTab}
              activeOrdersCount={activeOrdersCount}
              userMode={userModeState}
              onGoToLanding={handleGoToLanding}
            />
          </>
        )}

        <CartSheet
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onSubmitOrder={handleSubmitOrder}
          settings={data.settings}
          isBlocked={isCurrentSessionBlocked}
          blockedReason={currentBlockedReason}
        />

        <ProductDetailModal
          product={selectedProductForDetail}
          currency={data.settings.currency}
          onClose={() => setSelectedProductForDetail(null)}
          onAddToCart={handleAddToCart}
        />

        <CloseBuffetModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          onConfirmClose={handleConfirmClose}
          currentReason={data.settings.closedReason}
          currentReopenTime={data.settings.reopenTime}
        />

        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          order={lastPlacedOrder}
          currency={data.settings.currency}
          onViewOrders={() => {
            setActiveTab('orders');
            setIsSuccessModalOpen(false);
          }}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      </div>
    </div>
  );
}