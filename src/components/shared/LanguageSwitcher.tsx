import React, { useState } from 'react';
import { Languages, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<'EN' | 'UR'>('EN');
  const [isDark, setIsDark] = useState(false);

  const toggleLang = () => {
    const next = lang === 'EN' ? 'UR' : 'EN';
    setLang(next);
    console.log(`[LANGUAGE SWITCH] Set to ${next}`);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-100/80 p-0.5 rounded-full border border-slate-200/50">
      <button
        onClick={toggleLang}
        title="Switch Language"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold font-mono text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Languages className="h-3 w-3 text-blue-600" />
        <span>{lang === 'EN' ? 'English (EN)' : 'اردو (UR)'}</span>
      </button>

      <button
        onClick={toggleDarkMode}
        title="Toggle Eye-Care Mode"
        className="p-1.5 rounded-full hover:bg-white text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
      >
        {isDark ? (
          <Sun className="h-3.5 w-3.5 text-amber-500" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-slate-500" />
        )}
      </button>
    </div>
  );
}
