import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Sparkles, Plane, Clock, MapPin, Car, Zap, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  {
    id: "airport_transfer",
    name: "Airport Transfer",
    description: "Perfect for airport pickups & drop-offs with flight tracking. Includes flat-rate routes and flight number field.",
    icon: Plane,
    color: "#3b82f6",
    badge: "Most Popular",
    bookingTypes: ["flat_rate", "distance"],
    defaultBookingType: "flat_rate",
    title: "Airport Transfer Booking",
    subtitle: "Professional airport transfers — on time, every time",
    fields: [
      { id: "pickup_address", label: "Pickup Address", type: "address", required: true, enabled: true, order: 1 },
      { id: "dropoff_address", label: "Dropoff / Destination", type: "address", required: false, enabled: true, order: 2 },
      { id: "pickup_date", label: "Travel Date", type: "date", required: true, enabled: true, order: 3 },
      { id: "pickup_time", label: "Pickup Time", type: "time", required: true, enabled: true, order: 4 },
      { id: "flight_number", label: "Flight Number", type: "text", required: true, enabled: true, order: 5 },
      { id: "passenger_name", label: "Full Name", type: "text", required: true, enabled: true, order: 6 },
      { id: "passenger_email", label: "Email Address", type: "email", required: true, enabled: true, order: 7 },
      { id: "passenger_phone", label: "Phone Number", type: "tel", required: true, enabled: true, order: 8 },
      { id: "passengers_count", label: "Passengers", type: "number", required: false, enabled: true, order: 9 },
      { id: "luggage_count", label: "Luggage Bags", type: "number", required: false, enabled: true, order: 10 },
      { id: "special_requests", label: "Special Requests", type: "textarea", required: false, enabled: true, order: 11 },
      { id: "promo_code", label: "Promo Code", type: "text", required: false, enabled: false, order: 12 },
    ],
    features: ["Flight number tracking", "Flat-rate routes", "Meet & greet option", "Luggage tracking"],
  },
  {
    id: "hourly_charter",
    name: "Hourly Charter",
    description: "Ideal for corporate events, city tours, and flexible bookings. Customers choose hours needed.",
    icon: Clock,
    color: "#8b5cf6",
    badge: "Corporate",
    bookingTypes: ["hourly"],
    defaultBookingType: "hourly",
    title: "Charter Your Ride by the Hour",
    subtitle: "Flexible hourly bookings — your schedule, your way",
    fields: [
      { id: "pickup_address", label: "Start Location", type: "address", required: true, enabled: true, order: 1 },
      { id: "dropoff_address", label: "Return Location (if different)", type: "address", required: false, enabled: true, order: 2 },
      { id: "pickup_date", label: "Booking Date", type: "date", required: true, enabled: true, order: 3 },
      { id: "pickup_time", label: "Start Time", type: "time", required: true, enabled: true, order: 4 },
      { id: "passenger_name", label: "Full Name", type: "text", required: true, enabled: true, order: 5 },
      { id: "passenger_email", label: "Email", type: "email", required: true, enabled: true, order: 6 },
      { id: "passenger_phone", label: "Phone", type: "tel", required: true, enabled: true, order: 7 },
      { id: "passengers_count", label: "Number of Passengers", type: "number", required: false, enabled: true, order: 8 },
      { id: "special_requests", label: "Event/Purpose Details", type: "textarea", required: false, enabled: true, order: 9 },
      { id: "luggage_count", label: "Luggage", type: "number", required: false, enabled: false, order: 10 },
      { id: "flight_number", label: "Flight Number", type: "text", required: false, enabled: false, order: 11 },
      { id: "promo_code", label: "Promo Code", type: "text", required: false, enabled: true, order: 12 },
    ],
    features: ["Hourly billing", "No fixed routes", "Corporate friendly", "Flexible return"],
  },
  {
    id: "on_demand",
    name: "On-Demand Ride",
    description: "Simple ride-hailing style form. Great for taxi services and immediate bookings.",
    icon: Zap,
    color: "#f59e0b",
    badge: "Quick",
    bookingTypes: ["on_demand", "distance"],
    defaultBookingType: "on_demand",
    title: "Book a Ride Now",
    subtitle: "Fast, reliable rides on demand",
    fields: [
      { id: "pickup_address", label: "Where are you?", type: "address", required: true, enabled: true, order: 1 },
      { id: "dropoff_address", label: "Where to?", type: "address", required: true, enabled: true, order: 2 },
      { id: "pickup_date", label: "Date", type: "date", required: true, enabled: true, order: 3 },
      { id: "pickup_time", label: "Time", type: "time", required: true, enabled: true, order: 4 },
      { id: "passenger_name", label: "Your Name", type: "text", required: true, enabled: true, order: 5 },
      { id: "passenger_phone", label: "Mobile Number", type: "tel", required: true, enabled: true, order: 6 },
      { id: "passenger_email", label: "Email", type: "email", required: false, enabled: true, order: 7 },
      { id: "passengers_count", label: "Passengers", type: "number", required: false, enabled: true, order: 8 },
      { id: "special_requests", label: "Notes for driver", type: "textarea", required: false, enabled: false, order: 9 },
      { id: "luggage_count", label: "Luggage", type: "number", required: false, enabled: false, order: 10 },
      { id: "flight_number", label: "Flight Number", type: "text", required: false, enabled: false, order: 11 },
      { id: "promo_code", label: "Promo Code", type: "text", required: false, enabled: false, order: 12 },
    ],
    features: ["Minimal fields", "Fast booking", "Mobile optimized", "Instant quotes"],
  },
  {
    id: "luxury_limo",
    name: "Luxury Limousine",
    description: "Premium experience form for weddings, proms, VIP clients. Emphasis on details and special requests.",
    icon: Car,
    color: "#d4a017",
    badge: "Premium",
    bookingTypes: ["flat_rate", "hourly", "distance"],
    defaultBookingType: "hourly",
    title: "Book Your Luxury Experience",
    subtitle: "Arrive in style — every detail matters",
    fields: [
      { id: "pickup_address", label: "Pickup Location", type: "address", required: true, enabled: true, order: 1 },
      { id: "dropoff_address", label: "Destination", type: "address", required: true, enabled: true, order: 2 },
      { id: "pickup_date", label: "Event Date", type: "date", required: true, enabled: true, order: 3 },
      { id: "pickup_time", label: "Pickup Time", type: "time", required: true, enabled: true, order: 4 },
      { id: "passenger_name", label: "Client Name", type: "text", required: true, enabled: true, order: 5 },
      { id: "passenger_email", label: "Email Address", type: "email", required: true, enabled: true, order: 6 },
      { id: "passenger_phone", label: "Phone Number", type: "tel", required: true, enabled: true, order: 7 },
      { id: "passengers_count", label: "Number of Guests", type: "number", required: true, enabled: true, order: 8 },
      { id: "luggage_count", label: "Luggage / Bags", type: "number", required: false, enabled: true, order: 9 },
      { id: "special_requests", label: "Special Requests / Event Type", type: "textarea", required: false, enabled: true, order: 10 },
      { id: "flight_number", label: "Flight Number", type: "text", required: false, enabled: false, order: 11 },
      { id: "promo_code", label: "Promo Code", type: "text", required: false, enabled: true, order: 12 },
    ],
    features: ["VIP experience", "Special requests", "Event planning", "All booking types"],
  },
  {
    id: "fixed_routes",
    name: "Fixed Route Shuttle",
    description: "For businesses with set routes between locations. Customers pick from predefined routes with fixed pricing.",
    icon: MapPin,
    color: "#10b981",
    badge: "Shuttle",
    bookingTypes: ["flat_rate"],
    defaultBookingType: "flat_rate",
    title: "Book Your Shuttle",
    subtitle: "Simple, fixed-price routes — no surprises",
    fields: [
      { id: "pickup_address", label: "Pickup Point", type: "address", required: true, enabled: true, order: 1 },
      { id: "dropoff_address", label: "Drop-off Point", type: "address", required: false, enabled: true, order: 2 },
      { id: "pickup_date", label: "Travel Date", type: "date", required: true, enabled: true, order: 3 },
      { id: "pickup_time", label: "Departure Time", type: "time", required: true, enabled: true, order: 4 },
      { id: "passenger_name", label: "Passenger Name", type: "text", required: true, enabled: true, order: 5 },
      { id: "passenger_email", label: "Email", type: "email", required: true, enabled: true, order: 6 },
      { id: "passenger_phone", label: "Phone", type: "tel", required: true, enabled: true, order: 7 },
      { id: "passengers_count", label: "Number of Seats", type: "number", required: true, enabled: true, order: 8 },
      { id: "luggage_count", label: "Luggage", type: "number", required: false, enabled: true, order: 9 },
      { id: "special_requests", label: "Notes", type: "textarea", required: false, enabled: false, order: 10 },
      { id: "flight_number", label: "Flight Number", type: "text", required: false, enabled: false, order: 11 },
      { id: "promo_code", label: "Promo Code", type: "text", required: false, enabled: true, order: 12 },
    ],
    features: ["Fixed pricing", "Route-based", "Shuttle ready", "No fare calculation"],
  },
];

export default function TenantFormTemplates() {
  const { tenant, slug, primaryColor } = useOutletContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ templateId, formConfig }) => base44.entities.Tenant.update(tenant.id, { form_config: formConfig }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-admin", slug] });
      setApplied(variables.templateId);
      setApplying(null);
      toast.success("Template applied! Your booking form is updated.", {
        action: { label: "Preview Form", onClick: () => window.open(`/book/${slug}`, "_blank") }
      });
    },
  });

  const applyTemplate = (template) => {
    setApplying(template.id);
    mutation.mutate({
      templateId: template.id,
      formConfig: {
        fields: template.fields,
        title: template.title,
        subtitle: template.subtitle,
        buttonText: "Continue",
        enabledBookingTypes: template.bookingTypes,
        defaultBookingType: template.defaultBookingType,
      },
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Form Templates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Apply a pre-built template to quickly configure your booking form
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/book/${slug}`, "_blank")} className="gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" /> Preview Form
          </Button>
          <Button size="sm" onClick={() => navigate(`/tenant/${slug}/form-builder`)} className="gap-1.5" style={{ background: primaryColor }}>
            Customize Form
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Templates replace your current form configuration</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            Applying a template will update your form fields, title, and booking types. You can further customize after applying in the Form Builder.
          </p>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {TEMPLATES.map((template, i) => {
          const Icon = template.icon;
          const isApplied = applied === template.id;
          const isApplying = applying === template.id;

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-card rounded-2xl border overflow-hidden flex flex-col transition-all ${
                isApplied ? "border-primary shadow-lg shadow-primary/10" : "border-border/50 hover:shadow-md"
              }`}
            >
              {/* Card header */}
              <div className="p-5 pb-4" style={{ borderBottom: `3px solid ${template.color}20` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: template.color + "20" }}>
                    <Icon className="w-5 h-5" style={{ color: template.color }} />
                  </div>
                  <div className="flex items-center gap-2">
                    {isApplied && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Applied
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: template.color + "15", color: template.color }}>
                      {template.badge}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-base">{template.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
              </div>

              {/* Form preview */}
              <div className="px-5 py-4 flex-1 space-y-3">
                <div className="rounded-xl p-3 text-white text-xs" style={{ background: `linear-gradient(135deg, ${template.color}, ${template.color}bb)` }}>
                  <p className="font-bold">{template.title}</p>
                  <p className="opacity-80 mt-0.5">{template.subtitle}</p>
                </div>

                {/* Field preview */}
                <div className="space-y-1.5">
                  {template.fields.filter(f => f.enabled).slice(0, 5).map(f => (
                    <div key={f.id} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: template.color }} />
                      <span className="text-xs text-muted-foreground truncate">{f.label}</span>
                      {f.required && <span className="text-red-400 text-xs ml-auto">*</span>}
                    </div>
                  ))}
                  {template.fields.filter(f => f.enabled).length > 5 && (
                    <p className="text-xs text-muted-foreground pl-3.5">+{template.fields.filter(f => f.enabled).length - 5} more fields</p>
                  )}
                </div>

                {/* Booking types */}
                <div className="flex flex-wrap gap-1.5">
                  {template.bookingTypes.map(bt => (
                    <span key={bt} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium capitalize">
                      {bt.replace("_", " ")}
                    </span>
                  ))}
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-1">
                  {template.features.map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: template.color }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="p-4 pt-0">
                <Button
                  onClick={() => applyTemplate(template)}
                  disabled={isApplying}
                  className="w-full gap-2"
                  style={isApplied ? { background: "#10b981" } : { background: template.color }}
                >
                  {isApplying ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Applying...</>
                  ) : isApplied ? (
                    <><CheckCircle className="w-4 h-4" /> Applied ✓</>
                  ) : (
                    `Use "${template.name}" Template`
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}