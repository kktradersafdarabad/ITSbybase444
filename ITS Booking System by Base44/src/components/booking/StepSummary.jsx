import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Clock, Car, User, CreditCard, Check, Tag, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function Row({ label, value, className = "" }) {
  return (
    <div className={`flex justify-between items-center text-sm ${className}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function StepSummary({ data, onBack, onConfirm, isSubmitting }) {
  const paymentLabel = { credit_card: "Credit Card (Stripe)", paypal: "PayPal", cash: "Cash" }[data.payment_method] || data.payment_method;
  const isOnlinePayment = data.payment_method === "credit_card" || data.payment_method === "paypal";

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">

      {/* Trip Details */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Trip Details</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="font-medium text-sm">{data.pickup_address}</p>
            </div>
          </div>
          {/* Via Stops */}
          {data.via_stops && (() => {
            const stops = typeof data.via_stops === "string" ? JSON.parse(data.via_stops) : data.via_stops;
            return stops?.filter(Boolean).map((stop, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Via Stop {i + 1}</p>
                  <p className="font-medium text-sm">{stop}</p>
                </div>
              </div>
            ));
          })()}
          {data.dropoff_address && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dropoff</p>
                <p className="font-medium text-sm">{data.dropoff_address}</p>
              </div>
            </div>
          )}
          {data.return_trip && (
            <div className="flex items-center gap-2 ml-10 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200">
              🔄 Return trip included
            </div>
          )}
          <div className="flex gap-4 pl-10 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="w-3.5 h-3.5" />{data.pickup_date}</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-3.5 h-3.5" />{data.pickup_time}</span>
          </div>
          {data.flight_number && (
            <p className="text-sm pl-10 text-muted-foreground">✈ Flight: <strong>{data.flight_number}</strong></p>
          )}
          {data.notes && (
            <p className="text-sm pl-10 text-muted-foreground">📝 {data.notes}</p>
          )}
        </div>
      </div>

      {/* Vehicle & Passenger */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Booking Details</h3>
        <div className="flex items-center gap-3 py-1">
          <Car className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="font-medium text-sm flex-1">{data.vehicle_name}</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">{data.booking_type?.replace(/_/g, " ")}</span>
        </div>
        <div className="border-t border-border/40 pt-3 flex items-center gap-3">
          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">{data.passenger_name}</p>
            <p className="text-xs text-muted-foreground">{data.passenger_email} · {data.passenger_phone}</p>
          </div>
          {(data.passengers_count > 1 || data.luggage_count > 0) && (
            <div className="ml-auto text-xs text-muted-foreground text-right">
              {data.passengers_count > 1 && <p>{data.passengers_count} passengers</p>}
              {data.luggage_count > 0 && <p>{data.luggage_count} bags</p>}
            </div>
          )}
        </div>
      </div>

      {/* Fare Breakdown */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Fare Breakdown</h3>
        <div className="space-y-2">
          {data.base_fare > 0 && <Row label="Hire Charge" value={`£${(data.base_fare || 0).toFixed(2)}`} />}
          {data.distance_charge > 0 && <Row label={`Distance (${data.distance_miles || "—"} miles)`} value={`£${data.distance_charge.toFixed(2)}`} />}
          {data.time_charge > 0 && <Row label="Waiting / Traffic Time" value={`£${data.time_charge.toFixed(2)}`} />}
          {data.extras_charge > 0 && <Row label="Extras & Add-ons" value={`£${data.extras_charge.toFixed(2)}`} />}
          {data.return_trip && <Row label="Return Trip" value="Included ×2" className="text-amber-600" />}
          {data.surge_multiplier > 1 && (
            <Row label={`Peak / Night Rate (${data.surge_multiplier}x)`} value="Applied" className="text-amber-600" />
          )}
          {data.discount_amount > 0 && (
            <div className="flex justify-between items-center text-sm text-emerald-600">
              <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Promo: {data.promo_code}</span>
              <span className="font-semibold">−£{data.discount_amount.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="font-bold text-base">Total Due</span>
          <span className="text-2xl font-bold text-primary">£{(data.total_fare || 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-muted-foreground">Payment via</span>
          <span className="flex items-center gap-1.5 font-medium"><CreditCard className="w-3.5 h-3.5" />{paymentLabel}</span>
        </div>
      </div>

      {/* Payment redirect notice */}
      {isOnlinePayment && (
        <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Clicking "Confirm Booking" will redirect you to the secure {data.payment_method === "credit_card" ? "Stripe" : "PayPal"} payment page to complete your payment.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Button onClick={onConfirm} disabled={isSubmitting} className="flex-1 gap-2 h-12 text-base">
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
          ) : (
            <><Check className="w-5 h-5" /> {isOnlinePayment ? "Confirm & Pay" : "Confirm Booking"}</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}