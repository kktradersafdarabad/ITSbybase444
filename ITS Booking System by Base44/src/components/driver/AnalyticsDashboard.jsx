import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Star, TrendingUp, DollarSign, CheckCircle, Calendar } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-primary mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ driver, bookings, primaryColor }) {
  const completed = useMemo(() => bookings.filter(b => b.status === "completed"), [bookings]);
  const lifetimeEarnings = useMemo(() => completed.reduce((s, b) => s + (b.total_fare || 0), 0), [completed]);

  // Last 8 weeks earnings
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const label = `W${8 - i}`;
      const earnings = completed
        .filter(b => {
          const d = new Date(b.pickup_date || b.created_date);
          return d >= weekStart && d < weekEnd;
        })
        .reduce((s, b) => s + (b.total_fare || 0), 0);
      const trips = completed.filter(b => {
        const d = new Date(b.pickup_date || b.created_date);
        return d >= weekStart && d < weekEnd;
      }).length;
      weeks.push({ label, earnings: parseFloat(earnings.toFixed(2)), trips });
    }
    return weeks;
  }, [completed]);

  // Last 6 months
  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const earnings = completed
        .filter(b => {
          const bd = new Date(b.pickup_date || b.created_date);
          return bd.getMonth() === m && bd.getFullYear() === y;
        })
        .reduce((s, b) => s + (b.total_fare || 0), 0);
      months.push({ label: monthNames[m], earnings: parseFloat(earnings.toFixed(2)) });
    }
    return months;
  }, [completed]);

  // Avg rating
  const avgRating = driver?.rating || 5.0;

  // Completion rate
  const allAssigned = bookings.filter(b => ["completed", "cancelled"].includes(b.status));
  const completionRate = allAssigned.length > 0
    ? Math.round((completed.length / allAssigned.length) * 100)
    : 100;

  // This week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEarnings = completed
    .filter(b => new Date(b.pickup_date || b.created_date) >= weekStart)
    .reduce((s, b) => s + (b.total_fare || 0), 0);

  return (
    <div className="space-y-5">
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={CheckCircle}
          label="Total Trips"
          value={driver?.total_trips || completed.length}
          sub={`${completionRate}% completion rate`}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          icon={DollarSign}
          label="Lifetime Earnings"
          value={`$${lifetimeEarnings.toFixed(0)}`}
          sub={`$${weekEarnings.toFixed(0)} this week`}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={Star}
          label="Avg Customer Rating"
          value={`${avgRating.toFixed(1)} ★`}
          sub="Out of 5.0"
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          icon={Calendar}
          label="This Week"
          value={completed.filter(b => new Date(b.pickup_date || b.created_date) >= weekStart).length + " trips"}
          sub={`$${weekEarnings.toFixed(2)} earned`}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Weekly Earnings Chart */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Weekly Earnings (Last 8 Weeks)
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v) => [`$${v}`, "Earnings"]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="earnings" fill={primaryColor || "#d4a017"} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trend */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <h3 className="font-semibold text-sm mb-4">Monthly Performance Trend</h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v) => [`$${v}`, "Earnings"]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="earnings" stroke={primaryColor || "#d4a017"} strokeWidth={2.5} dot={{ r: 4, fill: primaryColor || "#d4a017" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trips per week chart */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <h3 className="font-semibold text-sm mb-4">Trips Per Week</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip formatter={(v) => [v, "Trips"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="trips" fill="#60a5fa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}