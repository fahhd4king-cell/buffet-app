import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, CustomizationGroup } from '../types';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, Check, MessageSquare, AlertCircle } from 'lucide-react';

interface ItemOptionsModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (orderItem: OrderItem) => void;
}

export const ItemOptionsModal: React.FC<ItemOptionsModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  const { optionGroups, showToastMessage } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter relevant active customization groups for this item
  const relevantGroups = useMemo(() => {
    if (!item.customizationGroupIds || item.customizationGroupIds.length === 0) {
      return [];
    }
    return optionGroups.filter(
      (g) => item.customizationGroupIds?.includes(g.id) && g.status === 'active'
    );
  }, [item.customizationGroupIds, optionGroups]);

  // Initial single-select options state: groupId -> optionId
  const [selectedSingleOptions, setSelectedSingleOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (item.customizationGroupIds) {
      optionGroups.forEach((group) => {
        if (
          item.customizationGroupIds?.includes(group.id) &&
          group.status === 'active' &&
          group.selectionType === 'single'
        ) {
          const available = group.options.filter((o) => o.isAvailable);
          if (available.length > 0) {
            initial[group.id] = available[0].id;
          }
        }
      });
    }
    return initial;
  });

  // Initial multiple-select options state: groupId -> optionId[]
  const [selectedMultipleOptions, setSelectedMultipleOptions] = useState<Record<string, string[]>>({});

  // Single choice handler
  const handleSingleSelect = (groupId: string, optionId: string) => {
    setValidationError(null);
    setSelectedSingleOptions((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  };

  // Multiple choice handler
  const handleMultipleToggle = (group: CustomizationGroup, optionId: string) => {
    setValidationError(null);
    setSelectedMultipleOptions((prev) => {
      const current = prev[group.id] || [];
      if (current.includes(optionId)) {
        return {
          ...prev,
          [group.id]: current.filter((id) => id !== optionId),
        };
      } else {
        if (group.maxSelections && current.length >= group.maxSelections) {
          showToastMessage(`الحد الأقصى لخيارات "${group.name}" هو ${group.maxSelections} خيارات فقط`, 'warning');
          return prev;
        }
        return {
          ...prev,
          [group.id]: [...current, optionId],
        };
      }
    });
  };

  // Calculate Extra Price for selected options
  const extraOptionsPrice = useMemo(() => {
    let extra = 0;
    relevantGroups.forEach((group) => {
      if (group.selectionType === 'single') {
        const selectedId = selectedSingleOptions[group.id];
        if (selectedId) {
          const opt = group.options.find((o) => o.id === selectedId);
          if (opt && opt.isAvailable) extra += opt.price;
        }
      } else {
        const selectedIds = selectedMultipleOptions[group.id] || [];
        selectedIds.forEach((id) => {
          const opt = group.options.find((o) => o.id === id);
          if (opt && opt.isAvailable) extra += opt.price;
        });
      }
    });
    return extra;
  }, [relevantGroups, selectedSingleOptions, selectedMultipleOptions]);

  const unitPrice = item.price + extraOptionsPrice;
  const totalPrice = unitPrice * quantity;

  // Submit Handler
  const handleAdd = () => {
    // Validate required groups
    for (const group of relevantGroups) {
      if (group.isRequired) {
        if (group.selectionType === 'single') {
          if (!selectedSingleOptions[group.id]) {
            setValidationError(`يرجى اختيار قيمة لمجموعة "${group.name}" الإجبارية`);
            return;
          }
        } else {
          const selected = selectedMultipleOptions[group.id] || [];
          if (selected.length === 0) {
            setValidationError(`يرجى اختيار خيار واحد على الأقل في "${group.name}" الإجبارية`);
            return;
          }
        }
      }
    }

    // Format selected options for display
    const formattedOptions: Record<string, string> = {};

    relevantGroups.forEach((group) => {
      if (group.selectionType === 'single') {
        const optId = selectedSingleOptions[group.id];
        const opt = group.options.find((o) => o.id === optId);
        if (opt && opt.isAvailable) {
          formattedOptions[group.name] = opt.price > 0 ? `${opt.name} (+${opt.price} ر.س)` : opt.name;
        }
      } else {
        const optIds = selectedMultipleOptions[group.id] || [];
        if (optIds.length > 0) {
          const optNames = optIds
            .map((id) => group.options.find((o) => o.id === id))
            .filter((o): o is NonNullable<typeof o> => Boolean(o && o.isAvailable))
            .map((o) => (o.price > 0 ? `${o.name} (+${o.price} ر.س)` : o.name));
          if (optNames.length > 0) {
            formattedOptions[group.name] = optNames.join(', ');
          }
        }
      }
    });

    // Fallback for legacy items
    if (relevantGroups.length === 0 && item.customizations) {
      item.customizations.forEach((c) => {
        formattedOptions[c.name] = c.defaultOption || c.options[0];
      });
    }

    const orderItem: OrderItem = {
      menuItemId: item.id,
      name: item.name,
      price: unitPrice,
      quantity,
      selectedOptions: formattedOptions,
      itemNotes: itemNotes.trim() ? itemNotes.trim() : undefined,
    };

    onAddToCart(orderItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header Image & Close */}
        <div className="relative h-44 bg-slate-100 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center backdrop-blur-md transition-colors shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 right-4 left-4 text-white flex items-end justify-between">
            <div>
              <h3 className="text-xl font-bold text-white drop-shadow-sm">{item.name}</h3>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{item.description}</p>
            </div>
            <div className="text-left shrink-0">
              <span className="text-xs bg-emerald-500 text-white font-extrabold px-3 py-1 rounded-full shadow-md">
                الأساسي: {item.price} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* Validation error banner */}
        {validationError && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Customization Groups */}
          {relevantGroups.length > 0 ? (
            <div className="space-y-5">
              {relevantGroups.map((group) => {
                const availableOptions = group.options.filter((o) => o.isAvailable);
                if (availableOptions.length === 0) return null;

                const isSingle = group.selectionType === 'single';
                const selectedIds = isSingle
                  ? [selectedSingleOptions[group.id]]
                  : selectedMultipleOptions[group.id] || [];

                return (
                  <div key={group.id} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-black text-slate-900">
                          {group.name}
                        </label>
                        {group.isRequired ? (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md">
                            إجباري
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                            اختياري
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-500 font-medium">
                        {isSingle
                          ? 'اختر خياراً واحداً'
                          : group.maxSelections
                          ? `اختر حتى ${group.maxSelections} خيارات`
                          : 'يمكن اختيار عدة خيارات'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {availableOptions.map((opt) => {
                        const isSelected = selectedIds.includes(opt.id);

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              isSingle
                                ? handleSingleSelect(group.id, opt.id)
                                : handleMultipleToggle(group, opt.id)
                            }
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all border text-right ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <div
                                className={`w-3.5 h-3.5 rounded-${
                                  isSingle ? 'full' : 'md'
                                } border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-white bg-white/20'
                                    : 'border-slate-300 bg-slate-50'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                              </div>
                              <span className="truncate">{opt.name}</span>
                            </div>

                            <span
                              className={`text-[10px] shrink-0 font-bold mr-1 ${
                                isSelected ? 'text-emerald-100' : 'text-emerald-700'
                              }`}
                            >
                              {opt.price > 0 ? `+${opt.price} ر.س` : 'مجاني'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : item.customizations && item.customizations.length > 0 ? (
            /* Fallback for legacy static customizations */
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {item.customizations.map((custom) => (
                <div key={custom.id} className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    {custom.name}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {custom.options.map((opt) => {
                      const isSelected = selectedSingleOptions[custom.name] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSingleSelect(custom.name, opt)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-2xs'
                              : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mr-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Special Notes Input */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>ملاحظات خاصة على هذا الطلب</span>
            </label>
            <input
              type="text"
              placeholder="مثال: بدون سكر، زيادة ثلج، سادة..."
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50/50"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700">الكمية</span>
            <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 text-white">
          <div>
            <span className="text-[10px] text-slate-400 block">إجمالي الصنف ({quantity})</span>
            <span className="text-lg font-black text-emerald-400">
              {totalPrice} ر.س
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-101 active:scale-99 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>إضافة إلى السلة ({totalPrice} ر.س)</span>
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

      </div>
    </div>
  );
};
