import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Outlet, useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, CalendarCheck, Car, Users, Tag, Settings,
  Crown, LogOut, ChevronLeft, ChevronRight, Building2, Route,
  FormInput, Code, Menu, DollarSign, CreditCard, Sparkles, Star,
  MapPin, Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUPER_ADMIN_EMAIL = "khizardogar001@gmail.com";

export default function TenantAdminDashboard() {
  const { slug } = useParams();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { setCurrentUser(u); setAuthChecked(true); }).catch(() => setAuthChecked(true));
  }, []);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenant-admin", slug],
    queryFn: () => base44.entities.Tenant.filter({ slug }),
    enabled: !!slug,
  });
  const tenant = tenants[0];

  const navItems = [
    { path: `/tenant/${slug}/dashboard`, icon: LayoutDashboard, label: "Dashboard" },
    { path: `/tenant/${slug}/bookings`, icon: CalendarCheck, label: "Bookings" },
    { path: `/tenant/${slug}/fleet`, icon: Car, label: "Fleet" },
    { path: `/tenant/${slug}/drivers`, icon: Users, label: "Drivers" },
    { path: `/tenant/${slug}/routes`, icon: Route, label: "Routes" },
    { path: `/tenant/${slug}/promos`, icon: Tag, label: "Promos" },
    { path: `/tenant/${slug}/fare`, icon: DollarSign, label: "Fare Settings" },
    { path: `/tenant/${slug}/integrations`, icon: CreditCard, label: "Integrations" },
    { path: `/tenant/${slug}/form-builder`, icon: FormInput, label: "Form Builder" },
    { path: `/tenant/${slug}/templates`, icon: Sparkles, label: "Form Templates" },
    { path: `/tenant/${slug}/reviews`, icon: Star, label: "Reviews" },
    { path: `/tenant/${slug}/fleet-map`, icon: MapPin, label: "Live Fleet Map" },
    { path: `/tenant/${slug}/payouts`, icon: Wallet, label: "Driver Payouts" },
    { path: `/tenant/${slug}/embed`, icon: Code, label: "Embed & URLs" },
    { path: `/tenant/${slug}/settings`, icon: Settings, label: "Settings" },
  ];

  const primaryColor = tenant?.primary_color || "#d4a017";

  // Access control: only super admin or the tenant owner can access
  if (!authChecked || isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  if (tenant && currentUser) {
    const isSuperAdmin = currentUser.email === SUPER_ADMIN_EMAIL;
    const isOwner = currentUser.email === tenant.owner_email;
    if (!isSuperAdmin && !isOwner) {
      return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            You are not authorized to access this dashboard. Only the owner of this business account can log in here.
          </p>
          <Button variant="outline" onClick={() => base44.auth.logout()}>Logout</Button>
        </div>
      );
    }
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <Building2 className="w-12 h-12 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">Tenant not found</p>
        <Link to="/"><Button variant="outline">Back to Home</Button></Link>
      </div>
    );
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      "h-full flex flex-col",
      mobile ? "w-full" : collapsed ? "w-[72px]" : "w-[240px]"
    )} style={{ background: "#111827", color: "#f9fafb" }}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: primaryColor }}>
          {tenant.business_name?.[0]?.toUpperCase()}
        </div>
        {(!collapsed || mobile) && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm leading-tight truncate" style={{ color: primaryColor }}>{tenant.business_name}</p>
            <p className="text-xs text-white/50 truncate">{tenant.owner_email}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm",
                isActive
                  ? "text-white font-semibold"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
              style={isActive ? { background: primaryColor + "33" } : {}}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" style={isActive ? { color: primaryColor } : {}} />
              {(!collapsed || mobile) && <span>{item.label}</span>}
              {isActive && (!collapsed || mobile) && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: primaryColor }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">

        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
        )}
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-red-400/70 hover:text-red-400 hover:bg-white/5 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 transition-all duration-300" style={{ width: collapsed ? 72 : 240 }}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-50">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: primaryColor }}>
              {tenant.business_name?.[0]}
            </div>
            <span className="font-semibold text-sm">{tenant.business_name}</span>
          </div>
        </div>

        <Outlet context={{ tenant, slug, primaryColor }} />
      </div>
    </div>
  );
}