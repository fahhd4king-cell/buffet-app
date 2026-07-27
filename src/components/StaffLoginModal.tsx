import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, User, Lock, X, LogIn, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (role: 'admin' | 'employee') => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const { loginStaff, showToastMessage } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('يرجى كتابة اسم المستخدم وكلمة المرور');
      return;
    }

    const cleanUsername = (username || '').trim().toLowerCase();

    // Direct admin login test check
    if (cleanUsername === 'admin' && password === 'admin123') {
      showToastMessage('تم تسجيل الدخول بنجاح كمدير للنظام', 'success');
      onSuccessLogin('admin');
      onClose();
      return;
    }

    // Context staff login check
    const success = loginStaff((username || '').trim(), password);
    if (success) {
      showToastMessage(`مرحباً بك، تم تسجيل الدخول بنجاح`, 'success');
      // Decide if staff member role is admin or employee
      if (cleanUsername.includes('admin')) {
        onSuccessLogin('admin');
      } else {
        onSuccessLogin('employee');
      }
      onClose();
    } else {
      setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const setPreset = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">دخول الموظفين والإدارة</h3>
              <p className="text-xs text-slate-400 mt-0.5">بوفيه فادي • نظام الإدارة ومتابعة الطلبات</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 text-center animate-in shake duration-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم</label>
            <div className="relative">
              <input
                type="text"
                placeholder="أدخل اسم المستخدم..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 focus:outline-none"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="أدخل كلمة المرور..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-10 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Preset Helper Chips for Testing */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>حسابات سريعة للتجربة:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreset('admin', 'admin123')}
                className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-right transition-all flex flex-col gap-0.5 cursor-pointer"
              >
                <span className="font-extrabold text-xs flex items-center gap-1">
                  <span>لوحة الإدارة</span>
                  <CheckCircle2 className="w-3 h-3 text-amber-600" />
                </span>
                <span className="text-[10px] text-amber-700 font-medium">admin / admin123</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('fadi', '123456')}
                className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-right transition-all flex flex-col gap-0.5 cursor-pointer"
              >
                <span className="font-extrabold text-xs flex items-center gap-1">
                  <span>شاشة الموظف</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">fadi / 123456</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>تسجيل الدخول للنظام</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
