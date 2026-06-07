import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, CreditCard, Wallet, Banknote, Tag, CheckCircle2, XCircle, Loader2, Users, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import BookingExtras, { EXTRAS } from "@/components/booking/BookingExtras";

const allPaymentMethods = [
  { value: "credit_card", label: "Credit Card", icon: CreditCard, desc: "Visa, Mastercard, Amex" },
  { value: "paypal", label: "PayPal", icon: Wallet, desc: "Pay via PayPal" },
  { value: "cash", label: "Cash", icon: Banknote, desc: "Pay driver directly" },
];

export default function TenantStepPassenger({ data, onChange, onValidatePromo, onNext, onBack, tenant }) {
  const [promoInput, setPromoInput] = useState(data.promo_code || "");
  const [promoStatus, setPromoStatus] = useState(data.promo_code ? "valid" : null);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoSaved, setPromoSaved] = useState(data.discount_amount || 0);
  const [applyingPromo, setApplyingPromo] = useState(false);

  const update = (k, v) => onChange({ ...data, [k]: v });
  const isValid = data.passenger_name && data.passenger_email && data.passenger_phone && data.payment_method;
  const currencySymbol = "£";

  const handleExtrasChange = (selected) => {
    const extrasCharge = selected.reduce((sum, key) => {
      const e = EXTRAS.find(x => x.key === key);
      return sum + (e?.price || 0);
    }, 0);
    const baseFare = data._base_total_fare || (data.total_fare - (data.extras_charge || 0));
    onChange(prev => ({
      ...prev,
      selected_extras: selected,
      extras_charge: extrasCharge,
      total_fare: parseFloat((baseFare + extrasCharge - (prev.discount_amount || 0)).toFixed(2)),
    }));
  };

  // Filter available payment methods based on tenant config
  const availableMethods = allPaymentMethods.filter(pm => {
    if (pm.value === "credit_card") return !!tenant?.stripe_publishable_key;
    if (pm.value === "paypal") return !!tenant?.paypal_client_id;
    return true; // cash always available
  });

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    setPromoStatus(null);
    // onValidatePromo already calls setData internally with updated fare
    const result = await onValidatePromo(promoInput.trim());
    setApplyingPromo(false);
    if (result?.valid) {
      setPromoStatus("valid");
      setPromoSaved(result.savedAmount || 0);
      setPromoMessage(`You save $${(result.savedAmount || 0).toFixed(2)}!`);
      // NOTE: do NOT call update("promo_code",...) here — onValidatePromo already set full fare data
    } else {
      setPromoStatus("invalid");
      setPromoMessage(result?.message || "Invalid or expired code");
      onChange(prev => ({ ...prev, promo_code: "", discount_amount: 0 }));
    }
  };

  const handleRemovePromo = () => {
    setPromoInput("");
    setPromoStatus(null);
    setPromoMessage("");
    setPromoSaved(0);
    onChange(prev => ({ ...prev, promo_code: "", discount_amount: 0, total_fare: data._base_total_fare || data.total_fare }));
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
      
      {/* Passenger Details */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
        <h3 className="font-semibold text-sm">Passenger Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Full Name <span className="text-destructive">*</span></Label>
            <Input value={data.passenger_name || ""} onChange={e => update("passenger_name", e.target.value)} placeholder="John Doe" className="mt-1" />
          </div>
          <div>
            <Label>Email <span className="text-destructive">*</span></Label>
            <Input type="email" value={data.passenger_email || ""} onChange={e => update("passenger_email", e.target.value)} placeholder="john@example.com" className="mt-1" />
          </div>
          <div>
            <Label>Phone <span className="text-destructive">*</span></Label>
            <Input value={data.passenger_phone || ""} onChange={e => update("passenger_phone", e.target.value)} placeholder="+1 234 567 8900" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1"><Users className="w-3 h-3" /> Passengers</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => update("passengers_count", Math.max(1, (data.passengers_count || 1) - 1))}>-</Button>
                <span className="w-8 text-center font-semibold">{data.passengers_count || 1}</span>
                <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => update("passengers_count", Math.min(20, (data.passengers_count || 1) + 1))}>+</Button>
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Luggage</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => update("luggage_count", Math.max(0, (data.luggage_count || 0) - 1))}>-</Button>
                <span className="w-8 text-center font-semibold">{data.luggage_count || 0}</span>
                <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => update("luggage_count", Math.min(20, (data.luggage_count || 0) + 1))}>+</Button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Label>Special Requests <span className="text-xs text-muted-foreground">(optional)</span></Label>
          <Textarea
            value={data.special_requests || ""}
            onChange={e => update("special_requests", e.target.value)}
            placeholder="e.g. Wheelchair access, nervous passenger, etc."
            rows={2}
            className="mt-1 resize-none"
          />
        </div>
      </div>

      {/* Extras */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <BookingExtras
          selected={data.selected_extras || []}
          onChange={handleExtrasChange}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Payment Method */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
        <h3 className="font-semibold text-sm">Payment Method <span className="text-destructive">*</span></h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {availableMethods.map(pm => (
            <button
              key={pm.value}
              type="button"
              onClick={() => update("payment_method", pm.value)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                data.payment_method === pm.value
                  ? "border-primary bg-primary/8 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40 bg-background"
              )}
            >
              <pm.icon className={cn("w-6 h-6", data.payment_method === pm.value ? "text-primary" : "text-muted-foreground")} />
              <div className="text-center">
                <p className="text-sm font-semibold">{pm.label}</p>
                <p className="text-[10px] text-muted-foreground">{pm.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {data.payment_method === "credit_card" && (
          <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <CreditCard className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              You'll be redirected to a secure payment page after confirming your booking. Card details are never stored on our servers.
            </p>
          </div>
        )}
        {data.payment_method === "paypal" && (
          <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <Wallet className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              You'll be redirected to PayPal to complete your payment securely after confirming.
            </p>
          </div>
        )}
        {data.payment_method === "cash" && (
          <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
            <Banknote className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Please have the exact amount ready. Pay your driver at the end of the trip.
            </p>
          </div>
        )}
      </div>

      {/* Promo Code */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Promo Code</h3>

        {promoStatus === "valid" ? (
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-700 font-mono">{promoInput}</p>
                <p className="text-xs text-emerald-600">{promoMessage}</p>
              </div>
            </div>
            <button type="button" onClick={handleRemovePromo} className="text-xs text-muted-foreground hover:text-destructive transition-colors underline">
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={promoInput}
                onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus(null); setPromoMessage(""); }}
                placeholder="Enter promo code (e.g. SAVE20)"
                className="font-mono tracking-widest"
                onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
              />
              <Button
                variant="outline"
                type="button"
                onClick={handleApplyPromo}
                disabled={!promoInput.trim() || applyingPromo}
                className="shrink-0 min-w-[80px]"
              >
                {applyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
            {promoStatus === "invalid" && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{promoMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 gap-2 h-12"
        >
          Review Booking <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}