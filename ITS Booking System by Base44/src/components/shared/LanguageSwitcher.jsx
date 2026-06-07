import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { languageNames, rtlLanguages } from "@/lib/i18n";

export default function LanguageSwitcher({ value, onChange, compact = false }) {
  const handleChange = (lang) => {
    onChange(lang);
    // Apply RTL direction for Arabic/Urdu
    document.documentElement.dir = rtlLanguages.includes(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  return (
    <div className="flex items-center gap-2">
      {!compact && <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      <Select value={value || "en"} onValueChange={handleChange}>
        <SelectTrigger className={compact ? "h-8 w-[110px] text-xs" : "w-[130px]"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languageNames).map(([code, name]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}