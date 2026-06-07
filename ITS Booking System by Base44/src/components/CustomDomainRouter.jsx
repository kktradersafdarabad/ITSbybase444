/**
 * CustomDomainRouter
 * 
 * Jab koi user apne custom domain (e.g. customerdomain.com) se app access kare,
 * yeh component us domain ke against tenant dhundta hai aur phir uski
 * slug-based routes par redirect karta hai taake poora dashboard kaam kare.
 * 
 * Custom domain pe URLs:
 *   customerdomain.com/           → /tenant/:slug/dashboard
 *   customerdomain.com/bookings   → /tenant/:slug/bookings
 *   customerdomain.com/drivers    → /tenant/:slug/drivers
 *   customerdomain.com/book       → /book/:slug (booking form)
 *   customerdomain.com/driver     → /driver/:slug (driver app)
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

// Yeh paths custom domain pe directly available hain
const DASHBOARD_PATHS = [
  "dashboard", "bookings", "fleet", "drivers", "routes", "promos",
  "fare", "integrations", "form-builder", "templates", "reviews",
  "fleet-map", "payouts", "embed", "settings"
];

export default function CustomDomainRouter() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | redirecting | not_found

  useEffect(() => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname; // e.g. "/bookings" or "/"

    base44.entities.Tenant.filter({ custom_domain: hostname })
      .then(tenants => {
        const tenant = tenants[0];
        if (!tenant) {
          setStatus("not_found");
          return;
        }

        const slug = tenant.slug;
        // pathname ki pehli segment dhundo (e.g. "/bookings" → "bookings")
        const segment = pathname.split("/").filter(Boolean)[0] || "";

        setStatus("redirecting");

        // Slug save karo taake booking/driver/pay pages usse use kar sakein
        sessionStorage.setItem("tenant_slug_for_domain", slug);

        if (segment === "book") {
          navigate(`/book/${slug}`, { replace: true });
        } else if (segment === "driver") {
          navigate(`/driver/${slug}`, { replace: true });
        } else if (segment === "pay") {
          navigate(`/pay/${slug}${window.location.search}`, { replace: true });
        } else if (DASHBOARD_PATHS.includes(segment)) {
          navigate(`/tenant/${slug}/${segment}`, { replace: true });
        } else {
          // Default: dashboard home
          navigate(`/tenant/${slug}/dashboard`, { replace: true });
        }
      })
      .catch(() => setStatus("not_found"));
  }, []);

  if (status === "not_found") {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4 p-6 text-center">
        <div className="text-5xl">🔗</div>
        <h2 className="text-xl font-bold">Domain Not Configured</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          This domain is not linked to any active account. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );
}