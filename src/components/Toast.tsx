import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast, clearToast } = useApp();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  const bgColors = {
    success: 'bg-[#111827] border-[#18D26E]/40 text-white shadow-[#18D26E]/10',
    info: 'bg-slate-900/90 border-slate-700/50 text-slate-50',
    warning: 'bg-amber-950/90 border-amber-700/50 text-amber-50',
  };

  const icons = {
    success: (
      <div className="w-7 h-7 rounded-full bg-[#18D26E]/15 border border-[#18D26E]/30 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-[#18D26E]" />
      </div>
    ),
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4 animate-slide-down pointer-events-auto">
      <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[16px] shadow-2xl backdrop-blur-md border ${bgColors[toast.type || 'success']}`}>
        <div className="flex items-center gap-2.5 flex-1">
          {icons[toast.type || 'success']}
          <span className="text-xs font-['Tajawal'] font-bold text-white leading-relaxed">
            {toast.message}
          </span>
        </div>
        <button
          onClick={clearToast}
          className="p-1 text-[#A8B3C7] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};