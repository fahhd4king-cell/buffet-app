import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, CategoryId, StaffMember, StaffRole } from '../types';
import { HISTORICAL_SALES_DATA } from '../data/initialData';
import { PDFReportModal } from './PDFReportModal';
import { BuffetStatusModal } from './BuffetStatusModal';
import { OptionsManager } from './OptionsManager';
import { PaymentGatewaySettings } from './PaymentGatewaySettings';
import { getCurrentCoordinates, calculateDistanceMeters } from '../utils/location';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  UtensilsCrossed,
  Users,
  Printer,
  Plus,
  Edit2,
  Trash2,
  Power,
  FileText,
  Download,
  AlertTriangle,
  Table,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
  UserCheck,
  Calendar,
  Key,
  Compass,
  Eye,
  EyeOff,
  CreditCard,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    menuItems,
    categories,
    orders,
    staff,
    optionGroups,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    addStaff,
    updateStaff,
    deleteStaff,
    activeBranch,
    setActiveBranch,
    buffetStatus,
    buffetLocation,
    updateBuffetLocation,
    attendanceRecords,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'options' | 'staff' | 'location' | 'attendance' | 'payments' | 'settings'>('analytics');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Modal states for Menu Item
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // Search & Filters for Menu Management
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>('all');
  const [menuViewMode, setMenuViewMode] = useState<'table' | 'grid'>('table');

  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: 5,
    category: 'hot-drinks' as CategoryId,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    customizationGroupIds: [] as string[],
  });

  // Modal & Form states for Staff Member
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  
  const [staffForm, setStaffForm] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    role: 'مشرف البوفيه' as StaffRole,
    status: 'active' as 'active' | 'inactive',
    shift: 'الوردية الصباحية' as 'الوردية الصباحية' | 'الوردية المسائية',
  });

  // Location Form
  const [locationForm, setLocationForm] = useState({
    name: buffetLocation.name,
    lat: buffetLocation.lat,
    lng: buffetLocation.lng,
    allowedRadiusMeters: buffetLocation.allowedRadiusMeters,
  });

  // Revenue analytics
  const todayRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const todayOrdersCount = orders.length;
  const avgOrderValue = todayOrdersCount > 0 ? (todayRevenue / todayOrdersCount).toFixed(1) : '0';

  // Category sales breakdown chart data
  const categoryChartData = categories.map((cat) => {
    const totalCatSales = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        if (menuItem && menuItem.category === cat.id) {
          acc += item.price * item.quantity;
        }
      });
      return acc;
    }, 0);
    return { name: cat.name, sales: totalCatSales || Math.floor(Math.random() * 200 + 50) };
  });

  const COLORS = ['#10b981', '#0284c7', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Top Selling Items calculations
  const topSellers = [...menuItems]
    .map((item) => {
      const orderCount = orders.reduce((acc, order) => {
        const found = order.items.find((i) => i.menuItemId === item.id);
        return acc + (found ? found.quantity : 0);
      }, 0);
      return { ...item, totalSold: (item.popularScore || 100) + orderCount * 5 };
    })
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  // Handle Menu Item Save
  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) return;

    if (editingMenuItem) {
      updateMenuItem({
        ...editingMenuItem,
        name: itemForm.name,
        description: itemForm.description,
        price: Number(itemForm.price),
        category: itemForm.category,
        image: itemForm.image,
        customizationGroupIds: itemForm.customizationGroupIds,
      });
      setEditingMenuItem(null);
    } else {
      addMenuItem({
        name: itemForm.name,
        description: itemForm.description,
        price: Number(itemForm.price),
        category: itemForm.category,
        image: itemForm.image,
        isAvailable: itemForm.isAvailable,
        customizationGroupIds: itemForm.customizationGroupIds,
      });
      setIsAddMenuOpen(false);
    }

    setItemForm({
      name: '',
      description: '',
      price: 5,
      category: 'hot-drinks',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      customizationGroupIds: [],
    });
  };

  // Open Staff Modal for Editing
  const handleOpenEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setStaffForm({
      name: member.name,
      username: member.username || '',
      password: member.password || '',
      phone: member.phone || '',
      role: member.role || 'مشرف البوفيه',
      status: member.status || 'active',
      shift: member.shift || 'الوردية الصباحية',
    });
    setShowModalPassword(false);
    setIsAddStaffOpen(true);
  };

  // Open Staff Modal for Adding
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      username: '',
      password: '123',
      phone: '',
      role: 'مشرف البوفيه',
      status: 'active',
      shift: 'الوردية الصباحية',
    });
    setShowModalPassword(false);
    setIsAddStaffOpen(true);
  };

  // Handle Staff Save
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim()) return;

    const usernameToUse = staffForm.username.trim() || (staffForm.name?.toLowerCase() || 'user').replace(/\s+/g, '_');
    const passwordToUse = staffForm.password.trim() || '123';

    if (editingStaff) {
      updateStaff({
        ...editingStaff,
        name: staffForm.name.trim(),
        username: usernameToUse,
        password: passwordToUse,
        phone: staffForm.phone.trim(),
        role: staffForm.role,
        status: staffForm.status,
        shift: staffForm.shift,
      });
      setEditingStaff(null);
    } else {
      addStaff({
        name: staffForm.name.trim(),
        username: usernameToUse,
        password: passwordToUse,
        phone: staffForm.phone.trim(),
        role: staffForm.role,
        status: staffForm.status,
        shift: staffForm.shift,
      });
    }

    setIsAddStaffOpen(false);
    setStaffForm({
      name: '',
      username: '',
      password: '',
      phone: '',
      role: 'مشرف البوفيه',
      status: 'active',
      shift: 'الوردية الصباحية',
    });
  };

  // Handle GPS Location Save
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    updateBuffetLocation({
      name: locationForm.name,
      lat: Number(locationForm.lat),
      lng: Number(locationForm.lng),
      allowedRadiusMeters: Number(locationForm.allowedRadiusMeters),
    });
  };

  const handleFetchCurrentAdminLocation = async () => {
    try {
      const coords = await getCurrentCoordinates();
      setLocationForm((prev) => ({
        ...prev,
        lat: coords.lat,
        lng: coords.lng,
      }));
      updateBuffetLocation({
        name: locationForm.name,
        lat: coords.lat,
        lng: coords.lng,
        allowedRadiusMeters: Number(locationForm.allowedRadiusMeters),
      });
    } catch {
      // Toast handles error in utility
    }
  };

  // Data Export / Backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ menuItems, orders, staff, buffetStatus }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `buffet_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Top Admin Navigation Header */}
      <section className="bg-slate-900 text-white pt-6 pb-12 px-4 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-black border border-emerald-500/30">
                📊
              </div>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>لوحة قيادة صاحب البوفيه</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                    إدارة شاملة
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  متابعة الأرباح، حالة استقبال الطلبات، المنيو والأسعار، وإدارة الطاقم
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  buffetStatus.isOpen
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 animate-pulse'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{buffetStatus.isOpen ? '🟢 حالة البوفيه: مفتوح' : '🔴 حالة البوفيه: مغلق'}</span>
              </button>

              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-all"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>تقرير PDF</span>
              </button>
            </div>
          </div>

          {/* Admin Tabs Switcher */}
          <div className="flex items-center bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 overflow-x-auto gap-2">
            {[
              { id: 'analytics', label: 'الإحصائيات والأرباح', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'menu', label: `إدارة المنيو والأسعار (${menuItems.length})`, icon: <UtensilsCrossed className="w-4 h-4" /> },
              { id: 'options', label: `إدارة الإضافات والخيارات (${optionGroups.length})`, icon: <SlidersHorizontal className="w-4 h-4" /> },
              { id: 'staff', label: `إدارة الموظفين (${staff.length})`, icon: <Users className="w-4 h-4" /> },
              { id: 'location', label: 'موقع البوفيه', icon: <MapPin className="w-4 h-4" /> },
              { id: 'attendance', label: `سجل الحضور والانصراف (${attendanceRecords.length})`, icon: <Clock className="w-4 h-4" /> },
              { id: 'payments', label: 'بوابات الدفع الإلكتروني', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'settings', label: 'الطابعات ونظام الإغلاق والنسخ', icon: <Printer className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        
        {/* TAB 1: ANALYTICS & PROFITS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Buffet Quick Control Tile Banner */}
            <div className={`p-4 sm:p-5 rounded-3xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              buffetStatus.isOpen ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800' : 'bg-rose-950/90 text-rose-100 border-rose-800'
            }`}>
              <div className="flex items-start gap-3 min-w-0 w-full">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 ${
                  buffetStatus.isOpen ? 'bg-emerald-800 text-emerald-200' : 'bg-rose-800 text-rose-200'
                }`}>
                  {buffetStatus.isOpen ? '🟢' : '🔴'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-white leading-snug">
                    نظام فتح وإغلاق استقبال الطلبات ({buffetStatus.isOpen ? 'مفتوح حالياً' : 'مغلق حالياً'})
                  </h4>
                  {buffetStatus.isOpen ? (
                    <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-snug break-words">
                      ساعات العمل التلقائية: من {buffetStatus.workingHours?.openHour || '06:00'} إلى {buffetStatus.workingHours?.closeHour || '23:59'}
                    </p>
                  ) : (
                    <div className="text-[11px] sm:text-xs text-rose-200 mt-1 space-y-0.5">
                      <p className="break-words leading-snug"><strong>السبب:</strong> {buffetStatus.closureReason || 'غير محدد'}</p>
                      <p className="break-words leading-snug"><strong>العودة المتوقعة:</strong> <span className="text-amber-300 font-bold">{buffetStatus.reopenTime || 'قريباً'}</span></p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-xs transition-all shadow-md shrink-0"
              >
                إعدادات الإغلاق والجدولة ⚙️
              </button>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">دخل المبيعات اليوم</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{todayRevenue} ر.س</span>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                    ↑ +18% مقارنة بالأمس
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
                  💰
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">إجمالي عدد الطلبات اليوم</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{todayOrdersCount} طلبات</span>
                  <span className="text-[11px] text-blue-600 font-bold mt-1 inline-flex items-center gap-1">
                    ● جميعها موثقة إلكترونياً
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl">
                  📋
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">متوسط قيمة الطلب</span>
                  <span className="text-2xl font-black text-emerald-800 mt-1 block">{avgOrderValue} ر.س</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">لكل عميل بالمكتب</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
                  💳
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">أكثر صنف مبيعاً</span>
                  <span className="text-base font-black text-slate-900 mt-1 block truncate max-w-[140px]">
                    {topSellers[0]?.name || 'شاي كرك'}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                    {topSellers[0]?.totalSold || 320} طلب هذا الأسبوع
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xl">
                  🏆
                </div>
              </div>
            </div>

            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily/Weekly Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">المبيعات اليومية والأسبوعية (ر.س)</h4>
                    <p className="text-xs text-slate-500">حجم المبيعات والإيرادات اليومية في البوفيه</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    أسبوعي
                  </span>
                </div>

                <div className="h-64 min-h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HISTORICAL_SALES_DATA}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(val: unknown) => [`${val ?? 0} ر.س`, 'المبيعات']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Sales Pie Chart */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-extrabold text-slate-900 text-base">توزيع المبيعات حسب التصنيف</h4>
                <div className="h-52 min-h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="sales"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: unknown) => [`${val ?? 0} ر.س`, 'المبيعات']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {categoryChartData.map((cat, idx) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="font-bold text-slate-700">{cat.name}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">{cat.sales} ر.س</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Top Selling Items Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base flex items-center justify-between gap-2">
                <span>الأطباق والمشروبات الأكثر مبيعاً 🏆</span>
                <span className="text-xs text-slate-500 font-normal">يمكنك التحكم المباشر بحالة التوفر والتعديل</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                      <th className="p-3 font-bold">الصنف</th>
                      <th className="p-3 font-bold">التصنيف</th>
                      <th className="p-3 font-bold">السعر الحالي</th>
                      <th className="p-3 font-bold">إجمالي الطلبات</th>
                      <th className="p-3 font-bold">حالة التوفر (تبديل سريع)</th>
                      <th className="p-3 font-bold text-center">الإجراءات والعمليات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellers.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{item.description}</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-700">
                          {categories.find((c) => c.id === item.category)?.name}
                        </td>
                        <td className="p-3 font-black text-emerald-700">{item.price} ر.س</td>
                        <td className="p-3 font-bold text-slate-800">{item.totalSold} طلب</td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleItemAvailability(item.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
                              item.isAvailable
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                            }`}
                            title="اضغط للتبديل السريع لحالة المنتج"
                          >
                            {item.isAvailable ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                                <span>متاح (اضغط للتعطيل)</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-rose-500" />
                                <span>نفاذ / غير متوفر</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingMenuItem(item);
                                setItemForm({
                                 name: item.name,
                                 description: item.description,
                                 price: item.price,
                                 category: item.category,
                                 image: item.image,
                                 isAvailable: item.isAvailable,
                                 customizationGroupIds: item.customizationGroupIds ?? [],
                                });
                                setIsAddMenuOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>

                            <button
                              onClick={() => setItemToDelete(item)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MENU & PRICES MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Bar with Title, View Switcher & Add Button */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-base text-slate-900">إدارة منيو البوفيه والأسعار</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  التحكم المباشر في التوفر والأسعار وحذف الأصناف مع التحديث الفوري لدى العملاء
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* View Switcher: Table / Grid */}
                <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
                  <button
                    onClick={() => setMenuViewMode('table')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      menuViewMode === 'table'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Table className="w-4 h-4" />
                    <span>جدول المنيو</span>
                  </button>
                  <button
                    onClick={() => setMenuViewMode('grid')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      menuViewMode === 'grid'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>بطاقات الأصناف</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingMenuItem(null);
                    setItemForm({
                      name: '',
                      description: '',
                      price: 5,
                      category: 'hot-drinks',
                      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
                      isAvailable: true,
                      customizationGroupIds: [],
                    });
                    setIsAddMenuOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صنف جديد</span>
                </button>
              </div>
            </div>

            {/* Filters Bar: Search & Category Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  placeholder="ابحث…"
                  className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedMenuCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedMenuCategory === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  الكل ({menuItems.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedMenuCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedMenuCategory === cat.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Table View */}
            {menuViewMode === 'table' ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 font-bold">
                        <th className="p-4">الصنف والوصف</th>
                        <th className="p-4">التصنيف</th>
                        <th className="p-4">السعر</th>
                        <th className="p-4">حالة التوفر (تبديل سريع)</th>
                        <th className="p-4 text-center">الإجراءات والعمليات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {menuItems
                        .filter((item) => {
                          const matchesSearch =
                            (item.name?.toLowerCase() || '').includes((menuSearchQuery || '').toLowerCase()) ||
                            (item.description?.toLowerCase() || '').includes((menuSearchQuery || '').toLowerCase());
                          const matchesCat = selectedMenuCategory === 'all' || item.category === selectedMenuCategory;
                          return matchesSearch && matchesCat;
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <span className="font-extrabold text-slate-900 text-sm block">{item.name}</span>
                                  <span className="text-slate-500 text-xs line-clamp-1 max-w-md">{item.description}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                                {categories.find((c) => c.id === item.category)?.name}
                              </span>
                            </td>
                            <td className="p-4 font-black text-emerald-700 text-sm">
                              {item.price} ر.س
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => toggleItemAvailability(item.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
                                  item.isAvailable
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                                }`}
                                title="اضغط للتبديل السريع لحالة المنتج"
                              >
                                {item.isAvailable ? (
                                  <>
                                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                                    <span>🟢 متاح بالبوفيه</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-4 h-4 text-rose-500" />
                                    <span>🔴 نفاد الكمية / موقوف</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingMenuItem(item);
                                    setItemForm({
                                      name: item.name,
                                      description: item.description,
                                      price: item.price,
                                      category: item.category,
                                      image: item.image,
                                      isAvailable: item.isAvailable,
                                      customizationGroupIds: item.customizationGroupIds || [],
                                    });
                                    setIsAddMenuOpen(true);
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
                                  title="تعديل بيانات الصنف"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                                  <span>تعديل</span>
                                </button>

                                <button
                                  onClick={() => setItemToDelete(item)}
                                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                                  title="حذف هذا الصنف"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>حذف</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Menu Items Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems
                  .filter((item) => {
                    const matchesSearch =
                      (item.name?.toLowerCase() || '').includes((menuSearchQuery || '').toLowerCase()) ||
                      (item.description?.toLowerCase() || '').includes((menuSearchQuery || '').toLowerCase());
                    const matchesCat = selectedMenuCategory === 'all' || item.category === selectedMenuCategory;
                    return matchesSearch && matchesCat;
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-3xl border p-4 shadow-xs space-y-3 flex flex-col justify-between ${
                        item.isAvailable ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                            <span className="font-extrabold text-emerald-700 text-sm">{item.price} ر.س</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                          <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                            {categories.find((c) => c.id === item.category)?.name}
                          </span>
                        </div>
                      </div>

                      {/* Actions & Availability Toggle */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            item.isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-100 text-rose-900 border border-rose-200 hover:bg-rose-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{item.isAvailable ? '🟢 متاح' : '🔴 نفاد الكمية'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingMenuItem(item);
                              setItemForm({
                                name: item.name,
                                description: item.description,
                                price: item.price,
                                category: item.category,
                                image: item.image,
                                isAvailable: item.isAvailable,
                                customizationGroupIds: item.customizationGroupIds || [],
                              });
                              setIsAddMenuOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>

                          <button
                            onClick={() => setItemToDelete(item)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

          </div>
        )}

        {/* TAB OPTIONS & ADDONS MANAGEMENT */}
        {activeTab === 'options' && <OptionsManager />}

        {/* TAB 3: STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>إدارة طاقم الموظفين (مشرفي البوفيه)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  إضافة، تعديل، وحذف حسابات مشرفي البوفيه وضبط بيانات الدخول والحالة.
                </p>
              </div>

              <button
                onClick={handleOpenAddStaff}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة موظف جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {staff.map((member) => (
                <div key={member.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold border border-emerald-200">
                        👨‍🍳
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{member.name}</h4>
                        <span className="text-[11px] text-emerald-800 font-extrabold bg-emerald-100/80 px-2.5 py-0.5 rounded-md inline-block mt-0.5 border border-emerald-200">
                          {member.role || 'مشرف البوفيه'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                      member.status === 'active' || !member.status
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}>
                      {member.status === 'active' || !member.status ? '🟢 نشط' : '🔴 غير نشط'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">اسم المستخدم:</span>
                      <span className="font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">
                        @{member.username || 'staff1'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">كلمة المرور:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-800 font-mono text-[11px] bg-slate-200/60 px-2 py-0.5 rounded">
                          {showPasswords[member.id] ? member.password || '123' : '••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, [member.id]: !prev[member.id] }))}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                          title={showPasswords[member.id] ? 'إخفاء' : 'إظهار كلمة المرور'}
                        >
                          {showPasswords[member.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">رقم الجوال:</span>
                      <span className="font-bold text-slate-800 dir-ltr">{member.phone || 'غير مدخل'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEditStaff(member)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => setStaffToDelete(member)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB: BUFFET LOCATION SETTINGS */}
        {activeTab === 'location' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>إعدادات موقع البوفيه (نطاق الـ GPS)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحديد موقع البوفيه على الخريطة أو بإدخال خط العرض وخط الطول والحد المسموح (100 متر) لتسجيل الحضور.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFetchCurrentAdminLocation}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
              >
                <Compass className="w-4 h-4" />
                <span>تحديد موقعي الحالي كمرجع للبوفيه 📍</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form & Distance Tester */}
              <div className="lg:col-span-1 space-y-6">
                <form onSubmit={handleSaveLocation} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <h4 className="font-black text-sm text-slate-900 border-b pb-2">بيانات إحداثيات البوفيه</h4>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الموقع المرجعي</label>
                    <input
                      type="text"
                      required
                      value={locationForm.name}
                      onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                      placeholder="مثال: البوفيه الرئيسية"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">خط العرض (Latitude)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={locationForm.lat}
                      onChange={(e) => setLocationForm({ ...locationForm, lat: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">خط الطول (Longitude)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={locationForm.lng}
                      onChange={(e) => setLocationForm({ ...locationForm, lng: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الحد المسموح للحضور (بالأمتار)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="500"
                        required
                        value={locationForm.allowedRadiusMeters}
                        onChange={(e) => setLocationForm({ ...locationForm, allowedRadiusMeters: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold text-emerald-800"
                      />
                      <span className="font-bold text-slate-500 shrink-0">متر</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">النطاق المحدد بالخريطة: 100 متر</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>حفظ وتطبيق إعدادات الموقع</span>
                  </button>
                </form>

                {/* Distance Tester Card */}
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl space-y-3">
                  <h4 className="font-extrabold text-xs text-emerald-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-700" />
                    <span>اختبار مسافتك الحالية الآن</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    اضغط أدناه للتحقق مما إذا كان موقع جهازك الحالي يقع داخل نطاق الـ {buffetLocation.allowedRadiusMeters} متر المسموحة.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const coords = await getCurrentCoordinates();
                        const dist = calculateDistanceMeters(coords.lat, coords.lng, buffetLocation.lat, buffetLocation.lng);
                        if (dist <= buffetLocation.allowedRadiusMeters) {
                          alert(`🟢 أنت حالياً داخل نطاق البوفيه!\nالمسافة: ${dist} متر (الحد المسموح: ${buffetLocation.allowedRadiusMeters} متر)`);
                        } else {
                          alert(`🔴 أنت خارج نطاق البوفيه!\nالمسافة الحالية: ${dist} متر (الحد المسموح: ${buffetLocation.allowedRadiusMeters} متر)\nيجب أن تكون داخل البوفيه لتسجيل الحضور.`);
                        }
                      } catch (err: any) {
                        alert(err.message || 'حدث خطأ أثناء الحصول على الموقع');
                      }
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs"
                  >
                    فحص مسافتي الحالية 📍
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Map Container */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">معاينة خريطة موقع البوفيه الحالية</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        الإحداثيات الحالية: Lat: {buffetLocation.lat}, Lng: {buffetLocation.lng}
                      </p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                      النطاق المسموح: {buffetLocation.allowedRadiusMeters}m
                    </span>
                  </div>

                  {/* Interactive OpenStreetMap Embed */}
                  <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                    <iframe
                      title="خريطة موقع البوفيه"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${buffetLocation.lng - 0.005}%2C${buffetLocation.lat - 0.005}%2C${buffetLocation.lng + 0.005}%2C${buffetLocation.lat + 0.005}&layer=mapnik&marker=${buffetLocation.lat}%2C${buffetLocation.lng}`}
                      className="w-full h-full"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs border border-slate-700 shadow-md">
                      📍 {buffetLocation.name}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-slate-600">
                    💡 <span className="font-bold text-slate-800">ملاحظة تنظيمية:</span> يستطيع الموظفون فقط تسجيل الحضور والانصراف عند تواجدهم داخل هذا النطاق، ولا يطلب التطبيق الموقع من العملاء مطلقاً.
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${buffetLocation.lat},${buffetLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-xl font-bold hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <span>فتح في Google Maps ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANCE & GPS LOCATION MANAGEMENT */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Buffet GPS Geofence Configuration Tile */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>إعدادات الموقع الجغرافي للبوفيه (GPS Radius Limit)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تحديد الإحداثيات الجغرافية المعتمدة ونطاق المسافة المسموحة (مثلاً 15 متراً) لتسجيل الحضور.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFetchCurrentAdminLocation}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs flex items-center gap-2 transition-all shrink-0"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>تحديد موقعي الحالي كمرجع للبوفيه 📍</span>
                </button>
              </div>

              <form onSubmit={handleSaveLocation} className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الموقع المرجعي</label>
                  <input
                    type="text"
                    required
                    value={locationForm.name}
                    onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">خط العرض (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={locationForm.lat}
                    onChange={(e) => setLocationForm({ ...locationForm, lat: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">خط الطول (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={locationForm.lng}
                    onChange={(e) => setLocationForm({ ...locationForm, lng: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحد المسموح (بالأمتار)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="500"
                      required
                      value={locationForm.allowedRadiusMeters}
                      onChange={(e) => setLocationForm({ ...locationForm, allowedRadiusMeters: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold text-emerald-800"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-950 transition-colors shrink-0"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Attendance Records Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span>سجل الحضور والانصراف الموثق بالجي بي إس</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    جميع السجلات السابقة موثقة جغرافياً بمكان الموظف والمسافة المحددة.
                  </p>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                  إجمالي السجلات: {attendanceRecords.length}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">اسم الموظف</th>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">وقت الحضور</th>
                      <th className="p-3">وقت الانصراف</th>
                      <th className="p-3">ساعات العمل</th>
                      <th className="p-3">المسافة عن البوفيه</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 font-bold">
                          لا توجد سجلات حضور مسجلة حتى الآن.
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{rec.staffName}</td>
                          <td className="p-3 text-slate-600 font-mono">{rec.date}</td>
                          <td className="p-3 font-bold text-emerald-700">{rec.checkInTime}</td>
                          <td className="p-3 font-bold text-slate-700">{rec.checkOutTime || '— (قيد الدوام)'}</td>
                          <td className="p-3 text-slate-600">{rec.workingHours || 'جاري الحساب'}</td>
                          <td className="p-3 text-slate-600 font-bold">
                            📍 {rec.distanceFromBuffetMeters} متر
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              rec.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {rec.status === 'present' ? '🟢 متواجد بالدورة' : '✅ مكتمل'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SETTINGS, PRINTERS & BACKUP */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Open/Close Settings Tile */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Power className="w-5 h-5 text-emerald-600" />
                  <span>إعدادات فتح وإغلاق البوفيه وساعات العمل</span>
                </h3>
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md"
                >
                  التحكم بالوضع والجدولة
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-bold block">الحالة الحالية</span>
                  <span className={`text-sm font-black mt-1 block ${buffetStatus.isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {buffetStatus.isOpen ? '🟢 مفتوح الآن للعملاء' : '🔴 مغلق حالياً'}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-1">
                    {buffetStatus.isOpen ? 'يمكن للعملاء إرسال طلبات جديدة.' : `السبب: ${buffetStatus.closureReason}`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-bold block">جدولة ساعات العمل التلقائية</span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">
                    {buffetStatus.workingHours?.openHour || '06:00'} - {buffetStatus.workingHours?.closeHour || '23:59'}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-1">
                    {buffetStatus.autoScheduleEnabled ? 'مفعلة تلقائياً يومياً 🟢' : 'معطلة (يدوي فقط)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Printers & PDF Reports */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <span>طابعات الفواتير والتقارير</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="block text-slate-900 font-bold">طابعة البوفيه الكاونتر (EPSON TM-T20)</strong>
                    <span className="text-emerald-600 font-bold text-[11px] block mt-0.5">متصلة عبر الشبكة (192.168.1.150) ●</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-800 font-bold hover:bg-slate-300">
                    طباعة تجريبية
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="block text-slate-900 font-bold">طباعة الفواتير التلقائية عند الجاهزية</strong>
                    <span className="text-slate-500 text-[11px] block mt-0.5">مفعلة تلقائياً مع كل طلب جديد</span>
                  </div>
                  <span className="text-emerald-600 font-extrabold">مفعل ✅</span>
                </div>
              </div>
            </div>

            {/* Backup & Restore Data */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <span>النسخ الاحتياطي وتصدير البيانات</span>
              </h3>
              <p className="text-xs text-slate-500">
                تصدير نسخة احتياطية من قائمة الطعام المخصصة والطلبات وحالة الإغلاق والموظفين كملف JSON
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>تصدير نسخة احتياطية (JSON)</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: PAYMENT GATEWAYS CONFIGURATION */}
        {activeTab === 'payments' && (
          <div className="animate-in fade-in duration-300">
            <PaymentGatewaySettings />
          </div>
        )}

      </main>

      {/* Add / Edit Menu Item Modal */}
      {isAddMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-black text-base text-slate-900">
              {editingMenuItem ? 'تعديل بيانات الصنف والأسعار' : 'إضافة صنف جديد بالمنيو'}
            </h3>

            <form onSubmit={handleSaveMenuItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الصنف</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="مثال: شاي أحمر خادر"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="وصف مكونات المشروب أو السندويش..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعر (ر.س)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as CategoryId })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رابط صورة الصنف (Unsplash URL)</label>
                <input
                  type="url"
                  value={itemForm.image}
                  onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>

              {optionGroups.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مجموعات الخيارات والإضافات المرتبطة</label>
                  <div className="space-y-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                    {optionGroups.map((group) => {
                      const isChecked = itemForm.customizationGroupIds?.includes(group.id);
                      return (
                        <label key={group.id} className="flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100">
                          <span>{group.name} ({group.options.length} خيارات)</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setItemForm({
                                  ...itemForm,
                                  customizationGroupIds: [...(itemForm.customizationGroupIds || []), group.id],
                                });
                              } else {
                                setItemForm({
                                  ...itemForm,
                                  customizationGroupIds: (itemForm.customizationGroupIds || []).filter((id) => id !== group.id),
                                });
                              }
                            }}
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMenuOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-black text-base text-slate-900">
              {editingStaff ? 'تعديل بيانات حساب الموظف' : 'إضافة موظف جديد بفرع البوفيه'}
            </h3>

            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الموظف الثلاثي</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="مثال: عبدالأحد سلمان"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المستخدم (للتسجيل)</label>
                  <input
                    type="text"
                    required
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                    placeholder="مثال: abdulahad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      required
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      placeholder="••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الجوال (اختياري)</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="0500000000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 dir-ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الوظيفة والصلاحية</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as StaffRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold text-slate-800"
                  >
                    <option value="مشرف البوفيه">مشرف البوفيه (المدير)</option>
                    <option value="موظف بوفيه">موظف بوفيه</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">حالة الحساب</label>
                <select
                  value={staffForm.status}
                  onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold"
                >
                  <option value="active">🟢 مفعل / نشط (يمكنه الدخول ومتابعة العمل)</option>
                  <option value="inactive">🔴 موقوف / غير نشط</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddStaffOpen(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {editingStaff ? 'حفظ التعديلات' : 'إضافة الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 text-right">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">تأكيد حذف حساب الموظف</h3>
                <p className="text-xs text-slate-500 mt-0.5">هل أنت متأكد من رغبتك في حذف هذا الموظف؟</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">اسم الموظف:</span>
                <span className="font-black text-slate-900 text-sm">{staffToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">الوظيفة:</span>
                <span className="font-bold text-emerald-800">{staffToDelete.role || 'مشرف البوفيه'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">اسم المستخدم:</span>
                <span className="font-mono font-bold bg-slate-200 px-2 py-0.5 rounded">{staffToDelete.username}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
              ⚠️ <strong>تنبيه هام:</strong> سيتم حذف حساب الموظف نهائياً ولن يتمكن من تسجيل الدخول إلى النظام أو تسجيل الحضور بعد ذلك.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                إلغاء الأمر
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStaff(staffToDelete.id);
                  setStaffToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Report Modal */}
      <PDFReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* Buffet Status Modal */}
      <BuffetStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 text-right">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">تأكيد حذف المنتج من المنيو</h3>
                <p className="text-xs text-slate-500 mt-0.5">هل أنت متأكد من رغبتك في حذف هذا الصنف؟</p>
              </div>
            </div>

            {/* Item Details Preview Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img
                src={itemToDelete.image}
                alt={itemToDelete.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-slate-900 truncate">{itemToDelete.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{itemToDelete.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                    {categories.find((c) => c.id === itemToDelete.category)?.name}
                  </span>
                  <span className="text-xs font-black text-emerald-700">{itemToDelete.price} ر.س</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              ⚠️ <strong>تنبيه هام:</strong> سيتم إزالة هذا المنتج نهائياً من قائمة المنيو فوراً ولن يتمكن العملاء من طلب هذا الصنف مجدداً.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                إلغاء الأمر
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMenuItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
