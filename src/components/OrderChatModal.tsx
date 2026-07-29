import React, { useState } from 'react';
import { Order } from '../types';
import { useApp } from '../context/AppContext';
import { X, Send, Coffee, CheckCheck, Clock } from 'lucide-react';

interface OrderChatModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: 'customer' | 'staff';
}

export const OrderChatModal: React.FC<OrderChatModalProps> = ({
  order,
  isOpen,
  onClose,
  currentUserRole,
}) => {
  const { addChatMessage } = useApp();
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    addChatMessage(order.id, inputText.trim(), currentUserRole);
    setInputText('');
  };

  const quickReplies = currentUserRole === 'customer'
    ? ['لو سمحت كثر الثلج', 'كم المتبقي على تحضير الطلب؟', 'الرجاء الطرق خفيفاً على الباب', 'شكراً جزيلاً!']
    : ['أبشر جاري التحضير الآن 👍', 'الطلب جاهز وفي الطريق إليك 🚀', 'يرجى تأكيد الحجم المطلوبة', 'تكرم أستاذنا'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full h-[550px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-lg">
              💬
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>محادثة الطلب {order.id}</span>
                <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-md">
                  {currentUserRole === 'customer' ? 'موظف البوفيه' : order.customerName}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                تواصل مباشر من داخل التطبيق بدون الحاجة لرقم جوال
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-amber-50/80 px-4 py-2 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900 shrink-0">
          <div className="truncate font-medium">
            <span className="font-bold">المحتوى:</span> {order.items.map((i) => `${i.quantity}x ${i.name}`).join('، ')}
          </div>
          <span className="font-extrabold text-amber-800 shrink-0 mr-2">{order.totalPrice} ر.س</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {order.chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <Coffee className="w-10 h-10 mb-2 opacity-40 text-amber-600" />
              <p className="text-xs font-bold text-slate-600">لا توجد رسائل سابقة لهذا الطلب</p>
              <p className="text-[11px] text-slate-400 mt-1">
                يمكنك كتابة ملاحظة أو استفسار لموظف البوفيه وسيرد عليك فوراً
              </p>
            </div>
          ) : (
            order.chatMessages.map((msg) => {
              const isMine = msg.sender === currentUserRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                      isMine
                        ? 'bg-amber-600 text-white rounded-tl-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tr-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                        isMine ? 'text-amber-200' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMine && <CheckCheck className="w-3 h-3 text-amber-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Replies chips */}
        <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
          {quickReplies.map((qr) => (
            <button
              key={qr}
              onClick={() => {
                addChatMessage(order.id, qr, currentUserRole);
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 whitespace-nowrap transition-colors"
            >
              + {qr}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-slate-50"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-600/20 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
