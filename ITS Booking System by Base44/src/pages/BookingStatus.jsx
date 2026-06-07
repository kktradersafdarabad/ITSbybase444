import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Clock, Car, User, CheckCircle, Circle, Crown, Star, Download, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import DriverLiveMap from "@/components/tracking/DriverLiveMap";
import RatingModal from "@/components/shared/RatingModal";
import { generateBookingInvoice } from "@/lib/invoiceGenerator";

const statusSteps = ["pending", "confirmed", "in_progress", "completed"];
const statusLabels = { pending: "Pending", confirmed: "Confirmed", in_progress: "In Progress", completed: "Completed" };

const LS_KEY = "active_booking_ref";

export default function BookingStatus() {
  const params = new URLSearchParams(window.location.search);
  const urlRef = params.get("ref") || "";

  // Restore from localStorage if no URL ref — keeps tracking after page refresh
  const savedRef = localStorage.getItem(LS_KEY) || "";
  const initialRef = urlRef || savedRef;

  const [refInput, setRefInput] = useState(initialRef);
  const [searchRef, setSearchRef] = useState(initialRef);
  const [showRating, setShowRating] = useState(false);
  const [rated, setRated] = useState(false);
  const [liveBooking, setLiveBooking] = useState(null);
  const [statusNotif, setStatusNotif] = useState(null);

  // Try TenantBooking first, then Booking
  const { data: tenantBookings = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["booking-status-tenant", searchRef],
    queryFn: () => searchRef ? base44.entities.TenantBooking.filter({ booking_ref: searchRef }) : Promise.resolve([]),
    enabled: !!searchRef,
    refetchInterval: 10000, // poll every 10s for status updates
  });

  const { data: bookings = [], isLoading: loadingBooking } = useQuery({
    queryKey: ["booking-status", searchRef],
    queryFn: () => searchRef ? base44.entities.Booking.filter({ booking_ref: searchRef }) : Promise.resolve([]),
    enabled: !!searchRef,
  });

  const isLoading = loadingTenant || loadingBooking;
  const baseBooking = tenantBookings[0] || bookings[0];
  const booking = liveBooking || baseBooking;

  // Persist active booking ref in localStorage so page refresh continues tracking
  useEffect(() => {
    if (!searchRef) return;
    const b = liveBooking || baseBooking;
    if (!b) return;
    // Keep tracking until completed or cancelled
    if (b.status === "completed" || b.status === "cancelled") {
      localStorage.removeItem(LS_KEY);
    } else {
      localStorage.setItem(LS_KEY, searchRef);
    }
  }, [searchRef, baseBooking?.status, liveBooking?.status]);

  // If URL has ref, also save immediately
  useEffect(() => {
    if (urlRef) {
      setSearchRef(urlRef);
      setRefInput(urlRef);
      localStorage.setItem(LS_KEY, urlRef);
    }
  }, [urlRef]);

  // Real-time subscription for status updates
  useEffect(() => {
    if (!baseBooking?.id) return;
    setLiveBooking(null);

    const statusMessages = {
      confirmed: "✅ Your booking has been confirmed!",
      arrived: "🚗 Your driver has arrived at the pickup!",
      in_progress: "🛣️ Your ride has started!",
      completed: "🏁 Your ride is complete!",
      cancelled: "❌ Your booking has been cancelled.",
    };

    const unsubscribe = base44.entities.TenantBooking.subscribe((event) => {
      if (event.data?.booking_ref !== searchRef) return;
      if (event.type === "update") {
        const newStatus = event.data?.status;
        const prevStatus = (liveBooking || baseBooking)?.status;
        if (newStatus && newStatus !== prevStatus && statusMessages[newStatus]) {
          setStatusNotif(statusMessages[newStatus]);
          setTimeout(() => setStatusNotif(null), 6000);
        }
        setLiveBooking(event.data);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooking?.id, searchRef]);

  const currentStepIndex = booking ? statusSteps.indexOf(booking.status) : -1;
  const isActive = booking?.status === "in_progress" || booking?.status === "arrived" || booking?.status === "confirmed";
  const isCompleted = booking?.status === "completed";
  const tenantId = booking?.tenant_id;

  const handleSearch = () => setSearchRef(refInput);

  const clearSearch = () => {
    setRefInput("");
    setSearchRef("");
    setLiveBooking(null);
    localStorage.removeItem(LS_KEY);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg flex-1">Track Your Ride</span>
          {searchRef && booking && isActive && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-16">

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={refInput}
              onChange={e => setRefInput(e.target.value.toUpperCase())}
              placeholder="Enter booking reference (e.g. TN1A2B3C)"
              className="pl-10"
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Track</Button>
          {searchRef && (
            <Button variant="ghost" size="icon" onClick={clearSearch}><X className="w-4 h-4" /></Button>
          )}
        </div>

        {/* Status notification banner */}
        <AnimatePresence>
          {statusNotif && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-800 text-sm font-medium shadow"
            >
              <Bell className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              {statusNotif}
              <button className="ml-auto" onClick={() => setStatusNotif(null)}><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && searchRef && !booking && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No booking found with reference <strong>{searchRef}</strong></p>
            <p className="text-xs text-muted-foreground mt-1">Check the reference in your confirmation email</p>
          </div>
        )}

        {booking && booking.status !== "cancelled" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Progress steps */}
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center justify-between">
                {statusSteps.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all text-sm",
                        i < currentStepIndex ? "bg-emerald-500 text-white" :
                        i === currentStepIndex ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {i < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] mt-1.5 text-muted-foreground text-center leading-tight max-w-[52px]">{statusLabels[s]}</span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={cn("flex-1 h-0.5 mb-4 mx-1", i < currentStepIndex ? "bg-emerald-400" : "bg-muted")} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE MAP — show for confirmed, arrived, in_progress */}
            {isActive && (
              <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="font-semibold text-sm">Live Driver Tracking</h3>
                  <span className="text-xs text-muted-foreground ml-auto">Updates every 5 seconds</span>
                </div>
                <DriverLiveMap booking={booking} isDriver={false} />
              </div>
            )}

            {/* Booking Details */}
            <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Booking Reference</p>
                  <p className="font-mono font-bold text-sm">{booking.booking_ref}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Fare</p>
                  <p className="text-2xl font-bold text-primary">£{(booking.total_fare || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div><p className="text-xs text-muted-foreground">Pickup</p><p className="font-medium text-sm">{booking.pickup_address}</p></div>
                </div>

                {/* Via stops */}
                {booking.via_stops && (() => {
                  const stops = typeof booking.via_stops === "string" ? JSON.parse(booking.via_stops) : booking.via_stops;
                  return stops?.filter(Boolean).map((stop, i) => (
                    <div key={i} className="flex items-start gap-3 ml-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0 border border-amber-500" />
                      <div><p className="text-xs text-muted-foreground">Via Stop {i + 1}</p><p className="text-sm">{stop}</p></div>
                    </div>
                  ));
                })()}

                {booking.dropoff_address && (
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div><p className="text-xs text-muted-foreground">Dropoff</p><p className="font-medium text-sm">{booking.dropoff_address}</p></div>
                  </div>
                )}

                {booking.return_trip && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    🔄 Return trip included
                  </div>
                )}
              </div>

              <div className="flex gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{booking.pickup_date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{booking.pickup_time}</span>
              </div>

              {booking.vehicle_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Car className="w-4 h-4 text-primary" />
                  <span className="font-medium">{booking.vehicle_name}</span>
                </div>
              )}

              {booking.driver_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Driver: <strong>{booking.driver_name}</strong></span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => generateBookingInvoice(booking)}>
                  <Download className="w-4 h-4" /> Invoice
                </Button>
                {isCompleted && !rated && (
                  <Button size="sm" className="flex-1 gap-2" onClick={() => setShowRating(true)}>
                    <Star className="w-4 h-4" /> Rate Ride
                  </Button>
                )}
                {isCompleted && rated && (
                  <div className="flex-1 flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium">
                    <CheckCircle className="w-4 h-4" /> Reviewed!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {booking && booking.status === "cancelled" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-destructive font-semibold text-lg">Booking Cancelled</p>
            <p className="text-muted-foreground mt-2 text-sm">This booking has been cancelled. Please contact the service provider.</p>
            <Button variant="outline" className="mt-4" onClick={clearSearch}>Track another booking</Button>
          </div>
        )}
      </div>

      {showRating && booking && (
        <RatingModal
          booking={booking}
          tenantId={tenantId}
          onClose={() => setShowRating(false)}
          onSubmitted={() => setRated(true)}
        />
      )}
    </div>
  );
}