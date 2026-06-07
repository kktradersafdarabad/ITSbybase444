import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Link2, Code, Car, Globe } from "lucide-react";
import { toast } from "sonner";
import { getBookingUrl, getDriverUrl, getDashboardUrl } from "@/lib/customDomain";

export default function TenantEmbed() {
  const { tenant, slug, primaryColor } = useOutletContext();
  const appUrl = window.location.origin;
  const bookingUrl = getBookingUrl(tenant) || `${appUrl}/book/${slug}`;
  const driverUrl = getDriverUrl(tenant) || `${appUrl}/driver/${slug}`;
  const dashboardUrl = getDashboardUrl(tenant) || `${appUrl}/tenant/${slug}/dashboard`;
  const defaultBookingUrl = `${appUrl}/book/${slug}`; // always available as fallback
  const iframeCode = `<iframe src="${bookingUrl}" width="100%" height="700px" frameborder="0" style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.12);" title="Book a Ride"></iframe>`;
  const buttonCode = `<a href="${bookingUrl}" target="_blank" style="display:inline-block;background:${primaryColor};color:#fff;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-family:sans-serif;">Book Your Ride</a>`;

  const copy = (text, label) => { navigator.clipboard.writeText(text); toast.success(`${label} copied!`); };

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Embed & URLs</h1>
        <p className="text-muted-foreground text-sm mt-1">Share these links or embed the booking form on your website</p>
      </div>

      {/* Custom Domain Info */}
      {tenant?.custom_domain ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-start gap-3">
          <Globe className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">Custom Domain Active: {tenant.custom_domain}</p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
              All your URLs below are using your custom domain. Customers and drivers will see your branded domain in the URL bar.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
          <Globe className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">No Custom Domain Configured</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Upgrade to Enterprise plan and add your custom domain in Settings to get branded URLs like <strong>customerdomain.com/book</strong> instead of the default link below.
            </p>
          </div>
        </div>
      )}

      {/* Dashboard URL */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
        <h4 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Your Dashboard URL</h4>
        <p className="text-xs text-muted-foreground">This is your admin dashboard link. Share it with your team members who need access.</p>
        <div className="flex gap-2">
          <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm break-all">{dashboardUrl}</code>
          <Button variant="outline" size="sm" onClick={() => copy(dashboardUrl, "Dashboard URL")}><Copy className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => window.open(dashboardUrl, "_blank")}><ExternalLink className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
        <h4 className="font-semibold flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Customer Booking URL</h4>
        <p className="text-xs text-muted-foreground">Share this link with your customers so they can book a ride.</p>
        <div className="flex gap-2">
          <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm break-all">{bookingUrl}</code>
          <Button variant="outline" size="sm" onClick={() => copy(bookingUrl, "URL")}><Copy className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => window.open(defaultBookingUrl, "_blank")}><ExternalLink className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
        <h4 className="font-semibold flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> iFrame Embed Code</h4>
        <p className="text-xs text-muted-foreground">Paste this into your website to embed the booking form inline.</p>
        <div className="relative">
          <pre className="bg-muted rounded-lg px-4 py-3 text-xs overflow-x-auto whitespace-pre-wrap">{iframeCode}</pre>
          <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => copy(iframeCode, "iFrame code")}><Copy className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
        <h4 className="font-semibold flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> Booking Button HTML</h4>
        <div className="relative">
          <pre className="bg-muted rounded-lg px-4 py-3 text-xs overflow-x-auto whitespace-pre-wrap">{buttonCode}</pre>
          <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => copy(buttonCode, "Button code")}><Copy className="w-3.5 h-3.5" /></Button>
        </div>
        <div className="pt-2">
          <span className="text-xs text-muted-foreground mr-3">Preview:</span>
          <a href={bookingUrl} target="_blank" style={{ display: "inline-block", background: primaryColor, color: "#fff", padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "14px" }}>
            Book Your Ride
          </a>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
        <h4 className="font-semibold flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> Driver App URL</h4>
        <p className="text-xs text-muted-foreground">Send this to your drivers so they can access their job portal.</p>
        <div className="flex gap-2">
          <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm break-all">{driverUrl}</code>
          <Button variant="outline" size="sm" onClick={() => copy(driverUrl, "Driver URL")}><Copy className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`${appUrl}/driver/${slug}`, "_blank")}><ExternalLink className="w-4 h-4" /></Button>
        </div>
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">Drivers must be registered (added in the Drivers section) with the same email they'll use to sign in.</p>
      </div>
    </div>
  );
}