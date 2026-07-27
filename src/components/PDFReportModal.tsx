import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, Download, Building, DollarSign, ShoppingBag, Award } from 'lucide-react';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({ isOpen, onClose }) => {
  const { orders, menuItems, activeBranch } = useApp();

  if (!isOpen) return null;

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(1) : '0';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header Controls (Hidden on Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">تقرير المبيعات الشامل (جاهز للطباعة / PDF)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:text-black">
          
          {/* Company Branding */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">بوفيه Buffet - تقرير أداء المبيعات</h1>
              <p className="text-xs text-slate-500 mt-1">الفرع: {activeBranch}</p>
              <p className="text-xs text-slate-500">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA')}</p>
            </div>
            <div className="text-left font-black text-3xl text-amber-600">
              ☕ BUFFET
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-bold">إجمالي دخل المبيعات</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalRevenue} ر.س</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-bold">عدد الطلبات المنفذة</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalOrders} طلبات</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-bold">متوسط قيمة الطلب</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{avgOrderValue} ر.س</span>
            </div>
          </div>

          {/* Detailed Orders Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900">تفاصيل الطلبات الأخيرة</h4>
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                  <th className="p-2.5 font-bold">رقم الطلب</th>
                  <th className="p-2.5 font-bold">اسم العميل</th>
                  <th className="p-2.5 font-bold">المكتب</th>
                  <th className="p-2.5 font-bold">طريقة الدفع</th>
                  <th className="p-2.5 font-bold">الحالة</th>
                  <th className="p-2.5 font-bold">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{o.id}</td>
                    <td className="p-2.5 text-slate-800">{o.customerName}</td>
                    <td className="p-2.5 text-slate-600">{o.customerOffice}</td>
                    <td className="p-2.5 text-slate-600">
                      {o.paymentMethod === 'card' ? '💳 بطاقة مدى' : '💵 كاش'}
                    </td>
                    <td className="p-2.5 font-bold text-slate-700">
                      {o.status === 'delivered' ? 'مكتمل ✅' : 'قيد التحضير ⏳'}
                    </td>
                    <td className="p-2.5 font-extrabold text-amber-800">{o.totalPrice} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Signature Block */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>توقيع مشرف البوفيه: ................................</div>
            <div>اعتماد صاحب المشروع: ................................</div>
          </div>

        </div>

      </div>
    </div>
  );
};
