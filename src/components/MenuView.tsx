import React, { useState } from 'react';
import { Search, Plus, Utensils, Sparkles, Filter, AlertCircle, Power, Clock } from 'lucide-react';
import { Category, Product, BuffetSettings } from '../types';
import { UserMode } from '../services/session';
import { EmptyState } from './EmptyState';

interface MenuViewProps {
  categories: Category[];
  products: Product[];
  settings: BuffetSettings;
  userMode?: UserMode;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onNavigateToManager: () => void;
  onToggleStatus: (newStatus: boolean) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  categories,
  products,
  settings,
  userMode = 'customer',
  onSelectProduct,
  onQuickAdd,
  onNavigateToManager,
  onToggleStatus,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [closedToast, setClosedToast] = useState(false);

  const isOpen = settings.isOpen !== false;

  // Filter products by category & search query
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product: Product) => {
    if (!isOpen) {
      setClosedToast(true);
      setTimeout(() => setClosedToast(false), 3500);
      return;
    }
    onSelectProduct(product);
  };

  const handleAddClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!isOpen) {
      setClosedToast(true);
      setTimeout(() => setClosedToast(false), 3500);
      return;
    }
    if (product.addons && product.addons.length > 0) {
      onSelectProduct(product);
    } else {
      onQuickAdd(product);
    }
  };

  return (
    <div id="view-menu" className="p-4 space-y-4 max-w-md mx-auto pb-24 relative">
      {/* Closed Buffet Notice Banner */}
      {!isOpen && (
        <div className="bg-gradient-to-r from-rose-950/90 via-[#111827] to-[#111827] border border-rose-500/40 p-3.5 rounded-[20px] space-y-2.5 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-400 font-black text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 animate-bounce text-rose-400" />
              <span>البوفيه مغلق حالياً ومُتوقف عن الطلبات</span>
            </div>
            {userMode === 'admin' && (
              <button
                id="btn-reopen-buffet-menu"
                onClick={() => onToggleStatus(true)}
                className="bg-[#18D26E] hover:opacity-90 text-[#070B1A] px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <Power className="w-3 h-3" />
                <span>إعادة الفتح</span>
              </button>
            )}
          </div>

          <div className="bg-[#070B1A]/80 border border-rose-500/20 rounded-[14px] p-2.5 space-y-1 text-xs">
            {settings.closedReason && (
              <div className="flex items-center gap-1.5 text-slate-200">
                <span className="text-[#A8B3C7] font-bold">سبب الإغلاق:</span>
                <span className="text-[#F5B31B] font-extrabold">{settings.closedReason}</span>
              </div>
            )}
            {settings.reopenTime && (
              <div className="flex items-center gap-1.5 text-slate-200">
                <Clock className="w-3.5 h-3.5 text-[#18D26E] shrink-0" />
                <span className="text-[#A8B3C7] font-bold">موعد الفتح المتوقع:</span>
                <span className="text-[#18D26E] font-black">{settings.reopenTime}</span>
              </div>
            )}
            {!settings.closedReason && !settings.reopenTime && (
              <p className="text-[11px] text-[#A8B3C7]">
                اعتذاراً، تم إغلاق استقبال الطلبات الجديدة مؤقتاً. يمكنك استعراض القائمة وسنعود قريباً.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Closed Toast Alert */}
      {closedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce border border-rose-400 max-w-[90vw]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>عذراً، البوفيه مغلق حالياً ولا يمكن إضافة طلبات جديدة!</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#A8B3C7] absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="input-search-menu"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث عن مشروب، وجبة، إضافات..."
          className="w-full bg-[#111827] border border-[#F5B31B]/20 rounded-[18px] pr-10 pl-4 py-3 text-xs text-[#FFFFFF] placeholder-[#A8B3C7] focus:outline-none focus:border-[#F5B31B] transition-all shadow-inner"
        />
      </div>

      {/* Category Chips (Horizontal Scroll) */}
      {categories.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
          <button
            key="all"
            onClick={() => setSelectedCategoryId('all')}
            className={`whitespace-nowrap px-4 py-2.5 rounded-[16px] text-xs font-tajawal font-bold transition-all border cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-gradient-to-r from-[#F5B31B] to-[#FFD66B] text-[#070B1A] border-[#FFD66B] shadow-lg shadow-[#F5B31B]/20'
                : 'bg-[#111827] text-[#A8B3C7] border-[#F5B31B]/15 hover:text-[#FFFFFF] hover:border-[#F5B31B]/30'
            }`}
          >
            الكل ({products.length})
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-[16px] text-xs font-tajawal font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-gradient-to-r from-[#F5B31B] to-[#FFD66B] text-[#070B1A] border-[#FFD66B] shadow-lg shadow-[#F5B31B]/20'
                    : 'bg-[#111827] text-[#A8B3C7] border-[#F5B31B]/15 hover:text-[#FFFFFF] hover:border-[#F5B31B]/30'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#F5B31B]/20 p-4 rounded-[18px] flex items-center justify-between text-xs text-[#FFD66B]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 shrink-0" />
            <span>
              {userMode === 'admin'
                ? 'لا توجد تصنيفات حالياً. ابدأ بإضافة تصنيفات للمنيو.'
                : 'لا توجد تصنيفات حالياً.'}
            </span>
          </div>
          {userMode === 'admin' && (
            <button
              onClick={onNavigateToManager}
              className="text-[11px] font-bold bg-[#F5B31B] text-[#070B1A] px-3 py-1.5 rounded-xl shrink-0 cursor-pointer"
            >
              إضافة تصنيف
            </button>
          )}
        </div>
      )}

      {/* Products Display */}
      {products.length === 0 ? (
        <EmptyState
          id="empty-state-menu"
          icon={Utensils}
          title="المنيو فارغ حالياً"
          description={
            userMode === 'admin'
              ? 'لم يتم إضافة أي منتجات أو مشروبات بعد. يمكنك إضافة أصناف جديدة عبر لوحة الإدارة.'
              : 'لم تتم إضافة أي أصناف حتى الآن، يرجى المحاولة لاحقًا.'
          }
          actionText={userMode === 'admin' ? 'انتقل إلى لوحة الإدارة لإضافة منتجات' : undefined}
          onAction={userMode === 'admin' ? onNavigateToManager : undefined}
        />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-[#A8B3C7]">
          <p className="text-xs font-medium">لا توجد نتائج مطابقة للبحث أو التصنيف المحدد</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredProducts.map(product => {
            const isOutOfStock = product.isOutOfStock || product.isAvailable === false;
            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && handleProductClick(product)}
                className={`bg-[#121926] border border-[#F7B500]/15 rounded-3xl p-3.5 flex flex-col justify-between transition-all shadow-md ${
                  isOutOfStock
                    ? 'opacity-60 cursor-not-allowed bg-[#0B0F17]'
                    : 'hover:border-[#F7B500]/40 active:scale-[0.98] cursor-pointer group'
                }`}
              >
                <div>
                  {/* Product Image / Icon Box */}
                  <div className="w-full h-32 bg-[#0B0F17] rounded-2xl mb-3 overflow-hidden relative flex items-center justify-center border border-[#1E293D]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`w-full h-full object-cover ${
                          isOutOfStock ? 'grayscale' : 'group-hover:scale-105 transition-transform duration-300'
                        }`}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#F7B500]/10 border border-[#F7B500]/30 flex items-center justify-center text-[#F7B500] font-tajawal font-black text-xl shadow-inner">
                        {product.name.slice(0, 2)}
                      </div>
                    )}

                    {/* Out of Stock Overlay Badge */}
                    {isOutOfStock ? (
                      <span className="absolute inset-x-2 bottom-2 bg-[#F44336]/90 text-[#FFFFFF] text-[10px] font-black py-1 px-2 rounded-xl text-center backdrop-blur-md shadow-md border border-[#F44336]">
                        نفد الكمية مؤقتاً 🚫
                      </span>
                    ) : product.addons && product.addons.length > 0 ? (
                      <span className="absolute top-2 left-2 bg-[#0B0F17]/90 backdrop-blur-md text-[#FFD66B] text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-[#F7B500]/30">
                        <Sparkles className="w-2.5 h-2.5 text-[#F7B500]" />
                        <span>إضافات</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Product Name & Description */}
                  <h3 className="text-xs font-tajawal font-bold text-[#FFFFFF] line-clamp-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-[10px] text-[#A8B3C7] line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Price & Quick Add */}
                <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#1E293D]">
                  <span className="text-xs font-tajawal font-black text-[#FFD66B] bg-[#F7B500]/10 px-2.5 py-1 rounded-xl border border-[#F7B500]/20">
                    {product.price} {settings.currency}
                  </span>
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={e => !isOutOfStock && handleAddClick(e, product)}
                    className={`h-8 px-3 rounded-xl font-tajawal font-black text-[11px] flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-[#1E293D] text-[#A8B3C7] cursor-not-allowed border border-[#1E293D]'
                        : 'bg-gradient-to-r from-[#F7B500] to-[#FFD66B] hover:opacity-95 active:scale-90 text-[#0B0F17]'
                    }`}
                    title={isOutOfStock ? 'غير متوفر حالياً' : 'إضافة للسلة'}
                  >
                    {isOutOfStock ? (
                      <span>نفد</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-[#0B0F17] stroke-[3]" />
                        <span>إضافة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
