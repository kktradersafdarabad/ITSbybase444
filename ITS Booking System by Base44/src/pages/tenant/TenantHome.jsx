import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { CalendarCheck, DollarSign, Clock, CheckCircle, Users } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";

export default function TenantHome() {
  const { tenant, primaryColor } = useOutletContext();

  const { data: bookings = [] } = useQuery({
    queryKey: ["tenant-bookings-home", tenant.id],
    queryFn: () => base44.entities.TenantBooking.filter({ tenant_id: tenant.id }, "-created_date", 100),
    enabled: !!tenant?.id,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["tenant-drivers", tenant.id],
    queryFn: () => base44.entities.Driver.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const active = bookings.filter(b => ["confirmed","arrived","in_progress"].includes(b.status)).length;
  const completed = bookings.filter(b => b.status === "completed").length;
  const revenue = bookings.filter(b => b.status === "completed").reduce((s, b) => s + (b.total_fare || 0), 0);
  const recent = bookings.slice(0, 8);

  const stats = [
    { label: "Total Bookings", value: total, icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Active Now", value: active, icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "Completed", value: completed, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Revenue", value: `$${revenue.toFixed(0)}`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Drivers", value: drivers.filter(d => d.status === "available").length + "/" + drivers.length, icon: Users, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}aa)` }}
      >
        <h1 className="text-2xl font-bold">{tenant.business_name}</h1>
        <p className="opacity-80 mt-1 text-sm">{tenant.owner_email} · Plan: <strong className="capitalize">{tenant.plan}</strong></p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border/50 p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="font-semibold">Recent Bookings</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Ref</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Passenger</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell">Pickup</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Fare</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(b => (
              <tr key={b.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{b.booking_ref || b.id?.slice(0,8)}</td>
                <td className="py-3 px-4">
                  <div className="font-medium">{b.passenger_name}</div>
                  <div className="text-xs text-muted-foreground">{b.passenger_phone}</div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell text-xs max-w-[160px] truncate text-muted-foreground">{b.pickup_address}</td>
                <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">{b.pickup_date} {b.pickup_time}</td>
                <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                <td className="py-3 px-4 text-right font-semibold">${(b.total_fare || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {recent.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No bookings yet</p>
          </div>
        )}
      </div>
    </div>
  );
}