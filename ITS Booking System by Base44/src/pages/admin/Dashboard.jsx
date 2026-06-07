import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DollarSign, Car, Users, CalendarCheck, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import StatCard from "@/components/shared/StatCard";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import RecentBookingsTable from "@/components/dashboard/RecentBookingsTable";
import BookingChart from "@/components/dashboard/BookingChart";

export default function Dashboard() {
  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => base44.entities.Booking.list("-created_date", 100),
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list(),
  });
  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => base44.entities.Driver.list(),
  });

  const totalRevenue = bookings.filter(b => b.status === "completed").reduce((s, b) => s + (b.total_fare || 0), 0);
  const activeBookings = bookings.filter(b => ["confirmed", "in_progress"].includes(b.status)).length;
  const availableDrivers = drivers.filter(d => d.status === "available").length;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Dashboard" subtitle="Welcome back. Here's your business overview." />

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} trend="+12.5% from last month" trendUp delay={0} />
        <StatCard title="Total Bookings" value={bookings.length} icon={CalendarCheck} trend={`${activeBookings} active`} trendUp delay={0.1} />
        <StatCard title="Fleet Size" value={vehicles.length} icon={Car} delay={0.2} />
        <StatCard title="Drivers" value={drivers.length} icon={Users} trend={`${availableDrivers} available`} trendUp delay={0.3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Booking Trends</h3>
          <BookingChart bookings={bookings} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border/50 p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
          <StatusPieChart bookings={bookings} />
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-card rounded-2xl border border-border/50 p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        <RecentBookingsTable bookings={bookings.slice(0, 10)} />
      </motion.div>
    </div>
  );
}

function StatusPieChart({ bookings }) {
  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  const COLORS = ["#f59e0b", "#3b82f6", "#6366f1", "#10b981", "#ef4444"];

  if (data.length === 0) return <p className="text-muted-foreground text-sm text-center py-12">No bookings yet</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}