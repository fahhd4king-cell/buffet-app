import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4 animate-slide-down pointer-events-auto">
      <div className="bg-[#111827] border border-[#18D26E]/40 text-[#FFFFFF] px-4 py-3 rounded-[16px] shadow-2xl flex items-center justify-between gap-3 shadow-[#18D26E]/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#18D26E]/15 border border-[#18D26E]/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#18D26E]" />
          </div>
          <span className="text-xs font-['Tajawal'] font-bold text-[#FFFFFF]">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#A8B3C7] hover:text-[#FFFFFF] rounded-full hover:bg-[#1E293D] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
