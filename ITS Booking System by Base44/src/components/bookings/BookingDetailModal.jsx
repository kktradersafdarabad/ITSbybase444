import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/shared/StatusBadge";
import { MapPin, Calendar, Clock, User, Car, CreditCard, Phone, Mail } from "lucide-react";
import { useState } from "react";

const statusTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
};

export default function BookingDetailModal({ booking, drivers, onClose, onUpdate, isUpdating }) {
  const [driverId, setDriverId] = useState(booking.driver_id || "");

  const handleStatusChange = (newStatus) => {
    onUpdate(booking.id, { status: newStatus });
  };

  const handleAssignDriver = () => {
    const driver = drivers.find(d => d.id === driverId);
    onUpdate(booking.id, { driver_id: driverId, driver_name: driver?.full_name || "" });
  };

  const nextStatuses = statusTransitions[booking.status] || [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Booking #{booking.booking_ref || booking.id?.slice(0, 8)}
            <StatusBadge status={booking.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Passenger Info */}
          <section>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Passenger</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /><span>{booking.passenger_name}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-sm">{booking.passenger_email}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-sm">{booking.passenger_phone}</span></div>
            </div>
          </section>

          <Separator />

          {/* Trip Info */}
          <section>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Trip Details</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                <div><span className="text-xs text-muted-foreground">Pickup</span><p className="text-sm">{booking.pickup_address}</p></div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                <div><span className="text-xs text-muted-foreground">Dropoff</span><p className="text-sm">{booking.dropoff_address}</p></div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-muted-foreground" />{booking.pickup_date}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-muted-foreground" />{booking.pickup_time}</span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Fare */}
          <section>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Fare Breakdown</h4>
            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Base Fare</span><span>${(booking.base_fare || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Distance</span><span>${(booking.distance_charge || 0).toFixed(2)}</span></div>
              {booking.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Discount ({booking.promo_code})</span><span>-${booking.discount_amount.toFixed(2)}</span></div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>${(booking.total_fare || 0).toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground">
                <span>Payment</span>
                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{booking.payment_method?.replace(/_/g, " ") || "—"}</span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Assign Driver */}
          <section>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Assign Driver</h4>
            <div className="flex gap-2">
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.status === "available").map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAssignDriver} disabled={!driverId || isUpdating} size="sm">Assign</Button>
            </div>
          </section>

          {/* Status Actions */}
          {nextStatuses.length > 0 && (
            <div className="flex gap-2 pt-2">
              {nextStatuses.map(s => (
                <Button 
                  key={s} 
                  onClick={() => handleStatusChange(s)} 
                  disabled={isUpdating}
                  variant={s === "cancelled" ? "destructive" : "default"}
                  className="flex-1 capitalize"
                >
                  {s.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}