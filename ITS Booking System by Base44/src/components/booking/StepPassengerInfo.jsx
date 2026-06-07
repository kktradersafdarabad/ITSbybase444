import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, CreditCard, Wallet, Banknote, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const paymentMethods = [
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "paypal", label: "PayPal", icon: Wallet },
  { value: "cash", label: "Cash", icon: Banknote },
];

export default function StepPassengerInfo({ data, onChange, onValidatePromo, onNext, onBack }) {
  const [promoInput, setPromoInput] = useState(data.promo_code || "");
  const [promoStatus, setPromoStatus] = useState(null);

  const update = (k, v) => onChange({ ...data, [k]: v });
  const isValid = data.passenger_name && data.passenger_email && data.passenger_phone && data.payment_method;

  const handleApplyPromo = async () => {
    const result = await onValidatePromo(promoInput);
    if (result) {
      setPromoStatus("valid");
      update("promo_code", promoInput);
    } else {
      setPromoStatus("invalid");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Full Name *</Label><Input value={data.passenger_name || ""} onChange={e => update("passenger_name", e.target.value)} required /></div>
        <div><Label>Email *</Label><Input type="email" value={data.passenger_email || ""} onChange={e => update("passenger_email", e.target.value)} required /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Phone *</Label><Input value={data.passenger_phone || ""} onChange={e => update("passenger_phone", e.target.value)} required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Passengers</Label><Input type="number" min="1" value={data.passengers_count || 1} onChange={e => update("passengers_count", +e.target.value)} /></div>
          <div><Label>Luggage</Label><Input type="number" min="0" value={data.luggage_count || 0} onChange={e => update("luggage_count", +e.target.value)} /></div>
        </div>
      </div>
      <div><Label>Special Requests</Label><Textarea value={data.special_requests || ""} onChange={e => update("special_requests", e.target.value)} placeholder="Child seat, wheelchair access, etc." rows={2} /></div>

      {/* Payment Method */}
      <div>
        <Label className="text-base font-semibold mb-2 block">Payment Method *</Label>
        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map(pm => (
            <button key={pm.value} onClick={() => update("payment_method", pm.value)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                data.payment_method === pm.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
              )}
            >
              <pm.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{pm.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Promo Code */}
      <div>
        <Label className="flex items-center gap-2"><Tag className="w-4 h-4" /> Promo Code</Label>
        <div className="flex gap-2">
          <Input value={promoInput} onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus(null); }} placeholder="Enter code" />
          <Button variant="outline" onClick={handleApplyPromo} disabled={!promoInput}>Apply</Button>
        </div>
        {promoStatus === "valid" && <p className="text-sm text-emerald-600 mt-1">Promo code applied!</p>}
        {promoStatus === "invalid" && <p className="text-sm text-destructive mt-1">Invalid or expired code</p>}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Button onClick={onNext} disabled={!isValid} className="flex-1 gap-2 h-12">Review Booking <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </motion.div>
  );
}