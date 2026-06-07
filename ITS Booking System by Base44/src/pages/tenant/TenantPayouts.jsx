import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Download, Pencil, Check, X, TrendingUp, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PERIODS = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last Month", value: "last_month" },
  { label: "All Time", value: "all" },
];

function getDateRange(period) {
  const now = new Date();
  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }
  if (period === "month") {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
  }
  if (period === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end };
  }
  return { start: new Date(0), end: now };
}

export default function TenantPayouts() {
  const { tenant } = useOutletContext();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState("month");
  const [editingDriver, setEditingDriver] = useState(null);
  const [commissionInput, setCommissionInput] = useState("");

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers-payouts", tenant?.id],
    queryFn: () => base44.entities.Driver.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings-payouts", tenant?.id],
    queryFn: () => base44.entities.TenantBooking.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Driver.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers-payouts", tenant?.id] });
      setEditingDriver(null);
    },
  });

  const { start, end } = getDateRange(period);

  const filteredBookings = bookings.filter(b => {
    const d = new Date(b.created_date);
    return d >= start && d <= end && b.status === "completed";
  });

  const driverStats = drivers.map(driver => {
    const driverBookings = filteredBookings.filter(b => b.driver_id === driver.id);
    const totalRevenue = driverBookings.reduce((s, b) => s + (b.total_fare || 0), 0);
    const commission = driver.commission_percent ?? 80; // default 80% to driver
    const driverEarnings = (totalRevenue * commission) / 100;
    const platformCut = totalRevenue - driverEarnings;
    return { ...driver, trips: driverBookings.length, totalRevenue, driverEarnings, platformCut, commission };
  });

  const totals = driverStats.reduce(
    (acc, d) => ({
      trips: acc.trips + d.trips,
      revenue: acc.revenue + d.totalRevenue,
      earnings: acc.earnings + d.driverEarnings,
      platform: acc.platform + d.platformCut,
    }),
    { trips: 0, revenue: 0, earnings: 0, platform: 0 }
  );

  const handleSaveCommission = (driver) => {
    const val = parseFloat(commissionInput);
    if (isNaN(val) || val < 0 || val > 100) return;
    updateDriverMutation.mutate({ id: driver.id, data: { commission_percent: val } });
  };

  const exportCSV = () => {
    const sym = tenant?.currency_symbol || "$";
    const rows = [
      ["Driver", "Trips", "Total Revenue", "Commission %", "Driver Earnings", "Platform Cut"],
      ...driverStats.map(d => [
        d.full_name,
        d.trips,
        `${sym}${d.totalRevenue.toFixed(2)}`,
        `${d.commission}%`,
        `${sym}${d.driverEarnings.toFixed(2)}`,
        `${sym}${d.platformCut.toFixed(2)}`,
      ]),
      [],
      ["TOTALS", totals.trips, `${sym}${totals.revenue.toFixed(2)}`, "", `${sym}${totals.earnings.toFixed(2)}`, `${sym}${totals.platform.toFixed(2)}`],
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payouts-${period}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sym = tenant?.currency_symbol || "$";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" /> Driver Payouts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Calculate driver commissions and export payroll reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={exportCSV} variant="outline" className="gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Trips", value: totals.trips, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Gross Revenue", value: `${sym}${totals.revenue.toFixed(0)}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Driver Payouts", value: `${sym}${totals.earnings.toFixed(0)}`, icon: Users, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { label: "Platform Revenue", value: `${sym}${totals.platform.toFixed(0)}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card rounded-2xl border border-border/50 p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Driver Payout Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-semibold">Driver Breakdown</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Click the pencil icon to set a custom commission % per driver</p>
        </div>

        {drivers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No drivers added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Driver</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Trips</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Commission %</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Driver Payout</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Platform Cut</th>
                </tr>
              </thead>
              <tbody>
                {driverStats.map((driver, i) => (
                  <motion.tr
                    key={driver.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {driver.full_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{driver.full_name}</p>
                          <p className="text-xs text-muted-foreground">{driver.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-4 py-4">
                      <Badge variant="secondary">{driver.trips}</Badge>
                    </td>
                    <td className="text-right px-4 py-4 font-medium">
                      {sym}{driver.totalRevenue.toFixed(2)}
                    </td>
                    <td className="text-center px-4 py-4">
                      {editingDriver === driver.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={commissionInput}
                            onChange={e => setCommissionInput(e.target.value)}
                            className="w-16 h-7 text-center text-sm px-1"
                            autoFocus
                          />
                          <span className="text-muted-foreground">%</span>
                          <button onClick={() => handleSaveCommission(driver)} className="p-1 rounded text-green-600 hover:bg-green-50">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingDriver(null)} className="p-1 rounded text-red-500 hover:bg-red-50">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingDriver(driver.id); setCommissionInput(String(driver.commission)); }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/60 hover:bg-muted transition-colors text-sm font-medium"
                        >
                          {driver.commission}%
                          <Pencil className="w-3 h-3 text-muted-foreground" />
                        </button>
                      )}
                    </td>
                    <td className="text-right px-4 py-4 font-semibold text-emerald-600">
                      {sym}{driver.driverEarnings.toFixed(2)}
                    </td>
                    <td className="text-right px-4 py-4 text-amber-600 font-medium">
                      {sym}{driver.platformCut.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40 font-semibold">
                  <td className="px-5 py-3">TOTAL</td>
                  <td className="text-right px-4 py-3">{totals.trips}</td>
                  <td className="text-right px-4 py-3">{sym}{totals.revenue.toFixed(2)}</td>
                  <td />
                  <td className="text-right px-4 py-3 text-emerald-600">{sym}{totals.earnings.toFixed(2)}</td>
                  <td className="text-right px-4 py-3 text-amber-600">{sym}{totals.platform.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Commission % is the share paid to the driver. Default is 80%. Platform cut = 100% − driver commission.
      </p>
    </div>
  );
}