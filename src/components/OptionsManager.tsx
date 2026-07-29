import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomizationGroup, OptionItem } from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  SlidersHorizontal,
  Layers,
  DollarSign,
  Link as LinkIcon,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

export const OptionsManager: React.FC = () => {
  const {
    optionGroups,
    menuItems,
    addOptionGroup,
    updateOptionGroup,
    deleteOptionGroup,
    toggleOptionGroupStatus,
    reorderOptionGroups,
    addOptionToGroup,
    updateOptionInGroup,
    deleteOptionFromGroup,
    toggleOptionAvailability,
    reorderOptionsInGroup,
    linkGroupToMenuItem,
    unlinkGroupFromMenuItem,
    showToastMessage,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroupIds, setExpandedGroupIds] = useState<Record<string, boolean>>({});

  // Group Modal states
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomizationGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<CustomizationGroup | null>(null);

  const [groupForm, setGroupForm] = useState({
    name: '',
    selectionType: 'single' as 'single' | 'multiple',
    isRequired: false,
    maxSelections: 1,
    status: 'active' as 'active' | 'hidden',
  });

  // Option Item Inline Modal/Form state
  const [editingOption, setEditingOption] = useState<{ groupId: string; option: OptionItem } | null>(null);
  const [newOptionForm, setNewOptionForm] = useState<{ groupId: string; name: string; price: number }>({
    groupId: '',
    name: '',
    price: 0,
  });

  // Link to Menu Modal
  const [linkingGroup, setLinkingGroup] = useState<CustomizationGroup | null>(null);

  // Toggle group accordion
  const toggleExpandGroup = (id: string) => {
    setExpandedGroupIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Group Modal
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      selectionType: 'single',
      isRequired: false,
      maxSelections: 1,
      status: 'active',
    });
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: CustomizationGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      selectionType: group.selectionType,
      isRequired: group.isRequired,
      maxSelections: group.maxSelections || 1,
      status: group.status,
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;

    if (editingGroup) {
      updateOptionGroup({
        ...editingGroup,
        name: groupForm.name.trim(),
        selectionType: groupForm.selectionType,
        isRequired: groupForm.isRequired,
        maxSelections: groupForm.selectionType === 'multiple' ? Number(groupForm.maxSelections) : undefined,
        status: groupForm.status,
      });
    } else {
      addOptionGroup({
        name: groupForm.name.trim(),
        selectionType: groupForm.selectionType,
        isRequired: groupForm.isRequired,
        maxSelections: groupForm.selectionType === 'multiple' ? Number(groupForm.maxSelections) : undefined,
        status: groupForm.status,
        options: [
          { id: `opt_1_${Date.now()}`, name: 'الخيار الأول', price: 0, isAvailable: true },
          { id: `opt_2_${Date.now()}`, name: 'الخيار الثاني', price: 0, isAvailable: true },
        ],
      });
    }

    setIsGroupModalOpen(false);
  };

  // Option Item Handlers
  const handleAddOptionSubmit = (groupId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionForm.name.trim()) return;

    addOptionToGroup(groupId, {
      name: newOptionForm.name.trim(),
      price: Number(newOptionForm.price) || 0,
      isAvailable: true,
    });

    setNewOptionForm({ groupId: '', name: '', price: 0 });
  };

  const handleUpdateOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOption || !editingOption.option.name.trim()) return;

    updateOptionInGroup(editingOption.groupId, editingOption.option);
    setEditingOption(null);
  };

  // Reordering groups
  const moveGroup = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= optionGroups.length) return;

    const newGroups = [...optionGroups];
    const temp = newGroups[index];
    newGroups[index] = newGroups[targetIndex];
    newGroups[targetIndex] = temp;
    reorderOptionGroups(newGroups);
  };

  // Reordering options inside group
  const moveOption = (group: CustomizationGroup, optIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? optIndex - 1 : optIndex + 1;
    if (targetIndex < 0 || targetIndex >= group.options.length) return;

    const newOpts = [...group.options];
    const temp = newOpts[optIndex];
    newOpts[optIndex] = newOpts[targetIndex];
    newOpts[targetIndex] = temp;
    reorderOptionsInGroup(group.id, newOpts);
  };

  // Filter groups
  const filteredGroups = optionGroups.filter((g) =>
    (g.name?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl border border-emerald-200/80">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>إدارة الإضافات والتخصيصات</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                {optionGroups.length} مجموعات
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              إضافة وتعديل خيارات المنتجات مثل (درجة السكر، الإضافات، الشطة، الجبن) وتحديد أسعارها ورابطها بالمنيو
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="البحث في المجموعات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
            <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <button
            onClick={handleOpenAddGroup}
            className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة مجموعة خيارات جديدة</span>
          </button>
        </div>
      </div>

      {/* Preset Examples Helper Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 border border-emerald-200/60 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>أمثلة شائعة: درجة السكر (بدون، مضبوط، زيادة) | الإضافات (نعناع، زنجبيل، هيل) | الصوصات (شطة، كاتشب، ثومية)</span>
        </div>
      </div>

      {/* Option Groups List */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">لا توجد مجموعات خيارات مطابقة</h4>
            <p className="text-xs text-slate-400">أنشئ مجموعتك الأولى وتخصيص إضافات المشروبات والمأكولات بسهولة</p>
            <button
              onClick={handleOpenAddGroup}
              className="mt-2 py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مجموعة الآن</span>
            </button>
          </div>
        ) : (
          filteredGroups.map((group, index) => {
            const isExpanded = expandedGroupIds[group.id] ?? true;
            const linkedItemsCount = menuItems.filter((m) =>
              m.customizationGroupIds?.includes(group.id)
            ).length;

            return (
              <div
                key={group.id}
                className={`bg-white rounded-3xl border transition-all duration-200 shadow-xs overflow-hidden ${
                  group.status === 'hidden'
                    ? 'border-slate-200 opacity-60 bg-slate-50/50'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                {/* Group Card Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpandGroup(group.id)}
                      className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm">{group.name}</h4>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            group.selectionType === 'single'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {group.selectionType === 'single' ? 'اختيار مفرد (Radio)' : 'اختيار متعدد (Checkboxes)'}
                        </span>

                        {group.isRequired ? (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                            إجباري
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                            اختياري
                          </span>
                        )}

                        {group.status === 'hidden' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                            مخفي عن العملاء
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>عدد الخيارات: <strong>{group.options.length}</strong></span>
                        <span>•</span>
                        <span>
                          مرتبط بـ: <strong>{linkedItemsCount} منتجات بالمنيو</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Group Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {/* Ordering controls */}
                    <button
                      onClick={() => moveGroup(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveGroup(index, 'down')}
                      disabled={index === optionGroups.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setLinkingGroup(group)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-all flex items-center gap-1"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ربط بالمنتجات ({linkedItemsCount})</span>
                    </button>

                    <button
                      onClick={() => toggleOptionGroupStatus(group.id)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        group.status === 'active'
                          ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                      title={group.status === 'active' ? 'إخفاء عن العملاء' : 'إظهار للعملاء'}
                    >
                      {group.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleOpenEditGroup(group)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="تعديل اسم ومواصفات المجموعة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setGroupToDelete(group)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                      title="حذف المجموعة بالكامل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Group Options Content Area */}
                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {/* List of Option Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {group.options.map((opt, optIdx) => {
                        const isEditingThis =
                          editingOption?.groupId === group.id && editingOption?.option.id === opt.id;

                        if (isEditingThis) {
                          return (
                            <form
                              key={opt.id}
                              onSubmit={handleUpdateOptionSubmit}
                              className="p-3 rounded-2xl bg-amber-50/80 border-2 border-amber-400 space-y-2 col-span-1"
                            >
                              <div className="text-[11px] font-bold text-amber-900">تعديل الخيار</div>
                              <input
                                type="text"
                                value={editingOption.option.name}
                                onChange={(e) =>
                                  setEditingOption({
                                    ...editingOption,
                                    option: { ...editingOption.option, name: e.target.value },
                                  })
                                }
                                className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 text-xs font-bold bg-white"
                                required
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-600">السعر الإضافي:</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={editingOption.option.price}
                                  onChange={(e) =>
                                    setEditingOption({
                                      ...editingOption,
                                      option: {
                                        ...editingOption.option,
                                        price: Number(e.target.value),
                                      },
                                    })
                                  }
                                  className="w-20 px-2 py-1 rounded-xl border border-amber-300 text-xs font-bold bg-white"
                                />
                                <span className="text-[11px] text-slate-600">ر.س</span>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingOption(null)}
                                  className="px-2.5 py-1 rounded-lg text-slate-600 font-bold text-xs hover:bg-amber-100"
                                >
                                  إلغاء
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                                >
                                  حفظ
                                </button>
                              </div>
                            </form>
                          );
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                              opt.isAvailable
                                ? 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                                : 'bg-rose-50/50 border-rose-200 text-rose-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-slate-900 block truncate">
                                  {opt.name}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-extrabold block">
                                  {opt.price > 0 ? `+${opt.price} ر.س` : 'مجاني (0 ر.س)'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Option ordering */}
                              <button
                                type="button"
                                onClick={() => moveOption(group, optIdx, 'up')}
                                disabled={optIdx === 0}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveOption(group, optIdx, 'down')}
                                disabled={optIdx === group.options.length - 1}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>

                              {/* Toggle availability */}
                              <button
                                type="button"
                                onClick={() => toggleOptionAvailability(group.id, opt.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                  opt.isAvailable
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                                    : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'
                                }`}
                                title="تغيير توفر الخيار"
                              >
                                {opt.isAvailable ? 'متوفر' : 'غير متوفر'}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setEditingOption({
                                    groupId: group.id,
                                    option: { ...opt },
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200"
                                title="تعديل الاسم والسعر"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteOptionFromGroup(group.id, opt.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100"
                                title="حذف الخيار"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Inline Quick Add Option Form */}
                    <form
                      onSubmit={(e) => handleAddOptionSubmit(group.id, e)}
                      className="p-3 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-300 flex flex-col sm:flex-row items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="اسم الخيار الجديد (مثال: جبن إضافي، نعناع، شطة...)"
                        value={newOptionForm.groupId === group.id ? newOptionForm.name : ''}
                        onChange={(e) =>
                          setNewOptionForm({
                            groupId: group.id,
                            name: e.target.value,
                            price: newOptionForm.groupId === group.id ? newOptionForm.price : 0,
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                        required
                      />

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-slate-700">السعر:</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          value={newOptionForm.groupId === group.id ? newOptionForm.price : ''}
                          onChange={(e) =>
                            setNewOptionForm({
                              groupId: group.id,
                              name: newOptionForm.groupId === group.id ? newOptionForm.name : '',
                              price: Number(e.target.value),
                            })
                          }
                          className="w-20 px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                        />
                        <span className="text-xs font-bold text-slate-600">ر.س</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>إضافة الخيار</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                <span>{editingGroup ? 'تعديل مجموعة الخيارات' : 'إضافة مجموعة خيارات جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  اسم مجموعة الخيارات <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: درجة السكر، نوع الخبز، الصوصات، الإضافات..."
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  نوع الاختيار للعميل
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGroupForm({ ...groupForm, selectionType: 'single' })}
                    className={`p-3 rounded-xl border text-xs font-bold text-right flex flex-col gap-1 transition-all ${
                      groupForm.selectionType === 'single'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>اختيار مفرد (Single)</span>
                    <span className="text-[10px] text-slate-500 font-normal">يختار العميل خياراً واحداً فقط (Radio button)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGroupForm({ ...groupForm, selectionType: 'multiple' })}
                    className={`p-3 rounded-xl border text-xs font-bold text-right flex flex-col gap-1 transition-all ${
                      groupForm.selectionType === 'multiple'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>اختيار متعدد (Multiple)</span>
                    <span className="text-[10px] text-slate-500 font-normal">يمكن للعميل تحديد أكثر من خيار (Checkboxes)</span>
                  </button>
                </div>
              </div>

              {groupForm.selectionType === 'multiple' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    الحد الأقصى للاختيارات المتعددة
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={groupForm.maxSelections}
                    onChange={(e) => setGroupForm({ ...groupForm, maxSelections: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">اتركه 0 أو فارغاً لفتح عدد الاختيارات دون حد أقصى</p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="block text-xs font-bold text-slate-800">إلزامية الاختيار (إجباري)</span>
                  <span className="text-[10px] text-slate-500">هل يلزم العميل بتحديد خيار قبل إتاحة الإضافة للسلة؟</span>
                </div>
                <input
                  type="checkbox"
                  checked={groupForm.isRequired}
                  onChange={(e) => setGroupForm({ ...groupForm, isRequired: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded-md cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="block text-xs font-bold text-slate-800">حالة ظهور المجموعة</span>
                  <span className="text-[10px] text-slate-500">إتاحة ظهور هذه التخصيصات للعميل</span>
                </div>
                <select
                  value={groupForm.status}
                  onChange={(e) => setGroupForm({ ...groupForm, status: e.target.value as 'active' | 'hidden' })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="active">مفعلة (مظاهرة)</option>
                  <option value="hidden">مخفية مؤقتاً</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md"
                >
                  حفظ المجموعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-100 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">حذف مجموعة الخيارات؟</h4>
              <p className="text-xs text-slate-500">
                هل أنت تأكد من حذف "{groupToDelete.name}"؟ سيتم إلغاء ربطها بجميع المنتجات بالمنيو.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setGroupToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                تراجع
              </button>
              <button
                onClick={() => {
                  deleteOptionGroup(groupToDelete.id);
                  setGroupToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Group to Menu Items Modal */}
      {linkingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-emerald-400" />
                  <span>ربط مجموعة "{linkingGroup.name}" بمنتجات المنيو</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  حدد الوجبات والمشروبات التي تود أن تظهر لها هذه الخيارات
                </p>
              </div>
              <button
                onClick={() => setLinkingGroup(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {menuItems.map((item) => {
                const isLinked = item.customizationGroupIds?.includes(linkingGroup.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isLinked) {
                        unlinkGroupFromMenuItem(item.id, linkingGroup.id);
                      } else {
                        linkGroupToMenuItem(item.id, linkingGroup.id);
                      }
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isLinked
                        ? 'bg-emerald-50/80 border-emerald-500/80 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-xs font-black block">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{item.price} ر.س</span>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                        isLinked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isLinked && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">
                تم الربط مع{' '}
                {menuItems.filter((m) => m.customizationGroupIds?.includes(linkingGroup.id)).length} منتج
              </span>

              <button
                onClick={() => setLinkingGroup(null)}
                className="py-2 px-5 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
              >
                تم الإغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
