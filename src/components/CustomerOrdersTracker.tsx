import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { OrderChatModal } from './OrderChatModal';
import { supabase } from '../lib/supabase';
import { X, Clock, MessageSquare, CheckCircle2, ChevronRight, Sparkles, MapPin, Check, Lock, UserCheck } from 'lucide-react';

interface CustomerOrdersTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  highlightOrderId?: string;
}

export const CustomerOrdersTracker: React.FC<CustomerOrdersTrackerProps> = ({
  isOpen,
  onClose,
  highlightOrderId,
}) => {
  const { orders, customerUser, updateOrderStatus, setIsAuthModalOpen } = useApp();
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  // تفعيل التحديث الفوري لجلب الطلبات الجديدة بين الجوالات مباشرة
  useEffect(() => {
    if (!isOpen || !supabase) return;

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          // إعادة تحميل الصفحة لتحديث الطلبات فوراً عند إرسال طلب جديد من أي جوال آخر
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Strict Privacy: Filter so customer sees ONLY their own orders
  const myOrders = customerUser
    ? orders.filter((o) => o.userId === customerUser.id || o.customerName === customerUser.name)
    : [];

  const statusSteps: { id: OrderStatus; label: string; icon: string }[] = [
    { id: 'received', label: 'تم استلام الطلب', icon: '✅' },
    { id: 'preparing', label: 'جاري التحضير', icon: '👨‍🍳' },
    { id: 'ready', label: 'جاهز للاستلام', icon: '🔔' },
    { id: 'delivered', label: 'تم الاستلام', icon: '✔️' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              📋
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">متابعة طلباتي</h3>
              <span className="text-[10px] text-slate-400 block">
                {customerUser ? `حساب: ${customerUser.name}` : 'حالة طلباتك الحالية في البوفيه'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col justify-center">
          {!customerUser ? (
            <div className="text-center py-12 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 my-auto">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-base text-slate-900">حماية خصوصية الطلبات 🔒</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  حفاظاً على سرية وخصوصية بياناتك، يرجى تسجيل الدخول أو إنشاء حساب جديد لمتابعة جميع طلباتك الخاصة وحالتها مباشرة.
                </p>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>تسجيل الدخول / إنشاء حساب</span>
              </button>
            </div>
          ) : myOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 my-auto">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-600" />
              <p className="font-bold text-sm text-slate-700">لا توجد طلبات مسجلة بحسابك حالياً</p>
              <p className="text-xs text-slate-400 mt-1">عند إرسال طلب جديد من المنيو، ستظهر حالته هنا مباشرة</p>
            </div>
          ) : (
            myOrders.map((ord) => {
              const currentStepIdx = getStepIndex(ord.status);
              const isHighlight = highlightOrderId === ord.id;

              return (
                <div
                  key={ord.id}
                  className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-4 ${
                    isHighlight
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                      : 'border-slate-200/80'
                  }`}
                >
                  {/* Order Top Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">رقم الطلب: {ord.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {ord.customerOffice || 'مباشر'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        تاريخ الطلب: {new Date(ord.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveChatOrder(ord)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer relative"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>محادثة البوفيه</span>
                      {ord.chatMessages.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      )}
                    </button>
                  </div>

                  {/* Status Progress Bar / Stepper */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">مرحلة الطلب:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        ord.status === 'ready'
                          ? 'bg-emerald-500 text-white animate-bounce shadow-md shadow-emerald-500/30'
                          : ord.status === 'preparing'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : ord.status === 'delivered'
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {statusSteps[currentStepIdx].icon} {statusSteps[currentStepIdx].label}
                      </span>
                    </div>

                    {/* Stepper Steps */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {statusSteps.map((s, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <div key={s.id} className="flex flex-col items-center gap-1 text-center">
                            <div
                              className={`w-full h-2 rounded-full transition-all ${
                                isDone
                                  ? isCurrent && s.id === 'ready'
                                    ? 'bg-emerald-500 animate-pulse'
                                    : 'bg-emerald-600'
                                  : 'bg-slate-200'
                              }`}
                            />
                            <span
                              className={`text-[10px] font-bold leading-tight ${
                                isDone ? 'text-slate-900 font-extrabold' : 'text-slate-400'
                              }`}
                            >
                              {s.icon} {s.label.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ready Action Button */}
                  {ord.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'delivered')}
                      className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>📍 استلام الطلب</span>
                    </button>
                  )}

                  {/* Order Items Summary */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 block">الأصناف المطلوب تحضيرها:</span>
                    <ul className="space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      {ord.items.map((it, idx) => (
                        <li key={idx} className="flex items-center justify-between text-slate-700">
                          <span>
                            <strong className="text-amber-700 font-extrabold">{it.quantity}x</strong> {it.name}
                            {Object.values(it.selectedOptions).length > 0 && (
                              <span className="text-[10px] text-slate-400 mr-1">
                                ({Object.values(it.selectedOptions).join(', ')})
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-slate-900">{it.price * it.quantity} ر.س</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Total & Payment Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 text-xs gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-500 font-bold">طريقة الدفع:</span>
                      <span className="font-extrabold text-slate-800">
                        {ord.paymentMethod === 'cash'
                          ? '💵 كاش (عند الاستلام)'
                          : ord.paymentMethod === 'mada'
                          ? '💳 بطاقة مدى'
                          : ord.paymentMethod === 'apple_pay'
                          ? '🍎 Apple Pay'
                          : ord.paymentMethod === 'visa_mastercard'
                          ? '💳 فيزا / ماستركارد'
                          : '💳 دفع إلكتروني'}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {ord.paymentStatus === 'paid' ? '✓ مدفوع' : '⏳ غير مدفوع'}
                      </span>
                    </div>

                    <div className="text-sm font-black text-emerald-700 flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-xs text-slate-400 font-normal sm:hidden">المجموع:</span>
                      <span>{ord.totalPrice} ر.س</span>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Chat Modal popup */}
      {activeChatOrder && (
        <OrderChatModal
          order={activeChatOrder}
          isOpen={!!activeChatOrder}
          onClose={() => setActiveChatOrder(null)}
          currentUserRole="customer"
        />
      )}
    </div>
  );
};