import React, { useState } from 'react';
import { X, Power, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface CloseBuffetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClose: (reason: string, reopenTime: string) => void;
  currentReason?: string;
  currentReopenTime?: string;
}

const PRESET_REASONS = [
  'استراحة قصيرة',
  'أداء الصلاة',
  'تجهيز وتجديد الأصناف',
  'نفاد المواد والمنتجات',
  'صيانة وتنظيف البوفيه',
  'انتهاء دوام اليوم',
];

const PRESET_TIMES = [
  'بعد 15 دقيقة',
  'بعد 30 دقيقة',
  'الساعة 4:00 عصراً',
  'الساعة 6:00 مساءً',
  'الساعة 8:30 مساءً',
  'صباح الغد',
];

export const CloseBuffetModal: React.FC<CloseBuffetModalProps> = ({
  isOpen,
  onClose,
  onConfirmClose,
  currentReason = '',
  currentReopenTime = '',
}) => {
  const [reason, setReason] = useState<string>(currentReason || 'استراحة قصيرة');
  const [reopenTime, setReopenTime] = useState<string>(currentReopenTime || 'بعد 30 دقيقة');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmClose(reason.trim() || 'إغلاق مؤقت', reopenTime.trim() || 'قريباً');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Power className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">تفاصيل إغلاق البوفيه</h3>
              <p className="text-[11px] text-slate-400">حدد سبب الإغلاق ووقت إعادة الفتح للعملاء</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Reason Section */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>سبب الإغلاق</span>
            </label>
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] border font-bold transition-all ${
                    reason === r
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {/* Custom Input */}
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="أو اكتب سبباً مخصصاً..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500 text-xs"
              required
            />
          </div>

          {/* Reopen Time Section */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>موعد إعادة الفتح المتوقع</span>
            </label>
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setReopenTime(t)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] border font-bold transition-all ${
                    reopenTime === t
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {/* Custom Input */}
            <input
              type="text"
              value={reopenTime}
              onChange={(e) => setReopenTime(e.target.value)}
              placeholder="مثال: الساعة 4:30 عصراً..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500 text-xs"
              required
            />
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              معاينة رسالة الإغلاق الشفافة للعملاء:
            </span>
            <div className="text-[11px] text-slate-200 bg-rose-950/30 border border-rose-500/20 p-2 rounded-xl">
              <p className="font-extrabold text-rose-400">البوفيه مغلق حالياً</p>
              <p className="text-slate-300 mt-0.5">السبب: <span className="text-amber-300 font-bold">{reason || 'غير محدد'}</span></p>
              <p className="text-slate-300">نستقبل طلباتكم مجدداً: <span className="text-emerald-400 font-bold">{reopenTime || 'قريباً'}</span></p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Power className="w-4 h-4" />
              <span>تأكيد الإغلاق وبث الحالة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
