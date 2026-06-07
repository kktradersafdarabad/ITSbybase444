import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Building2, CreditCard, Info, Globe, Lock, CheckCircle, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRIES = [
  { code: "GB", name: "🇬🇧 United Kingdom" },
  { code: "US", name: "🇺🇸 United States" },
  { code: "PK", name: "🇵🇰 Pakistan" },
  { code: "AE", name: "🇦🇪 UAE / Dubai" },
  { code: "SA", name: "🇸🇦 Saudi Arabia" },
  { code: "AU", name: "🇦🇺 Australia" },
  { code: "CA", name: "🇨🇦 Canada" },
  { code: "DE", name: "🇩🇪 Germany" },
  { code: "FR", name: "🇫🇷 France" },
  { code: "ES", name: "🇪🇸 Spain" },
  { code: "IN", name: "🇮🇳 India" },
  { code: "ZA", name: "🇿🇦 South Africa" },
  { code: "NG", name: "🇳🇬 Nigeria" },
  { code: "KE", name: "🇰🇪 Kenya" },
  { code: "BD", name: "🇧🇩 Bangladesh" },
];
import { toast } from "sonner";
import { getPlanLimits } from "@/lib/planLimits";

// Read-only info row
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium bg-muted/50 rounded-lg px-3 py-2 border border-border/40">{value || "—"}</span>
    </div>
  );
}

export default function TenantSettings() {
  const { tenant, slug } = useOutletContext();
  const queryClient = useQueryClient();

  const planLimits = getPlanLimits(tenant.plan);

  const [form, setForm] = useState({
    business_name: tenant.business_name || "",
    owner_name: tenant.owner_name || "",
    owner_email: tenant.owner_email || "",
    phone: tenant.phone || "",
    primary_color: tenant.primary_color || "#C91C14",
    logo_url: tenant.logo_url || "",
    country_code: tenant.country_code || "GB",
    notes: tenant.notes || "",
  });

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Tenant.update(tenant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-admin", slug] });
      toast.success("Settings saved!");
    },
  });

  const planColors = {
    trial: "bg-gray-100 text-gray-700",
    basic: "bg-blue-100 text-blue-700",
    pro: "bg-purple-100 text-purple-700",
    enterprise: "bg-amber-100 text-amber-800",
  };

  const paymentStatusColors = {
    paid: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 lg:p-8 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">{tenant.business_name} — manage your account</p>
        </div>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="gap-2">
          <Save className="w-4 h-4" /> {mutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Business Info — Editable */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Business Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Business Name</Label><Input value={form.business_name} onChange={e => u("business_name", e.target.value)} /></div>
          <div><Label>Owner Name</Label><Input value={form.owner_name} onChange={e => u("owner_name", e.target.value)} /></div>
          <div><Label>Owner Email</Label><Input type="email" value={form.owner_email} onChange={e => u("owner_email", e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => u("phone", e.target.value)} /></div>
          <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={e => u("logo_url", e.target.value)} placeholder="https://..." /></div>
          <div>
            <Label className="flex items-center gap-1.5 mb-1"><MapPin className="w-3.5 h-3.5" /> Operating Country</Label>
            <Select value={form.country_code} onValueChange={v => u("country_code", v)}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Address autocomplete & map will be restricted to this country only.</p>
          </div>
          <div>
            <Label>Brand Color</Label>
            <div className="flex items-center gap-2">
              <Input type="color" value={form.primary_color} onChange={e => u("primary_color", e.target.value)} className="h-9 w-16 p-1 cursor-pointer" />
              <Input value={form.primary_color} onChange={e => u("primary_color", e.target.value)} className="flex-1" placeholder="#d4a017" />
            </div>
          </div>
        </div>
        <div><Label>Internal Notes</Label><Input value={form.notes} onChange={e => u("notes", e.target.value)} placeholder="Notes..." /></div>
      </div>

      {/* Custom Domain */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Custom Domain
          </h3>
          {!planLimits.hasCustomDomain && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> Enterprise Only
            </span>
          )}
        </div>

        {planLimits.hasCustomDomain ? (
          <div className="space-y-3">
            <div>
              <Label>Your Custom Domain</Label>
              <Input
                value={tenant.custom_domain || ""}
                readOnly
                className="mt-1 font-mono"
                placeholder="Not set — contact admin to configure"
              />
            </div>
            {tenant.custom_domain && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Domain Configuration
                </p>
                <p className="text-xs text-emerald-700">
                  Point a CNAME record from <strong>{tenant.custom_domain}</strong> to:
                </p>
                <code className="block bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-mono text-emerald-900">
                  {window.location.host}
                </code>
                <p className="text-xs text-emerald-600">DNS changes may take up to 24 hours to propagate.</p>
              </div>
            )}
            {!tenant.custom_domain && (
              <p className="text-xs text-muted-foreground">Contact the platform administrator to set up your custom domain.</p>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 font-medium mb-1">Custom Domain is an Enterprise feature</p>
            <p className="text-xs text-amber-700">
              Upgrade to Enterprise plan to get your own domain like <code className="bg-amber-100 px-1 rounded">book.yourbusiness.com</code>. Contact the administrator to upgrade your plan.
            </p>
          </div>
        )}
      </div>

      {/* Plan Features Overview */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary" /> Your Plan Features
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Stripe Payments", enabled: planLimits.hasStripe },
            { label: "PayPal Payments", enabled: planLimits.hasPaypal },
            { label: "Live GPS Tracking", enabled: planLimits.hasLiveTracking },
            { label: "Promo Codes", enabled: planLimits.hasPromos },
            { label: "Advanced Analytics", enabled: planLimits.hasAnalytics },
            { label: "Multi-language", enabled: planLimits.hasMultiLanguage },
            { label: "Custom Branding", enabled: planLimits.hasCustomBranding },
            { label: "Custom Domain", enabled: planLimits.hasCustomDomain },
            { label: "Form Builder", enabled: planLimits.hasFormBuilder },
            { label: "Priority Support", enabled: planLimits.hasPrioritySupport },
            { label: planLimits.maxBookingsPerMonth ? `${planLimits.maxBookingsPerMonth} Bookings/mo` : "Unlimited Bookings", enabled: true },
            { label: planLimits.maxDrivers ? `${planLimits.maxDrivers} Driver` : "Unlimited Drivers", enabled: true },
          ].map((f, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${f.enabled ? "bg-emerald-50 text-emerald-700" : "bg-muted/50 text-muted-foreground line-through"}`}>
              {f.enabled
                ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                : <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              }
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Billing & Subscription — View Only */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Billing & Subscription
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg">
            <Info className="w-3.5 h-3.5" /> Managed by platform admin
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Plan</span>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${planColors[tenant.plan] || "bg-muted text-muted-foreground"}`}>
              {tenant.plan || "trial"}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Payment Status</span>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${paymentStatusColors[tenant.payment_status] || "bg-muted text-muted-foreground"}`}>
              {tenant.payment_status || "pending"}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Status</span>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${tenant.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {tenant.status || "active"}
            </span>
          </div>
          <InfoRow label="Monthly Fee" value={tenant.monthly_fee ? `$${tenant.monthly_fee}` : "—"} />
          <InfoRow label="Billing Day" value={tenant.billing_day ? `Day ${tenant.billing_day} of month` : "—"} />
          <InfoRow label="Next Payment" value={tenant.next_payment_date || "—"} />
        </div>

        <p className="text-xs text-muted-foreground pt-1">
          To change your plan or billing details, please contact the platform administrator.
        </p>
      </div>
    </div>
  );
}