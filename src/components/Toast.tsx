import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

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
    success: 'bg-emerald-900/90 text-emerald-50 border-emerald-700/50',
    info: 'bg-slate-900/90 text-slate-50 border-slate-700/50',
    warning: 'bg-amber-900/90 text-amber-50 border-amber-700/50',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <p className="text-sm font-medium leading-relaxed flex-1">{toast.message}</p>
        <button
          onClick={clearToast}
          className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
