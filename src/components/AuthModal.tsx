import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Lock, UserCheck, LogOut, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Sparkles, Phone, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { customerUser, registerCustomerUser, loginCustomerUser, logoutCustomerUser } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setMessage(null);
  }, [mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (mode === 'signup') {
      if (!fullName.trim() || !username.trim() || !password) {
        setMessage({ type: 'error', text: 'يرجى ملء جميع الحقول المطلوبة' });
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين ❌' });
        return;
      }
      if (password.length < 4) {
        setMessage({ type: 'error', text: 'كلمة المرور يجب أن تكون 4 خانات على الأقل' });
        return;
      }

      setLoading(true);
      const res = await registerCustomerUser({
        name: fullName,
        username,
        password,
      });
      setLoading(false);

      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        setTimeout(() => onClose(), 1200);
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } else {
      // Login
      if (!username.trim() || !password) {
        setMessage({ type: 'error', text: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
        return;
      }

      setLoading(true);
      const res = await loginCustomerUser({
        username,
        password,
      });
      setLoading(false);

      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        setTimeout(() => onClose(), 1000);
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    }
  };

  const handleLogout = () => {
    logoutCustomerUser();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col dir-rtl text-right">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">
                {customerUser ? 'حسابي الشخصي' : mode === 'login' ? 'تسجيل دخول العملاء' : 'إنشاء حساب جديد'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {customerUser ? `مرحباً بك يا ${customerUser.name}` : 'لحفظ طلباتك ومتابعتها بسهولة عبر الأجهزة'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* If Logged In */}
          {customerUser ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>تم تسجيل الدخول بالحساب الحالي بنجاح</span>
                </div>
                
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 space-y-1.5 text-xs text-slate-700 font-bold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الاسم الكامل:</span>
                    <span className="text-slate-900">{customerUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">اسم المستخدم:</span>
                    <span className="text-emerald-700 font-mono">@{customerUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">حالة الحساب:</span>
                    <span className="text-emerald-600">نشط 🟢</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            </div>
          ) : (
            /* Auth Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Tabs Toggle */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'login' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'signup' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  إنشاء حساب جديد
                </button>
              </div>

              {/* Alert Feedback */}
              {message && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Signup Name Field */}
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">الاسم الكامل</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: فهد أحمد"
                      className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 focus:outline-none"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">اسم المستخدم (Username)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: fahad123"
                    className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 focus:outline-none dir-ltr text-right"
                  />
                  <UserCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Confirm Password Field (Signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 focus:outline-none"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</span>
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
