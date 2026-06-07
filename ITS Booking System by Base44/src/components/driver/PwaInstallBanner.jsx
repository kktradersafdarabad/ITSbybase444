/**
 * PWA Install Banner
 * Driver App ko home screen par add karne ka prompt dikhata hai.
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Pehle check karo ke already installed nahi hai
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIos(ios);
    if (ios) { setShow(true); return; }

    // Android/Chrome - beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!show || dismissed) return null;

  return (
    <div className="mx-4 mb-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Add to Home Screen</p>
          {isIos ? (
            <p className="text-xs text-white/80 mt-0.5">
              Tap <strong>Share</strong> → <strong>"Add to Home Screen"</strong> to install the Driver App
            </p>
          ) : (
            <p className="text-xs text-white/80 mt-0.5">
              Install the app for faster access, offline support & push notifications for new jobs
            </p>
          )}
          {!isIos && (
            <Button
              size="sm"
              className="mt-2 bg-white text-amber-700 hover:bg-white/90 h-7 text-xs px-3"
              onClick={handleInstall}
            >
              Install App
            </Button>
          )}
        </div>
        <button onClick={handleDismiss} className="text-white/70 hover:text-white flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}