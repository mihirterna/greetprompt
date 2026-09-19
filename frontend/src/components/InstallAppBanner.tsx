import React, { useState, useEffect } from 'react';
import { Download, Share, X, Sparkles, Smartphone } from 'lucide-react';

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if device is iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android & Desktop Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSTip(true);
    }
  };

  // If already installed or dismissed by user, don't show
  if (isInstalled || isDismissed) return null;

  // Only show if install prompt is available OR on iOS
  if (!isInstallable && !isIOS) return null;

  return (
    <>
      {/* Floating Install Pill */}
      <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-slate-900/95 border border-amber-500/40 shadow-2xl shadow-amber-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Smartphone className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Install GreetPrompt App</span>
            <span className="sm:hidden">Install App</span>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="py-1.5 px-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5 stroke-[3]" />
            <span>Install</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS "Add to Home Screen" Modal */}
      {showIOSTip && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm p-5 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSTip(false)}
                className="p-1 rounded-lg bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <span>
                  Tap the <Share className="w-3.5 h-3.5 inline text-amber-400 mx-1" /> <strong>Share</strong> button in Safari toolbar.
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>.
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> to access GreetPrompt in 1-tap every morning!
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSTip(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
