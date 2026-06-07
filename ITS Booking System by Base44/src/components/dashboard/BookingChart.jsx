import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, isAfter } from "date-fns";

export default function BookingChart({ bookings }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStr = format(date, "yyyy-MM-dd");
    const dayBookings = bookings.filter(b => b.pickup_date === dayStr);
    return {
      day: format(date, "EEE"),
      bookings: dayBookings.length,
      revenue: dayBookings.filter(b => b.status === "completed").reduce((s, b) => s + (b.total_fare || 0), 0),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={last7Days} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}