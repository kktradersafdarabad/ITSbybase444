import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) + Math.random().toString(36).slice(2, 6);

export default function TenantFormModal({ tenant, onClose }) {
  const queryClient = useQueryClient();
  const COUNTRIES = [
    { code: "GB", name: "🇬🇧 United Kingdom" }, { code: "US", name: "🇺🇸 United States" },
    { code: "PK", name: "🇵🇰 Pakistan" }, { code: "AE", name: "🇦🇪 UAE" },
    { code: "SA", name: "🇸🇦 Saudi Arabia" }, { code: "CA", name: "🇨🇦 Canada" },
    { code: "AU", name: "🇦🇺 Australia" }, { code: "IN", name: "🇮🇳 India" },
    { code: "DE", name: "🇩🇪 Germany" }, { code: "FR", name: "🇫🇷 France" },
    { code: "TR", name: "🇹🇷 Turkey" }, { code: "NG", name: "🇳🇬 Nigeria" },
    { code: "ZA", name: "🇿🇦 South Africa" }, { code: "KE", name: "🇰🇪 Kenya" },
  ];

  const [form, setForm] = useState({
    business_name: tenant?.business_name || "",
    owner_name: tenant?.owner_name || "",
    owner_email: tenant?.owner_email || "",
    phone: tenant?.phone || "",
    slug: tenant?.slug || "",
    plan: tenant?.plan || "trial",
    status: tenant?.status || "active",
    monthly_fee: tenant?.monthly_fee || 49,
    billing_day: tenant?.billing_day || 1,
    payment_status: tenant?.payment_status || "pending",
    next_payment_date: tenant?.next_payment_date || "",
    primary_color: tenant?.primary_color || "#C91C14",
    currency: tenant?.currency || "USD",
    currency_symbol: tenant?.currency_symbol || "$",
    country_code: tenant?.country_code || "GB",
    custom_domain: tenant?.custom_domain || "",
    notes: tenant?.notes || "",
  });

  const mutation = useMutation({
    mutationFn: (data) => tenant
      ? base44.entities.Tenant.update(tenant.id, data)
      : base44.entities.Tenant.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success(tenant ? "Tenant updated!" : "Tenant created! Share the booking URL with them.");
      onClose();
    },
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleNameBlur = () => {
    if (!tenant && !form.slug && form.business_name) {
      update("slug", generateSlug(form.business_name));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tenant ? "Edit Tenant" : "Add New Tenant"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="billing">Billing & Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div><Label>Business Name *</Label><Input value={form.business_name} onChange={e => update("business_name", e.target.value)} onBlur={handleNameBlur} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Owner Name</Label><Input value={form.owner_name} onChange={e => update("owner_name", e.target.value)} /></div>
              <div><Label>Owner Email *</Label><Input type="email" value={form.owner_email} onChange={e => update("owner_email", e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => update("phone", e.target.value)} /></div>
              <div>
                <Label>URL Slug (unique)</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">/book/</span>
                  <Input value={form.slug} onChange={e => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="mybusiness" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => update("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plan</Label>
                <Select value={form.plan} onValueChange={v => update("plan", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Brand Color</Label><Input type="color" value={form.primary_color} onChange={e => update("primary_color", e.target.value)} className="h-12" /></div>
              <div>
                <Label>Country / Region</Label>
                <Select value={form.country_code} onValueChange={v => update("country_code", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Restricts map & address search to this country only</p>
              </div>
            </div>
            <div>
              <Label>Custom Domain <span className="text-xs text-muted-foreground ml-1">(Enterprise only)</span></Label>
              <Input value={form.custom_domain || ""} onChange={e => update("custom_domain", e.target.value)} placeholder="book.mybusiness.com" disabled={form.plan !== "enterprise"} />
              {form.plan !== "enterprise" && <p className="text-xs text-muted-foreground mt-1">Upgrade to Enterprise plan to enable custom domain.</p>}
              {form.plan === "enterprise" && form.custom_domain && <p className="text-xs text-emerald-600 mt-1">✓ Point this domain's CNAME to: <code className="bg-muted px-1 rounded">{window.location.host}</code></p>}
            </div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Internal notes..." /></div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Monthly Fee ($)</Label><Input type="number" value={form.monthly_fee} onChange={e => update("monthly_fee", +e.target.value)} /></div>
              <div><Label>Billing Day (1-28)</Label><Input type="number" min="1" max="28" value={form.billing_day} onChange={e => update("billing_day", +e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Status</Label>
                <Select value={form.payment_status} onValueChange={v => update("payment_status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Next Payment Date</Label><Input type="date" value={form.next_payment_date} onChange={e => update("next_payment_date", e.target.value)} /></div>
            </div>
            <div>
              <Label>Currency</Label><Input value={form.currency} onChange={e => update("currency", e.target.value)} placeholder="USD" className="mt-1" />
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.business_name || !form.owner_email || !form.slug} className="w-full mt-2">
          {mutation.isPending ? "Saving..." : tenant ? "Update Tenant" : "Create Tenant"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}