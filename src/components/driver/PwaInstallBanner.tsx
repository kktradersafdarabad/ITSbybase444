import React, { useState } from 'react';
import { Sparkles, Download, Check, X } from 'lucide-react';

export default function PwaInstallBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [installed, setInstalled] = useState(false);

  if (!isVisible) return null;

  const handleInstallClick = () => {
    setInstalled(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white shadow-lg relative overflow-hidden">
      {/* Subtle glowing gradients */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-blue-600/10 blur-xl rounded-full" />
      
      <div className="flex items-start gap-3 z-10 text-left">
        <div className="p-2 bg-blue-600 rounded-xl text-white mt-0.5 shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <h4 className="text-xs font-bold font-sans">Install ITS Dispatcher App</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Add to your device home screen for lightning-fast offline access and automatic GPS push notifications.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 z-10 self-end md:self-center">
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <button
          onClick={handleInstallClick}
          className="bg-blue-600 hover:bg-blue-700 font-bold px-4 py-2 rounded-xl text-[10px] text-white flex items-center gap-1.5 cursor-pointer transition-colors font-mono uppercase"
        >
          {installed ? (
            <>
              <Check className="h-3 w-3" />
              ADDED TO SHELF
            </>
          ) : (
            <>
              <Download className="h-3 w-3" />
              ADD TO HOME SCREEN
            </>
          )}
        </button>
      </div>
    </div>
  );
}
