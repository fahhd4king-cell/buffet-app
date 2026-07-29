import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد الحذف',
  description = 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذه العملية.',
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      id="confirm-delete-backdrop"
      className="fixed inset-0 z-50 bg-[#070B1A]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="confirm-delete-dialog"
        className="bg-[#111827] border border-[#F5B31B]/30 w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl p-5 space-y-4 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1E293D] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F44336]/15 border border-[#F44336]/30 flex items-center justify-center text-[#F44336]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-['Tajawal'] font-bold text-[#FFFFFF]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A8B3C7] hover:text-[#FFFFFF] rounded-full hover:bg-[#1E293D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Body */}
        <p className="text-xs font-['Tajawal'] text-[#A8B3C7] leading-relaxed px-1">
          {description}
        </p>

        {/* Buttons Action */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            id="btn-confirm-delete-cancel"
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#1E293D] hover:bg-[#334155] text-[#A8B3C7] hover:text-[#FFFFFF] font-['Tajawal'] font-bold text-xs rounded-[14px] transition-all cursor-pointer"
          >
            إلغاء
          </button>
          <button
            id="btn-confirm-delete-action"
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-[#F44336] hover:bg-rose-600 active:scale-95 text-[#FFFFFF] font-['Tajawal'] font-black text-xs rounded-[14px] shadow-lg shadow-[#F44336]/20 transition-all cursor-pointer"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};
