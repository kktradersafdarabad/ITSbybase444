import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, AlertTriangle, Bell } from "lucide-react";
import { getPlanLimits, hasReachedBookingLimit } from "@/lib/planLimits";
import StatusBadge from "@/components/shared/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import BookingDetailModal from "@/components/bookings/BookingDetailModal";
import { sendStatusUpdateEmail, sendDriverJobAlert } from "@/lib/emailService";
import { sendWhatsAppStatusUpdate, sendWhatsAppDriverAssignment, sendWhatsAppBookingConfirmation } from "@/lib/whatsappService";

export default function TenantBookings() {
  const { tenant } = useOutletContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [liveNotif, setLiveNotif] = useState(null);

  // Real-time subscription — auto-refreshes table when any booking updates
  useEffect(() => {
    if (!tenant?.id) return;
    const unsubscribe = base44.entities.TenantBooking.subscribe((event) => {
      if (event.data?.tenant_id !== tenant.id) return;
      queryClient.invalidateQueries({ queryKey: ["tenant-bookings-page", tenant.id] });
      if (event.type === "update" && event.data?.status) {
        const labels = {
          confirmed: `✅ Booking ${event.data.booking_ref} confirmed`,
          arrived: `🚗 Driver arrived for ${event.data.passenger_name}`,
          in_progress: `🛣️ Ride started — ${event.data.passenger_name}`,
          completed: `🏁 Ride completed — ${event.data.passenger_name}`,
          cancelled: `❌ Booking ${event.data.booking_ref} cancelled`,
        };
        const msg = labels[event.data.status];
        if (msg) {
          setLiveNotif(msg);
          setTimeout(() => setLiveNotif(null), 5000);
        }
      }
    });
    return () => unsubscribe();
  }, [tenant?.id, queryClient]);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["tenant-bookings-page", tenant.id],
    queryFn: () => base44.entities.TenantBooking.filter({ tenant_id: tenant.id }, "-created_date", 200),
    enabled: !!tenant?.id,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["tenant-drivers-list", tenant.id],
    queryFn: () => base44.entities.Driver.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TenantBooking.update(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-bookings-page", tenant.id] });

      // Status update notifications (email + WhatsApp)
      if (variables.data.status) {
        sendStatusUpdateEmail(result, tenant.business_name).catch(() => {});
        sendWhatsAppStatusUpdate(result, tenant).catch(() => {});
      }

      // Driver assignment notifications
      if (variables.data.driver_id) {
        const driver = drivers.find(d => d.id === variables.data.driver_id);
        if (driver) {
          sendDriverJobAlert(result, driver.email, driver.full_name, tenant.business_name).catch(() => {});
          sendWhatsAppDriverAssignment(result, driver, tenant).catch(() => {});
        }
      }
      setSelected(null);
    },
  });

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.passenger_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_ref?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const planLimits = getPlanLimits(tenant.plan);
  const thisMonth = bookings.filter(b => {
    const d = new Date(b.created_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const limitReached = hasReachedBookingLimit(tenant.plan, thisMonth);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {bookings.length} total · This month: <strong>{thisMonth}</strong>
          {planLimits.maxBookingsPerMonth && <span className="text-muted-foreground"> / {planLimits.maxBookingsPerMonth} allowed ({planLimits.label} plan)</span>}
        </p>
      </div>
      {limitReached && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          You have reached your <strong>{planLimits.maxBookingsPerMonth} bookings/month</strong> limit on the <strong>{planLimits.label}</strong> plan. New customers will not be able to make bookings until next month or you upgrade.
        </div>
      )}
      {/* Real-time status notification */}
      <AnimatePresence>
        {liveNotif && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-800 text-sm font-medium shadow"
          >
            <Bell className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            {liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {!limitReached && planLimits.maxBookingsPerMonth && thisMonth >= planLimits.maxBookingsPerMonth * 0.8 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Warning: You have used <strong>{thisMonth} of {planLimits.maxBookingsPerMonth}</strong> bookings this month. Consider upgrading your plan.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="arrived">Arrived</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ref</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Passenger</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Route</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Driver</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Fare</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelected(b)}
                >
                  <td className="py-3 px-4 font-mono text-xs">{b.booking_ref || b.id?.slice(0, 8)}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{b.passenger_name}</div>
                    <div className="text-xs text-muted-foreground">{b.passenger_phone}</div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground truncate max-w-[200px] text-xs">{b.pickup_address} → {b.dropoff_address}</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground text-xs">{b.pickup_date} {b.pickup_time}</td>
                  <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                  <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground text-xs">{b.driver_name || "—"}</td>
                  <td className="py-3 px-4 text-right font-semibold">${(b.total_fare || 0).toFixed(2)}</td>
                  <td className="py-3 px-4"><Eye className="w-4 h-4 text-muted-foreground" /></td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {selected && (
        <BookingDetailModal
          booking={selected}
          drivers={drivers}
          onClose={() => setSelected(null)}
          onUpdate={(id, data) => updateMutation.mutate({ id, data })}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  );
}