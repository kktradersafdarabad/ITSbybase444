import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { sendStatusUpdateEmail, sendDriverJobAlert } from "@/lib/emailService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, CalendarDays, List } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import BookingDetailModal from "@/components/bookings/BookingDetailModal";
import BookingsCalendar from "@/components/bookings/BookingsCalendar";
import { motion } from "framer-motion";

export default function Bookings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "calendar"
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => base44.entities.Booking.list("-created_date", 200),
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => base44.entities.Driver.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: (result, { data: updateData }) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      // Send email if status changed
      if (updateData.status && result) {
        sendStatusUpdateEmail(result).catch(() => {});
        // If driver assigned, alert driver
        if (updateData.driver_id && updateData.driver_name) {
          const driver = drivers.find(d => d.id === updateData.driver_id);
          if (driver?.email) {
            sendDriverJobAlert(result, driver.email, driver.full_name).catch(() => {});
          }
        }
      }
      setSelected(null);
    },
  });

  const filtered = bookings.filter(b => {
    const matchSearch = !search || 
      b.passenger_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_ref?.toLowerCase().includes(search.toLowerCase()) ||
      b.pickup_address?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Bookings" subtitle={`${bookings.length} total bookings`} />

      {/* View toggle + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* View toggle */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <CalendarDays className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {/* Calendar view */}
      {viewMode === "calendar" && (
        <BookingsCalendar bookings={bookings} onSelectBooking={setSelected} />
      )}

      {/* List view filters */}
      {viewMode === "list" && <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>}

      {/* Table */}
      {viewMode === "list" &&
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
                <motion.tr 
                  key={b.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelected(b)}
                >
                  <td className="py-3 px-4 font-mono text-xs">{b.booking_ref || b.id?.slice(0, 8)}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{b.passenger_name}</div>
                    <div className="text-xs text-muted-foreground">{b.passenger_phone}</div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                    {b.pickup_address} → {b.dropoff_address}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">{b.pickup_date} {b.pickup_time}</td>
                  <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                  <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">{b.driver_name || "—"}</td>
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
      </motion.div>}

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