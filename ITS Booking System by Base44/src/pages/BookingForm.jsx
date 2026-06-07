import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { sendBookingConfirmation } from "@/lib/emailService";
import { Crown } from "lucide-react";
import StepIndicator from "@/components/booking/StepIndicator";
import StepTripDetails from "@/components/booking/StepTripDetails";
import StepVehicle from "@/components/booking/StepVehicle";
import StepPassengerInfo from "@/components/booking/StepPassengerInfo";
import StepSummary from "@/components/booking/StepSummary";
import StepConfirmation from "@/components/booking/StepConfirmation";
import { calculateFare } from "@/lib/fareCalculator";
import { AnimatePresence } from "framer-motion";

export default function BookingForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ booking_type: "distance", passengers_count: 1, luggage_count: 0 });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => base44.entities.Vehicle.list() });
  const { data: routes = [] } = useQuery({ queryKey: ["routes"], queryFn: () => base44.entities.Route.list() });
  const { data: settingsList = [] } = useQuery({ queryKey: ["settings"], queryFn: () => base44.entities.CompanySettings.list() });
  const { data: promos = [] } = useQuery({ queryKey: ["promos"], queryFn: () => base44.entities.PromoCode.list() });

  const settings = settingsList[0] || {};

  const createMutation = useMutation({
    mutationFn: (bookingData) => base44.entities.Booking.create(bookingData),
    onSuccess: (result) => {
      setConfirmedBooking(result);
      setStep(4);
      sendBookingConfirmation(result, settings.company_name || "LimoElite").catch(() => {});
    },
  });

  const handleValidatePromo = async (code) => {
    const promo = promos.find(p => p.code === code && p.is_active !== false);
    if (!promo) return null;
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) return null;
    if (promo.max_uses && (promo.current_uses || 0) >= promo.max_uses) return null;

    const selectedVehicle = vehicles.find(v => v.id === data.vehicle_id);
    const selectedRoute = routes.find(r => r.id === data.route_id);
    const fare = calculateFare({
      bookingType: data.booking_type, vehicle: selectedVehicle, settings,
      distance: data.estimated_distance_km, duration: data.estimated_duration_min,
      hours: data.hours_booked, route: selectedRoute, promoCode: promo,
    });
    setData(prev => ({ ...prev, ...fare, promo_code: code }));
    return promo;
  };

  const handleConfirm = () => {
    const ref = "LM" + Date.now().toString(36).toUpperCase();
    createMutation.mutate({ ...data, booking_ref: ref, status: "pending", payment_status: "pending" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">{settings.company_name || "LimoElite"}</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {step === 0 && <StepTripDetails data={data} onChange={setData} routes={routes} onNext={() => setStep(1)} />}
          {step === 1 && <StepVehicle data={data} onChange={setData} vehicles={vehicles} settings={settings} routes={routes} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <StepPassengerInfo data={data} onChange={setData} onValidatePromo={handleValidatePromo} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <StepSummary data={data} onBack={() => setStep(2)} onConfirm={handleConfirm} isSubmitting={createMutation.isPending} />}
          {step === 4 && <StepConfirmation booking={confirmedBooking || data} />}
        </AnimatePresence>
      </div>
    </div>
  );
}