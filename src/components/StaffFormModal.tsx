import React, { useState } from 'react';
import { X, UserPlus, Phone, Shield, KeyRound } from 'lucide-react';
import { Staff, Role } from '../types';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStaff: (staffData: Omit<Staff, 'id' | 'createdAt'>) => void;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({ isOpen, onClose, onSaveStaff }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('كاشير');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) return;
    onSaveStaff({
      name: name.trim(),
      role,
      phone: phone.trim(),
      pin: pin.trim(),
      isAvailable: true,
    });
    setName('');
    setPhone('');
    setPin('');
    onClose();
  };

  return (
    <div id="staff-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>إضافة موظف جديد</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-300 mb-1 block">اسم الموظف</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: أحمد عبد الله"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 mb-1 block flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>الدور / الوظيفة</span>
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="كاشير">كاشير</option>
              <option value="مجهز بوفيه">مجهز بوفيه</option>
              <option value="مدير">مدير</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-300 mb-1 block flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-400" />
                <span>رقم الهاتف</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 mb-1 block flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-amber-400" />
                <span>رمز PIN للدخول</span>
              </label>
              <input
                type="text"
                required
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="أدخل رمز PIN"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono text-center tracking-wider focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all mt-2"
          >
            حفظ الموظف
          </button>
        </form>
      </div>
    </div>
  );
};
