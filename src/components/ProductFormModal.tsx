import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Utensils, Sparkles } from 'lucide-react';
import { Category, Product, AddonOption } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Toast } from './Toast';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (category: { name: string; icon?: string }) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSaveCategory,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('☕');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveCategory({ name: name.trim(), icon });
    setName('');
    onClose();
  };

  const quickIcons = ['☕', '🍵', '🥤', '🥪', '🍰', '🥐', '🍏', '🍕', '🍔', '🍦'];

  return (
    <div id="category-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-amber-400" />
            <span>إضافة تصنيف جديد</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">اسم التصنيف</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: المشروبات الساخنة، الوجبات، الخ..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">الأيقونة (تأثير بصري)</label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {quickIcons.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIcon(item)}
                  className={`p-2 text-base rounded-xl border ${
                    icon === item ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all mt-2"
          >
            حفظ التصنيف
          </button>
        </form>
      </div>
    </div>
  );
};

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialProduct?: Product | null;
  onSaveProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => void;
  currency: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialProduct,
  onSaveProduct,
  currency,
}) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || (categories[0]?.id || ''));
  const [price, setPrice] = useState<string>(initialProduct?.price ? String(initialProduct.price) : '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || '');
  const [addons, setAddons] = useState<AddonOption[]>(initialProduct?.addons || []);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [deletingAddonId, setDeletingAddonId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddAddon = () => {
    if (!addonName.trim()) return;
    const priceNum = parseFloat(addonPrice) || 0;
    setAddons([
      ...addons,
      {
        id: 'addon_' + Date.now(),
        name: addonName.trim(),
        price: priceNum,
      },
    ]);
    setAddonName('');
    setAddonPrice('');
  };

  const confirmRemoveAddon = () => {
    if (!deletingAddonId) return;
    setAddons(prev => prev.filter(a => a.id !== deletingAddonId));
    setDeletingAddonId(null);
    setToastMessage('تم الحذف بنجاح.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    const priceNum = parseFloat(price) || 0;

    onSaveProduct({
      name: name.trim(),
      categoryId,
      price: priceNum,
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      isAvailable: true,
      addons,
    });
    onClose();
  };

  return (
    <div id="product-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>{initialProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* Category Selector */}
          <div>
            <label className="font-semibold text-slate-300 mb-1 block">التصنيف</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name & Price */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="font-semibold text-slate-300 mb-1 block">اسم الصنف</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثال: شاي عدني، كابتشينو..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 mb-1 block">السعر ({currency})</label>
              <input
                type="number"
                step="0.5"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-slate-300 mb-1 block">الوصف</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="وصف اختياري للمنتج أو مكوناته..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="font-semibold text-slate-300 mb-1 block">رابط الصورة (اختياري)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Addons Section */}
          <div className="border-t border-slate-800 pt-3">
            <label className="font-bold text-slate-300 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>الإضافات والخيارات (اختياري)</span>
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={addonName}
                onChange={e => setAddonName(e.target.value)}
                placeholder="اسم الإضافة (مثال: سكر زياده)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
              />
              <input
                type="number"
                step="0.5"
                value={addonPrice}
                onChange={e => setAddonPrice(e.target.value)}
                placeholder="السعر"
                className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100 placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleAddAddon}
                className="p-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {addons.length > 0 && (
              <div className="space-y-1">
                {addons.map(addon => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between p-2 bg-slate-800/80 rounded-xl border border-slate-700/60"
                  >
                    <span>
                      {addon.name} (+{addon.price} {currency})
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeletingAddonId(addon.id)}
                      className="text-[#F44336] hover:text-[#F44336]/80 p-1 cursor-pointer"
                      title="حذف الإضافة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#F5B31B] hover:opacity-95 text-[#070B1A] font-extrabold text-xs rounded-2xl shadow-lg transition-all mt-3 cursor-pointer"
          >
            {initialProduct ? 'تحديث المنتج' : 'حفظ المنتج'}
          </button>
        </form>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deletingAddonId}
        onClose={() => setDeletingAddonId(null)}
        onConfirm={confirmRemoveAddon}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذه الإضافة؟ لا يمكن التراجع عن هذه العملية."
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};
