import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, KeyRound, ChevronLeft, AlertCircle, Sparkles } from 'lucide-react';
import { BuffetSettings } from '../types';

interface LandingViewProps {
  settings: BuffetSettings;
  onCustomerStart: () => void;
  onStaffLogin: (pin: string) => boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  settings,
  onCustomerStart,
  onStaffLogin,
}) => {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErrorMessage, setPinErrorMessage] = useState<string | null>(null);

  const isOpen = settings.isOpen !== false;

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setPinErrorMessage('يرجى إدخال رمز الدخول');
      return;
    }
    const success = onStaffLogin(pin.trim());
    if (success) {
      setIsStaffModalOpen(false);
      setPin('');
      setPinErrorMessage(null);
    } else {
      setPinErrorMessage('رمز المرور غير صحيح!');
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-between p-6 max-w-md mx-auto text-[#FFFFFF] font-['Cairo',sans-serif] animate-fadeIn relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#F5B31B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding Section */}
      <div className="text-center pt-6 space-y-4.5 relative z-10">
        {/* Golden 'F' Emblem inside rounded square box with glow */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[22px] bg-gradient-to-br from-[#111827] via-[#070B1A] to-[#111827] border-2 border-[#F5B31B]/40 flex items-center justify-center mx-auto shadow-2xl gold-glow transition-all">
            <span className="font-['Tajawal'] font-black text-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#F5B31B] to-[#D4930A] drop-shadow-md">
              F
            </span>
          </div>
          <span className={`absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-full border-2 border-[#070B1A] flex items-center justify-center ${isOpen ? 'bg-[#18D26E]' : 'bg-[#F44336]'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-white animate-ping' : 'bg-white'}`} />
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-black text-[#FFFFFF] font-['Tajawal'] tracking-tight">
            {settings.buffetName || 'بوفيه'}
          </h1>
          <p className="text-sm text-[#F5B31B] font-bold mt-1.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#F5B31B]" />
            <span>{settings.welcomeMessage || 'تجربة طلب فاخرة، سريعة وأنيقة.'}</span>
          </p>
        </div>

        {/* Realtime Status Indicator */}
        <div className="inline-flex items-center gap-2 bg-[#111827] border border-[#F5B31B]/20 px-4.5 py-2 rounded-full text-xs font-bold shadow-lg">
          <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-[#18D26E] animate-pulse' : 'bg-[#F44336]'}`} />
          <span className={isOpen ? 'text-[#18D26E]' : 'text-[#F44336]'}>
            {isOpen ? 'البوفيه مفتوح لاستقبال الطلبات' : 'البوفيه مغلق حالياً'}
          </span>
        </div>
      </div>

      {/* Central Single Action: "اطلب الآن" */}
      <div className="my-auto py-6 space-y-4 relative z-10">
        <div className="bg-[#111827] border border-[#F5B31B]/30 rounded-[24px] p-6 shadow-2xl relative overflow-hidden group hover:border-[#F5B31B]/50 transition-all">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F5B31B]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10 text-center">
            <h2 className="text-sm font-bold text-[#A8B3C7]">
              اختر مأكولاتك ومشروباتك المفضلّة واطلب بكل سهولة
            </h2>

            {/* Prominent Button: "اطلب الآن" */}
            <button
              id="btn-customer-order-now-landing"
              onClick={onCustomerStart}
              className="w-full py-4 bg-gradient-to-r from-[#F5B31B] via-[#FFD66B] to-[#F5B31B] hover:opacity-95 active:scale-[0.98] text-[#070B1A] font-['Tajawal'] font-black text-lg rounded-[20px] shadow-xl shadow-[#F5B31B]/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-[#070B1A]" />
              <span>اطلب الآن</span>
              <ChevronLeft className="w-5 h-5 text-[#070B1A] group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Login Link: "تسجيل دخول الإدارة والموظفين" */}
      <div className="pb-4 space-y-3 text-center border-t border-[#111827] pt-5 relative z-10">
        <button
          id="btn-staff-login-landing"
          onClick={() => setIsStaffModalOpen(true)}
          className="w-full py-3.5 bg-[#111827] hover:bg-[#1E293D] border border-[#F5B31B]/20 hover:border-[#F5B31B]/40 active:scale-[0.98] text-[#A8B3C7] hover:text-[#FFFFFF] font-bold text-xs rounded-[18px] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <ShieldCheck className="w-4.5 h-4.5 text-[#F5B31B]" />
          <span>تسجيل دخول الإدارة والموظفين</span>
        </button>
      </div>

      {/* Staff Login PIN Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B1A]/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#111827] border border-[#F5B31B]/30 rounded-[24px] w-full max-w-xs p-6 space-y-4 shadow-2xl relative text-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293D]">
              <div className="flex items-center gap-2 text-[#F5B31B]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm font-['Tajawal'] font-bold text-[#FFFFFF]">دخول الإدارة والموظفين</h3>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="text-[#A8B3C7] hover:text-[#FFFFFF] text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <p className="text-xs text-[#A8B3C7]">
                أدخل رمز PIN للمتابعة إلى النظام
              </p>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#A8B3C7] absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (pinErrorMessage) setPinErrorMessage(null);
                  }}
                  placeholder="أدخل رمز الدخول"
                  className="w-full bg-[#070B1A] border border-[#F5B31B]/30 rounded-[18px] pr-10 pl-3 py-3 text-[#FFFFFF] font-mono text-center tracking-widest text-base focus:outline-none focus:border-[#F5B31B]"
                  autoFocus
                />
              </div>

              {pinErrorMessage && (
                <div className="flex items-center gap-1.5 text-[#F44336] text-[11px] font-bold bg-[#F44336]/10 p-2.5 rounded-xl border border-[#F44336]/20 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinErrorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#F5B31B] to-[#FFD66B] hover:opacity-90 text-[#070B1A] font-['Tajawal'] font-black text-sm rounded-[18px] shadow-lg transition-all cursor-pointer"
              >
                تأكيد الدخول
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

