import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentGatewayType, PaymentGatewayConfig } from '../types';
import {
  CreditCard,
  ShieldCheck,
  Key,
  Save,
  CheckCircle2,
  Lock,
  Smartphone,
  Banknote,
  Sliders,
  Radio,
  Zap,
} from 'lucide-react';

export const PaymentGatewaySettings: React.FC = () => {
  const { paymentGatewayConfig, updatePaymentGatewayConfig } = useApp();

  const [form, setForm] = useState<PaymentGatewayConfig>({ ...paymentGatewayConfig });
  const [activeTabGateway, setActiveTabGateway] = useState<'tap' | 'hyperpay' | 'paytabs'>('tap');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentGatewayConfig(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white border border-slate-700/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/30 shrink-0">
            💳
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>إدارة بوابات الدفع الإلكتروني (Payment Gateways)</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                جاهز للربط ⚡
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              قم بتهيئة مفاتيح الـ API لبوابات الدفع الشهيرة مثل Tap Payments أو HyperPay أو PayTabs. يمكنك تبديل البوابة أو مفاتيح البيئة دون الحاجة للتعديل في الكود.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التغييرات والمفاتيح</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 font-extrabold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>تم حفظ إعدادات ومفاتيح بوابات الدفع الإلكتروني بنجاح!</span>
        </div>
      )}

      {/* Main Grid Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Primary Gateway Selection & Toggles */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Active Gateway Selection */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>البوابة المفعّلة حالياً للخصم</span>
            </h4>

            <div className="space-y-2">
              {[
                {
                  id: 'tap' as PaymentGatewayType,
                  title: 'Tap Payments',
                  desc: 'بوابة تاب الشهيرة بالخليج والدعم الفوري',
                  logo: '💳 Tap'
                },
                {
                  id: 'hyperpay' as PaymentGatewayType,
                  title: 'HyperPay',
                  desc: 'بوابة هايبر باي لمعالجة مدى وفيزا',
                  logo: '⚡ HyperPay'
                },
                {
                  id: 'paytabs' as PaymentGatewayType,
                  title: 'PayTabs',
                  desc: 'بوابة بي تابس الموثوقة للمتاجر',
                  logo: '🛡️ PayTabs'
                },
                {
                  id: 'simulated' as PaymentGatewayType,
                  title: 'محاكي بوابات الدفع المباشر (Sandbox)',
                  desc: 'وضع محاكاة اختباري لتجربة السداد والدفع',
                  logo: '🧪 Simulated'
                }
              ].map((gw) => (
                <label
                  key={gw.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    form.activeGateway === gw.id
                      ? 'bg-emerald-50/80 border-2 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="activeGateway"
                    checked={form.activeGateway === gw.id}
                    onChange={() => setForm({ ...form, activeGateway: gw.id })}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{gw.title}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {gw.logo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{gw.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Test Mode & Supported Payment Methods Toggles */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>خيارات وسائل الدفع المتاحة للعميل</span>
            </h4>

            {/* Test Mode Switch */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-xs text-amber-950 block">الوضع التجريبي (Test / Sandbox Mode)</span>
                <span className="text-[10px] text-amber-800 block mt-0.5">
                  السماح بتجربة عمليات الدفع دون خصم رصيد حقيقي
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.testMode}
                onChange={(e) => setForm({ ...form, testMode: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded-md focus:ring-amber-500"
              />
            </div>

            {/* Payment Options Switches */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {[
                { key: 'enableCashOnDelivery', label: '💵 الدفع عند الاستلام (كاش)', desc: 'طلب غير مدفوع يتم سداده في البوفيه' },
                { key: 'enableMada', label: '💳 بطاقة مدى (Mada)', desc: 'خصم مباشر من بطاقة المدى' },
                { key: 'enableApplePay', label: '🍎 Apple Pay', desc: 'خصم سريع عبر أجهزة آبل' },
                { key: 'enableVisaMastercard', label: '💳 Visa / Mastercard', desc: 'دعم البطاقات الإئتمانية العالمية' },
              ].map((opt) => (
                <div key={opt.key} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 block">{opt.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(form as any)[opt.key]}
                    onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Column 2 & 3: API Keys Configuration Form per Gateway */}
        <div className="space-y-6 lg:col-span-2">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  <span>تهيئة مفاتيح الربط البرمجي (API Credentials)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  أدخل البيانات الصادرة من لوحة تحكم التاجر الخاصة ببوابة الدفع
                </p>
              </div>

              {/* Gateway Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                {[
                  { id: 'tap', label: 'Tap Payments' },
                  { id: 'hyperpay', label: 'HyperPay' },
                  { id: 'paytabs', label: 'PayTabs' },
                ].map((tb) => (
                  <button
                    key={tb.id}
                    type="button"
                    onClick={() => setActiveTabGateway(tb.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTabGateway === tb.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tap Payments Configuration */}
            {activeTabGateway === 'tap' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-2xl text-xs text-blue-900 space-y-1">
                  <strong className="font-extrabold flex items-center gap-1 text-blue-950">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>إعدادات بوابة Tap Payments</span>
                  </strong>
                  <p className="text-[11px] text-blue-800 leading-snug">
                    احصل على مفاتيحك من لوحة تحكم Tap عبر الرابط: <code className="bg-blue-100 px-1 rounded font-mono">dashboard.tap.company</code>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Secret Key (المفتاح السري)</label>
                    <input
                      type="text"
                      value={form.gateways?.tap?.secretKey || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gateways: {
                            ...form.gateways,
                            tap: { ...form.gateways?.tap, secretKey: e.target.value },
                          },
                        })
                      }
                      placeholder="sk_test_..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Public Key (المفتاح العام)</label>
                    <input
                      type="text"
                      value={form.gateways?.tap?.publicKey || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gateways: {
                            ...form.gateways,
                            tap: { ...form.gateways?.tap, publicKey: e.target.value },
                          },
                        })
                      }
                      placeholder="pk_test_..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Merchant ID (معرف التاجر)</label>
                    <input
                      type="text"
                      value={form.gateways?.tap?.merchantId || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gateways: {
                            ...form.gateways,
                            tap: { ...form.gateways?.tap, merchantId: e.target.value },
                          },
                        })
                      }
                      placeholder="m_..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HyperPay Configuration */}
            {activeTabGateway === 'hyperpay' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-purple-50 border border-purple-200/80 rounded-2xl text-xs text-purple-900 space-y-1">
                  <strong className="font-extrabold flex items-center gap-1 text-purple-950">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>إعدادات بوابة HyperPay</span>
                  </strong>
                  <p className="text-[11px] text-purple-800 leading-snug">
                    احصل على Entity ID و Access Token من فريق الدعم الفني أو لوحة تحكم HyperPay.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Entity ID (معرّف الكيان)</label>
                    <input
                      type="text"
                      value={form.gateways?.hyperpay?.entityId || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gateways: {
                            ...form.gateways,
                            hyperpay: { ...form.gateways?.hyperpay, entityId: e.target.value },
                          },
                        })
                      }
                      placeholder="8ac7a4c8..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Access Token (رمز الوصول)</label>
                    <input
                      type="text"
                      value={form.gateways?.hyperpay?.accessToken || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gateways: {
                            ...form.gateways,
                            hyperpay: { ...form.gateways?.hyperpay, accessToken: e.target.value },
                          },
                        })
                      }
                      placeholder="Bearer token..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PayTabs Configuration */}
            {activeTabGateway === 'paytabs' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <strong className="font-extrabold flex items-center gap-1 text-emerald-950">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>إعدادات بوابة PayTabs</span>
                  </strong>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    احصل على Profile ID والمفاتيح من لوحة تحكم PayTabs Merchant Portal.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Profile ID (معرف الملف الشخصي)</label>
                    <input
                      type="text"
                      value={form.gateways?.paytabs?.profileId || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gateways: {
                            ...form.gateways,
                            paytabs: { ...form.gateways?.paytabs, profileId: e.target.value },
                          },
                        })
                      }
                      placeholder="100234"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Server Key (مفتاح الخادم)</label>
                    <input
                      type="text"
                      value={form.gateways?.paytabs?.serverKey || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gateways: {
                            ...form.gateways,
                            paytabs: { ...form.gateways?.paytabs, serverKey: e.target.value },
                          },
                        })
                      }
                      placeholder="SHJN-XXXX-XXXX-XXXX"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Client Key (مفتاح العميل)</label>
                    <input
                      type="text"
                      value={form.gateways?.paytabs?.clientKey || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gateways: {
                            ...form.gateways,
                            paytabs: { ...form.gateways?.paytabs, clientKey: e.target.value },
                          },
                        })
                      }
                      placeholder="CKJN-XXXX-XXXX-XXXX"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>يتم حفظ المفاتيح بشكل آمن داخل النظام وقاعدة البيانات</span>
              </span>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ المفاتيح</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
