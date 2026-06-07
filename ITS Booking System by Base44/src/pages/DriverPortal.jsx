import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, MapPin, Calendar, Clock, User, Phone, ArrowRight, CheckCircle, LogOut } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DriverPortal() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => base44.entities.Driver.list(),
  });

  // Match driver by email
  useEffect(() => {
    if (currentUser && drivers.length > 0) {
      const match = drivers.find(d => d.email === currentUser.email);
      if (match) setDriver(match);
    }
  }, [currentUser, drivers]);

  const { data: bookings = [] } = useQuery({
    queryKey: ["driver-bookings", driver?.id],
    queryFn: () => driver ? base44.entities.Booking.filter({ driver_id: driver.id }) : Promise.resolve([]),
    enabled: !!driver?.id,
  });

  const updateBooking = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["driver-bookings"] }),
  });

  const updateStatus = useMutation({
    mutationFn: (newData) => base44.entities.Driver.update(driver.id, newData),
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ["drivers"] }); setDriver(prev => ({ ...prev, ...variables })); },
  });

  const activeBookings = bookings.filter(b => ["confirmed", "in_progress"].includes(b.status));
  const pastBookings = bookings.filter(b => ["completed", "cancelled"].includes(b.status));

  if (!driver) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Driver Portal</h2>
          <p className="text-muted-foreground">No driver profile found for your account.<br />Contact admin to set up your driver profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-sm">{driver.full_name}</span>
              <StatusBadge status={driver.status || "offline"} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={driver.status || "offline"} onValueChange={v => updateStatus.mutate({ status: v })}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Active Jobs */}
        <section>
          <h2 className="text-lg font-bold mb-3">Active Jobs ({activeBookings.length})</h2>
          <AnimatePresence>
            {activeBookings.map(b => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-card rounded-2xl border border-border/50 p-4 mb-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-muted-foreground">{b.booking_ref}</span>
                  <StatusBadge status={b.status} />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-emerald-500 mt-0.5" /><span className="text-sm">{b.pickup_address}</span></div>
                  {b.dropoff_address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-red-500 mt-0.5" /><span className="text-sm">{b.dropoff_address}</span></div>}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.pickup_date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.pickup_time}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{b.passenger_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-primary">${(b.total_fare || 0).toFixed(2)}</span>
                  {b.status === "confirmed" && (
                    <Button size="sm" onClick={() => updateBooking.mutate({ id: b.id, data: { status: "in_progress" } })} className="gap-1">
                      Start Trip <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                  {b.status === "in_progress" && (
                    <Button size="sm" onClick={() => updateBooking.mutate({ id: b.id, data: { status: "completed" } })} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle className="w-3 h-3" /> Complete
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {activeBookings.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No active jobs</p>}
        </section>

        {/* Past Jobs */}
        <section>
          <h2 className="text-lg font-bold mb-3">Past Jobs</h2>
          {pastBookings.slice(0, 10).map(b => (
            <div key={b.id} className="flex items-center justify-between py-3 border-b border-border/50">
              <div>
                <span className="font-mono text-xs text-muted-foreground">{b.booking_ref}</span>
                <p className="text-sm font-medium">{b.passenger_name}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={b.status} />
                <p className="text-sm font-semibold mt-1">${(b.total_fare || 0).toFixed(2)}</p>
              </div>
            </div>
          ))}
          {pastBookings.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No past jobs</p>}
        </section>
      </div>
    </div>
  );
}