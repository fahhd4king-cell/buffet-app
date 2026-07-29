import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ChevronLeft, Sparkles, Utensils } from 'lucide-react';
import { StaffLoginModal } from './StaffLoginModal';
import { CategoryId } from '../types';

export const WelcomeScreen: React.FC = () => {
  const { setRole, setSelectedCategory, buffetStatus } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOrderNow = (category?: CategoryId | 'all') => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory('all');
    }
    setRole('customer');
  };

  const handleSuccessLogin = (role: 'admin' | 'employee') => {
    setRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden font-['Tajawal',sans-serif] pb-3">
      {/* Subtle Background Lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. Header (Reduced height by 50% - compact py-2.5 px-3.5) */}
      <header className="relative z-10 max-w-3xl mx-auto w-full px-3.5 py-2 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20 shrink-0">
            ف
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none">
              بوفيه <span className="text-emerald-400">فادي</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              مشروبات ووجبات سريعة
            </p>
          </div>
        </div>

        {/* Live Buffet Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border backdrop-blur-md shadow-sm ${
            buffetStatus.isOpen
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${buffetStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
          <span>{buffetStatus.isOpen ? '🟢 مفتوح الآن' : '🔴 مغلق حالياً'}</span>
        </div>
      </header>

      {/* Main Content Area - Ultra Compact, zero scroll required */}
      <main className="relative z-10 max-w-3xl mx-auto w-full px-3.5 py-2.5 space-y-2.5 my-auto">
        
        {/* Status Bar Banner (Responsive and well-spaced when closed) */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-md transition-all h-auto w-full ${
          buffetStatus.isOpen
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/90 border-rose-500/50 text-rose-100'
        }`}>
          {buffetStatus.isOpen ? (
            <div className="flex items-center justify-center gap-2 text-xs font-black">
              <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400 animate-ping" />
              <span className="leading-snug">🟢 البوفيه مفتوح الآن لاستقبال الطلبات.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 min-w-0 w-full">
              <div className="flex items-start gap-2.5 min-w-0 w-full">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-rose-400 mt-1 animate-pulse" />
                <p className="text-xs sm:text-sm font-black text-rose-100 leading-relaxed break-words flex-1 min-w-0">
                  🔴 البوفيه مغلق حالياً، نعتذر عن استقبال الطلبات.
                </p>
              </div>

              {(buffetStatus.closureReason || buffetStatus.reopenTime) && (
                <div className="pt-2 border-t border-rose-800/80 flex flex-col gap-1.5 text-[11px] sm:text-xs">
                  {buffetStatus.closureReason && (
                    <div className="flex flex-col gap-0.5 leading-relaxed">
                      <span className="text-rose-300 font-bold shrink-0">السبب:</span>
                      <span className="text-white font-medium break-words px-1">{buffetStatus.closureReason}</span>
                    </div>
                  )}
                  {buffetStatus.reopenTime && (
                    <div className="flex flex-col gap-0.5 leading-relaxed">
                      <span className="text-rose-300 font-bold shrink-0">وقت العودة المتوقع:</span>
                      <span className="text-amber-300 font-bold underline break-words px-1">{buffetStatus.reopenTime}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Badge placed below the message */}
              <div className="flex items-center justify-between pt-2 border-t border-rose-800/80 w-full gap-2">
                <span className="text-[10px] text-rose-300 font-bold">الحالة</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/90 text-rose-100 text-[11px] font-black border border-rose-700/80 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                  <span>مغلق</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Short Welcome Greeting Card with Prominent Order Button - No Image */}
        <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 shadow-xl space-y-3">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>خدمة سريعة بدون انتظار</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              مرحبًا بك في <span className="text-emerald-400">بوفيه فادي</span>
            </h2>
            <p className="text-slate-300 text-xs font-medium mt-1">
              اطلب مشروباتك ووجباتك السريعة واستلمها فورًا
            </p>
          </div>

          {/* Primary Action Button: "اطلب الآن" */}
          <button
            onClick={() => handleOrderNow('all')}
            className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-950/50 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Utensils className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
            <span>اطلب الآن</span>
            <ChevronLeft className="w-5 h-5 opacity-80" />
          </button>
        </div>

        {/* Menu Quick Categories Grid (Directly below order button) */}
        <div className="space-y-1">
          <div className="px-1">
            <span className="text-xs font-black text-slate-300">أقسام المنيو</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleOrderNow('hot-drinks')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-right transition-all flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 font-bold text-base">
                🫖
              </div>
              <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400">مشروبات ساخنة</span>
            </button>

            <button
              onClick={() => handleOrderNow('sandwiches')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-right transition-all flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-base">
                🌯
              </div>
              <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400">ساندوتشات</span>
            </button>

            <button
              onClick={() => handleOrderNow('cold-drinks')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-right transition-all flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 font-bold text-base">
                🍟
              </div>
              <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400">بطاطس</span>
            </button>

            <button
              onClick={() => handleOrderNow('fresh-juices')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-right transition-all flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0 font-bold text-base">
                🧃
              </div>
              <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400">عصائر طازجة</span>
            </button>
          </div>
        </div>

      </main>

      {/* Footer Area: Very small discreet button for Staff/Admin login at the bottom */}
      <footer className="relative z-10 max-w-3xl mx-auto w-full px-3.5 pt-1 text-center space-y-1">
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3 h-3 text-slate-400" />
          <span>دخول الموظفين والإدارة</span>
        </button>

        <p className="text-[9px] text-slate-500">
          بوفيه فادي © {new Date().getFullYear()} • طلبات سريعة بدون انتظار
        </p>
      </footer>

      {/* Staff Login Modal */}
      <StaffLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
      />
    </div>
  );
};
