import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Copy, Car, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function StepConfirmation({ booking, tenantSlug }) {
  const ref = booking?.booking_ref || booking?.id?.slice(0, 8) || "—";
  const slug = tenantSlug || booking?.tenant_slug;

  // Persist ref to localStorage so tracking page survives refresh
  if (ref && ref !== "—") {
    localStorage.setItem("active_booking_ref", ref);
  }

  const copyRef = () => {
    navigator.clipboard.writeText(ref);
    toast.success("Booking ref copied!");
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-6">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
        className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle className="w-12 h-12 text-emerald-600" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
        <p className="text-muted-foreground mt-1">Your ride has been booked successfully. Check your email for confirmation.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm mx-auto text-left space-y-4">

        {/* Ref */}
        <div className="text-center pb-3 border-b border-border/40">
          <p className="text-xs text-muted-foreground mb-1">Booking Reference</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-2xl font-bold tracking-widest">{ref}</span>
            <button onClick={copyRef} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <Copy className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2.5 text-sm">
          {booking?.pickup_date && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{booking.pickup_date} at {booking.pickup_time}</span>
            </div>
          )}
          {booking?.pickup_address && (
            <div className="flex items-start gap-2.5 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
              <span>{booking.pickup_address}</span>
            </div>
          )}
          {booking?.dropoff_address && (
            <div className="flex items-start gap-2.5 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{booking.dropoff_address}</span>
            </div>
          )}
          {booking?.vehicle_name && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Car className="w-4 h-4 flex-shrink-0" />
              <span>{booking.vehicle_name}</span>
            </div>
          )}
        </div>

        {/* Total */}
        {booking?.total_fare > 0 && (
          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-4 h-4" />Total Fare</span>
            <span className="text-xl font-bold text-primary">${(booking.total_fare || 0).toFixed(2)}</span>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="flex flex-col gap-2 max-w-xs mx-auto">
        <Link to={`/booking/status?ref=${ref}`}>
          <Button className="w-full">Track My Booking</Button>
        </Link>
        <Link to={slug ? `/book/${slug}` : "/book"}>
          <Button variant="outline" className="w-full">Book Another Ride</Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}