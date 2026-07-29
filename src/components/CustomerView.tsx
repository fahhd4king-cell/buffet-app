import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, OrderItem } from '../types';
import { ItemOptionsModal } from './ItemOptionsModal';
import { CartDrawer } from './CartDrawer';
import { CustomerOrdersTracker } from './CustomerOrdersTracker';
import {
  Search,
  Plus,
  Coffee,
  CupSoda,
  UtensilsCrossed,
  Citrus,
  Utensils,
  SlidersHorizontal,
  ShoppingBag,
  Bell,
  Sparkles,
  Clock,
  ShieldAlert,
  AlertOctagon,
  Lock,
} from 'lucide-react';

export const CustomerView: React.FC = () => {
  const {
    menuItems,
    categories,
    selectedCategory,
    setSelectedCategory,
    addToCart,
    cart,
    orders,
    activeBranch,
    buffetStatus,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForOptions, setSelectedItemForOptions] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersHistoryOpen, setIsOrdersHistoryOpen] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | undefined>(undefined);

  // Icon mapping
  const categoryIconMap: Record<string, React.ReactNode> = {
    'hot-drinks': <Sparkles className="w-4 h-4 text-amber-500" />,
    'cold-drinks': <Utensils className="w-4 h-4 text-sky-500" />,
    'sandwiches': <UtensilsCrossed className="w-4 h-4 text-emerald-500" />,
    'fresh-juices': <Citrus className="w-4 h-4 text-orange-500" />,
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      (item.name?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes((searchQuery || '').toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Active customer order notification banner
  const activePreparingOrder = orders.find((o) => ['received', 'preparing', 'ready'].includes(o.status));

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!buffetStatus.isOpen) {
      alert('البوفيه مغلق حالياً، نعتذر عن استقبال الطلبات.');
      return;
    }

    if (item.customizations && item.customizations.length > 0) {
      setSelectedItemForOptions(item);
      return;
    }
    const orderItem: OrderItem = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      selectedOptions: {},
    };
    addToCart(orderItem);
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      
      {/* Active Order Live Banner if any order is active */}
      {activePreparingOrder && (
        <div className="bg-slate-900 text-emerald-300 px-4 py-2.5 shadow-md sticky top-16 z-20 animate-fadeIn border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>
                طلبك الحالي <strong className="underline text-white">{activePreparingOrder.id}</strong>:{' '}
                {activePreparingOrder.status === 'ready'
                  ? 'جاهز للاستلام من البوفيه الآن! 🔔'
                  : activePreparingOrder.status === 'preparing'
                  ? 'جاري التحضير في البوفيه...'
                  : 'تم استلام الطلب'}
              </span>
            </div>

            <button
              onClick={() => setIsOrdersHistoryOpen(true)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs transition-colors shadow-xs"
            >
              متابعة حالة الطلب 👈
            </button>
          </div>
        </div>
      )}

      {/* Sleek Hero Header Section */}
      <section className="bg-slate-900 text-white pt-8 pb-14 px-4 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مرحبًا بك في بوفيه فادي ☕</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              منيو بوفيه فادي الإلكتروني <br className="hidden sm:inline" />
              <span className="text-emerald-400">
                اطلب مشروباتك ووجباتك واستلمها بدون انتظار
              </span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed font-medium">
              تخصيص الخيارات والإضافات (السكر، الحليب، الصوصات) وتتبع الطلب لحظة بلحظة.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث…"
              className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
              >
                مسح
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Menu Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
        
        {/* Single Closed Banner Notification under Header if Closed */}
        {!buffetStatus.isOpen && (
          <div className="bg-rose-50 rounded-2xl p-4 sm:p-5 border border-rose-200 text-rose-950 flex items-start gap-3.5 shadow-sm min-w-0 w-full animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-rose-950 leading-relaxed flex items-center gap-2">
                  <span>🔴 البوفيه مغلق حالياً — يمكنك استعراض المنيو والأسعار فقط</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-rose-800 leading-relaxed mt-1">
                  زر الإضافة والطلب معطل حالياً لأن البوفيه مغلق.
                </p>
              </div>

              {(buffetStatus.closureReason || buffetStatus.reopenTime) && (
                <div className="bg-rose-100/90 rounded-xl p-3 border border-rose-200 text-[11px] sm:text-xs text-rose-900 flex flex-col gap-1.5 mt-2">
                  {buffetStatus.closureReason && (
                    <p className="break-words leading-relaxed">
                      <strong className="text-rose-950 font-extrabold">السبب: </strong>
                      <span className="text-rose-900 font-medium">{buffetStatus.closureReason}</span>
                    </p>
                  )}
                  {buffetStatus.reopenTime && (
                    <p className="break-words leading-relaxed">
                      <strong className="text-rose-950 font-extrabold">وقت العودة المتوقع: </strong>
                      <span className="font-bold text-amber-800 underline">{buffetStatus.reopenTime}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Pills Bar */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-slate-200 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>جميع الأصناف ({menuItems.length})</span>
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = menuItems.filter((i) => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {categoryIconMap[cat.id]}
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span>قائمة المنيو</span>
              <span className="text-xs font-normal text-slate-500">
                ({filteredItems.length} صنف متاحة)
              </span>
            </h3>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">لم يتم العثور على أصناف تطابق بحثك</h4>
              <p className="text-xs text-slate-500 mt-1">جرب البحث بكلمة أخرى أو تغيير تصنيف المنيو</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const canOrder = buffetStatus.isOpen && item.isAvailable;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!buffetStatus.isOpen) {
                        alert('البوفيه مغلق حالياً، نعتذر عن استقبال الطلبات.');
                        return;
                      }
                      if (item.isAvailable) {
                        setSelectedItemForOptions(item);
                      }
                    }}
                    className={`group bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative ${
                      !canOrder ? 'opacity-75 cursor-not-allowed bg-slate-50' : 'hover:-translate-y-1 cursor-pointer'
                    }`}
                  >
                    {/* Photo & Badges */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          canOrder ? 'group-hover:scale-105' : 'grayscale-25'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                      {/* Category pill */}
                      <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                        {categories.find((c) => c.id === item.category)?.name}
                      </span>

                      {/* Status badge: Buffet closed or Out of stock or Price */}
                      {!buffetStatus.isOpen ? (
                        <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <Lock className="w-3 h-3" /> البوفيه مغلق
                        </span>
                      ) : !item.isAvailable ? (
                        <span className="absolute top-3 left-3 bg-amber-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                          نفذت الكمية 🚫
                        </span>
                      ) : (
                        <span className="absolute bottom-3 left-3 bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                          {item.price} ر.س
                        </span>
                      )}
                    </div>

                    {/* Body Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className={`font-extrabold text-sm text-slate-900 transition-colors ${
                          canOrder ? 'group-hover:text-emerald-600' : ''
                        }`}>
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Customizations Tag Preview */}
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.customizations.map((c) => (
                            <span
                              key={c.id}
                              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold"
                            >
                              ⚙️ {c.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        {buffetStatus.isOpen ? (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <span>انقر للطلب والتخصيص</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                            <span>الطلب غير متاح حالياً</span>
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={!canOrder}
                          onClick={(e) => handleQuickAdd(item, e)}
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                            canOrder
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                          title={buffetStatus.isOpen ? 'إضافة للسلة' : 'البوفيه مغلق حالياً'}
                        >
                          {buffetStatus.isOpen ? <Plus className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Item Options Modal */}
      {selectedItemForOptions && (
        <ItemOptionsModal
          item={selectedItemForOptions}
          onClose={() => setSelectedItemForOptions(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={(id) => {
          setLastPlacedOrderId(id);
          setIsOrdersHistoryOpen(true);
        }}
      />

      {/* Customer Orders Tracker Drawer */}
      <CustomerOrdersTracker
        isOpen={isOrdersHistoryOpen}
        onClose={() => setIsOrdersHistoryOpen(false)}
        highlightOrderId={lastPlacedOrderId}
      />

      {/* Floating Bottom Cart Bar for mobile / quick access */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-5 duration-300">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-900 hover:bg-slate-950 text-white py-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800 transition-all hover:scale-101"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </div>
              <div className="text-right">
                <span className="font-bold text-xs block text-white">إكمال طلب البوفيه</span>
                <span className="text-[10px] text-slate-400">انقر لإرسال الطلب للموظف</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-emerald-400">
                {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} ر.س
              </span>
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
          </button>
        </div>
      )}

    </div>
  );
};
