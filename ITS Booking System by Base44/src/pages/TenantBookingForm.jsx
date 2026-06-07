import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Crown, AlertCircle } from "lucide-react";
import { sendBookingConfirmation } from "@/lib/emailService";
import { sendWhatsAppBookingConfirmation } from "@/lib/whatsappService";
import { motion, AnimatePresence } from "framer-motion";
import { calculateFare } from "@/lib/fareCalculator";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { hasReachedBookingLimit } from "@/lib/planLimits";

// Steps
import StepTripDetails from "@/components/booking/StepTripDetails";
import StepVehicle from "@/components/booking/StepVehicle";
import TenantStepPassenger from "@/components/booking/TenantStepPassenger";
import StepSummary from "@/components/booking/StepSummary";
import StepConfirmation from "@/components/booking/StepConfirmation";
import StepIndicator from "@/components/booking/StepIndicator";

export default function TenantBookingForm() {
  const pathParts = window.location.pathname.split("/");
  // /book/:slug → pathParts[2], ya phir custom domain pe sessionStorage mein slug ho sakta hai
  const slug = pathParts[2] || sessionStorage.getItem("tenant_slug_for_domain") || "";

  const [step, setStep] = useState(0);
  const [data, setData] = useState({ booking_type: null, passengers_count: 1, luggage_count: 0 });
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [lang, setLang] = useState("en");

  const { data: tenants = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant", slug],
    queryFn: () => base44.entities.Tenant.filter({ slug }),
    enabled: !!slug,
  });

  const tenant = tenants[0];

  // Set default booking type from form config once tenant loads
  useEffect(() => {
    if (!tenant) return;
    if (!data.booking_type) {
      const defaultType = tenant.form_config?.defaultBookingType || "distance";
      setData(prev => ({ ...prev, booking_type: defaultType }));
    }
  }, [tenant?.id]);

  // Build settings from tenant fare settings (UK model)
  const settings = tenant ? {
    base_fare: tenant.flag_fall ?? tenant.base_fare ?? 3.0,
    flag_fall: tenant.flag_fall ?? tenant.base_fare ?? 3.0,
    cost_per_km: tenant.cost_per_km ?? 1.74,
    cost_per_mile: tenant.cost_per_mile ?? 2.80,
    waiting_rate_per_min: tenant.waiting_rate_per_min ?? tenant.cost_per_minute ?? 0.30,
    cost_per_minute: tenant.waiting_rate_per_min ?? tenant.cost_per_minute ?? 0.30,
    hourly_rate: tenant.hourly_rate ?? 55,
    night_premium: tenant.night_premium ?? 0.20,
    surge_multiplier: tenant.surge_multiplier ?? 1,
    surge_start_hour: tenant.surge_start_hour ?? 22,
    surge_end_hour: tenant.surge_end_hour ?? 5,
    currency_symbol: tenant.currency_symbol || "£",
    company_name: tenant.business_name,
    primary_color: tenant.primary_color || "#d4a017",
  } : {};

  // Form config from tenant
  const formConfig = tenant?.form_config || {};
  const enabledBookingTypes = formConfig.enabledBookingTypes?.length
    ? formConfig.enabledBookingTypes
    : ["distance", "hourly", "flat_rate", "on_demand"];
  const showFormBanner = formConfig.showFormBanner !== false;
  const showStepIndicator = formConfig.showStepIndicator !== false;

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles", tenant?.id],
    queryFn: () => base44.entities.Vehicle.filter({ is_active: true, tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ["routes", tenant?.id],
    queryFn: () => base44.entities.Route.filter({ is_active: true, tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const { data: promos = [] } = useQuery({
    queryKey: ["promos", tenant?.id],
    queryFn: () => base44.entities.PromoCode.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  // Booking limit check — count this month's bookings
  const { data: thisMonthBookings = [] } = useQuery({
    queryKey: ["bookings-count-month", tenant?.id],
    queryFn: () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      return base44.entities.TenantBooking.filter({ tenant_id: tenant.id });
    },
    enabled: !!tenant?.id,
  });

  const bookingsThisMonth = thisMonthBookings.filter(b => {
    const d = new Date(b.created_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const bookingLimitReached = tenant ? hasReachedBookingLimit(tenant.plan, bookingsThisMonth) : false;

  const createMutation = useMutation({
    mutationFn: (bookingData) => base44.entities.TenantBooking.create(bookingData),
    onSuccess: (result) => {
      setConfirmedBooking(result);
      setStep(4);
      sendBookingConfirmation(result, tenant?.business_name).catch(() => {});
      sendWhatsAppBookingConfirmation(result, tenant).catch(() => {});
    },
  });

  const handleValidatePromo = async (code) => {
    if (!code) return { valid: false, message: "Enter a promo code" };
    const promo = promos.find(p => p.code?.toLowerCase() === code?.toLowerCase());
    if (!promo) return { valid: false, message: "Promo code not found" };
    if (promo.is_active === false) return { valid: false, message: "This promo code is inactive" };
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) return { valid: false, message: "This promo code has expired" };
    if (promo.max_uses && (promo.current_uses || 0) >= promo.max_uses) return { valid: false, message: "This promo code has reached its usage limit" };

    const selectedVehicle = vehicles.find(v => v.id === data.vehicle_id);
    const selectedRoute = routes.find(r => r.id === data.route_id);

    // Calculate fare without promo first to check min amount
    const fareWithoutPromo = calculateFare({
      bookingType: data.booking_type, vehicle: selectedVehicle, settings,
      distance: data.estimated_distance_km, duration: data.estimated_duration_min,
      hours: data.hours_booked, route: selectedRoute,
      extras: data.selected_extras || [], returnTrip: data.return_trip || false,
    });

    const currentFare = fareWithoutPromo.total_fare || data.total_fare || 0;
    if (promo.min_booking_amount && currentFare < promo.min_booking_amount) {
      return { valid: false, message: `This code requires a minimum booking of £${promo.min_booking_amount}` };
    }

    // Now calculate fare with promo applied
    const fareWithPromo = calculateFare({
      bookingType: data.booking_type, vehicle: selectedVehicle, settings,
      distance: data.estimated_distance_km, duration: data.estimated_duration_min,
      hours: data.hours_booked, route: selectedRoute, promoCode: promo,
      extras: data.selected_extras || [], returnTrip: data.return_trip || false,
    });

    setData(prev => ({ ...prev, ...fareWithPromo, promo_code: code, _base_total_fare: fareWithoutPromo.total_fare }));
    return { valid: true, promo, savedAmount: fareWithPromo.discount_amount };
  };

  const [redirecting, setRedirecting] = useState(false);

  const handleConfirm = async () => {
    const ref = "TN" + Date.now().toString(36).toUpperCase();
    const bookingPayload = {
      ...data,
      booking_ref: ref,
      tenant_id: tenant.id,
      tenant_slug: slug,
      status: "pending",
      payment_status: "pending",
      // UK extras
      via_stops: data.via_stops || null,
      return_trip: data.return_trip || false,
      selected_extras: data.selected_extras || [],
      extras_charge: data.extras_charge || 0,
    };

    if (data.payment_method === "credit_card" && tenant?.stripe_secret_key) {
      setRedirecting(true);
      try {
        sessionStorage.setItem("pending_booking", JSON.stringify(bookingPayload));
        const result = await base44.functions.invoke("createStripeCheckout", {
          tenantSlug: slug,
          amount: data.total_fare || 0,
          bookingRef: ref,
          currency: tenant.currency || "usd",
        });
        if (result?.url) {
          window.location.href = result.url;
        } else {
          setRedirecting(false);
          alert(result?.error || "Failed to create Stripe session. Check your Stripe Secret Key in Integrations.");
        }
      } catch (err) {
        setRedirecting(false);
        alert("Payment error: " + (err?.message || "Please try again."));
      }
      return;
    }

    if (data.payment_method === "paypal" && tenant?.paypal_client_id) {
      sessionStorage.setItem("pending_booking", JSON.stringify(bookingPayload));
      window.location.href = `/pay/${slug}?ref=${ref}&method=paypal&amount=${data.total_fare || 0}`;
      return;
    }

    createMutation.mutate(bookingPayload);
  };

  if (loadingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant || tenant.status === "suspended" || tenant.status === "cancelled") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold">Booking Not Available</h2>
          <p className="text-muted-foreground">This booking link is not active. Please contact the service provider.</p>
        </div>
      </div>
    );
  }

  if (bookingLimitReached) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold">Bookings Temporarily Unavailable</h2>
          <p className="text-muted-foreground text-sm">We have reached our booking capacity for this month. Please check back next month or contact us directly.</p>
          {tenant.phone && <p className="text-sm font-medium">{tenant.phone}</p>}
        </div>
      </div>
    );
  }

  const primaryColor = tenant.primary_color || "#d4a017";
  const formTitle = formConfig.title || "Book Your Ride";
  const formSubtitle = formConfig.subtitle || "Safe, comfortable, and on time";

  return (
    <div className="min-h-screen bg-muted/40" style={{ background: `linear-gradient(160deg, ${primaryColor}10 0%, hsl(220,20%,96%) 40%)` }}>
      {/* Header */}
      <header className="border-b border-border/50 bg-white/90 dark:bg-card/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.business_name} className="h-9 object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: primaryColor }}>
              <Crown className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="font-display font-bold text-base flex-1">{tenant.business_name}</span>
          <LanguageSwitcher value={lang} onChange={setLang} compact />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-16">

        {/* Form Title Banner */}
        {step < 4 && showFormBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 text-white mb-5 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}bb 100%)` }}
          >
            <h1 className="text-xl font-bold">{formTitle}</h1>
            <p className="text-sm opacity-80 mt-1">{formSubtitle}</p>
            <div className="flex items-center gap-3 mt-3 text-xs opacity-70">
              <span>✅ Instant confirmation</span>
              <span>•</span>
              <span>📧 Email receipt</span>
              <span>•</span>
              <span>🔒 Secure payment</span>
            </div>
          </motion.div>
        )}

        {showStepIndicator && <StepIndicator current={step} primaryColor={primaryColor} />}

        <div className="bg-white/70 dark:bg-card/70 rounded-2xl shadow-sm border border-border/30 p-4 mt-2">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepTripDetails
              data={data}
              onChange={setData}
              routes={routes}
              enabledBookingTypes={enabledBookingTypes}
              onNext={() => setStep(1)}
              primaryColor={primaryColor}
              countryCode={tenant.country_code || "GB"}
            />
          )}
          {step === 1 && (
            <StepVehicle
              data={data}
              onChange={setData}
              vehicles={vehicles}
              settings={settings}
              routes={routes}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <TenantStepPassenger
              data={data}
              onChange={setData}
              onValidatePromo={handleValidatePromo}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              tenant={tenant}
            />
          )}
          {step === 3 && (
            <StepSummary
              data={data}
              onBack={() => setStep(2)}
              onConfirm={handleConfirm}
              isSubmitting={createMutation.isPending || redirecting}
            />
          )}
          {step === 4 && (
            <StepConfirmation booking={confirmedBooking || data} tenantSlug={slug} />
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}