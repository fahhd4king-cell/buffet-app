import React, { useState } from 'react';
import { X, Plus, Minus, Check, ShoppingBag, MessageSquare } from 'lucide-react';
import { Product, AddonOption, CartItemAddon } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  currency: string;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedAddons: CartItemAddon[], notes: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<CartItemAddon[]>([]);
  const [notes, setNotes] = useState<string>('');

  if (!product) return null;

  const toggleAddon = (addon: AddonOption) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, { id: addon.id, name: addon.name, price: addon.price }]);
    }
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = product.price + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedAddons, notes);
    onClose();
  };

  return (
    <div id="modal-product-detail-backdrop" className="fixed inset-0 z-50 bg-[#0B0F17]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        id="modal-product-detail-card"
        className="bg-[#0B0F17] border border-[#F7B500]/30 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up"
      >
        {/* Header with image/cover */}
        <div className="relative bg-[#121926] h-44 w-full flex items-center justify-center overflow-hidden border-b border-[#1E293D]">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-4xl font-tajawal font-black text-[#F7B500]/30 tracking-widest">{product.name.slice(0, 2)}</div>
          )}
          <button
            id="btn-close-product-modal"
            onClick={onClose}
            className="absolute top-3 left-3 p-2 bg-[#0B0F17]/80 text-[#A8B3C7] rounded-full hover:text-white backdrop-blur-md border border-[#F7B500]/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-tajawal font-bold text-[#FFFFFF]">{product.name}</h2>
              <span className="text-[#FFD66B] font-tajawal font-black text-base whitespace-nowrap bg-[#F7B500]/10 px-3 py-1 rounded-xl border border-[#F7B500]/30">
                {product.price} {currency}
              </span>
            </div>
            {product.description && (
              <p className="text-xs text-[#A8B3C7] mt-1.5 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Addons Section */}
          {product.addons && product.addons.length > 0 && (
            <div className="border-t border-[#1E293D] pt-3.5">
              <h3 className="text-xs font-tajawal font-bold text-[#FFFFFF] mb-2.5 flex items-center gap-1.5">
                <span>الإضافات المتاحة</span>
                <span className="text-[10px] text-[#A8B3C7] font-normal">(اختياري)</span>
              </h3>
              <div className="space-y-2">
                {product.addons.map(addon => {
                  const isSelected = selectedAddons.some(a => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-right cursor-pointer ${
                        isSelected
                          ? 'bg-[#F7B500]/15 border-[#F7B500] text-[#FFFFFF]'
                          : 'bg-[#121926] border-[#1E293D] text-[#A8B3C7] hover:bg-[#1E293D]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-[#F7B500] border-[#F7B500] text-[#0B0F17]'
                              : 'border-[#1E293D] bg-[#0B0F17]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold">{addon.name}</span>
                      </div>
                      <span className="text-xs text-[#FFD66B] font-tajawal font-bold">
                        +{addon.price} {currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes & Quick Options */}
          <div className="border-t border-[#1E293D] pt-3.5 space-y-2.5">
            <label className="text-xs font-tajawal font-bold text-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#F7B500]" />
                <span>ملاحظات وتفضيلات خاصة</span>
              </div>
              <span className="text-[10px] text-[#A8B3C7] font-normal">تخصيص الطلب</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: بدون سكر، حار جداً، بدون شطة..."
              className="w-full bg-[#121926] border border-[#F7B500]/20 rounded-2xl px-3.5 py-2.5 text-xs text-[#FFFFFF] placeholder-[#A8B3C7] focus:outline-none focus:border-[#F7B500]"
            />
            {/* Quick Preference Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['بدون شطة', 'زيادة جبن', 'بدون صوص', 'بدون سكر', 'زيادة ثوم', 'سفري مغلف'].map(tag => {
                const isActive = notes.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        setNotes(notes.replace(tag, '').replace(/\s+,\s+|,/g, ' ').trim());
                      } else {
                        setNotes(notes ? `${notes}, ${tag}` : tag);
                      }
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-xl border font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#F7B500] text-[#0B0F17] border-[#F7B500] font-tajawal font-black'
                        : 'bg-[#121926] text-[#A8B3C7] border-[#1E293D] hover:bg-[#1E293D]'
                    }`}
                  >
                    {isActive ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between border-t border-[#1E293D] pt-4">
            <span className="text-xs font-tajawal font-bold text-[#FFFFFF]">الكمية</span>
            <div className="flex items-center gap-3 bg-[#121926] p-1.5 rounded-2xl border border-[#F7B500]/20">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-[#0B0F17] hover:bg-[#1E293D] active:scale-95 text-[#A8B3C7] flex items-center justify-center transition-all cursor-pointer border border-[#1E293D]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-tajawal font-black text-sm text-[#FFD66B] min-w-[20px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#F7B500] to-[#FFD66B] active:scale-95 text-[#0B0F17] flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-[#0B0F17] border-t border-[#1E293D]">
          <button
            id="btn-confirm-add-to-cart"
            disabled={product.isOutOfStock || product.isAvailable === false}
            onClick={handleAdd}
            className={`w-full py-3.5 font-tajawal font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-between px-5 cursor-pointer ${
              product.isOutOfStock || product.isAvailable === false
                ? 'bg-[#1E293D] text-[#A8B3C7] cursor-not-allowed border border-[#1E293D]'
                : 'bg-gradient-to-r from-[#F7B500] to-[#FFD66B] hover:opacity-95 active:scale-98 text-[#0B0F17]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>
                {product.isOutOfStock || product.isAvailable === false
                  ? 'المنتج نفد حالياً غير متوفر'
                  : 'إضافة إلى السلة'}
              </span>
            </div>
            <span>
              {totalPrice} {currency}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
