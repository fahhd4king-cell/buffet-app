import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { X, Lock, ShieldCheck, CreditCard, Smartphone, CheckCircle2, RefreshCw } from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentReference: string, gatewayName: string) => void;
  amount: number;
  paymentMethod: PaymentMethod;
  customerName: string;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  paymentMethod,
  customerName,
}) => {
  const { paymentGatewayConfig } = useApp();

  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 1111');
  const [cardHolder, setCardHolder] = useState(customerName || 'عبدالرحمن الشمري');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  if (!isOpen) return null;

  // Determine active gateway brand name
  const getGatewayBrandName = () => {
    switch (paymentGatewayConfig.activeGateway) {
      case 'tap':
        return 'Tap Payments';
      case 'hyperpay':
        return 'HyperPay Gateway';
      case 'paytabs':
        return 'PayTabs e-Payment';
      default:
        return 'بوابة الدفع الإلكتروني الآمنة';
    }
  };

  const gatewayBrand = getGatewayBrandName();

  const getMethodTitle = () => {
    switch (paymentMethod) {
      case 'mada':
        return 'الدفع ببطاقة مدى المباشرة';
      case 'apple_pay':
        return 'Apple Pay - الدفع السريع';
      case 'visa_mastercard':
        return 'الدفع ببطاقات فيزا / ماستركارد';
      default:
        return 'الدفع الإلكتروني';
    }
  };

  const handlePay = () => {
    setIsProcessing(true);
    setStep('processing');

    setTimeout(() => {
      const prefix = paymentGatewayConfig.activeGateway === 'tap'
        ? 'TAP'
        : paymentGatewayConfig.activeGateway === 'hyperpay'
        ? 'HYPER'
        : paymentGatewayConfig.activeGateway === 'paytabs'
        ? 'PAYTABS'
        : 'PAY';
      const refId = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

      setStep('success');
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(refId, gatewayBrand);
      }, 700);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-white leading-snug">{getMethodTitle()}</h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>مشفر ببروتوكول SSL عبر {gatewayBrand}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Test Mode Banner */}
        {paymentGatewayConfig.testMode && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-amber-800 text-[11px] font-bold flex items-center justify-between">
            <span>⚠️ بيئة اختبار بوابات الدفع (Test Mode)</span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">مهيأ للربط</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Order Summary Box */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">إجمالي مبلغ الطلب:</span>
              <span className="text-xs font-extrabold text-slate-900 block">{customerName}</span>
            </div>
            <div className="text-left">
              <span className="text-lg font-black text-emerald-700">{amount} ر.س</span>
              <span className="text-[10px] text-emerald-600 font-bold block">شامل الضريبة</span>
            </div>
          </div>

          {step === 'form' && (
            <div className="space-y-4">
              
              {/* Apple Pay View */}
              {paymentMethod === 'apple_pay' ? (
                <div className="space-y-4 py-2 text-center">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">جاهز للدفع بواسطة Apple Pay</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      انقر على الزر أدناه لتأكيد الدفع المباشر عبر Face ID أو Touch ID
                    </p>
                  </div>

                  {/* Card simulator preview */}
                  <div className="bg-slate-900 text-white p-3.5 rounded-2xl text-right text-xs space-y-1 shadow-md">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>بطاقة Apple Pay المربوطة</span>
                      <span className="font-bold text-white">mada •••• 8820</span>
                    </div>
                    <p className="text-[10px] text-slate-400">سيتم الخصم الفوري والمستند بالخصم</p>
                  </div>

                  <button
                    onClick={handlePay}
                    className="w-full py-3.5 px-4 rounded-2xl bg-black text-white hover:bg-slate-800 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <span> Pay</span>
                    <span>-</span>
                    <span>تأكيد الخصم ({amount} ر.س)</span>
                  </button>
                </div>
              ) : (
                /* Card Input Form for Mada & Visa/Mastercard */
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>رقم البطاقة</span>
                      <span className="text-[10px] text-emerald-700 font-extrabold">
                        {paymentMethod === 'mada' ? 'مدى Mada' : 'Visa / Mastercard'}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111 0000 0000 0000"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">اسم حامل البطاقة</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="اسم صاحب البطاقة كما هو مدون"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">تاريخ الانتهاء</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">رمز الأمان (CVV)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePay}
                    className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>إتمام عملية الدفع الآمن ({amount} ر.س)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">جاري التواصل مع بوابة الدفع...</h4>
                <p className="text-xs text-slate-500 mt-1">يرجى الانتظار لحين معالجة وتأكيد العملية إلكترونياً</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <div>
                <h4 className="font-black text-base text-emerald-800">تمت عملية الدفع إلكترونياً بنجاح!</h4>
                <p className="text-xs text-slate-600 mt-1">تم توثيق العملية وتأكيد الطلب</p>
              </div>
            </div>
          )}

          {/* Footer SSL Note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>معتمد ومحمي بشهادة تشفير عالية الأمان</span>
            </span>
            <span className="font-bold text-slate-500">{gatewayBrand}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
