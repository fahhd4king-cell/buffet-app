import React, { useState } from 'react';
import { ClipboardList, Clock, CheckCircle2, ChevronRight, XCircle, Printer, MapPin, User, Utensils, ShieldCheck, Smartphone, Ban, ShieldAlert, Trash2, Search, Phone } from 'lucide-react';
import { Order, OrderStatus, BuffetSettings, BlockedCustomer } from '../types';
import { UserMode } from '../services/session';
import { setOrderEstimatedPickupTime, deleteOrder } from '../services/storage';
import { EmptyState } from './EmptyState';
import { ReceiptModal } from './ReceiptModal';
import { BlockModal } from './BlockModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Toast } from './Toast';

interface OrdersViewProps {
  orders: Order[];
  settings: BuffetSettings;
  currentSessionId: string;
  userMode: UserMode;
  blockedCustomers: BlockedCustomer[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onBlockCustomer: (sessionId: string, reason: string, customerName?: string, customerPhone?: string) => void;
  onUnblockCustomer: (sessionId: string) => void;
  onNavigateToMenu: () => void;
  onDeleteOrder?: (id: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  settings,
  currentSessionId,
  userMode,
  blockedCustomers,
  onUpdateStatus,
  onBlockCustomer,
  onUnblockCustomer,
  onNavigateToMenu,
  onDeleteOrder,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [blockingTargetOrder, setBlockingTargetOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleConfirmDeleteOrder = () => {
    if (!deletingOrderId) return;
    if (onDeleteOrder) {
      onDeleteOrder(deletingOrderId);
    } else {
      deleteOrder(deletingOrderId);
    }
    setDeletingOrderId(null);
    setToastMessage('تم الحذف بنجاح.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filter orders relevant to this user (For customer: ONLY their own session orders; For staff: ALL orders)
  const isCustomer = userMode === 'customer';
  const relevantOrders = isCustomer
    ? orders.filter(o => o.sessionId === currentSessionId)
    : orders;

  // Filter orders by status tab and search query
  const filteredOrders = relevantOrders.filter(o => {
    // 1. Status Filter
    const matchesStatus =
      selectedFilter === 'all'
        ? true
        : selectedFilter === 'active'
        ? ['جديد', 'قيد التحضير', 'جاهز'].includes(o.status)
        : o.status === selectedFilter;

    if (!matchesStatus) return false;

    // 2. Search Query (Order Number, Customer Phone, or Name)
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const orderNumStr = o.orderNumber.toString();
    const phoneStr = (o.customerPhone || '').toLowerCase();
    const nameStr = (o.customerName || '').toLowerCase();

    return orderNumStr.includes(query) || phoneStr.includes(query) || nameStr.includes(query);
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'جديد':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse';
      case 'قيد التحضير':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'جاهز':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'تم التسليم':
        return 'bg-slate-700/60 text-slate-300 border-slate-600/50';
      case 'ملغي':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    }
  };

  return (
    <div id="view-orders" className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Session/Privacy Indicator Badge */}
      {isCustomer ? (
        <div className="bg-[#111827] border border-[#F5B31B]/30 rounded-[20px] p-3.5 flex items-center justify-between text-xs gap-2 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <Smartphone className="w-4 h-4 text-[#F5B31B] shrink-0" />
            <div className="min-w-0">
              <p className="font-['Tajawal'] font-bold text-[#FFFFFF] text-[12px]">طلباتك الخاصة بهذا الجهاز</p>
              <p className="text-[10px] text-[#A8B3C7] truncate">محفوظة بجلسة خاصة لمنع التداخل مع باقي الزبائن</p>
            </div>
          </div>
          <span className="text-[10px] bg-[#F5B31B]/15 text-[#FFD66B] font-mono px-2.5 py-1 rounded-xl border border-[#F5B31B]/30 shrink-0 font-bold">
            #{currentSessionId.slice(-6)}
          </span>
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#F5B31B]/30 rounded-[20px] p-3.5 flex items-center gap-2 text-xs text-[#FFD66B] shadow-lg">
          <ShieldCheck className="w-4 h-4 text-[#F5B31B] shrink-0" />
          <span className="font-['Tajawal'] font-bold text-[11px]">شاشة الطلبات والكاشير: متابعة وتحديث حالة الطلبات لحظياً</span>
        </div>
      )}

      {/* Search Input Bar (Staff & Customer search by phone, order number, or name) */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="البحث برقم الطلب (مثال: 1024) أو رقم الجوال أو الاسم..."
          className="w-full bg-[#111827] border border-[#F5B31B]/30 rounded-[18px] pr-10 pl-4 py-2.5 text-xs text-[#FFFFFF] placeholder-[#A8B3C7]/60 focus:outline-none focus:border-[#F5B31B] shadow-lg transition-all"
        />
        <Search className="w-4 h-4 text-[#F5B31B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#A8B3C7] hover:text-[#FFFFFF]"
          >
            مسح
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
        {[
          { id: 'all', label: 'الكل', count: relevantOrders.length },
          { id: 'active', label: 'النشطة', count: relevantOrders.filter(o => ['جديد', 'قيد التحضير', 'جاهز'].includes(o.status)).length },
          { id: 'جديد', label: 'جديد', count: relevantOrders.filter(o => o.status === 'جديد').length },
          { id: 'قيد التحضير', label: 'قيد التحضير', count: relevantOrders.filter(o => o.status === 'قيد التحضير').length },
          { id: 'جاهز', label: 'جاهز', count: relevantOrders.filter(o => o.status === 'جاهز').length },
          { id: 'تم التسليم', label: 'مكتملة', count: relevantOrders.filter(o => o.status === 'تم التسليم').length },
          { id: 'ملغي', label: 'ملغية', count: relevantOrders.filter(o => o.status === 'ملغي').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-[18px] text-xs font-['Tajawal'] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === tab.id
                ? 'bg-gradient-to-r from-[#F5B31B] to-[#FFD66B] text-[#070B1A] border-[#FFD66B] shadow-lg shadow-[#F5B31B]/20'
                : 'bg-[#111827] text-[#A8B3C7] border-[#F5B31B]/15 hover:text-[#FFFFFF]'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] opacity-80">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Orders List / Empty State */}
      {relevantOrders.length === 0 ? (
        <EmptyState
          id="empty-state-orders"
          icon={ClipboardList}
          title={isCustomer ? "لم تقم بإنشاء أي طلبات بعد" : "لا توجد طلبات في القائمة"}
          description={isCustomer ? "اختر وجبتك المفضلة من المنيو وستظهر جميع طلباتك هنا وتتحدث لحظياً." : "ستظهر الطلبات الجديدة وتتحدث حالتها هنا لحظياً."}
          actionText={isCustomer ? "تصفح المنيو والطلب" : undefined}
          onAction={isCustomer ? onNavigateToMenu : undefined}
        />
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-[#A8B3C7]">
          <p className="text-xs font-medium">لا توجد طلبات تطابق نتائج البحث أو التصنيف المحدد</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map(order => {
            const isSessionBlocked = order.sessionId
              ? blockedCustomers.some(b => b.sessionId === order.sessionId)
              : false;

            return (
              <div
                key={order.id}
                className={`bg-[#111827] border hover:border-[#F5B31B]/40 rounded-[22px] p-4.5 space-y-3.5 shadow-xl transition-all ${
                  isSessionBlocked ? 'border-[#F44336]/50 bg-[#F44336]/10' : 'border-[#F5B31B]/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293D]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm font-['Tajawal'] font-black text-[#0B0F17] bg-gradient-to-r from-[#F7B500] to-[#FFD66B] px-3 py-1 rounded-xl shadow-md shrink-0">
                      #{order.orderNumber}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-['Tajawal'] font-bold text-[#FFFFFF] flex items-center gap-1 truncate">
                          <User className="w-3.5 h-3.5 text-[#F7B500] shrink-0" />
                          <span>{order.customerName}</span>
                        </h4>

                        {/* Blocked Badge for Staff View */}
                        {!isCustomer && isSessionBlocked && (
                          <span className="text-[10px] font-black bg-[#F44336]/20 text-[#F44336] px-2 py-0.5 rounded-lg border border-[#F44336]/30 flex items-center gap-1">
                            <Ban className="w-3 h-3 text-[#F44336]" />
                            <span>جهاز محظور</span>
                          </span>
                        )}
                      </div>

                      {order.customerPhone && (
                        <p className="text-[11px] font-mono text-[#FFD66B] flex items-center gap-1 mt-0.5 truncate font-bold">
                          <Phone className="w-3 h-3 text-[#F7B500] shrink-0" />
                          <span>{order.customerPhone}</span>
                        </p>
                      )}

                      {order.destinationDetails && (
                        <p className="text-[10px] text-[#A8B3C7] flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-[#A8B3C7] shrink-0" />
                          <span>{order.destinationDetails}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-['Tajawal'] font-bold px-3 py-1 rounded-full border shrink-0 ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

              {/* Order Info & Items */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-[#A8B3C7]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#F7B500]" />
                    <span>{new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  <span className="bg-[#0B0F17] px-2.5 py-0.5 rounded-lg text-[#FFFFFF] border border-[#1E293D]">
                    {order.orderType}
                  </span>
                </div>

                {/* Estimated Pickup Time Badge */}
                {order.estimatedPickupTime && (
                  <div className="bg-[#F7B500]/10 border border-[#F7B500]/30 text-[#FFD66B] rounded-2xl p-2.5 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#F7B500] animate-pulse" />
                      <span>وقت الاستلام المتوقع:</span>
                    </span>
                    <span className="bg-gradient-to-r from-[#F7B500] to-[#FFD66B] text-[#0B0F17] font-black px-2.5 py-0.5 rounded-lg text-[11px] shadow-sm">
                      {order.estimatedPickupTime}
                    </span>
                  </div>
                )}

                {/* Staff Estimated Pickup Time Selector */}
                {!isCustomer && ['جديد', 'قيد التحضير'].includes(order.status) && (
                  <div className="bg-[#0B0F17] p-2.5 rounded-2xl border border-[#F7B500]/20 space-y-1.5">
                    <span className="text-[10px] text-[#FFD66B] font-bold block">تحديد وقت التحضير المتوقع للزبون:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[5, 10, 15, 30].map(mins => (
                        <button
                          key={mins}
                          onClick={() => setOrderEstimatedPickupTime(order.id, mins)}
                          className={`py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                            order.estimatedPickupMinutes === mins
                              ? 'bg-[#F7B500] text-[#0B0F17] border-[#F7B500] font-black shadow-md'
                              : 'bg-[#121926] text-[#A8B3C7] border-[#1E293D] hover:bg-[#1E293D]'
                          }`}
                        >
                          {mins} دقائق
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Read-Only Status Timeline Bar */}
                {isCustomer && (
                  <div className="bg-[#070B1A] border border-[#F5B31B]/20 rounded-2xl p-3 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs font-['Tajawal'] font-bold text-[#A8B3C7]">
                      <span className="flex items-center gap-1.5 text-[#FFD66B]">
                        <span>📦 حالة الطلب</span>
                      </span>
                      <span className="text-xs font-black text-[#F5B31B]">{order.status}</span>
                    </div>

                    {order.status === 'ملغي' ? (
                      <div className="p-2.5 bg-[#F44336]/15 border border-[#F44336]/30 rounded-xl text-center text-xs text-[#F44336] font-bold">
                        عذراً، تم إلغاء هذا الطلب من قبل إدارة البوفيه.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-1 relative pt-1 text-center">
                        {[
                          { key: 'جديد', label: 'جديد', emoji: '🟡' },
                          { key: 'قيد التحضير', label: 'قيد التحضير', emoji: '🔵' },
                          { key: 'جاهز', label: 'جاهز للاستلام', emoji: '🟢' },
                          { key: 'تم التسليم', label: 'تم التسليم', emoji: '✅' },
                        ].map((step, idx) => {
                          const sequence = ['جديد', 'قيد التحضير', 'جاهز', 'تم التسليم'];
                          const currentIdx = sequence.indexOf(order.status);
                          const isPassed = currentIdx >= idx;
                          const isCurrent = currentIdx === idx;

                          return (
                            <div key={step.key} className="flex flex-col items-center space-y-1">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                                  isCurrent
                                    ? 'ring-2 ring-[#F5B31B] bg-[#111827] shadow-md scale-110'
                                    : isPassed
                                    ? 'bg-[#111827] border border-[#F5B31B]/40 opacity-90'
                                    : 'bg-[#111827]/40 border border-[#1E293D] opacity-40'
                                }`}
                              >
                                <span>{step.emoji}</span>
                              </div>
                              <span
                                className={`text-[9px] font-['Tajawal'] font-bold ${
                                  isCurrent
                                    ? 'text-[#F5B31B]'
                                    : isPassed
                                    ? 'text-[#FFFFFF]'
                                    : 'text-[#A8B3C7]/50'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-[#0B0F17] p-3 rounded-2xl border border-[#1E293D] space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#F7B500] bg-[#F7B500]/10 px-1.5 py-0.5 rounded-md">{item.quantity}x</span>
                        <span className="text-[#FFFFFF] font-bold">{item.productName}</span>
                        {item.selectedAddons.length > 0 && (
                          <span className="text-[10px] text-[#A8B3C7]">
                            ({item.selectedAddons.map(a => a.name).join('، ')})
                          </span>
                        )}
                      </div>
                      <span className="text-[#FFD66B] text-[11px] font-bold">
                        {item.itemTotal} {settings.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Total & Actions */}
              <div className="flex items-center justify-between pt-2.5 border-t border-[#1E293D]">
                <div>
                  <span className="text-[10px] text-[#A8B3C7] block">الإجمالي:</span>
                  <span className="text-sm font-['Tajawal'] font-black text-[#FFD66B]">
                    {order.total} {settings.currency}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveReceiptOrder(order)}
                    className="p-2 bg-[#0B0F17] hover:bg-[#1E293D] text-[#A8B3C7] hover:text-[#FFFFFF] border border-[#1E293D] rounded-xl transition-all cursor-pointer"
                    title="الفاتورة"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {/* Staff / Cashier / Manager Only Actions */}
                  {!isCustomer && (
                    <>
                      {/* Status Progression buttons */}
                      {order.status === 'جديد' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'قيد التحضير')}
                          className="px-3 py-2 bg-gradient-to-r from-[#F7B500] to-[#FFD66B] hover:opacity-95 text-[#0B0F17] font-['Tajawal'] font-black text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <span>بدء التحضير</span>
                          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-[#0B0F17]" />
                        </button>
                      )}

                      {order.status === 'قيد التحضير' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'جاهز')}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white font-['Tajawal'] font-black text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <span>جاهز للتسليم</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {order.status === 'جاهز' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'تم التسليم')}
                          className="px-3 py-2 bg-[#00C853] hover:opacity-95 text-white font-['Tajawal'] font-black text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <span>تم التسليم</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {['جديد', 'قيد التحضير'].includes(order.status) && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'ملغي')}
                          className="p-2 text-[#F44336] hover:bg-[#F44336]/10 rounded-xl cursor-pointer"
                          title="إلغاء الطلب"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Staff Delete Order Action */}
                      <button
                        onClick={() => setDeletingOrderId(order.id)}
                        className="p-2 text-[#F44336] hover:bg-[#F44336]/10 rounded-xl cursor-pointer"
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Staff Block / Unblock Customer Device Action */}
                      {order.sessionId && (
                        isSessionBlocked ? (
                          <button
                            onClick={() => onUnblockCustomer(order.sessionId!)}
                            className="p-1.5 bg-[#F44336]/10 hover:bg-[#00C853]/20 text-[#F44336] hover:text-[#00C853] rounded-xl border border-[#F44336]/30 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                            title="إلغاء حظر هذا الجهاز"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>فك الحظر</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setBlockingTargetOrder(order)}
                            className="p-1.5 bg-[#F44336]/10 hover:bg-[#F44336]/20 text-[#F44336] rounded-xl border border-[#F44336]/20 flex items-center gap-1 text-[10px] font-bold transition-all cursor-pointer"
                            title="حظر هذا الجهاز من الطلب"
                          >
                            <Ban className="w-3 h-3" />
                            <span>حظر الجهاز</span>
                          </button>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {activeReceiptOrder && (
        <ReceiptModal
          order={activeReceiptOrder}
          settings={settings}
          onClose={() => setActiveReceiptOrder(null)}
        />
      )}

      {/* Block Customer Device Modal */}
      {blockingTargetOrder && (
        <BlockModal
          isOpen={!!blockingTargetOrder}
          customerName={blockingTargetOrder.customerName}
          sessionId={blockingTargetOrder.sessionId || ''}
          onClose={() => setBlockingTargetOrder(null)}
          onConfirmBlock={(reason) => {
            if (blockingTargetOrder.sessionId) {
              onBlockCustomer(
                blockingTargetOrder.sessionId,
                reason,
                blockingTargetOrder.customerName,
                blockingTargetOrder.customerPhone,
              );
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={!!deletingOrderId}
        onClose={() => setDeletingOrderId(null)}
        onConfirm={handleConfirmDeleteOrder}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذه العملية."
      />

      {/* Success Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};
