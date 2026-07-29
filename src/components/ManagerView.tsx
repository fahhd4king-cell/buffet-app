import React, { useState } from 'react';
import {
  BarChart3,
  Package,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Download,
  Upload,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Award,
  DollarSign,
  Phone,
  Building,
  CreditCard,
  AlertTriangle,
  Power,
  CheckCircle2,
  XCircle,
  Radio,
  Ban,
  ShieldAlert,
  ShieldCheck,
  Search,
  KeyRound,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { AppData, Category, Product, Staff, BuffetSettings, BlockedCustomer } from '../types';
import { getUserMode } from '../services/session';
import { settingsService } from '../services/settingsService';
import { CategoryFormModal, ProductFormModal } from './ProductFormModal';
import { StaffFormModal } from './StaffFormModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Toast } from './Toast';

interface ManagerViewProps {
  data: AppData;
  onAddCategory: (category: { name: string; icon?: string }) => void;
  onDeleteCategory: (id: string) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onAddStaff: (staff: Omit<Staff, 'id' | 'createdAt'>) => void;
  onDeleteStaff: (id: string) => void;
  onUpdateSettings: (settings: Partial<BuffetSettings>) => void;
  onToggleStatus: (newStatus: boolean) => void;
  onBlockCustomer: (sessionId: string, reason: string, customerName?: string, customerPhone?: string) => void;
  onUnblockCustomer: (sessionId: string) => void;
  onResetAllData: () => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => boolean;
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  data,
  onAddCategory,
  onDeleteCategory,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddStaff,
  onDeleteStaff,
  onUpdateSettings,
  onToggleStatus,
  onBlockCustomer,
  onUnblockCustomer,
  onResetAllData,
  onExportBackup,
  onImportBackup,
}) => {
  const [managerTab, setManagerTab] = useState<'stats' | 'products' | 'staff' | 'blocked' | 'settings' | 'data'>('stats');

  if (getUserMode() !== 'admin') {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-[#111827] border border-[#F44336]/30 rounded-[24px]">
        <ShieldAlert className="w-14 h-14 mx-auto text-[#F44336]" />
        <h3 className="text-lg font-['Tajawal'] font-black text-white">وصول مرفوض (صلاحيات مدير النظام مطلوب)</h3>
        <p className="text-xs text-[#A8B3C7] font-['Tajawal'] leading-relaxed">
          عذراً، هذه الصفحة مخصصة للمدير العام فقط. دورك الحالي كاشير / زبون لا يملك الصلاحية لإدارة المنتجات، الموظفين، أو الإعدادات.
        </p>
      </div>
    );
  }

  const isBuffetOpen = data.settings.isOpen !== false;

  // Manual block form state
  const [manualSessionId, setManualSessionId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualReason, setManualReason] = useState('حظر بقرار الإدارة');
  const [blockedSearchQuery, setBlockedSearchQuery] = useState('');

  // Modals
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Global Delete Confirmation State
  const [deleteItem, setDeleteItem] = useState<{
    type: 'category' | 'product' | 'staff' | 'resetData';
    id?: string;
    name?: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteItem) return;

    if (deleteItem.type === 'category' && deleteItem.id) {
      onDeleteCategory(deleteItem.id);
    } else if (deleteItem.type === 'product' && deleteItem.id) {
      onDeleteProduct(deleteItem.id);
    } else if (deleteItem.type === 'staff' && deleteItem.id) {
      onDeleteStaff(deleteItem.id);
    } else if (deleteItem.type === 'resetData') {
      onResetAllData();
    }

    setDeleteItem(null);
    setToastMessage('تم الحذف بنجاح.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Settings local state
  const [buffetName, setBuffetName] = useState(data.settings.buffetName);
  const [currency, setCurrency] = useState(data.settings.currency);
  const [taxPercentage, setTaxPercentage] = useState(String(data.settings.taxPercentage));
  const [allowDeferred, setAllowDeferred] = useState(data.settings.allowDeferredPayment);
  const [phone, setPhone] = useState(data.settings.phone || '');
  const [address, setAddress] = useState(data.settings.address);
  const [welcomeMsg, setWelcomeMsg] = useState(data.settings.welcomeMessage);
  const [adminPin, setAdminPin] = useState(data.settings.adminPin || '1234');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [phoneValidationError, setPhoneValidationError] = useState('');
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Calculate stats dynamically from REAL orders only
  const validOrders = data.orders.filter(o => o.status !== 'ملغي');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = data.orders.length;
  const newOrdersCount = data.orders.filter(o => o.status === 'جديد').length;
  const uniqueCustomersCount = new Set(data.orders.map(o => o.customerName)).size;

  // Calculate top sold item dynamically
  const productSalesMap: Record<string, { name: string; count: number }> = {};
  validOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSalesMap[item.productName]) {
        productSalesMap[item.productName] = { name: item.productName, count: 0 };
      }
      productSalesMap[item.productName].count += item.quantity;
    });
  });

  const sortedTopItems = Object.values(productSalesMap).sort((a, b) => b.count - a.count);
  const topSoldItemName = sortedTopItems.length > 0 ? sortedTopItems[0].name : 'لا يوجد';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate WhatsApp number before saving
    if (phone.trim() !== '') {
      const val = settingsService.validateWhatsappNumber(phone);
      if (!val.isValid) {
        setPhoneValidationError(val.error || 'رقم الواتساب غير صحيح');
        return;
      }
    }

    setPhoneValidationError('');

    const newSettings: Partial<BuffetSettings> = {
      buffetName,
      currency,
      taxPercentage: parseFloat(taxPercentage) || 0,
      allowDeferredPayment: allowDeferred,
      phone: phone.trim(),
      address,
      welcomeMessage: welcomeMsg,
      adminPin: adminPin.trim() || '1234',
    };

    try {
      // Single Source of Truth update via settingsService
      settingsService.updateStoreSettings(newSettings);
      onUpdateSettings(newSettings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 4000);
    } catch (err: any) {
      setPhoneValidationError(err.message || 'حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportBackup(content);
        if (success) {
          alert('تم استيراد البيانات بنجاح!');
        } else {
          alert('خطأ في صيغة ملف النسخة الاحتياطية.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="view-manager" className="p-4 space-y-4 max-w-md mx-auto pb-28">
      {/* Master Buffet Status Control Card (فتح / إغلاق البوفيه) */}
      <div
        className={`p-4 rounded-2xl border transition-all shadow-md flex items-center justify-between gap-3 ${
          isBuffetOpen
            ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/40'
            : 'bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border-rose-500/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
              isBuffetOpen
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            <Power className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black text-slate-100">مفتاح حالة البوفيه</h2>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  isBuffetOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {isBuffetOpen ? 'مفتوح للطلبات' : 'مغلق ومُتوقف'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              {isBuffetOpen
                ? 'استقبال الطلبات مفتوح ومزامن لحظياً لجميع العملاء'
                : `السبب: ${data.settings.closedReason || 'إغلاق مؤقت'} | العودة: ${data.settings.reopenTime || 'قريباً'}`}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          id="btn-toggle-buffet-manager-card"
          type="button"
          onClick={() => onToggleStatus(!isBuffetOpen)}
          className={`w-14 h-8 rounded-full p-1 transition-all flex items-center shrink-0 border cursor-pointer ${
            isBuffetOpen
              ? 'bg-emerald-500 border-emerald-400 justify-end'
              : 'bg-slate-800 border-slate-700 justify-start'
          }`}
          title={isBuffetOpen ? 'انقر لإغلاق البوفيه' : 'انقر لفتح البوفيه'}
        >
          <div className="w-6 h-6 rounded-full bg-slate-950 shadow-md flex items-center justify-center text-xs font-bold">
            <Power className={`w-3.5 h-3.5 ${isBuffetOpen ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
        </button>
      </div>

      {/* Manager Sub-tabs */}
      <div className="grid grid-cols-6 gap-1 bg-[#121926] p-1.5 rounded-2xl border border-[#F7B500]/20 text-[9px] sm:text-[10px] shadow-lg">
        <button
          onClick={() => setManagerTab('stats')}
          className={`py-2 px-1 rounded-xl font-['Tajawal'] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            managerTab === 'stats' ? 'bg-gradient-to-r from-[#F7B500] to-[#FFD66B] text-[#0B0F17] shadow-md' : 'text-[#A8B3C7] hover:text-[#FFFFFF]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>الإحصائيات</span>
        </button>

        <button
          onClick={() => setManagerTab('products')}
          className={`py-2 px-1 rounded-xl font-['Tajawal'] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            managerTab === 'products' ? 'bg-gradient-to-r from-[#F7B500] to-[#FFD66B] text-[#0B0F17] shadow-md' : 'text-[#A8B3C7] hover:text-[#FFFFFF]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>المنتجات</span>
        </button>

        <button
          onClick={() => setManagerTab('staff')}
          className={`py-2 px-1 rounded-xl font-['Tajawal'] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            managerTab === 'staff' ? 'bg-gradient-to-r from-[#F7B500] to-[#FFD66B] text-[#0B0F17] shadow-md' : 'text-[#A8B3C7] hover:text-[#FFFFFF]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>الموظفون</span>
        </button>

        <button
          onClick={() => setManagerTab('blocked')}
          className={`py-2 px-1 rounded-xl font-['Tajawal'] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            managerTab === 'blocked' ? 'bg-[#F44336] text-[#FFFFFF] shadow-md' : 'text-[#A8B3C7] hover:text-[#FFFFFF]'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>المحظورون</span>
        </button>

        <button
          onClick={() => setManagerTab('settings')}
          className={`py-2 px-1 rounded-xl font-['Tajawal'] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            managerTab === 'settings' ? 'bg-gradient-to-r from-[#F7B500] to-[#FFD66B] text-[#0B0F17] shadow-md' : 'text-[#A8B3C7] hover:text-[#FFFFFF]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>الإعدادات</span>
        </button>

        <button
          onClick={() => setManagerTab('data')}
          className={`py-2 px-1 rounded-xl font-['Tajawal'] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            managerTab === 'data' ? 'bg-gradient-to-r from-[#F7B500] to-[#FFD66B] text-[#0B0F17] shadow-md' : 'text-[#A8B3C7] hover:text-[#FFFFFF]'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>البيانات</span>
        </button>
      </div>

      {/* 1. STATS TAB */}
      {managerTab === 'stats' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="bg-[#121926] border border-[#F7B500]/30 p-4.5 rounded-3xl shadow-xl">
            <h3 className="text-xs font-['Tajawal'] font-bold text-[#A8B3C7] mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#00C853]" />
              <span>إجمالي الإيرادات الفعلية</span>
            </h3>
            <p className="text-3xl font-['Tajawal'] font-black text-[#FFD66B]">
              {totalRevenue.toFixed(2)} <span className="text-xs font-normal text-[#A8B3C7]">{data.settings.currency}</span>
            </p>
            <p className="text-[10px] text-[#A8B3C7] mt-1">يُحسب حصرًا من الطلبات الحقيقية المنشأة</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#121926] border border-[#F7B500]/20 p-3.5 rounded-2xl shadow-md">
              <span className="text-[11px] font-bold text-[#A8B3C7] block mb-1">عدد الطلبات</span>
              <span className="text-xl font-['Tajawal'] font-black text-[#FFD66B]">{totalOrdersCount}</span>
            </div>

            <div className="bg-[#121926] border border-[#F7B500]/20 p-3.5 rounded-2xl shadow-md">
              <span className="text-[11px] font-bold text-[#A8B3C7] block mb-1">الطلبات الجديدة</span>
              <span className="text-xl font-['Tajawal'] font-black text-[#F7B500]">{newOrdersCount}</span>
            </div>

            <div className="bg-[#121926] border border-[#F7B500]/20 p-3.5 rounded-2xl shadow-md">
              <span className="text-[11px] font-bold text-[#A8B3C7] block mb-1">عدد العملاء</span>
              <span className="text-xl font-['Tajawal'] font-black text-[#FFFFFF]">{uniqueCustomersCount}</span>
            </div>

            <div className="bg-[#121926] border border-[#F7B500]/20 p-3.5 rounded-2xl shadow-md">
              <span className="text-[11px] font-bold text-[#A8B3C7] block mb-1">الأكثر مبيعاً</span>
              <span className="text-xs font-['Tajawal'] font-bold text-[#FFD66B] truncate block">{topSoldItemName}</span>
            </div>
          </div>

          {/* Top Items Table */}
          <div className="bg-[#121926] border border-[#F7B500]/20 p-4 rounded-3xl space-y-2.5 shadow-lg">
            <h4 className="text-xs font-['Tajawal'] font-bold text-[#FFFFFF] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#F7B500]" />
              <span>الأصناف الأكثر طلباً</span>
            </h4>
            {sortedTopItems.length === 0 ? (
              <p className="text-xs text-[#A8B3C7] italic py-3 text-center">لا يوجد أي مبيعات مسجلة حتى الآن</p>
            ) : (
              <div className="space-y-2 pt-1">
                {sortedTopItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs text-[#FFFFFF] bg-[#0B0F17] p-2.5 rounded-xl border border-[#1E293D]">
                    <span className="font-bold">{item.name}</span>
                    <span className="font-['Tajawal'] font-black text-[#FFD66B]">{item.count} طلبات</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PRODUCTS & CATEGORIES TAB */}
      {managerTab === 'products' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Categories Management */}
          <div className="bg-[#121926] border border-[#F7B500]/20 p-4 rounded-3xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-['Tajawal'] font-bold text-[#FFFFFF] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#F7B500]" />
                <span>إدارة التصنيفات ({data.categories.length})</span>
              </h3>
              <button
                onClick={() => setIsCatModalOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-[#F7B500] to-[#FFD66B] text-[#0B0F17] font-['Tajawal'] font-black text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>إضافة تصنيف</span>
              </button>
            </div>

            {data.categories.length === 0 ? (
              <p className="text-xs text-[#A8B3C7] italic text-center py-2">لا توجد تصنيفات حالياً</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {data.categories.map(cat => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 bg-[#0B0F17] border border-[#F7B500]/30 px-3 py-1.5 rounded-xl text-xs text-[#FFFFFF]"
                  >
                    <span className="font-bold">
                      {cat.icon} {cat.name}
                    </span>
                    <button
                      onClick={() => setDeleteItem({ type: 'category', id: cat.id, name: cat.name })}
                      className="text-[#F44336] hover:text-[#F44336]/80 p-0.5 cursor-pointer"
                      title="حذف التصنيف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products Management */}
          <div className="bg-[#121926] border border-[#F7B500]/20 p-4 rounded-3xl space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-['Tajawal'] font-bold text-[#FFFFFF] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#F7B500]" />
                <span>إدارة المنتجات والأصناف ({data.products.length})</span>
              </h3>
              <button
                onClick={() => {
                  if (data.categories.length === 0) {
                    alert('يرجى إضافة تصنيف أولاً قبل إضافة المنتجات!');
                    setIsCatModalOpen(true);
                  } else {
                    setEditingProduct(null);
                    setIsProdModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-[#F7B500] to-[#FFD66B] text-[#0B0F17] font-['Tajawal'] font-black text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>إضافة منتج</span>
              </button>
            </div>

            {data.products.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">لا توجد منتجات حتى الآن</p>
            ) : (
              <div className="space-y-2">
                {data.products.map(prod => {
                  const categoryName = data.categories.find(c => c.id === prod.categoryId)?.name || 'غير مصنف';
                  const isOutOfStock = prod.isOutOfStock || prod.isAvailable === false;
                  return (
                    <div
                      key={prod.id}
                      className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{prod.name}</h4>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">
                            {categoryName}
                          </span>
                        </div>
                        <p className="text-xs text-amber-400 font-extrabold mt-0.5">
                          {prod.price} {data.settings.currency}
                        </p>
                      </div>

                      {/* Stock Availability Toggle Switch */}
                      <button
                        onClick={() =>
                          onUpdateProduct(prod.id, {
                            isOutOfStock: !isOutOfStock,
                            isAvailable: isOutOfStock,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                          isOutOfStock
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25'
                            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                        }`}
                        title={isOutOfStock ? 'انقر لجعله متوفراً' : 'انقر لتعليق الطلب (نفد مؤقتاً)'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isOutOfStock ? 'نفد مؤقتاً' : 'متوفر'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsProdModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteItem({ type: 'product', id: prod.id, name: prod.name })}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. STAFF TAB */}
      {managerTab === 'staff' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200">طاقم العمل والموظفون ({data.staff.length})</h3>
            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة موظف</span>
            </button>
          </div>

          {data.staff.length === 0 ? (
            <div className="text-center py-10 bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
              <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-300">لا يوجد موظفون مضافون بعد</p>
              <p className="text-[11px] text-slate-500 mt-1">قم بإضافة طاقم الكاشير والمجهز من هنا</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.staff.map(member => (
                <div
                  key={member.id}
                  className="p-3 bg-slate-800/70 border border-slate-800 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100">{member.name}</h4>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {member.role}
                      </span>
                      {member.pin && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                          PIN: {member.pin}
                        </span>
                      )}
                    </div>
                    {member.phone && <p className="text-[10px] text-slate-400 mt-1">{member.phone}</p>}
                  </div>
                  <button
                    onClick={() => setDeleteItem({ type: 'staff', id: member.id, name: member.name })}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                    title="حذف الموظف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. BLOCKED CUSTOMERS TAB */}
      {managerTab === 'blocked' && (
        <div className="space-y-4 animate-fadeIn text-xs">
          {/* Header Card */}
          <div className="bg-slate-800/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100">قائمة الأجهزة والعملاء المحظورين</h3>
                <p className="text-[10px] text-slate-400">يتم منع هذه الأجهزة فوراً ولحظياً من إرسال طلبات جديدة</p>
              </div>
            </div>
            <span className="text-xs font-black bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-xl border border-rose-500/30">
              {data.blockedCustomers?.length || 0} محظور
            </span>
          </div>

          {/* Manual Block Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!manualSessionId.trim()) return;
              onBlockCustomer(manualSessionId.trim(), manualReason.trim() || 'حظر بقرار الإدارة', manualName.trim() || undefined);
              setManualSessionId('');
              setManualName('');
              setManualReason('حظر بقرار الإدارة');
            }}
            className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2.5"
          >
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>إضافة جهاز للحظر يدوياً</span>
            </h4>

            <div className="space-y-2">
              <input
                type="text"
                value={manualSessionId}
                onChange={e => setManualSessionId(e.target.value)}
                placeholder="معرّف الجلسة/الجهاز (مثال: sess_123456...)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-rose-500"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  placeholder="اسم العميل (اختياري)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-rose-500"
                />
                <input
                  type="text"
                  value={manualReason}
                  onChange={e => setManualReason(e.target.value)}
                  placeholder="سبب الحظر"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Ban className="w-4 h-4" />
              <span>حظر هذا المعرّف الآن</span>
            </button>
          </form>

          {/* Search Box */}
          {(data.blockedCustomers?.length || 0) > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={blockedSearchQuery}
                onChange={e => setBlockedSearchQuery(e.target.value)}
                placeholder="بحث باسم العميل، السبب أو معرّف الجهاز..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>
          )}

          {/* Blocked List */}
          {!data.blockedCustomers || data.blockedCustomers.length === 0 ? (
            <div className="text-center py-10 bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400/80 mx-auto" />
              <p className="font-bold text-slate-300">لا يوجد أي زبائن محظورين حالياً</p>
              <p className="text-[11px] text-slate-500">
                يمكنك حظر الأجهزة المشاغبة أو تكرار الإلغاءات من شاشة الطلبات أو يدوياً عبر هذه اللوحة.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.blockedCustomers
                .filter(b => {
                  if (!blockedSearchQuery.trim()) return true;
                  const q = blockedSearchQuery.toLowerCase();
                  return (
                    b.sessionId.toLowerCase().includes(q) ||
                    (b.customerName && b.customerName.toLowerCase().includes(q)) ||
                    (b.reason && b.reason.toLowerCase().includes(q))
                  );
                })
                .map(blocked => (
                  <div
                    key={blocked.id}
                    className="p-3 bg-slate-800/80 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-rose-300 text-xs">
                          {blocked.customerName || 'عميل غير مسمى'}
                        </span>
                        {blocked.customerPhone && (
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                            {blocked.customerPhone}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-amber-300 font-medium">السبب: {blocked.reason}</p>

                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                        <span>#...{blocked.sessionId.slice(-10)}</span>
                        <span>•</span>
                        <span>
                          {new Date(blocked.blockedAt).toLocaleDateString('ar-SA')} -{' '}
                          {new Date(blocked.blockedAt).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUnblockCustomer(blocked.sessionId)}
                      className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/40 shrink-0 transition-all flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>فك الحظر</span>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 5. SETTINGS TAB */}
      {managerTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-4 bg-slate-800/60 border border-slate-800 p-4 rounded-2xl text-xs animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>إعدادات المتجر العامة</span>
            </h3>
            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 font-mono">
              المصدر الوحيد للإعدادات
            </span>
          </div>

          {/* Dedicated Section: WhatsApp Store Number */}
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-2.5 shadow-md">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>واتساب المتجر (Store WhatsApp)</span>
              </div>
              {settingsService.getWhatsappNumber() ? (
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-mono font-bold">
                  مُفعّل ({settingsService.getWhatsappNumber()})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-[10px] font-bold">
                  لم يتم إعداد الرقم بعد
                </span>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-200 mb-1 block text-xs">
                رقم واتساب المتجر (بصيغة دولية مثل: 9665XXXXXXXX)
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  if (phoneValidationError) setPhoneValidationError('');
                }}
                placeholder="9665XXXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                * يسمح بالأرقام فقط بدون فواصل أو رموز. يجب أن يبدأ بمفتاح الدولة مباشرة (مثل 966 أو 971 أو 20).
              </p>
            </div>

            {phoneValidationError && (
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-bold animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{phoneValidationError}</span>
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-300 mb-1 block">اسم البوفيه / المتجر</label>
            <input
              type="text"
              value={buffetName}
              onChange={e => setBuffetName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-300 mb-1 block">العملة المستخدمة</label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                placeholder="ر.س"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 mb-1 block">نسبة الضريبة (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxPercentage}
                onChange={e => setTaxPercentage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-300">السماح بالدفع الآجل / على الحساب</span>
            <input
              type="checkbox"
              checked={allowDeferred}
              onChange={e => setAllowDeferred(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 mb-1 block">العنوان والتواجد</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="الفرع الرئيسي..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 mb-1 block">رسالة ترحيب الفاتورة</label>
            <input
              type="text"
              value={welcomeMsg}
              onChange={e => setWelcomeMsg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-amber-400 mb-1 block flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>رمز مرور الإدارة السري (Admin PIN)</span>
            </label>
            <input
              type="text"
              value={adminPin}
              onChange={e => setAdminPin(e.target.value)}
              placeholder="الافتراضي: 1234"
              className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono text-center tracking-widest focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">رمز المرور المخصص للدخول الكامل إلى لوحة الإدارة</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>حفظ إعدادات الواتساب والمحل</span>
          </button>

          {settingsSaved && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-center text-xs font-bold animate-fadeIn space-y-0.5">
              <p>✅ تم حفظ إعدادات المتجر ورقم الواتساب بنجاح!</p>
              <p className="text-[10px] text-emerald-400/80">تم التحديث الفوري المباشر لجميع شاشات وأجهزة التطبيق عبر Supabase.</p>
            </div>
          )}
        </form>
      )}

      {/* 5. DATA BACKUP & RESET TAB */}
      {managerTab === 'data' && (
        <div className="space-y-4 bg-slate-800/60 border border-slate-800 p-4 rounded-2xl text-xs animate-fadeIn">
          <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-2">إدارة البيانات والنسخ</h3>

          {/* Export / Import */}
          <div className="space-y-2">
            <button
              onClick={onExportBackup}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>تصدير نسخة احتياطية (JSON)</span>
            </button>

            <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>استيراد بيانات من ملف</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          {/* Danger Zone Complete Reset */}
          <div className="border-t border-slate-800 pt-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>إعادة ضبط النظام بصفر بيانات</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                يقوم هذا الخيار بمحاكاة التشغيل الأول، وحذف أي بيانات أو طلبات لتصبيح الشاشات والإحصائيات بصفر تام.
              </p>
              <button
                type="button"
                onClick={() => setDeleteItem({ type: 'resetData' })}
                className="w-full py-2.5 bg-[#F44336] hover:bg-rose-600 text-[#FFFFFF] font-['Tajawal'] font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                تصفير كافة البيانات الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CategoryFormModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSaveCategory={onAddCategory}
      />

      <ProductFormModal
        isOpen={isProdModalOpen}
        onClose={() => {
          setIsProdModalOpen(false);
          setEditingProduct(null);
        }}
        categories={data.categories}
        initialProduct={editingProduct}
        onSaveProduct={prodData => {
          if (editingProduct) {
            onUpdateProduct(editingProduct.id, prodData);
          } else {
            onAddProduct(prodData);
          }
        }}
        currency={data.settings.currency}
      />

      <StaffFormModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSaveStaff={onAddStaff}
      />

      {/* Confirmation Dialog for Deletions */}
      <ConfirmDeleteModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذه العملية."
      />

      {/* Success Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};
