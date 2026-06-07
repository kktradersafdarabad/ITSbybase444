import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Plus, Search, LayoutDashboard, Copy,
  Users, Crown, TrendingUp, Building2, CheckCircle, Trash2, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TenantFormModal from "@/components/tenants/TenantFormModal";

const SUPER_ADMIN_EMAIL = "khizardogar001@gmail.com";
const LOGO_URL = "https://media.base44.com/images/public/69df1db75ebf47a17f97c05c/0ec2e135c_craiyon-190410-image1.png";

const planColors = {
  trial: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  pro: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  enterprise: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
};

const statusDot = {
  active: "bg-emerald-500",
  suspended: "bg-red-500",
  cancelled: "bg-gray-400"
};

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setCurrentUser(u); setAuthChecked(true); })
      .catch(() => { setAuthChecked(true); });
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tenant.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Customer deleted.");
      setDeleteConfirm(null);
    },
  });

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list("-created_date")
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["all-tenant-bookings-summary"],
    queryFn: () => base44.entities.TenantBooking.list("-created_date", 500)
  });

  const appUrl = window.location.origin;

  // Loading state
  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  // Access denied — redirect to home
  if (!currentUser || currentUser.email !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-3xl">🔒</div>
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground text-sm">This page is only accessible to the Super Admin.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Go to Home</Button>
      </div>
    );
  }

  const filtered = tenants.filter((t) =>
    t.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.owner_email?.toLowerCase().includes(search.toLowerCase()) ||
    t.owner_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = allBookings
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + (b.total_fare || 0), 0);

  const activeTenantsCount = tenants.filter((t) => t.status === "active").length;
  const totalBookings = allBookings.length;
  const mrr = tenants.reduce((s, t) => s + (t.monthly_fee || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-20 border-b border-border/50 bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ITS" className="w-9 h-9 object-contain rounded-xl" />
            <div>
              <span className="font-display font-bold text-lg leading-none">ITS Booking System</span>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Super Admin</p>
            </div>
          </div>
          <Button onClick={() => { setEditTenant(null); setShowForm(true); }} className="gap-1.5 text-sm">
            <Plus className="w-4 h-4" /> Add Customer
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Customers", value: activeTenantsCount, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "Total Bookings", value: totalBookings, icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
            { label: "Monthly MRR", value: `$${mrr.toFixed(0)}`, icon: Crown, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" }
          ].map((s, i) =>
            <div key={i} className="bg-card rounded-2xl border border-border/50 p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          )}
        </motion.div>

        {/* Customers Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold">Your Customers</h2>
              <p className="text-sm text-muted-foreground">{tenants.length} registered · Click any card to open their dashboard</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ?
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div> :
            filtered.length === 0 ?
            <div className="text-center py-20 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No customers yet</p>
              <p className="text-sm mt-1">Click "Add Customer" to onboard your first tenant.</p>
            </div> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t, i) => {
                const tenantBookings = allBookings.filter((b) => b.tenant_id === t.id);
                const tenantRevenue = tenantBookings.filter((b) => b.status === "completed").reduce((s, b) => s + (b.total_fare || 0), 0);
                const activeBookings = tenantBookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.status)).length;

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-card rounded-2xl border border-border/50 hover:shadow-lg hover:border-primary/30 transition-all group">

                    {/* Card Header */}
                    <div className="p-5 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                            style={{ background: t.primary_color || "#d4a017" }}>
                            {t.business_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold leading-tight">{t.business_name}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${statusDot[t.status] || "bg-gray-400"}`} />
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planColors[t.plan] || "bg-muted text-muted-foreground"}`}>
                                {t.plan || "trial"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1 mb-4">
                        <p>{t.owner_name} · {t.owner_email}</p>
                        <p className="font-mono text-xs">/book/{t.slug}</p>
                      </div>

                      {/* Mini Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted/60 rounded-lg p-2 text-center">
                          <p className="font-bold text-sm">{tenantBookings.length}</p>
                          <p className="text-[10px] text-muted-foreground">Bookings</p>
                        </div>
                        <div className="bg-muted/60 rounded-lg p-2 text-center">
                          <p className="font-bold text-sm text-amber-600">{activeBookings}</p>
                          <p className="text-[10px] text-muted-foreground">Active</p>
                        </div>
                        <div className="bg-muted/60 rounded-lg p-2 text-center">
                          <p className="font-bold text-sm text-emerald-600">${tenantRevenue.toFixed(0)}</p>
                          <p className="text-[10px] text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="border-t border-border/50 px-5 py-3 flex items-center gap-2">
                      <Link to={`/tenant/${t.slug}/dashboard`} className="flex-1">
                        <Button size="sm" className="w-full gap-1.5 text-xs" style={{ background: t.primary_color || "" }}>
                          <LayoutDashboard className="w-3.5 h-3.5" /> Open Dashboard
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => { setEditTenant(t); setShowForm(true); }}>
                        <span className="text-xs">✏️</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(t)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          }
        </div>
      </main>

      {showForm &&
        <TenantFormModal tenant={editTenant} onClose={() => { setShowForm(false); setEditTenant(null); }} />
      }

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold">Delete Customer?</h3>
                <p className="text-sm text-muted-foreground">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm bg-muted/50 rounded-xl p-3">
              All data for <strong>{deleteConfirm.business_name}</strong> will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}