import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, GripVertical, Eye, EyeOff, FormInput, CheckSquare, Settings2, ExternalLink, Palette, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_FIELDS = [
  { id: "pickup_address",    label: "Pickup Address",        type: "address",  required: true,  enabled: true,  order: 1 },
  { id: "dropoff_address",   label: "Dropoff Address",       type: "address",  required: false, enabled: true,  order: 2 },
  { id: "pickup_date",       label: "Pickup Date",           type: "date",     required: true,  enabled: true,  order: 3 },
  { id: "pickup_time",       label: "Pickup Time",           type: "time",     required: true,  enabled: true,  order: 4 },
  { id: "flight_number",     label: "Flight Number",         type: "text",     required: false, enabled: false, order: 5 },
  { id: "passenger_name",    label: "Full Name",             type: "text",     required: true,  enabled: true,  order: 6 },
  { id: "passenger_email",   label: "Email Address",         type: "email",    required: true,  enabled: true,  order: 7 },
  { id: "passenger_phone",   label: "Phone Number",          type: "tel",      required: true,  enabled: true,  order: 8 },
  { id: "passengers_count",  label: "Number of Passengers",  type: "number",   required: false, enabled: true,  order: 9 },
  { id: "luggage_count",     label: "Luggage Pieces",        type: "number",   required: false, enabled: true,  order: 10 },
  { id: "special_requests",  label: "Special Requests",      type: "textarea", required: false, enabled: true,  order: 11 },
  { id: "promo_code",        label: "Promo Code",            type: "text",     required: false, enabled: true,  order: 12 },
];

const BOOKING_TYPES = [
  { value: "distance", label: "Distance Based", desc: "Fare calculated by km + time" },
  { value: "hourly",   label: "Hourly",         desc: "Fare calculated by hours booked" },
  { value: "flat_rate",label: "Flat Rate",      desc: "Fixed prices for predefined routes" },
  { value: "on_demand",label: "On Demand",      desc: "No fixed price, driver sets fare" },
];

const TYPE_ICON = { text:"Aa", email:"@", tel:"📞", number:"#", date:"📅", time:"⏰", address:"📍", textarea:"≡", select:"▾" };

export default function TenantFormBuilderPage() {
  const { tenant, slug, primaryColor } = useOutletContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("fields");

  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [formTitle, setFormTitle] = useState("Book Your Ride");
  const [formSubtitle, setFormSubtitle] = useState("Safe, comfortable, and on time");
  const [buttonText, setButtonText] = useState("Continue");
  const [enabledBookingTypes, setEnabledBookingTypes] = useState(["distance", "hourly", "flat_rate", "on_demand"]);
  const [defaultBookingType, setDefaultBookingType] = useState("distance");
  const [showFormBanner, setShowFormBanner] = useState(true);
  const [showStepIndicator, setShowStepIndicator] = useState(true);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    if (tenant?.form_config) {
      const cfg = tenant.form_config;
      if (cfg.fields?.length) setFields(cfg.fields);
      if (cfg.title) setFormTitle(cfg.title);
      if (cfg.subtitle) setFormSubtitle(cfg.subtitle);
      if (cfg.buttonText) setButtonText(cfg.buttonText);
      if (cfg.enabledBookingTypes?.length) setEnabledBookingTypes(cfg.enabledBookingTypes);
      if (cfg.defaultBookingType) setDefaultBookingType(cfg.defaultBookingType);
      if (cfg.showFormBanner !== undefined) setShowFormBanner(cfg.showFormBanner);
      if (cfg.showStepIndicator !== undefined) setShowStepIndicator(cfg.showStepIndicator);
    }
  }, [tenant?.id]);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Tenant.update(tenant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-admin", slug] });
      toast.success("Form saved! Changes are live on your booking page.");
    },
  });

  const save = () => mutation.mutate({
    form_config: { fields, title: formTitle, subtitle: formSubtitle, buttonText, enabledBookingTypes, defaultBookingType, showFormBanner, showStepIndicator }
  });

  const resetToDefaults = () => {
    setFields(DEFAULT_FIELDS);
    setFormTitle("Book Your Ride");
    setFormSubtitle("Safe, comfortable, and on time");
    setButtonText("Continue");
    setEnabledBookingTypes(["distance", "hourly", "flat_rate", "on_demand"]);
    setDefaultBookingType("distance");
    setShowFormBanner(true);
    setShowStepIndicator(true);
    toast.info("Reset to defaults. Click Save to apply.");
  };

  const toggleField = (id, key, val) => setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  const updateLabel = (id, val) => setFields(prev => prev.map(f => f.id === id ? { ...f, label: val } : f));

  const handleDragStart = (i) => setDragIdx(i);
  const handleDragOver = (e, i) => {
    e.preventDefault();
    setDragOver(i);
    if (dragIdx === null || dragIdx === i) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(i, 0, moved);
    setFields(reordered.map((f, idx) => ({ ...f, order: idx + 1 })));
    setDragIdx(i);
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOver(null); };

  const tabs = [
    { id: "fields", label: "Form Fields", icon: FormInput },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "booking_types", label: "Booking Types", icon: Settings2 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Form Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">Customize the public booking form for {tenant.business_name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={resetToDefaults}>
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`/book/${slug}`, "_blank")}>
            <Eye className="w-3.5 h-3.5" /> Preview
            <ExternalLink className="w-3 h-3" />
          </Button>
          <Button onClick={save} disabled={mutation.isPending} className="gap-2">
            <Save className="w-4 h-4" /> {mutation.isPending ? "Saving..." : "Save & Publish"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Active Fields", value: fields.filter(f => f.enabled).length },
          { label: "Required Fields", value: fields.filter(f => f.required && f.enabled).length },
          { label: "Booking Types", value: enabledBookingTypes.length },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border/50 p-3 text-center">
            <p className="text-xl font-bold" style={{ color: primaryColor }}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* FIELDS TAB */}
      {activeTab === "fields" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-card rounded-2xl border border-border/50 p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Form Fields</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Drag <GripVertical className="w-3 h-3 inline" /> to reorder · Toggle to show/hide · Edit label text
              </p>
            </div>

            {/* Column headers */}
            <div className="flex items-center gap-3 px-3 mb-2">
              <div className="w-4" />
              <div className="w-9" />
              <div className="w-7" />
              <div className="flex-1 text-xs text-muted-foreground font-medium">Field Label</div>
              <div className="text-xs text-muted-foreground font-medium pr-1">Required</div>
            </div>

            <div className="space-y-2">
              {fields.map((field, i) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                    dragOver === i ? "border-primary/50 bg-primary/5 scale-[1.01]" :
                    field.enabled ? "bg-background border-border" : "bg-muted/20 border-border/30 opacity-50"
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Switch checked={field.enabled} onCheckedChange={v => toggleField(field.id, "enabled", v)} />
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-mono flex-shrink-0 select-none">
                    {TYPE_ICON[field.type] || "?"}
                  </div>
                  <Input
                    value={field.label}
                    onChange={e => updateLabel(field.id, e.target.value)}
                    className="flex-1 h-8 text-sm"
                    disabled={!field.enabled}
                  />
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Switch
                      checked={!!field.required}
                      onCheckedChange={v => toggleField(field.id, "required", v)}
                      disabled={!field.enabled}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border/50 p-5 sticky top-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Eye className="w-4 h-4" style={{ color: primaryColor }} /> Live Preview</h3>
              <div className="rounded-xl p-4 text-white mb-3" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}>
                <h2 className="font-bold text-sm">{formTitle}</h2>
                <p className="text-xs opacity-80 mt-0.5">{formSubtitle}</p>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {fields.filter(f => f.enabled).map(f => (
                  <div key={f.id} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center bg-muted text-[10px] flex-shrink-0">
                      {TYPE_ICON[f.type] || "?"}
                    </span>
                    <div className="flex-1 h-7 bg-muted/60 rounded-md px-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{f.label}</span>
                      {f.required && <span className="text-red-500 text-xs">*</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-9 rounded-lg mt-3 flex items-center justify-center text-white text-xs font-medium" style={{ background: primaryColor }}>
                {buttonText || "Continue"} →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPEARANCE TAB */}
      {activeTab === "appearance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-5">
            <h3 className="font-semibold flex items-center gap-2"><Palette className="w-4 h-4" style={{ color: primaryColor }} /> Appearance Settings</h3>

            {/* Visibility Toggles */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Show / Hide Elements</p>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
                <div className="flex items-center gap-2.5">
                  {showFormBanner ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">Form Text Banner</p>
                    <p className="text-xs text-muted-foreground">Title, subtitle & feature badges on top</p>
                  </div>
                </div>
                <Switch checked={showFormBanner} onCheckedChange={setShowFormBanner} />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
                <div className="flex items-center gap-2.5">
                  {showStepIndicator ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">Step Indicators</p>
                    <p className="text-xs text-muted-foreground">Step number progress bar (Step 1, 2, 3...)</p>
                  </div>
                </div>
                <Switch checked={showStepIndicator} onCheckedChange={setShowStepIndicator} />
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Form Text</p>
            <div>
              <Label>Form Title</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Book Your Ride" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Shown as the banner heading on the booking form</p>
            </div>
            <div>
              <Label>Subtitle / Tagline</Label>
              <Input value={formSubtitle} onChange={e => setFormSubtitle(e.target.value)} placeholder="Safe, comfortable, and on time" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Short line shown below the title</p>
            </div>
            <div>
              <Label>Continue Button Text</Label>
              <Input value={buttonText} onChange={e => setButtonText(e.target.value)} placeholder="Continue" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Text on the step navigation button</p>
            </div>
            <p className="text-xs text-muted-foreground border border-border/50 rounded-lg p-3 bg-muted/30">
              💡 Brand color is managed in <strong>Settings</strong> → Brand Color. Changes there apply automatically here.
            </p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
            <h3 className="font-semibold">Live Preview</h3>
            <div className="rounded-xl p-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}>
              <h2 className="font-bold text-xl">{formTitle || "Book Your Ride"}</h2>
              <p className="text-sm opacity-80 mt-2">{formSubtitle || "Safe, comfortable, and on time"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 text-center">Button Preview</p>
              <div className="h-11 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-sm" style={{ background: primaryColor }}>
                {buttonText || "Continue"} →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING TYPES TAB */}
      {activeTab === "booking_types" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><CheckSquare className="w-4 h-4" style={{ color: primaryColor }} /> Enable / Disable Types</h3>
              <p className="text-xs text-muted-foreground mt-1">Choose which booking types customers can see on the form</p>
            </div>
            <div className="space-y-3">
              {BOOKING_TYPES.map(bt => {
                const isEnabled = enabledBookingTypes.includes(bt.value);
                return (
                  <div key={bt.value}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isEnabled ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20 opacity-60"}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{bt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{bt.desc}</p>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={v => {
                        const next = v ? [...enabledBookingTypes, bt.value] : enabledBookingTypes.filter(x => x !== bt.value);
                        setEnabledBookingTypes(next);
                        // If default type was disabled, reset default
                        if (!v && defaultBookingType === bt.value) {
                          setDefaultBookingType(next[0] || "distance");
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
            <div>
              <h3 className="font-semibold">Default Booking Type</h3>
              <p className="text-xs text-muted-foreground mt-1">This type is pre-selected when customers open the form</p>
            </div>
            {enabledBookingTypes.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Enable at least one booking type on the left first.
              </div>
            ) : (
              <div className="space-y-2">
                {BOOKING_TYPES.filter(bt => enabledBookingTypes.includes(bt.value)).map(bt => (
                  <button key={bt.value} onClick={() => setDefaultBookingType(bt.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      defaultBookingType === bt.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${defaultBookingType === bt.value ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{bt.label}</p>
                      <p className="text-xs text-muted-foreground">{bt.desc}</p>
                    </div>
                    {defaultBookingType === bt.value && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: primaryColor + "20", color: primaryColor }}>Default</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}