import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { X, Trash2, Plus, Minus, Send, CreditCard, Banknote, Store, User, AlertOctagon, Lock, Smartphone, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderPlaced }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, placeOrder, buffetStatus, paymentGatewayConfig, customerUser, setIsAuthModalOpen } = useApp();

  const [customerName, setCustomerName] = useState(() => customerUser ? customerUser.name : '');
  const [customerOffice, setCustomerOffice] = useState('استلام مباشر من البوفيه');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mada');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);

  React.useEffect(() => {
    if (customerUser) {
      setCustomerName(customerUser.name);
    }
  }, [customerUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buffetStatus.isOpen) {
      alert('البوفيه مغلق حالياً، نعتذر عن استقبال الطلبات.');
      return;
    }

    // Require Customer Authentication
    if (!customerUser) {
      alert('🔒 إرشادات الأمن والخصوصية:\nيرجى تسجيل الدخول أو إنشاء حساب عميل أولاً لإتمام طلبك وحفظه باسمك وبياناتك الخاصة.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerName.trim()) {
      alert('يرجى تعبئة اسم العميل');
      return;
    }
    if (cart.length === 0) return;

    if (paymentMethod === 'cash') {
      // Direct placement for Cash on Delivery (Unpaid until collected)
      setIsSubmitting(true);
      setTimeout(() => {
        const orderId = placeOrder(
          customerName,
          customerOffice,
          'cash',
          orderNotes,
          'unpaid',
          undefined,
          'الدفع عند الاستلام'
        );
        setIsSubmitting(false);
        onClose();
        onOrderPlaced(orderId);
      }, 300);
    } else {
      // Open Payment Gateway Modal for Electronic Methods
      setShowGatewayModal(true);
    }
  };

  const handleGatewaySuccess = (paymentReference: string, gatewayName: string) => {
    setShowGatewayModal(false);
    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = placeOrder(
        customerName,
        customerOffice,
        paymentMethod,
        orderNotes,
        'paid',
        paymentReference,
        gatewayName
      );
      setIsSubmitting(false);
      onClose();
      onOrderPlaced(orderId);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🛒
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">سلة الطلبات</h3>
              <span className="text-[10px] text-slate-400 block">{cart.length} أصناف في السلة</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Closed Warning Banner in Cart */}
        {!buffetStatus.isOpen && (
          <div className="p-3.5 bg-rose-900 text-rose-100 flex items-start gap-2.5 border-b border-rose-800 text-xs">
            <AlertOctagon className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-extrabold text-white text-xs leading-snug break-words">البوفيه مغلق حاليًا، ولا يمكن استقبال الطلبات الآن.</p>
              {(buffetStatus.closureReason || buffetStatus.reopenTime) && (
                <div className="pt-1.5 border-t border-rose-800/80 flex flex-col gap-0.5 text-[11px] text-rose-200">
                  {buffetStatus.closureReason && (
                    <p className="break-words leading-snug">
                      <span className="text-rose-300 font-bold">السبب:</span> {buffetStatus.closureReason}
                    </p>
                  )}
                  {buffetStatus.reopenTime && (
                    <p className="break-words leading-snug">
                      <span className="text-rose-300 font-bold">العودة المتوقعة:</span> <strong className="text-amber-300">{buffetStatus.reopenTime}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mb-4">
              ☕
            </div>
            <h4 className="font-bold text-base text-slate-800">السلة فارغة حالياً</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              تصفح منيو البوفيه وأضف مشروباتك وسندويشاتك المفضلة لبدء الطلب مباشرة
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Cart Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">الأصناف المختارة</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>تفريغ السلة</span>
                  </button>
                </div>

                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 relative group"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 truncate">{item.name}</h5>
                      
                      {/* Options breakdown */}
                      {Object.keys(item.selectedOptions).length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {Object.entries(item.selectedOptions)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </p>
                      )}

                      {item.itemNotes && (
                        <p className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1 font-medium">
                          📝 {item.itemNotes}
                        </p>
                      )}

                      <div className="text-xs font-extrabold text-emerald-700 mt-1">
                        {item.price * item.quantity} ر.س
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                        className="text-slate-600 hover:text-slate-900 p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                        className="text-slate-600 hover:text-slate-900 p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="حذف"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Pickup Details Form */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                
                {/* Section Title: طريقة الاستلام */}
                <span className="text-xs font-bold text-slate-800 block">طريقة الاستلام</span>

                {/* Single Option: الاستلام من البوفيه */}
                <div className="p-3 rounded-2xl bg-emerald-50/80 border-2 border-emerald-500 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-emerald-950 block">الاستلام من البوفيه</span>
                      <span className="text-[11px] text-emerald-700 block">استلام مباشر فور تحضير الطلب</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                    متاح فقط
                  </span>
                </div>

                {/* Customer Account Authentication Card */}
                {!customerUser ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-amber-950 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500 text-white font-bold shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-amber-900 text-xs">تسجيل الدخول مطلوب</p>
                        <p className="text-[10px] text-amber-800">يرجى تسجيل الدخول أو إنشاء حساب لربط الطلب وحفظه ببياناتك.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      دخول / حساب
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center gap-2 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>مسجل بـ: {customerUser.name} (@{customerUser.username})</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">حساب موثق</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>اسم العميل (مأخوذ من الحساب)</span>
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={!!customerUser}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="سيظهر اسمك التلقائي بعد الدخول"
                    className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      customerUser ? 'bg-slate-100 text-slate-700 font-bold cursor-not-allowed' : 'bg-slate-50'
                    }`}
                  />
                </div>

                {/* Payment Methods Options */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">اختر طريقة الدفع</label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: 'cash' as PaymentMethod,
                        title: 'الدفع عند الاستلام',
                        sub: 'نقداً (كاش) في البوفيه',
                        badge: 'غير مدفوع',
                        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                        icon: <Banknote className="w-4 h-4 text-amber-700 shrink-0" />
                      },
                      {
                        id: 'mada' as PaymentMethod,
                        title: 'بطاقة مدى',
                        sub: 'دفع إلكتروني مباشر',
                        badge: 'مدفوع فوري',
                        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                        icon: <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                      },
                      {
                        id: 'apple_pay' as PaymentMethod,
                        title: 'Apple Pay',
                        sub: 'دفع سريع وآمن',
                        badge: 'مدفوع فوري',
                        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                        icon: <Smartphone className="w-4 h-4 text-slate-900 shrink-0" />
                      },
                      {
                        id: 'visa_mastercard' as PaymentMethod,
                        title: 'فيزا / ماستركارد',
                        sub: 'بطاقات الائتمان',
                        badge: 'مدفوع فوري',
                        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                        icon: <CreditCard className="w-4 h-4 text-blue-700 shrink-0" />
                      }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                          paymentMethod === m.id
                            ? 'bg-emerald-50/90 border-2 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          {m.icon}
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${m.badgeColor}`}>
                            {m.badge}
                          </span>
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block leading-tight">{m.title}</span>
                          <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{m.sub}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Payment Info Note */}
                  <div className="p-2.5 rounded-xl bg-slate-100/90 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    {paymentMethod === 'cash' ? (
                      <span>حالة الطلب ستكون <strong className="text-amber-800">"غير مدفوع"</strong> حتى يتم التسديد كاش للبوفيه عند الاستلام.</span>
                    ) : (
                      <span>حالة الطلب ستتغير إلى <strong className="text-emerald-800">"مدفوع"</strong> تلقائيًا فور نجاح الخصم عبر بوابة الدفع.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">ملاحظات الطلب (إختياري)</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="مثال: يرجى وضع المشروب في كيس سفري..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

            </div>

            {/* Footer Summary & Checkout Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-3">
              <div className="flex items-center justify-between text-sm font-extrabold text-slate-900">
                <span>المبلغ الإجمالي</span>
                <span className="text-lg text-emerald-700">{cartTotal} ر.س</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !buffetStatus.isOpen}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                  buffetStatus.isOpen
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:scale-101 active:scale-99'
                    : 'bg-rose-900/80 text-rose-200 shadow-none cursor-not-allowed opacity-90'
                }`}
              >
                {isSubmitting ? (
                  <span className="animate-spin text-sm">⏳</span>
                ) : !buffetStatus.isOpen ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>البوفيه مغلق حاليًا، ولا يمكن استقبال الطلبات الآن.</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال الطلب للبوفيه</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={showGatewayModal}
        onClose={() => setShowGatewayModal(false)}
        onSuccess={handleGatewaySuccess}
        amount={cartTotal}
        paymentMethod={paymentMethod}
        customerName={customerName}
      />
    </div>
  );
};
