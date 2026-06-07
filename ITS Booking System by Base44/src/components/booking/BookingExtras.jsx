import { cn } from "@/lib/utils";
import { Baby, UserCheck, ShoppingBag, Wifi, Coffee, Newspaper, Users, PlusCircle } from "lucide-react";

const EXTRAS = [
  { key: "child_seat", label: "Child Seat", icon: Baby, desc: "Baby/toddler seat", price: 5 },
  { key: "booster_seat", label: "Booster Seat", icon: Baby, desc: "Ages 4–12", price: 3 },
  { key: "meet_greet", label: "Meet & Greet", icon: UserCheck, desc: "Driver meets at arrivals", price: 10 },
  { key: "extra_luggage", label: "Extra Luggage", icon: ShoppingBag, desc: "Large/extra bags", price: 5 },
  { key: "wifi", label: "In-Car WiFi", icon: Wifi, desc: "Stay connected", price: 5 },
  { key: "refreshments", label: "Refreshments", icon: Coffee, desc: "Water & snacks", price: 4 },
  { key: "newspaper", label: "Newspaper", icon: Newspaper, desc: "Daily paper on board", price: 2 },
];

export default function BookingExtras({ selected = [], onChange, currencySymbol = "£" }) {
  const toggle = (key, price) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const totalExtras = selected.reduce((sum, key) => {
    const e = EXTRAS.find(x => x.key === key);
    return sum + (e?.price || 0);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-primary" /> Extras & Add-ons
        </h3>
        {totalExtras > 0 && (
          <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-0.5">
            +{currencySymbol}{totalExtras.toFixed(2)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {EXTRAS.map(({ key, label, icon: Icon, desc, price }) => {
          const isSelected = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key, price)}
              className={cn(
                "flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/8 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40 bg-background"
              )}
            >
              <div className="flex items-center gap-1.5 w-full">
                <Icon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-xs font-semibold flex-1", isSelected ? "text-primary" : "")}>{label}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
              </div>
              <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
              <span className="text-xs font-bold text-muted-foreground">+{currencySymbol}{price.toFixed(2)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { EXTRAS };