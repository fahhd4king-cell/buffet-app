import React, { useState } from 'react';
import { Ban, X, ShieldAlert, AlertTriangle } from 'lucide-react';

interface BlockModalProps {
  isOpen: boolean;
  customerName?: string;
  sessionId: string;
  onClose: () => void;
  onConfirmBlock: (reason: string) => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  customerName,
  sessionId,
  onClose,
  onConfirmBlock,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('تكرار إلغاء الطلبات بعد التحضير');
  const [customReason, setCustomReason] = useState<string>('');

  if (!isOpen) return null;

  const presets = [
    'تكرار إلغاء الطلبات بعد التحضير',
    'عدم الاستلام والحضور (No-Show)',
    'إزعاج ومشاغبة مع الموظفين',
    'طلبات وهمية مكررة',
    'أخرى (حدد في الخانة أدناه)',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedPreset === 'أخرى (حدد في الخانة أدناه)'
      ? (customReason.trim() || 'سبب غير محدد')
      : selectedPreset;

    onConfirmBlock(finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl relative text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <Ban className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-extrabold text-slate-100">حظر جهاز الزبون</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Target Info Box */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
            <p className="text-slate-300 font-bold">العميل: <span className="text-amber-400">{customerName || 'عميل مباشر'}</span></p>
            <p className="text-slate-500 font-mono text-[10px]">معرّف الجلسة: #{sessionId.slice(-8)}</p>
          </div>

          <p className="text-xs text-slate-400">اختر سبب حظر الجهاز لمنعه من إرسال أية طلبات مستقبلية:</p>

          {/* Preset options */}
          <div className="space-y-1.5">
            {presets.map(preset => (
              <label
                key={preset}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedPreset === preset
                    ? 'bg-rose-500/15 border-rose-500/60 text-rose-300 font-bold'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{preset}</span>
                <input
                  type="radio"
                  name="blockPreset"
                  checked={selectedPreset === preset}
                  onChange={() => setSelectedPreset(preset)}
                  className="accent-rose-500"
                />
              </label>
            ))}
          </div>

          {/* Custom Reason Field */}
          {selectedPreset === 'أخرى (حدد في الخانة أدناه)' && (
            <div>
              <input
                type="text"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="أدخل السبب المخصص هنا..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>تأكيد حظر الجهاز</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
