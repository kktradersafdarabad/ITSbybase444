import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Clock, User, Phone, LogOut,
  CheckCircle, Navigation, Car, TrendingUp,
  Briefcase, ChevronRight, Star, AlertCircle, BarChart2, Download
} from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { sendStatusUpdateEmail } from "@/lib/emailService";
import { sendWhatsAppStatusUpdate } from "@/lib/whatsappService";
import AnalyticsDashboard from "@/components/driver/AnalyticsDashboard";
import DriverLiveMap from "@/components/tracking/DriverLiveMap";
import { generateBookingInvoice } from "@/lib/invoiceGenerator";
import PwaInstallBanner from "@/components/driver/PwaInstallBanner";

function useSlug() {
  const parts = window.location.pathname.split("/");
  return parts[2] || null;
}

function getWeekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}
function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function DriverApp() {
  const slug = useSlug();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [earningsPeriod, setEarningsPeriod] = useState("week");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeJobExpanded, setActiveJobExpanded] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => setCurrentUser(null));
    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenant-driver-app", slug],
    queryFn: () => base44.entities.Tenant.filter({ slug }),
    enabled: !!slug,
  });
  const tenant = tenants[0];

  const { data: allDrivers = [] } = useQuery({
    queryKey: ["tenant-drivers", slug],
    queryFn: () => base44.entities.Driver.filter({ tenant_id: tenant?.id }),
    enabled: !!currentUser && !!tenant?.id,
  });

  useEffect(() => {
    if (currentUser && allDrivers.length > 0) {
      const match = allDrivers.find(d => d.email === currentUser.email);
      setDriver(match || null);
    }
  }, [currentUser, allDrivers]);

  const { data: bookings = [] } = useQuery({
    queryKey: ["driver-app-bookings", driver?.id, slug],
    queryFn: () => base44.entities.TenantBooking.filter({ driver_id: driver.id, tenant_slug: slug }),
    enabled: !!driver?.id && !!slug,
    refetchInterval: 30000,
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TenantBooking.update(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["driver-app-bookings"] });
      sendStatusUpdateEmail(result, tenant?.business_name).catch(() => {});
      sendWhatsAppStatusUpdate(result, tenant).catch(() => {});
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: (data) => base44.entities.Driver.update(driver.id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["all-drivers"] });
      setDriver(prev => ({ ...prev, ...vars }));
    },
  });

  const STATUS_ACTIONS = {
    confirmed: { label: "Arrived at Pickup", next: "arrived", color: "bg-blue-600 hover:bg-blue-700", icon: Navigation },
    arrived: { label: "Start Ride", next: "in_progress", color: "bg-amber-500 hover:bg-amber-600", icon: Car },
    in_progress: { label: "Complete Ride", next: "completed", color: "bg-emerald-600 hover:bg-emerald-700", icon: CheckCircle },
  };

  const weekStart = getWeekRange();
  const monthStart = getMonthStart();
  const completedBookings = bookings.filter(b => b.status === "completed");
  const weekBookings = completedBookings.filter(b => b.pickup_date && new Date(b.pickup_date) >= weekStart);
  const monthBookings = completedBookings.filter(b => b.pickup_date && new Date(b.pickup_date) >= monthStart);
  const periodBookings = earningsPeriod === "week" ? weekBookings : monthBookings;
  const periodEarnings = periodBookings.reduce((s, b) => s + (b.total_fare || 0), 0);

  const activeJobs = bookings.filter(b => ["confirmed", "arrived", "in_progress"].includes(b.status));
  const recentJobs = bookings.filter(b => ["completed", "cancelled"].includes(b.status))
    .sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0))
    .slice(0, 20);

  if (!currentUser) {
    return (
      <DriverLoginScreen
        tenant={tenant}
        onLogin={() => { setIsLoggingIn(true); base44.auth.redirectToLogin(window.location.href); }}
        isLoggingIn={isLoggingIn}
      />
    );
  }

  if (currentUser && allDrivers.length > 0 && !driver) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold">No Driver Profile</h2>
          <p className="text-muted-foreground text-sm">
            Your account (<strong>{currentUser.email}</strong>) is not linked to a driver profile.<br />
            Contact your dispatcher to get access.
          </p>
          <Button variant="outline" onClick={() => base44.auth.logout()} className="gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const primaryColor = tenant?.primary_color || "#C91C14";

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/50 bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: primaryColor }}>
              {driver.full_name?.[0] || "D"}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{driver.full_name}</p>
              <p className="text-xs text-muted-foreground">{tenant?.business_name || "Driver App"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={driver.status || "offline"} onValueChange={v => updateDriverMutation.mutate({ status: v })}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${driver.status === "available" ? "bg-emerald-500" : driver.status === "on_trip" ? "bg-blue-500" : "bg-gray-400"}`} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on_trip">On Trip</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <PwaInstallBanner />
      <div className="max-w-lg mx-auto px-4 py-5">
        <div className="bg-white/70 dark:bg-card/70 rounded-2xl shadow-sm border border-border/30 p-4">
        <Tabs defaultValue="jobs">
          <TabsList className="grid grid-cols-4 w-full mb-5">
            <TabsTrigger value="jobs" className="gap-1 text-xs">
              <Briefcase className="w-3.5 h-3.5" />
              Jobs
              {activeJobs.length > 0 && (
                <span className="ml-0.5 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {activeJobs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1 text-xs">
              <Clock className="w-3.5 h-3.5" /> History
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-1 text-xs">
              <TrendingUp className="w-3.5 h-3.5" /> Earnings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 text-xs">
              <BarChart2 className="w-3.5 h-3.5" /> Stats
            </TabsTrigger>
          </TabsList>

          {/* Active Jobs Tab */}
          <TabsContent value="jobs" className="space-y-3">
            {activeJobs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No active jobs</p>
                <p className="text-sm mt-1">New jobs will appear here when assigned.</p>
              </div>
            ) : (
              <AnimatePresence>
                {activeJobs.map(b => {
                  const action = STATUS_ACTIONS[b.status];
                  const ActionIcon = action?.icon;
                  const isExpanded = activeJobExpanded === b.id;
                  return (
                    <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">{b.booking_ref || b.id?.slice(0, 8)}</span>
                        <StatusBadge status={b.status} />
                      </div>

                      {/* Passenger */}
                      <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-xl">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{b.passenger_name}</p>
                          {b.passenger_phone && (
                            <a href={`tel:${b.passenger_phone}`} className="text-xs text-primary flex items-center gap-1">
                              <Phone className="w-3 h-3" />{b.passenger_phone}
                            </a>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{b.passengers_count || 1} pax</span>
                      </div>

                      {/* Route */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <p className="text-sm">{b.pickup_address}</p>
                        </div>
                        {b.dropoff_address && (
                          <>
                            <div className="ml-1 w-px h-4 bg-border" />
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                              <p className="text-sm">{b.dropoff_address}</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Date/Time + Fare */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.pickup_date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.pickup_time}</span>
                        {b.flight_number && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">✈ {b.flight_number}</span>}
                        <span className="font-bold text-foreground text-sm">${(b.total_fare || 0).toFixed(2)}</span>
                      </div>

                      {b.special_requests && (
                        <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                          📝 {b.special_requests}
                        </div>
                      )}

                      {/* Live Tracker for in_progress */}
                      {b.status === "in_progress" && (
                        <div className="mb-4">
                          <DriverLiveMap booking={b} driverId={driver.id} isDriver={true} />
                        </div>
                      )}

                      {/* Action Button */}
                      {action && (
                        <Button
                          className={`w-full gap-2 text-white ${action.color}`}
                          onClick={() => updateBookingMutation.mutate({ id: b.id, data: { status: action.next } })}
                          disabled={updateBookingMutation.isPending}
                        >
                          {ActionIcon && <ActionIcon className="w-4 h-4" />}
                          {action.label}
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-2">
            {recentJobs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No completed jobs yet</p>
              </div>
            ) : (
              recentJobs.map(b => (
                <div key={b.id} className="bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{b.booking_ref || b.id?.slice(0, 8)}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-sm font-medium">{b.passenger_name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{b.pickup_address}</p>
                    <p className="text-xs text-muted-foreground">{b.pickup_date} · {b.pickup_time}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-lg">${(b.total_fare || 0).toFixed(2)}</p>
                    {b.vehicle_name && <p className="text-xs text-muted-foreground">{b.vehicle_name}</p>}
                    <button
                      onClick={() => generateBookingInvoice(b, tenant?.business_name)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Download className="w-3 h-3" /> Invoice
                    </button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            <div className="flex gap-2">
              <Button size="sm" variant={earningsPeriod === "week" ? "default" : "outline"} onClick={() => setEarningsPeriod("week")} className="flex-1">This Week</Button>
              <Button size="sm" variant={earningsPeriod === "month" ? "default" : "outline"} onClick={() => setEarningsPeriod("month")} className="flex-1">This Month</Button>
            </div>

            <div className="rounded-2xl p-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}>
              <p className="text-sm opacity-80 mb-1">Total Earnings ({earningsPeriod === "week" ? "This Week" : "This Month"})</p>
              <p className="text-4xl font-bold">${periodEarnings.toFixed(2)}</p>
              <p className="text-sm opacity-80 mt-2">{periodBookings.length} completed trips</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
                <p className="text-2xl font-bold">{driver.total_trips || completedBookings.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Trips</p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <p className="text-2xl font-bold">{(driver.rating || 5.0).toFixed(1)}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Rating</p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
                <p className="text-2xl font-bold">${weekEarningsCalc(completedBookings).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">This Week</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-2">
              <h3 className="font-semibold text-sm mb-3">
                {earningsPeriod === "week" ? "Weekly" : "Monthly"} Breakdown
              </h3>
              {periodBookings.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No completed trips this {earningsPeriod}</p>
              ) : (
                periodBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{b.passenger_name}</p>
                      <p className="text-xs text-muted-foreground">{b.pickup_date} · {b.pickup_time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">+${(b.total_fare || 0).toFixed(2)}</p>
                      <button onClick={() => generateBookingInvoice(b, tenant?.business_name)} className="text-xs text-primary flex items-center gap-1">
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
              {periodBookings.length > 0 && (
                <div className="flex justify-between pt-2 font-bold border-t border-border">
                  <span>Total</span>
                  <span className="text-emerald-600">${periodEarnings.toFixed(2)}</span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard driver={driver} bookings={bookings} primaryColor={primaryColor} />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}

function weekEarningsCalc(bookings) {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return bookings.filter(b => b.pickup_date && new Date(b.pickup_date) >= start).reduce((s, b) => s + (b.total_fare || 0), 0);
}

function DriverLoginScreen({ tenant, onLogin, isLoggingIn }) {
  const primaryColor = tenant?.primary_color || "#C91C14";
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg" style={{ background: primaryColor }}>
          <Car className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{tenant?.business_name || "Driver App"}</h1>
          <p className="text-muted-foreground mt-2">Driver Portal — Sign in to view your jobs and earnings</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> View assigned jobs</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Live trip tracking & navigation</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Analytics dashboard & earnings</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Download trip invoices</div>
          </div>
          <Button className="w-full h-12 text-base gap-2" style={{ background: primaryColor }} onClick={onLogin} disabled={isLoggingIn}>
            {isLoggingIn ? "Redirecting..." : "Sign In to Driver App"}
            {!isLoggingIn && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Don't have access? Contact your dispatcher.</p>
      </motion.div>
    </div>
  );
}