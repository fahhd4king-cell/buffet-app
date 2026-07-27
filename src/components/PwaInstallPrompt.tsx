import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // Check if already running as installed PWA app
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone);

    if (checkStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if user previously dismissed in this session
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed') === 'true';

    // Capture Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone and not dismissed, show banner after a short delay
    if (isIosDevice && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android / Desktop Chrome native prompt
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS Safari guide modal
      setShowIosModal(true);
    } else {
      // Fallback guide
      setShowIosModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // If running inside PWA standalone app, don't show prompt
  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      {showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-6 duration-500">
          <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border border-emerald-500/40 backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30 shrink-0">
                ف
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white truncate">تطبيق بوفيه فادي</h4>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                  ثبّت التطبيق على شاشتك الرئيسية للطلب بضغطة واحدة!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="py-2.5 px-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>إضافة</span>
              </button>

              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS & Manual Installation Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full overflow-hidden border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                  ف
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">إضافة بوفيه فادي للشاشة الرئيسية</h3>
                  <p className="text-xs text-emerald-400">بدون الحاجة لمتجر المتصفح أو App Store</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps Content */}
            <div className="p-6 space-y-4 text-slate-200">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                تطبيق بوفيه فادي مصمم كـ PWA يعمل مباشرة على أجهزة أيفون (iPhone) وأندرويد (Android) بسلاسة فائقة:
              </p>

              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm shrink-0 mt-0.5 border border-amber-500/30">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>اضغط على زر المشاركة</span>
                    <Share className="w-4 h-4 text-sky-400 inline" />
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    في متصفح Safari على أيفون أو خيارات Chrome على أندرويد
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 mt-0.5 border border-emerald-500/30">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>اختر "إضافة إلى الشاشة الرئيسية"</span>
                    <PlusSquare className="w-4 h-4 text-emerald-400 inline" />
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    (Add to Home Screen) من القائمة المنسدلة
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-sm shrink-0 mt-0.5 border border-purple-500/30">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">اضغط على "إضافة" (Add)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    سيظهر لك أيقونة بوفيه فادي كتطبيق مستقل على شاشتك الرئيسية!
                  </p>
                </div>
              </div>
            </div>

            {/* Footer button */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center">
              <button
                onClick={() => setShowIosModal(false)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                حسناً، فهمت ذلك
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
