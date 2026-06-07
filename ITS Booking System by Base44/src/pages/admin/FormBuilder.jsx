import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, GripVertical, Eye, Palette } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

export default function FormBuilder() {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [title, setTitle] = useState("Book Your Ride");
  const [subtitle, setSubtitle] = useState("Safe, comfortable, and on time");
  const [primaryColor, setPrimaryColor] = useState("#d4a017");
  const [dragIdx, setDragIdx] = useState(null);

  const { data: settingsList = [] } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.CompanySettings.list(),
  });

  const settings = settingsList[0];

  useEffect(() => {
    if (settings?.form_config) {
      const cfg = settings.form_config;
      if (cfg.fields) setFields(cfg.fields);
      if (cfg.title) setTitle(cfg.title);
      if (cfg.subtitle) setSubtitle(cfg.subtitle);
      if (cfg.primaryColor) setPrimaryColor(cfg.primaryColor);
    }
    if (settings?.primary_color) setPrimaryColor(settings.primary_color);
  }, [settings?.id]);

  const mutation = useMutation({
    mutationFn: (cfg) => settings?.id
      ? base44.entities.CompanySettings.update(settings.id, { form_config: cfg })
      : base44.entities.CompanySettings.create({ company_name: "My Company", form_config: cfg }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Form configuration saved!"); },
  });

  const save = () => mutation.mutate({ fields, title, subtitle, primaryColor });

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

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <PageHeader
        title="Form Builder"
        subtitle="Customize the public booking form fields and layout"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open("/book", "_blank")} className="gap-2">
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button onClick={save} disabled={mutation.isPending} className="gap-2">
              <Save className="w-4 h-4" /> {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Appearance */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> Form Appearance</h3>
            <div><Label>Form Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><Label>Subtitle</Label><Input value={subtitle} onChange={e => setSubtitle(e.target.value)} /></div>
            <div><Label>Brand Color</Label><Input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-12" /></div>
          </div>

          {/* Live Preview card */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-3">Preview Header</h3>
            <div className="rounded-xl p-4 text-white text-center" style={{ background: primaryColor }}>
              <h2 className="font-bold text-lg">{title}</h2>
              <p className="text-sm opacity-80 mt-1">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Right: Fields */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Form Fields</h3>
            <p className="text-sm text-muted-foreground mb-4">Drag to reorder. Toggle fields on/off. Edit labels.</p>

            <div className="space-y-2">
              {fields.map((field, i) => (
                <motion.div
                  key={field.id}
                  layout
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
                  
                  <Input
                    value={field.label}
                    onChange={e => updateLabel(field.id, e.target.value)}
                    className="flex-1 h-8 text-sm"
                    disabled={!field.enabled}
                  />
                  
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0">{field.type}</span>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Switch
                      checked={field.required}
                      onCheckedChange={v => toggleField(field.id, "required", v)}
                      disabled={!field.enabled}
                    />
                    <span className="text-xs text-muted-foreground">Req</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              * Vehicle selection and fare calculation are always included. Payment methods depend on tenant payment settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}