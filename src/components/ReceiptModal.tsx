import React from 'react';
import { X, Printer, CheckCircle, Coffee } from 'lucide-react';
import { Order, BuffetSettings } from '../types';

interface ReceiptModalProps {
  order: Order | null;
  settings: BuffetSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, settings, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="receipt-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="receipt-modal-card"
        className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3.5 bg-slate-800 border-b border-slate-700/80">
          <span className="text-xs font-bold text-slate-200">فاتورة الطلب #{order.orderNumber}</span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Content */}
        <div id="printable-receipt" className="p-5 overflow-y-auto space-y-4 bg-slate-950 text-slate-100 text-xs font-sans">
          {/* Logo & Header */}
          <div className="text-center border-b border-dashed border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-2">
              <Coffee className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-100">{settings.buffetName || 'البوفيه'}</h2>
            {settings.phone && <p className="text-[11px] text-slate-400 mt-0.5">{settings.phone}</p>}
            {settings.address && <p className="text-[11px] text-slate-500">{settings.address}</p>}
          </div>

          {/* Order Metadata */}
          <div className="space-y-1 text-[11px] text-slate-300 border-b border-dashed border-slate-800 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-400">رقم الطلب:</span>
              <span className="font-extrabold text-amber-400">#{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">اسم العميل:</span>
              <span className="font-bold">{order.customerName}</span>
            </div>
            {order.destinationDetails && (
              <div className="flex justify-between">
                <span className="text-slate-400">المكان/المكتب:</span>
                <span>{order.destinationDetails}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">نوع الطلب:</span>
              <span>{order.orderType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">التاريخ:</span>
              <span>{new Date(order.createdAt).toLocaleString('ar-SA')}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 border-b border-dashed border-slate-800 pb-4">
            <div className="text-[11px] font-bold text-slate-400 grid grid-cols-6 gap-1 border-b border-slate-800 pb-1">
              <span className="col-span-3">الصنف</span>
              <span className="text-center">العدد</span>
              <span className="col-span-2 text-left">الإجمالي</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-1 text-[11px] text-slate-200 items-start">
                <div className="col-span-3">
                  <div className="font-bold">{item.productName}</div>
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div className="text-[10px] text-amber-400/90">
                      + {item.selectedAddons.map(a => a.name).join(', ')}
                    </div>
                  )}
                  {item.notes && <div className="text-[9px] text-slate-400 italic">{item.notes}</div>}
                </div>
                <div className="text-center font-bold text-amber-400">{item.quantity}</div>
                <div className="col-span-2 text-left font-extrabold">
                  {item.itemTotal} {settings.currency}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Summary */}
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">المجموع الفرعي:</span>
              <span>
                {order.subtotal} {settings.currency}
              </span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">الضريبة:</span>
                <span>
                  {order.tax} {settings.currency}
                </span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm text-amber-400 pt-1.5 border-t border-slate-800">
              <span>الإجمالي النهائي:</span>
              <span>
                {order.total} {settings.currency}
              </span>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>طريقة الدفع: {order.paymentMethod}</span>
            </div>
            <span className="font-bold text-emerald-400">{order.paymentStatus}</span>
          </div>

          {/* Footer Note */}
          {settings.welcomeMessage && (
            <p className="text-[10px] text-center text-slate-400 pt-2 border-t border-slate-800/80">
              {settings.welcomeMessage}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="p-3 bg-slate-800 border-t border-slate-700/80 flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الفاتورة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
