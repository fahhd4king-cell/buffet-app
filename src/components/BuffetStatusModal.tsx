import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Clock, Power, ShieldAlert, CheckCircle2, AlertTriangle, CalendarCheck } from 'lucide-react';

interface BuffetStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_REASONS = [
  'انتهى وقت الدوام الرسمي',
  'نفدت جميع الأصناف المتاحة',
  'صيانة وتجهيز دوري للبوفيه',
  'انشغال الطاقم بتحضير طلبات خاصة',
  'مغلق مؤقتاً للاستراحة'
];

const PRESET_TIMES = [
  '6:00 صباحاً (بداية الدوام)',
  '8:00 صباح الغد',
  'بعد 30 دقيقة',
  'الساعة 1:00 ظهراً',
  'الساعة 4:00 عصراً'
];

export const BuffetStatusModal: React.FC<BuffetStatusModalProps> = ({ isOpen, onClose }) => {
  const { buffetStatus, setBuffetIsOpen, updateBuffetSchedule } = useApp();

  const [reason, setReason] = useState(buffetStatus.closureReason || PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [time, setTime] = useState(buffetStatus.reopenTime || PRESET_TIMES[0]);
  const [customTime, setCustomTime] = useState('');

  // Auto Schedule Local State
  const [autoSchedule, setAutoSchedule] = useState(buffetStatus.autoScheduleEnabled);
  const [openHour, setOpenHour] = useState(buffetStatus.workingHours.openHour || '06:00');
  const [closeHour, setCloseHour] = useState(buffetStatus.workingHours.closeHour || '23:59');

  if (!isOpen) return null;

  const handleToggleStatus = (targetOpen: boolean) => {
    const finalReason = customReason.trim() || reason;
    const finalTime = customTime.trim() || time;
    setBuffetIsOpen(targetOpen, finalReason, finalTime);
    onClose();
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    updateBuffetSchedule(autoSchedule, openHour, closeHour);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col dir-rtl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${
              buffetStatus.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">نظام فتح وإغلاق البوفيه</h3>
              <p className="text-xs text-slate-500">التحكم المباشر في استقبال وإيقاف الطلبات للعملاء</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">

          {/* Current Status Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 h-auto w-full ${
            buffetStatus.isOpen 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-start gap-3 min-w-0 w-full">
              <span className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1 ${buffetStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs sm:text-sm font-black leading-relaxed break-words">
                  الحالة الحالية: {buffetStatus.isOpen ? '🟢 مفتوح الآن للطلبات' : '🔴 مغلق حالياً'}
                </p>
                {!buffetStatus.isOpen && (
                  <div className="text-[11px] sm:text-xs text-rose-800 mt-1 space-y-1 pt-1.5 border-t border-rose-200/80">
                    {buffetStatus.closureReason && (
                      <p className="break-words leading-relaxed"><strong className="text-rose-950 font-bold">السبب:</strong> {buffetStatus.closureReason}</p>
                    )}
                    {buffetStatus.reopenTime && (
                      <p className="break-words leading-relaxed"><strong className="text-rose-950 font-bold">العودة المتوقعة:</strong> <span className="font-bold text-amber-800">{buffetStatus.reopenTime}</span></p>
                    )}
                  </div>
                )}
                {buffetStatus.isOpen && (
                  <p className="text-[11px] sm:text-xs text-emerald-700 mt-0.5 leading-relaxed">
                    يمكن للعملاء إضافة المنتجات وإرسال الطلبات مباشرة
                  </p>
                )}
              </div>
            </div>

            {/* Quick Toggle Action Button at the bottom */}
            <div className="pt-2 border-t border-slate-200/60 flex justify-end w-full">
              {buffetStatus.isOpen ? (
                <button
                  onClick={() => handleToggleStatus(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Power className="w-4 h-4" />
                  <span>إغلاق البوفيه الآن</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleStatus(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>فتح البوفيه الآن</span>
                </button>
              )}
            </div>
          </div>

          {/* If closing or modifying closure settings */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>إعدادات وتفاصيل الإغلاق المباشر</span>
            </h4>

            {/* Reason Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">سبب الإغلاق (يظهر للعميل):</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {PRESET_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setReason(r);
                      setCustomReason('');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-right transition-all ${
                      reason === r && !customReason
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="أو اكتب سبباً مخصصاً للإغلاق..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Reopen Time Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>وقت العودة المتوقع (يعرض للعملاء):</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {PRESET_TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTime(t);
                      setCustomTime('');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-right transition-all ${
                      time === t && !customTime
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="أو حدد موعداً مخصصاً (مثال: الساعة 6:00 صباحاً)..."
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Closure Button */}
            {buffetStatus.isOpen && (
              <button
                onClick={() => handleToggleStatus(false)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>تأكيد إغلاق البوفيه بالسبب والموعد المحددين</span>
              </button>
            )}
          </div>

          {/* Automatic Working Hours Schedule Section */}
          <form onSubmit={handleSaveSchedule} className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold">الجدولة التلقائية لساعات العمل</h4>
                  <p className="text-[11px] text-slate-400">الفتح والإغلاق التلقائي بالتوقيت المحدد</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSchedule}
                  onChange={(e) => setAutoSchedule(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full dir-ltr peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {autoSchedule && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">وقت الفتح التلقائي:</label>
                  <input
                    type="time"
                    value={openHour}
                    onChange={(e) => setOpenHour(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">وقت الإغلاق التلقائي:</label>
                  <input
                    type="time"
                    value={closeHour}
                    onChange={(e) => setCloseHour(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              حفظ إعدادات الجدولة التلقائية
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
