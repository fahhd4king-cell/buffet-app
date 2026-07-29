import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, User, Phone, CreditCard, ShoppingBag, Ban, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem, OrderType, PaymentMethod, BuffetSettings } from '../types';
import { getVerifiedCustomerInfo, saveVerifiedCustomerInfo } from '../services/session';
import { settingsService } from '../services/settingsService';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (orderDetails: {
    customerName: string;
    customerPhone: string;
    destinationDetails: string;
    orderType: OrderType;
    paymentMethod: PaymentMethod;
  }) => void;
  settings: BuffetSettings;
  isBlocked?: boolean;
  blockedReason?: string;
}

export const CartSheet: React.FC<CartSheetProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  settings,
  isBlocked = false,
  blockedReason,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('كاش');
  const [validationError, setValidationError] = useState('');
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  // Load saved verified customer info on mount / open
  useEffect(() => {
    if (isOpen) {
      const verified = getVerifiedCustomerInfo();
      if (verified) {
        setCustomerName(verified.name);
        setCustomerPhone(verified.phone);
        setIsPhoneVerified(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = settings.taxPercentage > 0 ? (subtotal * settings.taxPercentage) / 100 : 0;
  const total = subtotal + tax;

  // Handles initial WhatsApp Phone Verification (Runs ONLY ONCE per device/customer)
  const handleVerifyPhoneViaWhatsApp = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setValidationError('يرجى كتابة الاسم ورقم الجوال أولاً للتحقق');
      return;
    }

    const targetWhatsapp = settingsService.getWhatsappNumber();
    if (!targetWhatsapp) {
      setValidationError('لم يتم إعداد رقم واتساب المتجر بعد.');
      return;
    }

    setValidationError('');
    const formattedName = customerName.trim();
    const formattedPhone = customerPhone.trim();

    // Save profile to localStorage as verified
    saveVerifiedCustomerInfo(formattedName, formattedPhone);
    setIsPhoneVerified(true);
    setVerificationNotice('تم التحقق من رقم الجوال وتأكيده بنجاح! يمكنك الآن الضغط على "تأكيد الطلب".');

    // Build properly encoded WhatsApp message
    const buffetName = settings.buffetName || 'بوفيه فادي';
    const msg = `مرحباً ${buffetName} 👋🏼\nأود التحقق وتأكيد رقم الجوال لتنفيذ الطلبات:\n👤 الاسم: ${formattedName}\n📱 الجوال: ${formattedPhone}`;
    const waUrl = `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(msg)}`;

    try {
      window.open(waUrl, '_blank');
    } catch {
      // Ignored
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      setValidationError('يرجى كتابة الاسم ورقم الجوال لتأكيد الطلب.');
      return;
    }

    setValidationError('');
    const formattedName = customerName.trim();
    const formattedPhone = customerPhone.trim();

    // Ensure customer info is saved to local device
    saveVerifiedCustomerInfo(formattedName, formattedPhone);
    setIsPhoneVerified(true);

    // Save order directly inside system (NO WhatsApp opened on order submit)
    onSubmitOrder({
      customerName: formattedName,
      customerPhone: formattedPhone,
      destinationDetails: 'استلام مباشر من المحل',
      orderType: 'استلام من المحل (Pickup)',
      paymentMethod,
    });
  };

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 bg-[#070B1A]/85 backdrop-blur-md flex items-end justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        id="cart-drawer-container"
        className="bg-[#111827] border border-[#F5B31B]/30 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl animate-slide-up relative"
      >
        {/* Sheet Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1E293D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#F5B31B]/15 text-[#F5B31B] border border-[#F5B31B]/30 shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-['Tajawal'] font-bold text-[#FFFFFF]">سلة الطلبات</h2>
              <p className="text-[11px] text-[#A8B3C7] font-['Tajawal']">{items.length} أصناف • استلام من المحل</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                id="btn-clear-cart"
                onClick={onClearCart}
                className="text-xs font-['Tajawal'] text-[#F44336] hover:text-[#F44336]/80 font-bold px-2.5 py-1 bg-[#F44336]/10 rounded-xl cursor-pointer"
              >
                تفريغ السلة
              </button>
            )}
            <button
              id="btn-close-cart"
              onClick={onClose}
              className="p-2 text-[#A8B3C7] hover:text-[#FFFFFF] bg-[#070B1A] rounded-full cursor-pointer border border-[#1E293D]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#070B1A] border border-[#1E293D] mx-auto flex items-center justify-center text-[#A8B3C7] mb-3">
                <ShoppingBag className="w-8 h-8 text-[#F5B31B]" />
              </div>
              <p className="text-sm font-['Tajawal'] font-bold text-[#FFFFFF]">السلة فارغة</p>
              <p className="text-xs text-[#A8B3C7]">اختر الأصناف من المنيو لإضافتها إلى السلة</p>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-2.5">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#070B1A] border border-[#1E293D] rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-['Tajawal'] font-bold text-[#FFFFFF] truncate">{item.product.name}</h4>
                      {item.selectedAddons.length > 0 && (
                        <p className="text-[11px] text-[#FFD66B] truncate">
                          + {item.selectedAddons.map(a => a.name).join('، ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[10px] text-[#A8B3C7] italic truncate">ملاحظة: {item.notes}</p>
                      )}
                      <p className="text-xs text-[#F5B31B] font-mono font-bold mt-0.5">
                        {item.totalPrice} {settings.currency}
                      </p>
                    </div>

                    {/* Quantity & Delete */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-[#111827] border border-[#1E293D] p-1 rounded-xl">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-[#1E293D] hover:bg-[#334155] text-[#FFFFFF] flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-extrabold text-[#FFFFFF] min-w-[18px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-[#F5B31B] hover:opacity-90 text-[#070B1A] flex items-center justify-center font-bold cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-[#F44336] hover:bg-[#F44336]/10 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details Form */}
              <form id="form-submit-order" onSubmit={handleSubmit} className="space-y-3.5 pt-3.5 border-t border-[#1E293D]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-['Tajawal'] font-bold text-[#FFFFFF]">بيانات العملاء والتأكيد</h3>
                  {isPhoneVerified && (
                    <span className="text-[10px] text-[#18D26E] font-bold bg-[#18D26E]/15 border border-[#18D26E]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#18D26E]" />
                      <span>رقم موثق ومحفوظ</span>
                    </span>
                  )}
                </div>

                {/* Customer Real Name */}
                <div>
                  <label className="text-[11px] font-['Tajawal'] font-bold text-[#A8B3C7] mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#F5B31B]" />
                    <span>الاسم (إجباري) *</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => {
                      setCustomerName(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="أدخل اسمك الحقيقي"
                    className="w-full bg-[#070B1A] border border-[#F5B31B]/30 rounded-xl px-3 py-2.5 text-xs text-[#FFFFFF] placeholder-[#A8B3C7]/50 focus:outline-none focus:border-[#F5B31B]"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-[11px] font-['Tajawal'] font-bold text-[#A8B3C7] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#F5B31B]" />
                    <span>رقم الجوال (إجباري) *</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => {
                      setCustomerPhone(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="مثال: 0501234567"
                    className="w-full bg-[#070B1A] border border-[#F5B31B]/30 rounded-xl px-3 py-2.5 text-xs text-[#FFFFFF] placeholder-[#A8B3C7]/50 font-mono focus:outline-none focus:border-[#F5B31B]"
                    required
                  />
                </div>

                {/* Verification Action (Only required once on first order) */}
                {!isPhoneVerified && customerName.trim() && customerPhone.trim() && (
                  <div className="p-3 bg-[#F5B31B]/10 border border-[#F5B31B]/30 rounded-xl space-y-2 text-xs animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-[#FFD66B] font-bold">
                      <Sparkles className="w-4 h-4 text-[#F5B31B]" />
                      <span>تأكيد الرقم عبر الواتساب (مرة واحدة فقط):</span>
                    </div>
                    {!settingsService.getWhatsappNumber() ? (
                      <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-bold text-center">
                        لم يتم إعداد رقم واتساب المتجر بعد.
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] text-[#A8B3C7] leading-relaxed">
                          للتحقق من الجوال لأول مرة فقط، اضغط الزر أدناه لإرسال رسالة توثيق سريعة. لن يتطلب أي واتساب في جميع طلباتك القادمة.
                        </p>
                        <button
                          type="button"
                          onClick={handleVerifyPhoneViaWhatsApp}
                          className="w-full py-2 bg-[#18D26E] hover:opacity-95 text-[#FFFFFF] font-['Tajawal'] font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <span>التحقق من رقم الجوال عبر الواتساب</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Verification Notice Success */}
                {verificationNotice && (
                  <div className="p-2.5 bg-[#18D26E]/15 border border-[#18D26E]/40 rounded-xl flex items-center gap-2 text-[#18D26E] text-xs font-bold animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#18D26E]" />
                    <span>{verificationNotice}</span>
                  </div>
                )}

                {/* Fixed Pickup Option Badge */}
                <div className="p-2.5 bg-[#070B1A] rounded-xl border border-[#1E293D] text-xs flex items-center justify-between text-[#A8B3C7]">
                  <span className="font-['Tajawal'] font-bold text-[#A8B3C7]">نوع الخدمة:</span>
                  <span className="font-['Tajawal'] font-bold text-[#FFD66B] bg-[#F5B31B]/15 px-2.5 py-1 rounded-lg border border-[#F5B31B]/30">
                    استلام من المحل (Pickup)
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="text-[11px] font-['Tajawal'] font-bold text-[#A8B3C7] mb-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-[#F5B31B]" />
                    <span>طريقة الدفع</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(['كاش', 'شبكة', 'Apple Pay', 'تحويل بنكي', 'حساب آجل'] as PaymentMethod[]).map(method => {
                      if (method === 'حساب آجل' && !settings.allowDeferredPayment) return null;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 px-2 text-[11px] font-['Tajawal'] font-bold rounded-xl border transition-all text-center cursor-pointer ${
                            paymentMethod === method
                              ? 'bg-[#F5B31B]/20 border-[#F5B31B] text-[#FFD66B] shadow-md'
                              : 'bg-[#070B1A] border-[#1E293D] text-[#A8B3C7] hover:text-[#FFFFFF]'
                          }`}
                        >
                          {method}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bill Breakdown Summary */}
                <div className="bg-[#070B1A] p-3 rounded-2xl border border-[#1E293D] space-y-1.5 text-xs text-[#A8B3C7]">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span className="font-mono text-[#FFFFFF]">
                      {subtotal} {settings.currency}
                    </span>
                  </div>
                  {settings.taxPercentage > 0 && (
                    <div className="flex justify-between">
                      <span>الضريبة ({settings.taxPercentage}%):</span>
                      <span className="font-mono text-[#FFFFFF]">
                        {tax.toFixed(2)} {settings.currency}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-[#F5B31B] text-sm pt-1.5 border-t border-[#1E293D]">
                    <span className="font-['Tajawal']">الإجمالي النهائي:</span>
                    <span className="font-mono">
                      {total.toFixed(2)} {settings.currency}
                    </span>
                  </div>
                </div>

                {/* Validation Error Alert */}
                {validationError && (
                  <div className="p-3 bg-[#F44336]/15 border border-[#F44336]/40 rounded-xl flex items-center gap-2 text-[#F44336] text-xs font-bold animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#F44336]" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Submit Action, Blocked Alert or Closed Notice */}
                {isBlocked ? (
                  <div className="bg-[#F44336]/15 border border-[#F44336]/40 p-4 rounded-2xl text-center space-y-2 mt-2 animate-fadeIn">
                    <div className="flex items-center justify-center gap-1.5 text-[#F44336] font-extrabold text-xs">
                      <Ban className="w-5 h-5 text-[#F44336]" />
                      <span>عذراً، هذا الحساب/الجهاز محظور حالياً من إرسال الطلبات</span>
                    </div>
                    <p className="text-[11px] text-[#A8B3C7] leading-relaxed">
                      تم تعليق خيار إنشاء طلبات جديدة لهذا الجهاز بسبب تكرار إيقاف الطلبات أو عدم الاستلام (No-Show).
                    </p>
                    {blockedReason && (
                      <p className="text-[11px] font-bold text-[#FFD66B] bg-[#070B1A] px-3 py-1.5 rounded-xl border border-[#1E293D]">
                        السبب: {blockedReason}
                      </p>
                    )}
                    <p className="text-[10px] text-[#A8B3C7]">يرجى مراجعة إدارة البوفيه أو الموظف المسؤول لفك الحظر.</p>
                  </div>
                ) : settings.isOpen !== false ? (
                  <button
                    id="btn-submit-order"
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#F5B31B] to-[#FFD66B] hover:opacity-95 text-[#070B1A] font-['Tajawal'] font-black text-xs rounded-2xl shadow-xl shadow-[#F5B31B]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>تأكيد الطلب</span>
                  </button>
                ) : (
                  <div className="bg-[#F44336]/10 border border-[#F44336]/30 p-3 rounded-2xl text-center space-y-1.5 mt-2 text-xs">
                    <p className="font-extrabold text-[#F44336]">البوفيه مغلق حالياً</p>
                    {settings.closedReason && (
                      <p className="text-[11px] text-[#FFD66B]">السبب: {settings.closedReason}</p>
                    )}
                    {settings.reopenTime && (
                      <p className="text-[11px] text-[#18D26E] font-bold">إعادة الفتح المتوقعة: {settings.reopenTime}</p>
                    )}
                    {!settings.closedReason && !settings.reopenTime && (
                      <p className="text-[11px] text-[#A8B3C7]">
                        اعتذاراً، استقبال الطلبات الجديدة متوقف حالياً.
                      </p>
                    )}
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
