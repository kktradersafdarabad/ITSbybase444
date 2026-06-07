import { Button } from "@/components/ui/button";
import { Users, Briefcase, DollarSign, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { calculateFare } from "@/lib/fareCalculator";

const categoryIcons = { sedan: "🚗", suv: "🚙", luxury: "🏎️", van: "🚐", stretch_limo: "🚑" };

export default function StepVehicle({ data, onChange, vehicles, settings, routes, onNext, onBack }) {
  const selectedRoute = routes?.find(r => r.id === data.route_id);

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
      <p className="text-muted-foreground">Select your preferred vehicle</p>

      <div className="space-y-3">
        {vehicles.filter(v => v.is_active !== false).map((v, i) => {
          const isSelected = data.vehicle_id === v.id;
          const fare = calculateFare({
            bookingType: data.booking_type,
            vehicle: v,
            settings,
            distance: data.estimated_distance_km,
            duration: data.estimated_duration_min,
            hours: data.hours_booked,
            route: selectedRoute,
            extras: data.selected_extras || [],
            returnTrip: data.return_trip || false,
          });

          return (
            <motion.button
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onChange({ ...data, vehicle_id: v.id, vehicle_name: v.name, ...fare })}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/50"
              )}
            >
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                {v.image_url ? <img src={v.image_url} alt={v.name} className="w-full h-full object-cover rounded-lg" /> : categoryIcons[v.category] || "🚗"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{v.name}</h3>
                  <span className="text-xs text-muted-foreground capitalize">{v.category?.replace(/_/g, " ")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{v.model}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.max_passengers}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{v.max_luggage || 0}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-primary">£{fare.total_fare.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">est. fare</p>
              </div>
              {isSelected && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Button onClick={onNext} disabled={!data.vehicle_id} className="flex-1 gap-2 h-12">Continue <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </motion.div>
  );
}