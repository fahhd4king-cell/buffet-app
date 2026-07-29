import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  id,
}) => {
  return (
    <div id={id} className="flex flex-col items-center justify-center p-8 text-center bg-[#111827] border border-[#F5B31B]/20 rounded-[20px] my-4 shadow-xl">
      <div className="w-14 h-14 rounded-[18px] bg-[#070B1A] border border-[#F5B31B]/30 flex items-center justify-center text-[#F5B31B] mb-3 shadow-inner gold-glow">
        <Icon className="w-7 h-7 text-[#F5B31B]" />
      </div>
      <h3 className="text-base font-['Tajawal'] font-bold text-[#FFFFFF] mb-1">{title}</h3>
      <p className="text-xs text-[#A8B3C7] max-w-xs mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2.5 bg-gradient-to-r from-[#F5B31B] to-[#FFD66B] hover:opacity-95 active:scale-95 text-[#070B1A] font-['Tajawal'] font-extrabold text-xs rounded-[14px] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
