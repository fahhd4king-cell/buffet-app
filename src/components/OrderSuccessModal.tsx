import React from 'react';
import { CheckCircle2, ShoppingBag, Clock, ArrowRight, User, Phone, CreditCard, ChevronLeft } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  isOpen: boolean;
  order: Order | null;
  currency?: string;
  onViewOrders: () => void;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  order,
  currency = 'ر.س',
  onViewOrders,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div
      id="order-success-backdrop"
      className="fixed inset-0 z-50 bg-[#070B1A]/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        id="order-success-modal"
        className="bg-[#111827] border border-[#F5B31B]/30 w-full max-w-md rounded-[24px] overflow-hidden shadow-2xl p-6 space-y-5 animate-slide-up text-center relative"
      >
        {/* Animated Success Badge */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#18D26E]/20 rounded-full animate-ping opacity-50"></div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#18D26E]/20 to-[#18D26E]/10 border border-[#18D26E]/40 flex items-center justify-center text-[#18D26E] shadow-xl shadow-[#18D26E]/10">
            <CheckCircle2 className="w-11 h-11 text-[#18D26E]" />
          </div>
        </div>

        {/* Header Texts */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-['Tajawal'] font-black text-[#FFFFFF]">✅ تم استلام طلبك</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5B31B]/15 border border-[#F5B31B]/30 rounded-full text-[#FFD66B] text-xs font-mono font-bold">
            <span>رقم الطلب</span>
            <span className="text-sm font-extrabold text-[#F5B31B]">#{order.orderNumber}</span>
          </div>
          <p className="text-xs text-[#A8B3C7] pt-1 font-['Tajawal'] font-bold">
            سيتم تجهيز طلبك قريباً. يمكنك متابعة حالة التحضير لحظياً.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#070B1A] border border-[#F5B31B]/20 rounded-[20px] p-4 text-right space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293D] text-[11px] text-[#A8B3C7]">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#F5B31B]" />
              <span className="text-[#FFFFFF] font-bold">{order.customerName}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#A8B3C7]" />
                <span className="font-mono text-[#A8B3C7]">{order.customerPhone}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#A8B3C7]">
              <CreditCard className="w-3.5 h-3.5 text-[#F5B31B]" />
              <span>طريقة الدفع:</span>
            </div>
            <span className="font-bold text-[#F5B31B] bg-[#F5B31B]/10 px-2.5 py-0.5 rounded-lg border border-[#F5B31B]/20">
              {order.paymentMethod}
            </span>
          </div>

          {/* Items Summary */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] text-[#A8B3C7] font-bold flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-[#F5B31B]" />
              <span>محتويات الطلب:</span>
            </p>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-['Tajawal'] text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[#FFFFFF] bg-[#111827] px-2.5 py-1.5 rounded-xl border border-[#1E293D]">
                  <span className="truncate max-w-[200px]">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-mono font-bold text-[#FFD66B]">
                    {item.itemTotal} {currency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Price */}
          <div className="flex justify-between items-center pt-2 border-t border-[#1E293D] text-sm">
            <span className="font-bold text-[#FFFFFF]">الإجمالي الكلي:</span>
            <span className="font-black font-mono text-base text-[#F5B31B]">
              {order.total} {currency}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            id="btn-view-order-status"
            type="button"
            onClick={() => {
              onViewOrders();
              onClose();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-[#F5B31B] to-[#FFD66B] hover:opacity-95 text-[#070B1A] font-['Tajawal'] font-black text-xs rounded-[16px] shadow-lg shadow-[#F5B31B]/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>متابعة حالة الطلب</span>
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="btn-[#close-success-modal]"
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#1E293D] hover:bg-[#334155] text-[#A8B3C7] hover:text-[#FFFFFF] font-['Tajawal'] font-bold text-xs rounded-[16px] transition-all cursor-pointer"
          >
            العودة للمنيو
          </button>
        </div>
      </div>
    </div>
  );
};
