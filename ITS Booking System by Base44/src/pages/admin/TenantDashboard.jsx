import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Copy, ExternalLink, Code, Link2, Car, 
  CalendarCheck, Save, Palette, GripVertical, Eye,
  Settings, FormInput, DollarSign, Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "@/components/shared/StatusBadge";

const DEFAULT_FIELDS = [
  { id: "booking_type", label: "Booking Type", type: "select", required: true, enabled: true, order: 1 },
  { id: "pickup_address", label: "Pickup Address", type: "address", required: true, enabled: true, order: 2 },
  { id: "dropoff_address", label: "Dropoff Address", type: "address", required: false, enabled: true, order: 3 },
  { id: "pickup_date", label: "Pickup Date", type: "date", required: true, enabled: true, order: 4 },
  { id: "pickup_time", label: "Pickup Time", type: "time", required: true, enabled: true, order: 5 },
  { id: "flight_number", label: "Flight Number", type: "text", required: false, enabled: false, order: 6 },
  { id: "passenger_name", label: "Full Name", type: "text", required: true, enabled: true, order: 7 },
  { id: "passenger_email", label: "Email", type: "email", required: true, enabled: true, order: 8 },
  { id: "passenger_phone", label: "Phone Number", type: "tel", required: true, enabled: true, order: 9 },
  { id: "passengers_count", label: "Number of Passengers", type: "number", required: false, enabled: true, order: 10 },
  { id: "luggage_count", label: "Luggage Pieces", type: "number", required: false, enabled: true, order: 11 },
  { id: "special_requests", label: "Special Requests", type: "textarea", required: false, enabled: true, order: 12 },
  { id: "promo_code", label: "Promo Code", type: "text", required: false, enabled: true, order: 13 },
];

const BOOKING_TYPES = [
  { value: "distance", label: "Distance Based" },
  { value: "hourly", label: "Hourly" },
  { value: "flat_rate", label: "Flat Rate" },
  { value: "on_demand", label: "On Demand" },
];

export default function TenantDashboard() {
  const slug = window.location.pathname.split("/")[3];
  const queryClient = useQueryClient();
  const appUrl = window.location.origin;

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenant-detail", slug],
    queryFn: () => base44.entities.Tenant.filter({ slug }),
    enabled: !!slug,
  });
  const tenant = tenants[0];

  const { data: bookings = [] } = useQuery({
    queryKey: ["tenant-bookings", tenant?.id],
    queryFn: () => base44.entities.TenantBooking.filter({ tenant_id: tenant.id }, "-created_date", 50),
    enabled: !!tenant?.id,
  });

  // Form builder state
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [formTitle, setFormTitle] = useState("Book Your Ride");
  const [formSubtitle, setFormSubtitle] = useState("Safe, comfortable, and on time");
  const [enabledBookingTypes, setEnabledBookingTypes] = useState(["distance", "hourly", "flat_rate", "on_demand"]);
  const [defaultBookingType, setDefaultBookingType] = useState("distance");
  const [dragIdx, setDragIdx] = useState(null);

  useEffect(() => {
    if (tenant?.form_config) {
      const cfg = tenant.form_config;
      if (cfg.fields) setFields(cfg.fields);
      if (cfg.title) setFormTitle(cfg.title);
      if (cfg.subtitle) setFormSubtitle(cfg.subtitle);
      if (cfg.enabledBookingTypes) setEnabledBookingTypes(cfg.enabledBookingTypes);
      if (cfg.defaultBookingType) setDefaultBookingType(cfg.defaultBookingType);
    }
  }, [tenant?.id]);

  const updateTenantMutation = useMutation({
    mutationFn: (data) => base44.entities.Tenant.update(tenant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", slug] });
      toast.success("Saved!");
    },
  });

  const saveFormConfig = () => {
    updateTenantMutation.mutate({
      form_config: { fields, title: formTitle, subtitle: formSubtitle, enabledBookingTypes, defaultBookingType }
    });
  };

  const toggleField = (id, key, val) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  };
  const updateLabel = (id, val) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, label: val } : f));
  };
  const handleDragStart = (i) => setDragIdx(i);
  const handleDragOver = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(i, 0, moved);
    setFields(reordered.map((f, idx) => ({ ...f, order: idx + 1 })));
    setDragIdx(i);
  };

  const copy = (text, label) => { navigator.clipboard.writeText(text); toast.success(`${label} copied!`); };

  const bookingUrl = `${appUrl}/book/${slug}`;
  const driverUrl = `${appUrl}/driver/${slug}`;
  const iframeCode = `<iframe src="${bookingUrl}" width="100%" height="700px" frameborder="0" style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.12);" title="Book a Ride"></iframe>`;
  const buttonCode = `<a href="${bookingUrl}" target="_blank" style="display:inline-block;background:${tenant?.primary_color || "#d4a017"};color:#fff;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-family:sans-serif;">Book Your Ride</a>`;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!tenant) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Tenant not found</div>;
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    revenue: bookings.filter(b => b.status === "completed").reduce((s, b) => s + (b.total_fare || 0), 0),
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/tenants">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: tenant.primary_color || "#d4a017" }}>
            {tenant.business_name?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">{tenant.business_name}</h1>
            <p className="text-xs text-muted-foreground">{tenant.owner_email} · /book/{tenant.slug}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${tenant.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {tenant.status}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-blue-100 text-blue-700">
            {tenant.plan}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total Bookings", value: stats.total, icon: CalendarCheck },
          { label: "Pending", value: stats.pending, icon: CalendarCheck },
          { label: "Confirmed", value: stats.confirmed, icon: CalendarCheck },
          { label: "Completed", value: stats.completed, icon: CalendarCheck },
          { label: "Revenue", value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border/50 p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="bookings" className="gap-1.5 text-xs"><CalendarCheck className="w-3.5 h-3.5" /> Bookings</TabsTrigger>
          <TabsTrigger value="formbuilder" className="gap-1.5 text-xs"><FormInput className="w-3.5 h-3.5" /> Form</TabsTrigger>
          <TabsTrigger value="embed" className="gap-1.5 text-xs"><Code className="w-3.5 h-3.5" /> Embed</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5 text-xs"><Settings className="w-3.5 h-3.5" /> Settings</TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Ref</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Passenger</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell">Pickup</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Fare</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{b.booking_ref || b.id?.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{b.passenger_name}</div>
                      <div className="text-xs text-muted-foreground">{b.passenger_email}</div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-xs max-w-[150px] truncate">{b.pickup_address}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs">{b.pickup_date} {b.pickup_time}</td>
                    <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                    <td className="py-3 px-4 text-right font-semibold">${(b.total_fare || 0).toFixed(2)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No bookings yet for this tenant</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Form Builder Tab */}
        <TabsContent value="formbuilder">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Appearance & Booking Types */}
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> Form Appearance</h3>
                <div><Label>Form Title</Label><Input value={formTitle} onChange={e => setFormTitle(e.target.value)} /></div>
                <div><Label>Subtitle</Label><Input value={formSubtitle} onChange={e => setFormSubtitle(e.target.value)} /></div>
              </div>

              {/* Booking Types */}
              <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
                <h3 className="font-semibold">Booking Types</h3>
                <p className="text-xs text-muted-foreground">Choose which booking types customers can select</p>
                {BOOKING_TYPES.map(bt => (
                  <div key={bt.value} className="flex items-center justify-between">
                    <span className="text-sm">{bt.label}</span>
                    <Switch
                      checked={enabledBookingTypes.includes(bt.value)}
                      onCheckedChange={v => setEnabledBookingTypes(prev => v ? [...prev, bt.value] : prev.filter(x => x !== bt.value))}
                    />
                  </div>
                ))}
                <div>
                  <Label className="text-xs">Default Booking Type</Label>
                  <Select value={defaultBookingType} onValueChange={setDefaultBookingType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {enabledBookingTypes.map(t => (
                        <SelectItem key={t} value={t}>{BOOKING_TYPES.find(b => b.value === t)?.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-card rounded-2xl border border-border/50 p-5">
                <h3 className="font-semibold mb-3">Preview Header</h3>
                <div className="rounded-xl p-4 text-white text-center" style={{ background: tenant.primary_color || "#d4a017" }}>
                  <h2 className="font-bold text-lg">{formTitle}</h2>
                  <p className="text-sm opacity-80 mt-1">{formSubtitle}</p>
                </div>
              </div>
            </div>

            {/* Right: Fields */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Form Fields</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Drag to reorder · Toggle on/off · Edit labels</p>
                  </div>
                  <Button onClick={saveFormConfig} disabled={updateTenantMutation.isPending} className="gap-2">
                    <Save className="w-4 h-4" /> {updateTenantMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>

                <div className="space-y-2">
                  {fields.map((field, i) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={() => setDragIdx(null)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                        field.enabled ? "bg-background border-border" : "bg-muted/30 border-border/30 opacity-60"
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Switch checked={field.enabled} onCheckedChange={v => toggleField(field.id, "enabled", v)} />
                      <Input value={field.label} onChange={e => updateLabel(field.id, e.target.value)} className="flex-1 h-8 text-sm" disabled={!field.enabled} />
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0">{field.type}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Switch checked={field.required} onCheckedChange={v => toggleField(field.id, "required", v)} disabled={!field.enabled} />
                        <span className="text-xs text-muted-foreground">Req</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Embed Tab */}
        <TabsContent value="embed" className="space-y-5">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
            <h4 className="font-semibold flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Customer Booking URL</h4>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm break-all">{bookingUrl}</code>
              <Button variant="outline" size="sm" onClick={() => copy(bookingUrl, "URL")}><Copy className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => window.open(bookingUrl, "_blank")}><ExternalLink className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
            <h4 className="font-semibold flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> iFrame Embed</h4>
            <p className="text-xs text-muted-foreground">Paste this into any website to embed the booking form inline.</p>
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
              <a href={bookingUrl} target="_blank" style={{ display: "inline-block", background: tenant.primary_color || "#d4a017", color: "#fff", padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "14px" }}>
                Book Your Ride
              </a>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
            <h4 className="font-semibold flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> Driver App URL</h4>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm break-all">{driverUrl}</code>
              <Button variant="outline" size="sm" onClick={() => copy(driverUrl, "Driver URL")}><Copy className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => window.open(driverUrl, "_blank")}><ExternalLink className="w-4 h-4" /></Button>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">Drivers need an account. Add them from the Drivers page with their email.</p>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <TenantSettingsPanel tenant={tenant} onSave={(data) => updateTenantMutation.mutate(data)} saving={updateTenantMutation.isPending} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TenantSettingsPanel({ tenant, onSave, saving }) {
  const [form, setForm] = useState({
    business_name: tenant.business_name || "",
    owner_name: tenant.owner_name || "",
    owner_email: tenant.owner_email || "",
    phone: tenant.phone || "",
    plan: tenant.plan || "trial",
    status: tenant.status || "active",
    monthly_fee: tenant.monthly_fee || 49,
    billing_day: tenant.billing_day || 1,
    payment_status: tenant.payment_status || "pending",
    next_payment_date: tenant.next_payment_date || "",
    primary_color: tenant.primary_color || "#d4a017",
    currency: tenant.currency || "USD",
    currency_symbol: tenant.currency_symbol || "$",
    base_fare: tenant.base_fare || 15,
    hourly_rate: tenant.hourly_rate || 65,
    notes: tenant.notes || "",
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="font-semibold">Business Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Business Name</Label><Input value={form.business_name} onChange={e => update("business_name", e.target.value)} /></div>
          <div><Label>Owner Name</Label><Input value={form.owner_name} onChange={e => update("owner_name", e.target.value)} /></div>
          <div><Label>Owner Email</Label><Input value={form.owner_email} onChange={e => update("owner_email", e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => update("phone", e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Plan</Label>
            <Select value={form.plan} onValueChange={v => update("plan", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["trial","basic","pro","enterprise"].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
          <div><Label>Brand Color</Label><Input type="color" value={form.primary_color} onChange={e => update("primary_color", e.target.value)} className="h-9" /></div>
        </div>
        <div><Label>Internal Notes</Label><Input value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Notes..." /></div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="font-semibold">Billing & Pricing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Monthly Fee ($)</Label><Input type="number" value={form.monthly_fee} onChange={e => update("monthly_fee", +e.target.value)} /></div>
          <div><Label>Billing Day</Label><Input type="number" min="1" max="28" value={form.billing_day} onChange={e => update("billing_day", +e.target.value)} /></div>
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
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Currency</Label><Input value={form.currency} onChange={e => update("currency", e.target.value)} placeholder="USD" /></div>
          <div><Label>Base Fare ($)</Label><Input type="number" step="0.01" value={form.base_fare} onChange={e => update("base_fare", +e.target.value)} /></div>
          <div><Label>Hourly Rate ($)</Label><Input type="number" step="0.01" value={form.hourly_rate} onChange={e => update("hourly_rate", +e.target.value)} /></div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(form)} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}